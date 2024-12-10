import { BitSet } from './BitSet';

export interface DelaunatorLike {
    coords: {
        readonly length: number;
        readonly [n: number]: number;
    };
    triangles: {
        readonly length: number;
        [n: number]: number;
    };
    halfedges: {
        readonly length: number;
        [n: number]: number;
    };
    hull: {
        readonly length: number;
        readonly [n: number]: number;
    };
}
/**
 * Constrain a triangulation from Delaunator, using (parts of) the algorithm
 * in "A fast algorithm for generating constrained Delaunay triangulations" by
 * S. W. Sloan.
 */
declare class Constrainautor {
    /**
     * @member del The triangulation object from Delaunator, which will be
     * moddified by Constrainautor.
     */
    del: DelaunatorLike;
    vertMap: Uint32Array;
    flips: BitSet;
    consd: BitSet;
    /**
     * Make a Constrainautor.
     *
     * @param del The triangulation output from Delaunator.
     * @param edges If provided, constrain these edges as by constrainAll.
     */
    constructor(del: DelaunatorLike, edges?: readonly [number, number][]);
    /**
     * Constrain the triangulation such that there is an edge between p1 and p2.
     *
     * @param segP1 The index of one segment end-point in the coords array.
     * @param segP2 The index of the other segment end-point in the coords array.
     * @return The id of the edge that points from p1 to p2. If the
     *         constrained edge lies on the hull and points in the opposite
     *         direction (p2 to p1), the negative of its id is returned.
     */
    constrainOne(segP1: number, segP2: number): number;
    /**
     * Fix the Delaunay condition. It is no longer necessary to call this
     * method after constraining (many) edges, since constrainOne will do it
     * after each.
     *
     * @param deep If true, keep checking & flipping edges until all
     *        edges are Delaunay, otherwise only check the edges once.
     * @return The triangulation object.
     */
    delaunify(deep?: boolean): this;
    /**
     * Call constrainOne on each edge, and delaunify afterwards.
     *
     * @param edges The edges to constrain: each element is an array with
     *        [p1, p2] which are indices into the points array originally
     *        supplied to Delaunator.
     * @return The triangulation object.
     */
    constrainAll(edges: readonly [number, number][]): this;
    /**
     * Whether an edge is a constrained edge.
     *
     * @param edg The edge id.
     * @return True if the edge is constrained.
     */
    isConstrained(edg: number): boolean;
    /**
     * Find the edge that points from p1 -> p2. If there is only an edge from
     * p2 -> p1 (i.e. it is on the hull), returns the negative id of it.
     *
     * @param p1 The index of the first point into the points array.
     * @param p2 The index of the second point into the points array.
     * @return The id of the edge that points from p1 -> p2, or the negative
     *         id of the edge that goes from p2 -> p1, or Infinity if there is
     *         no edge between p1 and p2.
     */
    findEdge(p1: number, p2: number): number;
    /**
     * Mark an edge as constrained, i.e. should not be touched by `delaunify`.
     *
     * @private
     * @param edg The edge id.
     * @return If edg has an adjacent, returns that, otherwise -edg.
     */
    private protect;
    /**
     * Mark an edge as flipped, unless it is already marked as constrained.
     *
     * @private
     * @param edg The edge id.
     * @return True if edg was not constrained.
     */
    private markFlip;
    /**
     * Flip the edge shared by two triangles.
     *
     * @private
     * @param edg The edge shared by the two triangles, must have an
     *        adjacent half-edge.
     * @return The new diagonal.
     */
    private flipDiagonal;
    /**
     * Whether the two triangles sharing edg conform to the Delaunay condition.
     * As a shortcut, if the given edge has no adjacent (is on the hull), it is
     * certainly Delaunay.
     *
     * @private
     * @param edg The edge shared by the triangles to test.
     * @return True if they are Delaunay.
     */
    private isDelaunay;
    /**
     * Update the vertex -> incoming edge map.
     *
     * @private
     * @param start The id of an *outgoing* edge.
     * @return The id of the right-most incoming edge.
     */
    private updateVert;
    /**
     * Whether the segment between [p1, p2] intersects with [p3, p4]. When the
     * segments share an end-point (e.g. p1 == p3 etc.), they are not considered
     * intersecting.
     *
     * @private
     * @param p1 The index of point 1 into this.del.coords.
     * @param p2 The index of point 2 into this.del.coords.
     * @param p3 The index of point 3 into this.del.coords.
     * @param p4 The index of point 4 into this.del.coords.
     * @return True if the segments intersect.
     */
    protected intersectSegments(p1: number, p2: number, p3: number, p4: number): boolean;
    /**
     * Whether point px is in the circumcircle of the triangle formed by p1, p2,
     * and p3 (which are in counter-clockwise order).
     *
     * @param p1 The index of point 1 into this.del.coords.
     * @param p2 The index of point 2 into this.del.coords.
     * @param p3 The index of point 3 into this.del.coords.
     * @param px The index of point x into this.del.coords.
     * @return True if (px, py) is in the circumcircle.
     */
    protected inCircle(p1: number, p2: number, p3: number, px: number): boolean;
    /**
     * Whether point p1, p2, and p are collinear.
     *
     * @private
     * @param p1 The index of segment point 1 into this.del.coords.
     * @param p2 The index of segment point 2 into this.del.coords.
     * @param p The index of the point p into this.del.coords.
     * @return True if the points are collinear.
     */
    protected isCollinear(p1: number, p2: number, p: number): boolean;
    static intersectSegments: typeof intersectSegments;
}
/**
 * Compute if two line segments [p1, p2] and [p3, p4] intersect.
 *
 * @name Constrainautor.intersectSegments
 * @source https://github.com/mikolalysenko/robust-segment-intersect
 * @param p1x The x coordinate of point 1 of the first segment.
 * @param p1y The y coordinate of point 1 of the first segment.
 * @param p2x The x coordinate of point 2 of the first segment.
 * @param p2y The y coordinate of point 2 of the first segment.
 * @param p3x The x coordinate of point 1 of the second segment.
 * @param p3y The y coordinate of point 1 of the second segment.
 * @param p4x The x coordinate of point 2 of the second segment.
 * @param p4y The y coordinate of point 2 of the second segment.
 * @return True if the line segments intersect.
 */
declare function intersectSegments(p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, p4x: number, p4y: number): boolean;
export default Constrainautor;
