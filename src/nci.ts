import process from 'node:process';

import { getCommand, resolveAgent, runCommand } from './agents';

export const nciCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  const agent = await resolveAgent(cwd);

  await runCommand(getCommand(agent, 'frozen', argv.slice(2)), cwd);
};

nciCli();
