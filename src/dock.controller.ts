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
  kind?: "structure" | "connect" | "move";
  footprint?: WorldSize;
  minSpacing?: number;
  create?: (position: WorldPosition) => PlacedStructure;
  renderPreview: (
    context: CanvasRenderingContext2D,
    camera: CameraController,
    position: WorldPosition,
  ) => void;
};

export const STRUCTURE_FOOTPRINT: WorldSize = [80, 80];
const STRUCTURE_MIN_SPACING = 75;

export type FluidColor = "red" | "blue" | "purple";

export const FLUIDS: Record<FluidColor, { label: string; color: string }> = {
  red: { label: "Red", color: "#ff0000" },
  blue: { label: "Blue", color: "#0000ff" },
  purple: { label: "Purple", color: "#ff00ff" },
};

let selectedFluid: FluidColor = "red";

const getFluidColor = (): string => FLUIDS[selectedFluid].color;

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

const renderMovePreview = (
  context: CanvasRenderingContext2D,
  camera: CameraController,
  position: WorldPosition,
) => {
  const [cx, cy] = camera.toScreenPosition(position);
  const arm = camera.scale(12);

  context.strokeStyle = "#333333";
  context.fillStyle = "#333333";
  context.lineWidth = 2;
  context.lineCap = "round";

  const drawArrow = (dx: number, dy: number) => {
    const tipX = cx + dx * arm;
    const tipY = cy + dy * arm;
    const perpX = -dy * camera.scale(4);
    const perpY = dx * camera.scale(4);

    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(tipX, tipY);
    context.stroke();

    context.beginPath();
    context.moveTo(tipX, tipY);
    context.lineTo(tipX - dx * camera.scale(6) + perpX, tipY - dy * camera.scale(6) + perpY);
    context.lineTo(tipX - dx * camera.scale(6) - perpX, tipY - dy * camera.scale(6) - perpY);
    context.closePath();
    context.fill();
  };

  drawArrow(0, -1);
  drawArrow(0, 1);
  drawArrow(-1, 0);
  drawArrow(1, 0);
};

const renderConnectPreview = (
  context: CanvasRenderingContext2D,
  camera: CameraController,
  position: WorldPosition,
) => {
  const [cx, cy] = camera.toScreenPosition(position);
  const offset = camera.scale(30);

  context.strokeStyle = "#333333";
  context.fillStyle = "#333333";
  context.lineWidth = 2;

  context.beginPath();
  context.moveTo(cx - offset, cy);
  context.lineTo(cx + offset, cy);
  context.stroke();

  for (const x of [cx - offset, cx + offset]) {
    context.beginPath();
    context.arc(x, cy, 4, 0, 2 * Math.PI);
    context.fill();
  }
};

const dockItems: DockItem[] = [
  {
    label: "Sink",
    kind: "structure",
    footprint: STRUCTURE_FOOTPRINT,
    minSpacing: STRUCTURE_MIN_SPACING,
    create: (position) => new SinkStructure(getFluidColor(), 10, 100, position),
    renderPreview: (context, camera, position) =>
      renderWellPreview(context, camera, position, getFluidColor(), Math.PI),
  },
  {
    label: "Well",
    kind: "structure",
    footprint: STRUCTURE_FOOTPRINT,
    minSpacing: STRUCTURE_MIN_SPACING,
    create: (position) => new WellStructure(getFluidColor(), 30, 50, position),
    renderPreview: (context, camera, position) =>
      renderWellPreview(context, camera, position, getFluidColor(), 0),
  },
  {
    label: "Stirring Plant",
    kind: "structure",
    footprint: STRUCTURE_FOOTPRINT,
    minSpacing: STRUCTURE_MIN_SPACING,
    create: (position) => new StirringPlantStructure(position),
    renderPreview: renderStirringPreview,
  },
  {
    label: "Connect",
    kind: "connect",
    renderPreview: renderConnectPreview,
  },
  {
    label: "Move",
    kind: "move",
    renderPreview: renderMovePreview,
  },
];

let pickedIndex: number | null = null;
const dockButtons: HTMLButtonElement[] = [];
const dockIcons: HTMLCanvasElement[] = [];

let pickChangeCallback: ((item: DockItem | null) => void) | undefined;

const notifyPickChange = () => {
  pickChangeCallback?.(pickedIndex === null ? null : dockItems[pickedIndex]);
};

const updateDockSelection = () => {
  dockButtons.forEach((button, index) => {
    const selected = pickedIndex === index;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
};

const renderDockIcon = (canvas: HTMLCanvasElement, item: DockItem) => {
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

const refreshFluidIcons = () => {
  for (const index of [0, 1]) {
    const icon = dockIcons[index];
    if (icon) {
      renderDockIcon(icon, dockItems[index]);
    }
  }
};

export const DockController = {
  get pickedItem(): DockItem | null {
    return pickedIndex === null ? null : dockItems[pickedIndex];
  },

  get selectedFluid(): FluidColor {
    return selectedFluid;
  },

  pickItem: (slot: number) => {
    if (pickedIndex === slot) {
      pickedIndex = null;
    } else {
      pickedIndex = slot;
    }
    updateDockSelection();
    notifyPickChange();
  },

  clearPick: () => {
    pickedIndex = null;
    updateDockSelection();
    notifyPickChange();
  },

  set onPickChange(callback: ((item: DockItem | null) => void) | undefined) {
    pickChangeCallback = callback;
  },

  buildDock: (element: HTMLElement) => {
    element.innerHTML = "";
    dockButtons.length = 0;
    dockIcons.length = 0;

    const fluidSelect = document.createElement("select");
    fluidSelect.classList.add("dock-fluid");
    fluidSelect.setAttribute("aria-label", "Fluid color");

    for (const [value, { label }] of Object.entries(FLUIDS) as Array<
      [FluidColor, { label: string; color: string }]
    >) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      fluidSelect.appendChild(option);
    }

    fluidSelect.value = selectedFluid;
    fluidSelect.addEventListener("change", () => {
      selectedFluid = fluidSelect.value as FluidColor;
      refreshFluidIcons();
    });

    element.appendChild(fluidSelect);

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
      dockIcons.push(icon);
    });
  },
};
