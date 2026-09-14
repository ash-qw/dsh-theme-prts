import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc2-harness.html'
const enabled = {
  version: 9,
  enabled: true,
  preset: 'standard-tactical',
  texture: 'full',
  glass: 'standard',
  motion: 'reduced',
  bootAnimation: false,
  railDefaultHidden: false,
  conversationStyle: 'deck-chat',
}

test('deployed 0.1.5 layout and contenteditable composer receive the complete theme', async ({ page }) => {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await expect(page.locator('[data-slot="main"]')).toHaveCount(1)
  await expect(page.locator('[data-slot="main.conversation"]')).toHaveCount(1)
  await expect(page.locator('[data-slot="rightbar"]')).toHaveCount(1)
  await expect(page.locator('[data-slot="conversation"]')).toHaveCount(0)
  await expect(page.locator('[data-slot="details"]')).toHaveCount(0)
  await expect(page.locator('[data-prts-region="frame"]')).toHaveCount(1)
  await expect(page.locator('[data-prts-region="sessions"]')).toHaveCount(1)
  await expect(page.locator('[data-prts-region="operation"]')).toHaveCount(1)
  await expect(page.locator('[data-prts-region="auxiliary"]')).toHaveCount(1)
  await expect(page.locator('[data-prts-workspace-row]')).toHaveCount(1)
  await expect(page.locator('[data-prts-session-row]')).toHaveCount(1)
  await expect(page.locator('[data-composer-card] > [data-prts-composer-signal]')).toHaveCount(1)

  const geometry = await page.locator('[data-composer-input]').evaluate(input => {
    const inputStyle = getComputedStyle(input)
    const phaseStyle = getComputedStyle(document.querySelector('[data-slot="main.conversation"] > [data-phase]'))
    const card = input.closest('[data-composer-card]')
    const cardStyle = getComputedStyle(card)
    const outlineStyle = getComputedStyle(card, '::before')
    const surfaceStyle = getComputedStyle(card, '::after')
    const probe = document.createElement('span')
    probe.style.color = 'var(--prts-ink)'
    document.body.append(probe)
    const expectedInk = getComputedStyle(probe).color
    probe.style.color = 'var(--prts-yellow)'
    const expectedCaret = getComputedStyle(probe).color
    probe.remove()
    return {
      background: inputStyle.backgroundColor,
      color: inputStyle.color,
      caret: inputStyle.caretColor,
      outline: inputStyle.outlineStyle,
      phaseBackground: phaseStyle.backgroundColor,
      cardBorder: cardStyle.borderBottomWidth,
      outlineBackground: outlineStyle.backgroundColor,
      surfaceBackground: surfaceStyle.backgroundColor,
      surfaceBottom: surfaceStyle.bottom,
      expectedInk,
      expectedCaret,
    }
  })
  expect(geometry.background).toBe('rgba(0, 0, 0, 0)')
  expect(geometry.color).toBe(geometry.expectedInk)
  expect(geometry.caret).toBe(geometry.expectedCaret)
  expect(geometry.outline).toBe('none')
  expect(geometry.phaseBackground).toBe('rgba(0, 0, 0, 0)')
  expect(geometry.cardBorder).toBe('0px')
  expect(geometry.outlineBackground).not.toBe('rgba(0, 0, 0, 0)')
  expect(geometry.surfaceBackground).not.toBe('rgba(0, 0, 0, 0)')
  expect(geometry.surfaceBottom).toBe('3px')
})
