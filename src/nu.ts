/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

// @ts-ignore
import { detectAgent } from '@skarab/detect-package-manager';
// @ts-ignore
import { execaCommand } from 'execa';
// @ts-ignore
import c from 'kleur';
import { intro } from 'unprompts';

export const nuCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  try {
    const agent = await detectAgent(cwd);
    let scriptValue: string = '';

    if (!agent?.name) {
      return process.exit(0);
    }

    if (argv?.length > 2) {
      scriptValue = argv.slice(2).join(' ');
    }

    if (!scriptValue) {
      intro(c.bold(c.yellow('Please enter a package name\n')));
      return;
    }

    if (agent.name === 'bun') {
      intro(c.bold(c.green(`bun remove ${scriptValue}\n`)));

      await execaCommand(`bun remove ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'pnpm') {
      intro(c.bold(c.green(`pnpm remove ${scriptValue}\n`)));
      await execaCommand(`pnpm remove ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'npm') {
      intro(c.bold(c.green(`npm uninstall ${scriptValue}\n`)));

      await execaCommand(`npm uninstall ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'yarn') {
      intro(c.bold(c.green(`yarn remove ${scriptValue}\n`)));

      await execaCommand(`yarn remove ${scriptValue}`, { stdio: 'inherit', cwd });
    }
  } catch {}
};

nuCli();
