const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const servers = await req.client.getUserServers(req.session.user.id);
    console.log("Znalezione serwery:", servers);
    res.json(servers);
  } catch (error) {
    console.error("Error fetching user servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

module.exports = router;
