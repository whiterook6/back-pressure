import type { Timestamp } from "../animation.controller";
import type { Producer } from "../network.controller";
import type { Fluid } from "../types";

export class WellStructure {
  fluidType: Fluid;
  rate: number;
  maxBuffer: number;
  buffer: number = 0;
  public readonly producer: Producer;

  constructor(
    fluidType: Fluid,
    rate: number,
    maxBuffer: number,
  ) {
    this.fluidType = fluidType;
    this.rate = rate;
    this.maxBuffer = maxBuffer;
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
    console.log(`Increment: ${increment}, Buffer: ${this.buffer}`);
  };
}
