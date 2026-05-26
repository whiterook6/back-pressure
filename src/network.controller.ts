import type { Timestamp } from "./animation.controller";
import type { CameraController } from "./camera.controller";
import type { FlowBuffer } from "./flow/FlowBuffer";
import { Ring } from "./render/ring";
import type { WorldPosition } from "./types";

export class NetworkController {
  private producers: Set<FlowBuffer> = new Set();
  private consumers: Set<FlowBuffer> = new Set();
  private maxFlowRate: number;
  private position: WorldPosition;
  private totalFlow = 0;

  public constructor(position: WorldPosition, maxFlowRate = 5) {
    this.position = position;
    this.maxFlowRate = maxFlowRate;
  }

  public addProducer(obj: { producer: FlowBuffer }) {
    this.producers.add(obj.producer);
  }

  public removeProducer(obj: { producer: FlowBuffer }) {
    this.producers.delete(obj.producer);
  }

  public addConsumer(obj: { consumer: FlowBuffer }) {
    this.consumers.add(obj.consumer);
  }

  public removeConsumer(obj: { consumer: FlowBuffer }) {
    this.consumers.delete(obj.consumer);
  }

  public update(timestamp: Timestamp) {
    let totalHeadroom = 0;
    for (const consumer of this.consumers) {
      totalHeadroom += consumer.capacity - consumer.level;
    }

    let totalFluid = 0;
    for (const producer of this.producers) {
      totalFluid += producer.level;
    }

    if (totalHeadroom === 0 || totalFluid === 0) {
      return;
    }

    const dt = timestamp.deltaT / 1000;
    // High when both supply and demand headroom are high; low when either is low.
    const coupling =
      (2 * totalFluid * totalHeadroom) / (totalFluid + totalHeadroom);
    const scale = Math.max(totalFluid, totalHeadroom);
    const desiredFlow = this.maxFlowRate * dt * (coupling / scale);
    const flow = Math.min(desiredFlow, totalFluid, totalHeadroom);

    if (flow <= 0) {
      return;
    }

    this.totalFlow += flow;

    for (const producer of this.producers) {
      producer.pull(flow * (producer.level / totalFluid));
    }

    for (const consumer of this.consumers) {
      const headroom = consumer.capacity - consumer.level;
      consumer.push(flow * (headroom / totalHeadroom));
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
