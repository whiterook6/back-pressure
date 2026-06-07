import type { ScreenPosition } from "../types";

export interface Gesture {
  onMouseDown?: (mousePosition: ScreenPosition, mouseButtons: number) => void;
  onMouseMove?: (mousePosition: ScreenPosition, mouseButtons: number, delta: ScreenPosition, ) => void;
  onMouseUp?: (mousePosition: ScreenPosition, mouseButtons: number) => void;
  onWheel?: (mousePosition: ScreenPosition, mouseButtons: number, delta: number) => void;
};

export const InteractionController = {
  activeGesture: {} as Gesture,
  mouseButtons: 0 as number,
  mousePosition: [0, 0] as ScreenPosition,

  watchEvents: () => {
    window.addEventListener("mousemove", InteractionController.onMouseMove);
    window.addEventListener("mousedown", InteractionController.onMouseDown);
    window.addEventListener("mouseup", InteractionController.onMouseUp);
    window.addEventListener("wheel", InteractionController.onWheel);
  },

  startGesture: (gesture: Gesture) => {
    InteractionController.activeGesture = gesture;
  },

  cancelGesture: () => {
    InteractionController.activeGesture = {};
  },

  onMouseMove: (event: MouseEvent) => {
    InteractionController.setMouseProperties(event);
    const delta = [event.movementX, event.movementY] as ScreenPosition;
    InteractionController.activeGesture.onMouseMove?.(InteractionController.mousePosition, event.buttons,delta);
  },

  onMouseDown: (event: MouseEvent) => {
    InteractionController.setMouseProperties(event);
    InteractionController.activeGesture.onMouseDown?.(InteractionController.mousePosition, event.buttons);
  },

  onMouseUp: (event: MouseEvent) => {
    InteractionController.setMouseProperties(event);
    InteractionController.activeGesture.onMouseUp?.(InteractionController.mousePosition, event.buttons);
  },

  onWheel: (event: WheelEvent) => {
    InteractionController.setMouseProperties(event);
    InteractionController.activeGesture.onWheel?.(InteractionController.mousePosition, event.buttons, event.deltaY);
  },

  setMouseProperties: (event: MouseEvent | WheelEvent) => {
    InteractionController.mouseButtons = event.buttons;
    InteractionController.mousePosition = [event.clientX, event.clientY] as ScreenPosition;
  }
} 