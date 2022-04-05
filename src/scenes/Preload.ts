import Phaser from "phaser";
import Scenes from "@scenes";
import { loadGameData } from "data";

export default class Preload extends Phaser.Scene {
  constructor() {
    super(Scenes.PRELOAD);
  }

  init() {
    loadGameData();
  }

  preload() {
    // Create text with font families that you have preloaded in index.html to ensure Phaser will render them
    const message = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "Loading...",
      {
        color: "#fff",
        fontSize: "48px",
        fontFamily: "KenneyMiniSquare",
      }
    );
    message.setOrigin(0.5, 0.8);
    this.load.pack({ key: "preload", url: "assets/pack.json" });
  }

  create() {
    this.scene.start(Scenes.GAME);
  }
}
