/* eslint-disable unicorn/no-process-exit */
import fs from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

export function getPackageJSON(cwdParams?: any): any {
  const cwd = cwdParams ?? process.cwd();
  const path = resolve(cwd, 'package.json');

  if (fs.existsSync(path)) {
    try {
      const raw = fs.readFileSync(path, 'utf8');
      const data = JSON.parse(raw);
      return data;
    } catch {
      console.warn('Failed to parse package.json');
      process.exit(1);
    }
  }
}
