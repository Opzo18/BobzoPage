const express = require("express");
const session = require("express-session");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const colors = require("colors");
const config = require("../src/config.js");
const app = express();
const client = require("../index.js"); // Import klienta bota

const botTestingMode = config.botTestingMode;
const address = botTestingMode ? "http://localhost" : config.web.address;
const port = botTestingMode ? "55055" : config.web.port;

// Konfiguracja sesji
app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Zmień na true, jeśli używasz HTTPS
  })
);

app.use(cors({ origin: `${address}:${port}`, methods: ["GET", "POST"], credentials: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Ograniczenie liczby zapytań
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Middleware do przekazywania klienta bota do tras
app.use((req, res, next) => {
  req.client = client;
  next();
});

// Automatyczne ładowanie tras z folderu "routes"
fs.readdirSync(path.join(__dirname, "routes")).forEach((file) => {
  if (file.endsWith(".js")) {
    const route = require(`./routes/${file}`);
    const routeName = file === "index.js" ? "/" : `/api/${file.replace(".js", "")}`;
    console.log(`✅ Załadowano trasę: ${routeName}`);
    app.use(routeName, route);
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server running on ${address}:${port}`.green);
});
