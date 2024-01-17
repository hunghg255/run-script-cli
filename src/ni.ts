/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

// @ts-ignore
import { detectAgent } from '@skarab/detect-package-manager';
// @ts-ignore
import { execaCommand } from 'execa';
// @ts-ignore
import c from 'kleur';
import { intro } from 'unprompts';

export const niCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  try {
    const agent = await detectAgent(cwd);
    let scriptValue: string = '';

    if (!agent?.name) {
      return process.exit(0);
    }

    if (argv?.length > 2) {
      scriptValue = argv.slice(2).join(' ');
    }

    if (agent.name === 'bun') {
      intro(c.bold(c.green(`bun add ${scriptValue}\n`)));

      await execaCommand(`bun add ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'pnpm') {
      intro(c.bold(c.green(`pnpm add ${scriptValue}\n`)));
      await execaCommand(`pnpm add ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'npm') {
      intro(c.bold(c.green(`npm install ${scriptValue}\n`)));

      await execaCommand(`npm install ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'yarn') {
      intro(c.bold(c.green(`yarn add ${scriptValue}\n`)));

      await execaCommand(`yarn add ${scriptValue}`, { stdio: 'inherit', cwd });
    }
  } catch {}
};

niCli();
