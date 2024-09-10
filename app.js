// Import required modules
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const querystring = require("querystring");
const crypto = require("crypto");
const path = require("path");
const colors = require("colors");
const config = require("../src/config");
const client = require("../index.js"); // Import the client instance

const app = express();
const port = config.web.port;

// Set up session middleware
app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // should be true in production when using HTTPS
  })
);

// Serve static files from the BobzoPage directory
app.use(express.static(path.join(__dirname)));

// Discord OAuth2 login route
app.get("/login", (req, res) => {
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${encodeURIComponent(
    config.web.redirectUri
  )}&response_type=code&scope=identify`;
  console.log("Redirecting to:".cyan, discordAuthUrl); // Log redirect URL with color
  res.redirect(discordAuthUrl);
});

// Redirect URI after Discord login
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Authorization code received:", code);

  if (!code) {
    console.log("No code provided");
    return res.send("No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      querystring.stringify({
        client_id: config.clientID,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: config.web.redirectUri,
        scope: "identify",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Token response:", tokenResponse.data);
    const { access_token, token_type } = tokenResponse.data;
    console.log("Access Token:", access_token);
    console.log("Token Type:", token_type);

    if (!access_token) {
      console.log("No access token received");
      return res.send("No access token received");
    }

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log("User info response:", userResponse.data);
    const user = userResponse.data;
    req.session.user = user;

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during Discord authentication:", error);
    res.send("Error during Discord authentication");
  }
});

// Protected route to serve the dashboard page
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    console.log("User not logged in, redirecting to /login".magenta);
    return res.redirect("/login");
  }

  const dashboardPath = path.join(__dirname, "pages", "dashboard.html");
  console.log("Serving file:", dashboardPath); // Log the path being served

  // Send the dashboard HTML page
  res.sendFile(dashboardPath, (err) => {
    if (err) {
      console.error("Error serving dashboard.html:", err);
      res.status(500).send("An error occurred while serving the dashboard.");
    }
  });
});

// API route to provide user info to the dashboard
app.get("/api/userinfo", (req, res) => {
  if (!req.session.user) {
    console.log("Unauthorized access attempt".red);
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("User info sent to client:", req.session.user); // Log the user info being sent
  res.json(req.session.user);
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("User logged out".yellow);
  res.redirect("/");
});

// API route to provide bot stats
app.get("/api/bot-stats", (req, res) => {
  try {
    const stats = client.getBotStats(); // Use the getBotStats method from client
    res.json(stats);
  } catch (error) {
    console.error("Error fetching bot stats:", error);
    res.status(500).json({ error: "Error fetching bot stats" });
  }
});

// Serve index.html
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  console.log("Serving index file:", indexPath); // Log the path being served
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`.green);
});
