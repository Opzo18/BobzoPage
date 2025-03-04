const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const chatDir = path.join(__dirname, "../assets/json");
const chatFile = path.join(chatDir, "chatHistory.json");

// Tworzenie folderu i pliku, jeśli nie istnieją
if (!fs.existsSync(chatDir)) {
  fs.mkdirSync(chatDir, { recursive: true });
}
if (!fs.existsSync(chatFile)) {
  fs.writeFileSync(chatFile, JSON.stringify([]));
}

let messages = JSON.parse(fs.readFileSync(chatFile, "utf8"));

// Strona czatu
router.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/chat.html"));
});

// API do odczytu historii czatu
router.get("/history", (req, res) => {
  res.json(messages);
});

// API do zapisu nowej wiadomości
router.post("/message", (req, res) => {
  const { user, message } = req.body;
  if (!user || !message) {
    return res.status(400).json({ error: "User and message are required." });
  }

  const messageData = { user, message, time: new Date().toISOString() };
  messages.push(messageData);
  fs.writeFileSync(chatFile, JSON.stringify(messages, null, 2));

  // Emituj wiadomość przez Socket.IO
  req.app.get("io").emit("chat message", messageData);
  res.json({ success: true });
});

// Eksport samego routera
module.exports = router;

// Funkcja do obsługi Socket.IO
module.exports.setupChatSocket = function setupChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);
    socket.emit("chat history", messages);

    socket.on("chat message", (msg) => {
      console.log(`Message from ${socket.id}: ${msg}`);
      const messageData = {
        user: socket.id,
        message: msg,
        time: new Date().toISOString(),
      };
      messages.push(messageData);
      fs.writeFileSync(chatFile, JSON.stringify(messages, null, 2));
      io.emit("chat message", messageData);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
