import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Reproducible, local-only rc.5 adapter. The upstream file itself remains untouched.
export const UPSTREAM_SHA256 = 'd265a6eac8de3541db34f47796856a6bc3a3d515e159586dac45af63340408cc'
const RUNTIME_UPSTREAM = '/usr/local/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-workspace-changes/lib/index.js'

export function adapt(source) {
  if (createHash('sha256').update(source).digest('hex') !== UPSTREAM_SHA256) {
    throw new Error('Unsupported workspace-changes build; review the upstream implementation before adapting it')
  }
  const once = (before, after) => {
    if (source.split(before).length !== 2) throw new Error('Native adapter anchor is not unique')
    source = source.replace(before, after)
  }
  source = `// Local persistence adapter derived from DeepSeek Harness rc.5 (MIT).
// See UPSTREAM-LICENSE. Upstream source is not modified.
import { ChangesArchive } from "./archive.mjs";
import { readFile as readDurableUpstream } from "node:fs/promises";
import { createHash as hashDurableUpstream } from "node:crypto";
if (hashDurableUpstream('sha256').update(await readDurableUpstream(${JSON.stringify(RUNTIME_UPSTREAM)})).digest('hex') !== ${JSON.stringify(UPSTREAM_SHA256)}) {
  throw new Error('workspace-changes-durable: unsupported Host build; re-audit the adapter before upgrading');
}
` + source
  once('const Config = z.object({', 'const Config = z.object({\n\tarchiveRoot: z.string().default(join(homedir(), "workspace-changes")),')
  once('function apply(ctx, config) {', 'async function apply(ctx, config) {\n\tconst archive = await ChangesArchive.open(config.archiveRoot, message => ctx.logger.warn(message));')
  once('summary: (sessionId, seq) => byId.get(sessionId)?.summary(seq),',
    'summary: (sessionId, seq) => byId.get(sessionId)?.summary(seq) ?? archive.summary(sessionId, seq),')
  once('diff: (sessionId, seq, index, signal) => byId.get(sessionId)?.diff(seq, index, signal) ?? Promise.resolve(void 0)',
    'diff: async (sessionId, seq, index, signal) => await byId.get(sessionId)?.diff(seq, index, signal) ?? archive.diff(sessionId, seq, index, signal)')
  once('git: gitRunner(),\n\t\t\t\ttempRoot: tmpdir(),', 'git: gitRunner(),\n\t\t\t\tarchive,\n\t\t\t\ttempRoot: tmpdir(),')
  once('\t\tstate.recordedAfterSeq = event.seq;', `\t\tconst durableSummary = this.records.get(event.seq).summary;
\t\tawait this.env.archive.capture(this.session.id, event.seq, durableSummary,
\t\t\tindex => this.diff(event.seq, index, signal));
\t\tstate.recordedAfterSeq = event.seq;`)
  // Let pending snapshots, comparisons, and their archive writes finish before
  // native cleanup clears the in-memory records or aborts their lifetime.
  once('\t\tthis.lifetime.abort();\n\t\tthis.records.clear();\n\t\tawait this.chain;',
    '\t\tawait this.chain;\n\t\tthis.lifetime.abort();\n\t\tthis.records.clear();')
  return source
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , upstream, output] = process.argv
  if (!upstream || !output) throw new Error('Usage: node build-adapter.mjs UPSTREAM_INDEX OUTPUT_DIRECTORY')
  await mkdir(output, { recursive: true, mode: 0o700 })
  const source = adapt(await readFile(upstream, 'utf8'))
  await writeFile(join(output, 'index.mjs'), source, { mode: 0o600 })
  await copyFile(join(dirname(fileURLToPath(import.meta.url)), 'archive.mjs'), join(output, 'archive.mjs'))
  await copyFile(join(dirname(fileURLToPath(import.meta.url)), 'UPSTREAM-LICENSE'), join(output, 'UPSTREAM-LICENSE'))
  await writeFile(join(output, 'upstream.json'), JSON.stringify({ version: '0.2.2-rc.5', upstreamSha256: UPSTREAM_SHA256,
    adapterSha256: createHash('sha256').update(source).digest('hex') }, null, 2))
}
