import type { Gesture } from "./gestures/interaction.controller";
import type { ScreenPosition, ScreenSize, WorldPosition, WorldSize } from "./types";

export class CameraController implements Gesture {
  /** World position at the center of the viewport */
  worldX = 0;
  worldY = 0;
  pixelsPerWorldUnit = 1;
  screenWidth = window?.innerWidth || 0;
  screenHeight = window?.innerHeight || 0;

  // gesture controls
  mousePosition: WorldPosition;
  isPanning = false;

  watchResize = () => {
    const resize = () => {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    };
    resize();

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  };

  /**
   * given a size in world units, return the size in screen units
   */
  scale = (length: number): number => {
    return length * this.pixelsPerWorldUnit;
  };

  setViewportSize = ([width, height]: [number, number]): void => {
    this.screenWidth = width;
    this.screenHeight = height;
  };

  toScreenPosition = ([worldX, worldY]: [number, number]): [number, number] => {
    const z = this.pixelsPerWorldUnit;
    const halfW = this.screenWidth / 2;
    const halfH = this.screenHeight / 2;
    return [
      (worldX - this.worldX) * z + halfW,
      (worldY - this.worldY) * z + halfH,
    ];
  };

  toScreenSize = (worldSize: WorldSize): ScreenSize => {
    return [
      worldSize[0] * this.pixelsPerWorldUnit,
      worldSize[1] * this.pixelsPerWorldUnit,
    ];
  };

  toWorldPosition = ([screenX, screenY]: [number, number]): [
    number,
    number,
  ] => {
    const z = this.pixelsPerWorldUnit;
    const halfW = this.screenWidth / 2;
    const halfH = this.screenHeight / 2;
    return [
      (screenX - halfW) / z + this.worldX,
      (screenY - halfH) / z + this.worldY,
    ];
  };

  toWorldSize = (screenSize: ScreenSize): WorldSize => {
    return [
      screenSize[0] / this.pixelsPerWorldUnit,
      screenSize[1] / this.pixelsPerWorldUnit,
    ];
  };

  pan = ([dScreenX, dScreenY]: [number, number]): void => {
    const z = this.pixelsPerWorldUnit;
    this.worldX -= dScreenX / z;
    this.worldY -= dScreenY / z;
  };

  zoom = (mousePosition: ScreenPosition, dZoom: number): void => {
    const [screenX, screenY] = mousePosition;
    const [worldX, worldY] = this.toWorldPosition(mousePosition);
    this.pixelsPerWorldUnit *= Math.pow(2, dZoom);
    const z = this.pixelsPerWorldUnit;
    const halfW = this.screenWidth / 2;
    const halfH = this.screenHeight / 2;
    this.worldX = worldX - (screenX - halfW) / z;
    this.worldY = worldY - (screenY - halfH) / z;
  };

  // gesture handlers
  onMouseDown = () => {
    this.isPanning = true;
  }

  onMouseUp = () => {
    this.isPanning = false;
  }

  onMouseMove = (mouseScreenPosition: ScreenPosition, _mouseButtons: number, delta: ScreenPosition) => {
    this.mousePosition = this.toWorldPosition(mouseScreenPosition);
    if (this.isPanning) {
      this.pan(delta);
    }
  }

  onWheel = (mouseScreenPosition: ScreenPosition, _mouseButtons: number, delta: number) => {
    this.zoom(mouseScreenPosition, delta * 0.001);
  }
}
