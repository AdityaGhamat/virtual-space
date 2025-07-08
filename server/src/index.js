import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  console.log(`player connected ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`player disconnected ${socket.id}`);
  });
  socket.on("move", ({ x, y }) => {
    socket.broadcast.emit("move", { x, y });
  });
  socket.on("moveEnd", () => {
    socket.broadcast.emit("moveEnd");
  });
  socket.on("playerRoomChanged", ({ room, x, y }) => {
    console.log(`player ${socket.id} entered in ${room}`);
    socket.broadcast.emit("playerEnteredRoom", {
      id: socket.id,
      room: room,
      x,
      y,
    });
  });
});
server.listen(port, "0.0.0.0", () => {
  console.log(`server is listening on http://192.168.0.104:${port}`);
});
