import type { ScreenPosition } from "../types";

export type Gesture = Partial<{
  onMouseDown: (mousePosition: ScreenPosition) => void;
  onMouseMove: (mousePosition: ScreenPosition, delta: ScreenPosition) => void;
  onMouseUp: (mousePosition: ScreenPosition) => void;
  onWheel: (mousePosition: ScreenPosition, delta: number) => void;
}>;

export class InteractionController {
  mousePosition: ScreenPosition;
  activeGesture: Gesture;

  constructor(){}

  watchEvents = () => {
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
  }

  startGesture = (gesture: Gesture) => {
    this.activeGesture = gesture;
  }

  cancelGesture = () => {
    this.activeGesture = {};
  }

  onMouseMove = (event: MouseEvent) => {
    const delta = [event.movementX, event.movementY] as ScreenPosition;
    this.mousePosition = [event.clientX, event.clientY] as ScreenPosition;
    this.activeGesture.onMouseMove?.(this.mousePosition, delta);
  }
  onMouseDown = () => {
    this.activeGesture.onMouseDown?.(this.mousePosition);
  }
  onMouseUp = () => {
    this.activeGesture.onMouseUp?.(this.mousePosition);
  }
  onWheel = (event: WheelEvent) => {
    this.activeGesture.onWheel?.(this.mousePosition, event.deltaY);
  }
} 