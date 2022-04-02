import Phaser from "phaser";
import { createMachine, interpret } from "xstate";
import { Invader } from "./Invader";

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
          },
        },
        moving: {
          on: {
            FINISHED_MOVING: "idle",
            FLEE: "fled",
          },
        },
        shoring: {
          on: {
            FINISHED_SHORING: "idle",
          },
        },
        escaping: {
          on: {
            MOVE: "moving",
            DROWN: "drowning",
          },
        },
        drowning: {
          on: {
            DEATH: "dead",
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

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "warrior");
    this.service = interpret(warriorMachine).onTransition((state) => {
      // console.log(state.value);
    });
    this.setInteractive();
    this.service.start();
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      console.log(this.service.state.value);
    });
    this.setOrigin(0);
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

  destroy(fromScene?: boolean): void {
    this.service.stop();
    super.destroy(fromScene);
  }

  select() {
    this.service.send({ type: "SELECT" });
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

    const speed = 2;

    if (leftDown) {
      this.x -= speed;

      this.flipX = true;
    } else if (rightDown) {
      this.x += speed;

      this.flipX = false;
    } else if (upDown) {
      this.y -= speed;
    } else if (downDown) {
      this.y += speed;
    }
    // else {
    //   const parts = this.anims.currentAnim.key.split("-");
    //   parts[1] = "idle";
    //   this.anims.play(parts.join("-"));
    //   //this.setVelocity(0, 0)
    // }
    // console.log(time);
    if (
      this.service.state.value.activity === "idle" &&
      time > this.nextEnemyScan
    ) {
      this.nextEnemyScan = time += 500;
      // console.log("SCANNING FOR ENEMIES...");
      let enemyFound = false;
      enemies.forEach((enemy) => {
        if (
          !enemyFound &&
          Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < 200
        ) {
          this.service.send({ type: "ATTACK" });
          enemyFound = true;
          this.currentEnemy = enemy;
        }
      });
      // console.log(
      //   `Distance to target: ${Phaser.Math.Distance.Between(
      //     this.x,
      //     this.y,
      //     200,
      //     270
      //   )}`
      // );
      // if (Phaser.Math.Distance.Between(this.x, this.y, 200, 270) < 100) {
      //   this.service.send({ type: "ATTACK" });
      // }
    }

    if (
      this.service.state.value.activity === "attacking" &&
      time > this.nextEnemyScan
    ) {
      this.nextEnemyScan = time += 800;
      // console.log("Attacking!");
      const killed = this.currentEnemy?.damage(1);
      if (killed) {
        this.service.send({ type: "FINISHED_ATTACKING" });
      }
    }
  }
}
