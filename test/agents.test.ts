import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { detectAgent, getCommand } from '../src/agents';
import { createFixture } from './utils';

describe('detectAgent', () => {
  it.each([
    ['upm.lock', 'upm'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
    ['npm-shrinkwrap.json', 'npm'],
  ])('detects %s as %s', (lock, agent) => {
    const root = createFixture({ 'package.json': {}, [lock]: '' });
    expect(detectAgent(root)).toBe(agent);
  });

  it('prefers the packageManager field over lockfiles', () => {
    const root = createFixture({
      'package.json': { packageManager: 'pnpm@9.0.0+sha512.abc' },
      'yarn.lock': '',
    });
    expect(detectAgent(root)).toBe('pnpm');
  });

  it('ignores unknown packageManager values', () => {
    const root = createFixture({
      'package.json': { packageManager: 'foo@1.0.0' },
      'upm.lock': '',
    });
    expect(detectAgent(root)).toBe('upm');
  });

  it('walks up to find the lockfile', () => {
    const root = createFixture({
      'package.json': {},
      'pnpm-lock.yaml': '',
      'packages/a/package.json': {},
    });
    expect(detectAgent(join(root, 'packages/a'))).toBe('pnpm');
  });

  it('returns undefined when nothing is found', () => {
    const root = createFixture({ 'package.json': {} });
    expect(detectAgent(root)).toBeUndefined();
  });
});

describe('getCommand', () => {
  it('builds run commands', () => {
    expect(getCommand('upm', 'run', ['dev'])).toEqual(['upm', 'run', 'dev']);
    expect(getCommand('pnpm', 'run', ['dev', '--port', '3000'])).toEqual([
      'pnpm',
      'run',
      'dev',
      '--port',
      '3000',
    ]);
  });

  it('adds `--` for npm run with extra args', () => {
    expect(getCommand('npm', 'run', ['dev'])).toEqual(['npm', 'run', 'dev']);
    expect(getCommand('npm', 'run', ['dev', '--port', '3000'])).toEqual([
      'npm',
      'run',
      'dev',
      '--',
      '--port',
      '3000',
    ]);
  });

  it('builds install / add / remove commands', () => {
    expect(getCommand('upm', 'install')).toEqual(['upm', 'install']);
    expect(getCommand('npm', 'add', ['react'])).toEqual(['npm', 'install', 'react']);
    expect(getCommand('yarn', 'add', ['-D', 'vitest'])).toEqual(['yarn', 'add', '-D', 'vitest']);
    expect(getCommand('npm', 'remove', ['react'])).toEqual(['npm', 'uninstall', 'react']);
    expect(getCommand('upm', 'remove', ['react'])).toEqual(['upm', 'remove', 'react']);
  });

  it('builds frozen install commands', () => {
    expect(getCommand('npm', 'frozen')).toEqual(['npm', 'ci']);
    expect(getCommand('pnpm', 'frozen')).toEqual(['pnpm', 'install', '--frozen-lockfile']);
    expect(getCommand('upm', 'frozen')).toEqual(['upm', 'install', '--frozen-lockfile']);
  });

  it('builds execute commands', () => {
    expect(getCommand('npm', 'execute', ['cowsay'])).toEqual(['npx', 'cowsay']);
    expect(getCommand('pnpm', 'execute', ['cowsay'])).toEqual(['pnpm', 'dlx', 'cowsay']);
    expect(getCommand('bun', 'execute', ['cowsay'])).toEqual(['bunx', 'cowsay']);
    expect(getCommand('upm', 'execute', ['cowsay'])).toEqual(['upx', 'cowsay']);
  });
});
