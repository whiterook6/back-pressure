import { AnimationController } from "./animation";
import { CameraController } from "./camera";
import { CanvasController } from "./canvas";
import { GridController } from "./grid";
import "./style.css";
import type { WorldPosition } from "./types";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

const gridController = new GridController([0, 0], 50);

const mouse = {
  world: [0, 0] as WorldPosition,
  isInBounds: false,
}

window.addEventListener("mousemove", (event) => {
  const worldPosition = cameraController.toWorld([event.clientX, event.clientY]);
  mouse.world = worldPosition;
  mouse.isInBounds = true;
});

window.addEventListener("mouseleave", () => {
  mouse.isInBounds = false;
});

const blocks: Array<{
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}> = [];
window.addEventListener("mousedown", () => {
  if (mouse.isInBounds) {
    const blockPosition = gridController.snapToGrid(
      [...mouse.world],
      [50, 50],
    );

    blocks.push({
      x: blockPosition[0],
      y: blockPosition[1],
      width: 50,
      height: 50,
      color: "#000000",
    });
  }
});

window.addEventListener("mouseleave", () => {
  mouse.isInBounds = false;
});

const render = () => {
  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  context.fillStyle = "#000000";
  for (const block of blocks) {
    context.fillStyle = block.color;
    const screenPosition = cameraController.toScreen([block.x, block.y]);
    context.fillRect(screenPosition[0], screenPosition[1], block.width, block.height);
  }
  if (mouse.isInBounds) {

    context.fillStyle = "#ff0000";
    const mousePosition = gridController.snapToGrid(
      [...mouse.world],
      [50, 50]
    );
    const screenPosition = cameraController.toScreen(mousePosition);
    context.fillRect(screenPosition[0], screenPosition[1], 50, 50);
  }
};

const animationController = new AnimationController(render);
animationController.resume();
