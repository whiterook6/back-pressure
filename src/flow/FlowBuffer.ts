export class FlowBuffer {
  level: number;
  capacity: number;

  constructor(
    /** In units, not percentages */
    capacity: number,

    /** In units, not percentages */
    initialLevel: number = 0,
  ) {
    this.capacity = Math.max(0, capacity);
    this.level = Math.max(0, Math.min(initialLevel, capacity));
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
}
