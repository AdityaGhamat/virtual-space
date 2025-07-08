import { createContext, useContext, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { serverLink } from "../game/constants/server";
const SocketContext = createContext(null);

export default function SocketProvider({ children }) {
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io(serverLink);
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}
export const useSocket = () => useContext(SocketContext);

export const socket = io(serverLink);
