import Phaser from "phaser";

export class Poseidon extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "poseidon");
    this.scale = 2;
  }
}
