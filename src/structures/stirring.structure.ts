import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import { FlowBuffer } from "../flow/flow.buffer";
import { Ring } from "../render/ring";
import type { WorldPosition } from "../types";

export class StirringPlantStructure {
  position: WorldPosition;

  redInput: FlowBuffer;
  blueInput: FlowBuffer;
  purpleOutput: FlowBuffer;

  progress: number = 0;
  timeToProcess: number = 10;
  redRequired: number = 100;
  blueRequired: number = 100;
  purpleProduced: number = 100;
  status: "waiting" | "processing" = "waiting";

  constructor(position: WorldPosition) {
    this.position = position;
    this.redInput = new FlowBuffer(100);
    this.blueInput = new FlowBuffer(100);
    this.purpleOutput = new FlowBuffer(150);
  }

  public update = (timestamp: Timestamp) => {
    switch (this.status) {
      case "waiting":
        if (
          this.redInput.level >= this.redRequired &&
          this.blueInput.level >= this.blueRequired
        ) {
          this.status = "processing";
          this.progress = 0;
          this.blueInput.level -= this.blueRequired;
          this.redInput.level -= this.redRequired;
        }
        break;
      case "processing":
        if (this.progress >= this.timeToProcess) {
          if (
            this.purpleOutput.level + this.purpleProduced >
            this.purpleOutput.capacity
          ) {
            return;
          } else {
            this.purpleOutput.level += this.purpleProduced;
            this.status = "waiting";
          }
        } else {
          this.progress += timestamp.deltaT / 1000;
        }
        break;
    }
  };

  public render = (
    context: CanvasRenderingContext2D,
    camera: CameraController,
  ) => {
    Ring.renderPercentage(
      context,
      camera,
      this.position,
      {
        inner: 20,
        outer: 25,
      },
      "#0000ff",
      this.blueInput.level / this.blueRequired
    );
    Ring.renderPercentage(
      context,
      camera,
      this.position,
      {
        inner: 25,
        outer: 30,
      },
      "#ff0000",
      this.redInput.level / this.redRequired
    );
    Ring.renderPercentage(
      context,
      camera,
      this.position,
      {
        inner: 35,
        outer: 40,
      },
      "#FF00FF",
      this.purpleOutput.level / this.purpleOutput.capacity
    );
    if (this.status === "waiting") {
      Ring.render(
        context,
        camera,
        this.position,
        {
          inner: 30,
          outer: 35,
        },
        "#333333",
        0,
        2 * Math.PI,
      );
    } else {
      Ring.renderPercentage(
        context,
        camera,
        this.position,
        {
          inner: 30,
          outer: 35,
        },
        "#00FF00",
        this.progress / this.timeToProcess
      )
    }
  };
}
