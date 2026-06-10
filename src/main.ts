import { AnimationController, type Timestamp } from "./animation.controller";
import { BuildingController } from "./building.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { DockController } from "./dock.controller";
import { FlowPipe } from "./flow/flow.pipe";
import { InteractionController } from "./gestures/interaction.controller";
import { GridController, toCenter } from "./grid.controller";
import type { PlacedStructure } from "./types";
import "./style.css";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

InteractionController.watchEvents();
InteractionController.startGesture(cameraController);

const gridController = new GridController([0, 0], 75);

const pipes: FlowPipe[] = [];
const structures: PlacedStructure[] = [];

const buildingController = new BuildingController(
  gridController,
  cameraController,
  (structure) => structures.push(structure),
  () => DockController.clearPick(),
);

const dockElement = document.getElementById("dock") as HTMLElement;
DockController.buildDock(dockElement);

DockController.onPickChange = (item) => {
  if (item) {
    buildingController.setActiveItem(item);
    InteractionController.startGesture(buildingController);
  } else {
    buildingController.setActiveItem(null);
    buildingController.stopBuild();
    InteractionController.startGesture(cameraController);
  }
};

const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
let mouseOnCanvas = false;

canvasElement.addEventListener("mouseenter", () => {
  mouseOnCanvas = true;
});

canvasElement.addEventListener("mouseleave", () => {
  mouseOnCanvas = false;
});

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

  const item = DockController.pickedItem;
  if (item && mouseOnCanvas) {
    const topLeft = gridController.snapToGrid(
      cameraController.mousePosition,
      item.footprint,
    );
    const center = toCenter(topLeft, item.footprint);
    const blocked = gridController.isBlocked(topLeft);

    context.save();
    context.globalAlpha = blocked ? 0.35 : 0.6;
    item.renderPreview(context, cameraController, center);
    context.restore();
  }
};

const animationController = new AnimationController(render);
animationController.resume();

window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    animationController.toggle();
    return;
  } else if (event.key === "Escape") {
    DockController.clearPick();
  } else if (event.key === ".") {
    if (animationController.getIsPaused()) {
      animationController.step();
    }
  }
});
