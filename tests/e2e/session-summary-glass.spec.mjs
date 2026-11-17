import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } })

async function openPreview(page, scheme, mode = 'glass') {
  if (mode === 'reduced-transparency' || mode === 'high-contrast') {
    const session = await page.context().newCDPSession(page)
    const name = mode === 'high-contrast' ? 'prefers-contrast' : 'prefers-reduced-transparency'
    const value = mode === 'high-contrast' ? 'more' : 'reduce'
    await session.send('Emulation.setEmulatedMedia', { features: [{ name, value }] })
  }
  await page.addInitScript(mode => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, bootAnimation: false, motion: 'reduced', glass: mode === 'off' ? 'off' : 'standard',
  })), mode)
  await page.goto('/tests/fixtures/rc7-harness.html')
  if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({
    order: ['glass'], nodes: new Map([['glass', { kind: 'assistant-step', data: {
      status: 'settled', blocks: [{ kind: 'text', text: '这段完整回复用于检查磨砂预览的文字与层次。'.repeat(60) }],
    } }]]),
  }))
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  const menu = page.locator('[data-prts-session-summary-popover="ongoing"]')
  await expect(menu).toBeVisible()
  await expect.poll(() => menu.evaluate(element => getComputedStyle(element).opacity)).toBe('1')
  return menu
}

async function expectMaterial(surface, pseudo, mode) {
  await expect(surface).toHaveAttribute('data-prts-preserve-popup-style', '')
  await expect(surface).not.toHaveAttribute('data-prts-floating-glass')
  const style = await surface.evaluate((element, pseudo) => {
    const face = getComputedStyle(element, pseudo), root = getComputedStyle(element)
    return { background: face.backgroundColor, backdrop: face.backdropFilter, edge: face.borderTopColor,
      edgeWidth: face.borderTopWidth, radius: face.borderTopLeftRadius, textFilter: root.filter, color: face.color }
  }, pseudo)
  if (mode === 'off' || mode === 'reduced-transparency') {
    expect(style.background).toMatch(/^rgb\(/)
    expect(style.backdrop).toBe('none')
  } else {
    expect(style.background).toMatch(/^rgba\(/)
    expect(style.backdrop).toContain('blur(')
  }
  if (mode === 'high-contrast') expect(style.edge).toBe(style.color)
  else expect(style.edge).toMatch(/\/\s*0\.14\)/)
  expect(style.edgeWidth).toBe('1px')
  expect(style.radius).toBe('4px')
  expect(style.textFilter).toBe('none')
}

for (const scheme of ['dark', 'light']) {
  for (const mode of ['glass', 'off', 'reduced-transparency', 'high-contrast']) {
    test('preview surfaces share frosted material without generic popup overrides (' + scheme + ', ' + mode + ')', async ({ page }) => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      const menu = await openPreview(page, scheme, mode)
      await expectMaterial(menu, '::after', mode)
      await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
      const reply = page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
      await expect(reply).toBeVisible()
      await expectMaterial(reply, null, mode)
      if (scheme === 'light') {
        const ink = await reply.evaluate(element => getComputedStyle(element).color)
        await expect(reply.locator('[data-prts-reply-entry] > span').first()).toHaveCSS('color', ink)
        await expect(reply.locator('[data-prts-reply-ellipsis]').first()).toHaveCSS('color', ink)
      }
      await reply.locator('[data-prts-reply-entry]').first().hover()
      const detail = page.locator('[data-prts-reply-detail]:visible')
      await expect(detail).toBeVisible()
      await expectMaterial(detail, null, mode)
      if (mode === 'glass') {
        await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session', {
          pendingInteraction: { kind: 'question', questions: [{ id: 'material', question: '选择方案', options: [{ label: '继续' }] }], answer: async () => {} },
        }]])))
        await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
        await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
        const editor = page.locator('[data-prts-preview-editing]')
        await expect(editor).toBeVisible()
        await expectMaterial(editor, null, mode)
        await expect(editor.getByRole('button', { name: '继续', exact: true })).toBeVisible()
      }
      expect(errors).toEqual([])
    })
  }

  test('preview glass actually blurs the backdrop while text stays unfiltered (' + scheme + ')', async ({ page }) => {
    const menu = await openPreview(page, scheme)
    await page.evaluate(() => {
      const stripes = document.createElement('div')
      Object.assign(stripes.style, { position: 'fixed', inset: '0', zIndex: '30', pointerEvents: 'none',
        background: 'repeating-linear-gradient(90deg,#186ed0 0px 4px,#e3b04a 4px 8px)' })
      document.body.append(stripes)
    })
    const expectBlur = async (surface, pseudo) => {
      const clip = await surface.evaluate((element, pseudo) => {
        const bounds = element.getBoundingClientRect(), face = getComputedStyle(element, pseudo)
        return { x: Math.ceil(bounds.left + 14), y: Math.ceil(bounds.top + (pseudo ? 1 + parseFloat(face.top) : 0) + 6), width: 160, height: 4 }
      }, pseudo)
      const deviation = async () => {
        const stats = await sharp(await page.screenshot({ clip })).stats()
        return stats.channels.slice(0, 3).reduce((total, channel) => total + channel.stdev, 0) / 3
      }
      const blurred = await deviation()
      await surface.evaluate(element => element.style.setProperty('--prts-summary-filter', 'none'))
      const unfiltered = await deviation()
      await surface.evaluate(element => element.style.removeProperty('--prts-summary-filter'))
      expect(unfiltered).toBeGreaterThan(8)
      expect(blurred).toBeLessThan(unfiltered * 0.2)
      expect(await surface.evaluate(element => getComputedStyle(element).filter)).toBe('none')
    }
    await expectBlur(menu, '::after')
    await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
    const reply = page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
    await expect(reply).toBeVisible()
    await expectBlur(reply, null)
    await reply.locator('[data-prts-reply-entry]').first().hover()
    const detail = page.locator('[data-prts-reply-detail]:visible')
    await expect(detail).toBeVisible()
    await expectBlur(detail, null)
  })
}
