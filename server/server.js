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
      : `${baseUrl}/hotfix-AW75-1/#/Dashboard`;
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

app.post("/api/sendJson", async (req, res) => {
  try {
    const scenarioData = req.body;

    if (!scenarioData.name) {
      return res.status(400).json({ error: "Scenario name is required" });
    }

    // Save scenario as YAML
    const yamlStr = YAML.stringify(scenarioData);

    res.json({
      message: "Scenario saved successfully",
      toYaml: yamlStr,
      fromJson: scenarioData,
      scenarioName: scenarioData.name
    });

  } catch (error) {
    console.error("Error sending scenario:", error);
    res.status(500).json({ error: "Failed to send scenario", details: error.message });
  }
});

// Run Python simulation
app.post("/api/run-simulation", async (req, res) => {
  try {
    console.log(req.body);
    let yamlText = req.body.yamlText;
    const userEmail = req.body.userEmail;
    // If yamlText is an object, convert to YAML string
    if (typeof yamlText !== 'string') {
      yamlText = YAML.stringify(yamlText);
    } else {
      // If string, check if it's JSON and convert to YAML
      try {
        const parsed = JSON.parse(yamlText);
        yamlText = YAML.stringify(parsed);
      } catch (e) {
        // Not JSON, assume already YAML
      }
    }
    console.log('userEmail:', userEmail);
    console.log(yamlText);
    if (!yamlText) {
      return res.status(400).json({ error: "YAML text is required" });
    }
    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    // Python 스크립트 경로
    const pythonScriptPath = path.join(__dirname, 'python', 'demo_main.py');
    if (!fs.existsSync(pythonScriptPath)) {
      return res.status(500).json({ error: `Python script not found at: ${pythonScriptPath}` });
    }

    // Python 프로세스 실행 (stdin으로 yamlText 전달)
    const pythonProcess = spawn('python', [pythonScriptPath], {
      cwd: path.join(__dirname, 'python')
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ result: pythonOutput });
      } else {
        res.status(500).json({ error: pythonError || 'Python process failed' });
      }
    });

    // stdin으로 email과 YAML 텍스트 전달 (예: 첫 줄에 email, 그 다음 줄부터 yaml)
    pythonProcess.stdin.write(userEmail + "\n" + yamlText);
    pythonProcess.stdin.end();
  } catch (error) {
    console.error("Error running simulation:", error);
    res.status(500).json({ error: "Failed to run simulation", details: error.message });
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
