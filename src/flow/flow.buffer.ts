import type { WorldPosition } from "../types";

export class FlowBuffer {
  fluid: string;
  level: number;
  capacity: number;
  anchor: {
    getPosition: () => WorldPosition;
  };

  constructor(
    fluid: string,
    /** In units, not percentages */
    capacity: number,

    /** In units, not percentages */
    initialLevel: number = 0,
    anchor: {
      getPosition: () => WorldPosition;
    },
  ) {
    this.fluid = fluid;
    this.capacity = Math.max(0, capacity);
    this.level = Math.max(0, Math.min(initialLevel, capacity));
    this.anchor = anchor;
  }

  push(amount: number) {
    if (this.level + amount > this.capacity) {
      const pushed = this.capacity - this.level;
      this.level = this.capacity;
      return pushed;
    } else {
      this.level += amount;
      return amount;
    }
  }

  pull(amount: number) {
    if (this.level >= amount) {
      this.level -= amount;
      return amount;
    } else {
      const pulled = this.level;
      this.level = 0;
      return pulled;
    }
  }

  public getPosition = (): WorldPosition => {
    return this.anchor.getPosition();
  };
}
