/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

import { autocomplete, cancel, isCancel } from '@clack/prompts';
import c from 'kleur';

import { getCommand, resolveAgent, runCommand } from './agents';
import { getPackageJSON } from './fs';
import { dump, load } from './storage';
import { limitText } from './utils';
import { findWorkspaceRoot, getWorkspacePackages } from './workspaces';

function includes(text: string, search: string) {
  return text.toLowerCase().includes(search.toLowerCase());
}

async function selectWorkspacePackage(cwd: string): Promise<string> {
  const root = findWorkspaceRoot(cwd);

  if (!root) {
    console.warn(c.yellow('No workspace found, using current directory'));
    return cwd;
  }

  const packages = getWorkspacePackages(root);
  const byDir = new Map(packages.map((p) => [p.dir, p]));

  const dir = await autocomplete({
    message: c.bgCyan(' Select package '),
    options: packages.map((p) => ({
      label: `${c.green(p.name)} ${c.dim(p.path)}`,
      value: p.dir,
    })),
    initialValue: byDir.has(cwd) ? cwd : undefined,
    filter: (search, option) => {
      const p = byDir.get(option.value)!;
      return includes(p.name, search) || includes(p.path, search);
    },
  });

  if (isCancel(dir)) {
    cancel('Select package cancelled');
    return process.exit(0);
  }

  return dir;
}

export const nrCli = async (cwd: string = process.cwd(), argv = process.argv) => {
  let args = argv.slice(2);
  let dir = cwd;

  if (args[0] === '-w' || args[0] === '--workspace') {
    args = args.slice(1);
    dir = await selectWorkspacePackage(cwd);
  }

  const pkg = getPackageJSON(dir);

  if (!pkg) {
    console.error(c.red(`No package.json found in ${dir}`));
    return process.exit(1);
  }

  const scripts: Record<string, string> = pkg.scripts || {};
  const scriptsInfo: Record<string, string> = pkg['scripts-info'] || {};

  const storage = await load();
  const lastRunCommand = storage.lastRunCommands?.[dir];

  // `nr -` reruns the last script of this project
  if (args[0] === '-') {
    if (lastRunCommand) {
      args = [lastRunCommand, ...args.slice(1)];
    } else {
      console.warn(c.yellow('No script has been run in this project yet'));
      args = [];
    }
  }

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

    const descriptions = new Map(raw.map((i) => [i.key, i.description]));

    const scriptValue = await autocomplete({
      message: c.bgCyan(' Run script '),
      options: raw.map((scriptItem) => ({
        label: `${c.green(scriptItem.key)}: ${c.dim(limitText(scriptItem.description, 50))}`,
        value: scriptItem.key,
      })),
      initialValue: descriptions.has(lastRunCommand!) ? lastRunCommand : undefined,
      filter: (search, option) =>
        includes(option.value, search) || includes(descriptions.get(option.value)!, search),
    });

    if (isCancel(scriptValue)) {
      cancel('Run script cancelled');
      return process.exit(0);
    }

    args = [scriptValue];
  }

  if (lastRunCommand !== args[0]) {
    storage.lastRunCommands = { ...storage.lastRunCommands, [dir]: args[0]! };
    await dump();
  }

  const agent = await resolveAgent(dir);

  await runCommand(getCommand(agent, 'run', args), dir);
};

nrCli();
