import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import SocketProvider from "./context/SocketContext.jsx";
import CameraFeedContextProvider from "./context/CameraFeedProvider.jsx";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <CameraFeedContextProvider>
      <App />
    </CameraFeedContextProvider>
  </SocketProvider>
);
