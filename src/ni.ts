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
      const cmd = scriptValue ? `bun add ${scriptValue}` : 'bun install';
      intro(c.bold(c.green(`${cmd}\n`)));

      await execaCommand(`${cmd}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'pnpm') {
      const cmd = scriptValue ? `pnpm add ${scriptValue}` : 'pnpm install';

      intro(c.bold(c.green(`${cmd}\n`)));
      await execaCommand(`${cmd}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'npm') {
      intro(c.bold(c.green(`npm install ${scriptValue}\n`)));

      await execaCommand(`npm install ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (agent.name === 'yarn') {
      const cmd = scriptValue ? `yarn add ${scriptValue}` : 'yarn install';

      intro(c.bold(c.green(`${cmd}\n`)));

      await execaCommand(`${cmd}`, { stdio: 'inherit', cwd });
    }
  } catch {}
};

niCli();
