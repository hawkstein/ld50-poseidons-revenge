import Phaser from "phaser";
import Scenes from "@scenes";
import levelData from "./levelData";
import { Warrior } from "game-objects/Warrior";
import findPath from "game-objects/findPath";
import { Invader, INVADER_FLOOD } from "game-objects/Invader";
import { Temple } from "game-objects/Temple";
export default class Game extends Phaser.Scene {
  private warrior!: Warrior;
  private invaders: Invader[] = [];
  private layer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super(Scenes.GAME);
  }

  create() {
    // Create level data from JSON
    // Create TileMap from level data
    const TILE_SIDE = 32;
    const map = this.make.tilemap({
      data: levelData,
      tileWidth: TILE_SIDE,
      tileHeight: TILE_SIDE,
      width: 32,
      height: 24,
    });
    const tiles = map.addTilesetImage(
      "tileset",
      undefined,
      TILE_SIDE,
      TILE_SIDE,
      1,
      2
    );
    this.layer = map.createLayer(0, tiles);

    this.input.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer: Phaser.Input.Pointer) => {
        const { worldX, worldY } = pointer;

        //const startVec = layer.worldToTileXY(this.faune.x, this.faune.y)
        const targetVec = this.layer.worldToTileXY(worldX, worldY);

        //console.log(targetVec);

        const warriorPos = this.layer.worldToTileXY(
          this.warrior.x,
          this.warrior.y
        );

        this.warrior.moveAlong(findPath(warriorPos, targetVec, this.layer));
      }
    );
    this.warrior = new Warrior(this, 304, 304);
    this.warrior.on(Phaser.Input.Events.POINTER_UP, () => {
      this.warrior.select();
    });
    this.add.existing(this.warrior);
    this.spawnInvader();

    const temple = new Temple(this, 608, 286);
    this.add.existing(temple);
    temple.startPraying();
  }

  spawnInvader() {
    const invader = new Invader(this, 16, 270);
    this.invaders = [invader];
    this.add.existing(invader);
    invader.moveTo(new Phaser.Math.Vector2(200, 270));
    invader.on(INVADER_FLOOD, () => {
      const invaderPos = this.layer.worldToTileXY(invader.x, invader.y);
      console.log(
        "The invader is flooding at: ",
        invaderPos.x,
        " ",
        invaderPos.y
      );
      this.layer.putTileAt(0, invaderPos.x + 1, invaderPos.y);
      // TODO: warriors should check if they are sunk
      // TODO: tell invader it has successfully flooded
    });
  }

  update() {
    this.warrior.update();
    this.invaders.forEach((invader) => invader.update());
  }
}
