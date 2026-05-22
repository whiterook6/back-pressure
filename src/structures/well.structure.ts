import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { Producer } from "../network.controller";
import type { Fluid, WorldPosition } from "../types";

const BOX_WIDTH = 50;
const MAX_BAR_HEIGHT = 200;

export class WellStructure {
  fluidType: Fluid;
  rate: number;
  maxBuffer: number;
  buffer: number = 0;
  position: WorldPosition;
  public readonly producer: Producer;

  constructor(
    fluidType: Fluid,
    rate: number,
    maxBuffer: number,
    position: WorldPosition,
  ) {
    this.fluidType = fluidType;
    this.rate = rate;
    this.maxBuffer = maxBuffer;
    this.position = position;
    this.producer = {
      fluidType: this.fluidType,
      buffer: () => this.buffer,
      pull: (amount: number) => {
        if (this.buffer >= amount){
          this.buffer -= amount;
          return amount;
        } else {
          const pulled = this.buffer;
          this.buffer = 0;
          return pulled;
        }
      },
    };
  }

  public tick = (timestamp: Timestamp) => {
    if (this.buffer >= this.maxBuffer) {
      this.buffer = this.maxBuffer;
      return;
    }

    const headroom = (this.maxBuffer - this.buffer) / this.maxBuffer;
    const increment = this.rate * (timestamp.deltaT / 1000) * headroom;
    this.buffer = Math.min(this.buffer + increment, this.maxBuffer);
  };

  public render = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    const [screenX, screenY] = camera.toScreenPosition(this.position);
    const height = (this.buffer / this.maxBuffer) * MAX_BAR_HEIGHT;
    context.fillStyle = "#4a90d9";
    context.fillRect(
      screenX - BOX_WIDTH / 2,
      screenY - height,
      BOX_WIDTH,
      height,
    );
  };
}
