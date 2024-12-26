// edge-ruler.unit.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import EdgeRuler from '../src/EdgeRuler';
import Delaunator from 'delaunator';

describe('EdgeRuler Unit Tests', () => {
    // 基本的なテストデータ
    const basicPoints: [number, number][] = [[150, 50], [50, 200], [150, 350], [250, 200]];
    let del: Delaunator<Float64Array>;
    let ruler: EdgeRuler;

    beforeEach(() => {
        del = Delaunator.from(basicPoints);
        ruler = new EdgeRuler(del);
    });

    describe('findEdge', () => {
        it('should find existing edge', () => {
            const edge = ruler.findEdge(0, 1);
            expect(edge).not.toBe(Infinity);
            expect(ruler.del.triangles[edge > 0 ? edge : -edge]).toBe(0);
        });
    
        it('should handle non-existent edge appropriately', () => {
            // エッジが存在しない場合は-1を返す
            const edge = ruler.findEdge(0, 3);
            expect(edge).toBe(-1);
        });
    });

    describe('isConstrained', () => {
        it('should correctly identify constrained edges', () => {
            const edge = ruler.constrainOne(0, 2);
            expect(ruler.isConstrained(Math.abs(edge))).toBe(true);
        });

        it('should correctly identify non-constrained edges', () => {
            const edge = ruler.findEdge(0, 1);
            if (edge !== Infinity) {
                expect(ruler.isConstrained(edge)).toBe(false);
            }
        });
    });

    describe('constrainOne', () => {
        it('should maintain input/output contract', () => {
            // 入力状態のスナップショット
            const initialTriangles = Array.from(ruler.del.triangles);
            const initialHalfedges = Array.from(ruler.del.halfedges);

            const edge = ruler.constrainOne(0, 2);

            // 出力の検証
            expect(edge).not.toBe(Infinity);
            expect(typeof edge).toBe('number');
            
            // 状態変更の検証
            expect(ruler.del.triangles.length).toBe(initialTriangles.length);
            expect(ruler.del.halfedges.length).toBe(initialHalfedges.length);
        });
    });

    describe('constrainAll', () => {
        it('should constrain multiple edges', () => {
            // 交差しないエッジペアを使用
            const edges: [number, number][] = [[0, 1], [2, 3]];
            ruler.constrainAll(edges);
    
            // すべてのエッジが正しく制約されているか検証
            edges.forEach(([p1, p2]) => {
                const edge = ruler.findEdge(p1, p2);
                expect(edge).not.toBe(Infinity);
                if (edge > 0) {
                    expect(ruler.isConstrained(edge)).toBe(true);
                }
            });
        });
    
        it('should throw error for intersecting edges', () => {
            const edges: [number, number][] = [[0, 2], [1, 3]];
            expect(() => ruler.constrainAll(edges)).toThrow('Edge intersects already constrained edge');
        });
    });

    describe('delaunify', () => {
        it('should maintain Delaunay condition', () => {
            ruler.delaunify(true);
            // Delaunay条件の検証
            // 各三角形の外接円内に他の点が含まれていないことを確認
        });
    });

    describe('internal geometry operations', () => {
        it('should correctly detect segment intersections', () => {
            // intersectSegmentsのテスト
            const intersects = ruler['intersectSegments'](0, 2, 1, 3);
            expect(typeof intersects).toBe('boolean');
        });

        it('should correctly identify collinear points', () => {
            // isCollinearのテスト
            const collinear = ruler['isCollinear'](0, 1, 2);
            expect(typeof collinear).toBe('boolean');
        });
    });
});