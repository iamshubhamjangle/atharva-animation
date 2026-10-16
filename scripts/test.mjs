import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const buildDirectory = resolve(process.cwd(), '.test-build');
if (dirname(buildDirectory) !== process.cwd()) throw new Error('Test output must stay inside the project.');
await mkdir(buildDirectory, { recursive: true });
try {
  await build({ entryPoints: ['tests/story.test.ts'], bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: '.test-build/story.mjs' });
  await import('../.test-build/story.mjs');
} finally { await rm(buildDirectory, { recursive: true, force: true }); }
