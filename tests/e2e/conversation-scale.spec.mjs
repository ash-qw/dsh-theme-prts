import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc7-harness.html'
const enabled = {
  version: 2,
  enabled: true,
  scheme: 'dark',
  texture: 'full',
  glass: 'standard',
  motion: 'reduced',
  density: 'tactical',
  panelOpen: true,
}

async function enable(page, preferences = enabled) {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), preferences)
  await page.reload()
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-dsh-prts'))
}

async function populateTurns(page, count = 8) {
  await page.locator('[data-conversation-scroll]').evaluate((scroller, total) => {
    scroller.querySelector('[data-scale-fixture]')?.remove()
    scroller.style.height = '880px'
    scroller.style.overflowY = 'auto'
    for (const node of scroller.querySelectorAll('[data-message-role], [data-chat-flow-kind]')) node.hidden = true
    const fixture = document.createElement('section')
    fixture.dataset.scaleFixture = ''
    fixture.innerHTML = Array.from({ length: total }, (_, index) => {
      const kind = index % 3 === 0
        ? 'data-chat-flow-kind="user"'
        : index % 3 === 1 ? 'data-chat-flow-kind="user-step"' : 'data-message-role="user"'
      return `<div ${kind} data-chat-flow-key="turn-${index + 1}" style="min-height:44px;padding-top:8px">
          <div class="fixture_bubble">第 ${index + 1} 轮</div>
        </div><div data-chat-flow-kind="assistant-step" style="min-height:28px"><div>该轮回复。</div></div>`
    }).join('')
    const composer = scroller.querySelector('[data-composer-seat]')
    composer.style.position = 'sticky'
    composer.style.bottom = '0'
    composer.style.zIndex = '20'
    composer.style.background = 'var(--prts-canvas)'
    scroller.insertBefore(fixture, composer)
  }, count)
  await expect(page.locator('[data-prts-conversation-scale]')).toHaveAttribute('data-prts-scale-count', String(count))
}

test('@conversation-scale renders one Codex-like SVG scale without changing native composer geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await enable(page, { ...enabled, motion: 'system' })
  const scale = page.locator('[data-prts-conversation-scale]')
  await expect(scale).toBeHidden()
  const before = await page.evaluate(() => ({
    scrollerWidth: document.querySelector('[data-conversation-scroll]').getBoundingClientRect().width,
    composerWidth: document.querySelector('[data-composer-card]').getBoundingClientRect().width,
    composerHeight: document.querySelector('[data-composer-card]').getBoundingClientRect().height,
  }))
  await populateTurns(page)

  await expect(scale).toBeVisible()
  await expect(scale).toHaveAttribute('role', 'slider')
  await expect(scale).toHaveAttribute('tabindex', '0')
  await expect(scale.locator('svg')).toHaveCount(1)
  await expect(scale.locator('[data-prts-conversation-scale-gray]')).toHaveCount(1)
  await expect(scale.locator('[data-prts-conversation-scale-accent]')).toHaveCount(1)
  await expect(scale.locator('[data-prts-conversation-scale-history]')).toHaveCount(1)
  await expect(scale.locator('[data-prts-conversation-scale-hit]')).toHaveCount(1)
  await expect(scale.locator('[data-prts-conversation-scale-accent]')).toHaveAttribute('d', /^M2 .+H6$/)
  await expect(scale).toHaveCSS('opacity', '0.54')
  const restingOpacity = await scale.evaluate(node => getComputedStyle(node).opacity)

  const geometry = await page.evaluate(() => {
    const operation = document.querySelector('[data-prts-region="operation"]').getBoundingClientRect()
    const composer = document.querySelector('[data-composer-seat]').getBoundingClientRect()
    const scale = document.querySelector('[data-prts-conversation-scale]').getBoundingClientRect()
    const composerCard = document.querySelector('[data-composer-card]').getBoundingClientRect()
    const scroller = document.querySelector('[data-conversation-scroll]').getBoundingClientRect()
    return {
      withinOperation: scale.left >= operation.left && scale.right <= operation.right,
      avoidsComposer: scale.bottom <= composer.top - 8,
      scrollerWidth: scroller.width,
      composerWidth: composerCard.width,
      composerHeight: composerCard.height,
      scale: { x: scale.x, y: scale.y, width: scale.width, height: scale.height },
    }
  })
  expect(geometry.withinOperation).toBe(true)
  expect(geometry.avoidsComposer).toBe(true)
  expect(Math.abs(geometry.scrollerWidth - before.scrollerWidth)).toBeLessThan(1)
  expect(Math.abs(geometry.composerWidth - before.composerWidth)).toBeLessThan(1)
  expect(geometry.composerHeight).toBe(before.composerHeight)

  const earlyPeak = await scale.evaluate(node => new Promise(resolve => {
    const rect = node.getBoundingClientRect()
    node.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      pointerType: 'mouse',
      clientX: rect.left + 12,
      clientY: rect.top + rect.height / 2,
    }))
    requestAnimationFrame(() => {
      const path = node.querySelector('[data-prts-conversation-scale-accent]').getAttribute('d')
      resolve(Math.max(...Array.from(path.matchAll(/H([\d.]+)/g), match => Number(match[1]))))
    })
  }))
  await expect(scale).toHaveAttribute('data-prts-scale-wave', /[1-8]/)
  await page.mouse.move(geometry.scale.x + 12, geometry.scale.y + geometry.scale.height / 2)
  expect(earlyPeak).toBeLessThan(30)
  await page.waitForTimeout(45)
  const movingPeak = await scale.locator('[data-prts-conversation-scale-accent]').evaluate(node =>
    Math.max(...Array.from(node.getAttribute('d').matchAll(/H([\d.]+)/g), match => Number(match[1]))))
  expect(movingPeak).toBeGreaterThan(earlyPeak)
  await expect(scale.locator('[data-prts-conversation-scale-accent]')).toHaveAttribute('d', /H30/)
  const hoveringAccent = await scale.locator('[data-prts-conversation-scale-accent]').getAttribute('d')
  expect((hoveringAccent.match(/M/g) || []).length).toBe(1)
  await expect.poll(() => scale.evaluate(node => getComputedStyle(node).opacity)).toBe(restingOpacity)
  await page.mouse.move(geometry.scale.x + geometry.scale.width + 40, geometry.scale.y)
  await expect(scale).not.toHaveAttribute('data-prts-scale-wave', /.+/)
  await expect(scale.locator('[data-prts-conversation-scale-accent]')).toHaveAttribute('d', /^M2 .+H6$/)

  const firstY = geometry.scale.y + .5 + (geometry.scale.height - 1 - 7 * 8) / 2
  const scroller = page.locator('[data-conversation-scroll]')
  await scroller.evaluate(node => { node.scrollTop = 300 })
  await page.mouse.click(geometry.scale.x + 10, firstY)
  await expect.poll(() => scroller.evaluate(node => node.scrollTop)).toBeLessThan(40)

  await scale.focus()
  await page.keyboard.press('End')
  await expect(scale).toHaveAttribute('aria-valuenow', '8')
  await page.keyboard.press('Enter')
  await expect.poll(() => scroller.evaluate(node => node.scrollTop)).toBeGreaterThan(150)
})

test('@conversation-scale history hover shares the normal preview shell and anchor', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await enable(page)
  await populateTurns(page)
  await page.locator('[data-conversation-scroll]').evaluate(scroller => {
    const older = document.createElement('div')
    older.className = 'fixture_older'
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Load older'
    older.append(button)
    scroller.prepend(older)
  })

  const scale = page.locator('[data-prts-conversation-scale]')
  const hint = page.locator('[data-prts-conversation-history-hint]')
  const trigger = hint.locator('[data-prts-conversation-history-trigger]')
  const tooltip = hint.locator('[data-prts-conversation-history-tooltip]')
  const connector = tooltip.locator('[data-prts-conversation-history-tooltip-connector]')
  const preview = page.locator('[data-prts-conversation-preview]')
  const historyPath = scale.locator('[data-prts-conversation-scale-history]')
  await expect(scale).toHaveAttribute('data-prts-conversation-scale-partial', '')
  await expect(historyPath).toHaveAttribute('d', /^M2 .+H6M10 .+H14$/)
  await trigger.hover({ force: true })
  await expect(tooltip).toBeVisible()
  await page.waitForTimeout(160)

  const historyBox = await tooltip.boundingBox()
  const scaleBox = await scale.boundingBox()
  const triggerBox = await trigger.boundingBox()
  const historyAppearance = await tooltip.evaluate(node => ({
    background: getComputedStyle(node).backgroundColor,
    clipPath: getComputedStyle(node).clipPath,
    fontSize: getComputedStyle(node.querySelector('strong')).fontSize,
  }))
  await expect(connector).toHaveCSS('width', '14px')
  expect(historyBox.x - scaleBox.x).toBeCloseTo(40, 0)
  expect(triggerBox.height).toBe(8)

  await page.mouse.move(
    scaleBox.x + 12,
    triggerBox.y + triggerBox.height / 2 + 8,
  )
  await expect(tooltip).toBeHidden()
  await expect(preview).toHaveAttribute('data-prts-conversation-preview-visible', '')
  await expect(preview).toHaveAttribute('data-prts-preview-turn', '1')
  await page.waitForTimeout(160)
  const previewBox = await preview.boundingBox()
  const previewAppearance = await preview.evaluate(node => ({
    background: getComputedStyle(node).backgroundColor,
    clipPath: getComputedStyle(node).clipPath,
    fontSize: getComputedStyle(node.querySelector('[data-prts-conversation-preview-row]')).fontSize,
  }))
  expect(previewBox.x).toBeCloseTo(historyBox.x, 0)
  expect(historyAppearance).toEqual(previewAppearance)
})

test('@conversation-scale releases DSH sticky bottom on the first full-motion jump', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await enable(page, { ...enabled, motion: 'system' })
  await populateTurns(page, 40)
  const scale = page.locator('[data-prts-conversation-scale]')
  const scroller = page.locator('[data-conversation-scroll]')
  const geometry = await scale.boundingBox()
  const floor = await scroller.evaluate(node => {
    const originalScrollTo = node.scrollTo.bind(node)
    node.scrollTop = node.scrollHeight - node.clientHeight
    let observedTop = node.scrollTop
    let atBottom = true
    node.addEventListener('scroll', () => {
      const floor = node.scrollHeight - node.clientHeight
      const movedByReader = Math.abs(node.scrollTop - Math.min(observedTop, floor)) > .5
      const nextAtBottom = movedByReader ? floor - node.scrollTop <= 25 : atBottom
      if (!movedByReader && atBottom) node.scrollTop = floor
      atBottom = nextAtBottom
      observedTop = node.scrollTop
    })
    node.scrollTo = options => {
      const floor = node.scrollHeight - node.clientHeight
      if (options.behavior === 'smooth' && atBottom && observedTop === floor) {
        node.scrollTop = floor - .25
        return
      }
      originalScrollTo(options)
    }
    return node.scrollTop
  })

  await page.mouse.click(geometry.x + 10, geometry.y + 18)
  await expect.poll(() => scroller.evaluate(node => node.scrollTop)).toBeLessThan(floor - 50)
  await page.waitForTimeout(350)
  const landed = await scroller.evaluate(node => node.scrollTop)
  await page.waitForTimeout(200)
  expect(Math.abs(await scroller.evaluate(node => node.scrollTop) - landed)).toBeLessThanOrEqual(2)

  await scale.focus()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect.poll(() => scroller.evaluate(node => node.scrollTop)).toBeGreaterThan(landed)
})

test('@conversation-scale scrolls independently and traps wheel input at both boundaries', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await enable(page)
  await populateTurns(page, 220)
  const scale = page.locator('[data-prts-conversation-scale]')
  const scroller = page.locator('[data-conversation-scroll]')
  await expect.poll(() => scale.getAttribute('data-prts-scale-maximum')).not.toBe('0')
  const marks = scale.locator('[data-prts-conversation-scale-marks]')
  await expect(marks).toHaveAttribute('mask', /^url\(#prts-conversation-scale-fade-\d+\)$/)
  const measureCenter = () => page.evaluate(() => {
    const scrollerBox = document.querySelector('[data-conversation-scroll]').getBoundingClientRect()
    const composerBox = document.querySelector('[data-composer-seat]').getBoundingClientRect()
    const scaleBox = document.querySelector('[data-prts-conversation-scale]').getBoundingClientRect()
    const viewportCenter = (scrollerBox.top + 12 + composerBox.top - 12) / 2
    return {
      centerDelta: scaleBox.top + scaleBox.height / 2 - viewportCenter,
      scaleCenter: scaleBox.top + scaleBox.height / 2,
    }
  })
  const beforeReload = await measureCenter()
  expect(Math.abs(beforeReload.centerDelta)).toBeLessThan(1)

  await page.reload()
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-dsh-prts'))
  await populateTurns(page, 220)
  await expect.poll(() => scale.getAttribute('data-prts-scale-maximum')).not.toBe('0')
  const afterReload = await measureCenter()
  expect(Math.abs(afterReload.centerDelta)).toBeLessThan(1)
  expect(Math.abs(afterReload.scaleCenter - beforeReload.scaleCenter)).toBeLessThan(1)

  const originalBodyScroll = await scroller.evaluate(node => node.scrollTop)
  const originalOffset = Number(await scale.getAttribute('data-prts-scale-offset'))
  const box = await scale.boundingBox()
  await page.mouse.move(box.x + 10, box.y + box.height / 2)
  await page.mouse.wheel(0, -180)
  await expect.poll(async () => Number(await scale.getAttribute('data-prts-scale-offset'))).toBeLessThan(originalOffset)
  expect(await scroller.evaluate(node => node.scrollTop)).toBe(originalBodyScroll)
  await page.waitForTimeout(160)

  const offsetAfterRailWheel = await scale.getAttribute('data-prts-scale-offset')
  await scroller.evaluate(node => {
    node.scrollTop = Math.min(node.scrollHeight - node.clientHeight, 700)
    node.dispatchEvent(new Event('scroll'))
  })
  await expect(scale).toHaveAttribute('data-prts-scale-offset', offsetAfterRailWheel)

  await page.mouse.move(box.x + 10, box.y + box.height / 2)
  await page.mouse.wheel(0, -100000)
  await expect(scale).toHaveAttribute('data-prts-scale-offset', '0')
  await expect(marks).not.toHaveAttribute('mask', /.+/)
  const bodyAtTopBoundary = await scroller.evaluate(node => node.scrollTop)
  await page.mouse.wheel(0, -600)
  expect(await scroller.evaluate(node => node.scrollTop)).toBe(bodyAtTopBoundary)

  await page.mouse.wheel(0, 100000)
  await expect.poll(async () => ({
    offset: await scale.getAttribute('data-prts-scale-offset'),
    maximum: await scale.getAttribute('data-prts-scale-maximum'),
  })).toEqual(expect.objectContaining({ offset: await scale.getAttribute('data-prts-scale-maximum') }))
  await expect(marks).toHaveAttribute('mask', /^url\(#prts-conversation-scale-fade-\d+\)$/)
  const bodyAtBottomBoundary = await scroller.evaluate(node => node.scrollTop)
  await page.mouse.wheel(0, 600)
  expect(await scroller.evaluate(node => node.scrollTop)).toBe(bodyAtBottomBoundary)
})

test('@conversation-scale adapts from configured offset to centered corridor and geometry hiding', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await populateTurns(page, 8)
  const scale = page.locator('[data-prts-conversation-scale]')
  await expect(scale).toBeVisible()
  const wide = await page.evaluate(() => {
    const operation = document.querySelector('[data-prts-region="operation"]').getBoundingClientRect()
    const rail = document.querySelector('[data-prts-conversation-scale]').getBoundingClientRect()
    return rail.left - operation.left
  })
  expect(wide).toBeCloseTo(96, 1)

  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(scale).toBeVisible()
  await expect(scale).toHaveAttribute('data-prts-conversation-scale-centered', '')
  const centered = await page.evaluate(() => {
    const operation = document.querySelector('[data-prts-region="operation"]').getBoundingClientRect()
    const content = document.querySelector('[data-scale-fixture] [data-chat-flow-kind="assistant-step"]').getBoundingClientRect()
    const rail = document.querySelector('[data-prts-conversation-scale]').getBoundingClientRect()
    return { corridorCenter: (operation.left + content.left) / 2, railCenter: rail.left + rail.width / 2 }
  })
  expect(centered.railCenter).toBeCloseTo(centered.corridorCenter, 1)

  await page.setViewportSize({ width: 1100, height: 900 })
  await expect(scale).toHaveAttribute('data-prts-conversation-scale-space-obstructed', '')
  await expect(scale).toBeHidden()
  await expect(scale).toHaveAttribute('tabindex', '-1')

  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(scale).not.toHaveAttribute('data-prts-conversation-scale-space-obstructed', '')
  await expect(scale).toBeVisible()
})

test('@conversation-scale hides in overlay drawer mode and when fewer than two user turns exist', async ({ page }) => {
  await page.setViewportSize({ width: 1023, height: 900 })
  await enable(page)
  await populateTurns(page, 8)
  await expect(page.locator('[data-prts-conversation-scale]')).toBeHidden()
  await expect(page.locator('[data-conversation-scroll]')).toHaveAttribute('data-prts-conversation-scale-ready', '')

  await page.setViewportSize({ width: 1440, height: 900 })
  await populateTurns(page, 1)
  await expect(page.locator('[data-prts-conversation-scale]')).toBeHidden()
})

test('@conversation-scale unmounts during conversation-slot workspace takeover and restores afterwards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await populateTurns(page, 8)
  const scale = page.locator('[data-prts-conversation-scale]')
  const preview = page.locator('[data-prts-conversation-preview]')
  await expect(scale).toHaveAttribute('data-prts-scale-count', '8')
  await expect(preview).toHaveCount(1)

  const takeOver = async (kind, semantic = true) => {
    await page.locator('[data-slot="conversation"]').evaluate((slot, options) => {
      window.__PRTS_NATIVE_CONVERSATION__ ||= Array.from(slot.childNodes)
      const workspace = document.createElement('section')
      if (options.semantic) workspace.dataset.workspaceKind = options.kind
      workspace.textContent = options.kind === 'knowledge' ? '知识库工作区' : 'SSH 工作台'
      slot.replaceChildren(workspace)
    }, { kind, semantic })
    await expect(scale).toHaveCount(0)
    await expect(preview).toHaveCount(0)
  }

  const restore = async () => {
    await page.locator('[data-slot="conversation"]').evaluate(slot => {
      slot.replaceChildren(...window.__PRTS_NATIVE_CONVERSATION__)
    })
    await expect(scale).toHaveAttribute('data-prts-scale-count', '8')
    await expect(scale).toHaveAttribute('tabindex', '0')
    await expect(preview).toHaveCount(1)
  }

  await takeOver('knowledge')
  await restore()
  await scale.evaluate(node => { node.dataset.fixtureInstance = 'knowledge' })

  await takeOver('ssh', false)
  await restore()
  await expect(scale).not.toHaveAttribute('data-fixture-instance', 'knowledge')
})
