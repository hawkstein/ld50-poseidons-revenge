import Phaser from "phaser";
import { createMachine, interpret } from "xstate";

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
          states: {
            attackingUp: {},
            attackingDown: {},
            attackingLeft: {},
            attackingRight: {},
          },
        },
        moving: {
          on: {
            FINISHED_MOVING: "idle",
            FLEE: "fled",
          },
          states: {
            movingUp: {},
            movingDown: {},
            movingLeft: {},
            movingRight: {},
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

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "warrior");
    this.service = interpret(warriorMachine).onTransition((state) => {
      console.log(state.value);
    });
    this.setInteractive();
    this.service.start();
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      console.log(this.service.state.value);
    });
  }

  moveAlong(path: Phaser.Math.Vector2[]) {
    console.log(path);
    if (!path || path.length <= 0) {
      return;
    }
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

  update() {
    let dx = 0;
    let dy = 0;

    if (this.moveToTarget) {
      dx = this.moveToTarget.x - this.x;
      dy = this.moveToTarget.y - this.y;

      if (Math.abs(dx) < 5) {
        // use tilesize here
        dx = 0;
      }
      if (Math.abs(dy) < 5) {
        dy = 0;
      }

      if (dx === 0 && dy === 0) {
        if (this.movePath.length > 0) {
          this.moveTo(this.movePath.shift()!);
          return;
        }

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
    // if (this.service.state.value.activity === "idle") {
    //   console.log(
    //     `Distance to target: ${Phaser.Math.Distance.Between(
    //       this.x,
    //       this.y,
    //       200,
    //       270
    //     )}`
    //   );
    //   if (Phaser.Math.Distance.Between(this.x, this.y, 200, 270) < 100) {
    //     this.service.send({ type: "ATTACK" });
    //   }
    // }
  }
}
