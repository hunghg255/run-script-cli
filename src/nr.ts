/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

// @ts-ignore
import c from 'kleur';
import { cancel, isCancel, select } from 'unprompts';

import { getCommand, resolveAgent, runCommand } from './agents';
import { getPackageJSON } from './fs';
import { dump, load } from './storage';
import { limitText } from './utils';

export const nrCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  const pkg = getPackageJSON(cwd);

  if (!pkg) {
    console.error(c.red('No package.json found in current directory'));
    return process.exit(1);
  }

  const scripts: Record<string, string> = pkg.scripts || {};
  const scriptsInfo: Record<string, string> = pkg['scripts-info'] || {};
  let args = argv.slice(2);

  if (args.length === 0) {
    const raw = Object.entries(scripts)
      .filter(([key]) => !key.startsWith('?'))
      .map(([key, cmd]) => ({
        key,
        description: scriptsInfo[key] || scripts[`?${key}`] || cmd,
      }));

    if (raw.length === 0) {
      console.warn(c.yellow('No scripts found in package.json'));
      return process.exit(0);
    }

    const storage = await load();
    const lastRunCommand = storage.lastRunCommands?.[cwd];

    const scriptValue = await select({
      message: c.bgCyan(' Run script '),
      options: raw.map((scriptItem) => ({
        label: `${c.green(scriptItem.key)}: ${c.dim(limitText(scriptItem.description, 50))}`,
        value: scriptItem.key,
      })),
      initialValue: raw.some((i) => i.key === lastRunCommand) ? lastRunCommand : undefined,
    });

    if (isCancel(scriptValue)) {
      cancel('Run script cancelled');
      return process.exit(0);
    }

    args = [scriptValue as string];

    if (lastRunCommand !== scriptValue) {
      storage.lastRunCommands = { ...storage.lastRunCommands, [cwd]: scriptValue as string };
      await dump();
    }
  }

  const agent = await resolveAgent(cwd);

  await runCommand(getCommand(agent, 'run', args), cwd);
};

nrCli();
