import express from "express";
import http from "http";
import { Server } from "socket.io";
import { GameHandler } from "./handlers/gameHandlers.js";
import { createWorkers } from "./sfu/utils/createWorkers.js";
const app = express();
const port = 8080;
const server = http.createServer(app);
import roomRouter from "./routers/roomRouters.js";
import RoomHandler from "./handlers/roomHandler.js";
import { GameHandler2 } from "./handlers/gameHandler2.js";
import cors from "cors";

app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "*", // Update to specific origins in production
  },
});

// store all players' data (id, position, room)
const players = new Map();

let workers = null;

// master rooms array that contains all our Room object
const rooms = [];

const initMediaSoup = async () => {
  workers = await createWorkers();
};

initMediaSoup(); //build our mediasoup server/sfu

io.on("connection", (socket) => {
  console.log(
    `Player connected: ${socket.id} from ${socket.handshake.address}`
  );
  GameHandler(socket, players);
});
app.use("/api/room", roomRouter);

server.listen(port, "0.0.0.0", () => {
  console.log(`server is listening on http://localhost:${port}`);
});
