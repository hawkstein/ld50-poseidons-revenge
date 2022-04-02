import Phaser from "phaser";
import Scenes from "@scenes";
import StartMenu from "@components/StartMenu";

export default class Start extends Phaser.Scene {
  constructor() {
    super(Scenes.START);
  }

  create() {
    const title = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 200,
      "Ludum Dare 50",
      { color: "#fff", fontSize: "36px" }
    );
    title.x -= title.width / 2;
    title.y -= title.height / 2;

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 100,
      "Start Menu",
      { color: "#fff", fontSize: "36px" }
    );
    subtitle.x -= subtitle.width / 2;
    subtitle.y -= subtitle.height / 2;

    const menu = new StartMenu(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY - 20
    );
    menu.build();
  }
}
