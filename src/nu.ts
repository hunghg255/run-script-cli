import process from 'node:process';

import { intro } from '@clack/prompts';
import c from 'kleur';

import { getCommand, resolveAgent, runCommand } from './agents';
import { handleVersionFlag } from './utils';

export const nuCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  const args = argv.slice(2);
  handleVersionFlag(args);

  if (args.length === 0) {
    intro(c.bold(c.yellow('Please enter a package name\n')));
    return;
  }

  const agent = await resolveAgent(cwd);

  await runCommand(getCommand(agent, 'remove', args), cwd);
};

nuCli();
