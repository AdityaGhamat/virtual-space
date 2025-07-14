import { PLAYER_SPEEED, SHIP_HEIGHT, SHIP_WIDTH } from "../constants/player.js";
import { mapBounds } from "./mapBounds.js";

export const isWithinBoundry = (x, y) => {
  return !mapBounds[y] ? true : !mapBounds[y].includes(x);
};

export const movePlayer = (keys, player) => {
  let playerMoved = false;
  const absPlayerX = player.x + SHIP_WIDTH / 2;
  const absPlayerY = player.y + SHIP_HEIGHT / 2 + 20;
  if (
    keys.includes("ArrowUp") &&
    isWithinBoundry(absPlayerX, absPlayerY - PLAYER_SPEEED)
  ) {
    player.y = player.y - PLAYER_SPEEED;
    playerMoved = true;
  }
  if (
    keys.includes("ArrowDown") &&
    isWithinBoundry(absPlayerX, absPlayerY + PLAYER_SPEEED)
  ) {
    player.y = player.y + PLAYER_SPEEED;
    playerMoved = true;
  }
  if (
    keys.includes("ArrowLeft") &&
    isWithinBoundry(absPlayerX - PLAYER_SPEEED, absPlayerY)
  ) {
    player.x = player.x - PLAYER_SPEEED;
    player.flipX = true;
    playerMoved = true;
  }
  if (
    keys.includes("ArrowRight") &&
    isWithinBoundry(absPlayerX + PLAYER_SPEEED, absPlayerY)
  ) {
    player.x = player.x + PLAYER_SPEEED;
    player.flipX = false;
    playerMoved = true;
  }
  return playerMoved;
};
