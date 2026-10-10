import { expect, test } from '@playwright/test'

for (const mode of ['native', 'deck-chat']) {
  for (const width of [1440, 600]) {
    test(`submission echo matches confirmed user message immediately: ${mode}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.addInitScript(mode => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
        version: 12, enabled: true, conversationStyle: mode, motion: 'reduced', bootAnimation: false,
      })), mode)
      await page.goto('/tests/fixtures/rc2-harness.html')
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      await page.addStyleTag({ content: `
        .echoTest { width: 100%; max-width: 748px; }
        .echoTest_userRow { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .echoTest_userStack { min-width: 0; max-width: min(calc(748px * .702), 82%); display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .echoTest_bubble { padding: 10px 16px; border-radius: 20px; white-space: pre-wrap; }
      ` })
      const result = await page.evaluate(() => {
        const column = document.createElement('div')
        column.className = 'echoTest'
        document.querySelector('[data-slot="main.conversation"]').append(column)
        const markup = '<div class="echoTest_userStack"><div class="echoTest_bubble">发送后的用户消息\n第二行文字</div></div>'
        const echo = document.createElement('div')
        echo.className = 'echoTest_userRow'
        echo.setAttribute('data-submission-echo', 'true')
        echo.innerHTML = markup
        const confirmed = document.createElement('div')
        confirmed.setAttribute('data-chat-flow-kind', 'user')
        confirmed.innerHTML = `<div class="echoTest_userRow">${markup}</div>`
        column.append(echo, confirmed)
        // Read in the insertion task: no observer, timer or animation frame may be needed.
        const read = row => {
          const bubble = row.querySelector('[class$="_bubble"]')
          const css = getComputedStyle(bubble)
          const avatar = getComputedStyle(row, '::after')
          return {
            padding: css.padding, radius: css.borderRadius, border: css.borderLeft,
            background: css.background, color: css.color, shadow: css.boxShadow,
            width: bubble.getBoundingClientRect().width,
            avatar: avatar.content, avatarWidth: avatar.width, avatarRight: avatar.right,
            rowPadding: getComputedStyle(row).padding,
          }
        }
        const result = { echo: read(echo), confirmed: read(confirmed) }
        column.remove()
        return result
      })
      expect(result.echo).toEqual(result.confirmed)
      if (mode === 'deck-chat') expect(result.echo.avatar).toBe('"我"')
      else expect(result.echo.border).toContain('4px')
    })
  }
}
