import type { FlowBuffer } from "./flow.buffer";
import { FlowPipe } from "./flow.pipe";

export const DEFAULT_MAX_FLOW_RATE = 50;

const registerBuffer = (
  buffer: FlowBuffer,
  pipe: FlowPipe,
  bufferToPipe: Map<FlowBuffer, FlowPipe>,
) => {
  bufferToPipe.set(buffer, pipe);
};

const registerPipeBuffers = (
  pipe: FlowPipe,
  bufferToPipe: Map<FlowBuffer, FlowPipe>,
) => {
  for (const producer of pipe.getProducers()) {
    registerBuffer(producer, pipe, bufferToPipe);
  }
  for (const consumer of pipe.getConsumers()) {
    registerBuffer(consumer, pipe, bufferToPipe);
  }
};

export const connectBuffers = (
  producer: FlowBuffer,
  consumer: FlowBuffer,
  pipes: FlowPipe[],
  bufferToPipe: Map<FlowBuffer, FlowPipe>,
  maxFlowRate: number = DEFAULT_MAX_FLOW_RATE,
): void => {
  if (producer === consumer) {
    return;
  }

  const pipeA = bufferToPipe.get(producer);
  const pipeB = bufferToPipe.get(consumer);

  if (!pipeA && !pipeB) {
    const pipe = new FlowPipe(maxFlowRate, producer.fluid);
    pipe.addProducer(producer);
    pipe.addConsumer(consumer);
    pipes.push(pipe);
    registerBuffer(producer, pipe, bufferToPipe);
    registerBuffer(consumer, pipe, bufferToPipe);
    return;
  }

  if (pipeA && !pipeB) {
    pipeA.addProducer(producer);
    pipeA.addConsumer(consumer);
    registerBuffer(consumer, pipeA, bufferToPipe);
    return;
  }

  if (!pipeA && pipeB) {
    pipeB.addProducer(producer);
    pipeB.addConsumer(consumer);
    registerBuffer(producer, pipeB, bufferToPipe);
    return;
  }

  if (pipeA && pipeB) {
    if (pipeA === pipeB) {
      pipeA.addProducer(producer);
      pipeA.addConsumer(consumer);
      return;
    }

    pipeA.mergeFrom(pipeB);
    const index = pipes.indexOf(pipeB);
    if (index !== -1) {
      pipes.splice(index, 1);
    }
    registerPipeBuffers(pipeA, bufferToPipe);
  }
};
