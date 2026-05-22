import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { Consumer } from "../network.controller";
import type { Fluid, WorldPosition } from "../types";

const BOX_WIDTH = 50;
const MAX_BAR_HEIGHT = 200;

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
        if (this.buffer + amount > this.maxCapacity){
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
    const [screenX, screenY] = camera.toScreenPosition(this.position);
    const height = (this.buffer / this.maxCapacity) * MAX_BAR_HEIGHT;
    context.fillStyle = "#2c5f8a";
    context.fillRect(
      screenX - BOX_WIDTH / 2,
      screenY - height,
      BOX_WIDTH,
      height,
    );
  };
}
