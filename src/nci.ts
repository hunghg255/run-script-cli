import process from 'node:process';

import { getCommand, resolveAgent, runCommand } from './agents';
import { handleVersionFlag } from './utils';

export const nciCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  const args = argv.slice(2);
  handleVersionFlag(args);

  const agent = await resolveAgent(cwd);

  await runCommand(getCommand(agent, 'frozen', args), cwd);
};

nciCli();
