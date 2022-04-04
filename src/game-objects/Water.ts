import { TILE_SIDE } from "constants";
import Phaser from "phaser";

export class Water extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene) {
    const x =
      Math.floor(Phaser.Math.Between(0, scene.cameras.main.width) / TILE_SIDE) *
        TILE_SIDE +
      16;
    const y =
      Math.floor(
        Phaser.Math.Between(0, scene.cameras.main.height) / TILE_SIDE
      ) *
        TILE_SIDE +
      16;
    super(scene, x, y, "water_anim", 0);
    this.anims.create({
      key: "default",
      frames: this.anims.generateFrameNumbers("water_anim", {
        start: 0,
        end: 4,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.play({ key: "default", startFrame: Phaser.Math.Between(0, 4) });

    this.setMoveTimer();
  }

  randomSpot() {
    const x =
      Math.floor(
        Phaser.Math.Between(0, this.scene.cameras.main.width) / TILE_SIDE
      ) *
        TILE_SIDE +
      16;
    const y =
      Math.floor(
        Phaser.Math.Between(0, this.scene.cameras.main.height) / TILE_SIDE
      ) *
        TILE_SIDE +
      16;
    return new Phaser.Math.Vector2(x, y);
  }

  setMoveTimer() {
    this.scene.time.delayedCall(3000 + Phaser.Math.Between(0, 3000), () => {
      const newSpot = this.randomSpot();
      this.x = newSpot.x;
      this.y = newSpot.y;
      this.setMoveTimer();
    });
  }
}
