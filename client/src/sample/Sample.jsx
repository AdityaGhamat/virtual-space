import React, { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { io } from "socket.io-client";
import { serverLink } from "../game/constants/server";
const Sample = () => {
  let socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.current = io(serverLink);
  }, [socket]);
  console.log(socket);
  return <div>sample</div>;
};

export default Sample;
