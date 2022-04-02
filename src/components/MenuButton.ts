import Phaser from "phaser";

type MenuButtonConfig = {
  x: number;
  y: number;
  scene: Phaser.Scene;
  label: string;
  onClick: () => void;
};

export class MenuButton extends Phaser.GameObjects.Container {
  private isFocused: boolean = false;
  private buttonLabel: Phaser.GameObjects.Text;

  public menuIndex?: number;

  constructor({ scene, label, onClick, x, y }: MenuButtonConfig) {
    super(scene, x, y);
    this.buttonLabel = scene.make.text({
      x: 0,
      y: 0,
      text: label,
      style: {
        color: "#fff",
        fontSize: "36px",
      },
    });
    this.buttonLabel.x -= this.buttonLabel.width / 2;
    this.buttonLabel.y -= this.buttonLabel.height / 2;
    this.add([this.buttonLabel]);
    this.setSize(this.buttonLabel.width, this.buttonLabel.height);
    this.setInteractive({ useHandCursor: true });
    this.on("pointerover", () => {
      this.setFocus(true);
    });
    this.on("pointerout", () => {
      this.setFocus(false);
    });
    this.on("pointerdown", onClick);
    scene.add.existing(this);
  }

  setFocus(focus: boolean) {
    this.isFocused = focus;
    this.buttonLabel.setBackgroundColor(this.isFocused ? "#ff0000" : "#000");
  }

  click() {
    this.emit("pointerdown");
  }
}
