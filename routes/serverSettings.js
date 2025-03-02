const express = require("express");
const router = express.Router();

router.get("/:serverId", async (req, res) => {
  const serverId = req.params.serverId;
  try {
    const settings = await req.client.getServerSettings(serverId);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to load server settings." });
  }
});

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

module.exports = router;
