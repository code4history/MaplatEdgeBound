export interface Point {
  x: number;
  y: number;
}

export interface Triangle {
  vertices: Point[];
  render: () => void;
}

export interface TriangulationStrategy {
  name: string;
  addPoint: (point: Point) => void;
  reset: () => void;
  render: () => void;
  benchmark: () => number;
  setPoints?: (points: Point[], flatArray?: Float64Array) => void;
}