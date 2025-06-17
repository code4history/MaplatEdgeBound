import { DelaunayCanvas } from './delaunayCanvas';
//import { OriginalDelaunayCanvas } from './originalDelaunayCanvas';
import { Point } from './types';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Delaunay Triangulation Benchmark</h1>
    <div>
      <label>Number of random points:</label>
      <input type="number" id="pointCount" value="500" min="1" max="10000">
      <button id="generatePoints">Generate Points</button>
    </div>
    <div id="benchmarkResults"></div>
    <div id="canvasContainer" style="display: flex; flex-wrap: wrap;"></div>
  </div>
`;

const canvasSize = { width: 400, height: 400 };
const canvases: DelaunayCanvas[] = [];

function createCanvas(_name: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  document.querySelector('#canvasContainer')!.appendChild(canvas);
  return canvas;
}

// Create instances
//const delaunatorCanvas = new OriginalDelaunayCanvas(createCanvas('Original'));
//const originalCanvas = new OriginalDelaunayCanvas(createCanvas('Original'));
const delaunatorCanvas = new DelaunayCanvas(createCanvas('Delaunay'),'Delaunay');
const originalCanvas = new DelaunayCanvas(createCanvas('Delaunay'),'Delaunay');
canvases.push(originalCanvas, delaunatorCanvas);

// Event handlers
function handleCanvasClick(e: MouseEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const point: Point = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  
  const results: string[] = [];
  
  for (const triangulation of canvases) {
    triangulation.addPoint(point);
    const time = triangulation.benchmark();
    triangulation.render();
    results.push(`${triangulation.name}: ${time.toFixed(2)}ms`);
  }
  
  document.querySelector('#benchmarkResults')!.innerHTML = results.join('<br>');
}

// Add click handlers to all canvases
document.querySelectorAll('canvas').forEach(canvas => {
  canvas.addEventListener('click', (e) => handleCanvasClick(e, canvas));
});

// Generate random points button handler
document.querySelector('#generatePoints')!.addEventListener('click', () => {
  const count = parseInt((document.querySelector('#pointCount') as HTMLInputElement).value);
  const results: string[] = [];
  
  // Generate points once
  const randomPoints: Point[] = Array.from({ length: count }, () => ({
    x: Math.random() * canvasSize.width,
    y: Math.random() * canvasSize.height
  }));

  // Prepare flat array for Delaunator
  const flatPoints = new Float64Array(count * 2);
  randomPoints.forEach((p, i) => {
    flatPoints[i * 2] = p.x;
    flatPoints[i * 2 + 1] = p.y;
  });
  
  // Use the same points for all canvases
  for (const triangulation of canvases) {
    triangulation.reset();
    if (triangulation.name === 'Delaunator') {
      triangulation.setPoints(randomPoints, flatPoints);  // 一斉設定
    } else {
      randomPoints.forEach(point => triangulation.addPoint(point));  // 従来の逐次追加
    }
    const time = triangulation.benchmark();
    triangulation.render();
    results.push(`${triangulation.name}: ${time.toFixed(2)}ms`);
  }
  
  document.querySelector('#benchmarkResults')!.innerHTML = results.join('<br>');
});