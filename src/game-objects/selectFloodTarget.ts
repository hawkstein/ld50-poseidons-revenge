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
  let targetFound;
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
    if (!tile) {
      console.log("TILE WAS NULL");
      return { targetX: 0, targetY: 0 };
    }
    if (tile.index > 0) {
      targetFound = true;
      const { x, y } = tileMapLayer.tileToWorldXY(tileX, tileY);
      return { targetX: x, targetY: y };
    }
  }
  return { targetX: 0, targetY: 0 };
};

export default selectFloodTarget;
