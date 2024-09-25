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
const cors = require("cors"); // Import cors

const app = express();

const botTestingMode = config.botTestingMode;
let port;
let address;
let redirectUri;
let cookie;

if (botTestingMode === true) {
  address = "http://localhost";
  redirectUri = "http://localhost:55055/auth/callback";
  port = "55055";
  cookie = false;
} else {
  address = config.web.address;
  redirectUri = config.web.redirectUri;
  port = config.web.port;
  cookie = config.web.cookie;
}

// Set up session middleware
app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: cookie },
  })
);

// Enable CORS for the frontend
app.use(
  cors({
    origin: `${address}:${port}`, // Allow requests from this frontend URL (adjust the port if needed)
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials like cookies to be sent
  })
);

// Serve static files from the BobzoPage directory
app.use(express.static(path.join(__dirname)));

// Discord OAuth2 login route
app.get("/login", (req, res) => {
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=identify`;
  console.log("Providing login URL:", discordAuthUrl); // Log the URL being provided
  res.json({ loginUrl: discordAuthUrl });
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
        redirect_uri: redirectUri,
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
    return res.redirect("/");
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
app.get("/api/bot-stats", async (req, res) => {
  try {
    const stats = await client.getBotStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching bot stats:", error);
    res.status(500).json({ error: "Failed to fetch bot stats" });
  }
});

// API route to provide command info
app.get("/api/commands", (req, res) => {
  try {
    const commands = Array.from(client.commands.values()).map((cmd) => ({
      name: cmd.prefixData.name,
      description: cmd.description || "No description provided.",
      usage: cmd.usage || "",
      category: cmd.category || "No category provided.",
    }));
    res.json(commands);
  } catch (error) {
    console.error("Error fetching commands:", error);
    res.status(500).json({ error: "Failed to fetch commands" });
  }
});

// Serve index.html
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  console.log("Serving index file:", indexPath); // Log the path being served
  res.sendFile(indexPath);
});

app.listen(port, () => {
  client.log(`Server is running on ${address}:${port}`.green);
});
