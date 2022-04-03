import Phaser from "phaser";
import { createMachine, interpret } from "xstate";
import buildConfig from "./invaderMachineConfig";

export const INVADER_FLOOD = "INVADER_FLOOD";

export class Invader extends Phaser.GameObjects.Sprite {
  private service: any;
  private moveToTarget?: Phaser.Math.Vector2;

  public health: number = 3;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "invader");
    const invaderMachine = createMachine(buildConfig(2000));
    this.service = interpret(invaderMachine).onTransition((state) => {
      // console.log(`Invader: ${state.value}`);
      if (state.value === "finished_flooding") {
        this.emit(INVADER_FLOOD);
      } else if (state.value === "dead") {
        this.destroy();
      }
    });
    this.service.start();
    this.setOrigin(0, 0);
    // TODO: add particle effects for spawning
  }

  moveTo(target: Phaser.Math.Vector2) {
    if (target.x === this.x && target.y === this.y) {
      this.service.send({ type: "KILLED" });
      // TODO: Something else should happen here, idle?
    } else {
      this.moveToTarget = target;
      this.service.send({ type: "SWIM_TO_LAND" });
    }
  }

  damage(amount: number = 1): boolean {
    this.health -= amount;
    if (this.health <= 0) {
      this.service.send("KILLED");
      return true;
    }
    return false;
  }

  destroy(fromScene?: boolean): void {
    this.service.stop();
    super.destroy(fromScene);
  }

  update() {
    let dx = 0;
    let dy = 0;

    if (this.service.state.matches("swimming") && this.moveToTarget) {
      dx = this.moveToTarget.x - this.x;
      dy = this.moveToTarget.y - this.y;

      const speed = 0.5;
      const threshold = speed * 0.5;

      if (Math.abs(dx) < threshold) {
        // use tilesize here
        dx = 0;
        this.x = this.moveToTarget.x;
      }
      if (Math.abs(dy) < threshold) {
        dy = 0;
        this.y = this.moveToTarget.y;
      }

      if (dx === 0 && dy === 0) {
        this.moveToTarget = undefined;
        this.service.send({ type: "ARRIVED_AT_LAND" });
      }

      const leftDown = dx < 0;
      const rightDown = dx > 0;
      const upDown = dy < 0;
      const downDown = dy > 0;

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
    }
  }
}
