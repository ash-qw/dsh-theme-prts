import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, open, readFile, readdir, rename, rm, stat } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

const digest = value => createHash('sha256').update(value).digest('hex')
const integer = value => Number.isSafeInteger(value) && value >= 0
const text = value => typeof value === 'string' && value.length > 0
const MAX_DIFF_BYTES = 32 * 1024 * 1024
const MAX_MANIFEST_BYTES = 2 * 1024 * 1024

function coordinates(sessionId, seq) {
  if (!text(sessionId) || sessionId.length > 1024 || !integer(seq)) throw new Error('Invalid change archive coordinates')
  return `${digest(sessionId)}/${seq}`
}

function validateSummary(summary) {
  if (!summary || !integer(summary.turn) || summary.turn < 1 || !isAbsolute(summary.cwd ?? '')
    || !Array.isArray(summary.files) || summary.files.length > 500
    || ![summary.total, summary.added, summary.deleted].every(integer)
    || summary.total < summary.files.length) throw new Error('Invalid change archive summary')
  for (const file of summary.files) {
    if (!file || !text(file.path) || !text(file.display) || ![file.added, file.deleted].every(integer)
      || (file.binary !== undefined && file.binary !== true)
      || (file.oversized !== undefined && file.oversized !== true)) throw new Error('Invalid archived changed file')
  }
}

function validateDiff(diff, file) {
  if (!diff || diff.path !== file.path || diff.display !== file.display) throw new Error('Archived diff does not match its file')
  if (diff.kind === 'binary' || diff.kind === 'oversized') return
  if (diff.kind !== 'text' || typeof diff.before !== 'boolean' || typeof diff.after !== 'boolean'
    || typeof diff.coarse !== 'boolean' || !Array.isArray(diff.hunks)) throw new Error('Invalid archived diff')
  for (const hunk of diff.hunks) {
    if (![hunk.oldStart, hunk.oldLines, hunk.newStart, hunk.newLines].every(integer)
      || !Array.isArray(hunk.lines) || !hunk.lines.every(line => typeof line === 'string' && /^[+ \\-]/.test(line))) {
      throw new Error('Invalid archived diff hunk')
    }
  }
}

async function syncDirectory(path) {
  const handle = await open(path, 'r')
  try { await handle.sync() } finally { await handle.close() }
}

async function writeDurably(path, data) {
  const handle = await open(path, 'wx', 0o600)
  try { await handle.writeFile(data); await handle.sync() } finally { await handle.close() }
}

async function boundedRead(path, maxBytes) {
  if ((await stat(path)).size > maxBytes) throw new Error('Archived record exceeds its read bound')
  const data = await readFile(path)
  if (data.length > maxBytes) throw new Error('Archived record exceeds its read bound')
  return data
}

/** Host-only archive. Session disposal never deletes durable records. */
export class ChangesArchive {
  constructor(root, warn = () => {}) {
    this.root = root
    this.warn = warn
    this.records = new Map()
  }

  static async open(root, warn) {
    if (typeof root !== 'string' || !isAbsolute(root)) throw new Error('Change archive root must be absolute')
    const archive = new ChangesArchive(root, warn)
    await mkdir(root, { recursive: true, mode: 0o700 })
    for (const session of await readdir(root, { withFileTypes: true })) {
      if (!session.isDirectory() || !/^[a-f0-9]{64}$/.test(session.name)) continue
      for (const entry of await readdir(join(root, session.name), { withFileTypes: true })) {
        if (!entry.isDirectory() || !/^(0|[1-9][0-9]*)$/.test(entry.name)) continue
        const key = `${session.name}/${entry.name}`
        try {
          const record = JSON.parse(await boundedRead(join(root, key, 'record.json'), MAX_MANIFEST_BYTES))
          if (record.version !== 1 || coordinates(record.sessionId, record.seq) !== key) throw new Error('Invalid archive identity')
          validateSummary(record.summary)
          if (!Array.isArray(record.diffs) || record.diffs.length !== record.summary.files.length
            || !record.diffs.every(value => /^[a-f0-9]{64}$/.test(value))) throw new Error('Incomplete archive manifest')
          // The manifest is published only after all comparison files are durable.
          for (let i = 0; i < record.diffs.length; i++) await stat(join(root, key, `${i}.json`))
          archive.records.set(key, record)
        } catch (error) { archive.warn(`workspace-changes-durable: skipped ${key}: ${error.message}`) }
      }
    }
    return archive
  }

  summary(sessionId, seq) {
    try { return this.records.get(coordinates(sessionId, seq))?.summary } catch { return undefined }
  }

  async diff(sessionId, seq, index, signal) {
    signal?.throwIfAborted()
    if (!integer(index)) return undefined
    let key
    try { key = coordinates(sessionId, seq) } catch { return undefined }
    const record = this.records.get(key)
    if (!record || index >= record.diffs.length) return undefined
    try {
      const bytes = await boundedRead(join(this.root, key, `${index}.json`), MAX_DIFF_BYTES)
      signal?.throwIfAborted()
      if (digest(bytes) !== record.diffs[index]) throw new Error('Archived diff checksum mismatch')
      const value = JSON.parse(bytes)
      validateDiff(value, record.summary.files[index])
      return value
    } catch (error) {
      signal?.throwIfAborted()
      this.warn(`workspace-changes-durable: cannot read ${key}/${index}: ${error.message}`)
      return undefined
    }
  }

  /** Called inside the native recorder's awaited completion, before scratch disposal. */
  async capture(sessionId, seq, summary, loadDiff, origin = 'native') {
    const key = coordinates(sessionId, seq)
    validateSummary(summary)
    const prior = this.records.get(key)
    if (prior) {
      if (JSON.stringify(prior.summary) !== JSON.stringify(summary)) throw new Error('Archived coordinates already contain a different record')
      return
    }
    const sessionDirectory = join(this.root, digest(sessionId))
    await mkdir(sessionDirectory, { recursive: true, mode: 0o700 })
    await syncDirectory(this.root)
    const temporary = await mkdtemp(join(sessionDirectory, '.pending-'))
    try {
      const hashes = []
      // One diff at a time keeps memory bounded by a single native comparison.
      for (let index = 0; index < summary.files.length; index++) {
        const diff = await loadDiff(index)
        validateDiff(diff, summary.files[index])
        const bytes = Buffer.from(JSON.stringify(diff))
        if (bytes.length > MAX_DIFF_BYTES) throw new Error('Native comparison exceeds archive bound')
        await writeDurably(join(temporary, `${index}.json`), bytes)
        hashes.push(digest(bytes))
      }
      const record = { version: 1, sessionId, seq, origin, summary, diffs: hashes }
      const bytes = Buffer.from(JSON.stringify(record))
      if (bytes.length > MAX_MANIFEST_BYTES) throw new Error('Native summary exceeds archive bound')
      await writeDurably(join(temporary, 'record.json'), bytes)
      await syncDirectory(temporary)
      await rename(temporary, join(this.root, key))
      await syncDirectory(sessionDirectory)
      this.records.set(key, record)
    } finally { await rm(temporary, { recursive: true, force: true }) }
  }
}
