import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function enableCursor(page) {
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts', cursorAnimation: false });` })
}

async function textPoint(locator, offset = 1) {
  await locator.scrollIntoViewIfNeeded()
  return locator.evaluate((element, offset) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    const node = walker.nextNode(), range = document.createRange()
    range.setStart(node, Math.min(offset, node.length - 1))
    range.setEnd(node, Math.min(offset + 1, node.length))
    const rect = range.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }, offset)
}

async function hoverText(page, selector, offset) {
  const point = await textPoint(page.locator(selector), offset)
  await page.mouse.move(point.x, point.y)
  await expect(page.locator(selector)).toHaveCSS('cursor', /data:image\/png.*text$/)
  return point
}

for (const scheme of ['dark', 'light']) for (const style of ['native', 'deck-chat']) {
  test(`generic plugin content uses bounded text regions without layout edits (${scheme}, ${style})`, async ({ page }) => {
    await page.setContent(`<html data-dsh-prts data-prts-cursor="prts" data-prts-scheme="${scheme}" data-prts-conversation-style="${style}"><body>
      <section style="width:680px;max-height:800px;overflow:auto;padding:20px" tabindex="-1">
        <h3 id="heading">普通插件标题</h3><p id="paragraph">Generic paragraph with <strong id="strong">inline emphasis</strong>.</p>
        <div id="plain">没有特殊标记的 div 文字</div><span id="span">普通 span 文字</span>
        <p id="wrapped">${'Wrapped text 中文内容 '.repeat(20)}</p>
        <details open><summary id="summary">折叠标题</summary><p id="detail">展开后的普通文字</p></details>
        <pre tabindex="0"><code id="code">const value = 42\n\nsecond line</code></pre>
        <div tabindex="0" role="region"><table><tr><td id="cell">Scrollable table cell</td></tr></table></div>
        <div id="blank" style="height:40px"></div>
        <button id="button"><span>Button label</span></button><a href="https://example.com" id="link"><span>Link label</span></a>
        <div role="button" tabindex="0" id="role"><span>Semantic button</span></div>
        <div role="toolbar" id="toolbar">Toolbar label</div><div id="noselect" style="user-select:none">Non-selectable label</div>
        <div id="grab" style="cursor:grab">Draggable</div><div id="resize" style="cursor:ew-resize">Resize</div>
        <input id="input" aria-label="Input"><button disabled id="disabled">Disabled</button>
        <p id="stream">Streaming text</p><button id="outside">Outside</button>
      </section></body></html>`)
    await enableCursor(page)
    const snapshot = () => page.locator('section').evaluate(element => [...element.querySelectorAll('*')].map(node => {
      const box = node.getBoundingClientRect()
      return [box.x, box.y, box.width, box.height, node.textContent]
    }))
    const before = await snapshot()
    for (const zoom of [0.8, 1, 1.25]) {
      await page.locator('section').evaluate((element, zoom) => { element.style.zoom = zoom; element.scrollTop = 0 }, zoom)
      for (const selector of ['#heading', '#paragraph', '#strong', '#plain', '#span', '#wrapped', '#detail', '#code', '#cell']) {
        await hoverText(page, selector)
      }
      await page.locator('#paragraph').scrollIntoViewIfNeeded()
      const tail = await page.locator('#paragraph').evaluate(element => {
        const box = element.getBoundingClientRect()
        return { x: box.right - 5, y: box.y + box.height / 2 }
      })
      await page.mouse.move(tail.x, tail.y)
      await expect(page.locator('#paragraph')).not.toHaveAttribute('data-prts-text-hit')
      expect(await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, tail)).toMatch(/default$/)
    }
    await page.locator('section').evaluate(element => { element.style.zoom = 1; element.scrollTop = 0 })
    await page.locator('#outside').hover()
    await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
    await page.locator('section').evaluate(element => { element.scrollTop = 0 })
    expect(await snapshot()).toEqual(before)
    for (const [selector, cursor] of [['#summary', 'pointer'], ['#button span', 'pointer'], ['#link span', 'pointer'], ['#role span', 'pointer'], ['#toolbar', 'default'], ['#noselect', 'default'], ['#grab', 'grab'], ['#resize', 'resize'], ['#input', 'text'], ['#disabled', 'not-allowed'], ['#blank', 'default']]) {
      await hoverText(page, '#plain')
      await page.locator(selector).hover()
      await expect(page.locator(selector)).toHaveCSS('cursor', new RegExp(`${cursor}$`))
      await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
    }
    const point = await hoverText(page, '#stream')
    await page.locator('#stream').evaluate(element => { element.firstChild.data = 'New streaming text with a different width' })
    await expect(page.locator('#stream')).toHaveAttribute('data-prts-text-hit', '')
    await page.locator('#stream').evaluate(element => { element.firstChild.data = '' })
    await expect(page.locator('#stream')).not.toHaveAttribute('data-prts-text-hit')
    await page.mouse.move(point.x, point.y)
    await page.locator('#stream').evaluate(element => { element.textContent = 'Replaced text node' })
    await hoverText(page, '#stream')
    const start = await textPoint(page.locator('#plain'), 0), end = await textPoint(page.locator('#plain'), 8)
    await page.mouse.move(start.x, start.y); await page.mouse.down()
    await page.mouse.move(end.x, end.y, { steps: 6 }); await page.mouse.up()
    expect(await page.evaluate(() => getSelection().toString().length)).toBeGreaterThan(0)
    await page.evaluate(() => { window.cursorAdapter.update({ enabled: true, cursor: 'system' }); document.documentElement.dataset.prtsCursor = 'system' })
    await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  })
}

test('generic blank movement reuses complete text geometry and empty leaves skip caret probes', async ({ page }, testInfo) => {
  await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><p id="text" style="width:700px">Short plugin text</p><div id="empty" style="width:700px;height:50px"></div></body></html>')
  await enableCursor(page)
  await page.evaluate(() => {
    window.blankProfile = { caret: 0 }
    for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
      const original = document[name]?.bind(document)
      if (original) document[name] = (...args) => { window.blankProfile.caret++; return original(...args) }
    }
  })
  const profile = await page.locator('#text').evaluate(async element => {
    const box = element.getBoundingClientRect(), point = { clientX: box.right - 5, clientY: box.y + box.height / 2 }
    for (let index = 0; index < 24; index++) {
      element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', buttons: 0, ...point }))
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
    return { ...window.blankProfile }
  })
  expect(profile.caret).toBeGreaterThan(0)
  expect(profile.caret).toBeLessThan(12)
  await expect(page.locator('#text')).not.toHaveAttribute('data-prts-text-hit')
  await page.locator('#empty').hover()
  await page.waitForTimeout(100)
  const beforeIdle = await page.evaluate(() => window.blankProfile.caret)
  expect(beforeIdle).toBe(profile.caret)
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => window.blankProfile.caret)).toBe(beforeIdle)
  await page.locator('#empty').evaluate(element => { element.textContent = 'Arriving plugin content' })
  await hoverText(page, '#empty')
  await testInfo.attach('blank-region-profile', { body: JSON.stringify(profile), contentType: 'application/json' })
})

test('generic large text stays bounded and performs no idle rescans', async ({ page }, testInfo) => {
  await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><main style="width:700px;height:500px;overflow:auto"><div id="large"></div></main><button id="outside">Outside</button></body></html>')
  await page.locator('#large').evaluate(element => { element.textContent = 'Large plugin content 中文内容 '.repeat(2_000) })
  await enableCursor(page)
  const point = await textPoint(page.locator('#large'), 10)
  await page.evaluate(() => {
    window.regionProfile = { caret: 0, measurements: 0, largest: 0, frameGaps: [] }
    for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
      const original = document[name]?.bind(document)
      if (original) document[name] = (...args) => { window.regionProfile.caret++; return original(...args) }
    }
    const original = Range.prototype.getClientRects
    Range.prototype.getClientRects = function (...args) {
      window.regionProfile.measurements++
      window.regionProfile.largest = Math.max(window.regionProfile.largest, this.endOffset - this.startOffset)
      return original.apply(this, args)
    }
    let frame, previous = performance.now()
    const sample = now => { window.regionProfile.frameGaps.push(now - previous); previous = now; frame = requestAnimationFrame(sample) }
    frame = requestAnimationFrame(sample)
    window.stopRegionProfile = () => cancelAnimationFrame(frame)
  })
  await page.mouse.move(point.x, point.y)
  await expect(page.locator('#large')).toHaveAttribute('data-prts-text-hit', '')
  for (let index = 0; index < 30; index++) {
    await page.mouse.move(point.x + index % 4, point.y)
    if (index % 10 === 0) await page.locator('main').evaluate(element => { element.scrollTop += 60 })
  }
  await page.locator('#outside').hover()
  await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
  const beforeIdle = await page.evaluate(() => ({ ...window.regionProfile, frameGaps: undefined }))
  await page.waitForTimeout(700)
  const profile = await page.evaluate(() => { window.stopRegionProfile(); return window.regionProfile })
  expect({ ...profile, frameGaps: undefined }).toEqual(beforeIdle)
  expect(profile.largest).toBeLessThanOrEqual(2048)
  expect(profile.measurements).toBeGreaterThan(0)
  expect(profile.measurements).toBeLessThanOrEqual(profile.caret)
  expect(Math.max(...profile.frameGaps)).toBeLessThan(1000)
  await testInfo.attach('generic-region-profile', { body: JSON.stringify(profile), contentType: 'application/json' })
})
