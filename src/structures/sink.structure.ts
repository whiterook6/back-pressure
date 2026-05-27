import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { WorldPosition } from "../types";
import { Ring } from "../render/ring";
import { Triangle } from "../render/triangle";
import { FlowBuffer } from "../flow/flow.buffer";

export class SinkStructure {
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
    this.buffer = new FlowBuffer(maxBuffer, 0, this);
  }

  public getPosition = (): WorldPosition => {
    return this.position;
  };

  public update = (timestamp: Timestamp) => {
    if (this.buffer.level <= 0) {
      this.buffer.level = 0;
      return;
    }

    const fullness = this.buffer.level / this.buffer.capacity;
    const decrement = this.rate * (timestamp.deltaT / 1000) * fullness;
    this.buffer.pull(decrement);
  };

  public render = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    const fullness = this.buffer.level / this.buffer.capacity;
    Ring.renderPercentage(
      context,
      camera,
      this.position,
      {
        inner: 30,
        outer: 40,
      },
      this.color,
      fullness,
    );

    Triangle.render(context, camera, this.position, "#FF00FF", 25);
  };
}
