import type { CameraController } from "../camera.controller";
import type { WorldPosition } from "../types";

export const FlowLine = {
  render: (
    context: CanvasRenderingContext2D,
    camera: CameraController,
    start: WorldPosition,
    end: WorldPosition,
    thickness: number,
    color: string,
  ) => {
    const [startX, startY] = camera.toScreenPosition(start);
    const [endX, endY] = camera.toScreenPosition(end);
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = thickness;
    context.strokeStyle = color;
    context.stroke();
  },
};
