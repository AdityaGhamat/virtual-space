import React, { useEffect } from "react";
import Game from "../components/Game";
import CameraFrame from "../components/CameraFrame";
import { useSocket } from "../context/SocketContext";
import { useParams } from "react-router-dom";
const HeroPage = () => {
  const socket = useSocket();
  const { roomId } = useParams();
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("join-room", roomId);
    }
  }, [socket, roomId]);
  return (
    <div className="relative">
      <Game />
      <CameraFrame />
    </div>
  );
};

export default HeroPage;
