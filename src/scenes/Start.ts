import Phaser from "phaser";
import Scenes from "@scenes";
import StartMenu from "@components/StartMenu";

export default class Start extends Phaser.Scene {
  constructor() {
    super(Scenes.START);
  }

  create() {
    const title = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 170,
      "title_v1"
    );

    const headline = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 50,
      "Built for Ludum Dare Fifty",
      { color: "#fff", fontSize: "36px", fontFamily: "KenneyMiniSquare" }
    );
    headline.x -= headline.width / 2;
    headline.y -= headline.height / 2;

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 110,
      "Theme: Delay the inevitable",
      { color: "#fff", fontSize: "36px", fontFamily: "KenneyMiniSquare" }
    );
    subtitle.x -= subtitle.width / 2;
    subtitle.y -= subtitle.height / 2;

    const menu = new StartMenu(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY + 180
    );
    menu.build();
  }
}
