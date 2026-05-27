import { AnimationController, type Timestamp } from "./animation.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { FlowPipe } from "./flow/flow.pipe";
import { SinkStructure } from "./structures/sink.structure";
import { StirringPlantStructure } from "./structures/stirring.structure";
import { WellStructure } from "./structures/well.structure";
import "./style.css";
import type { ScreenPosition, WorldPosition } from "./types";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

const pipes: FlowPipe[] = [];
const structures: Array<{
  update: (timestamp: Timestamp) => void;
  render: (context: CanvasRenderingContext2D, camera: CameraController) => void;
}> = [];

const redFluidSource = new WellStructure("#ff0000", 30, 50, [-120, 60]);
const blueFluidSource = new WellStructure("#0000ff", 15, 100, [-120, -60]);
const stirringPlants = [
  new StirringPlantStructure([0, -75]),
  new StirringPlantStructure([0, 0]),
  new StirringPlantStructure([0, 75]),
];
const purpleSink = new SinkStructure("#ff00ff", 10, 100, [100, 0]);

const redPipe = new FlowPipe([0, 0], 20, "#ff0000");
redPipe.addProducer(redFluidSource.buffer);
for (const stirringPlant of stirringPlants) {
  redPipe.addConsumer(stirringPlant.redInput);
}

const bluePipe = new FlowPipe([0, 0], 20, "#0000ff");
bluePipe.addProducer(blueFluidSource.buffer);
for (const stirringPlant of stirringPlants) {
  bluePipe.addConsumer(stirringPlant.blueInput);
}

const purplePipe = new FlowPipe([0, 0], 20, "#ff00ff");
for (const stirringPlant of stirringPlants) {
  purplePipe.addProducer(stirringPlant.purpleOutput);
}
purplePipe.addConsumer(purpleSink.buffer);

pipes.push(redPipe, bluePipe, purplePipe);
structures.push(redFluidSource, blueFluidSource, ...stirringPlants, purpleSink);

const mouse = {
  world: [0, 0] as WorldPosition,
  screen: [0, 0] as ScreenPosition,
  isInBounds: false,
};

window.addEventListener("mousemove", (event) => {
  mouse.screen = [event.clientX, event.clientY];
  mouse.world = cameraController.toWorldPosition(mouse.screen);
  mouse.isInBounds = true;
});

window.addEventListener("mouseleave", () => {
  mouse.isInBounds = false;
});

window.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    cameraController.zoom([...mouse.screen], event.deltaY * 0.001);
  },
  { passive: false },
);

let isPanning = false;
const handlePanMouseMove = (event: MouseEvent) => {
  if (!isPanning) {
    return;
  }
  // movementX/Y and the camera both use CSS pixels; do not scale by devicePixelRatio
  cameraController.pan([event.movementX, event.movementY]);
};

const handlePanMouseUp = () => {
  isPanning = false;
  window.removeEventListener("mousemove", handlePanMouseMove);
  window.removeEventListener("mouseup", handlePanMouseUp);
};

const handlePanMouseDown = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  event.preventDefault();
  isPanning = true;
  window.addEventListener("mousemove", handlePanMouseMove);
  window.addEventListener("mouseup", handlePanMouseUp);
};

window.addEventListener("mousedown", handlePanMouseDown);

const render = (timestamp: Timestamp) => {
  pipes.forEach((pipe) => pipe.update(timestamp));
  structures.forEach((structure) => structure.update(timestamp));

  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  structures.forEach((structure) =>
    structure.render(context, cameraController),
  );
};

const animationController = new AnimationController(render);
animationController.resume();
window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    animationController.toggle();
  }
});
