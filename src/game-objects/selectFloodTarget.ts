import { WATER_LEVEL } from "constants";
import Phaser from "phaser";

const selectFloodTarget = (
  start: { x: number; y: number },
  initialSwimDirection: "left" | "right" | "up",
  tileMapLayer: Phaser.Tilemaps.TilemapLayer
) => {
  let matrix;
  switch (initialSwimDirection) {
    case "left":
      matrix = [-1, 0];
      break;
    case "right":
      matrix = [1, 0];
      break;
    case "up":
      matrix = [0, -1];
      break;
    default:
      throw new Error("No initialSwimDirection supplied");
  }
  let targetFound = false;
  let tileX = start.x;
  let tileY = start.y;
  while (
    !targetFound &&
    tileX >= 0 &&
    tileX <= tileMapLayer.tilemap.width &&
    tileY >= 0 &&
    tileY <= tileMapLayer.tilemap.height
  ) {
    const [xAdjust, yAdjust] = matrix;
    tileX += xAdjust;
    tileY += yAdjust;
    const tile = tileMapLayer.getTileAt(tileX, tileY);
    if (tile && tile.index >= WATER_LEVEL) {
      targetFound = true;
      const { x, y } = tileMapLayer.tileToWorldXY(tileX, tileY);
      return { targetX: x, targetY: y };
    }
  }
  console.log({ start, initialSwimDirection });
  return null;
};

const selectNearbyTileToFlood = (
  start: { x: number; y: number },
  tileMapLayer: Phaser.Tilemaps.TilemapLayer
) => {
  const { x, y } = start;
  const neighbors = Phaser.Utils.Array.Shuffle([
    { x, y: y - 1 }, // top
    { x: x + 1, y }, // right
    { x, y: y + 1 }, // bottom
    { x: x - 1, y }, // left
  ]);

  for (let i = 0; i < neighbors.length; ++i) {
    const neighbor = neighbors[i];
    const tile = tileMapLayer.getTileAt(neighbor.x, neighbor.y);

    if (!tile) {
      continue;
    }

    if (tile.index < WATER_LEVEL) {
      continue;
    }

    return { x: tile.x, y: tile.y };
  }
  return start;
};

export { selectNearbyTileToFlood };

export default selectFloodTarget;
