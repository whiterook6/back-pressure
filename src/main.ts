import { AnimationController } from "./animation";
import { CanvasController } from "./canvas";
import { GridController } from "./grid";
import "./style.css";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const mouse = {
  x: 0,
  y: 0,
  isInBounds: false,
};

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.isInBounds =
    event.clientX > 0 &&
    event.clientX < window.innerWidth &&
    event.clientY > 0 &&
    event.clientY < window.innerHeight;
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
    const blockPosition = GridController.snapToGrid({
      x: mouse.x,
      y: mouse.y,
      width: 50,
      height: 50,
    });
    blocks.push({
      x: blockPosition.x,
      y: blockPosition.y,
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
  const mousePosition = GridController.snapToGrid({
    x: mouse.x,
    y: mouse.y,
    width: 50,
    height: 50,
  });

  for (const block of blocks) {
    context.fillStyle = block.color;
    context.fillRect(block.x, block.y, block.width, block.height);
  }
  if (mouse.isInBounds) {
    context.fillStyle = "#ff0000";
    context.fillRect(mousePosition.x, mousePosition.y, 50, 50);
  }
};

const animationController = new AnimationController(render);
animationController.resume();
