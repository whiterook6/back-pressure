import type { CameraController } from "./camera.controller";
import type { DockItem } from "./dock.controller";
import type { Gesture } from "./gestures/interaction.controller";
import { toCenter, type GridController } from "./grid.controller";
import type { GridPosition, PlacedStructure, ScreenPosition } from "./types";

type Mode = "build" | "build-horizontal" | "build-vertical" | "remove" | "none";

const LEFT_BUTTON = 1;

const isOverDock = (screenPosition: ScreenPosition): boolean => {
  const dock = document.getElementById("dock");
  if (!dock) {
    return false;
  }
  const rect = dock.getBoundingClientRect();
  const [x, y] = screenPosition;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

export class BuildingController implements Gesture {
  private mode: Mode;
  private gridController: GridController;
  private cameraController: CameraController;
  private onPlaced: (structure: PlacedStructure) => void;
  private onBuildFinished: () => void;
  private activeItem: DockItem | null = null;
  private lastGridPosition: GridPosition = [0, 0];

  constructor(
    gridController: GridController,
    cameraController: CameraController,
    onPlaced: (structure: PlacedStructure) => void,
    onBuildFinished: () => void,
  ) {
    this.gridController = gridController;
    this.cameraController = cameraController;
    this.onPlaced = onPlaced;
    this.onBuildFinished = onBuildFinished;
    this.mode = "none";
  }

  public setActiveItem = (item: DockItem | null) => {
    this.activeItem = item;
  };

  private snapGridPosition = (
    screenPosition: ScreenPosition,
  ): GridPosition | null => {
    if (!this.activeItem?.footprint) {
      return null;
    }
    const world = this.cameraController.toWorldPosition(screenPosition);
    return this.gridController.snapToGrid(world, this.activeItem.footprint);
  };

  private placeAt = (gridPosition: GridPosition) => {
    if (!this.activeItem?.footprint || !this.activeItem.create) {
      return;
    }
    const center = toCenter(gridPosition, this.activeItem.footprint);
    const structure = this.activeItem.create(center);
    this.gridController.place(structure, gridPosition);
    this.onPlaced(structure);
  };

  public build = (gridPosition: GridPosition) => {
    if (!this.activeItem) {
      return;
    }

    let actualGridPosition: GridPosition;
    switch (this.mode) {
      case "remove":
        return;
      case "build-horizontal":
        actualGridPosition = [gridPosition[0], this.lastGridPosition[1]];
        if (!this.gridController.isBlocked(actualGridPosition)) {
          this.placeAt(actualGridPosition);
        }
        return;
      case "build-vertical":
        actualGridPosition = [this.lastGridPosition[0], gridPosition[1]];
        if (!this.gridController.isBlocked(actualGridPosition)) {
          this.placeAt(actualGridPosition);
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
          this.placeAt(gridPosition);
          this.lastGridPosition = gridPosition;
          return;
        } else if (
          gridPosition[0] !== this.lastGridPosition[0] &&
          gridPosition[1] === this.lastGridPosition[1]
        ) {
          this.mode = "build-horizontal";
          this.placeAt(gridPosition);
          this.lastGridPosition = gridPosition;
          return;
        } else {
          this.placeAt(gridPosition);
          this.lastGridPosition = gridPosition;
          return;
        }
      case "none":
      default:
        if (!this.gridController.isBlocked(gridPosition)) {
          this.mode = "build";
          this.placeAt(gridPosition);
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

  onMouseDown = (mousePosition: ScreenPosition, mouseButtons: number) => {
    if (isOverDock(mousePosition)) {
      return;
    }

    if (mouseButtons & LEFT_BUTTON) {
      const gridPosition = this.snapGridPosition(mousePosition);
      if (gridPosition) {
        this.build(gridPosition);
      }
    }
  };

  onMouseMove = (mousePosition: ScreenPosition, mouseButtons: number) => {
    this.cameraController.mousePosition =
      this.cameraController.toWorldPosition(mousePosition);

    if (mouseButtons & LEFT_BUTTON) {
      if (this.isBuilding()) {
        const gridPosition = this.snapGridPosition(mousePosition);
        if (gridPosition) {
          this.build(gridPosition);
        }
      }
    }
  };

  onMouseUp = () => {
    const hadActivePlacement = this.mode !== "none";
    this.stopBuild();
    if (hadActivePlacement) {
      this.onBuildFinished();
    }
  };

  onWheel = (
    mousePosition: ScreenPosition,
    mouseButtons: number,
    delta: number,
  ) => {
    this.cameraController.onWheel?.(mousePosition, mouseButtons, delta);
  };
}
