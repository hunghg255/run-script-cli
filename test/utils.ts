import fs from 'node:fs';
import os from 'node:os';
import { dirname, join } from 'node:path';

/**
 * Create a temp directory with the given files, a string is written as-is, objects as JSON
 */
export function createFixture(files: Record<string, string | object>): string {
  const root = fs.realpathSync(fs.mkdtempSync(join(os.tmpdir(), 'run-script-cli-')));

  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    fs.mkdirSync(dirname(full), { recursive: true });
    fs.writeFileSync(full, typeof content === 'string' ? content : JSON.stringify(content));
  }

  return root;
}
