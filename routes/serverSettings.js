const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Pobieranie ustawień serwera
router.get("/:serverId", async (req, res) => {
  const serverId = req.params.serverId;
  try {
    const settings = await req.client.getServerSettings(serverId);
    res.json({
      prefix: settings.prefix,
      language: settings.language,
      welcomeChannel: settings.welcomeChannel,
      welcomeEmbed: settings.welcomeEmbed,
      
      leaveChannel: settings.leaveChannel,
      leaveEmbed: settings.leaveEmbed,

      partnerChannel: settings.partnerChannel,
      partnershipRole: settings.partnershipRole,
      partnerRole: settings.partnerRole,
      partnerPingRole: settings.partnerPingRole,
      lastMathMessage: settings.lastMathMessage,
      countingChannel: settings.countingChannel,
      associationsChannel: settings.associationsChannel,
      lastLetterChannel: settings.lastLetterChannel,
      logsChannel: settings.logsChannel,
      voiceChannelCreator: settings.voiceChannelCreator,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to load server settings." });
  }
});

// Aktualizacja ustawień serwera
router.post("/:serverId", async (req, res) => {
  const serverId = req.params.serverId;
  const updates = req.body;

  try {
    await req.client.updateServerSettings(serverId, updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings." });
  }
});

// Aktualizacja prefiksu serwera
router.post("/:serverId/prefix", async (req, res) => {
  const serverId = req.params.serverId;
  const { prefix } = req.body;

  if (!prefix) {
    return res.status(400).json({ error: "Prefix is required." });
  }

  try {
    await req.client.updatePrefix(serverId, prefix);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating prefix:", error);
    res.status(500).json({ error: "Failed to update prefix." });
  }
});

// Pobieranie danych językowych serwera
router.get("/:serverId/language", async (req, res) => {
  const serverId = req.params.serverId;

  try {
    const languageData = await req.client.getLanguageData(serverId);
    res.json(languageData);
  } catch (error) {
    console.error("Error fetching language data:", error);
    res.status(500).json({ error: "Failed to load language data." });
  }
});

module.exports = router;
