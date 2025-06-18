/**
 * @maplat/edgebound - A library for dual-constraining a Delaunator triangulation
 * 
 * This is the main entry point for the library.
 * Currently exports the Constrain class for edge-constrained triangulation.
 * Future versions will include additional functionality.
 */

// Main exports
export { default as Constrain } from './variant/constrain';
export { default } from './variant/constrain';
export type { DelaunatorLike } from './common/base';

// Future exports (v0.3.0):
// export { someFunction } from './future/module.ts';
// export { anotherFunction } from './future/another.ts';