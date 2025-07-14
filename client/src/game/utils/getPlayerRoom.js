import { spaceshipRooms } from "./spaceshipRooms.js";

export function getPlayerRoom(playerX, playerY) {
  for (const room of [...spaceshipRooms].reverse()) {
    if (
      playerX >= room.x &&
      playerX <= room.x + room.width &&
      playerY >= room.y &&
      playerY <= room.y + room.height
    ) {
      return room;
    }
  }
  return null;
}
