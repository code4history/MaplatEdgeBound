class h {
  constructor(t, s) {
    this.W = t, this.bs = s;
  }
  /**
   * Add a number to the set.
   * 
   * @param idx The number to add. Must be 0 <= idx < len.
   * @return this.
   */
  add(t) {
    const s = this.W, e = t / s | 0, i = t % s;
    return this.bs[e] |= 1 << i, this;
  }
  /**
   * Delete a number from the set.
   * 
   * @param idx The number to delete. Must be 0 <= idx < len.
   * @return this.
   */
  delete(t) {
    const s = this.W, e = t / s | 0, i = t % s;
    return this.bs[e] &= ~(1 << i), this;
  }
  /**
   * Add or delete a number in the set, depending on the second argument.
   * 
   * @param idx The number to add or delete. Must be 0 <= idx < len.
   * @param val If true, add the number, otherwise delete.
   * @return val.
   */
  set(t, s) {
    const e = this.W, i = t / e | 0, r = t % e, n = 1 << r;
    return this.bs[i] ^= (-s ^ this.bs[i]) & n, s;
  }
  /**
   * Whether the number is in the set.
   * 
   * @param idx The number to test. Must be 0 <= idx < len.
   * @return True if the number is in the set.
   */
  has(t) {
    const s = this.W, e = t / s | 0, i = t % s;
    return !!(this.bs[e] & 1 << i);
  }
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
  forEach(t) {
    const s = this.W, e = this.bs, i = e.length;
    for (let r = 0; r < i; r++) {
      let n = 0;
      for (; e[r] && n < s; )
        e[r] & 1 << n && t(r * s + n), n++;
    }
    return this;
  }
}
class b extends h {
  /**
   * Create a bit set.
   * 
   * @param len The length of the bit set, limiting the maximum value that
   *        can be stored in it to len - 1.
   */
  constructor(t) {
    const e = new Uint8Array(Math.ceil(t / 8)).fill(0);
    super(8, e);
  }
}
class W extends h {
  /**
   * Create a bit set.
   * 
   * @param len The length of the bit set, limiting the maximum value that
   *        can be stored in it to len - 1.
   */
  constructor(t) {
    const e = new Uint16Array(Math.ceil(t / 16)).fill(0);
    super(16, e);
  }
}
class o extends h {
  /**
   * Create a bit set.
   * 
   * @param len The length of the bit set, limiting the maximum value that
   *        can be stored in it to len - 1.
   */
  constructor(t) {
    const e = new Uint32Array(Math.ceil(t / 32)).fill(0);
    super(32, e);
  }
}
export {
  W as BitSet16,
  o as BitSet32,
  b as BitSet8
};
