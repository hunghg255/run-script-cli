import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { findWorkspaceRoot, getWorkspacePackages } from '../src/workspaces';
import { createFixture } from './utils';

describe('workspaces', () => {
  it('reads pnpm-workspace.yaml', () => {
    const root = createFixture({
      'package.json': { name: 'root' },
      'pnpm-workspace.yaml':
        "packages:\n  - 'packages/*'\n  - \"apps/web\" # comment\n  - '!packages/ignored'\n",
      'packages/a/package.json': { name: '@x/a' },
      'packages/b/package.json': { name: '@x/b' },
      'packages/ignored/package.json': { name: 'ignored' },
      'packages/no-pkg/readme.md': '',
      'apps/web/package.json': { name: 'web' },
      'apps/docs/package.json': { name: 'docs' },
    });

    expect(findWorkspaceRoot(join(root, 'packages/a'))).toBe(root);
    expect(getWorkspacePackages(root).map((p) => [p.name, p.path])).toEqual([
      ['root', '.'],
      ['@x/a', 'packages/a'],
      ['@x/b', 'packages/b'],
      ['web', 'apps/web'],
    ]);
  });

  it('reads package.json workspaces (array and object form)', () => {
    for (const workspaces of [['libs/**'], { packages: ['libs/**'] }]) {
      const root = createFixture({
        'package.json': { name: 'root', workspaces },
        'libs/a/package.json': { name: 'a' },
        'libs/group/b/package.json': { name: 'b' },
        'libs/a/node_modules/dep/package.json': { name: 'dep' },
      });

      expect(getWorkspacePackages(root).map((p) => p.name)).toEqual(['root', 'a', 'b']);
    }
  });

  it('falls back to the path when a package has no name', () => {
    const root = createFixture({
      'package.json': { workspaces: ['pkg'] },
      'pkg/package.json': {},
    });

    expect(getWorkspacePackages(root).map((p) => p.name)).toEqual(['.', 'pkg']);
  });

  it('returns undefined outside a workspace', () => {
    const root = createFixture({ 'package.json': {} });
    expect(findWorkspaceRoot(root)).toBeUndefined();
  });
});
