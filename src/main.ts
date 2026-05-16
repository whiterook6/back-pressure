import { AnimationController } from "./animation";
import { CanvasController } from "./canvas";
import "./style.css";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const boxes = [{
  row: 5,
  col: 2,
  width: 5,
  height: 2,
  color: "#000000",
}];

const camera = (box: {
  row: number;
  col: number;
  width: number;
  height: number;
}) => {
  const cellSize = window.innerWidth / 20;
  return [
    box.col * cellSize,
    box.row * cellSize,
    box.width * cellSize,
    box.height * cellSize,
  ] as [number, number, number, number];
};

const render = () => {
  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  for (const box of boxes) {
    context.fillStyle = box.color;
    context.fillRect(...camera(box));
  }
};

const animationController = new AnimationController(render);
animationController.resume();



