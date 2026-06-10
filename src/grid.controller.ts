import type {
  GridPosition,
  PlacedStructure,
  WorldPosition,
  WorldSize,
} from "./types";

export const toCenter = (
  topLeft: GridPosition,
  size: WorldSize,
): WorldPosition => [topLeft[0] + size[0] / 2, topLeft[1] + size[1] / 2];

export class GridController {
  private readonly worldOrigin: WorldPosition;
  private readonly cellSize: number;
  private entities: Array<{
    position: GridPosition;
    structure: PlacedStructure;
  }>;

  constructor(worldOrigin: WorldPosition, cellSize: number) {
    this.worldOrigin = worldOrigin;
    this.cellSize = cellSize;
    this.entities = [];
  }

  public snapToGrid = (
    world: WorldPosition,
    size: WorldSize,
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

  public isBlocked = (gridPosition: GridPosition): boolean => {
    return this.entities.some(({ position }) => {
      return position[0] === gridPosition[0] && position[1] === gridPosition[1];
    });
  };

  public place = (structure: PlacedStructure, gridPosition: GridPosition) => {
    this.entities.push({
      position: gridPosition,
      structure,
    });
  };

  public remove = (gridPosition: GridPosition) => {
    this.entities = this.entities.filter(({ position }) => {
      return position[0] !== gridPosition[0] || position[1] !== gridPosition[1];
    });
  };

  public *getEntities(): IterableIterator<{
    position: GridPosition;
    structure: PlacedStructure;
  }> {
    for (const entity of this.entities) {
      yield entity;
    }
  }
}
