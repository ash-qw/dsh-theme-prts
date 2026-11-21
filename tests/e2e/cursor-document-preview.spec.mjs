import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function enableCursor(page) {
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  await page.addStyleTag({ content: '[data-code-preview] .line { display:block;position:relative;padding-left:32px;white-space:pre } [data-code-preview] .line::before { content:"1";position:absolute;left:0;user-select:none }' })
  const source = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
  await page.addScriptTag({ content: `${source}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts', motion: 'system', cursorAnimation: true });` })
  await page.evaluate(() => {
    window.previewCaretCalls = 0
    for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
      const original = document[name]?.bind(document)
      if (original) document[name] = (...args) => { window.previewCaretCalls++; return original(...args) }
    }
  })
}

for (const scheme of ['dark', 'light']) {
  for (const renderer of ['plain', 'markdown', 'code', 'code-highlighted']) {
    test(`file preview text uses the text cursor without changing controls (${scheme}, ${renderer})`, async ({ page }) => {
      await page.setContent(`<html data-dsh-prts data-prts-cursor="prts" data-prts-scheme="${scheme}"><body>
        <aside data-textpreview-state="text">
          <header><span id="path">${renderer.startsWith('code') ? 'example.py' : 'example.txt'}</span><button id="reload">Reload</button></header>
          <div data-textpreview-content>
            <div data-textpreview-body style="width:500px;height:240px;overflow:auto">
              <div ${renderer === 'plain' ? 'data-textpreview-plain' : renderer === 'markdown' ? 'data-document-markdown' : 'data-code-preview'}>
                ${renderer.startsWith('code') ? '<div data-code-block-banner><span id="language" data-text-interaction-exclude>python</span></div><div data-code-block-content>' : ''}
                ${renderer === 'plain'
                  ? '<pre data-textpreview-page="0"><div data-textpreview-line="0" id="text">文件内容 English text\n</div></pre>'
                  : renderer === 'markdown' ? '<div data-markdown><p id="text">文件内容 English text</p><div data-code-block-banner><span id="markdown-language">javascript</span><button id="markdown-copy">Copy code</button></div><pre><code><span id="code">const value = 42</span></code></pre></div>'
                    : renderer === 'code' ? '<pre><code><span class="line" id="text">def compute(value):</span>\n<span class="line" id="code">    return value + 42</span></code></pre>'
                      : '<pre class="shiki"><code><span class="line"><span id="text" style="color:#b48ead">def</span> compute(value):</span>\n<span class="line">    <span id="code" style="color:#b48ead">return</span> value + 42</span></code></pre>'}
                <p id="unselectable" data-text-interaction-exclude style="user-select:none">No selection</p>
                <p id="native" style="cursor:grab">Native drag surface</p>
                <a id="link" href="#">Document link</a><button id="copy">Copy</button>
                <button id="disabled" disabled>Unavailable</button>
                <input id="search" type="search" aria-label="Find in file">
                <div id="blank" style="height:400px"></div>
                ${renderer.startsWith('code') ? '</div>' : ''}
              </div>
            </div>
            <nav data-files-navigator><span id="filename">another.txt</span></nav>
            <div data-image-preview id="image-preview">Non-text preview</div>
          </div>
        </aside>
        <div data-markdown id="outside">Unrelated markdown</div>
      </body></html>`)
      await enableCursor(page)
      await expect(page.locator('#text')).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
      const textRow = page.locator(renderer.startsWith('code') ? '[data-code-preview] .line' : '#text').first()
      const characterPoint = (selector, offset = 0) => page.locator(selector).evaluate((element, offset) => {
        const range = document.createRange()
        offset = Math.min(offset, element.firstChild.length - 1)
        range.setStart(element.firstChild, offset)
        range.setEnd(element.firstChild, offset + 1)
        const rect = range.getBoundingClientRect()
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
      }, offset)
      const hoverCharacter = async selector => {
        const point = await characterPoint(selector)
        await page.mouse.move(point.x, point.y)
      }
      for (const zoom of [0.8, 1, 1.25]) {
        await page.locator('[data-textpreview-body]').evaluate((element, zoom) => { element.style.zoom = zoom }, zoom)
        for (const selector of renderer === 'plain' ? ['#text'] : ['#text', '#code']) {
          await hoverCharacter(selector)
          await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
          await expect(page.locator(selector)).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
        }
        const bounds = await page.locator('[data-textpreview-body]').boundingBox()
        const row = await textRow.boundingBox()
        const tail = { x: bounds.x + bounds.width - 24, y: row.y + row.height / 2 }
        expect(tail.x).toBeGreaterThan(row.x + row.width + 10)
        await page.mouse.move(tail.x, tail.y)
        expect(await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, tail)).toMatch(/default$/)
        await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
        await expect(page.locator('#blank')).toHaveCSS('cursor', /default$/)
      }
      await page.locator('[data-textpreview-body]').evaluate(element => { element.style.zoom = 1 })
      if (renderer.startsWith('code')) {
        await hoverCharacter('#text')
        await page.locator('#language').hover()
        await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
        await expect(page.locator('#language')).toHaveCSS('cursor', /default$/)
        const line = await page.locator('[data-code-preview] .line').first().boundingBox()
        await page.mouse.move(line.x + 5, line.y + line.height / 2)
        await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
      }
      const controls = [['#path', 'default'], ['#filename', 'default'], ['#outside', 'default'], ['#image-preview', 'default'], ['#unselectable', 'default'], ['#native', 'grab'], ['#link', 'pointer'], ['#reload', 'pointer'], ['#copy', 'pointer'], ['#disabled', 'not-allowed'], ['#search', 'text']]
      if (renderer === 'markdown') controls.push(['#markdown-language', 'default'], ['#markdown-copy', 'pointer'])
      for (const [selector, cursor] of controls) {
        await hoverCharacter('#text')
        await page.locator(selector).hover()
        await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
        await expect(page.locator(selector)).toHaveCSS('cursor', new RegExp(`${cursor}$`))
      }
      await page.locator('[data-textpreview-body]').evaluate(element => { element.scrollTop = 0 })
      const start = await characterPoint('#text', renderer.startsWith('code') ? 2 : 0)
      const end = await characterPoint(renderer.startsWith('code') ? '#code' : '#text', 4)
      await page.mouse.move(start.x, start.y)
      await page.mouse.down()
      await page.mouse.move(end.x, end.y, { steps: 5 })
      await page.mouse.up()
      expect(await page.evaluate(() => getSelection().toString().length)).toBeGreaterThan(0)
      await hoverCharacter('#text')
      await expect(page.locator('#text')).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
      await page.locator('[data-textpreview-body]').evaluate(element => { element.scrollTop = 200 })
      await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
      await page.locator('[data-textpreview-body]').evaluate(element => { element.scrollTop = 0 })
      await hoverCharacter('#text')
      await expect(page.locator('#text')).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
      expect(await page.evaluate(() => window.previewCaretCalls)).toBe(0)
      await page.evaluate(() => { window.cursorAdapter.update({ enabled: true, cursor: 'system' }); document.documentElement.dataset.prtsCursor = 'system' })
      await expect(page.locator('[data-prts-text-hit]')).toHaveCount(0)
      await expect(page.locator('#text')).toHaveCSS('cursor', 'auto')
    })
  }
}

test('preview fitting stays inside the sidebar body and keeps wrapped text layout and source intact', async ({ page }) => {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts"><body>
    <aside data-textpreview-body style="width:350px"><div data-document-markdown><div data-markdown>
      <p id="wrapped">${'自动换行 long text '.repeat(20)}</p><p id="short">Short paragraph</p>
      <pre><code><span class="line">short code</span>\n<span class="line" id="empty"></span></code></pre>
      <ul><li>Parent item<ul><li>${'Nested item wraps '.repeat(12)}</li></ul></li></ul>
      <dl><dt>Field</dt><dd>Field value</dd></dl>
      <table><tr><td>Table value</td></tr></table>
    </div></div></aside>
    <article data-chat-flow-kind="assistant-step" style="width:500px"><div data-markdown><p id="chat">Conversation text</p></div></article>
    <div data-document-markdown style="width:500px"><p id="standalone">Outside the sidebar</p></div>
  </body></html>`)
  const measure = () => page.locator('aside').evaluate(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    const rectangles = []
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue
      range.selectNodeContents(walker.currentNode)
      rectangles.push([...range.getClientRects()].map(rect => [rect.x, rect.y, rect.width, rect.height]))
    }
    return rectangles
  })
  await enableCursor(page)
  await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'system' })
  const before = await measure()
  const source = await page.locator('aside').textContent()
  await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'prts' })
  expect(await measure()).toEqual(before)
  expect(await page.locator('aside').textContent()).toBe(source)
  for (const selector of ['#chat', '#standalone']) {
    await expect(page.locator(selector)).toHaveCSS('width', '500px')
  }
  await expect(page.locator('#chat')).toHaveCSS('cursor', /default$/)
  await expect(page.locator('#standalone')).toHaveCSS('cursor', /text$/)
  await expect(page.locator('#empty')).toHaveCSS('cursor', /default$/)
  await expect(page.locator('td')).toHaveCSS('cursor', /text$/)
  expect(await page.locator('#short').evaluate(element => element.getBoundingClientRect().width)).toBeLessThan(300)
  await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'system' })
  await expect(page.locator('#short')).toHaveCSS('width', '350px')
})

for (const language of ['python', 'json']) {
  test(`large ${language} preview avoids character measurements and sustained stalls`, async ({ page }, testInfo) => {
    await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><article data-chat-flow-kind="assistant-step"><div data-textpreview-body><div data-code-preview><div data-code-block-content style="width:900px;height:500px;overflow:auto"><pre><code></code></pre></div></div></div></article><button id="outside">Outside preview</button></body></html>')
    await page.locator('code').evaluate((element, language) => {
      const fragment = document.createDocumentFragment()
      for (let index = 0; index < 8000; index++) {
        const line = document.createElement('span')
        line.className = 'line'
        line.textContent = language === 'python'
          ? `value_${index} = compute(${index}, "example source line with text")`
          : `"property_${index}": { "value": ${index}, "description": "example source line" },`
        fragment.append(line)
      }
      element.append(fragment)
    }, language)
    await enableCursor(page)
    await expect(page.locator('code')).toHaveCSS('cursor', /default$/)
    await expect(page.locator('.line').first()).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
    await page.evaluate(() => {
      window.previewProfile = { characterMeasurements: 0, textHitMutations: 0, frameGaps: [], longTasks: [] }
      const profile = window.previewProfile
      const original = Range.prototype.getClientRects
      Range.prototype.getClientRects = function (...args) { profile.characterMeasurements++; return original.apply(this, args) }
      const observer = new MutationObserver(records => { profile.textHitMutations += records.length })
      observer.observe(document.querySelector('[data-textpreview-body]'), { attributes: true, subtree: true, attributeFilter: ['data-prts-text-hit'] })
      const tasks = new PerformanceObserver(list => profile.longTasks.push(...list.getEntries().map(entry => entry.duration)))
      tasks.observe({ type: 'longtask' })
      let previous = performance.now(), frame
      const sample = now => { profile.frameGaps.push(now - previous); previous = now; frame = requestAnimationFrame(sample) }
      frame = requestAnimationFrame(sample)
      window.stopPreviewProfile = () => { cancelAnimationFrame(frame); observer.disconnect(); tasks.disconnect(); return { ...profile, caretCalls: window.previewCaretCalls } }
    })
    for (let index = 0; index < 48; index++) {
      await page.mouse.move(65 + index % 12 * 60, 45 + index % 10 * 40)
      if (index % 8 === 0) await page.locator('[data-code-block-content]').evaluate(element => { element.scrollTop += 120 })
    }
    await page.locator('#outside').hover()
    await page.waitForTimeout(1200)
    const profile = await page.evaluate(() => window.stopPreviewProfile())
    await testInfo.attach(`${language}-preview-profile`, { body: JSON.stringify(profile), contentType: 'application/json' })
    expect(profile.caretCalls).toBe(0)
    expect(profile.characterMeasurements).toBe(0)
    expect(profile.textHitMutations).toBe(0)
    expect(profile.frameGaps.length).toBeGreaterThan(20)
    expect(Math.max(...profile.frameGaps)).toBeLessThan(1000)
    expect(Math.max(0, ...profile.longTasks)).toBeLessThan(1000)
  })
}
