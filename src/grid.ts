import type { WorldPosition } from "./types";

export class GridController {
  private readonly worldOrigin: WorldPosition
  private readonly cellSize: number;

  constructor(worldOrigin: WorldPosition, cellSize: number) {
    this.worldOrigin = worldOrigin;
    this.cellSize = cellSize;
  }

  public snapToGrid = (
    world: WorldPosition,
    size: WorldPosition,
  ): WorldPosition => {
    const [worldX, worldY] = world;
    const [width, height] = size;
    const [originX, originY] = this.worldOrigin;
    const cell = this.cellSize;

    const topLeftX = worldX - width / 2;
    const topLeftY = worldY - height / 2;

    return [
      originX + Math.round((topLeftX - originX) / cell) * cell,
      originY + Math.round((topLeftY - originY) / cell) * cell,
    ];
  };
};
