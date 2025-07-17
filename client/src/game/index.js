import Phaser from "phaser";
import { movePlayer } from "./utils/movement.js";
import shipImage from "./assets/ship.png";
import playerSprite from "./assets/player.png";
import { io } from "socket.io-client";
import {
  PLAYER_SPRITE_WIDTH,
  PLAYER_SPRITE_HEIGHT,
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from "./constants/player.js";
import { serverLink } from "./constants/server.js";
import { animateMovement } from "./utils/animation.js";
import { getPlayerRoom } from "./utils/getPlayerRoom.js";

const player = { sprite: null, movedLastFrame: false }; // Local player
const otherPlayers = new Map(); // Store all other players
let socket;
let pressedKeys = [];
const roomId = window.location.pathname.split("/").pop(); // "/room/abc123" → "abc123"
console.log(roomId);

export class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    socket = io(serverLink, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { roomId },
    });
    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });
    socket.on("reconnect_failed", () => {
      console.error("Socket.IO reconnection failed");
    });
    this.load.image("ship", shipImage);
    this.load.spritesheet("player", playerSprite, {
      frameWidth: PLAYER_SPRITE_WIDTH,
      frameHeight: PLAYER_SPRITE_HEIGHT,
    });
    this.load.spritesheet("otherPlayer", playerSprite, {
      frameWidth: PLAYER_SPRITE_WIDTH,
      frameHeight: PLAYER_SPRITE_HEIGHT,
    });
  }

  create() {
    const ship = this.add.image(0, 0, "ship");
    player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, "player");
    player.sprite.displayHeight = PLAYER_HEIGHT;
    player.sprite.displayWidth = PLAYER_WIDTH;

    // Send initial position to server
    const initialRoom = getPlayerRoom(PLAYER_START_X, PLAYER_START_Y);
    socket.emit("initPlayer", {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      room: initialRoom ? initialRoom.name : null,
      roomId: roomId,
    });

    this.anims.create({
      key: "running",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 24,
      repeat: -1,
    });

    this.input.keyboard.on("keydown", (e) => {
      if (!pressedKeys.includes(e.code)) {
        pressedKeys.push(e.code);
      }
    });
    this.input.keyboard.on("keyup", (e) => {
      pressedKeys = pressedKeys.filter((key) => key !== e.code);
    });

    // Handle new player connections
    socket.on("playerConnected", ({ id, x, y, room }) => {
      const sprite = this.add.sprite(x, y, "otherPlayer");
      sprite.displayHeight = PLAYER_HEIGHT;
      sprite.displayWidth = PLAYER_WIDTH;
      otherPlayers.set(id, { sprite, moving: false, room });
      console.log(`Player ${id} connected at (${x}, ${y})`);
    });

    // Handle existing players on connection
    socket.on("existingPlayers", (players) => {
      players.forEach(({ id, x, y, room }) => {
        if (id !== socket.id) {
          const sprite = this.add.sprite(x, y, "otherPlayer");
          sprite.displayHeight = PLAYER_HEIGHT;
          sprite.displayWidth = PLAYER_WIDTH;
          otherPlayers.set(id, { sprite, moving: false, room });
          console.log(`Added existing player ${id} at (${x}, ${y})`);
        }
      });
    });

    // Handle player disconnection
    socket.on("playerDisconnected", ({ id }) => {
      const otherPlayer = otherPlayers.get(id);
      if (otherPlayer) {
        otherPlayer.sprite.destroy();
        otherPlayers.delete(id);
        console.log(`Player ${id} disconnected`);
      }
    });

    // Handle movement of other players
    socket.on("move", ({ id, x, y }) => {
      const otherPlayer = otherPlayers.get(id);
      if (otherPlayer) {
        if (otherPlayer.sprite.x > x) {
          otherPlayer.sprite.flipX = true;
        } else if (otherPlayer.sprite.x < x) {
          otherPlayer.sprite.flipX = false;
        }
        otherPlayer.sprite.x = x;
        otherPlayer.sprite.y = y;
        otherPlayer.moving = true;
      }
    });

    // Handle move end for other players
    socket.on("moveEnd", ({ id }) => {
      const otherPlayer = otherPlayers.get(id);
      if (otherPlayer) {
        otherPlayer.moving = false;
      }
    });

    // Handle room changes for other players
    socket.on("playerEnteredRoom", ({ id, room, x, y }) => {
      const otherPlayer = otherPlayers.get(id);
      if (otherPlayer) {
        otherPlayer.room = room;
        otherPlayer.sprite.x = x;
        otherPlayer.sprite.y = y;
        console.log(`Player ${id} entered room ${room}`);
      }
    });
  }

  update() {
    this.cameras.main.centerOn(player.sprite.x, player.sprite.y);
    const playerMoved = movePlayer(pressedKeys, player.sprite);
    if (playerMoved) {
      socket.emit("move", { x: player.sprite.x, y: player.sprite.y });
      player.movedLastFrame = true;
    } else {
      if (player.movedLastFrame) {
        socket.emit("moveEnd");
      }
      player.movedLastFrame = false;
    }
    animateMovement(pressedKeys, player.sprite);
    const room = getPlayerRoom(player.sprite.x, player.sprite.y);
    if (room && room.name !== player.sprite.currentRoom) {
      player.sprite.currentRoom = room.name;
      console.log(`Player entered room: ${room.name}`);
      socket.emit("playerRoomChanged", {
        room: room.name,
        x: player.sprite.x,
        y: player.sprite.y,
      });
    }

    // Update animations for other players
    otherPlayers.forEach((otherPlayer, id) => {
      if (otherPlayer.moving && !otherPlayer.sprite.anims.isPlaying) {
        otherPlayer.sprite.play("running");
      } else if (!otherPlayer.moving && otherPlayer.sprite.anims.isPlaying) {
        otherPlayer.sprite.stop("running");
      }
    });
  }
}
