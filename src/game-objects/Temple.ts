import Phaser from "phaser";

export class Temple extends Phaser.GameObjects.Sprite {
  private updateEvent?: Phaser.Time.TimerEvent;
  private progressPercentage: number = 0; // could start with something?
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "temple");
  }

  startPraying() {
    if (!this.updateEvent) {
      this.updateEvent = this.scene.time.addEvent({
        delay: 5000,
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
    //TODO if progress is past 100 then emit end event
    if (this.progressPercentage >= 100) {
      this.updateEvent?.destroy();
    }
  }

  destroy() {
    this.updateEvent?.destroy();
  }
}
