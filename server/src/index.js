import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update to specific origins in production
  },
});

// Store all players' data (id, position, room)
const players = new Map();

io.on("connection", (socket) => {
  console.log(
    `Player connected: ${socket.id} from ${socket.handshake.address}`
  );

  // Wait for client to send initial position
  socket.on("initPlayer", ({ x, y, room }) => {
    // Add new player to the players Map with initial position
    players.set(socket.id, {
      id: socket.id,
      x,
      y,
      room,
    });

    // Broadcast new player to all other clients
    socket.broadcast.emit("playerConnected", {
      id: socket.id,
      x,
      y,
      room,
    });

    // Send existing players to the newly connected client
    socket.emit(
      "existingPlayers",
      Array.from(players.entries())
        .filter(([id]) => id !== socket.id) // Exclude the new player
        .map(([id, data]) => ({
          id,
          x: data.x,
          y: data.y,
          room: data.room,
        }))
    );
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    players.delete(socket.id);
    // Notify all clients of disconnection
    socket.broadcast.emit("playerDisconnected", { id: socket.id });
  });

  socket.on("move", ({ x, y }) => {
    // Update player position
    const player = players.get(socket.id);
    if (player) {
      player.x = x;
      player.y = y;
      // Broadcast movement to other clients
      socket.broadcast.emit("move", { id: socket.id, x, y });
    }
  });

  socket.on("moveEnd", () => {
    // Broadcast move end to other clients
    socket.broadcast.emit("moveEnd", { id: socket.id });
  });

  socket.on("playerRoomChanged", ({ room, x, y }) => {
    console.log(`Player ${socket.id} entered room ${room}`);
    const player = players.get(socket.id);
    if (player) {
      player.room = room;
      player.x = x;
      player.y = y;
      // Broadcast room change to other clients
      socket.broadcast.emit("playerEnteredRoom", {
        id: socket.id,
        room,
        x,
        y,
      });
    }
  });

  // Error handling for socket
  socket.on("error", (err) => {
    console.error(`Socket error for ${socket.id}:`, err);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`server is listening on http://localhost:${port}`);
});
