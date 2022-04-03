import Phaser from "phaser";
import Scenes from "@scenes";
import levelData from "./levelData";
import { Warrior } from "game-objects/Warrior";
import findPath from "game-objects/findPath";
import { Invader, INVADER_FLOOD } from "game-objects/Invader";
import { Temple } from "game-objects/Temple";
import { Poseidon } from "game-objects/Poseidon";
import { Spring } from "game-objects/Spring";
import selectFloodTarget, {
  selectNearbyTileToFlood,
} from "game-objects/selectFloodTarget";
import { createMachine, interpret } from "xstate";
import { getOption } from "data";

type GameContext = {
  emitter: Phaser.Events.EventEmitter;
};

const buildMachine = (emitter: Phaser.Events.EventEmitter) =>
  createMachine<GameContext>(
    {
      id: "poseidons-revenge",
      context: {
        emitter,
      },
      type: "parallel",
      states: {
        running: {
          initial: "unpaused",
          states: {
            paused: {
              on: {
                TOGGLE: "unpaused",
              },
            },
            unpaused: {
              on: {
                TOGGLE: "paused",
              },
            },
          },
        },
        gameplay: {
          initial: "intro",
          states: {
            intro: {
              after: {
                1500: "playing",
              },
            },
            playing: {
              entry: ["startPlaying"],
              on: {
                FAIL: "defeat",
                WIN: "victory",
              },
            },
            defeat: {
              type: "final",
            },
            victory: {
              type: "final",
            },
          },
        },
      },
    },
    {
      actions: {
        startPlaying: (context) => {
          context.emitter.emit("START_PLAYING");
        },
      },
    }
  );
export default class Game extends Phaser.Scene {
  private service!: any;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private selectedWarrior: Warrior | null = null;
  private selectionRect!: Phaser.GameObjects.Sprite;
  private warriors: Warrior[] = [];
  private invaders: Invader[] = [];
  private temple!: Temple;
  private lossTime: number | null = null;

  constructor() {
    super(Scenes.GAME);
  }

  init() {
    const gameMachine = buildMachine(this.events);
    this.service = interpret(gameMachine);
    this.service.start();
    this.events.once("START_PLAYING", () => {
      this.startPlaying();
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.service.stop();
    });
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

    this.selectionRect = this.add.sprite(0, 0, "selection");
    this.selectionRect.visible = false;
    this.selectionRect.setOrigin(0);

    // Get warrior positions from level data
    const warriorPositions = [
      [10, 8],
      [14, 15],
      [20, 12],
    ];

    warriorPositions.forEach(([x, y]) => {
      const warrior = new Warrior(
        this,
        this.layer.tileToWorldY(x),
        this.layer.tileToWorldY(y)
      );

      this.add.existing(warrior);
      this.warriors.push(warrior);
    });

    // TODO: get temple position from level data
    this.temple = new Temple(this, 608, 286);
    this.add.existing(this.temple);
    this.temple.on("WIN", () => {
      this.service.send({ type: "WIN" });
      const cam = this.cameras.main;
      cam.fade(1000, 24, 56, 153);
      cam.once("camerafadeoutcomplete", () => this.scene.start(Scenes.END));
    });

    const poseidon = new Poseidon(this, 480, 120);
    this.add.existing(poseidon);
    poseidon.intro();

    // Add listeners for pause keys
  }

  startPlaying() {
    this.warriors.forEach((warrior) => {
      warrior.on(Phaser.Input.Events.POINTER_UP, () => {
        warrior.select();
        this.selectedWarrior = warrior;
      });
    });

    // TODO: spawnSpring should search for land tiles
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

    this.input.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer: Phaser.Input.Pointer) => {
        if (this.selectedWarrior) {
          const { worldX, worldY } = pointer;
          const targetVec = this.layer.worldToTileXY(worldX, worldY);
          const warriorPos = this.layer.worldToTileXY(
            this.selectedWarrior.x,
            this.selectedWarrior.y
          );
          // TODO: fix this path finding
          this.selectedWarrior?.moveAlong(
            findPath(warriorPos, targetVec, this.layer)
          );
        }
      }
    );

    const invaderSpawnRate = getOption<number>("invaderSpawnRate");
    this.time.addEvent({
      delay: invaderSpawnRate,
      loop: true,
      callback: () => {
        this.spawnInvader();
      },
    });

    this.temple.startPraying();

    // Move pause code to the HUD
    // this.input.keyboard.on("keyup-P", () => {
    //   this.service.send({ type: "TOGGLE" });
    //   console.log(this.scene.isPaused(Scenes.GAME));
    //   if (this.scene.isPaused(Scenes.GAME)) {
    //     this.scene.resume(Scenes.GAME);
    //   } else {
    //     this.scene.pause(Scenes.GAME);
    //   }
    // });
  }

  spawnInvader() {
    if (this.service.state.value.gameplay !== "playing") {
      return;
    }

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
    invader.moveTo(new Phaser.Math.Vector2(targetX, targetY));
    invader.on(INVADER_FLOOD, () => {
      const invaderPos = this.layer.worldToTileXY(invader.x, invader.y);
      this.layer.putTileAt(0, invaderPos.x, invaderPos.y);
      // TODO: warriors should check if they are sunk

      const newTile = selectNearbyTileToFlood(
        { x: invaderPos.x, y: invaderPos.y },
        this.layer
      );
      invader.moveTo(this.layer.tileToWorldXY(newTile.x, newTile.y));
    });
  }

  spawnSpring(xTile: number, yTile: number) {
    if (this.service.state.value.gameplay !== "playing") {
      return;
    }

    const { x, y } = this.layer.tileToWorldXY(xTile, yTile);
    const spring = new Spring(this, x, y - 12);
    this.add.existing(spring);
    const floodTile = (xAt: number, yAt: number) => {
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
    this.warriors.forEach((warrior) => warrior.update(time, this.invaders));

    if (this.service.state.value.gameplay === "playing") {
      this.invaders.forEach((invader) => invader.update());
      if (this.selectedWarrior) {
        this.selectionRect.visible = true;
        this.selectionRect.x = this.selectedWarrior.x;
        this.selectionRect.y = this.selectedWarrior.y;
      } else {
        this.selectionRect.visible = false;
      }
    }

    if (this.lossTime && time > this.lossTime) {
      console.log(this.lossTime, time);
      this.service.send({ type: "FAIL" });
      const cam = this.cameras.main;
      cam.fade(1400, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.scene.start(Scenes.START));
    } else if (
      !this.lossTime &&
      this.warriors.every((warrior) => warrior.isDead()) // TODO: change to a check whenever a warrior dies.
    ) {
      this.lossTime = time + 1200; // Should this slight advantage be in the options?
    }
  }
}
