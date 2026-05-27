import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { FlowBuffer } from "../flow/flow.buffer";
import { Ring } from "../render/ring";
import type { WorldPosition } from "../types";

export class FlowPipe {
  private producers: Set<FlowBuffer> = new Set();
  private consumers: Set<FlowBuffer> = new Set();
  private maxFlowRate: number;
  private color: string;
  private position: WorldPosition;
  private totalFlow = 0;

  public constructor(position: WorldPosition, maxFlowRate: number, color: string) {
    this.position = position;
    this.maxFlowRate = maxFlowRate;
    this.color = color;
  }

  public addProducer(producer: FlowBuffer) {
    this.producers.add(producer);
  }

  public removeProducer(producer: FlowBuffer) {
    this.producers.delete(producer);
  }

  public addConsumer(consumer: FlowBuffer) {
    this.consumers.add(consumer);
  }

  public removeConsumer(consumer: FlowBuffer) {
    this.consumers.delete(consumer);
  }

  public update(timestamp: Timestamp) {
    const dt = timestamp.deltaT / 1000;
    if (dt <= 0) {
      return;
    }

    const producerAvailability = new Map<
      FlowBuffer,
      number
    >();
    let totalAvailable = 0;
    for (const producer of this.producers) {
      const availableByLevel = producer.level;
      const available = Math.max(0, availableByLevel);
      producerAvailability.set(producer, available);
      totalAvailable += available;
    }

    const consumerDemand = new Map<
      FlowBuffer,
      number
    >();
    let totalDemand = 0;
    for (const consumer of this.consumers) {
      const headroom = Math.max(0, consumer.capacity - consumer.level);
      const demand = Math.max(0, headroom);
      consumerDemand.set(consumer, demand);
      totalDemand += demand;
    }

    if (totalAvailable <= 0 || totalDemand <= 0) {
      return;
    }

    const flow = Math.min(this.maxFlowRate * dt, totalAvailable, totalDemand);

    if (flow <= 0) {
      return;
    }

    this.totalFlow += flow;

    let gathered = 0;
    for (const [producer, available] of producerAvailability) {
      if (available <= 0) {
        continue;
      }
      gathered += producer.pull(flow * (available / totalAvailable));
    }

    if (gathered <= 0) {
      return;
    }

    for (const [consumer, demand] of consumerDemand) {
      if (demand <= 0) {
        continue;
      }
      consumer.push(gathered * (demand / totalDemand));
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
      this.color,
      start,
      end,
    );
  };
}
