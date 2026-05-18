import type { Timestamp } from "../animation.controller";
import type { Consumer } from "../network.controller";
import type { Fluid } from "../types";

export class SinkStructure {
  fluidType: Fluid;
  rate: number;
  maxCapacity: number;
  buffer: number;
  public readonly consumer: Consumer;

  constructor(
    fluidType: Fluid,
    rate: number,
    maxCapacity: number,
  ) {
    this.fluidType = fluidType;
    this.rate = rate;
    this.maxCapacity = maxCapacity;
    this.buffer = 0;
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
    console.log(`Decrement: ${decrement}, Buffer: ${this.buffer}`);
  };
}
