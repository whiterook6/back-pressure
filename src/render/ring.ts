import type { CameraController } from "../camera.controller";
import type { WorldPosition } from "../types";

export const Ring = {
  render: (
    context: CanvasRenderingContext2D,
    camera: CameraController,
    worldPosition: WorldPosition,

    /**
     * the radius of the ring in world units
     */
    radius: {
      inner: number;
      outer: number;
    },

    color: string,
    start: number,
    end: number,
  ) => {
    const [x, y] = camera.toScreenPosition(worldPosition);
    const innerRadius = Math.min(
      camera.scale(radius.inner),
      camera.scale(radius.outer),
    );
    const outerRadius = Math.max(
      camera.scale(radius.inner),
      camera.scale(radius.outer),
    );

    const fillRing = (
      color: string,
      startAngle?: number,
      endAngle?: number,
    ) => {
      context.fillStyle = color;
      context.beginPath();

      const isFullRing =
        startAngle === undefined ||
        endAngle === undefined ||
        endAngle - startAngle >= Math.PI * 2;

      if (isFullRing) {
        context.arc(x, y, outerRadius, 0, Math.PI * 2);
        context.arc(x, y, innerRadius, 0, Math.PI * 2, true);
        context.fill("evenodd");
        return;
      }

      context.arc(x, y, outerRadius, startAngle, endAngle);
      context.arc(x, y, innerRadius, endAngle, startAngle, true);
      context.closePath();
      context.fill();
    };

    fillRing(color, start, end);
  },

  renderPercentage: (
    context: CanvasRenderingContext2D,
    camera: CameraController,
    worldPosition: WorldPosition,
    radius: { inner: number, outer: number },
    color: string,

    /** 0-1 */
    percentage: number
  ) => {
    const start = -Math.PI / 2;
    const end = start + percentage * 2 * Math.PI;
    Ring.render(
      context,
      camera,
      worldPosition,
      {
        inner: radius.inner,
        outer: radius.outer,
      },
      "#333333",
      end,
      start,
    );
    Ring.render(
      context,
      camera,
      worldPosition,
      {
        inner: radius.inner,
        outer: radius.outer,
      },
      color,
      start,
      end,
    );
  },
};
