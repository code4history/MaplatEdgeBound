import { describe, it, expect, beforeEach } from 'vitest';
import { BitSet8, BitSet16, BitSet32 } from '../src/common/bitset';
import type { BitSet } from '../src/common/bitset';

function checkEmpty(bs: BitSet, size: number) {
  for (let i = 0; i < size; i++) {
    expect(bs.has(i)).toBe(false);
  }
}

function checkFull(bs: BitSet, size: number) {
  for (let i = 0; i < size; i++) {
    expect(bs.has(i)).toBe(true);
  }
}

describe('BitSet Tests', () => {
  const sizes = [0, 1, 2, 3, 7, 8, 9, 14, 15, 16, 17, 18, 126, 127, 128, 129, 130];
  const bitSets = [BitSet8, BitSet16, BitSet32];

  bitSets.forEach(BitSetClass => {
    describe(BitSetClass.name, () => {
      sizes.forEach(size => {
        describe(`size ${size}`, () => {
          let bs: BitSet;

          beforeEach(() => {
            bs = new BitSetClass(size);
          });

          it('should start empty', () => {
            checkEmpty(bs, size);
          });

          it('should handle adding all bits', () => {
            for (let i = 0; i < size; i++) {
              bs.add(i);
              expect(bs.has(i)).toBe(true);
            }
            checkFull(bs, size);
          });

          it('should handle deleting all bits', () => {
            // First add all bits
            for (let i = 0; i < size; i++) {
              bs.add(i);
            }
            checkFull(bs, size);

            // Then delete them
            for (let i = 0; i < size; i++) {
              bs.delete(i);
              expect(bs.has(i)).toBe(false);
            }
            checkEmpty(bs, size);
          });

          it('should handle set operation', () => {
            // Set all bits to true
            for (let i = 0; i < size; i++) {
              bs.set(i, true);
              expect(bs.has(i)).toBe(true);
            }
            checkFull(bs, size);

            // Set all bits to false
            for (let i = 0; i < size; i++) {
              bs.set(i, false);
              expect(bs.has(i)).toBe(false);
            }
            checkEmpty(bs, size);
          });

          it('should handle alternating bits', () => {
            // Set every other bit
            for (let i = 0; i < size; i += 2) {
              bs.add(i);
            }

            // Verify pattern
            for (let i = 0; i < size; i++) {
              expect(bs.has(i)).toBe(i % 2 === 0);
            }
          });

          it('should handle forEach iteration', () => {
            // Add some test data
            const testBits = new Set<number>();
            for (let i = 0; i < size; i += 2) {
              bs.add(i);
              testBits.add(i);
            }

            // Check iteration
            const iteratedBits = new Set<number>();
            bs.forEach(idx => {
              iteratedBits.add(idx);
            });

            // Verify all bits were iterated
            expect(iteratedBits.size).toBe(testBits.size);
            for (const bit of testBits) {
              expect(iteratedBits.has(bit)).toBe(true);
            }
          });

          it('should handle modifications during iteration', () => {
            // Add initial bits
            for (let i = 0; i < size; i += 2) {
              bs.add(i);
            }

            // Modify during iteration
            const seen = new Set<number>();
            bs.forEach(idx => {
              seen.add(idx);
              // Add the next bit if within range
              if (idx + 1 < size) {
                bs.add(idx + 1);
              }
              // Remove current bit
              bs.delete(idx);
            });

            // Verify final state
            for (const idx of seen) {
              expect(bs.has(idx)).toBe(false);
            }
          });

          it('should handle edge cases', () => {
            if (size > 0) {
              // Test first bit
              bs.add(0);
              expect(bs.has(0)).toBe(true);
              bs.delete(0);
              expect(bs.has(0)).toBe(false);

              // Test last bit
              bs.add(size - 1);
              expect(bs.has(size - 1)).toBe(true);
              bs.delete(size - 1);
              expect(bs.has(size - 1)).toBe(false);
            }
          });

          it('should handle rapid add/delete sequences', () => {
            for (let i = 0; i < size; i++) {
              bs.add(i);
              expect(bs.has(i)).toBe(true);
              bs.delete(i);
              expect(bs.has(i)).toBe(false);
              bs.add(i);
              expect(bs.has(i)).toBe(true);
            }
          });

          it('should maintain consistency with multiple operations', () => {
            // Add all
            for (let i = 0; i < size; i++) {
              bs.add(i);
            }
            checkFull(bs, size);

            // Delete evens
            for (let i = 0; i < size; i += 2) {
              bs.delete(i);
            }

            // Verify pattern
            for (let i = 0; i < size; i++) {
              expect(bs.has(i)).toBe(i % 2 === 1);
            }

            // Set evens to true and odds to false
            for (let i = 0; i < size; i++) {
              bs.set(i, i % 2 === 0);
            }

            // Verify inverted pattern
            for (let i = 0; i < size; i++) {
              expect(bs.has(i)).toBe(i % 2 === 0);
            }
          });
        });
      });
    });
  });
});