import Phaser from "phaser";

type TilePosition = {
  x: number;
  y: number;
};

const toKey = (x: number, y: number) => `${x}x${y}`;

const findPath = (
  start: Phaser.Math.Vector2,
  target: Phaser.Math.Vector2,
  tileMapLayer: Phaser.Tilemaps.TilemapLayer
) => {
  // no path if select invalid tile
  if (tileMapLayer.getTileAt(target.x, target.y).index <= 0) {
    return [];
  }

  const queue: TilePosition[] = [];
  const parentForKey: {
    [key: string]: { key: string; position: TilePosition };
  } = {};

  const startKey = toKey(start.x, start.y);
  const targetKey = toKey(target.x, target.y);

  parentForKey[startKey] = {
    key: "",
    position: { x: -1, y: -1 },
  };

  queue.push(start);

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const currentKey = toKey(x, y);

    if (currentKey === targetKey) {
      break;
    }

    const neighbors = [
      { x, y: y - 1 }, // top
      { x: x + 1, y }, // right
      { x, y: y + 1 }, // bottom
      { x: x - 1, y }, // left
    ];

    for (let i = 0; i < neighbors.length; ++i) {
      const neighbor = neighbors[i];
      const tile = tileMapLayer.getTileAt(neighbor.x, neighbor.y);

      if (!tile) {
        continue;
      }

      if (tile.index <= 0) {
        continue;
      }

      const key = toKey(neighbor.x, neighbor.y);

      if (key in parentForKey) {
        continue;
      }

      parentForKey[key] = {
        key: currentKey,
        position: { x, y },
      };

      queue.push(neighbor);
    }
  }

  const path: Phaser.Math.Vector2[] = [];

  let currentKey = targetKey;
  let currentPos = parentForKey[targetKey].position;

  while (currentKey !== startKey) {
    const pos = tileMapLayer.tileToWorldXY(currentPos.x, currentPos.y);
    pos.x += tileMapLayer.tilemap.tileWidth * 0.5;
    pos.y += tileMapLayer.tilemap.tileHeight * 0.5;

    path.push(pos);

    const { key, position } = parentForKey[currentKey];
    currentKey = key;
    currentPos = position;
  }

  return path.reverse();
};

export default findPath;
