import type { Timestamp } from "../animation.controller";
import type { CameraController } from "../camera.controller";
import { FlowBuffer } from "../flow/FlowBuffer";
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
    this.redInput = new FlowBuffer(150);
    this.blueInput = new FlowBuffer(150);
    this.purpleOutput = new FlowBuffer(150);
  }

  public update = (timestamp: Timestamp) => {
    switch (this.status) {
      case "waiting":
        console.log(
          JSON.stringify({
            redInput: this.redInput.level,
            blueInput: this.blueInput.level,
            redRequired: this.redRequired,
            blueRequired: this.blueRequired,
          }),
        );
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
        console.log(
          JSON.stringify({
            redInput: this.redInput.level,
            blueInput: this.blueInput.level,
            redRequired: this.redRequired,
            blueRequired: this.blueRequired,
            progress: this.progress,
            timeToProcess: this.timeToProcess,
          }),
        );
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
    if (this.status === "waiting") {
      Ring.render(
        context,
        camera,
        this.position,
        {
          inner: 32,
          outer: 38,
        },
        "#333333",
        0,
        2 * Math.PI,
      );
    } else {
      const fullness = this.progress / this.timeToProcess;
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
        "#333333",
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
        "#00FF00",
        start,
        end,
      );
    }
  };
}
