import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { frontendUrl } from "../constants/constant.js";
const app = Router();

app.post("/create-room", async (req, res) => {
  const room = uuidv4();
  res.json({
    creation: true,
    roomId: room,
    redirectUrl: `/room/${room}`,
  });
});
export default app;
