// Add express
const express = require("express");
const app = express();

// Add http server
const server = require("http").Server(app);

// Add uuidv4
const { v4: uuidv4 } = require("uuid");

// App
app.set("view engine", "ejs");

//Add socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

//Add Peer server
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);
app.use(express.static("public"));
// Response get uuidv4
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
// Rooms
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Setting up Socket.io for a chat
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});
// I use 9999 for example
server.listen(process.env.PORT || 9999);
