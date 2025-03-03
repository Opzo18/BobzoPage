const express = require("express");
const session = require("express-session");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const colors = require("colors");
const config = require("../src/config.js");
const http = require("http");
const { Server } = require("socket.io");
const client = require("../index.js");

const botTestingMode = config.botTestingMode;
const address = botTestingMode ? "http://localhost" : config.web.address;
const port = botTestingMode ? "55055" : config.web.port;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(cors({ origin: `${address}:${port}`, methods: ["GET", "POST"], credentials: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use((req, res, next) => {
  req.client = client;
  next();
});

app.set("io", io);

// **Ładowanie tras API**
fs.readdirSync(path.join(__dirname, "routes")).forEach((file) => {
  if (file.endsWith(".js")) {
    try {
      const route = require(`./routes/${file}`);
      const routeName = file === "index.js" ? "/" : `/api/${file.replace(".js", "")}`;

      if (typeof route === "function" || typeof route === "object") {
        app.use(routeName, route);
        client.log(`✅ Załadowano trasę: ${routeName}`);
      } else {
        console.error(`❌ Błąd: Plik ${file} nie eksportuje poprawnie routera.`);
      }
    } catch (err) {
      console.error(`❌ Błąd podczas ładowania ${file}:`, err);
    }
  }
});

// **Socket.IO dla czatu**
const { setupChatSocket } = require("./routes/chat");
setupChatSocket(io);

server.listen(port, () => {
  client.log(`Server running on ${address}:${port}`.green);
});
