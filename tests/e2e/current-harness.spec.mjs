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

test('0.1.7 reasoning and response fragments keep distinct presentation', async ({ page }) => {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()
  const presentation = await page.locator('[data-conversation-scroll]').evaluate(scroller => {
    const reasoning = document.createElement('div')
    reasoning.setAttribute('data-chat-flow-kind', 'assistant-step')
    reasoning.setAttribute('data-chat-group-part', 'reasoning')
    reasoning.innerHTML = '<div class="fixture_body"><div data-markdown>Reasoning</div></div>'
    const response = reasoning.cloneNode(true)
    response.setAttribute('data-chat-group-part', 'response')
    response.querySelector('[data-markdown]').textContent = 'Answer'
    scroller.prepend(reasoning, response)
    return {
      reasoningAvatar: getComputedStyle(reasoning, '::before').content,
      responseAvatar: getComputedStyle(response, '::before').content,
      reasoningPadding: getComputedStyle(reasoning).paddingLeft,
      responsePadding: getComputedStyle(response).paddingLeft,
    }
  })
  expect(presentation.reasoningAvatar).toBe('none')
  expect(presentation.responseAvatar).toBe('""')
  expect(presentation.reasoningPadding).toBe('0px')
  expect(presentation.responsePadding).toBe('56px')
})

test('0.1.7 session menu leaves the pickup visible while the title remains scrollable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()

  const row = page.locator('[data-prts-session-row]')
  await row.hover()
  const layout = await row.evaluate(element => {
    const face = element.querySelector('[data-prts-facility-face]')
    const title = element.querySelector('[data-prts-row-title]')
    const menu = element.querySelector('[data-prts-session-menu]')
    const quickActions = element.querySelector('[data-prts-session-quick-actions]')
    const pickupBars = Array.from(element.querySelectorAll('[data-prts-session-pickup-bar]'))
    title.scrollLeft = title.scrollWidth
    return {
      faceRight: face.getBoundingClientRect().right,
      menuLeft: menu.getBoundingClientRect().left,
      menuRight: menu.getBoundingClientRect().right,
      quickActionsDisplay: getComputedStyle(quickActions).display,
      pickupRight: Math.max(...pickupBars.map(bar => bar.getBoundingClientRect().right)),
      titleScrollLeft: title.scrollLeft,
    }
  })
  expect(layout.quickActionsDisplay).toBe('none')
  expect(layout.pickupRight).toBeLessThanOrEqual(layout.menuLeft + 1)
  expect(layout.faceRight).toBeLessThanOrEqual(layout.menuLeft + 1)
  expect(layout.menuRight).toBeGreaterThan(layout.menuLeft)
  expect(layout.titleScrollLeft).toBeGreaterThan(0)
})
