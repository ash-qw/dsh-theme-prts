import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'esbuild'
import { expect, test } from '@playwright/test'

// Compile an external snapshot of the installed host component, rather than
// copying host code into this repository or rebuilding a lookalike todo list.
const nativeDir = process.env.PRTS_TODO_NATIVE_DIR
const enabled = !!(nativeDir && process.env.PRTS_RC022_STATE)
let nativeCode, nativeCss, candidateCss
if (enabled) {
  const source = await readFile(resolve(nativeDir, 'TodoPanel.module.css'), 'utf8')
  const names = [...new Set([...source.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(match => match[1]))]
  const mapping = Object.fromEntries(names.map(name => [name, `prtsNativeTodo_${name}`]))
  nativeCss = source.replace(/\.([a-zA-Z][\w-]*)/g, (match, name) => `.${mapping[name]}`)
  const compiled = await build({
    entryPoints: [resolve(nativeDir, 'TodoPanel.tsx')], bundle: true, write: false,
    format: 'iife', globalName: 'NativeTodo', platform: 'browser',
    jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment',
    external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
    banner: { js: 'const React = require("react");' },
    plugins: [{ name: 'native-todo-css-and-locale', setup(builder) {
      builder.onResolve({ filter: /TodoPanel\.module\.css$/ }, () => ({ path: 'styles', namespace: 'todo-probe' }))
      builder.onResolve({ filter: /locales\.ts$/ }, () => ({ path: 'locale', namespace: 'todo-probe' }))
      builder.onLoad({ filter: /.*/, namespace: 'todo-probe' }, args => ({ contents: args.path === 'styles'
        ? `export default ${JSON.stringify(mapping)}` : 'export const NS = "conversation"', loader: 'js' }))
    } }],
  })
  nativeCode = compiled.outputFiles[0].text
  if (!process.env.PRTS_TASK_INSTALLED) {
    candidateCss = (await readFile(new URL('../../src/styles/task-register.css', import.meta.url), 'utf8'))
      .replaceAll('__PRTS_TASK_STAMP__', `data:image/png;base64,${(await readFile(new URL('../../src/assets/task-stamp.png', import.meta.url))).toString('base64')}`)
  }
}

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(async ({ page }) => {
  test.skip(!enabled, 'Requires authenticated local DSH and its TodoPanel source snapshot')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let loader
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true, get: () => loader, set(value) {
        loader = value
        let load = value.load
        Object.defineProperty(value, 'load', { configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk) {
              const factory = registration.factory
              registration.factory = require => { window.__taskRequire = require; return factory(require) }
            }
            return load.call(value, registration)
          }, set(next) { load = next },
        })
      },
    })
  })
})

async function openRegister(page, { scheme = 'dark', style = 'native', width = 1440, language = 'zh', glass = 'standard' } = {}) {
  const errors = [], writes = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch(), packet = await response.json()
    packet.result.value.writable = false
    for (const namespace of packet.result.value.namespaces) {
      if (namespace.ns === 'theme-prts') namespace.value = { ...namespace.value, enabled: true,
        preferencesInitialized: true, bootAnimation: false, motion: 'full', conversationStyle: style, glass }
      if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
    }
    await route.fulfill({ response, json: packet })
  })
  await page.route(/\/api\/(settings\/mutate|session\/(create|prompt|rename|fork)|commands\/execute)(?:\?|$)/, route => {
    if (new URL(route.request().url()).pathname !== '/api/session/create') writes.push(route.request().url())
    return route.abort('blockedbyclient')
  })
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect.poll(() => page.evaluate(() => typeof window.__taskRequire), { timeout: 20_000 }).toBe('function')
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  await page.addStyleTag({ content: nativeCss })
  if (candidateCss) await page.addStyleTag({ content: candidateCss })
  await page.evaluate(({ nativeCode, scheme, language }) => {
    const require = window.__taskRequire, React = require('react'), ReactDOM = require('react-dom')
    const Component = Function('require', `${nativeCode}; return NativeTodo.TodoPanel;`)(require)
    const dictionary = language === 'en' ? {
      'todo.title': 'To-dos', 'todo.progress.done': '{done} completed', 'todo.progress.active': '{active} in progress',
      'todo.progress.pending': '{pending} pending', 'todo.status.completed': 'Completed',
      'todo.status.inProgress': 'In progress', 'todo.status.pending': 'Pending',
    } : {
      'todo.title': '任务', 'todo.progress.done': '{done} 已完成', 'todo.progress.active': '{active} 进行中',
      'todo.progress.pending': '{pending} 待处理', 'todo.status.completed': '已完成',
      'todo.status.inProgress': '进行中', 'todo.status.pending': '待处理',
    }
    const t = (key, values = {}) => (dictionary[key] ?? key).replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
    const stage = document.createElement('section')
    stage.id = 'task-register-probe'
    stage.style.cssText = `position:fixed;left:50%;top:100px;transform:translateX(-50%);width:min(1040px,calc(100vw - 32px));padding:14px 0 18px;z-index:100;background:${scheme === 'dark' ? '#30444e' : '#c7d6d9'};--dsh-composer-side-clearance:0px;--dsh-composer-dock-inset:0px;--dsh-composer-card-max-width:100%`
    document.querySelector('[data-prts-region="operation"]').append(stage)
    const root = ReactDOM.createRoot(stage)
    window.__taskItems = [
      { content: 'Create fresh dialect from template and write profile/sources', status: 'completed' },
      { content: 'Extract facts/evidence from official PDFs (keywords, identifiers, literals, operators, comments)', status: 'in_progress' },
      { content: 'Write tokens/lexer.yaml, emit lexer, pass tokens/lexer check+verify', status: 'pending' },
      { content: 'Write SybaseASEParser.g4 skeleton with select clauses, pass skeleton check+verify', status: 'pending' },
      { content: 'Capture select BNF + normalized forms + AST, pass capture checks', status: 'pending' },
      ...Array.from({ length: 4 }, (_, i) => ({ content: `Verify long_task_${i}_${'long_path_segment/'.repeat(12)}`, status: 'pending' })),
    ]
    window.__renderTaskRegister = (todos = window.__taskItems) => root.render(React.createElement(Component, { todos, t }))
    window.__renderTaskRegister()
  }, { nativeCode, scheme, language })
  const record = page.locator('#task-register-probe [data-testid="todo-panel"]')
  await expect(record).toBeVisible()
  await record.getByRole('button').click()
  await expect(record.locator('li')).toHaveCount(9)
  return { record, errors, writes }
}

for (const scheme of ['dark', 'light']) for (const style of ['native', 'deck-chat']) for (const width of [1440, 390]) {
  test(`native task register keeps folding, scrolling and stamps (${scheme}, ${style}, ${width}) @live-task-register`, async ({ page }, testInfo) => {
    const { record, errors, writes } = await openRegister(page, { scheme, style, width })
    const appearance = await record.evaluate(node => {
      const done = node.querySelector('[data-status="completed"] > [role="img"]')
      const active = node.querySelector('[data-status="in_progress"] > [role="img"]')
      return { radius: getComputedStyle(node).borderRadius, paper: getComputedStyle(node).backgroundColor,
        stamp: getComputedStyle(done).borderTopStyle, stampImage: getComputedStyle(done).backgroundImage,
        before: getComputedStyle(done, '::before').content, label: getComputedStyle(done, '::after').content,
        animation: getComputedStyle(active, '::before').animationName,
        originalIcon: getComputedStyle(done.firstElementChild).display,
        listScrolls: node.querySelector('ul').scrollHeight > node.querySelector('ul').clientHeight,
        listHeight: node.querySelector('ul').clientHeight, overflow: node.scrollWidth > node.clientWidth,
        textWrap: getComputedStyle(node.querySelector('li > :last-child')).whiteSpace,
        headerHeight: node.querySelector('button').getBoundingClientRect().height,
        textFitsRows: [...node.querySelectorAll('li')].every(row => {
          const bounds = row.getBoundingClientRect(), text = row.lastElementChild.getBoundingClientRect()
          return text.top >= bounds.top && text.bottom <= bounds.bottom
        }),
      }
    })
    expect(appearance.radius).toBe('10px')
    expect(appearance.stamp).toBe('solid')
    expect(appearance.stampImage).toBe('none')
    expect(appearance.before).toBe('none')
    expect(appearance.label).toContain('已完成')
    expect(appearance.originalIcon).toBe('none')
    expect(appearance.animation).toBe('prts-task-diamond-breathe')
    expect(appearance.listScrolls).toBe(true)
    expect(appearance.listHeight).toBeLessThanOrEqual(180)
    expect(appearance.overflow).toBe(false)
    expect(appearance.textFitsRows).toBe(true)
    expect(appearance.textWrap).toBe(width === 390 ? 'normal' : 'nowrap')
    expect(appearance.headerHeight).toBeLessThanOrEqual(width === 390 ? 60 : 40)
    expect(appearance.paper).toBe(scheme === 'dark' ? 'rgba(16, 31, 39, 0.82)' : 'rgba(238, 249, 253, 0.9)')
    await record.screenshot({ path: testInfo.outputPath('expanded.png'), animations: 'disabled' })
    await record.locator('li').last().scrollIntoViewIfNeeded()
    expect(await record.locator('ul').evaluate(node => node.scrollTop)).toBeGreaterThan(0)
    await record.getByRole('button').focus()
    await page.keyboard.press('Space')
    await expect(record.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    await expect(record.locator('ul')).toHaveCount(0)
    await record.screenshot({ path: testInfo.outputPath('collapsed.png') })
    await page.keyboard.press('Enter')
    await expect(record.locator('li')).toHaveCount(9)
    await page.evaluate(() => window.__renderTaskRegister(window.__taskItems.map(item => ({ ...item, status: 'completed' }))))
    await expect(record.getByRole('button')).toContainText('9 已完成')
    await expect(record.locator('[data-status="completed"]')).toHaveCount(9)
    await expect(record.locator('[data-status="in_progress"]')).toHaveCount(0)
    await page.evaluate(() => window.__renderTaskRegister([]))
    await expect(record).toHaveCount(0)
    expect(errors).toEqual([])
    expect(writes).toEqual([])
  })
}

test('breathing diamond honors theme and system reduced motion, with English stamps @live-task-register', async ({ page }, testInfo) => {
  const { record, errors, writes } = await openRegister(page, { width: 390, language: 'en' })
  const diamondAnimation = () => record.locator('[data-status="in_progress"] > [role="img"]').evaluate(node => getComputedStyle(node, '::before').animationName)
  await expect(record.getByRole('img', { name: 'Completed', exact: true })).toBeVisible()
  expect(await diamondAnimation()).toBe('prts-task-diamond-breathe')
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-motion', 'reduced'))
  expect(await diamondAnimation()).toBe('none')
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-motion', 'full'))
  expect(await diamondAnimation()).toBe('prts-task-diamond-breathe')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await diamondAnimation()).toBe('none')
  await record.screenshot({ path: testInfo.outputPath('english-reduced-motion.png') })
  expect(errors).toEqual([])
  expect(writes).toEqual([])
})

// Check the most adverse solid backdrop for each scheme. Include the glass
// sheen and active-row tint, rather than assuming the panel is opaque.
function contrastAgainstGlass(foreground, surface, backdrop, active = false, accent) {
  const rgb = value => value.match(/[\d.]+/g).map(Number)
  const fg = rgb(foreground), bg = rgb(surface), tint = rgb(accent)
  const alpha = bg[3] ?? 1
  const painted = bg.slice(0, 3).map((channel, i) => {
    const base = channel * alpha + backdrop * (1 - alpha)
    const sheen = backdrop === 255 ? base * .96 + 255 * .04 : base
    return active ? sheen * .95 + tint[i] * .05 : sheen
  })
  const luminance = channels => channels.slice(0, 3).reduce((sum, channel, i) => {
    const s = channel / 255
    return sum + (s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][i]
  }, 0)
  const a = luminance(fg), b = luminance(painted)
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
}

for (const scheme of ['dark', 'light']) {
  test(`rounded glass follows material settings and keeps lettering sharp (${scheme}) @live-task-register`, async ({ page }, testInfo) => {
    const { record, errors, writes } = await openRegister(page, { scheme, width: 320, language: 'en' })
    const alphas = []
    for (const glass of ['soft', 'standard', 'clear', 'off']) {
      await page.locator('html').evaluate((node, value) => node.setAttribute('data-prts-glass', value), glass)
      const material = await record.evaluate(node => {
        const style = getComputedStyle(node)
        const active = node.querySelector('[data-status="in_progress"] > [role="img"]')
        const text = node.querySelector('[data-status="pending"] > :last-child')
        const muted = node.querySelector('[data-status="completed"] > :last-child')
        const ancestors = []
        for (let parent = text; parent && parent !== node.parentElement; parent = parent.parentElement) {
          const css = getComputedStyle(parent)
          ancestors.push({ filter: css.filter, opacity: css.opacity })
        }
        return { surface: style.backgroundColor, alpha: Number(style.getPropertyValue('--prts-task-alpha')),
          backdrop: style.backdropFilter, clip: style.clipPath, mask: style.maskImage,
          overflow: node.scrollWidth > node.clientWidth,
          textFitsRows: [...node.querySelectorAll('li')].every(row => {
            const bounds = row.getBoundingClientRect(), text = row.lastElementChild.getBoundingClientRect()
            return text.top >= bounds.top && text.bottom <= bounds.bottom
          }),
          depth: getComputedStyle(node, '::after').height,
          shadow: getComputedStyle(text).textShadow,
          statusShadow: getComputedStyle(active).textShadow,
          ink: getComputedStyle(text).color, muted: getComputedStyle(muted).color,
          accent: getComputedStyle(active).color, ancestors }
      })
      alphas.push(material.alpha)
      expect(material.clip).toBe('none')
      expect(material.mask).toBe('none')
      expect(material.depth).toBe('5px')
      expect(material.overflow).toBe(false)
      expect(material.textFitsRows).toBe(true)
      expect(material.statusShadow).toBe('none')
      expect(material.ancestors.every(css => css.filter === 'none' && css.opacity === '1')).toBe(true)
      if (glass === 'off') {
        expect(material.alpha).toBe(1)
        expect(material.backdrop).toBe('none')
        expect(material.shadow).toBe('none')
      } else {
        expect(material.alpha).toBeLessThan(1)
        expect(material.backdrop).toContain('blur(18px)')
        expect(material.shadow).toMatch(/0px 1px 1px$/)
      }
      for (const [role, foreground, active] of [
        ['body', material.ink, false], ['secondary', material.muted, false], ['status', material.accent, true],
      ]) {
        expect(contrastAgainstGlass(foreground, material.surface, scheme === 'dark' ? 255 : 0, active, material.accent), `${scheme}/${glass}/${role} contrast`).toBeGreaterThanOrEqual(4.5)
      }
      await record.screenshot({ path: testInfo.outputPath(`${glass}-320.png`), animations: 'disabled' })
    }
    expect(alphas[0]).toBeGreaterThan(alphas[1])
    expect(alphas[1]).toBeGreaterThan(alphas[2])
    expect(errors).toEqual([])
    expect(writes).toEqual([])
  })
}
