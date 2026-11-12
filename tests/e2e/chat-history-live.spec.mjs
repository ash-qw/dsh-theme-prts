import { expect, test } from '@playwright/test'
import { createChatHistoryRecords } from '../fixtures/chat-history-records.mjs'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })

async function replayHistory(page, { scheme, style }) {
  const records = createChatHistoryRecords()
  const cursor = records.at(-1).event.seq
  const tail = records.slice(-43)
  const pages = []
  let sessionId
  let followStream
  let failures = 0
  const writes = []
  await page.addInitScript(({ scheme, style }) => {
    localStorage.removeItem('dsh.ui.prts.v1')
    localStorage.setItem('dsh.ui.prts.host-cache.v1', JSON.stringify({
      enabled: true, bootAnimation: false, conversationStyle: style, scheme,
      motion: 'reduced', bakerGroupAvatars: true,
    }))
  }, { scheme, style })
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch()
    const packet = await response.json()
    const settings = packet.result?.value
    if (packet.result?.ok) {
      settings.writable = false
      const theme = settings.namespaces.find(namespace => namespace.ns === 'theme-prts')
      const nativeTheme = settings.namespaces.find(namespace => namespace.ns === 'ui-theme')
      expect(theme).toBeDefined()
      expect(nativeTheme).toBeDefined()
      nativeTheme.value = { ...nativeTheme.value, preference: scheme }
      theme.value = { ...theme.value, enabled: true, preferencesInitialized: true,
        bootAnimation: false, conversationStyle: style, scheme, motion: 'reduced', bakerGroupAvatars: true }
    }
    return route.fulfill({ response, json: packet })
  })
  await page.route('**/api/settings/mutate', route => {
    writes.push(route.request().url())
    return route.abort('blockedbyclient')
  })
  await page.routeWebSocket(/./, socket => {
    const server = socket.connectToServer()
    socket.onMessage(message => {
      const packet = JSON.parse(message.toString())
      const request = packet.payload?.args?.request
      if (packet.endpoint === 'session/follow' && request?.address?.kind === 'session'
        && (sessionId === undefined || sessionId === request.address.sessionId)) {
        sessionId = request.address.sessionId
        followStream = packet.streamId
        request.activate = false
      }
      server.send(JSON.stringify(packet))
    })
    server.onMessage(message => {
      const packet = JSON.parse(message.toString())
      if (packet.streamId === followStream && packet.value?.type === 'snapshot') {
        packet.value = { ...packet.value, cursor, records: tail, hasMore: true,
          projections: { ...packet.value.projections, asOfSeq: cursor, values: {
            ...packet.value.projections.values,
            turnOutline: records.filter(record => record.event.type === 'turn/start').map(({ event }) => ({
              turn: event.data.turn, seq: event.seq, prompt: `历史回放第 ${event.data.turn} 轮`, response: '分页验收正文',
            })),
          } },
        }
        socket.send(JSON.stringify(packet))
      } else socket.send(message)
    })
  })
  await page.route('**/api/session/page', async route => {
    const packet = route.request().postDataJSON()
    const request = packet.payload?.args?.request
    if (request?.address?.sessionId !== sessionId) return route.continue()
    if (failures === 0) {
      failures += 1
      return route.abort('failed')
    }
    const end = records.findIndex(record => record.event.seq >= request.beforeSeq)
    expect(end).toBeGreaterThan(0)
    const start = Math.max(0, end - 360)
    const pageRecords = records.slice(start, end)
    pages.push({ beforeSeq: request.beforeSeq, firstSeq: pageRecords[0]?.event.seq })
    await new Promise(resolve => setTimeout(resolve, 150))
    return route.fulfill({ json: { type: 'server-response', rpcId: packet.rpcId,
      result: { ok: true, value: { cursor, records: pageRecords, hasMore: start > 0 } },
    } })
  })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '', { timeout: 20_000 })
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', style)
  await expect(page.locator('[data-chat-history]')).toBeVisible()
  return { pages, writes, get failures() { return failures } }
}

async function beginReadingProbe(scroll, moveToStart = false) {
  return scroll.evaluate((scroller, moveToStart) => {
    if (moveToStart) {
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }))
      scroller.scrollTop = 0
    }
    const bounds = scroller.getBoundingClientRect()
    const rows = [...scroller.querySelectorAll('[data-chat-anchor-key][data-chat-paging-anchor]:is([data-chat-flow-kind="assistant-step"], [data-chat-flow-kind="user"])')]
    const row = rows.find(node => {
      const rect = node.getBoundingClientRect()
      return rect.height > 0 && rect.top >= bounds.top + 35 && rect.top < bounds.bottom - 50
        && !node.closest('[hidden], [data-turn-process-hidden="true"]')
    })
    if (!row) return null
    const probe = { key: row.dataset.chatAnchorKey, top: row.getBoundingClientRect().top - bounds.top, samples: [], stopped: false }
    window.__prtsHistoryReadingProbe = probe
    const sample = () => {
      if (probe.stopped) return
      const anchor = [...scroller.querySelectorAll('[data-chat-anchor-key]')].find(node => node.dataset.chatAnchorKey === probe.key)
      probe.samples.push(anchor ? anchor.getBoundingClientRect().top - scroller.getBoundingClientRect().top : null)
      if (probe.samples.length < 120) requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
    return { key: probe.key, top: probe.top }
  }, moveToStart)
}

async function finishReadingProbe(scroll, anchor) {
  const sample = await scroll.evaluate((scroller, key) => {
    const probe = window.__prtsHistoryReadingProbe
    probe.stopped = true
    delete window.__prtsHistoryReadingProbe
    const row = [...scroller.querySelectorAll('[data-chat-anchor-key]')].find(node => node.dataset.chatAnchorKey === key)
    return { samples: probe.samples, top: row?.getBoundingClientRect().top - scroller.getBoundingClientRect().top }
  }, anchor.key)
  expect(sample.samples.length).toBeGreaterThan(0)
  expect(sample.samples).not.toContain(null)
  expect(Math.max(...sample.samples.map(top => Math.abs(top - anchor.top)))).toBeLessThan(2)
  expect(Math.abs(sample.top - anchor.top)).toBeLessThan(2)
}

async function expectAvatarGroups(page) {
  await expect.poll(() => page.locator('[data-conversation-scroll]').evaluate(scroller => {
    const turns = new Map()
    const mismatches = []
    for (const step of scroller.querySelectorAll('[data-chat-flow-kind="assistant-step"]:not([data-chat-group-part="reasoning"])')) {
      if (step.closest('[hidden], [data-turn-process-hidden="true"]')) continue
      const surface = step.querySelector('[data-prts-ai-surface]')
      if (!surface?.textContent.trim()) { mismatches.push('missing-surface'); continue }
      const turn = step.dataset.chatTurn
      const expected = !turns.has(turn)
      const shown = getComputedStyle(step, '::before').content !== 'none'
      if (shown !== expected) mismatches.push(step.dataset.chatAnchorKey)
      turns.set(turn, true)
    }
    if (turns.size === 0) mismatches.push('missing-turns')
    return mismatches
  })).toEqual([])
}

for (const scheme of ['dark', 'light']) for (const width of [390, 1440]) for (const style of ['native', 'deck-chat']) {
  test(`native history paging keeps reading anchors, avatars and retry (${scheme}, ${width}, ${style}) @live-rc0222`, async ({ page }) => {
    test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
    test.setTimeout(90_000)
    await page.setViewportSize({ width, height: 900 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().includes('net::ERR_FAILED')) errors.push(message.text())
    })
    const replay = await replayHistory(page, { scheme, style })
    const history = page.locator('[data-chat-history]')
    const scroll = page.locator('[data-conversation-scroll]').filter({ has: history })
    const initialCount = await page.locator('[data-chat-anchor-key]').count()
    if (style === 'deck-chat') await expectAvatarGroups(page)
    const control = await history.locator('button').boundingBox()
    await scroll.evaluate(scroller => {
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }))
      scroller.scrollTop = 0
    })
    await expect(history).toHaveAttribute('data-chat-history', 'error')
    await expect(history.locator('button')).toHaveAccessibleName('重新加载')
    expect(replay.failures).toBe(1)
    const retryControl = await history.locator('button').boundingBox()
    expect(Math.abs(control.height - retryControl.height)).toBeLessThan(.5)
    expect(Math.abs(control.width - retryControl.width)).toBeLessThan(.5)
    const anchor = await beginReadingProbe(scroll)
    expect(anchor).not.toBeNull()
    await history.locator('button').click()
    await expect.poll(() => replay.pages.length).toBe(1)
    await expect(history).toHaveAttribute('data-chat-history', 'idle')
    await page.waitForTimeout(350)
    await finishReadingProbe(scroll, anchor)
    expect(await page.locator('[data-chat-anchor-key]').count()).toBeGreaterThan(initialCount)
    if (style === 'deck-chat') await expectAvatarGroups(page)
    for (const count of [2, 3]) {
      const automaticAnchor = await beginReadingProbe(scroll, true)
      expect(automaticAnchor).not.toBeNull()
      await expect.poll(() => replay.pages.length).toBe(count)
      await expect(history).toHaveAttribute('data-chat-history', 'idle')
      await page.waitForTimeout(350)
      await finishReadingProbe(scroll, automaticAnchor)
      if (style === 'deck-chat') await expectAvatarGroups(page)
    }
    await expect(history.locator('button')).toBeDisabled()
    await expect(history.locator('button')).toHaveAccessibleName('已到会话开头')
    expect(replay.pages.at(-1).firstSeq).toBe(0)
    expect(new Set(replay.pages.map(entry => entry.beforeSeq)).size).toBe(3)
    await page.getByRole('button', { name: '回到底部', exact: true }).click()
    await expect.poll(() => scroll.evaluate(scroller => scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop)).toBeLessThan(2)
    expect(replay.writes).toEqual([])
    expect(errors).toEqual([])
  })
}
