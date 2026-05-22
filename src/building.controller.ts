import type { GridController } from "./grid.controller";
import type { GridPosition } from "./types";

export type Entity = "red" | "black" | "green" | "blue" | "none";
type Mode = "build" | "build-horizontal" | "build-vertical" | "remove" | "none";

export class BuildingController {
  private mode: Mode;
  private gridController: GridController;
  private lastGridPosition: GridPosition = [0, 0];

  constructor(gridController: GridController) {
    this.gridController = gridController;
    this.mode = "none";
  }

  public build = (entity: Entity, gridPosition: GridPosition) => {
    let actualGridPosition: GridPosition;
    switch (this.mode) {
      case "remove":
        return;
      case "build-horizontal":
        actualGridPosition = [gridPosition[0], this.lastGridPosition[1]];
        if (!this.gridController.isBlocked(actualGridPosition)) {
          this.gridController.place(entity, actualGridPosition);
        }
        return;
      case "build-vertical":
        actualGridPosition = [this.lastGridPosition[0], gridPosition[1]];
        if (!this.gridController.isBlocked(actualGridPosition)) {
          this.gridController.place(entity, actualGridPosition);
        }
        return;
      case "build":
        if (this.gridController.isBlocked(gridPosition)) {
          return;
        } else if (
          gridPosition[0] === this.lastGridPosition[0] &&
          gridPosition[1] === this.lastGridPosition[1]
        ) {
          return;
        } else if (
          gridPosition[0] === this.lastGridPosition[0] &&
          gridPosition[1] !== this.lastGridPosition[1]
        ) {
          this.mode = "build-vertical";
          this.gridController.place(entity, gridPosition);
          this.lastGridPosition = gridPosition;
          return;
        } else if (
          gridPosition[0] !== this.lastGridPosition[0] &&
          gridPosition[1] === this.lastGridPosition[1]
        ) {
          this.mode = "build-horizontal";
          this.gridController.place(entity, gridPosition);
          this.lastGridPosition = gridPosition;
          return;
        } else {
          this.gridController.place(entity, gridPosition);
          this.lastGridPosition = gridPosition;
          return;
        }
      case "none":
      default:
        if (!this.gridController.isBlocked(gridPosition)) {
          this.mode = "build";
          this.gridController.place(entity, gridPosition);
          this.lastGridPosition = gridPosition;
        }
    }
  };

  public isBuilding = (): boolean => {
    return this.mode !== "none";
  };

  public stopBuild = () => {
    this.mode = "none";
  };
}
