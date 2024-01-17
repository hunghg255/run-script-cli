import c from 'kleur';

export function limitText(text: string, maxWidth: number) {
  if (text.length <= maxWidth) {
    return text;
  }
  return `${text.slice(0, maxWidth)}${c.dim('…')}`;
}
