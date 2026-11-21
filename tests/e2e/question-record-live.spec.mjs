import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import sharp from 'sharp'

const candidateCss = process.env.PRTS_QUESTION_CANDIDATE
  ? await readFile(new URL('../../src/styles/question-record.css', import.meta.url), 'utf8') : null

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined,
  launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } })
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let loader
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true,
      get: () => loader,
      set(value) {
        loader = value
        let load = value.load
        Object.defineProperty(value, 'load', {
          configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk) {
              const factory = registration.factory
              registration.factory = require => { window.__prtsQuestionRequire = require; return factory(require) }
            }
            return load.call(value, registration)
          },
          set(next) { load = next },
        })
      },
    })
  })
})

async function openRecord(page, { scheme = 'dark', style = 'native', width = 1440 } = {}) {
  const errors = [], writes = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch()
    const packet = await response.json()
    expect(packet.result?.ok).toBe(true)
    packet.result.value.writable = false
    for (const namespace of packet.result.value.namespaces) {
      if (namespace.ns === 'theme-prts') namespace.value = { ...namespace.value, enabled: true,
        preferencesInitialized: true, bootAnimation: false, motion: 'reduced', glass: 'standard', conversationStyle: style }
      if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
    }
    return route.fulfill({ response, json: packet })
  })
  await page.route(/\/api\/(settings\/mutate|workspace\/(pinSession|unpinSession|archiveSession|unarchiveSession|insertSessionBefore)|session\/(rename|fork|prompt|create)|commands\/execute)(?:\?|$)/, route => {
    if (new URL(route.request().url()).pathname !== '/api/session/create') writes.push(route.request().url())
    return route.abort('blockedbyclient')
  })
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
  await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', style)
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  await expect.poll(() => page.evaluate(() => typeof window.__prtsQuestionRequire), { timeout: 20_000 }).toBe('function')
  if (candidateCss) {
    await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        if (!sheet.ownerNode?.textContent.includes('--prts-reply-surface')) continue
        for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
          const rule = sheet.cssRules[index].cssText
          if (rule.includes('--prts-reply-') || rule.includes('[data-question-reply]')) sheet.deleteRule(index)
        }
      }
    })
    await page.addStyleTag({ content: candidateCss })
  }
  await page.evaluate(() => {
    const require = window.__prtsQuestionRequire
    const React = require('react')
    const ReactDOM = require('react-dom')
    const dictionaries = new Map(), registrations = new Map()
    const noop = () => {}
    require('@deepseek-ai/dsh-client-ui-user-questions').apply({
      effect: (callback, name) => name.endsWith('dictionaries') ? callback() : noop,
      locale: { register: (name, dictionary) => { dictionaries.set(name, dictionary); return noop } },
      uiSession: { registerPendingInteraction: () => noop }, reflect: { provide: () => noop },
      uiConversation: { events: { register: noop } }, remote: { $on: noop },
      slots: { inject: (_name, callback) => callback(), register: (definition, Component) => {
        if (definition.key === 'question-reply') registrations.set('reply', Component)
        return noop
      } },
    })
    const dictionary = [...dictionaries.values()][0].zh
    const common = { copy: '复制', copied: '已复制' }
    const translate = key => dictionary[key] ?? common[key] ?? key
    const stage = document.createElement('div')
    stage.id = 'prts-question-probe'
    stage.style.cssText = 'position:fixed;top:90px;left:50%;transform:translateX(-50%);width:min(700px,calc(100vw - 32px));max-height:calc(100vh - 125px);overflow:auto;padding:4px 8px 12px;z-index:100;background:#233039'
    document.querySelector('[data-prts-region="operation"]').append(stage)
    const root = ReactDOM.createRoot(stage)
    const data = { callId: 'archive-probe', outcome: 'answered', text: '原始回答', time: Date.UTC(2026, 10, 20, 9, 55),
      questions: [
        { id: 'repository', header: '仓库名', question: '独立的 ANTLR 预览仓库叫什么？（private，和主仓库一致）' },
        { id: 'path', header: '子模块路径', question: '主仓库里把预览仓库作为子模块放在哪个路径？' },
        { id: 'cleanup', header: '清理方式', question: '已经推上去的错误仓库和父仓库 commit（80d6b17）怎么处理？' },
      ], answers: [
        { id: 'repository', selected: ['dsh-antlr-preview（推荐）'] },
        { id: 'path', selected: ['antlr-preview/（推荐）'] },
        { id: 'cleanup', selected: ['revert 父提交 + 删除错误仓库（推荐）'] },
      ] }
    window.__prtsRenderQuestion = (next = {}, count = 1) => root.render(React.createElement('section', { 'data-chat-flow-kind': 'question-reply' },
      ...Array.from({ length: count }, (_, index) => React.createElement(registrations.get('reply'), {
        key: index, node: { data: { ...data, ...next, callId: `archive-probe-${index}` } }, t: translate,
      }))))
    window.__prtsRenderQuestion()
  })
  const record = page.locator('#prts-question-probe [data-question-reply]')
  await expect(record).toBeVisible()
  await expect(record).toHaveCSS('padding-left', width <= 560 ? '14px' : '18px')
  return { record, errors, writes }
}

async function material(record) {
  return record.evaluate(node => {
    const style = getComputedStyle(node)
    const bubble = node.firstElementChild.firstElementChild
    return { background: style.backgroundColor, backdrop: style.backdropFilter, ink: style.color,
      radius: style.borderRadius, opacity: style.opacity, bubbleBackground: getComputedStyle(bubble).backgroundColor,
      bubbleBackdrop: getComputedStyle(bubble).backdropFilter, bubbleRadius: getComputedStyle(bubble).borderRadius,
      avatar: getComputedStyle(node.parentElement, '::after').content, frame: getComputedStyle(node, '::after').backgroundImage,
      frameEvents: getComputedStyle(node, '::after').pointerEvents, border: style.borderTopColor,
      tabEvents: getComputedStyle(node, '::before').pointerEvents }
  })
}

for (const scheme of ['dark', 'light']) {
  for (const style of ['native', 'deck-chat']) {
    for (const width of [1440, 390]) {
      test(`question archive preserves real host replies (${scheme}, ${style}, ${width}) @live-question-record`, async ({ page }, testInfo) => {
        const { record, errors, writes } = await openRecord(page, { scheme, style, width })
        const appearance = await material(record)
        expect(appearance.bubbleBackground).toBe('rgba(0, 0, 0, 0)')
        expect(appearance.bubbleBackdrop).toBe('none')
        expect(appearance.bubbleRadius).toBe('0px')
        expect(appearance.radius).toBe('0px')
        expect(appearance.avatar).toBe('none')
        expect((appearance.frame.match(/conic-gradient/g) ?? []).length).toBe(4)
        expect(appearance.frameEvents).toBe('none')
        expect(appearance.border).toBe('rgba(0, 0, 0, 0)')
        expect(appearance.tabEvents).toBe('none')
        expect(appearance.opacity).toBe('1')
        expect(await record.locator('[class*="_bubbleWidth"] > [class*="_bubble"]').evaluate(node => getComputedStyle(node, '::before').content)).toBe('none')
        expect(await record.locator('dl').evaluate(node => getComputedStyle(node, '::before').content)).toBe('none')
        await expect(record.locator('dl > div')).toHaveCount(3)
        await expect(record.locator('dd').first()).toHaveText('dsh-antlr-preview（推荐）')
        expect(await record.locator('dl').evaluate(node => getComputedStyle(node, '::after').content)).toContain('prts-reply-item')
        const geometry = await record.evaluate(node => {
          const bounds = node.getBoundingClientRect()
          return { left: bounds.left, right: bounds.right, height: bounds.height, overflow: node.scrollWidth > node.clientWidth,
            blocked: [...node.querySelectorAll('dt, dd')].some(child => child.scrollWidth > child.clientWidth + 1) }
        })
        expect(geometry.left).toBeGreaterThanOrEqual(0)
        expect(geometry.right).toBeLessThanOrEqual(width)
        expect(geometry.overflow).toBe(false)
        expect(geometry.blocked).toBe(false)
        expect(geometry.height).toBeLessThan(width <= 560 ? 370 : 280)
        await page.locator('#prts-question-probe').screenshot({ path: testInfo.outputPath('question-archive.png') })
        for (const glass of ['soft', 'standard', 'clear', 'off']) {
          await page.locator('html').evaluate((node, value) => node.setAttribute('data-prts-glass', value), glass)
          const current = await material(record)
          if (glass === 'off') expect(current.backdrop).toBe('none')
          else expect(current.backdrop).toContain('blur(')
          expect(current.opacity).toBe('1')
          expect(current.ink).toBe(appearance.ink)
        }
        expect(errors).toEqual([])
        expect(writes).toEqual([])
      })
    }
  }
}

for (const scheme of ['dark', 'light']) for (const style of ['native', 'deck-chat']) {
  test(`repeated question archives stay compact without hiding answers (${scheme}, ${style}) @live-question-record`, async ({ page }, testInfo) => {
    const { record, errors, writes } = await openRecord(page, { scheme, style, width: 390 })
    await page.evaluate(() => window.__prtsRenderQuestion({
      questions: [{ id: 'path', header: '子模块路径', question: '预览仓库放在哪个路径？' }],
      answers: [{ id: 'path', selected: ['antlr-preview/（推荐）'] }],
    }, 3))
    await expect(record).toHaveCount(3)
    await expect(record.locator('dd')).toHaveText(Array(3).fill('antlr-preview/（推荐）'))
    const geometry = await record.evaluateAll(nodes => nodes.map(node => {
      const bounds = node.getBoundingClientRect()
      return { top: bounds.top, bottom: bounds.bottom, height: bounds.height,
        overflow: node.scrollWidth > node.clientWidth }
    }))
    for (const [index, bounds] of geometry.entries()) {
      expect(bounds.height).toBeLessThan(115)
      expect(bounds.overflow).toBe(false)
      if (index) expect(bounds.top - geometry[index - 1].bottom).toBeGreaterThanOrEqual(18)
    }
    expect(geometry.at(-1).bottom - geometry[0].top).toBeLessThan(400)
    await page.locator('#prts-question-probe').screenshot({ path: testInfo.outputPath('repeated-archives.png') })
    expect(errors).toEqual([])
    expect(writes).toEqual([])
  })
}

test('question archives keep native copy, skipped, multiselect, custom and raw replies @live-question-record', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const { record, errors, writes } = await openRecord(page)
  await record.getByRole('button').click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('dsh-antlr-preview（推荐）')
  expect(copied).not.toContain('INTERACTION RECORD')
  expect(copied).not.toContain('PRTS')
  expect(await record.ariaSnapshot()).not.toContain('INTERACTION RECORD')
  await page.evaluate(() => window.__prtsRenderQuestion({ questions: [
    { id: 'skip', question: '跳过的问题' }, { id: 'many', question: '多选与手填' },
  ], answers: [{ id: 'many', selected: ['第一项', '第二项'], custom: '手填第一行\n手填第二行' }] }))
  await expect(record.locator('dd').first()).toHaveText('已跳过')
  await expect(record.locator('dd').last()).toHaveText('第一项, 第二项, 手填第一行\n手填第二行')
  expect(await record.locator('dd').last().evaluate(node => getComputedStyle(node).whiteSpace)).toBe('pre-wrap')
  await page.evaluate(() => window.__prtsRenderQuestion({ questions: [], text: '未解析原文\n' + 'very-long-path/'.repeat(60) }))
  await expect(record.locator('dl')).toHaveCount(0)
  await expect(record.locator('p')).toContainText('未解析原文')
  expect(await record.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(false)
  await expect(record.getByRole('button')).toHaveAttribute('aria-label', '复制')
  await record.getByRole('button').focus()
  await expect(record.getByRole('button')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('very-long-path/')
  expect(errors).toEqual([])
  expect(writes).toEqual([])
})

for (const scheme of ['dark', 'light']) for (const feature of ['prefers-reduced-transparency', 'prefers-contrast']) {
  test(`question archives honor ${feature} and theme removal (${scheme}) @live-question-record`, async ({ page }) => {
    const { record, errors } = await openRecord(page, { scheme })
    const session = await page.context().newCDPSession(page)
    await session.send('Emulation.setEmulatedMedia', { features: [{ name: feature, value: feature === 'prefers-contrast' ? 'more' : 'reduce' }] })
    for (const glass of ['soft', 'standard', 'clear', 'off']) {
      await page.locator('html').evaluate((node, value) => node.setAttribute('data-prts-glass', value), glass)
      expect((await material(record)).backdrop).toBe('none')
    }
    await page.locator('html').evaluate(node => node.removeAttribute('data-dsh-prts'))
    expect(await record.evaluate(node => getComputedStyle(node, '::before').content)).toBe('none')
    await expect(record.locator('dd').first()).toHaveText('dsh-antlr-preview（推荐）')
    expect(errors).toEqual([])
  })
}

test('open archive frames retain a visible boundary in forced colors @live-question-record', async ({ page }) => {
  const { record, errors, writes } = await openRecord(page, { width: 390 })
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(record).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
  await expect(record).toHaveCSS('border-top-width', '1px')
  await expect(record.locator('dd').first()).toHaveText('dsh-antlr-preview（推荐）')
  expect(errors).toEqual([])
  expect(writes).toEqual([])
})

test('archive materials match across conversation styles and actually transmit the backdrop @live-question-record', async ({ page }) => {
  const { record } = await openRecord(page)
  const original = await material(record)
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-conversation-style', 'deck-chat'))
  expect(await material(record)).toEqual(original)
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-conversation-style', 'native'))
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-glass', 'clear'))
  const sample = async color => {
    await page.locator('#prts-question-probe').evaluate((node, value) => { node.style.background = value }, color)
    const clip = await record.evaluate(node => {
      const bounds = node.getBoundingClientRect()
      return { x: bounds.left + bounds.width - 30, y: bounds.top + 15, width: 6, height: 6 }
    })
    const statistics = await sharp(await page.screenshot({ clip })).stats()
    return statistics.channels.slice(0, 3).map(channel => channel.mean)
  }
  const difference = async () => {
    const black = await sample('#000'), white = await sample('#fff')
    return white.reduce((total, value, index) => total + Math.abs(value - black[index]), 0) / 3
  }
  expect(await difference()).toBeGreaterThan(70)
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-glass', 'off'))
  expect(await difference()).toBeLessThan(2)
})

for (const scheme of ['dark', 'light']) {
  test(`archive questions stay readable over black and white backdrops (${scheme}) @live-question-record`, async ({ page }) => {
    const { record } = await openRecord(page, { scheme })
    await page.locator('html').evaluate(node => node.setAttribute('data-prts-glass', 'clear'))
    const ink = await record.locator('dt').first().evaluate(node => getComputedStyle(node).color)
    const text = ink.startsWith('color(srgb')
      ? ink.match(/[\d.]+/g).map(Number).slice(0, 3).map(value => value * 255)
      : ink.match(/[\d.]+/g).map(Number).slice(0, 3)
    const luminance = color => color.map(value => {
      const channel = value / 255
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
    }).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0)
    for (const background of ['#000', '#fff']) {
      await page.locator('#prts-question-probe').evaluate((node, value) => { node.style.background = value }, background)
      const clip = await record.evaluate(node => {
        const bounds = node.getBoundingClientRect()
        return { x: bounds.left + bounds.width - 30, y: bounds.top + 15, width: 6, height: 6 }
      })
      const statistics = await sharp(await page.screenshot({ clip })).stats()
      const surface = statistics.channels.slice(0, 3).map(channel => channel.mean)
      const values = [luminance(text), luminance(surface)].sort((first, second) => second - first)
      expect((values[0] + .05) / (values[1] + .05)).toBeGreaterThanOrEqual(4.5)
    }
  })
}
