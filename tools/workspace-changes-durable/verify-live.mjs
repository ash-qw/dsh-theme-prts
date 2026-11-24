import { chromium } from 'playwright-core'
import { expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, basename, resolve } from 'node:path'

const [, , recordsPath, output] = process.argv
if (!recordsPath || !output || !process.env.DSH_STATE_PATH) {
  throw new Error('Usage: DSH_STATE_PATH=... node verify-live.mjs RECORDS_JSON OUTPUT_DIRECTORY')
}
const records = JSON.parse(await readFile(recordsPath, 'utf8'))
assert.ok(records.length)
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ storageState: process.env.DSH_STATE_PATH, locale: 'zh-CN', viewport: { width: 1440, height: 1000 } })
const errors = [], results = []
page.on('pageerror', error => errors.push(error.message))
await page.route(/\/api\/(settings\/mutate|workspace\/(pinSession|unpinSession|archiveSession|unarchiveSession)|session\/(create|prompt|rename|fork)|commands\/execute)(?:\?|$)/,
  route => route.abort('blockedbyclient'))
try {
  await page.goto(process.env.DSH_URL || 'http://127.0.0.1:3080/')
  await page.waitForSelector('[data-prts-workspace-row]')
  for (const record of records) {
    const actual = await page.evaluate(async ({ sessionId, seq, summary }) => {
      const query = new URLSearchParams({ sessionId, seq })
      const response = await fetch('/api/changes.summary?' + query)
      if (response.status !== 200) throw new Error(`Summary ${seq}: HTTP ${response.status}`)
      const value = await response.json(), diffs = []
      for (let index = 0; index < summary.files.length; index++) {
        const diff = await fetch('/api/changes.diff?' + query + '&index=' + index)
        if (diff.status !== 200) throw new Error(`Diff ${seq}/${index}: HTTP ${diff.status}`)
        diffs.push(await diff.json())
      }
      const invalid = await fetch('/api/changes.diff?' + query + '&index=999999')
      return { summary: value, diffs, invalid: invalid.status }
    }, record)
    const { cwd, ...summary } = record.summary
    assert.deepEqual(actual.summary, summary)
    assert.deepEqual(actual.diffs, record.diffs)
    assert.equal(actual.invalid, 404)
    const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
    results.push({ sessionId: record.sessionId, seq: record.seq, total: summary.total,
      summarySha256: hash(actual.summary), diffsSha256: hash(actual.diffs), diffCount: actual.diffs.length })
  }
  for (const sessionId of new Set(records.map(record => record.sessionId))) {
    const ownRecords = records.filter(record => record.sessionId === sessionId)
    const workspace = page.locator('[data-prts-workspace-row]').filter({ hasText: basename(ownRecords[0].summary.cwd) }).first()
    if (await workspace.getAttribute('aria-expanded') === 'false') await workspace.click()
    // The UUID is compared as an attribute value inside evaluate, avoiding selector interpolation.
    const sessionRow = page.locator('[data-prts-session-row]')
    await expect.poll(async () => sessionRow.evaluateAll((nodes, id) => nodes.some(node => node.getAttribute('data-row-key') === `session:${id}`), sessionId)).toBe(true)
    const position = await sessionRow.evaluateAll((nodes, id) => nodes.findIndex(node => node.getAttribute('data-row-key') === `session:${id}`), sessionId)
    await sessionRow.nth(position).click()
    for (const record of ownRecords) {
      const card = page.locator('[data-changed-files]').filter({ hasText: `已编辑 ${record.summary.total} 个文件` }).first()
      await expect(card).toBeAttached()
      await card.scrollIntoViewIfNeeded()
      await card.screenshot({ path: join(output, `record-${record.seq}.png`) })
      await card.locator('ul button').first().hover()
      const preview = page.locator('[data-changes-hover-preview]')
      await expect(preview).toBeVisible()
      await expect(preview.locator('[data-changes-preview-path]')).toHaveText(resolve(record.summary.cwd, record.summary.files[0].path))
      await page.mouse.move(0, 0)
      await expect(preview).toBeHidden()
      await card.getByRole('button', { name: '在侧边栏查看本轮改动', exact: true }).click()
      const review = page.locator('[data-changes-review]').last()
      await expect(review).toHaveAttribute('data-review-state', 'ready')
      await expect(review.locator('[data-review-file]')).toHaveAttribute('data-review-file', record.summary.files[0].path)
      results.find(result => result.seq === record.seq && result.sessionId === sessionId).nativeUi = { card: true, hover: true, review: true }
    }
  }
  assert.deepEqual(errors, [])
  await writeFile(join(output, 'verification.json'), JSON.stringify({ records: results, pageErrors: errors }, null, 2))
  console.log(JSON.stringify({ records: results, pageErrors: errors }))
} finally { await browser.close() }
