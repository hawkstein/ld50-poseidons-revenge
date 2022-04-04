import Phaser from "phaser";
import Scenes from "@scenes";
import getLevelConfig from "@utils/getLevelConfig";
import { getCurrentLevel } from "data";

export default class LevelComplete extends Phaser.Scene {
  constructor() {
    super(Scenes.LEVEL_COMPLETE);
  }

  create() {
    const { title } = getLevelConfig(getCurrentLevel());
    const nextLevel = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      title,
      { color: "#fff", fontSize: "36px", fontFamily: "KenneyMiniSquare" }
    );
    nextLevel.x -= nextLevel.width / 2;
    nextLevel.y -= nextLevel.height / 2;

    const cam = this.cameras.main;
    cam.fadeIn(1200, 24, 56, 153, () => {
      this.time.delayedCall(2500, () =>
        cam.fade(800, 24, 56, 153, true, () => this.scene.start(Scenes.GAME))
      );
    });
  }
}
