import type { Timestamp } from "./animation.controller";
import type { CameraController } from "./camera.controller";
import { Ring } from "./render/ring";
import type { Fluid, WorldPosition } from "./types";

const BOX_WIDTH = 50;
const MAX_BAR_HEIGHT = 200;

export type Consumer = {
  /** The fluid type this consumer is compatible with */
  fluidType: Fluid;

  /** How much room is left */
  capacity: () => number;

  /** try to push to the consumer, return the amount actually pushed */
  push: (amount: number) => number;
}

export type Producer = {

  /** The fluid type this producer is compatible with */
  fluidType: Fluid;

  /** How much is currently in the buffer */
  buffer: () => number;

  /** try to pull from the producer, return the amount actually pulled */
  pull: (amount: number) => number;
}

export class NetworkController {
  private producers: Set<Producer> = new Set();
  private consumers: Set<Consumer> = new Set();
  private fluid: Fluid;
  /** Max flow rate in fluid units per second when supply and demand are both high */
  private maxFlowRate: number;
  private position: WorldPosition;
  private lastFlow = 0;
  private totalFlow = 0;

  public constructor(
    fluid: Fluid,
    position: WorldPosition,
    maxFlowRate = 30,
  ) {
    this.fluid = fluid;
    this.position = position;
    this.maxFlowRate = maxFlowRate;
  }
  
  public addProducer(obj: {producer: Producer}){
    if (obj.producer.fluidType === this.fluid){
      this.producers.add(obj.producer);
    }
  }

  public removeProducer(obj: {producer: Producer}){
    this.producers.delete(obj.producer);
  }

  public addConsumer(obj: {consumer: Consumer}){
    if (obj.consumer.fluidType === this.fluid){
      this.consumers.add(obj.consumer);
    }
  }

  public removeConsumer(obj: {consumer: Consumer}){
    this.consumers.delete(obj.consumer);
  }

  public update(timestamp: Timestamp){
    let totalCapacity = 0;
    for (const consumer of this.consumers){
      totalCapacity += consumer.capacity();
    }

    let totalBuffer = 0;
    for (const producer of this.producers){
      totalBuffer += producer.buffer();
    }

    if (totalCapacity === 0 || totalBuffer === 0){
      this.lastFlow = 0;
      return;
    }

    const dt = timestamp.deltaT / 1000;
    // High when both buffer and capacity are high; low when either is low.
    const coupling =
      (2 * totalBuffer * totalCapacity) / (totalBuffer + totalCapacity);
    const scale = Math.max(totalBuffer, totalCapacity);
    const desiredFlow = this.maxFlowRate * dt * (coupling / scale);
    const flow = Math.min(desiredFlow, totalBuffer, totalCapacity);

    if (flow <= 0) {
      this.lastFlow = 0;
      return;
    }

    this.lastFlow = flow;
    this.totalFlow += flow;

    for (const producer of this.producers) {
      producer.pull(flow * (producer.buffer() / totalBuffer));
    }

    for (const consumer of this.consumers) {
      consumer.push(flow * (consumer.capacity() / totalCapacity));
    }
  }

  public render = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    const fullness = (this.totalFlow % 100) / 100;
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
  };
}