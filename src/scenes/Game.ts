import Phaser from "phaser";
import Scenes from "@scenes";
import { LEAP_TO_SAFETY, Warrior } from "game-objects/Warrior";
import findPath from "game-objects/findPath";
import { Invader, INVADER_FLOOD } from "game-objects/Invader";
import { Temple } from "game-objects/Temple";
import { Poseidon } from "game-objects/Poseidon";
import { Spring } from "game-objects/Spring";
import selectFloodTarget, {
  selectNearbyTileToFlood,
} from "game-objects/selectFloodTarget";
import { createMachine, interpret } from "xstate";
import {
  getCurrentLevel,
  getOption,
  setCurrentLevel,
  setOption,
  TUTORIAL_MODE_KEY,
  WARRIOR_RANGE_KEY,
} from "data";
import { Speech } from "game-objects/Speech";
import checkNeighbours from "game-objects/checkNeighbours";
import buildLevelFromImage from "@utils/levelFromImage";
import getThreat from "@utils/getThreat";
import getLevelConfig from "@utils/getLevelConfig";
import { WATER_LEVEL } from "constants";

type InvaderSpawnZone = {
  x: number;
  y: number;
  width: number;
  height: number;
  initialSwimDirection: "left" | "right" | "up";
};

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

const ARROW_KEY = "arrow";
export default class Game extends Phaser.Scene {
  private service!: any;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private selectedWarrior: Warrior | null = null;
  private selectionRect!: Phaser.GameObjects.Sprite;
  private warriors: Warrior[] = [];
  private invaders: Invader[] = [];
  private arrows!: Phaser.GameObjects.Group;
  private temple!: Temple;
  private lossTime: number | null = null;
  private tutorialMode: boolean = true;
  private templeTiles: Phaser.Math.Vector2[] = [];
  private bgMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super(Scenes.GAME);
  }

  init() {
    const gameMachine = buildMachine(this.events);
    this.service = interpret(gameMachine);

    this.bgMusic = this.sound.add("drums_loop");

    this.events.on("START_PLAYING", () => {
      this.startPlaying();
    });

    this.events.on(Phaser.Scenes.Events.CREATE, () => {
      this.service.start();
      this.bgMusic?.play({ loop: true, volume: 0.5 });
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.service.stop();
      this.bgMusic?.stop();
    });

    this.tutorialMode = getOption("tutorialMode") as boolean;

    this.arrows = this.add.group({
      defaultKey: ARROW_KEY,
    });
  }

  create() {
    this.warriors = [];
    const level = getCurrentLevel();
    const {
      levelData,
      warriors: warriorPositions,
      temple: templePos,
    } = buildLevelFromImage(this.textures, `level_${level}`);

    const TILE_SIDE = 32;
    const map = this.make.tilemap({
      data: levelData as number[][],
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

    warriorPositions.forEach(({ x, y }) => {
      const warrior = new Warrior(
        this,
        this.layer.tileToWorldY(x),
        this.layer.tileToWorldY(y)
      );

      this.add.existing(warrior);
      this.warriors.push(warrior);
    });

    if (!templePos) {
      throw new Error("No temple in level data");
    }
    const templeXY = this.layer.tileToWorldXY(templePos?.x, templePos.y);
    this.temple = new Temple(this, templeXY.x, templeXY.y);
    this.templeTiles = [
      templePos,
      new Phaser.Math.Vector2(templePos.x - 1, templePos.y),
    ];
    this.add.existing(this.temple);
    this.temple.on("WIN", () => {
      this.service.send({ type: "WIN" });
      const cam = this.cameras.main;
      cam.fade(1000, 24, 56, 153);
      const level = getCurrentLevel();
      if (level >= 5) {
        cam.once("camerafadeoutcomplete", () => this.scene.start(Scenes.END));
      } else {
        setCurrentLevel(level + 1);
        setOption(TUTORIAL_MODE_KEY, false);
        cam.once("camerafadeoutcomplete", () =>
          this.scene.start(Scenes.LEVEL_COMPLETE)
        );
      }
    });

    const poseidon = new Poseidon(this, 480, 120);
    this.add.existing(poseidon);
    poseidon.intro();

    const threat = new Speech(
      this,
      50,
      50,
      "Face the wrath of Poseidon!",
      2000,
      3000
    );
    this.add.existing(threat);

    const cam = this.cameras.main;
    cam.fadeIn(1600, 24, 56, 153);
  }

  startPlaying() {
    this.warriors.forEach((warrior) => {
      warrior.on(Phaser.Input.Events.POINTER_UP, () => {
        warrior.select();
        this.selectedWarrior = warrior;
      });
      warrior.on(
        "FIRE_ARROW",
        (tweenData: {
          x: number;
          y: number;
          targetX: number;
          targetY: number;
        }) => {
          const { x, y, targetX, targetY } = tweenData;
          this.spawnArrow(x, y, targetX, targetY);
        }
      );
      warrior.on(LEAP_TO_SAFETY, () => {
        const warriorPos = this.layer.worldToTileXY(warrior.x, warrior.y);
        const safety = checkNeighbours(warriorPos, WATER_LEVEL, this.layer);
        if (warriorPos.equals(safety)) {
          warrior.drown();
        } else {
          warrior.moveAlong([this.layer.tileToWorldXY(safety.x, safety.y)]);
        }
      });
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
            findPath(warriorPos, targetVec, this.layer, this.templeTiles)
          );
        }
      }
    );

    const { invaderSpawnRateAdjust, springSpawnRate } = getLevelConfig(
      getCurrentLevel()
    );
    this.time.addEvent({
      delay: this.tutorialMode ? 20000 : 0,
      callback: () => {
        // TODO: spawnSpring should search for land tiles
        this.time.addEvent({
          delay: 20000 - springSpawnRate,
          loop: true,
          callback: () => {
            this.spawnSpring(
              Phaser.Math.Between(8, 22),
              Phaser.Math.Between(7, 16)
            );
          },
        });
        this.temple.startPraying();
        const invaderSpawnRate = getOption("invaderSpawnRate") as number;
        this.time.addEvent({
          delay: invaderSpawnRate - invaderSpawnRateAdjust,
          loop: true,
          callback: () => {
            this.spawnInvader();
          },
        });
      },
    });

    if (this.tutorialMode) {
      const firstWarrior = this.warriors[0];
      const warriorClick = new Speech(
        this,
        firstWarrior.x - 16,
        firstWarrior.y - 36,
        "Click to select a warrior",
        6000,
        3200
      );
      this.add.existing(warriorClick);
      const secondWarrior = this.warriors[1];
      const warriorMove = new Speech(
        this,
        secondWarrior.x - 216,
        secondWarrior.y - 36,
        "Click elsewhere to move them",
        9200,
        3200
      );
      this.add.existing(warriorMove);
      const templeInfo = new Speech(
        this,
        this.temple.x - 260,
        this.temple.y - 64,
        "Islanders in the temple are praying to Athena",
        12400,
        4000
      );
      this.add.existing(templeInfo);
      const templeBoat = new Speech(
        this,
        this.temple.x - 280,
        this.temple.y - 64,
        "In time she will grant a boat safe passage",
        16400,
        7000
      );
      this.add.existing(templeBoat);
      const templeEnd = new Speech(
        this,
        this.temple.x - 160,
        this.temple.y - 64,
        "Hold out until then!",
        23400,
        2000
      );
      this.add.existing(templeEnd);
    }

    const seaPeople = new Speech(
      this,
      250,
      50,
      "Sea-beasts! Sink this offensive island!",
      this.tutorialMode ? 25400 : 6000,
      2000
    );
    this.add.existing(seaPeople);

    if (this.tutorialMode) {
      const firstWarrior = this.warriors[0];
      const archery = new Speech(
        this,
        firstWarrior.x - 16,
        firstWarrior.y - 36,
        "Your warriors will shoot at enemies when close",
        27000,
        3000
      );
      this.add.existing(archery);
    }

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
      this.layer.putTileAt(1, invaderPos.x, invaderPos.y);
      this.warriors.forEach((warrior) => {
        const warriorPos = this.layer.worldToTileXY(warrior.x, warrior.y);
        if (warriorPos.equals(invaderPos) && warrior) {
          warrior.handleFlooding();
        }
      });
      if (
        this.templeTiles.every((tilePos) => {
          const tile = this.layer.getTileAt(tilePos.x, tilePos.y);
          return tile.index < WATER_LEVEL;
        })
      ) {
        this.handleLevelFailure();
      }
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

    const threat = new Speech(this, 50, 50, getThreat(), 0, 1800);
    this.add.existing(threat);

    const { x, y } = this.layer.tileToWorldXY(xTile, yTile);
    const spring = new Spring(this, x, y - 12);
    this.add.existing(spring);
    const floodTile = (xAt: number, yAt: number) => {
      const tile = this.layer.getTileAt(xAt, yAt);
      const floodIndex = tile.index >= 1 ? 1 : 0;
      this.layer.putTileAt(floodIndex, xAt, yAt);
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

  spawnArrow(x: number, y: number, targetX: number, targetY: number) {
    const arrow: Phaser.GameObjects.Sprite = this.arrows.get(x, y, ARROW_KEY);
    arrow.setVisible(true);
    arrow.setActive(true);
    const rotation = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const distance = Phaser.Math.Distance.Between(x, y, targetX, targetY);
    const range = getOption(WARRIOR_RANGE_KEY) as number;
    arrow.rotation = rotation;
    this.tweens.add({
      targets: arrow,
      x: targetX,
      y: targetY,
      duration: (distance / range) * 500,
      onComplete: () => {
        this.arrows!.killAndHide(arrow);
        this.tweens.killTweensOf(arrow);
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
      this.handleLevelFailure();
    } else if (
      !this.lossTime &&
      this.warriors.every((warrior) => warrior.isDead()) // TODO: change to a check whenever a warrior dies.
    ) {
      this.lossTime = time + 1200;
    }
  }

  handleLevelFailure() {
    this.service.send({ type: "FAIL" });
    const cam = this.cameras.main;
    cam.fade(1400, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => this.scene.start(Scenes.START));
  }
}
