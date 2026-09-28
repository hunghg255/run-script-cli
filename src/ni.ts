import process from 'node:process';

import { getCommand, resolveAgent, runCommand } from './agents';
import { handleVersionFlag } from './utils';

export const niCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  const args = argv.slice(2);
  handleVersionFlag(args);
  const agent = await resolveAgent(cwd);

  await runCommand(getCommand(agent, args.length > 0 ? 'add' : 'install', args), cwd);
};

niCli();
