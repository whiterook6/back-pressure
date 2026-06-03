import type { CameraController } from "./camera.controller";
import { CameraController as Camera } from "./camera.controller";
import { Ring } from "./render/ring";
import { Triangle } from "./render/triangle";
import { SinkStructure } from "./structures/sink.structure";
import { StirringPlantStructure } from "./structures/stirring.structure";
import { WellStructure } from "./structures/well.structure";
import type { PlacedStructure, WorldPosition, WorldSize } from "./types";

export type DockItem = {
  label: string;
  footprint: WorldSize;
  minSpacing: number;
  create: (position: WorldPosition) => PlacedStructure;
  renderPreview: (
    context: CanvasRenderingContext2D,
    camera: CameraController,
    position: WorldPosition,
  ) => void;
};

const STRUCTURE_FOOTPRINT: WorldSize = [80, 80];
const STRUCTURE_MIN_SPACING = 75;

const renderWellPreview = (
  context: CanvasRenderingContext2D,
  camera: CameraController,
  position: WorldPosition,
  color: string,
  triangleRotation: number,
) => {
  Ring.renderPercentage(
    context,
    camera,
    position,
    { inner: 30, outer: 40 },
    color,
    0,
  );
  Triangle.render(context, camera, position, color, 25, triangleRotation);
};

const renderStirringPreview = (
  context: CanvasRenderingContext2D,
  camera: CameraController,
  position: WorldPosition,
) => {
  Ring.renderPercentage(
    context,
    camera,
    position,
    { inner: 20, outer: 25 },
    "#0000ff",
    0,
  );
  Ring.renderPercentage(
    context,
    camera,
    position,
    { inner: 25, outer: 30 },
    "#ff0000",
    0,
  );
  Ring.renderPercentage(
    context,
    camera,
    position,
    { inner: 35, outer: 40 },
    "#ff00ff",
    0,
  );
  Ring.render(
    context,
    camera,
    position,
    { inner: 30, outer: 35 },
    "#333333",
    0,
    2 * Math.PI,
  );
};

const dockItems: DockItem[] = [
  {
    label: "Sink",
    footprint: STRUCTURE_FOOTPRINT,
    minSpacing: STRUCTURE_MIN_SPACING,
    create: (position) => new SinkStructure("#808080", 10, 100, position),
    renderPreview: (context, camera, position) =>
      renderWellPreview(context, camera, position, "#808080", Math.PI),
  },
  {
    label: "Well",
    footprint: STRUCTURE_FOOTPRINT,
    minSpacing: STRUCTURE_MIN_SPACING,
    create: (position) => new WellStructure("#808080", 30, 50, position),
    renderPreview: (context, camera, position) =>
      renderWellPreview(context, camera, position, "#808080", 0),
  },
  {
    label: "Stirring Plant",
    footprint: STRUCTURE_FOOTPRINT,
    minSpacing: STRUCTURE_MIN_SPACING,
    create: (position) => new StirringPlantStructure(position),
    renderPreview: renderStirringPreview,
  },
];

let pickedIndex: number | null = null;
const dockButtons: HTMLButtonElement[] = [];

const updateDockSelection = () => {
  dockButtons.forEach((button, index) => {
    const selected = pickedIndex === index;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
};

const renderDockIcon = (
  canvas: HTMLCanvasElement,
  item: DockItem,
) => {
  const size = 32;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, size, size);

  const camera = new Camera();
  camera.setViewportSize([size, size]);
  camera.pixelsPerWorldUnit = 0.35;
  item.renderPreview(context, camera, [0, 0]);
};

export const DockController = {
  get pickedItem(): DockItem | null {
    return pickedIndex === null ? null : dockItems[pickedIndex];
  },

  pickItem: (slot: number) => {
    if (pickedIndex === slot) {
      pickedIndex = null;
    } else {
      pickedIndex = slot;
    }
    updateDockSelection();
  },

  clearPick: () => {
    pickedIndex = null;
    updateDockSelection();
  },

  buildDock: (element: HTMLElement) => {
    element.innerHTML = "";
    dockButtons.length = 0;

    dockItems.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("structure");
      button.setAttribute("aria-pressed", "false");

      const icon = document.createElement("canvas");
      icon.classList.add("dock-icon");
      renderDockIcon(icon, item);

      const label = document.createElement("span");
      label.classList.add("dock-label");
      label.textContent = item.label;

      button.append(icon, label);
      button.addEventListener("click", () => {
        DockController.pickItem(index);
      });

      element.appendChild(button);
      dockButtons.push(button);
    });
  },
};
