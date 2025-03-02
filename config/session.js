const session = require("express-session");
const crypto = require("crypto");
const config = require("../../src/config.js");

module.exports = session({
  secret: crypto.randomBytes(64).toString("hex"),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.web.cookie },
});
