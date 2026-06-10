import type { CameraController } from "../camera.controller";
import type { WorldPosition } from "../types";

export const Triangle = {
  render: (
    context: CanvasRenderingContext2D,
    camera: CameraController,
    position: WorldPosition,

    color: string,
    radius: number,
    /** in radians */
    rotation: number = 0,
  ) => {
    const [screenX, screenY] = camera.toScreenPosition(position);
    const r = camera.scale(radius);

    context.fillStyle = color;
    context.beginPath();

    const angles = [
      -Math.PI / 2 + rotation,
      Math.PI / 6 + rotation,
      (5 * Math.PI) / 6 + rotation,
    ];
    for (let i = 0; i < angles.length; i++) {
      const vx = screenX + r * Math.cos(angles[i]);
      const vy = screenY + r * Math.sin(angles[i]);
      if (i === 0) {
        context.moveTo(vx, vy);
      } else {
        context.lineTo(vx, vy);
      }
    }

    context.closePath();
    context.fill();
  },
};
