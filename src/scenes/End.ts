import Phaser from "phaser";
import Scenes from "@scenes";

export default class GameEnd extends Phaser.Scene {
  constructor() {
    super(Scenes.END);
  }

  create() {
    const congrats = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "Thanks for playing! That's all folks!",
      { color: "#fff", fontSize: "36px", fontFamily: "KenneyMiniSquare" }
    );
    congrats.x -= congrats.width / 2;
    congrats.y -= congrats.height / 2;
  }
}
