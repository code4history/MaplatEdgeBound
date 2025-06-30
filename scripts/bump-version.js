#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Get bump type from arguments
const bumpType = process.argv[2] || 'patch'; // major, minor, patch
if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Invalid bump type. Use: major, minor, or patch');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Calculate new version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update README files
const readmePath = path.join(rootDir, 'README.md');
const readmeJaPath = path.join(rootDir, 'README.ja.md');

// Update version in README.md
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  readmeContent = readmeContent.replace(
    /npm install @maplat\/edgebound@[\d.]+/g,
    `npm install @maplat/edgebound@${newVersion}`
  );
  fs.writeFileSync(readmePath, readmeContent);
  console.log('Updated README.md');
}

// Update version in README.ja.md
if (fs.existsSync(readmeJaPath)) {
  let readmeJaContent = fs.readFileSync(readmeJaPath, 'utf8');
  readmeJaContent = readmeJaContent.replace(
    /npm install @maplat\/edgebound@[\d.]+/g,
    `npm install @maplat/edgebound@${newVersion}`
  );
  fs.writeFileSync(readmeJaPath, readmeJaContent);
  console.log('Updated README.ja.md');
}

console.log(`Version bumped to ${newVersion}`);