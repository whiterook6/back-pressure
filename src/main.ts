import { AnimationController, type Timestamp } from "./animation.controller";
import { BuildingController } from "./building.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { DockController } from "./dock.controller";
import { FlowPipe } from "./flow/flow.pipe";
import { InteractionController } from "./gestures/interaction.controller";
import { GridController } from "./grid.controller";
import { SinkStructure } from "./structures/sink.structure";
import { StirringPlantStructure } from "./structures/stirring.structure";
import { WellStructure } from "./structures/well.structure";
import "./style.css";
import type { PlacedStructure, ScreenPosition, WorldPosition } from "./types";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

const interactionController = new InteractionController();
interactionController.watchEvents();
interactionController.startGesture(cameraController);

const gridController = new GridController([0, 0], 75);
const buildingController = new BuildingController(gridController);

const dockElement = document.getElementById("dock") as HTMLElement;
DockController.buildDock(dockElement);

const pipes: FlowPipe[] = [];
const structures: PlacedStructure[] = [];

const redFluidSource = new WellStructure("#ff0000", 30, 50, [-120, 60]);
const blueFluidSource = new WellStructure("#0000ff", 15, 100, [-120, -60]);
const stirringPlants = [
  new StirringPlantStructure([0, -75]),
  new StirringPlantStructure([0, 0]),
  new StirringPlantStructure([0, 75]),
];
const purpleSink = new SinkStructure("#ff00ff", 10, 100, [100, 0]);

const redPipe = new FlowPipe(20, "#ff0000");
redPipe.addProducer(redFluidSource.buffer);
for (const stirringPlant of stirringPlants) {
  redPipe.addConsumer(stirringPlant.redInput);
}

const bluePipe = new FlowPipe(20, "#0000ff");
bluePipe.addProducer(blueFluidSource.buffer);
for (const stirringPlant of stirringPlants) {
  bluePipe.addConsumer(stirringPlant.blueInput);
}

const purplePipe = new FlowPipe(20, "#ff00ff");
for (const stirringPlant of stirringPlants) {
  purplePipe.addProducer(stirringPlant.purpleOutput);
}
purplePipe.addConsumer(purpleSink.buffer);

pipes.push(redPipe, bluePipe, purplePipe);
structures.push(redFluidSource, blueFluidSource, ...stirringPlants, purpleSink);

const render = (timestamp: Timestamp) => {
  pipes.forEach((pipe) => pipe.update(timestamp));
  structures.forEach((structure) => structure.update(timestamp));

  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  pipes.forEach((pipe) => pipe.render(context, cameraController));
  structures.forEach((structure) =>
    structure.render(context, cameraController),
  );
};

const animationController = new AnimationController(render);
animationController.resume();

window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    animationController.toggle();
    return;
  } else if (event.key === ".") {
    if (animationController.getIsPaused()){
      animationController.step();
    }
  }
});
