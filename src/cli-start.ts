/* eslint-disable unicorn/no-process-exit */
import { execSync } from 'node:child_process';
import process from 'node:process';

// @ts-ignore
import { detectAgent } from '@skarab/detect-package-manager';
import c from 'kleur';
import { cancel, isCancel, select } from 'unprompts';

import { getPackageJSON } from './fs';

function limitText(text: string, maxWidth: number) {
  if (text.length <= maxWidth) {
    return text;
  }
  return `${text.slice(0, maxWidth)}${c.dim('…')}`;
}

export const startCli = async () => {
  const pkg = getPackageJSON();
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

  const agent = await detectAgent();

  if (!agent?.name) {
    return process.exit(0);
  }

  const scriptValue = await select({
    message: c.bgCyan(' Run script '),
    options: raw.map((scriptItem) => ({
      label: `${c.green(scriptItem.key)}: ${c.dim(limitText(scriptItem.description, 50))}`,
      value: scriptItem.cmd,
    })),
  });

  if (isCancel(scriptValue)) {
    cancel('Run script cancelled');
    return process.exit(0);
  }

  if (agent.name === 'npm') {
    execSync(`npm run ${scriptValue}`, { stdio: 'inherit' });
    return process.exit(0);
  }

  if (agent.name === 'yarn') {
    execSync(`yarn ${scriptValue}`, { stdio: 'inherit' });
    return process.exit(0);
  }

  if (agent.name === 'pnpm') {
    execSync(`pnpm ${scriptValue}`, { stdio: 'inherit' });
    return process.exit(0);
  }

  if (agent.name === 'bun') {
    execSync(`bun run ${scriptValue}`, { stdio: 'inherit' });
    return process.exit(0);
  }
};
