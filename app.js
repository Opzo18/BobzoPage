// Import required modules
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const querystring = require("querystring");
const crypto = require("crypto");
const path = require("path");
const colors = require("colors");
const config = require("../src/config.js");
const client = require("../index.js");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

const botTestingMode = config.botTestingMode;
const address = botTestingMode ? "http://localhost" : config.web.address;
const redirectUri = botTestingMode ? "http://localhost:55055/auth/callback" : config.web.redirectUri;
const port = botTestingMode ? "55055" : config.web.port;
const cookie = botTestingMode ? false : config.web.cookie;

// Middleware setup
app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: cookie },
  })
);

app.use(cors({ origin: `${address}:${port}`, methods: ["GET", "POST"], credentials: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Discord OAuth2 login route
app.get("/login", (req, res) => {
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=identify`;
  console.log("Providing login URL:", discordAuthUrl);
  res.redirect(discordAuthUrl);
});

// Discord BotInvite login route
app.get("/botInvite", (req, res) => {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.clientID}&permissions=8&scope=applications.commands+bot`;

  https: console.log("Providing login URL:", discordAuthUrl);
  res.redirect(discordAuthUrl);
});

// Check login status
app.get("/api/check-login", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

// Redirect URI after Discord login
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
    // console.log("Error during Discord authentication:", error);
    return res.redirect("/");
  }

  if (!code) {
    return res.send("No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      querystring.stringify({
        client_id: config.clientID,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.send("Error retrieving access token");
    }

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    req.session.user = userResponse.data;
    res.redirect("/servers");
  } catch (error) {
    console.error("Error during Discord authentication:", error);
    res.send("Error during Discord authentication");
  }
});

// Protected route to serve the servers page
app.get("/servers", (req, res) => {
  if (!req.session.user) {
    console.log("User not logged in, redirecting to /login".magenta);
    return res.redirect("/login");
  }

  const serversPath = path.join(__dirname, "pages", "servers.html");
  console.log("Serving servers file:", serversPath);
  res.sendFile(serversPath, (err) => {
    if (err) {
      console.error("Error serving servers.html:", err);
      return res.status(500).send("An error occurred while serving the servers.");
    }
  });
});

// Protected route to serve the servers page
app.get("/panel", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    console.log("User not logged in, redirecting to /login".magenta);
    return res.redirect("/login");
  }

  try {
    // Fetch user's servers
    const servers = await client.getUserServers(req.session.user.id);
    const serverID = req.query.id;

    // Check if server ID is provided
    if (!serverID) {
      // console.log("No server ID provided, redirecting to /servers".magenta);
      return res.redirect("/servers");
    }

    // Log user's server IDs
    const serverIds = servers.map((server) => server.id);

    // Check if the serverID exists in the user's servers
    if (!serverIds.includes(serverID)) {
      // console.log("Server not found, redirecting to /servers".magenta);
      return res.redirect("/servers");
    }

    // If server ID is valid, serve the server panel
    const serversPath = path.join(__dirname, "pages", "serverPanel.html");
    console.log("Serving servers file:", serversPath);
    res.sendFile(serversPath, (err) => {
      if (err) {
        console.error("Error serving servers.html:", err);
        return res.status(500).send("An error occurred while serving the servers.");
      }
    });
  } catch (error) {
    console.error("Error fetching user servers:", error);
    return res.status(500).send("Failed to fetch servers.");
  }
});

// API route to get user servers
app.get("/api/user/servers", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const servers = await client.getUserServers(req.session.user.id);
    res.json(servers);
  } catch (error) {
    console.error("Error fetching user servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

// API route for server settings
app
  .route("/api/server/:serverId")
  .get(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

    const { serverId } = req.params;
    try {
      const serverDetails = await client.getServerSettings(serverId, req.session.user.id);
      if (!serverDetails || !serverDetails.name || !serverDetails.id) {
        return res.status(404).json({ error: "Server details not found" });
      }
      res.json(serverDetails);
    } catch (error) {
      console.error(`Error fetching details for server ${serverId}:`, error);
      res.status(500).json({ error: "Failed to fetch server details" });
    }
  })
  .post(async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

    const { serverId } = req.params;
    const newSettings = req.body;

    try {
      await client.updateServerSettings(serverId, newSettings);
      console.log(`Updated settings for server ${serverId}:`, newSettings);
      res.json({ message: "Server settings updated successfully" });
    } catch (error) {
      console.error(`Error updating settings for server ${serverId}:`, error);
      res.status(500).json({ error: "Failed to update server settings" });
    }
  });

// API route to get server avatar
app.get("/api/server/:serverId/avatar", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  const { serverId } = req.params;
  try {
    const serverDetails = await client.getServerStats(serverId);

    if (!serverDetails || serverDetails.error) {
      return res.status(404).json({ error: "Server not found" });
    }

    const avatarUrl = serverDetails.overview.iconURL || "./assets/images/discord-avatar.png";
    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.error(`Error fetching avatar for server ${serverId}:`, error);
    res.status(500).json({ error: "Failed to fetch server avatar" });
  }
});

// API route to get server prefix
app.get("/api/server/:serverId/prefix", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  const { serverId } = req.params;
  try {
    const serverDetails = await client.getServerSettings(serverId, req.session.user.id);

    if (!serverDetails || serverDetails.error) {
      return res.status(404).json({ error: "Server not found" });
    }

    res.json({ prefix: serverDetails?.prefix || config.prefix });
  } catch (error) {
    console.error(`Error fetching prefix for server ${serverId}:`, error);
    res.status(500).json({ error: "Failed to fetch server prefix" });
  }
});

// API route to get server channels
app.get("/api/server/:serverId/channels", async (req, res) => {
  const serverId = req.params.serverId;

  try {
    const textChannels = await client.getServerTextChannels(serverId);
    const voiceChannels = await client.getServerVoiceChannels(serverId);

    res.json({
      textChannels,
      voiceChannels,
    });
  } catch (error) {
    console.error("Error fetching server channels:", error);
    res.status(500).json({ error: "Failed to fetch server channels" });
  }
});

// API route to get server roles
app.get("/api/server/:serverId/roles", async (req, res) => {
  const serverId = req.params.serverId;

  try {
    const roles = await client.getServerRoles(serverId);

    res.json({
      roles,
    });
  } catch (error) {
    console.error("Error fetching server roles:", error);
    res.status(500).json({ error: "Failed to fetch server roles" });
  }
});

// API route for bot stats
app.get("/api/bot-stats", async (req, res) => {
  try {
    const stats = await client.getBotStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching bot stats:", error);
    res.status(500).json({ error: "Failed to fetch bot stats" });
  }
});

// API route for command info
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

// Protected route to serve the commands page
app.get("/commands", (req, res) => {
  if (!req.session.user) {
    console.log("User not logged in, redirecting to /login".magenta);
    return res.redirect("/login");
  }

  const serversPath = path.join(__dirname, "pages", "commands.html");
  console.log("Serving servers file:", serversPath);
  res.sendFile(serversPath, (err) => {
    if (err) {
      console.error("Error serving commands.html:", err);
      return res.status(500).send("An error occurred while serving the commands.");
    }
  });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("User logged out".yellow);
  res.redirect("/");
});

// Serve index.html
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  console.log("Serving index file:", indexPath);
  res.sendFile(indexPath);
});

// Custom error handling for specific status codes
app.get("/error.html", (req, res) => {
  const { status } = req.query;
  const errorPath = path.join(__dirname, "pages", "error.html");
  console.log("Serving error file:", errorPath);
  res.sendFile(errorPath, (err) => {
    if (err) {
      console.error("Error serving error.html:", err);
      return res.status(500).send("An error occurred while serving the error.");
    }
  });
});

// 400 Bad Request
app.use((err, req, res, next) => {
  if (err.status === 400) {
    return res.status(400).redirect(`/error.html?status=400`);
  }
  next(err);
});

// 401 Unauthorized
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).redirect(`/error.html?status=401`);
  }
  next(err);
});

// 403 Forbidden
app.use((err, req, res, next) => {
  if (err.status === 403) {
    return res.status(403).redirect(`/error.html?status=403`);
  }
  next(err);
});

// 404 Not Found
app.use((err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).redirect(`/error.html?status=404`);
  }
  next(err);
});

// 405 Method Not Allowed
app.use((err, req, res, next) => {
  if (err.status === 405) {
    return res.status(405).redirect(`/error.html?status=405`);
  }
  next(err);
});

// 500 Internal Server Error
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err); // Log error
  return res.status(500).redirect(`/error.html?status=500`);
});

// 502 Bad Gateway
app.use((err, req, res, next) => {
  if (err.status === 502) {
    return res.status(502).redirect(`/error.html?status=502`);
  }
  next(err);
});

// 503 Service Unavailable
app.use((err, req, res, next) => {
  if (err.status === 503) {
    return res.status(503).redirect(`/error.html?status=503`);
  }
  next(err);
});

// Start the server
app.listen(port, () => {
  client.log(`Server is running on ${address}:${port}`.green);
});
