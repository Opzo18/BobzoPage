const express = require("express");
const path = require("path");
const router = express.Router();

// Middleware sprawdzający, czy użytkownik jest zalogowany
router.use((req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/api/auth/login");
  }
  next();
});

// Serwowanie pliku panel.html
router.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/panel.html"));
});

module.exports = router;
