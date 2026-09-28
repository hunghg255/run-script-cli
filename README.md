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

## 📦 Installation

```bash
npm install -g run-script-cli
```

## 🔍 Detection

The package manager is detected from the `packageManager` field in `package.json`, then from lockfiles (`upm.lock`, `bun.lock(b)`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`), searching up from the current directory. If nothing is found you'll be asked to choose one.

## 🚀 Commands

- Run

```bash
# Select a script to run (type to filter by name or description)
nr

# Run a specific script
nr dev

# Pass extra args to the script (`--` is added automatically for npm)
nr dev --port 3000

# Rerun the last script of this project
nr -

# Monorepo: select a workspace package, then a script
nr -w
nr -w build
```

- Install

```bash
# Install dependencies
ni

# Install a package
ni react
ni -D vitest
```

- Clean install (for CI)

```bash
# npm ci / pnpm install --frozen-lockfile / ...
nci
```

- Uninstall

```bash
nu react
```

- Execute a package without installing it

```bash
# npx / pnpm dlx / bunx / upx
nlx cowsay hello
```

| Command      | npm                   | yarn                             | pnpm                             | bun                             | upm                             |
| ------------ | --------------------- | -------------------------------- | -------------------------------- | ------------------------------- | ------------------------------- |
| `nr dev`     | `npm run dev`         | `yarn run dev`                   | `pnpm run dev`                   | `bun run dev`                   | `upm run dev`                   |
| `ni`         | `npm install`         | `yarn install`                   | `pnpm install`                   | `bun install`                   | `upm install`                   |
| `ni react`   | `npm install react`   | `yarn add react`                 | `pnpm add react`                 | `bun add react`                 | `upm add react`                 |
| `nci`        | `npm ci`              | `yarn install --frozen-lockfile` | `pnpm install --frozen-lockfile` | `bun install --frozen-lockfile` | `upm install --frozen-lockfile` |
| `nu react`   | `npm uninstall react` | `yarn remove react`              | `pnpm remove react`              | `bun remove react`              | `upm remove react`              |
| `nlx cowsay` | `npx cowsay`          | `npx cowsay`                     | `pnpm dlx cowsay`                | `bunx cowsay`                   | `upx cowsay`                    |

## 🧩 API

```ts
import { detectAgent, getCommand } from 'run-script-cli';

const agent = detectAgent(process.cwd()); // 'npm' | 'yarn' | 'pnpm' | 'bun' | 'upm' | undefined
getCommand('pnpm', 'add', ['react']); // ['pnpm', 'add', 'react']
```

## Preview

<p align='center'>
  <img src="https://github.com/hunghg255/run-script-cli/blob/main/assets/demo.png?raw=true" alt='preview'>
</p>
