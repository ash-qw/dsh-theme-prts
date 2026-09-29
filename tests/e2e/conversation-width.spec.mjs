import { expect, test } from '@playwright/test'

test('native conversation width handles stay clickable and theme content follows the host width', async ({ page }) => {
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 9,
    enabled: true,
    motion: 'reduced',
    conversationStyle: 'deck-chat',
  })))
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')

  // Model the sibling layout and native drag hit area in DSH 0.1.7-rc.2.
  await page.addStyleTag({ content: `
    [data-slot="conversation"] { position: relative; height: 600px; --dsh-chat-content-width: 700px; }
    [data-conversation-scroll] { position: absolute; inset: 0; }
    [data-width-handle] {
      position: absolute;
      z-index: 0;
      top: 0;
      bottom: 0;
      left: calc(50% + var(--dsh-chat-content-width) / 2 + 24px);
      width: 10px;
      cursor: col-resize;
    }
    [data-width-handle][data-dragging] { z-index: 8; }
    [data-composer-seat] { max-width: none; }
  ` })
  await page.locator('[data-conversation-scroll]').evaluate(scroller => {
    const handle = document.createElement('div')
    handle.setAttribute('data-width-handle', 'right')
    handle.addEventListener('pointerdown', () => handle.setAttribute('data-hit', ''))
    scroller.after(handle)
  })

  const handle = page.locator('[data-width-handle]')
  const box = await handle.boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + 200)
  await expect(handle).toHaveAttribute('data-hit', '')
  await expect(handle).toHaveCSS('z-index', '3')
  await handle.evaluate(node => node.setAttribute('data-dragging', ''))
  await expect(handle).toHaveCSS('z-index', '8')

  const conversation = page.locator('[data-slot="conversation"]')
  const assistant = page.locator('[data-message-role="assistant"]')
  const marginBefore = await assistant.evaluate(node => parseFloat(getComputedStyle(node).marginLeft))
  await page.locator('[data-conversation-scroll]').evaluate(node => node.setAttribute('data-prts-hero-active', ''))
  const composer = page.locator('[data-composer-seat]')
  const composerBefore = await composer.evaluate(node => node.getBoundingClientRect().width)
  await conversation.evaluate(node => node.style.setProperty('--dsh-chat-content-width', '900px'))
  const marginAfter = await assistant.evaluate(node => parseFloat(getComputedStyle(node).marginLeft))
  const composerAfter = await composer.evaluate(node => node.getBoundingClientRect().width)
  expect(marginAfter).toBeLessThan(marginBefore)
  expect(composerAfter - composerBefore).toBeCloseTo(200, 0)

  await page.locator('html').evaluate(node => node.setAttribute('data-prts-conversation-style', 'native'))
  await handle.evaluate(node => node.removeAttribute('data-dragging'))
  await expect(handle).toHaveCSS('z-index', '3')
})
