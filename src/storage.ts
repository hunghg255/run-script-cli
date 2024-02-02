/* eslint-disable import/export */
import type { Buffer } from 'node:buffer';
import { existsSync, promises as fs } from 'node:fs';
import os from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

const CLI_TEMP_DIR = join(os.tmpdir(), 'run-script-cli');
const storagePath = resolve(CLI_TEMP_DIR, '_storage.json');

export interface Storage {
  lastRunCommand?: string;
}

let storage: Storage | undefined;

interface TempFile {
  path: string;
  fd: fs.FileHandle;
  cleanup: () => void;
}

let counter = 0;

async function openTemp(): Promise<TempFile | undefined> {
  if (!existsSync(CLI_TEMP_DIR)) {
    await fs.mkdir(CLI_TEMP_DIR, { recursive: true });
  }

  const competitivePath = join(CLI_TEMP_DIR, `.${process.pid}.${counter}`);
  counter++;

  return fs
    .open(competitivePath, 'wx')
    .then((fd) => ({
      fd,
      path: competitivePath,
      cleanup() {
        fd.close().then(() => {
          if (existsSync(competitivePath)) {
            fs.unlink(competitivePath);
          }
        });
      },
    }))
    .catch((error: any) => {
      return error && error.code === 'EEXIST' ? openTemp() : undefined;
    });
}

/**
 * Write file safely avoiding conflicts
 */
export async function writeFileSafe(path: string, data: string | Buffer = ''): Promise<boolean> {
  const temp = await openTemp();

  if (temp) {
    fs.writeFile(temp.path, data)
      .then(() => {
        const directory = dirname(path);
        if (!existsSync(directory)) {
          fs.mkdir(directory, { recursive: true });
        }

        return fs
          .rename(temp.path, path)
          .then(() => true)
          .catch(() => false);
      })
      .catch(() => false)
      .finally(temp.cleanup);
  }

  return false;
}

export async function load(fn?: (storage: Storage) => Promise<boolean> | boolean) {
  if (!storage) {
    storage = existsSync(storagePath)
      ? JSON.parse((await fs.readFile(storagePath, 'utf8')) || '{}') || {}
      : {};
  }

  if (fn && (await fn(storage!))) {
    await dump();
  }

  return storage!;
}

export async function dump() {
  if (storage) {
    await writeFileSafe(storagePath, JSON.stringify(storage));
  }
}
