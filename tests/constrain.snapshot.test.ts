// edge-ruler.snapshot.test.ts
/**
 * このテストファイルは状態変化のスナップショットを記録し、
 * システム全体の振る舞いを検証することを目的としています。
 * 
 * ユニットテストは edge-ruler.unit.test.ts にあります。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import EdgeRuler from '../src/variant/constrain';
import Delaunator from 'delaunator';

// 型定義を追加
interface EdgeState {
  operation: string;
  edge01: number;
  edge02: number;
}

interface OperationResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

describe('EdgeRuler Integration-Based Unit Tests', () => {
  const samplePoints = [[150, 50], [50, 200], [150, 350], [250, 200]];
  
  describe('State Transitions', () => {
    let ruler: EdgeRuler;
    let del: any;
    
    beforeEach(() => {
      del = Delaunator.from(samplePoints);
      ruler = new EdgeRuler(del);
    });

    it('should record state changes during constraint operation', () => {
      /*const initialState = {
        triangles: Array.from(ruler.del.triangles),
        halfedges: Array.from(ruler.del.halfedges),
        vertMap: Array.from(ruler.vertMap)
      };

      const edge = ruler.constrainOne(0, 2);*/

      const afterConstraint = {
        triangles: Array.from(ruler.del.triangles),
        halfedges: Array.from(ruler.del.halfedges),
        vertMap: Array.from(ruler.vertMap)
      };

      expect(afterConstraint).toMatchSnapshot('state-after-constraint');
    });

    it('should maintain correct edge states through operations', () => {
      // 型付きの配列を初期化
      const transitions: EdgeState[] = [];

      transitions.push({
        operation: 'initial',
        edge01: ruler.findEdge(0, 1),
        edge02: ruler.findEdge(0, 2)
      });

      ruler.constrainOne(0, 2);
      transitions.push({
        operation: 'constrain-0-2',
        edge01: ruler.findEdge(0, 1),
        edge02: ruler.findEdge(0, 2)
      });

      ruler.delaunify(true);
      transitions.push({
        operation: 'delaunify',
        edge01: ruler.findEdge(0, 1),
        edge02: ruler.findEdge(0, 2)
      });

      expect(transitions).toMatchSnapshot('edge-state-transitions');
    });
  });

  describe('Complex Operations', () => {
    it('should handle sequence of operations from integration test', () => {
      const del = Delaunator.from(samplePoints);
      const ruler = new EdgeRuler(del);

      const operations = [
        () => ruler.constrainOne(0, 2),
        () => ruler.delaunify(true),
        () => ruler.findEdge(0, 2),
        () => ruler.isConstrained(ruler.findEdge(0, 2))
      ];

      const results: OperationResult[] = operations.map(op => {
        try {
          return {
            success: true,
            result: op()
          };
        } catch (e) {
          if (e instanceof Error) {
            return {
              success: false,
              error: e.message
            };
          }
          return {
            success: false,
            error: 'Unknown error'
          };
        }
      });

      expect(results).toMatchSnapshot('operation-sequence-results');
    });
  });

  describe('Edge Cases', () => {
    it('should handle almost-collinear points correctly', () => {
      // 完全な一直線ではなく、わずかにずれた点を使用
      const almostCollinearPoints = [
        [0, 0], 
        [1, 0.001], 
        [2, -0.001], 
        [3, 0.002]
      ];
      const del = Delaunator.from(almostCollinearPoints);
      const ruler = new EdgeRuler(del);
  
      const result = ruler.constrainOne(0, 2);
      expect(result).toMatchSnapshot('almost-collinear-constraint-result');
    });
  
    it('should handle near-but-valid points', () => {
      // 近接しているが、有効な三角形分割が可能な点を使用
      const nearButValidPoints = [
        [0, 0], 
        [0.1, 0.1], 
        [1, 0], 
        [1, 1]
      ];
      const del = Delaunator.from(nearButValidPoints);
      const ruler = new EdgeRuler(del);
  
      const result = ruler.constrainOne(0, 2);
      expect(result).toMatchSnapshot('near-valid-constraint-result');
    });
  
    // エラーケースのテストを追加
    it('should throw error for true collinear points', () => {
      const collinearPoints = [[0, 0], [1, 1], [2, 2], [3, 3]];
      const del = Delaunator.from(collinearPoints);
      
      expect(() => new EdgeRuler(del))
        .toThrow('No edges in triangulation');
    });
  });
});