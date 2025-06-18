import { describe, it, expect } from 'vitest';
import Delaunator from 'delaunator';
import { Constrain } from '../src/variant/constrain';
import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

interface TestFile {
  points: [number, number][];
  edges: [number, number][];
  error?: string;
  source?: string;
  name: string;
}

function isDir(path: string): boolean {
  return (existsSync( path ) && statSync( path ).isDirectory());
}

function loadTestFiles(testDir?: string): TestFile[] {
  if (!testDir) testDir = join(__dirname, 'cases');
  const files = readdirSync(testDir);
  return files.reduce((prev: TestFile[], file:string): TestFile[] => {
    const filePath = join(testDir, file);
    if (isDir(filePath)) {
      return prev.concat(loadTestFiles(filePath));
    } else if (file.endsWith('.json')) {
      const content = readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      prev.push({
        ...data,
        name: file
      });
    }
    return prev;
  }, [] as TestFile[]);
}

describe('Constrain Tests', () => {
  const testFiles = loadTestFiles();

  testFiles.forEach(file => {
    describe(file.name, () => {
      it('should handle constraints correctly', () => {
        const del = Delaunator.from(file.points);
        const con = new Constrain(del);

        if (file.error) {
          expect(() => con.constrainAll(file.edges)).toThrow(file.error);
        } else {
          expect(() => con.constrainAll(file.edges)).not.toThrow();
        }
      });
    });
  });
});