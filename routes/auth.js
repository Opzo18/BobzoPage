const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const config = require("../../src/config.js");

const router = express.Router();
const botTestingMode = config.botTestingMode;

const CLIENT_ID = botTestingMode ? config.clientIDTest : config.clientID;
const CLIENT_SECRET = botTestingMode ? config.clientSecretTest : config.clientSecret;
const REDIRECT_URI = botTestingMode ? "http://localhost:55055/api/auth/callback" : config.web.address + "/api/auth/callback";

// 1️⃣ Generowanie linku do logowania przez Discord
router.get("/login", (req, res) => {
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify&prompt=consent`;

  console.log("🔗 Redirecting to Discord OAuth:", discordAuthUrl);
  res.redirect(discordAuthUrl);

  console.log("Client ID:", CLIENT_ID);
  console.log("Client Secret:", CLIENT_SECRET ? "Yes (hidden)" : "No (undefined)");
  console.log("Redirect URI:", REDIRECT_URI);
  console.log("Auth Code:", req.query.code);
});

// 2️⃣ Obsługa zwrotna (po zalogowaniu)
router.get("/callback", async (req, res) => {
  console.log("🔄 Discord callback received:", req.query);

  if (!req.query.code) {
    console.error("❌ No 'code' parameter in callback!");
    return res.redirect("/?error=NoCodeProvided");
  }

  try {
    console.log("🔑 Exchanging code for access token...");

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      querystring.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: REDIRECT_URI,
        scope: "identify",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("✅ Token received:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    console.log("👤 Fetching user data from Discord...");
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("✅ User data received:", userResponse.data);

    req.session.user = userResponse.data;
    console.log("🔐 Session user set:", req.session.user);

    res.redirect("/api/panel");
  } catch (error) {
    console.error("❌ OAuth Error:", error.response?.data || error.message);
    res.redirect("/?error=OAuthFailed");
  }
});

// 3️⃣ Pobieranie aktualnie zalogowanego użytkownika
router.get("/user", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// 4️⃣ Wylogowanie
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
