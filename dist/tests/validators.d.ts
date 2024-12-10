import { default as Constrainautor, DelaunatorLike } from '../src/Constrainautor';

type P2 = [number, number];
type PTS = P2[];
/**
 * Maps keys to sets of values.
 */
declare class SetMap<Key, Value> extends Map<Key, Set<Value>> {
    set(key: Key, val: Set<Value>): this;
    set(key: Key, val: Value): this;
    delete(key: Key, val?: Value): boolean;
}
export declare function validateDelaunator(points: PTS, del: DelaunatorLike): void;
export declare function validateVertMap(points: PTS, con: Constrainautor): void;
export declare function validateFlips(con: Constrainautor, clear?: boolean): void;
export declare function validateDelaunay(con: Constrainautor): void;
export declare function validateConstraint(points: PTS, con: Constrainautor, ret: number | undefined, p1: number, p2: number): void;
export declare function validateAllConstraints(points: PTS, edges: [number, number][], con: Constrainautor): void;
export type { DelaunatorLike } from '../src/Constrainautor';
export type { P2, PTS };
export { SetMap };
