import Phaser from "phaser";
import Scenes from "@scenes";
import { MenuButton } from "game-objects/MenuButton";

export default class Game extends Phaser.Scene {
  private keyActions: { key: Phaser.Input.Keyboard.Key; action: () => void }[] =
    [];
  private inputLog?: Phaser.GameObjects.Text;

  constructor() {
    super(Scenes.GAME);
  }

  create() {
    const message = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 200,
      "Ludum Dare 50 Untitled Compo Entry",
      { color: "#fff", fontSize: "36px", fontFamily: "KenneyMiniSquare" }
    );
    message.x -= message.width / 2;
    message.y -= message.height / 2;

    this.inputLog = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 100,
      "No input detected",
      { color: "#fff", fontSize: "36px" }
    );
    this.inputLog.x -= this.inputLog.width / 2;
    this.inputLog.y -= this.inputLog.height / 2;

    const upAction = {
      key: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      action: () => {
        this.inputLog?.setText("Up Key");
      },
    };
    const downAction = {
      key: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      action: () => {
        this.inputLog?.setText("Down Key");
      },
    };
    const leftAction = {
      key: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      action: () => {
        this.inputLog?.setText("Left Key");
      },
    };
    const rightAction = {
      key: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      action: () => {
        this.inputLog?.setText("Right Key");
      },
    };
    this.keyActions = [upAction, downAction, leftAction, rightAction];

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

  update() {
    this.inputLog?.setText("No input detected");
    this.keyActions.forEach((keyAction) => {
      if (keyAction.key.isDown) {
        keyAction.action();
      }
    });
  }
}
