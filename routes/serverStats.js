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
      avatar: req.client.guilds.cache.get(serverId)?.iconURL(),
      ownerID: serverStats.overview.ownerID,
      ownerName: serverStats.overview.ownerName,
      totalUsers: serverStats.overview.totalUsers,
      totalChannels: serverStats.overview.totalChannels,
      totalTextChannels: serverStats.overview.totalTextChannels,
      totalVoiceChannels: serverStats.overview.totalVoiceChannels,
      totalRoles: serverStats.overview.totalRoles,
      totalEmojis: serverStats.overview.totalEmojis,
      totalBans: serverStats.overview.totalBans,
      totalStickers: serverStats.overview.totalStickers,
      nitroLevel: serverStats.overview.nitroLevel,
      region: serverStats.overview.region,
      features: serverStats.overview.features,
      vanityURL: serverStats.overview.vanityURL,
      bannerURL: serverStats.overview.bannerURL,
      splashURL: serverStats.overview.splashURL,
      discoverySplashURL: serverStats.overview.discoverySplashURL,
      systemChannelID: serverStats.overview.systemChannelID,
      rulesChannelID: serverStats.overview.rulesChannelID,
      publicUpdatesChannelID: serverStats.overview.publicUpdatesChannelID,
      preferredLocale: serverStats.overview.preferredLocale,
      explicitContentFilter: serverStats.overview.explicitContentFilter,
      mfaLevel: serverStats.overview.mfaLevel,
      verificationLevel: serverStats.overview.verificationLevel,
    });
  } catch (error) {
    console.error("Error fetching server data:", error);
    res.status(500).json({ error: "Failed to fetch server data" });
  }
});

// Pobierz kanały tekstowe serwera
router.get("/serverTextChannels/:serverId", async (req, res) => {
  const { serverId } = req.params;
  try {
    const guild = await req.client.guilds.fetch(serverId);
    if (!guild) return res.status(404).json({ error: "Server not found" });

    const textChannels = guild.channels.cache
      .filter((channel) => channel.type === 0) // Kanały tekstowe
      .map((channel) => ({ id: channel.id, name: channel.name }));

    res.json(textChannels);
  } catch (error) {
    console.error(`Error fetching text channels for server ${serverId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Pobierz kanały głosowe serwera
router.get("/serverVoiceChannels/:serverId", async (req, res) => {
  const { serverId } = req.params;
  try {
    const guild = await req.client.guilds.fetch(serverId);
    if (!guild) return res.status(404).json({ error: "Server not found" });

    const voiceChannels = guild.channels.cache
      .filter((channel) => channel.type === 2) // Kanały głosowe
      .map((channel) => ({ id: channel.id, name: channel.name }));

    res.json(voiceChannels);
  } catch (error) {
    console.error(`Error fetching voice channels for server ${serverId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Pobierz role serwera
router.get("/serverRoles/:serverId", async (req, res) => {
  const { serverId } = req.params;
  try {
    const roles = await req.client.getServerRoles(serverId);
    res.json(roles);
  } catch (error) {
    console.error(`Error fetching roles for server ${serverId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
