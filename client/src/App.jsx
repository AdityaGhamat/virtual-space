import React, { useEffect, useState } from "react";
import Game from "./components/Game";
import CameraFrame from "./components/CameraFrame";
const App = () => {
  return (
    <div className="relative">
      <Game />
      <CameraFrame />
    </div>
  );
};

export default App;
