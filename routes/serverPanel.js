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

// Serwowanie strony panelu serwera
router.get("/:serverId/panel", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/serverPanel.html"));
});

module.exports = router;
