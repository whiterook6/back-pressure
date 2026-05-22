import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { Consumer } from "../network.controller";
import { Ring } from "../render/ring";
import { Triangle } from "../render/triangle";
import type { Fluid, WorldPosition } from "../types";

export class SinkStructure {
  fluidType: Fluid;
  rate: number;
  maxCapacity: number;
  buffer: number;
  position: WorldPosition;
  public readonly consumer: Consumer;

  constructor(
    fluidType: Fluid,
    rate: number,
    maxCapacity: number,
    position: WorldPosition,
  ) {
    this.fluidType = fluidType;
    this.rate = rate;
    this.maxCapacity = maxCapacity;
    this.buffer = 0;
    this.position = position;
    this.consumer = {
      fluidType: this.fluidType,
      capacity: () => this.maxCapacity - this.buffer,
      push: (amount: number) => {
        if (this.buffer + amount > this.maxCapacity) {
          const pushed = this.maxCapacity - this.buffer;
          this.buffer = this.maxCapacity;
          return pushed;
        } else {
          this.buffer += amount;
          return amount;
        }
      },
    };
  }

  public tick = (timestamp: Timestamp) => {
    if (this.buffer <= 0) {
      this.buffer = 0;
      return;
    }

    const fullness = this.buffer / this.maxCapacity;
    const decrement = this.rate * (timestamp.deltaT / 1000) * fullness;
    this.buffer = Math.max(this.buffer - decrement, 0);
  };

  public render = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    const fullness = this.buffer / this.maxCapacity;
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
      "#333",
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
      "#cccccc",
      start,
      end,
    );

    Triangle.render(context, camera, this.position, "#ff0000", 25);
  };
}
