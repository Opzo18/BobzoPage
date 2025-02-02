const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

// Create server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// File path for chat history
const chatFile = "./BobzoPage/pages/Chat/history.json";

// Load chat history when server starts
let messages = [];
if (fs.existsSync(chatFile)) {
  messages = JSON.parse(fs.readFileSync(chatFile, "utf8"));
}

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Socket.io
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Send chat history to new user
  socket.emit("chat history", messages);

  // Handle incoming messages
  socket.on("chat message", (msg) => {
    console.log(`Message from ${socket.id}: ${msg}`);

    // Save message
    const messageData = { user: socket.id, message: msg, time: new Date().toISOString() };
    messages.push(messageData);

    // Save to file
    fs.writeFileSync(chatFile, JSON.stringify(messages, null, 2));

    // Send message to all clients
    io.emit("chat message", messageData);
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
