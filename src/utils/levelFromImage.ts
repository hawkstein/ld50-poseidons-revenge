type TileData = number | null;

export default function buildLevelFromImage(
  tm: Phaser.Textures.TextureManager,
  key: string
) {
  const frame = tm.getFrame(key);

  const levelData: TileData[][] = Array.from({ length: frame.height }).map(() =>
    Array.from({ length: frame.height })
  );
  const warriors: Phaser.Math.Vector2[] = [];
  let temple: Phaser.Math.Vector2 | undefined;
  for (let column = 0; column < frame.height; column++) {
    for (let row = 0; row < frame.width; row++) {
      let tile = null;
      const pixel = tm.getPixel(row, column, key);
      const colour = pixel.rgba;
      switch (colour) {
        case "rgba(38,54,88,1)":
          tile = 0;
          break;
        case "rgba(191,102,94,1)":
          tile = 1;
          break;
        case "rgba(153,229,80,1)":
          tile = 1;
          warriors.push(new Phaser.Math.Vector2(row, column));
          break;
        case "rgba(251,242,54,1)":
          tile = 1;
          temple = new Phaser.Math.Vector2(row, column);
          break;
      }
      levelData[column][row] = tile;
    }
  }
  return { levelData, warriors, temple };
}
