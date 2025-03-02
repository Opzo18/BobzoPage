const express = require("express");
const path = require("path");
const router = express.Router();

// Middleware do sprawdzania logowania
router.use((req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/api/auth/login");
  }
  next();
});

// Pobieranie danych o serwerze
router.get("/:serverId", async (req, res) => {
  const serverId = req.params.serverId;

  try {
    const serverStats = await req.client.getServerStats(serverId);

    if (serverStats.error) {
      return res.status(404).json({ error: serverStats.error });
    }

    res.json({
      id: serverId,
      name: req.client.guilds.cache.get(serverId)?.name || "Unknown Server",
      avatar: req.client.guilds.cache.get(serverId)?.iconURL() || "https://via.placeholder.com/80",
      totalUsers: serverStats.overview.totalUsers,
      totalChannels: serverStats.overview.totalChannels,
      totalTextChannels: serverStats.overview.totalTextChannels,
      totalVoiceChannels: serverStats.overview.totalVoiceChannels,
      totalRoles: serverStats.overview.totalRoles,
      nitroLevel: serverStats.overview.nitroLevel,
      region: serverStats.overview.region,
      features: serverStats.overview.features,
      vanityURL: serverStats.overview.vanityURL,
      bannerURL: serverStats.overview.bannerURL,
    });
  } catch (error) {
    console.error("Error fetching server data:", error);
    res.status(500).json({ error: "Failed to fetch server data" });
  }
});

// Serwowanie strony panelu serwera
router.get("/:serverId/panel", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/serverPanel.html"));
});

module.exports = router;
