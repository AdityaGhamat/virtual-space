export default function RoomHandler(socket) {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`id-${socket.id} joined room-${roomId}`);
  });
}
