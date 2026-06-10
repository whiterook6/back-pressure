import type { FlowBuffer } from "./flow.buffer";
import { SinkStructure } from "../structures/sink.structure";
import { StirringPlantStructure } from "../structures/stirring.structure";
import { WellStructure } from "../structures/well.structure";
import type { PlacedStructure } from "../types";

export type FlowEndpoint = {
  buffer: FlowBuffer;
  role: "producer" | "consumer";
};

export const getEndpoints = (structure: PlacedStructure): FlowEndpoint[] => {
  if (structure instanceof WellStructure) {
    return [{ buffer: structure.buffer, role: "producer" }];
  }

  if (structure instanceof SinkStructure) {
    return [{ buffer: structure.buffer, role: "consumer" }];
  }

  if (structure instanceof StirringPlantStructure) {
    return [
      { buffer: structure.redInput, role: "consumer" },
      { buffer: structure.blueInput, role: "consumer" },
      { buffer: structure.purpleOutput, role: "producer" },
    ];
  }

  return [];
};

export const getProducerFluid = (
  structure: PlacedStructure,
): string | null => {
  const producer = getEndpoints(structure).find(
    (endpoint) => endpoint.role === "producer",
  );
  return producer?.buffer.fluid ?? null;
};

export const resolveConnection = (
  a: PlacedStructure,
  b: PlacedStructure,
): { producer: FlowBuffer; consumer: FlowBuffer } | null => {
  if (a === b) {
    return null;
  }

  const endpointsA = getEndpoints(a);
  const endpointsB = getEndpoints(b);

  for (const endpointA of endpointsA) {
    for (const endpointB of endpointsB) {
      if (
        endpointA.role === "producer" &&
        endpointB.role === "consumer" &&
        endpointA.buffer.fluid === endpointB.buffer.fluid
      ) {
        return { producer: endpointA.buffer, consumer: endpointB.buffer };
      }

      if (
        endpointA.role === "consumer" &&
        endpointB.role === "producer" &&
        endpointA.buffer.fluid === endpointB.buffer.fluid
      ) {
        return { producer: endpointB.buffer, consumer: endpointA.buffer };
      }
    }
  }

  return null;
};
