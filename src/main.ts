import { AnimationController } from "./animation.controller";
import { BuildingController } from "./building.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { GridController } from "./grid.controller";
import "./style.css";
import type { ScreenPosition, WorldPosition } from "./types";

const canvasController = new CanvasController("canvas");
const cameraController = new CameraController();
const gridController = new GridController([0, 0], 50);
const buildController = new BuildingController(gridController);

canvasController.watchResize();
cameraController.watchResize();

const mouse = {
  world: [0, 0] as WorldPosition,
  screen: [0, 0] as ScreenPosition,
  isInBounds: false,
};

window.addEventListener("mousemove", (event) => {
  mouse.screen = [event.clientX, event.clientY];
  mouse.world = cameraController.toWorldPosition(mouse.screen);
  mouse.isInBounds = true;

  if (buildController.isBuilding()) {
    const gridPosition = gridController.snapToGrid([...mouse.world], [50, 50]);
    buildController.build("black", gridPosition);
  }
});

window.addEventListener("mouseleave", () => {
  mouse.isInBounds = false;
});

window.addEventListener("mousedown", (event) => {
  mouse.screen = [event.clientX, event.clientY];
  mouse.world = cameraController.toWorldPosition(mouse.screen);
  const gridPosition = gridController.snapToGrid([...mouse.world], [50, 50]);
  buildController.build("black", gridPosition);
});

window.addEventListener("mouseup", (event) => {
  buildController.stopBuild();
});

window.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    cameraController.zoom([...mouse.screen], event.deltaY * 0.001);
  },
  { passive: false },
);

const render = () => {
  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const entity of gridController.getEntities()) {
    if (entity.entity === "none") {
      continue;
    }

    switch (entity.entity) {
      case "red":
        context.fillStyle = "#ff0000";
        break;
      case "black":
        context.fillStyle = "#000000";
        break;
      case "green":
        context.fillStyle = "#00ff00";
        break;
      case "blue":
        context.fillStyle = "#0000ff";
        break;
    }

    const [screenX, screenY] = cameraController.toScreenPosition(entity.position);
    const [screenWidth, screenHeight] = cameraController.toScreenSize([50, 50]);
    context.fillRect(screenX, screenY, screenWidth, screenHeight);
  }

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
