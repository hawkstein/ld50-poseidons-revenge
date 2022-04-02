import Phaser from "phaser";
import Scenes from "@scenes";
import { MenuButton } from "game-objects/MenuButton";

export default class Credits extends Phaser.Scene {
  constructor() {
    super(Scenes.CREDITS);
  }

  create() {
    const message = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 200,
      "Credits Screen",
      { color: "#fff", fontSize: "36px" }
    );
    message.x -= message.width / 2;
    message.y -= message.height / 2;

    new MenuButton({
      scene: this,
      label: "Back to the menu",
      onClick: () => {
        this.scene.start(Scenes.START);
      },
      x: this.cameras.main.centerX,
      y: 400,
    });
  }
}
