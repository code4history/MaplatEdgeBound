import { describe, it, expect, beforeEach } from 'vitest';
import Constrainautor from '../src/Constrainautor';
import Delaunator from 'delaunator';
import { validateDelaunator, validateVertMap, validateConstraint, 
         validateFlips, validateAllConstraints, validateDelaunay } from './validators';

type P2 = [number, number];

describe('Constrainautor', () => {
  describe('Constructor Tests', () => {
    it('should throw on no argument', () => {
      // @ts-ignore
      expect(() => new Constrainautor()).toThrow(/Expected an object with Delaunator output/);
    });

    it('should throw on empty object', () => {
      // @ts-ignore
      expect(() => new Constrainautor({})).toThrow(/Expected an object with Delaunator output/);
    });

    it('should throw on invalid object', () => {
      // @ts-ignore
      expect(() => new Constrainautor({foo: 12})).toThrow(/Expected an object with Delaunator output/);
    });

    it('should throw on inconsistent Delaunation (triangles)', () => {
      // @ts-ignore
      expect(() => new Constrainautor({
        triangles: [1], 
        halfedges: [1], 
        coords: [1, 2]
      })).toThrow(/Delaunator output appears inconsistent/);
    });

    it('should throw on inconsistent Delaunation (halfedges)', () => {
      // @ts-ignore
      expect(() => new Constrainautor({
        triangles: [1, 2, 3], 
        halfedges: [1], 
        coords: [1, 2]
      })).toThrow(/Delaunator output appears inconsistent/);
    });

    it('should throw on inconsistent Delaunation (coords)', () => {
      // @ts-ignore
      expect(() => new Constrainautor({
        triangles: [1, 2, 3], 
        halfedges: [0, 1, 2], 
        coords: [1]
      })).toThrow(/Delaunator output appears inconsistent/);
    });

    it('should throw on empty Delaunation', () => {
      // @ts-ignore
      expect(() => new Constrainautor({
        triangles: [], 
        halfedges: [], 
        coords: [1, 2]
      })).toThrow(/No edges in triangulation/);
    });
  });

  describe('Example Test', () => {
    it('should handle basic constraint', () => {
      const points: P2[] = [[150, 50], [50, 200], [150, 350], [250, 200]];
      const del = Delaunator.from(points);
      const con = new Constrainautor(del);
      
      con.constrainAll([[0, 2]]);
      
      expect(() => validateConstraint(points, con, undefined, 0, 2)).not.toThrow();
      expect(() => validateDelaunator(points, con.del)).not.toThrow();
      expect(() => validateVertMap(points, con)).not.toThrow();
      expect(() => validateFlips(con, true)).not.toThrow();
    });
  });

  describe('Constraints', () => {
    let points: P2[];
    let del: Delaunator<Float64Array>;
    let con: Constrainautor;

    beforeEach(() => {
      points = [[150, 50], [50, 200], [150, 350], [250, 200]];
      del = Delaunator.from(points);
      con = new Constrainautor(del);
    });

    it('should constrain single edge', () => {
      const edge = con.constrainOne(0, 2);
      expect(edge).toBeDefined();
      expect(() => validateConstraint(points, con, edge, 0, 2)).not.toThrow();
    });

    it('should maintain Delaunay condition after constraint', () => {
      con.constrainOne(0, 2);
      con.delaunify(true);
      expect(() => validateDelaunay(con)).not.toThrow();
    });

    it('should handle multiple constraints', () => {
      con.constrainAll([[0, 1], [2, 3]]);
      expect(() => validateAllConstraints(points, [[0, 1], [2, 3]], con)).not.toThrow();
    });
  });
});