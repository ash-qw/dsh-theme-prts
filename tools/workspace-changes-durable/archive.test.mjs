import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ChangesArchive } from './archive.mjs'
import { adapt } from './build-adapter.mjs'

const summary = { turn: 2, cwd: '/workspace', files: [{ path: '中文.md', display: '中文.md', added: 1, deleted: 1 }], total: 1, added: 1, deleted: 1 }
const diff = { kind: 'text', path: '中文.md', display: '中文.md', before: true, after: true, coarse: false,
  hunks: [{ oldStart: 1, oldLines: 1, newStart: 1, newLines: 1, lines: ['-旧内容', '+新内容'] }] }

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-changes-archive-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

test('completed records and exact diffs survive a fresh archive instance', async t => {
  const root = await fixture(t), original = await ChangesArchive.open(root)
  await original.capture('session-a', 155, summary, async () => diff)
  const restored = await ChangesArchive.open(root)
  assert.deepEqual(restored.summary('session-a', 155), summary)
  assert.deepEqual(await restored.diff('session-a', 155, 0), diff)
  assert.equal(restored.summary('session-b', 155), undefined)
  assert.equal(restored.summary('session-a', 229), undefined)
  assert.equal(await restored.diff('session-a', 155, 1), undefined)
})

test('incomplete captures are never published and a failed write can be retried', async t => {
  const root = await fixture(t), archive = await ChangesArchive.open(root)
  const two = { ...summary, files: [...summary.files, { path: 'b', display: 'b', added: 0, deleted: 0 }], total: 2 }
  await assert.rejects(archive.capture('session-a', 1, two, async i => i ? undefined : diff))
  assert.equal(archive.summary('session-a', 1), undefined)
  assert.equal((await ChangesArchive.open(root)).summary('session-a', 1), undefined)
  await archive.capture('session-a', 1, two, async i => i ? { kind: 'binary', path: 'b', display: 'b' } : diff)
  assert.equal((await ChangesArchive.open(root)).summary('session-a', 1).total, 2)
  const [directory] = await readdir(root)
  assert.deepEqual(await readdir(join(root, directory)), ['1'])
})

test('binary, oversized and empty replacement summaries survive reload', async t => {
  const root = await fixture(t), archive = await ChangesArchive.open(root)
  for (const [index, kind] of ['binary', 'oversized'].entries()) {
    const value = { ...summary, files: [{ ...summary.files[0], [kind]: true }] }
    await archive.capture('session-a', index, value, async () => ({ kind, path: '中文.md', display: '中文.md' }))
  }
  const empty = { ...summary, files: [], total: 0, added: 0, deleted: 0 }
  await archive.capture('session-a', 3, empty, async () => { throw Error('No files to read') })
  const restored = await ChangesArchive.open(root)
  assert.equal((await restored.diff('session-a', 0, 0)).kind, 'binary')
  assert.equal((await restored.diff('session-a', 1, 0)).kind, 'oversized')
  assert.deepEqual(restored.summary('session-a', 3), empty)
})

test('truncated manifests do not prevent unrelated records from loading', async t => {
  const root = await fixture(t), warnings = [], archive = await ChangesArchive.open(root)
  await archive.capture('session-a', 1, summary, async () => diff)
  await archive.capture('session-a', 2, summary, async () => diff)
  const [directory] = await readdir(root)
  await writeFile(join(root, directory, '1/record.json'), '{')
  const restored = await ChangesArchive.open(root, message => warnings.push(message))
  assert.equal(restored.summary('session-a', 1), undefined)
  assert.deepEqual(restored.summary('session-a', 2), summary)
  assert.equal(warnings.length, 1)
})

test('a corrupt comparison is rejected even when its JSON remains valid', async t => {
  const root = await fixture(t), warnings = [], archive = await ChangesArchive.open(root, message => warnings.push(message))
  await archive.capture('session-a', 1, summary, async () => diff)
  const [directory] = await readdir(root)
  await writeFile(join(root, directory, '1/0.json'), JSON.stringify({ ...diff, hunks: [] }))
  assert.equal(await archive.diff('session-a', 1, 0), undefined)
  assert.match(warnings[0], /checksum/)
})

test('aborted reads stay aborted, coordinates cannot escape the archive, and records are immutable', async t => {
  const root = await fixture(t), archive = await ChangesArchive.open(root)
  await archive.capture('../session-a', 155, summary, async () => diff)
  const signal = AbortSignal.abort(new Error('Cancelled'))
  await assert.rejects(archive.diff('../session-a', 155, 0, signal), /Cancelled/)
  await assert.rejects(archive.capture('session-a', -1, summary, async () => diff), /coordinates/)
  assert.equal(archive.summary('session-a', '../155'), undefined)
  assert.equal(await archive.diff('../session-a', 155, -1), undefined)
  await assert.rejects(archive.capture('../session-a', 155, { ...summary, added: 2 }, async () => diff), /different record/)
})

test('abandoned pending directories are ignored after process termination', async t => {
  const root = await fixture(t), archive = await ChangesArchive.open(root)
  await archive.capture('session-a', 1, summary, async () => diff)
  const [directory] = await readdir(root)
  await mkdir(join(root, directory, '.pending-interrupted'))
  await writeFile(join(root, directory, '.pending-interrupted/record.json'), '{}')
  assert.deepEqual((await ChangesArchive.open(root)).summary('session-a', 1), summary)
})

test('unsupported upstream builds are refused before any adapter is generated', () => {
  assert.throws(() => adapt('export const apply = () => {}'), /Unsupported/)
})
