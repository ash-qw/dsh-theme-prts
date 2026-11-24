import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawn, execFileSync } from 'node:child_process'

const entry = process.env.DSH_DURABLE_ADAPTER

async function host(module, cwd, archiveRoot, git) {
  const listeners = new Map(), warnings = [], disposals = []
  const ctx = {
    logger: { warn: value => warnings.push(value), info() {} },
    fs: { processPath: target => target },
    subprocess: git ?? { resolveExecutable: async () => { throw Error('No git in test') } },
    effect: callback => disposals.push(callback()),
    on: (name, callback) => listeners.set(name, callback),
    provide: (key, value) => { ctx[key] = value },
  }
  await module.apply(ctx, { timeoutMs: 30000, outputMaxBytes: 8 * 1024 * 1024, maxFiles: 500,
    maxFileBytes: 2 * 1024 * 1024, diffTimeoutMs: 100, archiveRoot })
  let sequence = 10
  const events = []
  const session = { id: 'session-durable-integration', header: { cwd }, append(type, data) {
    const event = { type, seq: sequence++, data }; events.push(event); return event
  } }
  const agent = { session }, actor = { agent }
  return { ctx, warnings, events, listeners, session,
    async start(turn) {
      listeners.get('session/event')(session, { type: 'turn/start', data: { turn } })
      await listeners.get('tools/pre-execute')(actor, async () => {})
    },
    async edit(path, content, turn) {
      await listeners.get('fs/write-intent')(path, actor, async () => ({}))
      await writeFile(path, content)
      listeners.get('session/event')(session, { type: 'tool/result', seq: sequence++, data: { turn } })
    },
    stop: turn => listeners.get('agent/turn-stopping')({ agent, turn }),
    async dispose() { for (const callback of disposals.reverse()) if (callback) await callback() },
  }
}

test('native recorder completion persists edits before disposal, and a fresh host serves exact prior diffs', { skip: !entry }, async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-durable-native-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const cwd = join(root, 'workspace'), archiveRoot = join(root, 'archive')
  await mkdir(cwd)
  const module = await import(pathToFileURL(entry))
  const first = await host(module, cwd, archiveRoot)
  const file = join(cwd, 'created.txt')
  await first.start(1)
  await first.edit(file, 'old\n', 1)
  await first.stop(1)
  const seq1 = first.events.at(-1).seq
  assert.equal(first.ctx.workspaceChanges.summary(first.session.id, seq1).total, 1)
  const initial = await first.ctx.workspaceChanges.diff(first.session.id, seq1, 0, new AbortController().signal)
  assert.equal(initial.before, false)
  await first.start(2)
  await first.edit(file, 'new\n', 2)
  // Disposal arriving while the recorder is completing must wait for the archive.
  const stopping = first.stop(2)
  const disposal = first.dispose()
  await Promise.all([stopping, disposal])
  const seq2 = first.events.at(-1).seq
  const second = await host(module, cwd, archiveRoot)
  const restored = await second.ctx.workspaceChanges.diff(first.session.id, seq2, 0, new AbortController().signal)
  assert.deepEqual(restored.hunks[0].lines, ['-old', '+new'])
  assert.deepEqual(await second.ctx.workspaceChanges.diff(first.session.id, seq1, 0, new AbortController().signal), initial)
  assert.equal(second.ctx.workspaceChanges.summary(first.session.id, seq2).turn, 2)
  assert.equal((await second.ctx.workspaceChanges.diff(first.session.id, seq2, 99, new AbortController().signal)), undefined)
  assert.deepEqual(first.warnings, [])
  assert.deepEqual(second.warnings, [])
  await second.dispose()
})

test('disk failures produce an explicit warning and do not corrupt prior durable records', { skip: !entry }, async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-durable-failure-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const cwd = join(root, 'workspace'), archiveRoot = join(root, 'archive')
  await mkdir(cwd)
  const module = await import(pathToFileURL(entry)), first = await host(module, cwd, archiveRoot)
  const file = join(cwd, 'created.txt')
  await first.start(1); await first.edit(file, 'one\n', 1); await first.stop(1)
  const seq = first.events.at(-1).seq
  const [sessionDirectory] = await readdir(archiveRoot)
  const committed = await readFile(join(archiveRoot, sessionDirectory, String(seq), 'record.json'))
  await first.start(2); await first.edit(file, 'two\n', 2)
  // Turn the archive parent into a regular file to simulate an unavailable disk path.
  const saved = join(root, 'saved')
  const { rename } = await import('node:fs/promises')
  await rename(archiveRoot, saved); await writeFile(archiveRoot, 'unavailable')
  await first.stop(2)
  assert.ok(first.warnings.some(message => /workspace-changes:.*(ENOTDIR|EEXIST)/.test(message)))
  assert.deepEqual(await readFile(join(saved, sessionDirectory, String(seq), 'record.json')), committed)
  await first.dispose()
})

test('git snapshots, ignored-file captures and deletions remain readable after scratch cleanup', { skip: !entry }, async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-durable-git-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const cwd = join(root, 'workspace'), archiveRoot = join(root, 'archive')
  await mkdir(cwd)
  execFileSync('git', ['init', '-q', cwd])
  await writeFile(join(cwd, '.gitignore'), 'ignored.txt\n')
  await writeFile(join(cwd, 'tracked.txt'), 'old tracked\n')
  await writeFile(join(cwd, 'deleted.txt'), 'deleted later\n')
  await writeFile(join(cwd, 'ignored.txt'), 'old ignored\n')
  execFileSync('git', ['add', '.'], { cwd })
  execFileSync('git', ['-c', 'user.name=Durability Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'baseline'], { cwd })
  const subprocess = {
    resolveExecutable: async () => '/usr/bin/git',
    spawn(options) {
      const child = spawn(options.argv[0], options.argv.slice(1), { cwd: options.cwd,
        env: { ...process.env, ...options.env }, stdio: ['pipe', 'pipe', 'pipe'], signal: options.signal })
      let stdout = '', stderr = ''
      child.stdout.on('data', value => { stdout += value })
      child.stderr.on('data', value => { stderr += value })
      child.stdin.end(typeof options.stdio.stdin === 'object' ? options.stdio.stdin.data : undefined)
      return { collected: { stdout: { readFrom: () => ({ text: stdout, lossy: false }) },
        stderr: { readFrom: () => ({ text: stderr, lossy: false }) } },
      done: new Promise((resolve, reject) => { child.on('error', reject); child.on('close', exitCode => resolve({ exitCode })) }) }
    },
  }
  const module = await import(pathToFileURL(entry)), first = await host(module, cwd, archiveRoot, subprocess)
  await first.start(1)
  await first.edit(join(cwd, 'ignored.txt'), 'new ignored\n', 1)
  // These mutations bypass file tools, and therefore exercise native git snapshots.
  await writeFile(join(cwd, 'tracked.txt'), 'new tracked\n')
  await rm(join(cwd, 'deleted.txt'))
  await first.stop(1)
  assert.deepEqual(first.warnings, [])
  const seq = first.events.at(-1).seq
  const original = first.ctx.workspaceChanges.summary(first.session.id, seq)
  assert.deepEqual(original.files.map(value => value.path), ['deleted.txt', 'ignored.txt', 'tracked.txt'])
  await first.dispose()
  // Remove the actual working tree too: comparisons must use the archive alone.
  await rm(cwd, { recursive: true })
  const second = await host(module, cwd, archiveRoot)
  assert.deepEqual(second.ctx.workspaceChanges.summary(first.session.id, seq), original)
  const diffs = await Promise.all([0, 1, 2].map(index => second.ctx.workspaceChanges.diff(first.session.id, seq, index, new AbortController().signal)))
  assert.equal(diffs[0].after, false)
  assert.deepEqual(diffs[1].hunks[0].lines, ['-old ignored', '+new ignored'])
  assert.deepEqual(diffs[2].hunks[0].lines, ['-old tracked', '+new tracked'])
  await second.dispose()
})
