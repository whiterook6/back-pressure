import { AnimationController, type Timestamp } from "./animation.controller";
import { CameraController } from "./camera.controller";
import { CanvasController } from "./canvas.controller";
import { NetworkController } from "./network.controller";
import { SinkStructure } from "./structures/sink.structure";
import { WellStructure } from "./structures/well.structure";
import "./style.css";
import type { ScreenPosition, WorldPosition } from "./types";

const canvasController = new CanvasController("canvas");
canvasController.watchResize();

const cameraController = new CameraController();
cameraController.watchResize();

const networkController = new NetworkController("water", [0, 0]);
const well = new WellStructure("water", 30, 50, [-120, 0]);
const sink = new SinkStructure("water", 30, 50, [120, 0]);
networkController.addProducer({ producer: well.producer });
networkController.addConsumer({ consumer: sink.consumer });

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
  networkController.update(timestamp);
  well.tick(timestamp);
  sink.tick(timestamp);

  const context = canvasController.getContext();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  well.render(context, cameraController);
  networkController.render(context, cameraController);
  sink.render(context, cameraController);
};

const animationController = new AnimationController(render);
animationController.resume();
window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    animationController.toggle();
  }
});
