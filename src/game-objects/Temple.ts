import { getOption } from "data";
import Phaser from "phaser";

export class Temple extends Phaser.GameObjects.Sprite {
  private updateEvent?: Phaser.Time.TimerEvent;
  public progressPercentage: number = 0;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "temple", 0);
  }

  startPraying() {
    const prayerRate = getOption("prayerRate") as number;
    if (!this.updateEvent) {
      this.updateEvent = this.scene.time.addEvent({
        delay: prayerRate,
        loop: true,
        callback: this.onProgress,
        callbackScope: this,
      });
    }
  }

  private onProgress() {
    this.progressPercentage += 5;
    console.log(
      "Temple blessings upon us all! Progress: ",
      this.progressPercentage
    );
    this.setFrame(Math.min(Math.floor(this.progressPercentage / 10), 9));
    if (this.progressPercentage >= 100) {
      this.updateEvent?.destroy();
      this.emit("WIN");
    }
  }

  destroy() {
    this.updateEvent?.destroy();
  }
}
