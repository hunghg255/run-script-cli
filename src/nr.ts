/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

// @ts-ignore
import { detectAgent } from '@skarab/detect-package-manager';
// @ts-ignore
import { execaCommand } from 'execa';
// @ts-ignore
import c from 'kleur';
import { cancel, isCancel, select, intro } from 'unprompts';

import { getPackageJSON } from './fs';
import { limitText } from './utils';

export const niCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  try {
    const pkg = getPackageJSON(cwd);
    const scripts = pkg.scripts || {};
    const scriptsInfo = pkg['scripts-info'] || {};
    let scriptValue: string = '';

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

    if (argv?.length > 2) {
      scriptValue = argv.slice(2).join(' ');
    } else {
      scriptValue = (await select({
        message: c.bgCyan(' Run script '),
        options: raw.map((scriptItem) => ({
          label: `${c.green(scriptItem.key)}: ${c.dim(limitText(scriptItem.description, 50))}`,
          value: scriptItem.key,
        })),
      })) as string;

      if (isCancel(scriptValue)) {
        cancel('Run script cancelled');
        return process.exit(0);
      }
    }

    if (agent.name === 'bun') {
      intro(c.bold(c.green(`bun run ${scriptValue}\n`)));

      await execaCommand(`bun run ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'pnpm') {
      intro(c.bold(c.green(`pnpm ${scriptValue}\n`)));
      await execaCommand(`pnpm ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'npm') {
      intro(c.bold(c.green(`npm run ${scriptValue}\n`)));

      await execaCommand(`npm run ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'yarn') {
      intro(c.bold(c.green(`yarn ${scriptValue}\n`)));

      await execaCommand(`yarn ${scriptValue}`, { stdio: 'inherit', cwd });
    }
  } catch {}
};

niCli();
