import Phaser from "phaser";

export class Spring extends Phaser.GameObjects.Sprite {
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "spring");

    const particles = this.scene.add.particles("water");
    const circle = new Phaser.Geom.Circle(0, 0, 16);
    this.emitter = particles.createEmitter({
      lifespan: 500,
      scale: { start: 1.0, end: 0 },
      emitZone: { type: "random", source: circle, quantity: 50 },
    });

    this.emitter.setPosition(this.x, this.y);
    this.emitter.setSpeed(50);

    this.scene.time.addEvent({
      delay: 10000,
      callback: () => {
        this.destroy();
      },
    });
  }

  destroy() {
    this.emitter.remove();
    super.destroy();
  }
}
