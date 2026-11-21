import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function textPoint(locator, offset = 0) {
  await locator.scrollIntoViewIfNeeded()
  return locator.evaluate((element, offset) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode()) && !node.data.trim()) {}
    const range = document.createRange()
    range.setStart(node, Math.min(offset, node.length - 1))
    range.setEnd(node, Math.min(offset + 1, node.length))
    const box = range.getBoundingClientRect()
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }, offset)
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`theme settings use CSS text cursors without caret probes (${scheme}, ${width})`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize({ width, height: 1000 })
    await page.addInitScript(() => localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value: {
      preferencesInitialized: true, enabled: true, cursor: 'prts', bootAnimation: false, motion: 'reduced', cursorAnimation: false,
    } })))
    await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
    await expect(page.locator('html')).toHaveAttribute('data-prts-cursor', 'prts')
    await page.evaluate(scheme => { document.documentElement.dataset.prtsScheme = scheme }, scheme)
    if (await page.locator('[data-prts-rail-launcher]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
    await page.locator('[data-prts-rail-brand]').click()
    const panel = page.locator('[data-prts-theme-settings]')
    await expect(panel).toBeVisible()
    await page.evaluate(() => {
      window.settingsCursorProfile = { caret: 0, ranges: 0, outsideCaret: 0 }
      for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
        const original = document[name]?.bind(document)
        if (original) document[name] = (...args) => {
          const target = document.elementFromPoint(args[0], args[1])
          if (target?.closest('[data-prts-theme-settings]')) window.settingsCursorProfile.caret++
          if (target?.closest('#unknown-plugin-text')) window.settingsCursorProfile.outsideCaret++
          return original(...args)
        }
      }
      const original = Range.prototype.getClientRects
      Range.prototype.getClientRects = function (...args) {
        const target = this.commonAncestorContainer.nodeType === 1 ? this.commonAncestorContainer : this.commonAncestorContainer.parentElement
        if (target?.closest('[data-prts-theme-settings]')) window.settingsCursorProfile.ranges++
        return original.apply(this, args)
      }
    })
    for (const tab of ['appearance', 'background', 'flow', 'interaction', 'particles', 'assistance', 'ai-tools']) {
      await panel.locator(`[data-prts-settings-jump="${tab}"]`).click()
      const section = panel.locator(`[data-prts-settings-section="${tab}"]`)
      await expect(section).toBeVisible()
      const heading = section.locator('h3').first()
      const point = await textPoint(heading)
      await page.mouse.move(point.x, point.y)
      await expect(heading).toHaveCSS('cursor', /data:image\/png.*text$/)
      await expect(section).toHaveCSS('cursor', /default$/)
      const layout = await section.evaluate(element => {
        const measure = () => [...element.querySelectorAll('*')].map(node => {
          const box = node.getBoundingClientRect()
          return [box.x, box.y, box.width, box.height, node.textContent]
        })
        document.documentElement.dataset.prtsCursor = 'system'
        const before = measure()
        document.documentElement.dataset.prtsCursor = 'prts'
        return { before, after: measure() }
      })
      expect(layout.after).toEqual(layout.before)
      await section.evaluate(element => { element.dispatchEvent(new Event('scroll', { bubbles: true })) })
    }
    const description = panel.locator('[data-prts-ai-tools] p').first()
    const start = await textPoint(description, 0), end = await textPoint(description, 6)
    await page.mouse.move(start.x, start.y); await page.mouse.down()
    await page.mouse.move(end.x, end.y, { steps: 4 }); await page.mouse.up()
    expect(await page.evaluate(() => getSelection().toString().length)).toBeGreaterThan(0)
    await panel.locator('[data-prts-settings-jump="interaction"]').click()
    const mode = panel.getByRole('combobox', { name: '光标模式' })
    await mode.hover()
    await expect(mode.locator('span').first()).toHaveCSS('cursor', /data:image\/png.*pointer$/)
    await mode.click()
    const option = panel.getByRole('option', { name: '系统光标', exact: true })
    await expect(option).toHaveCSS('cursor', /data:image\/png.*pointer$/)
    await page.keyboard.press('Escape')
    const transferTrigger = panel.locator('[data-prts-transfer-open]')
    await transferTrigger.click()
    const transfer = panel.locator('[data-prts-transfer-dialog]')
    await expect(transfer).toBeVisible()
    const transferText = transfer.locator('p').first()
    const point = await textPoint(transferText)
    await page.mouse.move(point.x, point.y)
    await expect(transferText).toHaveCSS('cursor', /data:image\/png.*text$/)
    await expect(transfer.locator('label span').first()).toHaveCSS('cursor', /default$/)
    await transfer.locator('[data-prts-transfer-close]').click()
    await expect(panel.locator('[data-prts-text-hit]')).toHaveCount(0)
    expect(await page.evaluate(() => ({ caret: window.settingsCursorProfile.caret, ranges: window.settingsCursorProfile.ranges }))).toEqual({ caret: 0, ranges: 0 })
    await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'system' })
    expect(await panel.locator('[data-prts-setting-row="motion"] strong').evaluate(element => getComputedStyle(element).cursor)).not.toContain('data:image/png')
    await page.evaluate(() => { document.documentElement.dataset.prtsCursor = 'prts' })
    await page.keyboard.press('Escape')
    await expect(panel).not.toBeVisible()
    await page.evaluate(() => {
      const paragraph = document.createElement('p')
      paragraph.id = 'unknown-plugin-text'; paragraph.textContent = 'Unknown plugin still uses the generic fallback'
      paragraph.style.cssText = 'position:fixed;left:20px;top:700px;z-index:20000;max-width:90vw'
      document.body.append(paragraph)
    })
    const outside = page.locator('#unknown-plugin-text'), outsidePoint = await textPoint(outside)
    await page.mouse.move(outsidePoint.x, outsidePoint.y)
    await expect(outside).toHaveAttribute('data-prts-text-hit', '')
    expect(await page.evaluate(() => window.settingsCursorProfile.outsideCaret)).toBeGreaterThan(0)
  })
}

test('settings CSS excludes interactive descendants, disabled areas and drag surfaces', async ({ page }) => {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts"><body><section data-prts-theme-settings>
    <h3>Heading</h3><p>Paragraph <em>emphasis</em></p><span id="readonly">Read-only name</span><output>42</output>
    <button><strong>Action</strong></button><a href="#"><span>Link</span></a><details><summary><small>Details</small></summary></details>
    <div role="button"><span>ARIA action</span></div><div role="toolbar"><span>Toolbar</span></div>
    <button disabled><span>Disabled</span></button><div aria-disabled="true"><strong>Unavailable</strong></div>
    <label><span>Range label</span><input type="range"></label><input type="text"><textarea>Editable</textarea>
    <div data-emblem-key style="cursor:grab"><span>Draggable name</span></div>
    <div data-prts-region-stage style="cursor:move"><span>Crop surface</span></div><div data-text-interaction-exclude><span>Excluded</span></div>
  </section><p id="unmanaged">Outside settings</p></body></html>`)
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  for (const [selector, cursor] of [['h3', 'text'], ['p em', 'text'], ['#readonly', 'text'], ['output', 'text'], ['button strong', 'pointer'], ['a span', 'pointer'], ['summary small', 'pointer'], ['[role="button"] span', 'pointer'], ['[role="toolbar"] span', 'default'], ['button:disabled span', 'not-allowed'], ['[aria-disabled] strong', 'not-allowed'], ['label span', 'default'], ['input[type="range"]', 'pointer'], ['input[type="text"]', 'text'], ['textarea', 'text'], ['[data-emblem-key] span', 'grab'], ['[data-prts-region-stage] span', 'move'], ['[data-text-interaction-exclude] span', 'default'], ['#unmanaged', 'default']]) {
    await expect(page.locator(selector)).toHaveCSS('cursor', new RegExp(`${cursor}$`))
  }
})
