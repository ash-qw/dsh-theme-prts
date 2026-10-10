import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseNotes(changelog, tag) {
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
    throw new Error(`Invalid release tag: ${tag}`);
  }
  const sections = changelog.replace(/\r\n/g, '\n').split(/^## /m);
  const section = sections.slice(1).find((entry) => entry.startsWith(`${tag.slice(1)} - `));
  if (!section) throw new Error(`Missing CHANGELOG entry for ${tag}`);
  const body = section.slice(section.indexOf('\n') + 1).trim();
  if (!body) throw new Error(`Empty CHANGELOG entry for ${tag}`);
  return `${body}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , tag, output] = process.argv;
  if (!output) throw new Error('Usage: node scripts/release-notes.mjs vX.Y.Z output.md');
  writeFileSync(output, releaseNotes(readFileSync('CHANGELOG.md', 'utf8'), tag));
}
