const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to Bobzo API!");
});

module.exports = router;
