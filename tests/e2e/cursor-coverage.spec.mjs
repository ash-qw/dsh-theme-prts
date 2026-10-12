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
  const frame = () => page.evaluate(() => document.querySelector('[data-prts-hand-active]')?.style.cursor ?? '')
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
  const repeatedHitMutations = await page.locator('#prose').evaluate((e, point) => {
    const observer = new MutationObserver(() => {})
    observer.observe(e, { attributes: true, attributeFilter: ['data-prts-text-hit'] })
    for (let i = 0; i < 20; i++) e.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerType: 'mouse', clientX: point.x, clientY: point.y,
    }))
    const count = observer.takeRecords().length
    observer.disconnect()
    return count
  }, textPoint)
  expect(repeatedHitMutations).toBe(0)
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

test('text hit testing handles zoom, wrapped text, native controls, scrolling and lifecycle cleanup', async ({ page }) => {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts"><body>
    <article data-chat-flow-kind="assistant-step"><div data-markdown style="width:320px">
      <p id="wrapped">中文测试 English words <strong>加粗文本</strong> ${'换行测试 content '.repeat(12)}</p>
      <p id="native" style="cursor:grab">Native grab</p><p id="unselectable" style="user-select:none">No selection</p>
      <a href="#" id="link">Link</a><button id="button">Copy</button><input id="input">
      <div id="scroller" style="height:40px;overflow:auto"><p id="scroll-text">Scrollable text</p><div style="height:300px"></div></div>
    </div></article><div id="outside" style="height:60px">Outside</div>
  </body></html>`)
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts' });` })
  async function hoverCharacter(selector, offset = 0) {
    const point = await page.locator(selector).evaluate((e, offset) => {
      const range = document.createRange(); range.setStart(e.firstChild, offset); range.setEnd(e.firstChild, offset + 1)
      const r = range.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }, offset)
    await page.mouse.move(point.x, point.y)
  }
  for (const zoom of [0.8, 1, 1.25]) {
    await page.locator('article').evaluate((e, zoom) => { e.style.zoom = zoom }, zoom)
    for (const [selector, offset] of [['#wrapped', 0], ['#wrapped', 8], ['strong', 0]]) {
      await hoverCharacter(selector, offset)
      await expect(page.locator(selector)).toHaveAttribute('data-prts-text-hit', '')
    }
    const box = await page.locator('#wrapped').boundingBox()
    await page.mouse.move(box.x + box.width + 5, box.y + 5)
    await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  }
  await page.locator('article').evaluate(e => { e.style.zoom = 1 })
  for (const [selector, cursor] of [['#native', 'grab'], ['#unselectable', 'default'], ['#link', 'pointer'], ['#button', 'pointer'], ['#input', 'text']]) {
    await hoverCharacter('#wrapped')
    await page.locator(selector).hover()
    await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
    expect(await page.locator(selector).evaluate(e => getComputedStyle(e).cursor)).toMatch(new RegExp(`${cursor}$`))
  }
  await hoverCharacter('#scroll-text')
  await expect(page.locator('#scroll-text')).toHaveAttribute('data-prts-text-hit', '')
  await page.locator('#scroller').evaluate(e => { e.scrollTop = 100 })
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  // Exercise Chromium's older caret API as well as caretPositionFromPoint.
  await page.evaluate(() => { document.caretPositionFromPoint = undefined })
  await hoverCharacter('#wrapped')
  await expect(page.locator('#wrapped')).toHaveAttribute('data-prts-text-hit', '')
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { pointerType: 'mouse' })))
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  await hoverCharacter('strong')
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  await hoverCharacter('#wrapped')
  await page.evaluate(() => window.dispatchEvent(new Event('dragstart')))
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  await hoverCharacter('strong')
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  await page.evaluate(() => { delete document.hidden })
  await hoverCharacter('#wrapped')
  await page.evaluate(() => window.cursorAdapter.update({ enabled: false, cursor: 'prts' }))
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  await hoverCharacter('strong')
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
})

test('link gestures use link frames and resize cursors preserve native dragging and cleanup', async ({ page }) => {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts"><body>
    <div id="blank" style="height:40px">Background</div><button id="link">Workspace</button>
    ${['ns', 'ew', 'nesw', 'nwse', 'n', 's', 'e', 'w', 'ne', 'sw', 'nw', 'se', 'col', 'row'].map(d => `<div id="resize-${d}" style="cursor:${d}-resize;width:200px;height:25px">${d}</div>`).join('')}
  </body></html>`)
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts' });` })
  const normal = await page.locator('#blank').evaluate(e => getComputedStyle(e).cursor)
  const link = await page.locator('#link').evaluate(e => getComputedStyle(e).cursor)
  expect(normal).not.toBe(link)
  await page.evaluate(() => { document.documentElement.dataset.prtsMotion = 'reduced' })
  await page.locator('#link').hover(); await page.mouse.down()
  expect(await page.locator('#link').evaluate(e => e.style.cursor.includes(window.prtsTest.assets.cursor.link.hold))).toBe(true)
  await page.mouse.up()
  expect(await page.locator('#link').evaluate(e => e.style.cursor)).toBe('')
  for (const [direction, asset] of Object.entries({ns:'ns',ew:'ew',nesw:'nesw',nwse:'nwse',n:'ns',s:'ns',e:'ew',w:'ew',ne:'nesw',sw:'nesw',nw:'nwse',se:'nwse',col:'ew',row:'ns'})) {
    const handle = page.locator(`#resize-${direction}`)
    await handle.hover()
    expect(await handle.evaluate((e, asset) => getComputedStyle(e).cursor.includes(window.prtsTest.assets.cursor.resize[asset]), asset)).toBe(true)
    await page.mouse.down()
    expect(await handle.evaluate(e => e.hasAttribute('data-prts-hand-active'))).toBe(false)
    await page.mouse.up()
    await page.locator('#blank').hover()
    expect(await handle.evaluate(e => e.style.cursor)).toBe(`${direction}-resize`)
  }
  await page.evaluate(() => {
    const handle = document.querySelector('#resize-ew')
    let start
    handle.addEventListener('pointerdown', e => { start = e.clientX; handle.setPointerCapture(e.pointerId) })
    handle.addEventListener('pointermove', e => { if (e.buttons & 1) handle.style.width = `${200 + e.clientX - start}px` })
  })
  const handle = page.locator('#resize-ew')
  await handle.hover(); const point = await handle.boundingBox()
  await page.mouse.down(); await page.mouse.move(point.x + point.width / 2 + 40, point.y + point.height / 2, { steps: 5 }); await page.mouse.up()
  await expect(handle).toHaveCSS('width', '240px')
  await page.evaluate(() => window.cursorAdapter.dispose())
  expect(await handle.evaluate(e => e.style.cursor)).toBe('ew-resize')
})

test('cursor setting is one accessible sliding switch with keyboard and persistence support', async ({ page }) => {
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, cursor: 'prts', bootAnimation: false })))
  await page.reload()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="interaction"]').click()
  const toggle = page.getByRole('switch', { name: 'PRTS 光标', exact: true })
  await expect(toggle).toHaveCount(1)
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await expect(toggle).toHaveCSS('width', '42px')
  await expect(toggle).toHaveCSS('height', '24px')
  await expect(page.locator('[data-prts-setting-row="cursor"] button')).toHaveCount(1)
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).cursor)).toBe('system')
  await toggle.press('Space')
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).cursor)).toBe('prts')
})

test('boolean settings use switches and flow details appear only when relevant', async ({ page }) => {
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false, sessionFlow: false, sessionFlowPalette: 'amber', sessionFlowSpeed: 1.5 })))
  await page.reload()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="interaction"]').click()
  await expect(page.getByRole('switch', { name: '默认隐藏导航栏', exact: true })).toBeVisible()
  await page.locator('[data-prts-settings-jump="flow"]').click()
  const flow = page.getByRole('switch', { name: '当前会话流线', exact: true })
  await expect(flow).toHaveAttribute('aria-checked', 'false')
  for (const key of ['sessionGlow', 'sessionFlowPalette', 'sessionFlowColors', 'sessionFlowSpeed']) {
    await expect(page.locator(`[data-prts-setting-row="${key}"]`)).toBeHidden()
  }
  await flow.click()
  await expect(page.getByRole('switch', { name: '流线光效', exact: true })).toBeVisible()
  await expect(page.locator('[data-prts-setting-row="sessionFlowSpeed"]')).toBeVisible()
  await expect(page.locator('[data-prts-setting-key="sessionFlowSpeed"]')).toHaveValue('1.5')
  await expect(page.locator('[data-prts-setting-key="sessionFlowPalette"][data-prts-setting-value="amber"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-prts-setting-row="sessionFlowColors"]')).toBeHidden()
  await page.locator('[data-prts-setting-key="sessionFlowPalette"][data-prts-setting-value="custom"]').click()
  await expect(page.locator('[data-prts-setting-row="sessionFlowColors"]')).toBeVisible()
  await flow.click()
  await expect(page.locator('[data-prts-setting-row="sessionFlowColors"]')).toBeHidden()
  await flow.click()
  await expect(page.locator('[data-prts-setting-row="sessionFlowColors"]')).toBeVisible()
  await expect(page.locator('[data-prts-setting-key="sessionFlowSpeed"]')).toHaveValue('1.5')
})

test('settings tabs show only the selected page and expose particle controls', async ({ page }) => {
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false })))
  await page.reload()
  await page.locator('[data-prts-rail-brand]').click()
  await page.getByRole('tab', { name: '会话流线', exact: true }).click()
  const flow = page.locator('[data-prts-settings-section="flow"]')
  await expect(flow).toBeVisible()
  await expect(page.locator('[data-prts-settings-jump="flow"]')).toHaveAttribute('aria-selected', 'true')
  expect(await page.locator('[data-prts-theme-settings-scroll]').evaluate(e => e.scrollTop)).toBe(0)
  await page.locator('[data-prts-settings-jump="particles"]').click()
  await expect(page.locator('[data-prts-settings-advanced]')).toBeVisible()
  await expect(flow).toBeHidden()
  await expect(page.getByRole('radiogroup', { name: '粒子精度' })).toBeVisible()
  await expect(page.locator('[data-prts-settings-jump="particles"]')).toHaveAttribute('aria-selected', 'true')
  await page.locator('[data-prts-settings-jump="appearance"]').click()
  await expect.poll(() => page.locator('[data-prts-theme-settings-scroll]').evaluate(e => e.scrollTop)).toBe(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-prts-theme-settings]')).not.toBeVisible()
})
