import type { Timestamp } from "./animation.controller";
import type { CameraController } from "./camera.controller";

export type WorldPosition = [number, number];
export type WorldSize = [number, number];
export type ScreenPosition = [number, number];
export type ScreenSize = [number, number];
export type GridPosition = [number, number];

export type Fluid = string;

export type PlacedStructure = {
  update: (timestamp: Timestamp) => void;
  render: (context: CanvasRenderingContext2D, camera: CameraController) => void;
  getPosition: () => WorldPosition;
};
