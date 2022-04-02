import Phaser from "phaser";
import Scenes from "@scenes";

export default class Preload extends Phaser.Scene {
  constructor() {
    super(Scenes.PRELOAD);
  }

  init() {
    document.fonts.onloadingdone = (ev) => {
      console.log(ev);
    };
  }

  preload() {
    // Create hidden text with font families that you have preloaded in index.html to ensure Phaser will render them
    this.add.text(0, 0, "Loading...", {
      color: "#000",
      fontSize: "48px",
      fontFamily: "KenneyMiniSquare",
    });
    this.add.text(40, 40, "Loading...", { color: "#fff", fontSize: "48px" });
    this.load.pack({ key: "preload", url: "assets/pack.json" });
  }

  create() {
    this.scene.start(Scenes.START);
  }
}
