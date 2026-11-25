import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import sharp from 'sharp'

const candidateCss = process.env.PRTS_ENGINEERING_CANDIDATE
  ? await readFile(new URL('../../src/styles/engineering-record.css', import.meta.url), 'utf8') : null

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined,
  launchOptions: process.env.PRTS_ENGINEERING_CHROMIUM ? { executablePath: process.env.PRTS_ENGINEERING_CHROMIUM } : {} })
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let loader
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true, get: () => loader,
      set(value) {
        loader = value
        let load = value.load
        Object.defineProperty(value, 'load', {
          configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk) {
              const factory = registration.factory
              registration.factory = require => { window.__engineeringRequire = require; return factory(require) }
            }
            return load.call(value, registration)
          },
          set(next) { load = next },
        })
      },
    })
  })
})

async function openRecord(page, { scheme = 'dark', style = 'native', width = 1440, actual = false } = {}) {
  const errors = [], writes = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch(), packet = await response.json()
    packet.result.value.writable = false
    for (const namespace of packet.result.value.namespaces) {
      if (namespace.ns === 'theme-prts') namespace.value = { ...namespace.value, enabled: true,
        preferencesInitialized: true, bootAnimation: false, motion: 'reduced', glass: 'standard', conversationStyle: style }
      if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
    }
    return route.fulfill({ response, json: packet })
  })
  await page.route(/\/api\/(settings\/mutate|workspace\/(pinSession|unpinSession|archiveSession)|session\/(rename|fork|prompt|create)|commands\/execute)(?:\?|$)/, route => {
    if (new URL(route.request().url()).pathname !== '/api/session/create') writes.push(route.request().url())
    return route.abort('blockedbyclient')
  })
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
  await expect.poll(() => page.evaluate(() => typeof window.__engineeringRequire), { timeout: 20_000 }).toBe('function')
  if (candidateCss) {
    // Replace this module's installed rules rather than layering over an older design.
    await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        let rules
        try { rules = sheet.cssRules } catch { continue }
        for (let i = rules.length - 1; i >= 0; i--) {
          const text = rules[i].cssText
          if (text.includes('prts-engineering') || (text.includes('[data-changed-files]:has(') && text.includes('_titles'))) sheet.deleteRule(i)
        }
      }
    })
    await page.addStyleTag({ content: candidateCss })
  }
  if (actual) {
    const workspace = page.locator('[data-prts-workspace-row][data-row-key="workspace:2dfbdf26-cb30-4382-8dfe-d03644976122"]')
    await expect(workspace).toBeVisible()
    if (await workspace.getAttribute('aria-expanded') === 'false') await workspace.click()
    await page.locator('[data-row-key="session:session-e08df2a5-057c-4fa1-bb48-c6e91f426b95"]').click()
    // Keep targeting the second recovered record when later turns add more summaries.
    const record = page.locator('[data-changed-files]').nth(1)
    await expect.poll(() => page.locator('[data-changed-files]').count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(2)
    await expect(record).toBeVisible()
    // Match the user's 1265px-wide card, beyond the host's default 920px column.
    if (width === 1963) await record.evaluate(node => { node.style.width = '1265px'; node.style.maxWidth = 'none' })
    await record.scrollIntoViewIfNeeded()
    return { record, errors, writes }
  }
  await page.evaluate(({ scheme }) => {
    const require = window.__engineeringRequire, React = require('react'), ReactDOM = require('react-dom')
    const noop = () => {}, dictionaries = new Map()
    let Component
    require('@deepseek-ai/dsh-client-ui-deliverables').apply({
      effect: (callback, name) => name?.endsWith('dictionaries') ? callback() : noop,
      on: noop, provide: noop,
      locale: { register: (name, dictionary) => { dictionaries.set(name, dictionary); return noop }, bind: () => noop },
      uiConversation: { events: { register: noop } },
      slots: { inject: (_name, callback) => callback(), register: (definition, component) => {
        if (definition.name === 'conversation.chat.turnTail') Component = component
        return noop
      } },
    })
    if (!Component) throw new Error('Native deliverables component was not registered')
    const dictionary = [...dictionaries.values()][0].zh
    const t = (key, values = {}) => (dictionary[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''))
    const stage = document.createElement('section')
    stage.id = 'engineering-record-probe'
    stage.setAttribute('data-turn-tail', '1')
    stage.style.cssText = `position:fixed;top:100px;left:50%;transform:translateX(-50%);width:min(700px,calc(100vw - 32px));max-height:calc(100vh - 130px);overflow:auto;padding:14px;z-index:100;background:${scheme === 'dark' ? '#253b47' : '#cfdee6'}`
    document.querySelector('[data-prts-region="operation"]').append(stage)
    const root = ReactDOM.createRoot(stage)
    const files = ['dialects/sybase-ase/grammar/SybaseASEParser.g4', 'dialects/sybase-ase/grammar/skeleton.manifest.yaml',
      'dialects/sybase-ase/reports/skeleton.md', 'sql-grammar-notes'].map((path, index) => ({ path, display: path, added: index === 0 ? 6 : 1, deleted: index === 0 ? 6 : 1 }))
    let generation = 0
    window.__engineeringOpened = []
    window.__renderEngineering = (next = {}) => {
      const summary = { files, total: files.length, added: 9, deleted: 9, turn: 1, ...next }
      window.__engineeringSummary = summary
      const turn = { data: new Map([['deliverables', { produced: [], changes: { seq: 17 } }]]) }
      root.render(React.createElement(Component, {
        key: ++generation, turn, sessionId: 'engineering-probe', t,
        useContextMenu: () => ({ getTriggerProps: () => ({}) }), openFile: noop,
        useSessions: selector => selector({ byId: { 'engineering-probe': { cwd: '/workspace' } } }),
        useShowCodeDiff: selector => selector(true), usePresentedOpen: selector => selector({}),
        usePresentedHost: selector => selector({ available: true }),
        useChangesSummary: selector => selector(new Proxy({}, { get: () => summary })),
        useChangesDiff: selector => selector(new Proxy({}, { get: () => ({ kind: 'binary' }) })),
        loadChangesSummary: noop, loadChangesDiff: noop, reloadPresentedHost: noop, openPresented: noop,
        openChangesReview: (coordinates, index) => window.__engineeringOpened.push({ coordinates, index }), renderSlot: () => null,
      }))
    }
    window.__renderEngineering()
  }, { scheme })
  const record = page.locator('#engineering-record-probe [data-changed-files]')
  await expect(record).toBeVisible()
  return { record, errors, writes }
}

// Local recovered session: exercise the actual chat ancestry and custom wallpaper.
// Deliberately disable masks. Each hole must still expose the unfiltered wallpaper,
// matching a second screenshot with the entire decorative plane hidden.
for (const width of [1440, 1963]) test(`real session exposes wallpaper without masks (${width}) @live-engineering`, async ({ page }, testInfo) => {
  const { record, errors, writes } = await openRecord(page, { style: 'deck-chat', width, actual: true })
  if (width === 1963) expect((await record.boundingBox()).width).toBe(1265)
  await page.mouse.move(0, 0)
  await page.addStyleTag({ content: 'html[data-dsh-prts] [data-changed-files]::after { mask: none !important; -webkit-mask: none !important; }' })
  for (const mode of ['standard', 'off']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-prts-glass', value), mode)
    const paper = await sharp(await record.screenshot({ path: testInfo.outputPath(`real-session-tape-${mode}.png`) })).raw().toBuffer({ resolveWithObject: true })
    const hidden = await page.addStyleTag({ content: 'html[data-dsh-prts] [data-changed-files]::after { visibility: hidden !important; }' })
    const backdrop = await sharp(await record.screenshot({ path: testInfo.outputPath(`real-session-backdrop-${mode}.png`) })).raw().toBuffer({ resolveWithObject: true })
    await hidden.evaluate(node => node.remove())
    expect(paper.info).toEqual(backdrop.info)
    let exposed = 0, paperDifference = 0
    for (let y = 10; y < paper.info.height - 10; y += 20) {
      for (const x of [10, paper.info.width - 10]) {
        const offset = (y * paper.info.width + x) * paper.info.channels
        for (let channel = 0; channel < 3; channel++) {
          expect(Math.abs(paper.data[offset + channel] - backdrop.data[offset + channel])).toBeLessThanOrEqual(2)
        }
        exposed++
      }
      const offset = (y * paper.info.width + 23) * paper.info.channels
      paperDifference += Math.abs(paper.data[offset] - backdrop.data[offset])
    }
    expect(exposed).toBeGreaterThanOrEqual(20)
    expect(paperDifference / (exposed / 2)).toBeGreaterThan(30)
  }
  expect(errors).toEqual([]); expect(writes).toEqual([])
})

for (const scheme of ['dark', 'light']) for (const style of ['native', 'deck-chat']) for (const width of [1440, 390]) {
  test(`engineering record preserves native review, preview and folding (${scheme}, ${style}, ${width}) @live-engineering`, async ({ page }, testInfo) => {
    const { record, errors, writes } = await openRecord(page, { scheme, style, width })
    await expect(record).toHaveCSS('border-radius', '0px')
    await expect(record).toHaveCSS('clip-path', 'none')
    const header = record.getByRole('button', { name: '在侧边栏查看本轮改动', exact: true })
    await expect(header).toHaveAccessibleName('在侧边栏查看本轮改动')
    await expect(record.locator('ul > li')).toHaveCount(4)
    const countColors = await record.locator('ul [class*="_counts"]').first().evaluate(node =>
      [...node.children].map(child => getComputedStyle(child).color))
    expect(countColors).toEqual(['rgb(0, 93, 43)', 'rgb(161, 23, 32)'])
    await expect(record.locator('[class*="_title"]').filter({ hasText: '已编辑 4 个文件' }).first()).toBeVisible()
    await header.click()
    expect(await page.evaluate(() => window.__engineeringOpened.at(-1).index)).toBe(0)
    const row = record.locator('ul button').nth(2)
    await row.click()
    expect(await page.evaluate(() => window.__engineeringOpened.at(-1).index)).toBe(2)
    await row.focus(); await page.keyboard.press('Enter')
    expect(await page.evaluate(() => window.__engineeringOpened.length)).toBe(3)
    await expect(row).toHaveCSS('box-shadow', /inset/)
    await page.mouse.move(0, 0)
    await row.hover()
    await expect(page.locator('[data-changes-hover-preview]')).toBeVisible({ timeout: 3000 })
    await page.mouse.move(0, 0)
    await expect(page.locator('[data-changes-hover-preview]')).toBeHidden()
    await page.evaluate(() => document.activeElement?.blur())
    await record.screenshot({ path: testInfo.outputPath('engineering-record.png') })
    const geometry = await record.evaluate(node => ({ width: node.clientWidth, height: node.clientHeight,
      overflow: node.scrollWidth > node.clientWidth + 1,
      filter: getComputedStyle(node).backdropFilter,
      shape: getComputedStyle(node, '::after').clipPath,
      paper: getComputedStyle(node, '::after').backgroundImage,
      mask: getComputedStyle(node, '::after').maskImage || getComputedStyle(node, '::after').webkitMaskImage,
      paperFilter: getComputedStyle(node, '::after').backdropFilter,
      decorationPointer: getComputedStyle(node, '::before').pointerEvents,
      topEdge: getComputedStyle(node, '::before').content,
      eyebrow: getComputedStyle(node.querySelector('[class*="_header"]'), '::before').content,
      captionSize: getComputedStyle(node.querySelector('[class*="_header"]'), '::after').fontSize,
      headerHeight: node.querySelector('[class*="_header"]').getBoundingClientRect().height,
      nestedBlur: [...node.querySelectorAll('button')].some(x => getComputedStyle(x).backdropFilter !== 'none') }))
    expect(geometry.overflow).toBe(false)
    expect(geometry.height).toBeLessThan(width === 1440 ? 220 : 320)
    expect(geometry.headerHeight).toBeLessThan(60)
    expect(geometry.topEdge).toBe('none')
    expect(geometry.eyebrow).toContain('ENGINEERING LOG')
    expect(geometry.captionSize).toBe('13px')
    expect(geometry.filter).toBe('none')
    expect(geometry.nestedBlur).toBe(false)
    expect(geometry.shape).toContain('polygon')
    expect(geometry.paper).toContain('radial-gradient')
    expect(geometry.mask).toBe('none')
    expect(geometry.paperFilter).toBe('none')
    expect(geometry.decorationPointer).toBe('none')
    await page.evaluate(() => {
      const files = [...window.__engineeringSummary.files, { path: 'extra/a.json', display: 'extra/a.json', added: 0, deleted: 2 },
        { path: 'extra/b.json', display: 'extra/b.json', added: 0, deleted: 1 }]
      window.__renderEngineering({ files, total: 6, deleted: 12 })
    })
    await expect(record.locator('ul > li')).toHaveCount(4)
    const toggle = record.getByRole('button', { name: '展开全部 6 个改动文件' })
    await toggle.focus(); await page.keyboard.press('Space')
    await expect(record.locator('ul > li')).toHaveCount(6)
    await record.getByRole('button', { name: '收起改动文件列表' }).click()
    await expect(record.locator('ul > li')).toHaveCount(4)
    expect(errors).toEqual([]); expect(writes).toEqual([])
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) test(`engineering records keep single files, exceptional counts and long paths (${scheme}, ${width}) @live-engineering`, async ({ page }, testInfo) => {
  const { record, errors, writes } = await openRecord(page, { scheme, width })
  await page.evaluate(() => {
    const file = { path: 'math.js', display: 'math.js', added: 35, deleted: 0 }
    window.__renderEngineering({ files: [file], total: 1, added: 35, deleted: 0 })
  })
  await expect(record).toHaveAttribute('data-single', 'true')
  await expect(record.locator('[class*="_tile"] > svg')).toBeVisible()
  expect(await record.locator('[class*="_titles"]').evaluate(node => getComputedStyle(node, '::before').content)).toContain('RIIC')
  const caption = await record.locator('[class*="_tile"]').boundingBox()
  const icon = await record.locator('[class*="_tile"] > svg').boundingBox()
  const summary = await record.locator('[class*="_titles"] > [class*="_title"]').boundingBox()
  expect(summary.x).toBeCloseTo(caption.x, 0)
  expect(icon.y + icon.height / 2).toBeCloseTo(caption.y + caption.height / 2, 0)
  expect(icon.y + icon.height).toBeLessThanOrEqual(summary.y)
  expect((await record.boundingBox()).height).toBeLessThan(90)
  await record.screenshot({ path: testInfo.outputPath('single-file.png') })
  await page.evaluate(() => {
    const file = { path: 'very-long-directory/'.repeat(8) + '完整文件名.json', display: 'very-long-directory/'.repeat(8) + '完整文件名.json', added: 123456, deleted: 0 }
    window.__renderEngineering({ files: [file], total: 1, added: 123456, deleted: 0 })
  })
  await expect(record).toHaveAttribute('data-single', 'true')
  await expect(record.locator('ul')).toHaveCount(0)
  await expect(record.locator('[class*="_statCounts"]')).toHaveText('+123,456-0')
  expect(await record.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false)
  const header = record.locator('button').first()
  await expect(header).toHaveAccessibleName(/完整文件名.json/)
  await header.hover()
  await expect(page.locator('[data-changes-hover-preview]')).toBeVisible()
  await page.mouse.move(0, 0)
  await page.evaluate(() => {
    const path = '目录/'.repeat(90) + '完整文件名.json'
    window.__renderEngineering({ files: [
      { path, display: path, added: 0, deleted: 0, binary: true },
      { path: 'large.bin', display: 'large.bin', added: 0, deleted: 0, oversized: true }], total: 2, added: 0, deleted: 0 })
  })
  await expect(record.locator('ul [class*="_path"]').first()).toHaveText('目录/'.repeat(90) + '完整文件名.json')
  await expect(record.locator('ul [class*="_counts"]').first()).toHaveText('二进制')
  await expect(record.locator('ul [class*="_counts"]').last()).toHaveText('过大')
  expect(await record.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false)
  // Disabling the theme restores the host's own summary and opener.
  await page.evaluate(() => document.documentElement.removeAttribute('data-dsh-prts'))
  await expect(record).not.toHaveCSS('border-radius', '0px')
  await record.locator('ul button').first().click()
  expect(await page.evaluate(() => window.__engineeringOpened.at(-1).index)).toBe(0)
  expect(errors).toEqual([]); expect(writes).toEqual([])
})

for (const scheme of ['dark', 'light']) test(`engineering records retain glass, narrow-column and contrast behavior (${scheme}) @live-engineering`, async ({ page }) => {
  const { record, errors, writes } = await openRecord(page, { scheme, width: 760 })
  await page.locator('#engineering-record-probe').evaluate(node => { node.style.width = '350px' })
  await expect(record.locator('[class*="_path"]').first()).toHaveCSS('font-size', '11px')
  for (const mode of ['standard', 'soft', 'clear', 'off']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-prts-glass', value), mode)
    const filter = await record.evaluate(node => getComputedStyle(node, '::after').backdropFilter)
    expect(filter).toBe('none')
  }
  // Verify actual transparency against two extreme backdrops, rather than just the rgba token.
  for (const mode of ['clear', 'off']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-prts-glass', value), mode)
    const countInks = await record.locator('ul [class*="_counts"]').first().evaluate(node =>
      [...node.children].map(child => getComputedStyle(child).color.match(/\d+/g).map(Number)))
    const samples = [], holes = [[], []], backdrops = []
    for (const background of ['#000', '#fff']) {
      await page.locator('#engineering-record-probe').evaluate((node, color) => { node.style.background = color }, background)
      const pixels = await sharp(await record.screenshot()).raw().toBuffer({ resolveWithObject: true })
      const at = (70 * pixels.info.width + 23) * pixels.info.channels
      samples.push(pixels.data[at])
      // Both perforated edges must expose the actual backdrop, not painted dots.
      holes[0].push(pixels.data[(70 * pixels.info.width + 10) * pixels.info.channels])
      holes[1].push(pixels.data[(70 * pixels.info.width + pixels.info.width - 10) * pixels.info.channels])
      backdrops.push(background === '#000' ? 0 : 255)
      const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      const paper = luminance([...pixels.data.subarray(at, at + 3)])
      for (const ink of [[39, 49, 47], [53, 64, 47], ...countInks]) {
        const foreground = luminance(ink)
        expect((Math.max(paper, foreground) + .05) / (Math.min(paper, foreground) + .05)).toBeGreaterThanOrEqual(4.5)
      }
    }
    if (mode === 'off') expect(Math.abs(samples[1] - samples[0])).toBe(0)
    else expect(Math.abs(samples[1] - samples[0])).toBeGreaterThan(40)
    for (const edge of holes) {
      expect(Math.abs(edge[1] - edge[0])).toBeGreaterThan(240)
      for (let i = 0; i < edge.length; i++) expect(Math.abs(edge[i] - backdrops[i])).toBeLessThanOrEqual(1)
    }
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(record).toHaveCSS('border-style', 'solid')
  await expect(record.locator('[class*="_tile"] > svg')).toBeVisible()
  expect(await record.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false)
  expect(errors).toEqual([]); expect(writes).toEqual([])
})
