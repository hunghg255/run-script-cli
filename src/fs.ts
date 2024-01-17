import fs from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

export function getPackageJSON(): any {
  const cwd = process.cwd();
  const path = resolve(cwd, 'package.json');

  if (fs.existsSync(path)) {
    const raw = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    return data;
  }
}
