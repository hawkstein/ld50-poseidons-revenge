import Phaser from "phaser";

export class Poseidon extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "poseidon");
    this.scale = 2;
    this.alpha = 0;
  }

  intro() {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,
      alpha: 1,
      duration: 2000,
    });
  }
}
