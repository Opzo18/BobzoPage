const express = require("express");
const path = require("path");
const router = express.Router();

// Middleware do sprawdzania logowania
router.use(async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/api/auth/login");
  }

  try {
    // Pobranie serwerów, na których użytkownik jest administratorem
    const servers = await req.client.getUserServers(req.session.user.id);
    req.session.adminServers = servers.map((server) => server.id);
    next();
  } catch (error) {
    console.error("Błąd podczas pobierania serwerów użytkownika:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// Serwowanie strony panelu serwera tylko dla adminów
router.get("/:serverId/panel", (req, res) => {
  const { serverId } = req.params;

  if (!req.session.adminServers.includes(serverId)) {
    return res.redirect("/api/panel");
  }

  res.sendFile(path.resolve(__dirname, "../public/serverPanel.html"));
});

module.exports = router;
