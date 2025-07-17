import React, { useEffect, useRef } from "react";
import { MyGame } from "../game/index";

const Game = () => {
  const gameRef = useRef(null);
  useEffect(() => {
    if (gameRef.current) return;
    const config = {
      type: Phaser.AUTO,
      parent: "phaser-example",
      width: window.innerWidth,
      height: window.innerHeight,
      scene: MyGame,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };
    gameRef.current = new Phaser.Game(config);
    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);
  return <div className="phaser-container"></div>;
};

export default Game;
