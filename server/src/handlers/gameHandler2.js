export async function GameHandler2(socket, players) {
  // Join the room specified in the connection query
  const roomId = socket.handshake.query.roomId;
  if (roomId) {
    socket.join(roomId);
    console.log(`Player ${socket.id} joined room ${roomId}`);
  } else {
    console.error(`No roomId provided for socket ${socket.id}`);
    socket.disconnect();
    return;
  }

  socket.on("initPlayer", ({ x, y, room, roomId: clientRoomId }) => {
    if (clientRoomId !== roomId) {
      console.error(`Room ID mismatch for socket ${socket.id}`);
      return;
    }

    // Add new player to the players Map with initial position
    players.set(socket.id, {
      id: socket.id,
      x,
      y,
      room,
      roomId, // Store roomId for reference
    });

    // Broadcast new player to all other clients in the room
    socket.to(roomId).emit("playerConnected", {
      id: socket.id,
      x,
      y,
      room,
    });

    // Send existing players in the same room to the newly connected client
    socket.emit(
      "existingPlayers",
      Array.from(players.entries())
        .filter(([id, data]) => id !== socket.id && data.roomId === roomId)
        .map(([id, data]) => ({
          id,
          x: data.x,
          y: data.y,
          room: data.room,
        }))
    );
  });

  socket.on("disconnect", () => {
    console.log(`Player ${socket.id} disconnected from room ${roomId}`);
    players.delete(socket.id);
    // Notify all clients in the room of disconnection
    socket.to(roomId).emit("playerDisconnected", { id: socket.id });
  });

  socket.on("move", ({ x, y, roomId: clientRoomId }) => {
    if (clientRoomId !== roomId) {
      console.error(`Room ID mismatch for move event from socket ${socket.id}`);
      return;
    }

    // Update player position
    const player = players.get(socket.id);
    if (player) {
      player.x = x;
      player.y = y;
      // Broadcast movement to other clients in the room
      socket.to(roomId).emit("move", { id: socket.id, x, y });
    }
  });

  socket.on("moveEnd", ({ roomId: clientRoomId }) => {
    if (clientRoomId !== roomId) {
      console.error(
        `Room ID mismatch for moveEnd event from socket ${socket.id}`
      );
      return;
    }
    // Broadcast move end to other clients in the room
    socket.to(roomId).emit("moveEnd", { id: socket.id });
  });

  socket.on("playerRoomChanged", ({ room, x, y, roomId: clientRoomId }) => {
    if (clientRoomId !== roomId) {
      console.error(
        `Room ID mismatch for playerRoomChanged event from socket ${socket.id}`
      );
      return;
    }
    console.log(`Player ${socket.id} entered room ${room} in roomId ${roomId}`);
    const player = players.get(socket.id);
    if (player) {
      player.room = room;
      player.x = x;
      player.y = y;
      // Broadcast room change to other clients in the room
      socket.to(roomId).emit("playerEnteredRoom", {
        id: socket.id,
        room,
        x,
        y,
      });
    }
  });

  // Error handling for socket
  socket.on("error", (err) => {
    console.error(`Socket error for ${socket.id} in room ${roomId}:`, err);
  });
}
