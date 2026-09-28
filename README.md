<p align="center">
<a href="https://www.npmjs.com/package/run-script-cli" target="_blank" rel="noopener noreferrer">
<img src="https://github.com/hunghg255/run-script-cli/blob/main/assets/icon.png?raw=true" alt="logo" width='100'/></a>
</p>

<p align="center">
  Run script auto-detect package manager: npm, yarn, pnpm, bun, upm
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/run-script-cli" target="_blank" rel="noopener noreferrer"><img src="https://badge.fury.io/js/run-script-cli.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/run-script-cli" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dt/run-script-cli.svg?logo=npm" alt="NPM Downloads" /></a>
  <a href="https://bundlephobia.com/result?p=run-script-cli" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/bundlephobia/minzip/run-script-cli" alt="Minizip" /></a>
  <a href="https://github.com/hunghg255/run-script-cli/graphs/contributors" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/all_contributors-1-orange.svg" alt="Contributors" /></a>
  <a href="https://github.com/hunghg255/run-script-cli/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/hunghg255/run-script-cli" alt="License" /></a>
</p>

## ✨ Features

- 🔍 **Auto-detect** the package manager: `npm`, `yarn`, `pnpm`, `bun` and [`upm`](https://github.com/unjs/upm)
- 🔎 **Search scripts** by name or description in an interactive picker
- 🔁 **Rerun** the last script of a project with `nr -`
- 🗂️ **Monorepo** support: pick a workspace package, then a script
- 📝 **Script descriptions** shown in the picker
- 🧩 Usable as a **library** too

## 📦 Installation

```bash
npm install -g run-script-cli
```

Requires Node.js 18+.

## 🚀 Commands

### `nr` - run a script

```bash
# Pick a script to run (type to filter by name or description)
nr

# Run a specific script
nr dev

# Pass extra args to the script (`--` is added automatically for npm)
nr dev --port 3000

# Rerun the last script of this project
nr -
nr - --port 3000
```

The last script is remembered per project and preselected the next time you run `nr`.

All commands accept `-v` / `--version` to print the installed version.

### `ni` - install

```bash
# Install dependencies
ni

# Add packages
ni react
ni -D vitest
```

### `nci` - clean install

Installs exactly what is in the lockfile, useful for CI.

```bash
nci
```

### `nu` - uninstall

```bash
nu react
```

### `nlx` - execute a package without installing it

```bash
nlx cowsay hello
```

### Command mapping

| Command      | npm                   | yarn                             | pnpm                             | bun                             | upm                             |
| ------------ | --------------------- | -------------------------------- | -------------------------------- | ------------------------------- | ------------------------------- |
| `nr dev`     | `npm run dev`         | `yarn run dev`                   | `pnpm run dev`                   | `bun run dev`                   | `upm run dev`                   |
| `ni`         | `npm install`         | `yarn install`                   | `pnpm install`                   | `bun install`                   | `upm install`                   |
| `ni react`   | `npm install react`   | `yarn add react`                 | `pnpm add react`                 | `bun add react`                 | `upm add react`                 |
| `nci`        | `npm ci`              | `yarn install --frozen-lockfile` | `pnpm install --frozen-lockfile` | `bun install --frozen-lockfile` | `upm install --frozen-lockfile` |
| `nu react`   | `npm uninstall react` | `yarn remove react`              | `pnpm remove react`              | `bun remove react`              | `upm remove react`              |
| `nlx cowsay` | `npx cowsay`          | `npx cowsay`                     | `pnpm dlx cowsay`                | `bunx cowsay`                   | `upx cowsay`                    |

## 🔍 Package manager detection

Starting from the current directory and walking up to the root, the first match wins:

1. The `packageManager` field in `package.json` (e.g. `"packageManager": "pnpm@9.0.0"`)
2. A lockfile:

| Lockfile                                   | Package manager |
| ------------------------------------------ | --------------- |
| `upm.lock`                                 | upm             |
| `bun.lock`, `bun.lockb`                    | bun             |
| `pnpm-lock.yaml`                           | pnpm            |
| `yarn.lock`                                | yarn            |
| `package-lock.json`, `npm-shrinkwrap.json` | npm             |

If nothing is found, you'll be asked to choose one.

## 🗂️ Monorepo

Use `-w` (or `--workspace`) to pick a workspace package first, then a script. The script runs inside that package's directory.

```bash
# Pick a package, then a script
nr -w

# Pick a package, then run its `build` script
nr -w build
```

Workspaces are read from `pnpm-workspace.yaml` or the `workspaces` field in `package.json`. Patterns like `packages/*`, `packages/**` and `!packages/ignored` are supported.

## 📝 Script descriptions

By default the picker shows each script's command. You can show a description instead, in either of two ways:

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
  },
  "scripts-info": {
    "dev": "Start the dev server",
    "build": "Build for production",
  },
}
```

```jsonc
{
  "scripts": {
    "?dev": "Start the dev server",
    "dev": "vite",
  },
}
```

## 🧩 API

```ts
import { detectAgent, getCommand, findWorkspaceRoot, getWorkspacePackages } from 'run-script-cli';

detectAgent(process.cwd()); // 'npm' | 'yarn' | 'pnpm' | 'bun' | 'upm' | undefined

getCommand('pnpm', 'add', ['react']); // ['pnpm', 'add', 'react']
getCommand('npm', 'run', ['dev', '--port', '3000']); // ['npm', 'run', 'dev', '--', '--port', '3000']

const root = findWorkspaceRoot(process.cwd());
if (root) {
  getWorkspacePackages(root); // [{ name, dir, path }, ...]
}
```

Available commands for `getCommand`: `run`, `install`, `frozen`, `add`, `remove`, `execute`.

## 🛠️ Development

```bash
pnpm install
pnpm build   # build to dist/
pnpm test    # run tests
pnpm lint    # type check
```

## 👀 Preview

<p align='center'>
  <img src="https://github.com/hunghg255/run-script-cli/blob/main/assets/demo.png?raw=true" alt='preview'>
</p>
