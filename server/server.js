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
      // 요청 origin이 없으면(예: 서버 간 통신) 허용
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        // 요청의 origin이 허용 목록에 있으면 그대로 허용
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

    const decoded = jwt.decode(tokenData.id_token);
    if (!decoded) {
      return res.redirect("/auth/failure");
    }

    const isUserExist = await Models.User.findOne({
      email: decoded.email,
    });

    if (!isUserExist) {
      const newUserInfo = new Models.User({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      });
      await newUserInfo.save();
      console.log("New user saved: ", newUserInfo);
    } else {
      console.log("User already exists: ", isUserExist);
    }

    res.cookie("idToken", tokenData.id_token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: tokenData.expires_in * 1000,
      path: "/",
    });

    return res.redirect(homeUrl);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.redirect("/auth/failure");
  }
});

// Oauth2 Logout
app.get("/auth/oauth/logout", (req, res) => {
  res.clearCookie("idToken", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return res.redirect(baseUrl);
});

// Fetch User Info
app.get("/api/userinfo", (req, res) => {
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

// Save user data
app.post("/api/save-user-data", async (req, res) => {
  const idToken = req.cookies.idToken;
  if (!idToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.decode(idToken);
    const userData = req.body;

    // 새로운 사용자 데이터 생성
    const newUserData = new Models.UserData({
      email: decoded.email,
      data: userData,
    });

    // 데이터베이스에 저장
    await newUserData.save();

    res.json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Failed to save data" });
  }
});

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

    // Python 스크립트의 scenario 디렉토리 경로
    const pythonDir = path.join(__dirname, "python");
    const userDir = path.join(pythonDir, "scenario", decoded.email);
    await fs.ensureDir(userDir);

    // Generate file name
    const fileName = `${decoded.email}-${scenarioData.name}.yaml`;
    const filePath = path.join(userDir, fileName);

    // Save scenario as YAML
    const yamlStr = YAML.stringify(scenarioData);
    await fs.writeFile(filePath, yamlStr, 'utf8');

    console.log('Scenario saved to:', filePath);

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
    // Python 스크립트 경로 확인
    const pythonScriptPath = path.join(__dirname, 'python', 'demo_main.py');
    console.log('Python script path:', pythonScriptPath);
    
    if (!fs.existsSync(pythonScriptPath)) {
      throw new Error(`Python script not found at: ${pythonScriptPath}`);
    }

    // 시나리오 파일 경로 확인
    const scenarioPath = path.join(__dirname, 'python', 'scenario', email, `${email}-${scenarioName}.yaml`);
    console.log('Looking for scenario file at:', scenarioPath);
    
    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`Scenario file not found at: ${scenarioPath}`);
    }

    console.log('Starting Python simulation...');

    // Python 프로세스 실행
    const pythonProcess = spawn('python', [pythonScriptPath, email, scenarioName], {
      cwd: path.join(__dirname, 'python')
    });

    let pythonOutput = '';
    let pythonError = '';

    // Python 스크립트의 출력 수집
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python stdout:', output);
      pythonOutput += output;
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('Python stderr:', error);
      pythonError += error;
    });

    // Python 스크립트 실행 완료 대기
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        console.log('Python process exited with code:', code);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process exited with code ${code}\nError: ${pythonError}`));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });

    if (pythonError) {
      console.error('Python script error:', pythonError);
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

/* Request Python Run Start */
app.get("", (req, res) => {});

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
