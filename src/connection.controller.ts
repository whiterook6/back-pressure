import type { CameraController } from "./camera.controller";
import { connectBuffers } from "./flow/flow.registry";
import { getProducerFluid, resolveConnection } from "./flow/flow.ports";
import type { FlowPipe } from "./flow/flow.pipe";
import type { Gesture } from "./gestures/interaction.controller";
import type { GridController } from "./grid.controller";
import { FlowLine } from "./render/flow.line";
import type { PlacedStructure, ScreenPosition } from "./types";
import type { FlowBuffer } from "./flow/flow.buffer";

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

export class ConnectionController implements Gesture {
  private gridController: GridController;
  private cameraController: CameraController;
  private pipes: FlowPipe[];
  private onConnectionFinished: () => void;
  private bufferToPipe = new Map<FlowBuffer, FlowPipe>();
  private sourceStructure: PlacedStructure | null = null;
  private isDragging = false;

  constructor(
    gridController: GridController,
    cameraController: CameraController,
    pipes: FlowPipe[],
    onConnectionFinished: () => void,
  ) {
    this.gridController = gridController;
    this.cameraController = cameraController;
    this.pipes = pipes;
    this.onConnectionFinished = onConnectionFinished;
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

  public renderPreview = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    if (!this.isDragging || !this.sourceStructure) {
      return;
    }

    const color = getProducerFluid(this.sourceStructure) ?? "#888888";

    context.save();
    context.globalAlpha = 0.6;
    FlowLine.render(
      context,
      camera,
      this.sourceStructure.getPosition(),
      this.cameraController.mousePosition,
      2,
      color,
    );
    context.restore();
  };

  onMouseDown = (mousePosition: ScreenPosition, mouseButtons: number) => {
    if (isOverDock(mousePosition)) {
      return;
    }

    if (mouseButtons & LEFT_BUTTON) {
      const structure = this.hitTestStructure(mousePosition);
      if (structure) {
        this.sourceStructure = structure;
        this.isDragging = true;
      }
    }
  };

  onMouseMove = (mousePosition: ScreenPosition) => {
    this.cameraController.mousePosition =
      this.cameraController.toWorldPosition(mousePosition);
  };

  onMouseUp = (mousePosition: ScreenPosition) => {
    if (this.isDragging && this.sourceStructure) {
      const targetStructure = this.hitTestStructure(mousePosition);
      if (targetStructure) {
        const connection = resolveConnection(
          this.sourceStructure,
          targetStructure,
        );
        if (connection) {
          connectBuffers(
            connection.producer,
            connection.consumer,
            this.pipes,
            this.bufferToPipe,
          );
        }
      }

      this.sourceStructure = null;
      this.isDragging = false;
      this.onConnectionFinished();
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
