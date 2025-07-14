import React, { useEffect, useState } from "react";
import Game from "./components/Game";
import CameraFrame from "./components/CameraFrame";

const App = () => {
  const [insideRoom, setInsideRoom] = useState(false);
  return (
    <div className="relative">
      <Game />
      <CameraFrame />
    </div>
  );
};

export default App;
