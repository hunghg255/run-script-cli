/* eslint-disable unicorn/no-process-exit */
import process from 'node:process';

import c from 'kleur';

import { version } from '../package.json';

export function limitText(text: string, maxWidth: number) {
  if (text.length <= maxWidth) {
    return text;
  }
  return `${text.slice(0, maxWidth)}${c.dim('…')}`;
}

/**
 * Print the version and exit when the first argument is `-v` / `--version`
 */
export function handleVersionFlag(args: string[]) {
  if (args[0] === '-v' || args[0] === '--version') {
    console.log(`v${version}`);
    process.exit(0);
  }
}
