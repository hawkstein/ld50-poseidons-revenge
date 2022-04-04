import Phaser from "phaser";
import Scenes from "@scenes";
import StartMenu from "@components/StartMenu";

export default class Start extends Phaser.Scene {
  private tridents?: Phaser.GameObjects.TileSprite;

  constructor() {
    super(Scenes.START);
  }

  create() {
    this.tridents = this.add.tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      "tridents"
    );
    this.tridents.scale = 2;

    const title = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 130,
      "title_v1"
    );
    title.scale = 2;

    const FONT_SIZE = "24px";
    const headline = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 10,
      "Built for Ludum Dare Fifty",
      { color: "#fff", fontSize: FONT_SIZE, fontFamily: "KenneyMiniSquare" }
    );
    headline.x -= headline.width / 2;
    headline.y -= headline.height / 2;

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 40,
      "Theme: Delay the inevitable",
      { color: "#fff", fontSize: FONT_SIZE, fontFamily: "KenneyMiniSquare" }
    );
    subtitle.x -= subtitle.width / 2;
    subtitle.y -= subtitle.height / 2;

    const menu = new StartMenu(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY + 100
    );
    menu.build();
  }

  update(): void {
    if (this.tridents) {
      this.tridents.tilePositionX = this.tridents.tilePositionX + 0.5;
      this.tridents.tilePositionY = this.tridents.tilePositionY + 0.5;
    }
  }
}
