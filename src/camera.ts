export class CameraController {
  /** World position at the center of the viewport */
  worldX = 0;
  worldY = 0;
  pixelsPerWorldUnit = 1;
  screenWidth = window?.innerWidth || 0;
  screenHeight = window?.innerHeight || 0;

  watchResize = () => {
    const resize = () => {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    };
    resize();
    
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  };

  setViewportSize = ([width, height]: [number, number]): void => {
    this.screenWidth = width;
    this.screenHeight = height;
  };

  toScreen = ([worldX, worldY]: [number, number]): [number, number] => {
    const z = this.pixelsPerWorldUnit;
    const halfW = this.screenWidth / 2;
    const halfH = this.screenHeight / 2;
    return [
      (worldX - this.worldX) * z + halfW,
      (worldY - this.worldY) * z + halfH,
    ];
  };

  toWorld = ([screenX, screenY]: [number, number]): [number, number] => {
    const z = this.pixelsPerWorldUnit;
    const halfW = this.screenWidth / 2;
    const halfH = this.screenHeight / 2;
    return [
      (screenX - halfW) / z + this.worldX,
      (screenY - halfH) / z + this.worldY,
    ];
  };

  pan = ([dScreenX, dScreenY]: [number, number]): void => {
    const z = this.pixelsPerWorldUnit;
    this.worldX -= dScreenX / z;
    this.worldY -= dScreenY / z;
  };

  zoom = (dZoom: number): void => {
    this.pixelsPerWorldUnit *= Math.pow(2, dZoom);
  };
}
