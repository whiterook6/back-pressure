export const GridController = {
  cellSize: 20,

  snapToGrid: (obj: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    const left = obj.x - obj.width / 2;
    const top = obj.y - obj.height / 2;

    return {
      x: Math.round(left / GridController.cellSize) * GridController.cellSize,
      y: Math.round(top / GridController.cellSize) * GridController.cellSize,
    };
  },
};
