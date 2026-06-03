import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import type { FlowBuffer } from "../flow/flow.buffer";
import { FlowLine } from "../render/flow.line";

const MIN_LINE_THICKNESS = 1;
const MAX_LINE_THICKNESS = 10;

export class FlowPipe {
  private producers: Set<FlowBuffer> = new Set();
  private consumers: Set<FlowBuffer> = new Set();
  private maxFlowRate: number;
  private color: string;
  /** Normalized flow for the current frame, 0–1 relative to maxFlowRate. */
  private frameFlowRatio = 0;

  public constructor(
    maxFlowRate: number,
    color: string,
  ) {
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
    this.frameFlowRatio = 0;
    if (dt <= 0) {
      return;
    }

    const producerAvailability = new Map<FlowBuffer, number>();
    let totalAvailable = 0;
    for (const producer of this.producers) {
      const availableByLevel = producer.level;
      const available = Math.max(0, availableByLevel);
      producerAvailability.set(producer, available);
      totalAvailable += available;
    }

    const consumerDemand = new Map<FlowBuffer, number>();
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

    this.frameFlowRatio = flow / (this.maxFlowRate * dt);

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
    const thickness =
      MIN_LINE_THICKNESS +
      this.frameFlowRatio * (MAX_LINE_THICKNESS - MIN_LINE_THICKNESS);

    for (const producer of this.producers) {
      for (const consumer of this.consumers) {
        FlowLine.render(
          context,
          camera,
          producer.getPosition(),
          consumer.getPosition(),
          thickness,
          this.color,
        );
      }
    }
  };
}
