/* eslint-disable unicorn/no-process-exit */
import fs from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

export function getPackageJSON(cwd: string = process.cwd()): any {
  const path = resolve(cwd, 'package.json');

  if (!fs.existsSync(path)) {
    return;
  }

  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    console.warn('Failed to parse package.json');
    process.exit(1);
  }
}
