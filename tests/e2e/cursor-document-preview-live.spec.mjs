import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const candidateClient = process.env.PRTS_CURSOR_CANDIDATE
  ? await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') : null
const baseClient = candidateClient ? await readFile(process.env.PRTS_CURSOR_BASE_CLIENT, 'utf8') : null

test.use({ locale: 'zh-CN', reducedMotion: 'no-preference', storageState: process.env.PRTS_RC022_STATE || undefined })

for (const scheme of ['dark', 'light']) {
  test(`native code previews use the theme text cursor (${scheme}) @live`, async ({ page }) => {
    test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
    test.setTimeout(90_000)
    const errors = [], writes = []
    let candidateReplacements = 0
    page.on('pageerror', error => errors.push(error.message))
    if (candidateClient) {
      await page.route(url => url.pathname === '/plugins/', async route => {
        const response = await route.fetch()
        const body = await response.text()
        if (body.includes(baseClient)) candidateReplacements++
        await route.fulfill({ response, body: body.replace(baseClient, () => candidateClient) })
      })
    }
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
                registration.factory = require => { window.__prtsCursorRequire = require; return factory(require) }
              }
              return load.call(value, registration)
            },
            set(next) { load = next },
          })
        },
      })
    })
    await page.route('**/api/settings/describe', async route => {
      const response = await route.fetch()
      const packet = await response.json()
      expect(packet.result?.ok).toBe(true)
      packet.result.value.writable = false
      for (const namespace of packet.result.value.namespaces) {
        if (namespace.ns === 'theme-prts') namespace.value = { ...namespace.value, enabled: true,
          preferencesInitialized: true, bootAnimation: false, motion: 'system', cursorAnimation: true, cursor: 'prts' }
        if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
      }
      await route.fulfill({ response, json: packet })
    })
    await page.route(/\/api\/(settings\/mutate|session\/(create|prompt)|commands\/execute)(?:\?|$)/, route => {
      if (!route.request().url().includes('/session/create')) writes.push(route.request().url())
      return route.abort('blockedbyclient')
    })
    await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
    await expect(page.locator('html')).toHaveAttribute('data-prts-cursor', 'prts')
    await expect(page.locator('html')).toHaveAttribute('data-prts-motion', 'system')
    if (candidateClient) expect(candidateReplacements).toBe(1)
    await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
    await expect.poll(() => page.evaluate(() => typeof window.__prtsCursorRequire)).toBe('function')
    await page.evaluate(() => {
      const require = window.__prtsCursorRequire
      const registrations = new Map(), dictionaries = new Map()
      const noop = () => {}
      const context = {
        effect: (callback, name) => !name || name.endsWith('dictionaries') || name === 'document-markdown: body' ? callback() : noop,
        inject: () => noop,
        reflect: { provide: (name, value) => { context[name] = value; return noop } },
        locale: {
          register: (name, dictionary) => { dictionaries.set(name, dictionary); return noop },
          bind: name => key => dictionaries.get(name)?.zh[key] ?? key,
        },
        remote: { workspaceFiles: {} }, resources: {}, fileDrag: { actions: {} },
        configForms: { developerTools: { enabled: {} } },
        slots: {
          inject: (name, callback) => name === 'sidebar.right.tab.document' ? callback() : noop,
          register: (definition, Component) => {
            registrations.set(definition.key.split('/').at(-1), Component)
            return noop
          },
        },
      }
      require('@deepseek-ai/dsh-client-ui-sidebar-documentpreview').apply(context)
      const stage = document.createElement('div')
      stage.id = 'prts-code-cursor-probe'
      stage.setAttribute('data-textpreview-body', '')
      stage.style.cssText = 'position:fixed;top:100px;left:240px;width:700px;height:400px;z-index:100;background:var(--prts-panel);white-space:pre'
      document.body.append(stage)
      const root = require('react-dom').createRoot(stage)
      window.__prtsRenderDocumentPreview = (kind, extension, text, wrap = false) => {
        root.render(require('react').createElement(registrations.get(kind), {
          resourceAddress: `dsh-resource://file/absolute/workspace/example.${extension}`,
          content: { kind: 'text', text, pages: [{ offset: 1, lines: text.split('\n').length, text }], eof: true }, wrap,
          useTabInfo: () => ({ tab: { navigation: {} } }),
          useResource: () => ({ value: { absolutePath: '/workspace/example.md' } }),
          scrollportRef: noop, t: context.locale.bind(kind === 'markdown' ? 'documentMarkdown' : 'sidebarCodePreview'),
        }))
      }
      window.__prtsRenderCodePreview = (extension, text, wrap) => window.__prtsRenderDocumentPreview('code', extension, text, wrap)
    })
    const samples = {
      py: 'def compute(value):\n    return value + 42\n',
      js: 'const compute = value => value + 42\n',
      ts: 'const compute = (value: number): number => value + 42\n',
      json: '{ "value": 42 }\n',
      yaml: 'value: 42\n',
      sh: 'echo "example"\n',
    }
    const preview = page.locator('#prts-code-cursor-probe')
    await page.evaluate(() => {
      window.previewCaretCalls = 0
      for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
        const original = document[name]?.bind(document)
        if (original) document[name] = (...args) => { window.previewCaretCalls++; return original(...args) }
      }
    })
    for (const [extension, text] of Object.entries(samples)) {
      await page.evaluate(({ extension, text }) => window.__prtsRenderCodePreview(extension, text), { extension, text })
      const content = preview.locator('[data-code-preview] [data-code-block-content]')
      await expect(content).toBeVisible()
      await expect(content.locator('pre')).toHaveText(text.trimEnd())
      await expect(content.locator('pre.shiki')).toBeVisible({ timeout: 15_000 })
      await expect(content.locator('code')).toHaveCSS('cursor', /default$/)
      for (const zoom of [0.8, 1, 1.25]) {
        await preview.evaluate((element, zoom) => { element.style.zoom = zoom }, zoom)
        const point = await content.locator('code .line').first().evaluate(element => {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
          const node = walker.nextNode()
          const range = document.createRange()
          range.setStart(node, 0)
          range.setEnd(node, 1)
          const rect = range.getBoundingClientRect()
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
        })
        await page.mouse.move(point.x, point.y)
        await expect(content.locator('[data-prts-text-hit]')).toHaveCount(0)
        await expect(content.locator('code .line').first()).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
        const line = await content.locator('code .line').first().boundingBox()
        const viewport = await content.boundingBox()
        const tail = { x: viewport.x + viewport.width - 30, y: line.y + line.height / 2 }
        expect(tail.x).toBeGreaterThan(line.x + line.width + 10)
        await page.mouse.move(tail.x, tail.y)
        expect(await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, tail)).toMatch(/default$/)
        await page.mouse.move(line.x + 2, line.y + line.height / 2)
        await expect(content.locator('[data-prts-text-hit]')).toHaveCount(0)
        await preview.locator('button').first().hover()
        await expect(content.locator('[data-prts-text-hit]')).toHaveCount(0)
        await expect(preview.locator('button').first()).toHaveCSS('cursor', /pointer$/)
      }
    }
    await preview.evaluate(element => { element.style.zoom = 1 })
    for (const kind of ['text', 'markdown']) {
      await page.evaluate(kind => window.__prtsRenderDocumentPreview(kind, kind === 'text' ? 'txt' : 'md', 'Preview sample\n\nSecond paragraph'), kind)
      const row = preview.locator(kind === 'text' ? '[data-textpreview-line]' : '[data-document-markdown] p').first()
      await expect(row).toHaveCSS('cursor', /data:image\/png.*,[\s]*text$/)
      const bounds = await preview.boundingBox(), line = await row.boundingBox()
      const tail = { x: bounds.x + bounds.width - 30, y: line.y + line.height / 2 }
      expect(tail.x).toBeGreaterThan(line.x + line.width + 10)
      await page.mouse.move(tail.x, tail.y)
      expect(await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, tail)).toMatch(/default$/)
    }
    const wrappedText = 'value = "' + 'long source text '.repeat(30) + '"\nshort = 1'
    await page.evaluate(text => window.__prtsRenderCodePreview('py', text, true), wrappedText)
    await expect(preview.locator('pre.shiki')).toHaveText(wrappedText)
    const layout = await preview.evaluate(element => {
      const measure = () => [...element.querySelectorAll('code .line')].map(line => {
        const range = document.createRange()
        range.selectNodeContents(line)
        return [...range.getClientRects()].map(rect => [rect.x, rect.y, rect.width, rect.height])
      })
      document.documentElement.dataset.prtsCursor = 'system'
      const before = measure()
      document.documentElement.dataset.prtsCursor = 'prts'
      return { before, after: measure() }
    })
    expect(layout.after).toEqual(layout.before)
    const largeText = '{\n' + Array.from({ length: 1500 }, (_unused, index) => `"property_${index}": ${index}${index === 1499 ? '' : ','}`).join('\n') + '\n}'
    await preview.evaluate(element => { element.style.zoom = 1 })
    await page.evaluate(text => window.__prtsRenderCodePreview('json', text), largeText)
    const content = preview.locator('[data-code-block-content]')
    await expect(content.locator('pre.shiki')).toHaveText(largeText)
    await page.evaluate(() => {
      const stage = document.querySelector('#prts-code-cursor-probe')
      window.previewNativeProfile = { characterMeasurements: 0, textHitMutations: 0, frameGaps: [] }
      const profile = window.previewNativeProfile
      const original = Range.prototype.getClientRects
      Range.prototype.getClientRects = function (...args) {
        const owner = this.commonAncestorContainer.nodeType === 1 ? this.commonAncestorContainer : this.commonAncestorContainer.parentElement
        if (stage.contains(owner)) profile.characterMeasurements++
        return original.apply(this, args)
      }
      const observer = new MutationObserver(records => { profile.textHitMutations += records.length })
      observer.observe(stage, { attributes: true, subtree: true, attributeFilter: ['data-prts-text-hit'] })
      let previous = performance.now(), frame
      const sample = now => { profile.frameGaps.push(now - previous); previous = now; frame = requestAnimationFrame(sample) }
      frame = requestAnimationFrame(sample)
      window.stopNativeProfile = () => { cancelAnimationFrame(frame); observer.disconnect(); return profile }
    })
    const bounds = await content.boundingBox()
    for (let index = 0; index < 24; index++) {
      await page.mouse.move(bounds.x + 50 + index % 8 * 50, bounds.y + 30 + index % 6 * 35)
      if (index % 6 === 0) await content.evaluate(element => { element.scrollTop += 160 })
    }
    await page.waitForTimeout(1200)
    const profile = await page.evaluate(() => window.stopNativeProfile())
    expect(profile.characterMeasurements).toBe(0)
    expect(profile.textHitMutations).toBe(0)
    expect(profile.frameGaps.length).toBeGreaterThan(20)
    expect(Math.max(...profile.frameGaps)).toBeLessThan(1000)
    expect(await page.evaluate(() => window.previewCaretCalls)).toBe(0)
    expect(errors).toEqual([])
    expect(writes).toEqual([])
  })
}
