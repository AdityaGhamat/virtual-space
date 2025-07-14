import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import SocketProvider from "./context/SocketContext.jsx";
import CameraFeedContextProvider from "./context/CameraFeedProvider.jsx";
import withProviders from "./utils/AppWithProvider.jsx";
import { BrowserRouter } from "react-router-dom";
const AppWithProviders = withProviders(
  BrowserRouter,
  SocketProvider,
  CameraFeedContextProvider
);
createRoot(document.getElementById("root")).render(
  <AppWithProviders>
    <App />
  </AppWithProviders>
);
