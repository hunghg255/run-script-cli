/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

// @ts-ignore
import { detectAgent } from '@skarab/detect-package-manager';
// @ts-ignore
import { execaCommand } from 'execa';
// @ts-ignore
import c from 'kleur';
import { cancel, isCancel, select } from 'unprompts';

import { getPackageJSON } from './fs';

function limitText(text: string, maxWidth: number) {
  if (text.length <= maxWidth) {
    return text;
  }
  return `${text.slice(0, maxWidth)}${c.dim('…')}`;
}

export const startCli = async (cwd: string = process.cwd()) => {
  try {
    const pkg = getPackageJSON(cwd);
    const scripts = pkg.scripts || {};
    const scriptsInfo = pkg['scripts-info'] || {};

    const names = Object.entries(scripts) as [string, string][];

    if (names.length === 0) {
      return process.exit(0);
    }

    const raw = names
      .filter((i) => !i[0].startsWith('?'))
      .map(([key, cmd]) => ({
        key,
        cmd,
        description: scriptsInfo[key] || scripts[`?${key}`] || cmd,
      }));

    const agent = await detectAgent(cwd);

    if (!agent?.name) {
      return process.exit(0);
    }

    const scriptValue = await select({
      message: c.bgCyan(' Run script '),
      options: raw.map((scriptItem) => ({
        label: `${c.green(scriptItem.key)}: ${c.dim(limitText(scriptItem.description, 50))}`,
        value: scriptItem.key,
      })),
    });

    if (isCancel(scriptValue)) {
      cancel('Run script cancelled');
      return process.exit(0);
    }

    if (agent.name === 'npm') {
      await execaCommand(`npm run ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'yarn') {
      await execaCommand(`yarn ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'pnpm') {
      await execaCommand(`pnpm ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'bun') {
      await execaCommand(`bun run ${scriptValue}`, { stdio: 'inherit', cwd });
    }
  } catch {}
};
