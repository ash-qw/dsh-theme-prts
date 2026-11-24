import { readFile } from 'node:fs/promises'
import { ChangesArchive } from './archive.mjs'

// Explicit offline import. Input coordinates must come from surviving session events.
const [, , root, input] = process.argv
if (!root || !input) throw new Error('Usage: node import-records.mjs ARCHIVE_ROOT RECORDS_JSON')
const archive = await ChangesArchive.open(root, message => console.error(message))
const records = JSON.parse(await readFile(input, 'utf8'))
if (!Array.isArray(records)) throw new Error('Expected an array of complete records')
for (const record of records) {
  if (!['native-export', 'tool-log-recovery'].includes(record.origin)) throw new Error('Missing import provenance')
  if (!Array.isArray(record.diffs) || record.diffs.length !== record.summary.files.length) throw new Error('Incomplete comparison set')
  await archive.capture(record.sessionId, record.seq, record.summary, async index => record.diffs[index], record.origin)
  console.log(JSON.stringify({ sessionId: record.sessionId, seq: record.seq, total: record.summary.total, origin: record.origin }))
}
