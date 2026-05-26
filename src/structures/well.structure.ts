import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { WorldPosition } from "../types";
import { Ring } from "../render/ring";
import { Triangle } from "../render/triangle";
import { FlowBuffer } from "../flow/FlowBuffer";

export class WellStructure {
  color: string;
  rate: number;
  position: WorldPosition;
  buffer: FlowBuffer;

  constructor(
    color: string,
    /** In units per second */
    rate: number,
    /** In units */
    maxBuffer: number,
    position: WorldPosition,
  ) {
    this.color = color;
    this.position = position;
    this.rate = rate;
    this.buffer = new FlowBuffer(maxBuffer);
  }

  public update = (timestamp: Timestamp) => {
    const headroom =
      (this.buffer.capacity - this.buffer.level) / this.buffer.capacity;
    const increment = this.rate * (timestamp.deltaT / 1000) * headroom;
    this.buffer.push(increment);
  };

  public render = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    const fullness = this.buffer.level / this.buffer.capacity;
    const start = -Math.PI / 2;
    const end = start + fullness * 2 * Math.PI;
    Ring.render(
      context,
      camera,
      this.position,
      {
        inner: 32,
        outer: 38,
      },
      "#333333",
      end,
      start,
    );
    Ring.render(
      context,
      camera,
      this.position,
      {
        inner: 30,
        outer: 40,
      },
      this.color,
      start,
      end,
    );

    Triangle.render(context, camera, this.position, "#00FF00", 25);
  };
}
