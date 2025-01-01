import { Point, TriangulationStrategy } from './types';
import { Vertex, OriginalTriangle } from './originalDelaunay';

export class OriginalDelaunayCanvas implements TriangulationStrategy {
  private ctx: CanvasRenderingContext2D;
  private vertices: Vertex[] = [];
  private triangles: OriginalTriangle[] = [];
  private width: number;
  private height: number;
  private superVertices: Vertex[] = [];
  name: string;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.name = 'Original Implementation';
    this.initializeSuperTriangle();
  }

  private initializeSuperTriangle(): void {
    const center = { x: this.width / 2, y: this.height / 2 };
    const radius = Math.sqrt(this.width * this.width + this.height * this.height) / 2;
    
    const v1 = new Vertex({ 
      x: center.x - Math.sqrt(3) * radius, 
      y: center.y - radius 
    });
    const v2 = new Vertex({ 
      x: center.x + Math.sqrt(3) * radius, 
      y: center.y - radius 
    });
    const v3 = new Vertex({ 
      x: center.x, 
      y: center.y + 2 * radius 
    });

    this.superVertices = [v1, v2, v3];
    this.vertices = [...this.superVertices];
    this.triangles = [new OriginalTriangle([v1, v2, v3])];
  }

  addPoint(point: Point): void {
    const v = new Vertex(point);
    
    // 追加する頂点が既に存在するかチェック
    for (const existing of this.vertices) {
      if (existing.loc.x === v.loc.x && existing.loc.y === v.loc.y) {
        return;
      }
    }

    this.vertices.push(v);
    const nextTriangles: OriginalTriangle[] = [];
    const newTriangles: OriginalTriangle[] = [];

    // 外接円チェックと三角形分割
    for (const tri of this.triangles) {
      if (tri.circumCircle.isInCircle(v.loc)) {
        newTriangles.push(...tri.divide(v));
      } else {
        nextTriangles.push(tri);
      }
    }

    // 不正な三角形のチェックと除外
    for (const tri of newTriangles) {
      let isIllegal = false;
      for (const vertex of this.vertices) {
        if (this.isIllegalTriangle(tri, vertex)) {
          isIllegal = true;
          break;
        }
      }
      if (!isIllegal) {
        nextTriangles.push(tri);
      }
    }

    this.triangles = nextTriangles;
  }

  private isIllegalTriangle(t: OriginalTriangle, v: Vertex): boolean {
    if (t.isContain(v)) {
      return false;
    }
    return t.circumCircle.isInCircle(v.loc);
  }

  reset(): void {
    this.vertices = [];
    this.triangles = [];
    this.initializeSuperTriangle();
    this.clear();
  }

  benchmark(): number {
    const start = performance.now();
    //const visibleTriangles = this.getVisibleTriangles();
    const end = performance.now();
    return end - start;
  }

  private getVisibleTriangles(): OriginalTriangle[] {
    return this.triangles.filter(t => {
      let hasSuperVertex = false;
      for (const sv of this.superVertices) {
        if (t.isContain(sv)) {
          hasSuperVertex = true;
          break;
        }
      }
      return !hasSuperVertex;
    });
  }

  clear(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  render(): void {
    this.clear();
    
    // 三角形の描画
    this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    
    for (const tri of this.getVisibleTriangles()) {
      this.ctx.beginPath();
      const vertices = tri.vertices;
      this.ctx.moveTo(vertices[0].loc.x, vertices[0].loc.y);
      this.ctx.lineTo(vertices[1].loc.x, vertices[1].loc.y);
      this.ctx.lineTo(vertices[2].loc.x, vertices[2].loc.y);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    // 点の描画
    this.ctx.fillStyle = 'red';
    for (const vertex of this.vertices) {
      if (!this.superVertices.includes(vertex)) {
        this.ctx.beginPath();
        this.ctx.arc(vertex.loc.x, vertex.loc.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}