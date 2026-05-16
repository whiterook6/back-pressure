export const CanvasController = {
  getCanvas: (id: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id ${id} not found`);
    }
    return canvas;
  },

  getContext: (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get context");
    }
    return context;
  },

  watchResize: (canvas: HTMLCanvasElement, context?: CanvasRenderingContext2D) => {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();
    window.addEventListener("resize", resize);
  },
};
