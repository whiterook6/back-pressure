import type { CameraController } from "./camera.controller";
import { STRUCTURE_FOOTPRINT } from "./dock.controller";
import type { Gesture } from "./gestures/interaction.controller";
import { toCenter, type GridController } from "./grid.controller";
import { SinkStructure } from "./structures/sink.structure";
import { StirringPlantStructure } from "./structures/stirring.structure";
import { WellStructure } from "./structures/well.structure";
import type {
  GridPosition,
  PlacedStructure,
  ScreenPosition,
  WorldPosition,
} from "./types";

const LEFT_BUTTON = 1;
const STRUCTURE_HIT_RADIUS = 40;

const isOverDock = (screenPosition: ScreenPosition): boolean => {
  const dock = document.getElementById("dock");
  if (!dock) {
    return false;
  }
  const rect = dock.getBoundingClientRect();
  const [x, y] = screenPosition;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

const setStructurePosition = (
  structure: PlacedStructure,
  position: WorldPosition,
) => {
  if (
    structure instanceof WellStructure ||
    structure instanceof SinkStructure ||
    structure instanceof StirringPlantStructure
  ) {
    structure.position = position;
  }
};

const gridPositionsEqual = (a: GridPosition, b: GridPosition): boolean => {
  return a[0] === b[0] && a[1] === b[1];
};

export class MoveController implements Gesture {
  private gridController: GridController;
  private cameraController: CameraController;
  private onMoveFinished: () => void;
  private movingStructure: PlacedStructure | null = null;
  private originGridPosition: GridPosition | null = null;
  private lastValidGridPosition: GridPosition | null = null;
  private isDragging = false;

  constructor(
    gridController: GridController,
    cameraController: CameraController,
    onMoveFinished: () => void,
  ) {
    this.gridController = gridController;
    this.cameraController = cameraController;
    this.onMoveFinished = onMoveFinished;
  }

  private hitTestStructure = (
    screenPosition: ScreenPosition,
  ): PlacedStructure | null => {
    const world = this.cameraController.toWorldPosition(screenPosition);
    let nearest: PlacedStructure | null = null;
    let nearestDistance = Infinity;

    for (const { structure } of this.gridController.getEntities()) {
      const [sx, sy] = structure.getPosition();
      const [wx, wy] = world;
      const distance = Math.hypot(wx - sx, wy - sy);

      if (distance <= STRUCTURE_HIT_RADIUS && distance < nearestDistance) {
        nearest = structure;
        nearestDistance = distance;
      }
    }

    return nearest;
  };

  private commitMove = () => {
    if (
      !this.movingStructure ||
      !this.originGridPosition ||
      !this.lastValidGridPosition
    ) {
      return;
    }

    if (
      gridPositionsEqual(this.lastValidGridPosition, this.originGridPosition)
    ) {
      return;
    }

    this.gridController.move(this.movingStructure, this.lastValidGridPosition);
    setStructurePosition(
      this.movingStructure,
      toCenter(this.lastValidGridPosition, STRUCTURE_FOOTPRINT),
    );
  };

  public renderPreview = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    if (
      !this.isDragging ||
      !this.movingStructure ||
      !this.lastValidGridPosition
    ) {
      return;
    }

    const ghostCenter = toCenter(
      this.lastValidGridPosition,
      STRUCTURE_FOOTPRINT,
    );
    const originalPosition = this.movingStructure.getPosition();

    setStructurePosition(this.movingStructure, ghostCenter);
    context.save();
    context.globalAlpha = 0.6;
    this.movingStructure.render(context, camera);
    context.restore();
    setStructurePosition(this.movingStructure, originalPosition);
  };

  onMouseDown = (mousePosition: ScreenPosition, mouseButtons: number) => {
    if (isOverDock(mousePosition)) {
      return;
    }

    if (mouseButtons & LEFT_BUTTON) {
      const structure = this.hitTestStructure(mousePosition);
      if (structure) {
        const gridPosition = this.gridController.getGridPosition(structure);
        if (gridPosition) {
          this.movingStructure = structure;
          this.originGridPosition = gridPosition;
          this.lastValidGridPosition = gridPosition;
          this.isDragging = true;
        }
      }
    }
  };

  onMouseMove = (mousePosition: ScreenPosition) => {
    this.cameraController.mousePosition =
      this.cameraController.toWorldPosition(mousePosition);

    if (this.isDragging && this.movingStructure) {
      const snapped = this.gridController.snapToGrid(
        this.cameraController.mousePosition,
        STRUCTURE_FOOTPRINT,
      ) as GridPosition;

      if (
        !this.gridController.isBlockedExcept(snapped, this.movingStructure)
      ) {
        this.lastValidGridPosition = snapped;
      }
    }
  };

  onMouseUp = () => {
    if (this.isDragging) {
      this.commitMove();
      this.movingStructure = null;
      this.originGridPosition = null;
      this.lastValidGridPosition = null;
      this.isDragging = false;
      this.onMoveFinished();
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
