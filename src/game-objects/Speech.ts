import Phaser from "phaser";

export class Speech extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    speech: string,
    initialDelay: number = 0,
    duration: number = 10000
  ) {
    super(scene, x, y);

    const text = scene.make.text({
      x: 4,
      y: -4,
      text: speech,
      style: {
        color: "#000",
        fontFamily: "KenneyMiniSquare",
        fontSize: "24px",
      },
    });
    const background = scene.make.graphics({ x: 0, y: 0 });
    background.lineStyle(2, 0x000000, 1.0);
    background.fillStyle(0xffffff, 1.0);
    background.fillRect(0, 0, text.width + 6, text.height);
    background.strokeRect(0, 0, text.width + 6, text.height);
    this.add([background, text]);
    this.setSize(text.width + 6, text.height);

    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      delay: initialDelay,
      duration: 400,
    });

    this.scene.time.addEvent({
      delay: duration + initialDelay,
      callback: () => {
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            this.destroy();
          },
        });
      },
    });
  }
}
