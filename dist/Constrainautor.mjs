import { incircle as C, orient2d as j } from "robust-predicates";
import { BitSet8 as p } from "./BitSet.mjs";
function E(c) {
  return c % 3 === 2 ? c - 2 : c + 1;
}
function w(c) {
  return c % 3 === 0 ? c + 2 : c - 1;
}
const M = class M {
  /**
   * Make a Constrainautor.
   *
   * @param del The triangulation output from Delaunator.
   * @param edges If provided, constrain these edges as by constrainAll.
   */
  constructor(t, i) {
    if (!t || typeof t != "object" || !t.triangles || !t.halfedges || !t.coords)
      throw new Error("Expected an object with Delaunator output");
    if (t.triangles.length % 3 || t.halfedges.length !== t.triangles.length || t.coords.length % 2)
      throw new Error("Delaunator output appears inconsistent");
    if (t.triangles.length < 3)
      throw new Error("No edges in triangulation");
    this.del = t;
    const e = 2 ** 32 - 1, n = t.coords.length >> 1, s = t.triangles.length;
    this.vertMap = new Uint32Array(n).fill(e), this.flips = new p(s), this.consd = new p(s);
    for (let r = 0; r < s; r++) {
      const o = t.triangles[r];
      this.vertMap[o] === e && this.updateVert(r);
    }
    i && this.constrainAll(i);
  }
  /**
   * Constrain the triangulation such that there is an edge between p1 and p2.
   *
   * @param segP1 The index of one segment end-point in the coords array.
   * @param segP2 The index of the other segment end-point in the coords array.
   * @return The id of the edge that points from p1 to p2. If the 
   *         constrained edge lies on the hull and points in the opposite 
   *         direction (p2 to p1), the negative of its id is returned.
   */
  constrainOne(t, i) {
    const { triangles: e, halfedges: n } = this.del, s = this.vertMap, r = this.consd, o = s[t];
    let a = o;
    do {
      const f = e[a], m = E(a);
      if (f === i)
        return this.protect(a);
      const d = w(a), g = e[d];
      if (g === i)
        return this.protect(m), m;
      if (this.intersectSegments(t, i, g, f)) {
        a = d;
        break;
      }
      a = n[m];
    } while (a !== -1 && a !== o);
    let h = a, l = -1;
    for (; a !== -1; ) {
      const f = n[a], m = w(a), d = w(f), g = E(f);
      if (f === -1)
        throw new Error("Constraining edge exited the hull");
      if (r.has(a))
        throw new Error("Edge intersects already constrained edge");
      if (this.isCollinear(t, i, e[a]) || this.isCollinear(t, i, e[f]))
        throw new Error("Constraining edge intersects point");
      if (!this.intersectSegments(
        e[a],
        e[f],
        e[m],
        e[d]
      )) {
        if (l === -1 && (l = a), e[d] === i) {
          if (a === l)
            throw new Error("Infinite loop: non-convex quadrilateral");
          a = l, l = -1;
          continue;
        }
        if (this.intersectSegments(t, i, e[d], e[f]))
          a = d;
        else if (this.intersectSegments(t, i, e[g], e[d]))
          a = g;
        else if (l === a)
          throw new Error("Infinite loop: no further intersect after non-convex");
        continue;
      }
      if (this.flipDiagonal(a), this.intersectSegments(t, i, e[m], e[d]) && (l === -1 && (l = m), l === m))
        throw new Error("Infinite loop: flipped diagonal still intersects");
      e[d] === i ? (h = d, a = l, l = -1) : this.intersectSegments(t, i, e[g], e[d]) && (a = g);
    }
    const u = this.flips;
    this.protect(h);
    do {
      var v = 0;
      u.forEach((f) => {
        u.delete(f);
        const m = n[f];
        m !== -1 && (u.delete(m), this.isDelaunay(f) || (this.flipDiagonal(f), v++));
      });
    } while (v > 0);
    return this.findEdge(t, i);
  }
  /**
   * Fix the Delaunay condition. It is no longer necessary to call this
   * method after constraining (many) edges, since constrainOne will do it 
   * after each.
   *
   * @param deep If true, keep checking & flipping edges until all
   *        edges are Delaunay, otherwise only check the edges once.
   * @return The triangulation object.
   */
  delaunify(t = !1) {
    const i = this.del.halfedges, e = this.flips, n = this.consd, s = i.length;
    do {
      var r = 0;
      for (let o = 0; o < s; o++) {
        if (n.has(o))
          continue;
        e.delete(o);
        const a = i[o];
        a !== -1 && (e.delete(a), this.isDelaunay(o) || (this.flipDiagonal(o), r++));
      }
    } while (t && r > 0);
    return this;
  }
  /**
   * Call constrainOne on each edge, and delaunify afterwards.
   *
   * @param edges The edges to constrain: each element is an array with
   *        [p1, p2] which are indices into the points array originally 
   *        supplied to Delaunator.
   * @return The triangulation object.
   */
  constrainAll(t) {
    const i = t.length;
    for (let e = 0; e < i; e++) {
      const n = t[e];
      this.constrainOne(n[0], n[1]);
    }
    return this;
  }
  /**
   * Whether an edge is a constrained edge.
   *
   * @param edg The edge id.
   * @return True if the edge is constrained.
   */
  isConstrained(t) {
    return this.consd.has(t);
  }
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
  findEdge(t, i) {
    const e = this.vertMap[i], { triangles: n, halfedges: s } = this.del;
    let r = e, o = -1;
    do {
      if (n[r] === t)
        return r;
      o = E(r), r = s[o];
    } while (r !== -1 && r !== e);
    return n[E(o)] === t ? -o : 1 / 0;
  }
  /**
   * Mark an edge as constrained, i.e. should not be touched by `delaunify`.
   *
   * @private
   * @param edg The edge id.
   * @return If edg has an adjacent, returns that, otherwise -edg.
   */
  protect(t) {
    const i = this.del.halfedges[t], e = this.flips, n = this.consd;
    return e.delete(t), n.add(t), i !== -1 ? (e.delete(i), n.add(i), i) : -t;
  }
  /**
   * Mark an edge as flipped, unless it is already marked as constrained.
   *
   * @private
   * @param edg The edge id.
   * @return True if edg was not constrained.
   */
  markFlip(t) {
    const i = this.del.halfedges, e = this.flips;
    if (this.consd.has(t))
      return !1;
    const s = i[t];
    return s !== -1 && (e.add(t), e.add(s)), !0;
  }
  /**
   * Flip the edge shared by two triangles.
   *
   * @private
   * @param edg The edge shared by the two triangles, must have an
   *        adjacent half-edge.
   * @return The new diagonal.
   */
  flipDiagonal(t) {
    const { triangles: i, halfedges: e } = this.del, n = this.flips, s = this.consd, r = e[t], o = w(t), a = E(t), h = w(r), l = E(r), u = e[o], v = e[h];
    if (s.has(t))
      throw new Error("Trying to flip a constrained edge");
    return i[t] = i[h], e[t] = v, n.set(t, n.has(h)) || s.set(t, s.has(h)), v !== -1 && (e[v] = t), e[o] = h, i[r] = i[o], e[r] = u, n.set(r, n.has(o)) || s.set(r, s.has(o)), u !== -1 && (e[u] = r), e[h] = o, this.markFlip(t), this.markFlip(a), this.markFlip(r), this.markFlip(l), n.add(o), s.delete(o), n.add(h), s.delete(h), this.updateVert(t), this.updateVert(a), this.updateVert(r), this.updateVert(l), o;
  }
  /**
   * Whether the two triangles sharing edg conform to the Delaunay condition.
   * As a shortcut, if the given edge has no adjacent (is on the hull), it is
   * certainly Delaunay.
   *
   * @private
   * @param edg The edge shared by the triangles to test.
   * @return True if they are Delaunay.
   */
  isDelaunay(t) {
    const { triangles: i, halfedges: e } = this.del, n = e[t];
    if (n === -1)
      return !0;
    const s = i[w(t)], r = i[t], o = i[E(t)], a = i[w(n)];
    return !this.inCircle(s, r, o, a);
  }
  /**
   * Update the vertex -> incoming edge map.
   *
   * @private
   * @param start The id of an *outgoing* edge.
   * @return The id of the right-most incoming edge.
   */
  updateVert(t) {
    const { triangles: i, halfedges: e } = this.del, n = this.vertMap, s = i[t];
    let r = w(t), o = e[r];
    for (; o !== -1 && o !== t; )
      r = w(o), o = e[r];
    return n[s] = r, r;
  }
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
  intersectSegments(t, i, e, n) {
    const s = this.del.coords;
    return t === e || t === n || i === e || i === n ? !1 : D(
      s[t * 2],
      s[t * 2 + 1],
      s[i * 2],
      s[i * 2 + 1],
      s[e * 2],
      s[e * 2 + 1],
      s[n * 2],
      s[n * 2 + 1]
    );
  }
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
  inCircle(t, i, e, n) {
    const s = this.del.coords;
    return C(
      s[t * 2],
      s[t * 2 + 1],
      s[i * 2],
      s[i * 2 + 1],
      s[e * 2],
      s[e * 2 + 1],
      s[n * 2],
      s[n * 2 + 1]
    ) < 0;
  }
  /**
   * Whether point p1, p2, and p are collinear.
   *
   * @private
   * @param p1 The index of segment point 1 into this.del.coords.
   * @param p2 The index of segment point 2 into this.del.coords.
   * @param p The index of the point p into this.del.coords.
   * @return True if the points are collinear.
   */
  isCollinear(t, i, e) {
    const n = this.del.coords;
    return j(
      n[t * 2],
      n[t * 2 + 1],
      n[i * 2],
      n[i * 2 + 1],
      n[e * 2],
      n[e * 2 + 1]
    ) === 0;
  }
};
M.intersectSegments = D;
let S = M;
function D(c, t, i, e, n, s, r, o) {
  const a = j(c, t, n, s, r, o), h = j(i, e, n, s, r, o);
  if (a > 0 && h > 0 || a < 0 && h < 0)
    return !1;
  const l = j(n, s, c, t, i, e), u = j(r, o, c, t, i, e);
  return l > 0 && u > 0 || l < 0 && u < 0 ? !1 : a === 0 && h === 0 && l === 0 && u === 0 ? !(Math.max(n, r) < Math.min(c, i) || Math.max(c, i) < Math.min(n, r) || Math.max(s, o) < Math.min(t, e) || Math.max(t, e) < Math.min(s, o)) : !0;
}
export {
  S as default
};
