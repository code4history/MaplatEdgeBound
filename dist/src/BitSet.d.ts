/**
 * A set of numbers, stored as bits in a typed array. The amount of numbers /
 * the maximum number that can be stored is limited by the length, which is
 * fixed at construction time.
 */
declare abstract class BitSet {
    protected readonly bs: Uint8Array | Uint16Array | Uint32Array;
    protected readonly W: 8 | 16 | 32;
    protected constructor(W: typeof BitSet.prototype.W, bs: typeof BitSet.prototype.bs);
    /**
     * Add a number to the set.
     *
     * @param idx The number to add. Must be 0 <= idx < len.
     * @return this.
     */
    add(idx: number): this;
    /**
     * Delete a number from the set.
     *
     * @param idx The number to delete. Must be 0 <= idx < len.
     * @return this.
     */
    delete(idx: number): this;
    /**
     * Add or delete a number in the set, depending on the second argument.
     *
     * @param idx The number to add or delete. Must be 0 <= idx < len.
     * @param val If true, add the number, otherwise delete.
     * @return val.
     */
    set(idx: number, val: boolean): boolean;
    /**
     * Whether the number is in the set.
     *
     * @param idx The number to test. Must be 0 <= idx < len.
     * @return True if the number is in the set.
     */
    has(idx: number): boolean;
    /**
     * Iterate over the numbers that are in the set. The callback is invoked
     * with each number that is set. It is allowed to change the BitSet during
     * iteration. If it deletes a number that has not been iterated over, that
     * number will not show up in a later call. If it adds a number during
     * iteration, that number may or may not show up in a later call.
     *
     * @param fn The function to call for each number.
     * @return this.
     */
    forEach(fn: (idx: number) => void): this;
}
export type { BitSet };
/**
 * A bit set using 8 bits per cell.
 */
export declare class BitSet8 extends BitSet {
    /**
     * Create a bit set.
     *
     * @param len The length of the bit set, limiting the maximum value that
     *        can be stored in it to len - 1.
     */
    constructor(len: number);
}
/**
 * A bit set using 16 bits per cell.
 */
export declare class BitSet16 extends BitSet {
    /**
     * Create a bit set.
     *
     * @param len The length of the bit set, limiting the maximum value that
     *        can be stored in it to len - 1.
     */
    constructor(len: number);
}
/**
 * A bit set using 32 bits per cell.
 */
export declare class BitSet32 extends BitSet {
    /**
     * Create a bit set.
     *
     * @param len The length of the bit set, limiting the maximum value that
     *        can be stored in it to len - 1.
     */
    constructor(len: number);
}
