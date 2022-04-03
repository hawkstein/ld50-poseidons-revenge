const checkNeighbours = (
  start: { x: number; y: number },
  minIndex: number,
  tileMapLayer: Phaser.Tilemaps.TilemapLayer,
  shuffle: boolean = false
) => {
  const { x, y } = start;
  const neighbors = [
    { x, y: y - 1 },
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
  ];
  const shuffled = shuffle ? Phaser.Utils.Array.Shuffle(neighbors) : neighbors;

  for (let i = 0; i < shuffled.length; ++i) {
    const neighbor = shuffled[i];
    const tile = tileMapLayer.getTileAt(neighbor.x, neighbor.y);

    if (!tile) {
      continue;
    }

    if (tile.index < minIndex) {
      continue;
    }

    return { x: tile.x, y: tile.y };
  }
  return start;
};

export default checkNeighbours;
