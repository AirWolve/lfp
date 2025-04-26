const express = require("express");
const { URLSearchParams } = require("url");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const YAML = require('yaml');
const fs = require('fs-extra');
const path = require('path');
const { initDatabase, Models } = require("./mongo");
const { spawn } = require('child_process');
require("dotenv").config();

let homeUrl = "";
let baseUrl = "";
const app = express();

// Add body parser middleware
app.use(express.json());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [`${process.env.LFP_HOME_DIR}`, `${process.env.LFP_DEV_HOME_DIR}`];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  }),
  cookieParser(process.env.LFP_COOKIE_SECRET)
);

/* # Oauth2 Google Login Start */

// Oauth2 Authentication
app.get("/auth/oauth/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.LFP_GOOGLE_AUTH_CLIENT_ID,
    redirect_uri: process.env.LFP_GOOGLE_AUTH_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  baseUrl = req.get("referer");
  homeUrl =
    `${baseUrl}` == `${process.env.LFP_HOME_DIR}/`
      ? `${baseUrl}Dashboard`
      : `${baseUrl}/AW-test/#/Dashboard`;
  res.redirect(authUrl);
});

// Oauth2 Callback url
app.get("/auth/oauth/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect("/auth/failure");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.LFP_GOOGLE_AUTH_CLIENT_ID,
        client_secret: process.env.LFP_GOOGLE_AUTH_CLIENT_PW,
        redirect_uri: process.env.LFP_GOOGLE_AUTH_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      console.error("Token exchange error: ", tokenData);
      return res.redirect("/auth/failure");
    }

    // To get user information based on ID Token, we need to decode it with jwt decode
    const decoded = jwt.decode(tokenData.id_token);
    // if failed, redirect to failure
    if (!decoded) {
      return res.redirect("/auth/failure");
    }

    // Find whether user already exists or not.
    const isUserExist = await Models.User.findOne({
      email: decoded.email,
    });

    // If user doesn't exist, then create data and insert it to Database
    if (!isUserExist) {
      const newUserInfo = new Models.User({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      });
      await newUserInfo.save();
      console.log("New user saved: ", newUserInfo);
    }

    // Comment log for debug
    // else {
    //   console.log("User already exists: ", isUserExist);
    // }

    // Set cookie to notify that the web page know user login or not.
    res.cookie("idToken", tokenData.id_token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: tokenData.expires_in * 1000,
      path: "/",
    });

    // redirect to home Url after success login
    return res.redirect(homeUrl);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.redirect("/auth/failure");
  }
});

// Oauth2 Logout
app.get("/auth/oauth/logout", (req, res) => {
  // Revoke cookie to log out from the web.
  res.clearCookie("idToken", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return res.redirect(baseUrl);
});

// Fetch User Info
app.get("/api/userinfo", (req, res) => {
  // Get idToken from cookie.
  const idToken = req.cookies.idToken;
  if (!idToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.decode(idToken);
    return res.json(decoded);
  } catch (error) {
    console.error("Token decode error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Return status 401 if failed authentication
app.get("/auth/failure", (req, res) => {
  res.status(401).json({ error: "Authentication Failed" });
});

/* # Oauth2 Google Login End */

// Save scenario data as YAML
app.post("/api/save-scenario", async (req, res) => {
  const idToken = req.cookies.idToken;
  if (!idToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.decode(idToken);
    const scenarioData = req.body;

    if (!scenarioData.name) {
      return res.status(400).json({ error: "Scenario name is required" });
    }

    // Set the directory path of python
    const pythonDir = path.join(__dirname, "python");
    const userDir = path.join(pythonDir, "scenario", decoded.email);
    await fs.ensureDir(userDir);

    // Generate file name
    const fileName = `${decoded.email}-${scenarioData.name}.yaml`;
    const filePath = path.join(userDir, fileName);

    // Save scenario as YAML
    const yamlStr = YAML.stringify(scenarioData);
    await fs.writeFile(filePath, yamlStr, 'utf8');

    // Comment Debug log line
    // console.log('Scenario saved to:', filePath);

    const isSameNameExist = await Models.User.findOne({
      scenarioPath: filePath,
    });

    // If scenario doesn't exist, then create data and insert it to Database
    if (!isSameNameExist) {
      const scenarioInfo = new Models.Scenario({
        email: decoded.email,
        scenarioPath: filePath,
        createdAt: new Date()
      });
  
      await scenarioInfo.save();
      console.log('Scenario info saved to database');
    }


    res.json({
      message: "Scenario saved successfully",
      filePath: filePath,
      email: decoded.email,
      scenarioName: scenarioData.name
    });

  } catch (error) {
    console.error("Error saving scenario:", error);
    res.status(500).json({ error: "Failed to save scenario", details: error.message });
  }
});

// Run Python simulation
app.get("/api/run-simulation", async (req, res) => {
  const { email, scenarioName } = req.query;

  if (!email || !scenarioName) {
    return res.status(400).json({ error: "Email and scenario name are required" });
  }

  try {
    // Check the path of Python script to call
    const pythonScriptPath = path.join(__dirname, 'python', 'demo_main.py');
    // Comment Debug log line
    // console.log('Python script path:', pythonScriptPath);

    if (!fs.existsSync(pythonScriptPath)) {
      throw new Error(`Python script not found at: ${pythonScriptPath}`);
    }

    // Check the path of Scenario File
    const scenarioPath = path.join(__dirname, 'python', 'scenario', email, `${email}-${scenarioName}.yaml`);
    // Comment Debug log line
    // console.log('Looking for scenario file at:', scenarioPath);

    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`Scenario file not found at: ${scenarioPath}`);
    }

    console.log('Starting Python simulation...');

    // Execute Python Process with child process
    const pythonProcess = spawn('python', [pythonScriptPath, email, scenarioName], {
      cwd: path.join(__dirname, 'python')
    });

    let pythonOutput = '';
    let pythonError = '';

    // Collect the output of python execution
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      // Comment Debug log line
      // console.log('Python stdout:', output);
      pythonOutput += output;
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      // Comment Debug log line
      // console.error('Python stderr:', error);
      pythonError += error;
    });

    // Wait until python script finished to execute
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        // Comment Debug log line
        // console.log('Python process exited with code:', code);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process exited with code ${code}\nError: ${pythonError}`));
        }
      });

      pythonProcess.on('error', (err) => {
        // Comment Debug log line
        // console.error('Failed to start Python process:', err);
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });

    // If python occur error, it will print the log on api server
    if (pythonError) {
      // Comment Debug log line
      // console.error('Python script error:', pythonError);
      return res.status(500).json({
        error: 'Python script execution failed',
        details: pythonError,
        output: pythonOutput
      });
    }

    console.log('Simulation completed successfully');
    res.json({
      message: "Simulation completed successfully",
      output: pythonOutput
    });
  } catch (error) {
    console.error("Error running simulation:", error);
    res.status(500).json({
      error: "Failed to run simulation",
      details: error.message
    });
  }
});

// Open API server with port 5000 and trying to connect database
initDatabase()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize database: ", err);
    process.exit(1);
  });
