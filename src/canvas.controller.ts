export class CanvasController {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(id: string) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id ${id} not found`);
    }

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get context");
    }

    this.canvas = canvas;
    this.context = context;
  }

  watchResize = () => {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.floor(window.innerWidth * dpr);
      this.canvas.height = Math.floor(window.innerHeight * dpr);
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  };

  getCanvas = () => this.canvas;
  getContext = () => this.context;
}
