import process from 'node:process';

import c from 'kleur';

import { getCommand, resolveAgent, runCommand } from './agents';

export const nxCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  const args = argv.slice(2);

  if (args.length === 0) {
    console.warn(c.yellow('Please enter a package name, e.g. nx cowsay hello'));
    return;
  }

  const agent = await resolveAgent(cwd);

  await runCommand(getCommand(agent, 'execute', args), cwd);
};

nxCli();
