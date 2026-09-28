import fs from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

export interface WorkspacePackage {
  name: string;
  dir: string;
  /** Path relative to the workspace root, `.` for the root itself */
  path: string;
}

function readJSON(path: string): any {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {}
}

/**
 * Read `packages:` globs from pnpm-workspace.yaml, supports the list syntax only
 */
function readPnpmWorkspace(dir: string): string[] | undefined {
  const path = join(dir, 'pnpm-workspace.yaml');
  if (!fs.existsSync(path)) {
    return;
  }

  const patterns: string[] = [];
  let inPackages = false;

  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (/^packages\s*:/.test(line)) {
      inPackages = true;
      continue;
    }
    if (!inPackages || /^\s*(#.*)?$/.test(line)) {
      continue;
    }

    const match = line.match(/^\s+-\s*["']?([^"#']+?)["']?\s*(#.*)?$/);
    if (!match) {
      break;
    }
    patterns.push(match[1]!);
  }

  return patterns;
}

function readWorkspacePatterns(dir: string): string[] | undefined {
  const fromPnpm = readPnpmWorkspace(dir);
  if (fromPnpm) {
    return fromPnpm;
  }

  const workspaces = readJSON(join(dir, 'package.json'))?.workspaces;
  if (Array.isArray(workspaces)) {
    return workspaces;
  }
  if (Array.isArray(workspaces?.packages)) {
    return workspaces.packages;
  }
}

/**
 * Find the closest workspace root, walking up from `cwd`
 */
export function findWorkspaceRoot(cwd: string = process.cwd()): string | undefined {
  let dir = resolve(cwd);

  while (true) {
    if (readWorkspacePatterns(dir)) {
      return dir;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      return;
    }
    dir = parent;
  }
}

function listDirs(dir: string, recursive: boolean): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const dirs: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue;
    }
    const full = join(dir, entry.name);
    dirs.push(full);
    if (recursive) {
      dirs.push(...listDirs(full, true));
    }
  }
  return dirs;
}

/**
 * Expand a workspace pattern. Supports `dir`, `dir/*` and `dir/**`
 */
function expandPattern(root: string, pattern: string): string[] {
  const clean = pattern.replace(/^\.\//, '').replace(/\/$/, '');

  if (clean.endsWith('/**')) {
    return listDirs(join(root, clean.slice(0, -3)), true);
  }
  if (clean.endsWith('/*')) {
    return listDirs(join(root, clean.slice(0, -2)), false);
  }
  return [join(root, clean)];
}

/**
 * List all packages of the workspace at `root`, the root package first
 */
export function getWorkspacePackages(root: string): WorkspacePackage[] {
  const patterns = readWorkspacePatterns(root) || [];
  const include = patterns.filter((p) => !p.startsWith('!'));
  const exclude = new Set(
    patterns.filter((p) => p.startsWith('!')).flatMap((p) => expandPattern(root, p.slice(1))),
  );

  const dirs = new Set([root, ...include.flatMap((p) => expandPattern(root, p))]);
  const packages: WorkspacePackage[] = [];

  for (const dir of dirs) {
    if (exclude.has(dir)) {
      continue;
    }
    const pkg = readJSON(join(dir, 'package.json'));
    if (!pkg) {
      continue;
    }
    const path = relative(root, dir) || '.';
    packages.push({ name: pkg.name || path, dir, path });
  }

  return packages;
}
