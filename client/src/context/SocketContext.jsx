import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { serverLink } from "../game/constants/server";

const SocketContext = createContext(null);

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(serverLink);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
