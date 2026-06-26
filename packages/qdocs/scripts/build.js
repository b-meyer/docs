#!/usr/bin/env node
// Runs src/build.ts directly via Node 22's --experimental-strip-types, eliminating
// the need for a pre-compiled dist/. No `vp run core#build` step required.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const result = spawnSync(
  process.execPath,
  [
    '--experimental-strip-types',
    resolve(import.meta.dirname, '../src/build.ts'),
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit', env: process.env },
);

process.exit(result.status ?? 0);
