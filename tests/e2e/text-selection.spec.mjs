import { expect, test } from '@playwright/test'
import sharp from 'sharp'

for (const scheme of ['light', 'dark']) {
  for (const conversationStyle of ['native', 'deck-chat']) {
    test(`root highlight preserves text selection (${scheme}, ${conversationStyle})`, async ({ page }) => {
      await page.addInitScript(({ scheme, conversationStyle }) => {
        localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({
          revision: 1,
          value: { enabled: true, bootAnimation: false, scheme, conversationStyle },
        }))
      }, { scheme, conversationStyle })
      await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      await page.evaluate(({ scheme, conversationStyle }) => {
        document.documentElement.dataset.prtsScheme = scheme
        document.documentElement.dataset.prtsConversationStyle = conversationStyle
        const probe = document.createElement('section')
        probe.dataset.prtsSelectionProbe = ''
        probe.style.cssText = 'position:fixed;inset:100px 100px auto;z-index:12000;padding:20px;background:white;color:black;font:20px/2 monospace'
        probe.innerHTML = '<div data-message-role="user"><p><span data-selection-text="user">User selection text</span></p></div><div data-prts-ai-surface><p><strong data-selection-text="assistant">Assistant selection text</strong></p><pre><code><span style="color:green" data-selection-text="code">Nested code selection</span></code></pre><table><tbody><tr><td><span data-selection-text="table">Table selection text</span></td></tr></tbody></table></div><p data-selection-text="page">Non-chat selection text</p>'
        document.body.append(probe)
      }, { scheme, conversationStyle })

      for (const target of ['user', 'assistant', 'code', 'table', 'page']) {
        const text = page.locator(`[data-selection-text="${target}"]`)
        const highlight = await text.evaluate(node => {
          const style = getComputedStyle(node, '::selection')
          const range = document.createRange()
          range.selectNodeContents(node)
          const selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
          return { background: style.backgroundColor, color: style.color, selected: selection.toString(), text: node.textContent }
        })
        expect(highlight).toEqual({ background: 'rgb(240, 200, 0)', color: 'rgb(22, 19, 0)', selected: highlight.text, text: highlight.text })
        const { data, info } = await sharp(await text.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true })
        let highlightedPixels = 0
        for (let offset = 0; offset < data.length; offset += info.channels) {
          if (data[offset] === 240 && data[offset + 1] === 200 && data[offset + 2] === 0) highlightedPixels += 1
        }
        expect(highlightedPixels).toBeGreaterThan(100)
      }
      await page.evaluate(() => window.getSelection().removeAllRanges())
      await page.evaluate(() => document.querySelector('[data-prts-theme-disable]').click())
      await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts', '')
      const restored = await page.locator('[data-selection-text="code"]').evaluate(node => getComputedStyle(node, '::selection').backgroundColor)
      expect(restored).not.toBe('rgb(240, 200, 0)')
    })
  }
}
