import Phaser from "phaser";
import Scenes from "@scenes";
import levelData from "./levelData";
import { Warrior } from "game-objects/Warrior";
import findPath from "game-objects/findPath";
import { Invader, INVADER_FLOOD } from "game-objects/Invader";
import { Temple } from "game-objects/Temple";
import { Poseidon } from "game-objects/Poseidon";
import { Spring } from "game-objects/Spring";
import selectFloodTarget from "game-objects/selectFloodTarget";
export default class Game extends Phaser.Scene {
  private warrior!: Warrior;
  private invaders: Invader[] = [];
  private layer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super(Scenes.GAME);
  }

  create() {
    // Create level data from JSON / image
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

        console.log(targetVec);

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

    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.spawnInvader();
      },
    });

    const temple = new Temple(this, 608, 286);
    this.add.existing(temple);
    temple.startPraying();

    const poseidon = new Poseidon(this, 480, 100);
    this.add.existing(poseidon);
    this.time.addEvent({
      delay: 20000,
      loop: true,
      callback: () => {
        this.spawnSpring(
          Phaser.Math.Between(8, 22),
          Phaser.Math.Between(7, 16)
        );
      },
    });
  }

  spawnInvader() {
    type InvaderSpawnZone = {
      x: number;
      y: number;
      width: number;
      height: number;
      initialSwimDirection: "left" | "right" | "up";
    };

    const invaderSpawnZones: InvaderSpawnZone[] = [
      { x: 0, y: 6, width: 1, height: 11, initialSwimDirection: "right" },
      { x: 7, y: 22, width: 15, height: 2, initialSwimDirection: "up" },
      { x: 28, y: 6, width: 2, height: 11, initialSwimDirection: "left" },
    ];
    const zone = Phaser.Utils.Array.GetRandom(invaderSpawnZones);
    const rand = Phaser.Math.Between;
    const tileX = rand(zone.x, zone.x + zone.width);
    const tileY = rand(zone.y, zone.y + zone.height);
    const { x, y } = this.layer.tileToWorldXY(tileX, tileY);
    //console.log(`Invader spawning at ${tileX} ${tileY}`);
    const invader = new Invader(this, x, y);
    this.invaders.push(invader);
    invader.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.invaders = this.invaders.filter(
        (otherInvader) => otherInvader !== invader
      );
    });
    this.add.existing(invader);
    const { targetX, targetY } = selectFloodTarget(
      { x: tileX, y: tileY },
      zone.initialSwimDirection,
      this.layer
    );
    // console.log(
    //   `Invader targeting: ${this.layer.worldToTileX(
    //     targetX
    //   )} ${this.layer.worldToTileY(targetY)}`
    // );
    invader.moveTo(new Phaser.Math.Vector2(targetX, targetY));
    invader.on(INVADER_FLOOD, () => {
      const invaderPos = this.layer.worldToTileXY(invader.x, invader.y);
      // console.log(
      //   "The invader is flooding at: ",
      //   this.layer.worldToTileX(invader.x),
      //   " ",
      //   this.layer.worldToTileY(invader.y)
      // );
      this.layer.putTileAt(0, invaderPos.x, invaderPos.y);
      // TODO: warriors should check if they are sunk
      // TODO: tell invader it has successfully flooded
    });
  }

  spawnSpring(xTile: number, yTile: number) {
    const { x, y } = this.layer.tileToWorldXY(xTile, yTile);
    const spring = new Spring(this, x, y - 12);
    this.add.existing(spring);
    const floodTile = (xAt: number, yAt: number) => {
      // const tile = this.layer.getTileAt(xAt, yAt);
      this.layer.putTileAt(0, xAt, yAt);
    };

    this.time.addEvent({
      delay: 1200,
      callback: () => {
        floodTile(xTile, yTile);
        floodTile(xTile - 1, yTile);
        floodTile(xTile - 1, yTile - 1);
        floodTile(xTile, yTile - 1);
      },
    });
  }

  update(time: number) {
    this.warrior.update(time, this.invaders);
    this.invaders.forEach((invader) => invader.update());
  }
}
