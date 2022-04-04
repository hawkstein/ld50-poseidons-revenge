import { HALF_SIDE } from "constants";
import { getOption, WARRIOR_RANGE_KEY } from "data";
import Phaser from "phaser";
import { createMachine, interpret } from "xstate";
import { Invader } from "./Invader";

const LEAP_TO_SAFETY = "LEAP_TO_SAFETY";

export { LEAP_TO_SAFETY };

const warriorMachine = createMachine({
  id: "warrior",
  type: "parallel",
  states: {
    selection: {
      initial: "unselected",
      states: {
        unselected: {
          on: {
            SELECT: "selected",
          },
        },
        selected: {
          on: {
            DESELECT: "unselected",
          },
        },
      },
    },
    activity: {
      initial: "idle",
      states: {
        idle: {
          on: {
            MOVE: "moving",
            ATTACK: "attacking",
            SHORE: "shoring",
            SUNK: "escaping",
          },
        },
        attacking: {
          on: {
            MOVE: "moving",
            FINISHED_ATTACKING: "idle",
            SUNK: "escaping",
          },
        },
        moving: {
          on: {
            FINISHED_MOVING: "idle",
            FLEE: "fled",
            SUNK: "escaping",
          },
        },
        shoring: {
          on: {
            FINISHED_SHORING: "idle",
            SUNK: "escaping",
          },
        },
        escaping: {
          on: {
            MOVE: "moving",
            DROWN: "drowning",
          },
        },
        drowning: {
          after: {
            1000: "dead",
          },
        },
        dead: {
          type: "final",
        },
        fled: {
          type: "final",
        },
      },
    },
  },
});

export class Warrior extends Phaser.GameObjects.Sprite {
  private service: any;
  private movePath: Phaser.Math.Vector2[] = [];
  private moveToTarget?: Phaser.Math.Vector2;
  private nextEnemyScan: number = 0;
  private currentEnemy: Invader | null = null;
  private range: number = getOption(WARRIOR_RANGE_KEY) as number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "warrior", 0);
    this.service = interpret(warriorMachine).onTransition((state: any) => {
      if (state.value.activity === "escaping") {
        this.emit(LEAP_TO_SAFETY);
      }
    });
    this.setInteractive();
    this.service.start();
    this.setOrigin(0);
    const anims = scene.anims;
    anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("warrior", { start: 0, end: 0 }),
      frameRate: 6,
      repeat: -1,
    });
    anims.create({
      key: "walk_down",
      frames: this.anims.generateFrameNumbers("warrior", { start: 1, end: 4 }),
      frameRate: 6,
      repeat: -1,
    });
  }

  moveAlong(path: Phaser.Math.Vector2[]) {
    // console.log(
    //   [...path].map((vector) => ({
    //     x: Math.abs(vector.x / 32),
    //     y: Math.abs(vector.y / 32),
    //   }))
    // );
    if (!path || path.length <= 0) {
      return;
    }
    this.service.send({ type: "MOVE" });
    this.movePath = path;
    this.moveTo(this.movePath.shift()!);
  }

  moveTo(target: Phaser.Math.Vector2) {
    this.moveToTarget = target;
  }

  select() {
    this.service.send({ type: "SELECT" });
  }

  deselect() {
    this.service.send({ type: "DESELECT" });
  }

  isDead() {
    return this.service.state.value.activity === "dead";
  }

  isMoving() {
    return this.service.state.value.activity === "moving";
  }

  handleFlooding() {
    this.service.send({ type: "SUNK" });
  }

  drown() {
    this.service.send({ type: "DROWN" });
  }

  update(time: number, enemies: Invader[]) {
    let dx = 0;
    let dy = 0;

    if (this.moveToTarget) {
      dx = this.moveToTarget.x - this.x;
      dy = this.moveToTarget.y - this.y;

      if (Math.abs(dx) < 2) {
        dx = 0;
        this.x = this.moveToTarget.x;
      }
      if (Math.abs(dy) < 2) {
        dy = 0;
        this.y = this.moveToTarget.y;
      }

      if (dx === 0 && dy === 0) {
        if (this.movePath.length > 0) {
          this.moveTo(this.movePath.shift()!);
          return;
        }
        this.service.send({ type: "FINISHED_MOVING" });
        this.moveToTarget = undefined;
      }
    }

    const leftDown = dx < 0;
    const rightDown = dx > 0;
    const upDown = dy < 0;
    const downDown = dy > 0;

    const speed = 3;

    if (leftDown) {
      this.x -= speed;

      this.flipX = true;
    } else if (rightDown) {
      this.x += speed;

      this.flipX = false;
    } else if (upDown) {
      this.y -= speed;
      this.anims.play("walk_down", true);
    } else if (downDown) {
      this.y += speed;
      this.anims.play("walk_down", true);
    } else {
      this.anims.play("idle", true);
    }

    if (
      this.service.state.value.activity === "idle" &&
      time > this.nextEnemyScan
    ) {
      this.nextEnemyScan = time += 500;
      let enemyFound = false;
      enemies.forEach((enemy) => {
        if (
          !enemyFound &&
          Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <
            this.range
        ) {
          this.service.send({ type: "ATTACK" });
          enemyFound = true;
          this.currentEnemy = enemy;
        }
      });
    }

    if (
      this.service.state.value.activity === "attacking" &&
      time > this.nextEnemyScan
    ) {
      if (this.currentEnemy) {
        this.emit("FIRE_ARROW", {
          x: this.x + HALF_SIDE,
          y: this.y + HALF_SIDE,
          targetX: this.currentEnemy.x + HALF_SIDE,
          targetY: this.currentEnemy.y + HALF_SIDE,
        });
      }

      this.nextEnemyScan = time += 800;
      const killed = this.currentEnemy?.damage(1);
      if (killed) {
        this.service.send({ type: "FINISHED_ATTACKING" });
      }
    }
  }

  destroy(fromScene?: boolean): void {
    this.service.stop();
    super.destroy(fromScene);
  }
}
