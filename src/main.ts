import { AnimationController, type Timestamp } from "./animation.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { GridController } from "./grid.controller";
import { NetworkController } from "./network.controller";
import { SinkStructure } from "./structures/sink.structure";
import { WellStructure } from "./structures/well.structure";
import "./style.css";
import type { ScreenPosition, WorldPosition } from "./types";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

const gridController = new GridController([0, 0], 50);

const networkController = new NetworkController("water");
const well = new WellStructure("water", 30, 50);
const sink = new SinkStructure("water", 30, 200);
networkController.addProducer(well);
networkController.addConsumer(sink);

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

const render = (timestamp: Timestamp) => {
  networkController.update(timestamp);
  well.tick(timestamp);
  sink.tick(timestamp);

  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  if (mouse.isInBounds) {
    context.fillStyle = "#ff0000";
    const mousePosition = gridController.snapToGrid([...mouse.world], [50, 50]);
    const [screenX, screenY] = cameraController.toScreenPosition(mousePosition);
    const [screenWidth, screenHeight] = cameraController.toScreenSize([50, 50]);
    context.fillRect(screenX, screenY, screenWidth, screenHeight);
  }
};

const animationController = new AnimationController(render);
animationController.resume();
window.addEventListener("keydown", (event) => {
  if (event.key === " "){
    animationController.toggle();
  }
});
