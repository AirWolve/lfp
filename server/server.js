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
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
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
app.post("/api/export-scenario", async (req, res) => {
  // Check historyId and userEmail
  const historyId = req.body.historyId;
  const userEmail = req.body.userEmail;
  console.log("[export-scenario] Request:", { historyId, userEmail });
  if (!historyId || !userEmail) {
    return res.status(400).json({ error: "historyId and userEmail are both required" });
  }

  try {
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(historyId);
    } catch (e) {
      console.error("[export-scenario] Failed to convert historyId to ObjectId:", e);
      return res.status(400).json({ error: "Invalid historyId format" });
    }

    // Get scenario data from DB (include userEmail in the condition)
    const scenarioDoc = await Models.Scenario.findOne({ history_id: objectId, user: userEmail });
    console.log("[export-scenario] scenarioDoc:", scenarioDoc);
    if (!scenarioDoc) {
      return res.status(404).json({ error: "No scenario found for the given historyId and userEmail" });
    }
    const scenarioData = scenarioDoc.scenarioData;
    if (!scenarioData) {
      return res.status(500).json({ error: "Scenario data is not in DB" });
    }

    // Run exportYAML with Python child process
    const pythonScriptPath = path.join(__dirname, 'python', 'export_yaml.py');
    const pythonProcess = spawn('python', [pythonScriptPath], {
      cwd: path.join(__dirname, 'python')
    });

    let pythonOutput = '';
    let pythonError = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      console.log("[export-scenario] Python stdout:", data.toString());
    });
    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
      console.error("[export-scenario] Python stderr:", data.toString());
    });
    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        let result;
        try {
          result = JSON.parse(pythonOutput);
        } catch (e) {
          return res.status(500).json({ error: "Invalid response from Python", details: pythonOutput });
        }
        const filePath = result.filePath;
        if (!filePath) {
          return res.status(500).json({ error: "No filePath returned from Python" });
        }
        // Generate a download token to prevent unauthorized access
        const downloadToken = uuidv4();
        if (!global.downloadMap) global.downloadMap = {};
        global.downloadMap[downloadToken] = filePath;
        // Return the download URL with the token
        res.json({
          message: "Scenario exported successfully",
          downloadUrl: `/api/download-scenario/${downloadToken}`
        });
      } else {
        res.status(500).json({ error: pythonError || 'Python process failed' });
      }
    });
    // Send userEmail and scenario data to stdin (JSON)
    pythonProcess.stdin.write(JSON.stringify({ userEmail, scenarioData }));
    pythonProcess.stdin.end();
  } catch (error) {
    console.error("Error exporting scenario:", error);
    res.status(500).json({ error: "Failed to export scenario", details: error.message });
  }
});

// Download endpoint implementation
app.get("/api/download-scenario/:token", (req, res) => {
  const token = req.params.token;
  if (!global.downloadMap || !global.downloadMap[token]) {
    return res.status(404).json({ error: "Invalid or expired download token" });
  }
  const filePath = global.downloadMap[token];
  // Delete token after download (one-time use)
  delete global.downloadMap[token];
  res.download(filePath, (err) => {
    // Delete file after download
    const fs = require('fs');
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        // Log only if file deletion fails
        console.error('File deletion failed:', unlinkErr);
      }
    });
    if (err) {
      return res.status(500).json({ error: "Failed to download file" });
    }
  });
});

// Run Python simulation
app.post("/api/run-simulation", async (req, res) => {
  try {
    console.log(req.body);
    let yamlText = req.body.yamlText;
    const userEmail = req.body.userEmail;
    const scenarioName = req.body.scenarioName;
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

    // Python script path
    const pythonScriptPath = path.join(__dirname, 'python', 'demo_main.py');
    if (!fs.existsSync(pythonScriptPath)) {
      return res.status(500).json({ error: `Python script not found at: ${pythonScriptPath}` });
    }

    // Run Python process (send yamlText to stdin)
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

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        const simResult = JSON.parse(pythonOutput);
        res.json({ result: simResult });
        
        // Save the simulation result to DB
        const history = new Models.History({
          user: userEmail,
          scenarioName: scenarioName,
          simResult: simResult,
          createdAt: new Date()
        });
        await history.save();

        // Save the scenario data to DB linked to the history Id
        const scenario = new Models.Scenario({
          name: scenarioName,
          user: userEmail,
          scenarioData: yamlText,
          history_id: history._id,
          createdAt: new Date()
        });
        await scenario.save();
      } else {
        res.status(500).json({ error: pythonError || 'Python process failed' });
      }
    });

    // Send email and YAML text to stdin (example: first line is email, then yaml)
    pythonProcess.stdin.write(userEmail + "\n" + yamlText);
    pythonProcess.stdin.end();
  } catch (error) {
    console.error("Error running simulation:", error);
    res.status(500).json({ error: "Failed to run simulation", details: error.message });
  }
});

// Get all history (filter by userEmail)
app.get("/api/history", async (req, res) => {
  const userEmail = req.query.userEmail;
  if (!userEmail) {
    return res.status(400).json({ error: "userEmail is required" });
  }
  try {
    const historyList = await Models.History.find({ user: userEmail }).sort({ createdAt: -1 });
    res.json({ history: historyList });
  } catch (error) {
    res.status(500).json({ error: "Failed to get history", details: error.message });
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

  // 1D expoloration
app.post('/api/one_dimensional_explore', (req, res) => {
  const { paramName, min, max, step } = req.body;

  const python = spawn('python3', [
      'server/python/OneDimensionalExplorer.py',
      paramName, min, max, step
  ]);

  let data = '';
  python.stdout.on('data', (chunk) => {
      data += chunk.toString();
  });

  python.on('close', (code) => {
      if (code !== 0) {
          return res.status(500).send('Simulation failed.');
      }
      res.json(JSON.parse(data));
  });
});
