import { AnimationController, type Timestamp } from "./animation.controller";
import { BuildingController } from "./building.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { DockController } from "./dock.controller";
import { FlowPipe } from "./flow/flow.pipe";
import { InteractionController } from "./gestures/interaction.controller";
import { GridController } from "./grid.controller";
import "./style.css";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

InteractionController.watchEvents();
InteractionController.startGesture(cameraController);

const gridController = new GridController([0, 0], 75);
const buildingController = new BuildingController(gridController);

const dockElement = document.getElementById("dock") as HTMLElement;
DockController.buildDock(dockElement);

const pipes: FlowPipe[] = [];
const structures = [];

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
