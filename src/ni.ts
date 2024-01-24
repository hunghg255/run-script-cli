/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

// @ts-ignore
import { detectAgent } from '@skarab/detect-package-manager';
// @ts-ignore
import { execaCommand } from 'execa';
// @ts-ignore
import c from 'kleur';
import { cancel, isCancel, select, intro } from 'unprompts';

export const niCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  try {
    const agent = await detectAgent(cwd);

    let nodeManager = agent?.name as string;
    let scriptValue: string = '';

    if (!nodeManager) {
      nodeManager = (await select({
        message: c.bgCyan(' Choose npm manager '),
        options: ['npm', 'pnpm', 'yarn', 'bun'].map((scriptItem) => ({
          label: `${c.yellow(scriptItem)}`,
          value: scriptItem,
        })),
      })) as string;

      if (isCancel(nodeManager)) {
        cancel('Choose npm manager cancelled');
        return process.exit(0);
      }
    }

    if (argv?.length > 2) {
      scriptValue = argv.slice(2).join(' ');
    }

    if (nodeManager === 'bun') {
      const cmd = scriptValue ? `bun add ${scriptValue}` : 'bun install';
      intro(c.bold(c.green(`${cmd}\n`)));

      await execaCommand(`${cmd}`, { stdio: 'inherit', cwd });
    }

    if (nodeManager === 'pnpm') {
      const cmd = scriptValue ? `pnpm add ${scriptValue}` : 'pnpm install';

      intro(c.bold(c.green(`${cmd}\n`)));
      await execaCommand(`${cmd}`, { stdio: 'inherit', cwd });
    }

    if (nodeManager === 'npm') {
      intro(c.bold(c.green(`npm install ${scriptValue}\n`)));

      await execaCommand(`npm install ${scriptValue}`, { stdio: 'inherit', cwd });
    }

    if (nodeManager === 'yarn') {
      const cmd = scriptValue ? `yarn add ${scriptValue}` : 'yarn install';

      intro(c.bold(c.green(`${cmd}\n`)));

      await execaCommand(`${cmd}`, { stdio: 'inherit', cwd });
    }
  } catch {}
};

niCli();
