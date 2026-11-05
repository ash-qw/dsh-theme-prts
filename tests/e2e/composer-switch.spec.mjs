import { expect, test } from '@playwright/test'

for (const fixture of ['rc2', 'rc7']) {
  for (const scheme of ['dark', 'light']) {
    test(`${fixture} ${scheme} replacement composer has glass before its first paint`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
          version: 9, enabled: true, bootAnimation: false, motion: 'reduced', composerGlass: true,
          backgroundMode: 'off', conversationStyle: 'deck-chat',
        }))
      })
      await page.goto(`/tests/fixtures/${fixture}-harness.html`)
      await expect(page.locator('html')).toHaveAttribute('data-prts-composer-enhanced', '')
      await page.evaluate(value => document.documentElement.dataset.prtsScheme = value, scheme)
      const material = page.locator('[data-composer-card] > [data-prts-composer-glass-surface] > .glass-surface')
      await expect(material).toHaveCount(1)
      await expect(material).toHaveCSS('backdrop-filter', 'blur(5px) saturate(1)')
      for (let index = 0; index < 3; index++) {
        const state = await page.evaluate(async () => {
          const previous = document.querySelector('[data-composer-card]')
          const card = previous.cloneNode(true)
          card.removeAttribute('data-prts-composer-glass-active')
          for (const node of card.querySelectorAll('[data-prts-composer-glass-surface], [data-prts-composer-signal]')) node.remove()
          const input = card.querySelector('textarea, [contenteditable="true"]')
          if (input.tagName === 'TEXTAREA') input.value = 'keep this draft'
          else input.textContent = 'keep this draft'
          previous.replaceWith(card)
          input.focus()
          await new Promise(resolve => queueMicrotask(resolve))
          const surface = card.querySelector('[data-prts-composer-glass-surface] > .glass-surface')
          const style = surface && getComputedStyle(surface)
          return {
            active: card.hasAttribute('data-prts-composer-glass-active'),
            surfaces: card.querySelectorAll('[data-prts-composer-glass-surface]').length,
            blur: style?.backdropFilter,
            opacity: style?.opacity,
            tint: style?.backgroundColor,
            focused: document.activeElement === input,
            draft: input.tagName === 'TEXTAREA' ? input.value : input.textContent,
          }
        })
        expect(state).toEqual({
          active: true, surfaces: 1, blur: 'blur(5px) saturate(1)', opacity: '1',
          tint: scheme === 'dark' ? 'rgba(31, 40, 47, 0.5)' : 'rgba(244, 249, 251, 0.5)',
          focused: true, draft: 'keep this draft',
        })
      }
    })
  }
}
