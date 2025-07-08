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
const player = {};
const otherPlayer = {};
let socket;
let pressedKeys = [];
export class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    socket = io(serverLink);
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

    otherPlayer.sprite = this.add.sprite(
      PLAYER_START_X,
      PLAYER_START_Y,
      "player"
    );
    otherPlayer.sprite.displayHeight = PLAYER_HEIGHT;
    otherPlayer.sprite.displayWidth = PLAYER_WIDTH;

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
    this.input.keyboard.on(
      "keyup",
      (e) => (pressedKeys = pressedKeys.filter((key) => key !== e.code))
    );
    socket.on("move", ({ x, y }) => {
      if (otherPlayer.sprite.x > x) {
        otherPlayer.sprite.flipX = true;
      } else if (otherPlayer.sprite.x < x) {
        otherPlayer.sprite.flipX = false;
      }
      otherPlayer.sprite.x = x;
      otherPlayer.sprite.y = y;
      otherPlayer.moving = true;
    });
    socket.on("moveEnd", () => {
      otherPlayer.moving = false;
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

    if (otherPlayer.moving && !otherPlayer.sprite.anims.isPlaying) {
      otherPlayer.sprite.play("running");
    } else if (!otherPlayer.moving && otherPlayer.sprite.anims.isPlaying) {
      otherPlayer.sprite.stop("running");
    }
  }
}
