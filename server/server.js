const express = require('express');
const { URLSearchParams } = require('url');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();

let homeUrl = "";
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["https://lfp.simpo.pro", "https://dlfp.simpo.pro"];
app.use(
  cors({
    origin: (origin, callback)  => {
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
  }), cookieParser(process.env.LFP_COOKIE_SECRET)
);

app.get('/auth/oauth/google', (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.LFP_GOOGLE_AUTH_CLIENT_ID,
        redirect_uri: process.env.LFP_REDIRECT_URL,
        response_type: 'code',
        scope: 'openid email profile',
    }) ;

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    const referer = req.get('referer');
    homeUrl = `${referer}` == 'https://lfp.simpo.pro/' ? `${referer}Dashboard` : `${referer}/AW-12/#/Dashboard`;
    res.redirect(authUrl);
});

app.get('/auth/oauth/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/auth/failure');
    }

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code,
                client_id: process.env.LFP_GOOGLE_AUTH_CLIENT_ID,
                client_secret: process.env.LFP_GOOGLE_AUTH_CLIENT_PW,
                redirect_uri: process.env.LFP_REDIRECT_URL,
                grant_type: 'authorization_code'
            }).toString()
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error('Token exchange error: ', tokenData);
            return res.redirect('/auth/failure');
        }
        res.cookie('idToken', tokenData.id_token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: tokenData.expires_in * 1000
        });

        return res.redirect(homeUrl);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.redirect('/auth/failure');
    }
});

app.get('/api/userinfo', (req, res) => {
    const idToken = req.cookies.idToken;
    if (!idToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  
    try {
      const decoded = jwt.decode(idToken);
      return res.json(decoded);
    } catch (error) {
      console.error('Token decode error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

app.get('/auth/failure', (req, res) => {
    res.status(401).json({ error: 'Authentication Failed' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));