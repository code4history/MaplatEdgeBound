import Delaunator from 'delaunator';
import { Point, TriangulationStrategy } from './types';

export class DelaunayCanvas implements TriangulationStrategy {
  private ctx: CanvasRenderingContext2D;
  private points: Point[] = [];
  private width: number;
  private height: number;
  private pointsArray: ArrayLike<number> = [];
  private delaunay: Delaunator<ArrayLike<number>> | null = null;
  name: string;

  constructor(canvas: HTMLCanvasElement, name: string) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.name = name;
  }

  addPoint(point: Point): void {
    console.log("Add");
    this.points.push(point);
    if (Array.isArray(this.pointsArray)) {
      this.pointsArray.push(point.x, point.y);
    } else {
      // Float64Arrayの場合は新しく作り直す
      const newArray = new Float64Array(this.pointsArray.length + 2);
      newArray.set(this.pointsArray);
      newArray[this.pointsArray.length] = point.x;
      newArray[this.pointsArray.length + 1] = point.y;
      this.pointsArray = newArray;
    }
  }

  setPoints(points: Point[], flatArray?: Float64Array): void {
    this.points = points;
    console.log("Adds");
    if (flatArray) {
      this.pointsArray = flatArray;
    } else {
      this.pointsArray = points.flatMap(p => [p.x, p.y]);
    }
    this.delaunay = null;
  }

  reset(): void {
    this.points = [];
    this.pointsArray = [];
    this.delaunay = null;
    this.clear();
  }

  benchmark(): number {
    const start = performance.now();
    this.delaunay = new Delaunator(this.pointsArray);
    const end = performance.now();
    return end - start;
  }

  clear(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  render(): void {
    this.clear();
    
    if (!this.delaunay) {
      this.delaunay = new Delaunator(this.pointsArray);
    }

    // Draw triangulation
    const triangles = this.delaunay.triangles;
    
    this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    this.ctx.beginPath();
    
    for (let i = 0; i < triangles.length; i += 3) {
      const p0 = this.points[triangles[i]];
      const p1 = this.points[triangles[i + 1]];
      const p2 = this.points[triangles[i + 2]];
      
      this.ctx.moveTo(p0.x, p0.y);
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.closePath();
    }
    
    this.ctx.stroke();
    
    // Draw points
    this.ctx.fillStyle = 'red';
    for (const point of this.points) {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}