import { expect, test } from '@playwright/test'

for (const mode of ['native', 'deck-chat']) for (const scheme of ['dark', 'light']) for (const width of [1440, 600]) {
  test(`semantic user-message bubbles retain the theme across class changes (${mode}, ${scheme}, ${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await page.addInitScript(({ mode, scheme }) => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, conversationStyle: mode, scheme, motion: 'reduced', bootAnimation: false,
    })), { mode, scheme })
    await page.goto('/tests/fixtures/rc7-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
      const launcher = page.locator('[data-prts-rail-launcher]')
      if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
      await page.locator('[data-prts-scheme-toggle]').click()
    }
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
    await page.addStyleTag({ content: `
      .userMessageTestColumn { width:100%;max-width:748px; }
      .userMessageTestRow { display:flex;flex-direction:column;align-items:flex-end;gap:6px; }
      .userMessageTestStack { min-width:0;max-width:min(calc(748px * .702),82%);display:flex;flex-direction:column;align-items:flex-end;gap:8px; }
      .userMessageNative { max-width:100%;background:rgb(44,44,46);border-radius:20px;padding:10px 16px;font-size:14px;line-height:22px;color:rgb(237,241,242);white-space:pre-wrap;word-break:break-word; }
    ` })
    const result = await page.evaluate(() => {
      const root = document.documentElement
      const attributes = ['data-prts-background-mode', 'data-prts-background-full', 'data-prts-background-conversation']
      const previous = attributes.map(attribute => [attribute, root.getAttribute(attribute)])
      const column = document.createElement('div')
      column.className = 'userMessageTestColumn'
      const rows = [
        { name: 'legacy', classes: 'userMessageNative fixture_bubble', marker: false, echo: false },
        { name: 'shared', classes: 'userMessageNative _bubble_1sgyj_1 extra', marker: true, echo: false },
        { name: 'renamed', classes: 'userMessageNative shared-surface extra', marker: true, echo: false },
        { name: 'echo', classes: 'userMessageNative _bubble_1sgyj_1 extra', marker: true, echo: true },
      ].map(shape => {
        const row = document.createElement('div')
        row.className = 'userMessageTestRow'
        row.setAttribute(shape.echo ? 'data-submission-echo' : 'data-chat-flow-kind', shape.echo ? 'true' : 'user')
        row.innerHTML = `<div class="userMessageTestStack"><div class="${shape.classes}" ${shape.marker ? 'data-message-bubble data-text-interaction-source' : ''}>用户消息与长文本 LongMessageWithoutSpacesThatMustWrapInsideTheBubble
第二行文字 <span data-ref-chip="file">fixture.txt</span><pre><code>example()</code></pre><table><tbody><tr><td>cell</td></tr></tbody></table></div></div>`
        column.append(row)
        return { name: shape.name, bubble: row.firstElementChild.firstElementChild }
      })
      const unrelated = document.createElement('div')
      unrelated.className = 'userMessageNative'
      unrelated.setAttribute('data-message-bubble', '')
      unrelated.textContent = 'Outside the user transcript'
      column.append(unrelated)
      document.querySelector('[data-slot="main.conversation"], [data-slot="conversation"]').append(column)
      const read = bubble => {
        const style = getComputedStyle(bubble)
        const tail = getComputedStyle(bubble, '::before')
        const file = getComputedStyle(bubble.querySelector('[data-ref-chip]'))
        const code = getComputedStyle(bubble.querySelector('pre'))
        const cell = getComputedStyle(bubble.querySelector('td'))
        return {
          border: style.borderLeft, radius: style.borderRadius, padding: style.padding,
          background: style.backgroundColor, color: style.color, clip: style.clipPath,
          filter: style.backdropFilter, wrap: style.overflowWrap,
          tail: { content: tail.content, background: tail.backgroundColor, filter: tail.backdropFilter, right: tail.right },
          file: { color: file.color, background: file.backgroundColor, padding: file.padding },
          code: { border: code.borderLeft, padding: code.padding, font: code.fontFamily },
          cell: { padding: cell.padding, border: cell.border },
          width: bubble.getBoundingClientRect().width,
        }
      }
      try {
        return ['off', 'full', 'split'].map(material => {
          root.setAttribute('data-prts-background-mode', material)
          root.removeAttribute('data-prts-background-full')
          root.removeAttribute('data-prts-background-conversation')
          if (material === 'full') root.setAttribute('data-prts-background-full', '')
          if (material === 'split') root.setAttribute('data-prts-background-conversation', '')
          return { material, styles: Object.fromEntries(rows.map(({ name, bubble }) => [name, read(bubble)])), unrelatedRadius: getComputedStyle(unrelated).borderRadius }
        })
      } finally {
        column.remove()
        for (const [attribute, value] of previous) {
          if (value === null) root.removeAttribute(attribute)
          else root.setAttribute(attribute, value)
        }
      }
    })
    for (const state of result) {
      for (const name of ['shared', 'renamed', 'echo']) {
        expect(state.styles[name], `${state.material}: ${name}`).toEqual(state.styles.legacy)
      }
      expect(state.unrelatedRadius).toBe('20px')
      if (mode === 'native') expect(state.styles.shared.border).toContain('4px solid')
      else expect(state.styles.shared.radius).toBe(width < 760 ? '16px 0px 16px 16px' : '18px 0px 18px 18px')
      if (state.material !== 'off') {
        const filter = mode === 'native' ? state.styles.shared.filter : state.styles.shared.tail.filter
        expect(filter).toContain('blur(8px)')
      }
    }
  })
}
