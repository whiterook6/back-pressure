import { CanvasController } from "./canvas";
import "./style.css";

const canvas = CanvasController.getCanvas("canvas");
const context = CanvasController.getContext(canvas);
CanvasController.watchResize(canvas, context);
