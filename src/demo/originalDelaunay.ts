import { Point } from './types';

export class Vertex {
  loc: Point;
  sat: number;
  bri: number;

  constructor(loc: Point) {
    this.loc = loc;
    this.sat = Math.random() * 50 + 50;
    this.bri = Math.random() * 70 + 30;
  }
}

export class Circle {
  center: Point;
  radius: number;

  constructor(center: Point, radius: number) {
    this.center = center;
    this.radius = radius;
  }

  isInCircle(point: Point): boolean {
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

  export class OriginalTriangle {
  vertices: Vertex[];
  circumCircle: Circle;

  constructor(vertices: Vertex[]) {
    //console.log('Creating new triangle'); // ログ
    this.vertices = vertices;
    
    const v1 = vertices[0].loc;
    const v2 = vertices[1].loc;
    const v3 = vertices[2].loc;
    
    const c = 2 * ((v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x));
    const x = ((v3.y - v1.y) * ((v2.x * v2.x) - (v1.x * v1.x) + (v2.y * v2.y) - (v1.y * v1.y)) + 
              (v1.y - v2.y) * ((v3.x * v3.x) - (v1.x * v1.x) + (v3.y * v3.y) - (v1.y * v1.y))) / c;
    const y = ((v1.x - v3.x) * ((v2.x * v2.x) - (v1.x * v1.x) + (v2.y * v2.y) - (v1.y * v1.y)) + 
              (v2.x - v1.x) * ((v3.x * v3.x) - (v1.x * v1.x) + (v3.y * v3.y) - (v1.y * v1.y))) / c;
    
    //console.log('Circumcenter:', {x, y}); // ログ
    const center = { x, y };
    const radius = Math.sqrt(Math.pow(v1.x - center.x, 2) + Math.pow(v1.y - center.y, 2));
    this.circumCircle = new Circle(center, radius);
  }

  divide(v: Vertex): OriginalTriangle[] {
    //console.log('Dividing triangle with vertex:', v.loc); // ログ
    const tris: OriginalTriangle[] = [];
    for (let i = 0; i < 3; i++) {
      const j = i === 2 ? 0 : i + 1;
      tris.push(new OriginalTriangle([this.vertices[i], this.vertices[j], v]));
    }
    //console.log('Created new triangles:', tris.length); // ログ
    return tris;
  }

  isContain(v: Vertex): boolean {
    const result = this.vertices.some(vertex => vertex === v);
    //console.log('isContain check:', result); // ログ
    return result;
  }
}