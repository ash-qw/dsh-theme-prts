import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function enableCursor(page) {
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts', motion: 'system', cursorAnimation: true });` })
}

for (const scheme of ['dark', 'light']) for (const style of ['native', 'deck-chat']) {
  test(`conversation CSS cursors exclude blank space and preserve text layout (${scheme}, ${style})`, async ({ page }) => {
    await page.setContent(`<html data-dsh-prts data-prts-cursor="prts" data-prts-scheme="${scheme}" data-prts-conversation-style="${style}"><body>
      <main style="width:680px">
        <article data-chat-flow-kind="assistant-step">
          <header id="chrome">Assistant header <button id="retry">Retry</button></header>
          <div data-markdown id="response">
            <h2 id="heading">Short heading</h2>
            <p id="short">Response text with <strong>emphasis</strong> and <a href="#" id="link"><span>link</span></a></p>
            <div id="blank" style="height:30px"></div>
            <p id="wrapped">${'自动换行 content '.repeat(40)}</p>
            <blockquote><p>Quoted text</p></blockquote><ul><li>List item<ul><li>${'Nested wrapped text '.repeat(10)}</li></ul></li></ul>
            <table><tr><td>Table cell</td></tr></table>
            <div data-code-block-banner><span id="language" data-text-interaction-exclude>javascript</span><button id="copy">Copy</button></div>
            <pre><code><span class="line">const value = 42</span>\n<span class="line" id="empty"></span></code></pre>
            <details><summary id="summary">Details</summary>More text</details>
            <div role="toolbar" id="toolbar">Toolbar <button id="action">Action</button></div>
            <button id="nested-control"><span data-markdown>Markdown-like control label</span></button>
            <a href="#"><span class="markdown-label" id="nested-link">Markdown-like link label</span></a>
            <span data-text-interaction-exclude id="excluded" style="user-select:none">Chrome label</span>
            <div id="drag" style="cursor:grab">Native drag</div><button id="disabled" disabled>Unavailable</button>
            <input id="input" aria-label="Search"><div id="resize" style="cursor:ew-resize">Resize</div>
          </div>
        </article>
        <article data-chat-flow-kind="user"><div data-message-bubble id="bubble">User text with trailing space</div></article>
        <article data-chat-flow-kind="assistant-step" data-chat-group-part="reasoning"><div data-slot="markdown" id="reasoning">Reasoning text</div></article>
        <div data-submission-echo><div class="host_bubble" id="echo">Pending user text</div></div>
        <div data-pending-steering><div data-text-interaction-source id="pending">Pending steering</div></div>
      </main><div id="outside">Outside conversation</div>
    </body></html>`)
    await enableCursor(page)
    for (const width of [680, 360]) for (const zoom of [0.8, 1, 1.25]) {
      const layout = await page.locator('main').evaluate((element, { width, zoom }) => {
        element.style.width = `${width}px`
        element.style.zoom = zoom
        const measure = () => {
          const text = [], walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(walker.currentNode)
            text.push([...range.getClientRects()].map(rect => [rect.x, rect.y, rect.width, rect.height]))
          }
          const shells = [...element.querySelectorAll('blockquote, table, pre, [data-message-bubble]')].map(node => {
            const box = node.getBoundingClientRect()
            return [box.x, box.y, box.width, box.height]
          })
          return { text, shells }
        }
        document.documentElement.dataset.prtsCursor = 'system'
        const before = measure()
        document.documentElement.dataset.prtsCursor = 'prts'
        return { before, after: measure() }
      }, { width, zoom })
      expect(layout.after).toEqual(layout.before)
    }
    await page.locator('main').evaluate(element => { element.style.width = '680px'; element.style.zoom = 1 })
    for (const selector of ['#heading', '#short', '#wrapped', 'strong', 'blockquote p', 'li', 'td', 'code .line:not(:empty)', '#bubble', '#reasoning', '#echo', '#pending']) {
      await expect(page.locator(selector).first()).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
    }
    for (const selector of ['#heading', '#short', 'blockquote p', 'pre .line:not(:empty)']) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      const tail = await page.locator(selector).evaluate(element => {
        const row = element.getBoundingClientRect(), parent = element.closest('[data-markdown]').getBoundingClientRect()
        return { x: parent.right - 5, y: row.y + row.height / 2 }
      })
      const cursor = await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, tail)
      expect(cursor).toMatch(/default$/)
    }
    await page.locator('#short').scrollIntoViewIfNeeded()
    const points = await page.locator('#short').evaluate(element => {
      const range = document.createRange()
      range.setStart(element.firstChild, 0)
      range.setEnd(element.firstChild, 8)
      const text = range.getBoundingClientRect(), box = element.parentElement.getBoundingClientRect()
      return { start: { x: text.x + 1, y: text.y + text.height / 2 }, end: { x: text.right - 1, y: text.y + text.height / 2 }, tail: { x: box.right - 5, y: text.y + text.height / 2 } }
    })
    await page.evaluate(() => {
      window.chatProfile = { caretCalls: 0, characterMeasurements: 0, textHitMutations: 0 }
      for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
        const original = document[name]?.bind(document)
        if (original) document[name] = (...args) => { window.chatProfile.caretCalls++; return original(...args) }
      }
      const original = Range.prototype.getClientRects
      Range.prototype.getClientRects = function (...args) { window.chatProfile.characterMeasurements++; return original.apply(this, args) }
      const observer = new MutationObserver(records => { window.chatProfile.textHitMutations += records.length })
      observer.observe(document.querySelector('main'), { attributes: true, subtree: true, attributeFilter: ['data-prts-text-hit'] })
    })
    await page.mouse.move(points.tail.x, points.tail.y)
    expect(await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, points.tail)).toMatch(/default$/)
    await page.mouse.move(points.start.x, points.start.y)
    await page.mouse.down()
    await page.mouse.move(points.end.x, points.end.y, { steps: 5 })
    await page.mouse.up()
    expect(await page.evaluate(() => getSelection().toString().length)).toBeGreaterThan(0)
    for (const [selector, cursor] of [
      ['#chrome', 'default'], ['#outside', 'default'], ['#language', 'default'], ['#toolbar', 'default'], ['#excluded', 'default'], ['#blank', 'default'],
      ['#retry', 'pointer'], ['#link span', 'pointer'], ['#copy', 'pointer'], ['#summary', 'pointer'], ['#action', 'pointer'],
      ['#nested-control span', 'pointer'], ['#nested-link', 'pointer'],
      ['#drag', 'grab'], ['#disabled', 'not-allowed'], ['#input', 'text'], ['#resize', 'ew-resize'],
    ]) {
      await page.locator(selector).hover()
      await expect(page.locator(selector)).toHaveCSS('cursor', new RegExp(`${cursor}$`))
    }
    await expect(page.locator('#empty')).toHaveCSS('cursor', /default$/)
    await expect(page.locator('pre code')).toHaveCSS('cursor', /default$/)
    await page.locator('#input').fill('Search text')
    await expect(page.locator('#input')).toHaveValue('Search text')
    await page.evaluate(() => {
      const paragraph = document.createElement('p')
      paragraph.id = 'streamed'
      paragraph.textContent = 'Streaming response'
      document.querySelector('#response').append(paragraph)
      for (let index = 0; index < 20; index++) paragraph.firstChild.appendData(' more')
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    })
    await expect(page.locator('#streamed')).toHaveCSS('cursor', /text$/)
    await page.locator('#streamed').hover()
    await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
    expect(await page.evaluate(() => window.chatProfile)).toEqual({ caretCalls: 0, characterMeasurements: 0, textHitMutations: 0 })
    await page.evaluate(() => {
      window.cursorAdapter.update({ enabled: true, cursor: 'system' })
      document.documentElement.dataset.prtsCursor = 'system'
    })
    await expect(page.locator('#short')).toHaveCSS('cursor', 'auto')
  })
}

test('long conversation movement, scrolling and streaming avoid character measurement', async ({ page }, testInfo) => {
  await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><main style="height:500px;width:800px;overflow:auto"><article data-chat-flow-kind="assistant-step"><div data-markdown></div></article></main><button id="outside">Outside</button></body></html>')
  await page.locator('[data-markdown]').evaluate(element => {
    const fragment = document.createDocumentFragment()
    for (let index = 0; index < 1200; index++) {
      const paragraph = document.createElement('p')
      paragraph.textContent = `Paragraph ${index}: ` + 'Conversation response text '.repeat(6)
      fragment.append(paragraph)
    }
    element.append(fragment)
  })
  await enableCursor(page)
  await page.evaluate(() => {
    const profile = window.chatProfile = { caretCalls: 0, characterMeasurements: 0, textHitMutations: 0, frameGaps: [] }
    for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
      const original = document[name]?.bind(document)
      if (original) document[name] = (...args) => { profile.caretCalls++; return original(...args) }
    }
    const original = Range.prototype.getClientRects
    Range.prototype.getClientRects = function (...args) { profile.characterMeasurements++; return original.apply(this, args) }
    const observer = new MutationObserver(records => { profile.textHitMutations += records.length })
    observer.observe(document.querySelector('main'), { attributes: true, subtree: true, attributeFilter: ['data-prts-text-hit'] })
    let previous = performance.now(), frame
    const sample = now => { profile.frameGaps.push(now - previous); previous = now; frame = requestAnimationFrame(sample) }
    frame = requestAnimationFrame(sample)
    window.stopChatProfile = () => { cancelAnimationFrame(frame); observer.disconnect(); return profile }
  })
  for (let index = 0; index < 48; index++) {
    await page.mouse.move(30 + index % 10 * 60, 30 + index % 8 * 50)
    if (index % 6 === 0) await page.locator('main').evaluate(element => {
      element.scrollTop += 100
      element.querySelector('p').firstChild.appendData(' streamed text')
    })
  }
  await page.locator('#outside').hover()
  await page.waitForTimeout(1200)
  const profile = await page.evaluate(() => window.stopChatProfile())
  await testInfo.attach('conversation-cursor-profile', { body: JSON.stringify(profile), contentType: 'application/json' })
  expect(profile.caretCalls).toBe(0)
  expect(profile.characterMeasurements).toBe(0)
  expect(profile.textHitMutations).toBe(0)
  expect(profile.frameGaps.length).toBeGreaterThan(20)
  expect(Math.max(...profile.frameGaps)).toBeLessThan(1000)
})
