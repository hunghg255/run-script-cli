/* eslint-disable unicorn/no-process-exit */
import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

import { cancel, intro, isCancel, select } from '@clack/prompts';
import { execa } from 'execa';
import c from 'kleur';

export const AGENTS = ['npm', 'yarn', 'pnpm', 'bun', 'upm'] as const;

export type Agent = (typeof AGENTS)[number];

export type Command = 'run' | 'install' | 'frozen' | 'add' | 'remove' | 'execute';

// Lockfiles checked in order, the first match wins.
const LOCKS: [string, Agent][] = [
  ['upm.lock', 'upm'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
];

// First item is the binary, the rest are its arguments
const COMMANDS: Record<Agent, Record<Command, string[]>> = {
  npm: {
    run: ['npm', 'run'],
    install: ['npm', 'install'],
    frozen: ['npm', 'ci'],
    add: ['npm', 'install'],
    remove: ['npm', 'uninstall'],
    execute: ['npx'],
  },
  yarn: {
    run: ['yarn', 'run'],
    install: ['yarn', 'install'],
    frozen: ['yarn', 'install', '--frozen-lockfile'],
    add: ['yarn', 'add'],
    remove: ['yarn', 'remove'],
    execute: ['npx'],
  },
  pnpm: {
    run: ['pnpm', 'run'],
    install: ['pnpm', 'install'],
    frozen: ['pnpm', 'install', '--frozen-lockfile'],
    add: ['pnpm', 'add'],
    remove: ['pnpm', 'remove'],
    execute: ['pnpm', 'dlx'],
  },
  bun: {
    run: ['bun', 'run'],
    install: ['bun', 'install'],
    frozen: ['bun', 'install', '--frozen-lockfile'],
    add: ['bun', 'add'],
    remove: ['bun', 'remove'],
    execute: ['bunx'],
  },
  upm: {
    run: ['upm', 'run'],
    install: ['upm', 'install'],
    frozen: ['upm', 'install', '--frozen-lockfile'],
    add: ['upm', 'add'],
    remove: ['upm', 'remove'],
    execute: ['upx'],
  },
};

function isAgent(name: unknown): name is Agent {
  return AGENTS.includes(name as Agent);
}

function readPackageManagerField(dir: string): Agent | undefined {
  const pkgPath = join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return;
  }

  try {
    const pm = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).packageManager;
    if (typeof pm === 'string') {
      const name = pm.replace(/^\^/, '').split('@')[0];
      if (isAgent(name)) {
        return name;
      }
    }
  } catch {}
}

/**
 * Detect the package manager used by the project, walking up from `cwd`.
 * The `packageManager` field in package.json takes priority over lockfiles.
 */
export function detectAgent(cwd: string = process.cwd()): Agent | undefined {
  let dir = resolve(cwd);

  while (true) {
    const fromField = readPackageManagerField(dir);
    if (fromField) {
      return fromField;
    }

    for (const [lock, agent] of LOCKS) {
      if (fs.existsSync(join(dir, lock))) {
        return agent;
      }
    }

    const parent = dirname(dir);
    if (parent === dir) {
      return;
    }
    dir = parent;
  }
}

export async function selectAgent(): Promise<Agent> {
  const agent = await select({
    message: c.bgCyan(' Choose package manager '),
    options: AGENTS.map((name) => ({
      label: c.yellow(name),
      value: name,
    })),
  });

  if (isCancel(agent)) {
    cancel('Choose package manager cancelled');
    process.exit(0);
  }

  return agent as Agent;
}

/**
 * Detect the agent, falling back to asking the user when nothing is found.
 */
export async function resolveAgent(cwd: string = process.cwd()): Promise<Agent> {
  return detectAgent(cwd) ?? (await selectAgent());
}

export function getCommand(agent: Agent, command: Command, args: string[] = []): string[] {
  const base = COMMANDS[agent][command];

  // npm treats `--flags` after the script name as its own options unless separated by `--`
  if (command === 'run' && agent === 'npm' && args.length > 1) {
    return [...base, ...args.slice(0, 1), '--', ...args.slice(1)];
  }

  return [...base, ...args];
}

export async function runCommand(cmd: string[], cwd: string = process.cwd()) {
  const [bin, ...args] = cmd as [string, ...string[]];

  intro(c.bold(c.green(`${cmd.join(' ')}\n`)));

  try {
    await execa(bin, args, { stdio: 'inherit', cwd });
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      console.error(c.red(`\n${bin} is not installed or not in PATH`));
    }
    process.exit(typeof error?.exitCode === 'number' ? error.exitCode : 1);
  }
}
