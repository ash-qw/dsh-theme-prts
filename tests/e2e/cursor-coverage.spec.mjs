import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('cursor covers workspace trees, companion card contents and menu items without changing editing or resizing', async ({ page }) => {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts"><body>
    <div class="projectRow" role="treeitem" data-prts-workspace-row><span>Workspace</span><input aria-label="Rename"></div>
    <div class="sessionRow" role="treeitem" data-prts-session-row><span>Session</span></div>
    <button class="dsh-partner-sidebar-row"><svg width="16" height="16"><path d="M0 0L16 16" /></svg><strong>Companion</strong></button>
    <div role="menuitem">Action</div><div role="option">Choice</div>
    <div id="resize" style="cursor:ew-resize">Resize</div><textarea></textarea>
  </body></html>`)
  await page.addStyleTag({ content: '.projectRow,.sessionRow,.dsh-partner-sidebar-row,[role="menuitem"],[role="option"]{cursor:pointer}' })
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  for (const selector of ['.projectRow > span', '.sessionRow > span', '.dsh-partner-sidebar-row strong', '.dsh-partner-sidebar-row svg', '[role="menuitem"]', '[role="option"]']) {
    await page.locator(selector).hover()
    expect(await page.locator(selector).evaluate(e => getComputedStyle(e).cursor)).toContain('data:image/png')
  }
  for (const [selector, cursor] of [['input', 'text'], ['textarea', 'text'], ['#resize', 'ew-resize']]) {
    const actual = await page.locator(selector).evaluate(e => getComputedStyle(e).cursor)
    if (cursor === 'text') { expect(actual).toContain('data:image/png'); expect(actual).toMatch(/, text$/) }
    else expect(actual).toBe(cursor)
  }
  await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'system' })
  expect(await page.locator('.projectRow').evaluate(e => getComputedStyle(e).cursor)).toBe('pointer')
})

test('static text cursor preserves focus, typing and selection', async ({ page }) => {
  await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><textarea style="width:400px;height:100px">Hello world</textarea><div contenteditable="plaintext-only">Editable</div><button>Other</button></body></html>')
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts' });` })
  const textFrame = () => page.evaluate(() => document.documentElement.style.getPropertyValue('--prts-text-frame'))
  const input = page.locator('textarea')
  await input.click()
  await expect(input).toBeFocused()
  expect(await textFrame()).toBe('')
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Typing still works')
  await expect(input).toHaveValue('Typing still works')
  await expect.poll(textFrame).toBe('')
  await page.waitForTimeout(100)
  expect(await textFrame()).toBe('')
  const box = await input.boundingBox()
  await page.mouse.move(box.x + 8, box.y + 8)
  await page.mouse.down()
  await page.mouse.move(box.x + 100, box.y + 8, { steps: 5 })
  expect(await textFrame()).toBe('')
  await page.mouse.up()
  expect(await input.evaluate(e => e.selectionEnd > e.selectionStart)).toBe(true)
  await page.evaluate(() => { document.documentElement.dataset.prtsMotion = 'reduced' })
  await input.click(); expect(await textFrame()).toBe('')
  expect(await page.locator('[contenteditable]').evaluate(e => getComputedStyle(e).cursor)).toMatch(/, text$/)
  await page.evaluate(() => { window.cursorAdapter.dispose(); document.documentElement.dataset.prtsCursor = 'system' })
  expect(await input.evaluate(e => getComputedStyle(e).cursor)).toBe('text')
})

test('rapid session switches retain click feedback across internal focus changes', async ({ page }) => {
  await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><div role="treeitem" tabindex="0">Session A</div><div role="treeitem" tabindex="0">Session B</div><input></body></html>')
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts' });` })
  const frame = () => page.evaluate(() => document.documentElement.style.getPropertyValue('--prts-hand-frame'))
  await page.locator('input').focus()
  for (const index of [0, 1, 0, 1, 0, 1]) {
    const row = page.locator('[role="treeitem"]').nth(index)
    await row.hover()
    await page.mouse.down()
    await expect(row).toBeFocused()
    expect(await frame()).toContain('data:image/png')
    await page.mouse.up()
    expect(await frame()).toContain('data:image/png')
  }
  await expect.poll(frame).toBe('')
  await page.mouse.down()
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  expect(await frame()).toBe('')
  await page.mouse.up()
})

test('conversation output uses text cursors while links and copy controls retain hand cursors', async ({ page }) => {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts"><body>
    <article data-chat-flow-kind="assistant-step"><div data-markdown>
      <p id="prose">Selectable response with <strong>emphasis</strong> and <a href="#"><span>link</span></a></p>
      <h2>Heading</h2><ul><li>List item</li></ul><table><tr><td>Cell</td></tr></table>
      <pre><code>const value = 42</code></pre><button><span>Copy</span></button>
    </div><div role="toolbar"><button>Retry</button></div></article>
    <article data-chat-flow-kind="assistant-step" data-chat-group-part="reasoning"><div data-slot="markdown"><p>Reasoning</p></div></article>
    <article data-message-role="assistant"><div class="markdown-body"><p>Legacy output</p></div></article>
    <article data-chat-flow-kind="user"><div class="hashed_bubble">User message</div></article>
    <div id="outside">Outside conversation</div><div id="pendant" style="cursor:grab!important">Pendant</div>
  </body></html>`)
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts' });` })
  for (const selector of ['#prose', 'strong', 'h2', 'li', 'td', 'code', '[data-slot="markdown"] p', '.markdown-body p', '.hashed_bubble']) {
    const point = await page.locator(selector).evaluate(e => {
      const range = document.createRange()
      range.setStart(e.firstChild, 0); range.setEnd(e.firstChild, 1)
      const rect = range.getBoundingClientRect()
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
    })
    await page.mouse.move(point.x, point.y)
    const actual = await page.locator(selector).evaluate(e => getComputedStyle(e).cursor)
    expect(actual).toContain('data:image/png')
    expect(actual).toMatch(/, text$/)
  }
  const blank = await page.locator('#prose').boundingBox()
  await page.mouse.move(blank.x + blank.width - 5, blank.y + blank.height / 2)
  expect(await page.locator('#prose').evaluate(e => getComputedStyle(e).cursor)).toMatch(/, default$/)
  const textPoint = await page.locator('#prose').evaluate(e => {
    const range = document.createRange(); range.setStart(e.firstChild, 0); range.setEnd(e.firstChild, 1)
    const rect = range.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })
  await page.mouse.move(textPoint.x, textPoint.y)
  expect(await page.locator('#prose').evaluate(e => e.hasAttribute('data-prts-text-hit'))).toBe(true)
  await page.locator('#prose').evaluate(e => { e.style.transform = 'translateY(200px)'; window.dispatchEvent(new Event('scroll')) })
  expect(await page.locator('#prose').evaluate(e => e.hasAttribute('data-prts-text-hit'))).toBe(false)
  await page.locator('#prose').evaluate(e => { e.style.transform = '' })
  for (const selector of ['a span', 'button span', '[role="toolbar"] button']) {
    expect(await page.locator(selector).evaluate(e => getComputedStyle(e).cursor)).toMatch(/, pointer$/)
  }
  expect(await page.locator('#outside').evaluate(e => getComputedStyle(e).cursor)).toMatch(/, default$/)
  expect(await page.locator('#pendant').evaluate(e => getComputedStyle(e).cursor)).toBe('grab')
  const box = await page.locator('#prose').boundingBox()
  await page.mouse.move(box.x + 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 120, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  expect(await page.evaluate(() => getSelection().toString().length)).toBeGreaterThan(0)
  await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'system' })
  expect(await page.locator('#prose').evaluate(e => getComputedStyle(e).cursor)).toBe('auto')
})
