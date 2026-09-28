import { existsSync, promises as fs } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const CLI_TEMP_DIR = join(os.tmpdir(), 'run-script-cli');
const storagePath = join(CLI_TEMP_DIR, '_storage.json');

export interface Storage {
  /** Last run script, keyed by project directory */
  lastRunCommands?: Record<string, string>;
}

let storage: Storage | undefined;

/**
 * Write file atomically: write to a temp file then rename it over the target
 */
export async function writeFileSafe(path: string, data: string): Promise<boolean> {
  const temp = join(CLI_TEMP_DIR, `.${process.pid}.${Date.now()}.tmp`);

  try {
    await fs.mkdir(CLI_TEMP_DIR, { recursive: true });
    await fs.writeFile(temp, data);
    await fs.rename(temp, path);
    return true;
  } catch {
    await fs.unlink(temp).catch(() => {});
    return false;
  }
}

export async function load(): Promise<Storage> {
  if (!storage) {
    try {
      storage = existsSync(storagePath)
        ? JSON.parse((await fs.readFile(storagePath, 'utf8')) || '{}') || {}
        : {};
    } catch {
      storage = {};
    }
  }

  return storage!;
}

export async function dump() {
  if (storage) {
    await writeFileSafe(storagePath, JSON.stringify(storage));
  }
}
