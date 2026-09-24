import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const root = process.cwd()
const port = Number(process.env.PORT || 4173)
const fixturePath = '/tests/fixtures/rc7-harness.html'
const injectedFixturePaths = new Set([fixturePath, '/tests/fixtures/rc2-harness.html'])

const fixtureBootstrap = `
(() => {
  const cleanups = []
  const stores = new Map()
  const registrations = new Map()

  function appendTree(parent, node) {
    if (node === null || node === undefined || node === false) return
    if (Array.isArray(node)) {
      node.forEach(child => appendTree(parent, child))
      return
    }
    if (typeof node === 'string' || typeof node === 'number') {
      parent.appendChild(document.createTextNode(String(node)))
      return
    }
    if (typeof node.type !== 'string') return
    const element = document.createElement(node.type)
    const props = node.props || {}
    for (const [key, value] of Object.entries(props)) {
      if (key === 'children' || key === 'key' || value === undefined || value === null || value === false) continue
      if (key === 'className') {
        element.className = value
      } else if (key === 'dangerouslySetInnerHTML') {
        element.innerHTML = value.__html || ''
      } else if (key === 'hidden') {
        element.hidden = Boolean(value)
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value)
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value)
      } else {
        element.setAttribute(key, value === true ? '' : String(value))
      }
    }
    if (!('dangerouslySetInnerHTML' in props)) {
      for (const child of node.children || []) appendTree(element, child)
    }
    parent.appendChild(element)
  }

  function storeFor(spec) {
    if (stores.has(spec)) return stores.get(spec)
    const state = spec.init()
    const renderers = new Set()
    const actions = {}
    for (const [name, action] of Object.entries(spec.actions || {})) {
      actions[name] = (...args) => {
        action(state, ...args)
        renderers.forEach(render => render())
      }
    }
    const store = { state, actions, renderers }
    stores.set(spec, store)
    return store
  }

  function mountRegistration(registration, target) {
    if (registration.render) registration.store.renderers.delete(registration.render)
    registration.target = target
    const render = () => {
      if (!registration.target?.isConnected) return
      registration.target.replaceChildren()
      const tree = registration.component({
        useStore: selector => selector(registration.store.state),
        ...registration.injected,
      })
      appendTree(registration.target, tree)
    }
    registration.render = render
    registration.store.renderers.add(render)
    render()
  }

  function showSettings() {
    document.querySelector('[data-fixture-settings]')?.remove()
    const shell = document.createElement('section')
    shell.dataset.fixtureSettings = ''
    Object.assign(shell.style, {
      position: 'fixed',
      zIndex: '2147483000',
      inset: '88px 32px 32px 104px',
      overflow: 'auto',
      padding: '18px',
      border: '1px solid #566168',
      background: '#171b1e',
      color: '#f0f3f4',
    })
    const navigation = document.createElement('div')
    navigation.style.display = 'flex'
    navigation.style.gap = '8px'
    navigation.style.marginBottom = '16px'
    const panel = document.createElement('div')

    const general = document.createElement('button')
    general.type = 'button'
    general.textContent = 'General'
    const plugins = document.createElement('button')
    plugins.type = 'button'
    plugins.textContent = 'Plugins'
    const registration = registrations.get('prts-appearance')
    const close = document.createElement('button')
    close.type = 'button'
    close.textContent = 'Close'
    close.style.marginLeft = 'auto'

    const unmountRegistration = () => {
      if (!registration) return
      registration.store.renderers.delete(registration.render)
      registration.render = null
      registration.target = null
    }

    const showGeneral = () => {
      unmountRegistration()
      panel.replaceChildren()
      const content = document.createElement('div')
      content.dataset.fixtureGeneral = ''
      content.textContent = 'General Settings'
      panel.appendChild(content)
    }

    const showPlugins = () => {
      unmountRegistration()
      panel.replaceChildren()
      const section = document.createElement('section')
      section.dataset.fixturePlugins = ''
      const heading = document.createElement('h2')
      heading.textContent = 'Plugins'
      const intro = document.createElement('p')
      intro.textContent = 'Manage installed plugin settings.'
      const tabs = document.createElement('div')
      tabs.setAttribute('role', 'tablist')
      const configurable = document.createElement('button')
      configurable.type = 'button'
      configurable.setAttribute('role', 'tab')
      configurable.textContent = 'Plugin configuration'
      const prts = document.createElement('button')
      prts.type = 'button'
      prts.setAttribute('role', 'tab')
      prts.textContent = registration?.options.label?.() || 'P.R.T.S.'
      const tabpanel = document.createElement('div')
      tabpanel.setAttribute('role', 'tabpanel')
      const selectTab = selected => {
        configurable.setAttribute('aria-selected', String(selected === configurable))
        prts.setAttribute('aria-selected', String(selected === prts))
        unmountRegistration()
        tabpanel.replaceChildren()
        if (selected === prts && registration) mountRegistration(registration, tabpanel)
        else tabpanel.textContent = 'No configurable plugins in fixture.'
      }
      configurable.addEventListener('click', () => selectTab(configurable))
      prts.addEventListener('click', () => selectTab(prts))
      tabs.append(configurable, prts)
      section.append(heading, intro, tabs, tabpanel)
      panel.appendChild(section)
      selectTab(configurable)
    }

    general.addEventListener('click', showGeneral)
    plugins.addEventListener('click', showPlugins)
    close.addEventListener('click', () => {
      unmountRegistration()
      shell.remove()
    })
    navigation.append(general, plugins, close)
    shell.append(navigation, panel)
    document.body.appendChild(shell)
    showGeneral()
  }

  function installSettingsFixture() {
    const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Settings')
    button?.addEventListener('click', showSettings)
  }

  function observable(initial) {
    let value = initial
    const listeners = new Set()
    return {
      getSnapshot() { return value },
      subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      set(next) {
        value = next
        for (const listener of [...listeners]) listener()
      },
    }
  }

  const sessionList = observable({
    current: 'fixture-session',
    byId: {
      'fixture-session': {
        id: 'fixture-session',
        displayTitle: 'P.R.T.S. 皮肤验收',
        running: true,
      },
      'fixture-child': {
        id: 'fixture-child',
        parentId: 'fixture-session',
      },
    },
    jobsBySession: {
      'fixture-session': [{ id: 'fixture-job', status: 'running' }],
    },
  })
  const sessionState = observable({
    running: true,
    pending: [],
    runningCalls: [{ id: 'fixture-call' }],
    nodes: [{ kind: 'tool-result' }],
  })
  const sessionFaces = {
    goal: observable({ goal: { objective: '完成保真重构' } }),
    plan: observable({ active: true, pending: false }),
    todos: observable([
      { status: 'completed' },
      { status: 'completed' },
      { status: 'in_progress' },
      { status: 'pending' },
    ]),
    permissions: observable({ currentValue: 'workspace-write' }),
  }
  sessionState.projections = { faceOf(key) { return sessionFaces[key] } }
  const modelStore = observable({ current: { model: 'deepseek-chat' } })
  const hostDescription = observable('fixture-host')
  const connectionState = observable('connected')
  const openedSessionIds = []
  const sessions = {
    list: sessionList,
    open(sessionId) {
      openedSessionIds.push(sessionId)
    },
    binding(sessionId) {
      return sessionId === 'fixture-session' ? { session: sessionState } : undefined
    },
  }
  const connection = { hostDescription, state: connectionState }
  const modelDirectories = {
    directoryFor(sessionId) {
      return sessionId === 'fixture-session'
        ? { store: modelStore, load: async () => {} }
        : undefined
    },
  }
  window.__PRTS_FIXTURE_RUNTIME__ = {
    sessionList,
    sessionState,
    sessionFaces,
    modelStore,
    hostDescription,
    connectionState,
    openedSessionIds,
  }

  const contextEvents = new Map()
  const harnessTheme = {
    current: 'dark',
    getTheme() { return this.current },
    setTheme(id) {
      this.current = id === 'dark' ? 'dark' : 'light'
      for (const listener of contextEvents.get('theme/change') || []) listener(this.current)
    },
  }
  window.__PRTS_FIXTURE_RUNTIME__.theme = harnessTheme
  window.__PRTS_HARNESS_THEME__ = harnessTheme
  const ctx = {
    theme: harnessTheme,
    on(name, listener) {
      const listeners = contextEvents.get(name) || new Set()
      listeners.add(listener)
      contextEvents.set(name, listeners)
      return () => listeners.delete(listener)
    },
    sessions,
    connection,
    modelDirectories,
    get(name) { return this[name] },
    inject(names, factory) {
      if (Array.isArray(names) && names.includes('modelDirectories')) {
        return factory({ modelDirectories })
      }
    },
    effect(factory) {
      const cleanup = factory()
      if (typeof cleanup === 'function') cleanups.push(cleanup)
      return cleanup
    },
    locale: { register() { return () => {} } },
    slots: {
      inject(_name, factory) { return factory() },
      register(options, component) {
        const store = storeFor(options.store)
        const injected = options.name === 'details'
          ? options.inject?.('fixture-session', store.actions) || {}
          : options.inject?.(store.actions) || {}
        const registration = { options, component, store, injected, target: null, render: null }
        registrations.set(options.id || options.name, registration)
        if (options.name === 'details' && !new URLSearchParams(location.search).has('no-session')) {
          const target = document.querySelector('[data-slot="details"]')
          if (target) mountRegistration(registration, target)
        }
        return () => {
          registration.store.renderers.delete(registration.render)
          registration.target?.replaceChildren()
          registrations.delete(options.id || options.name)
        }
      },
    },
  }

  const React = {
    createElement(type, props, ...children) {
      return { type, props: props || {}, children: children.flat() }
    },
  }
  const runtime = { defineStore(spec) { return spec } }
  window.__ModuleLoader__ = {
    load(definition) {
      const require = id => {
        if (id === 'react') return React
        if (id === '@deepseek-ai/dsh-client-store') return runtime
        throw new Error('Unexpected fixture module: ' + id)
      }
      const module = definition.factory(require)
      window.__PRTS_FIXTURE_MODULE__ = module
      module.apply(ctx)
      installSettingsFixture()
    },
  }
  addEventListener('beforeunload', () => cleanups.splice(0).reverse().forEach(cleanup => cleanup()))
})()
`

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`)
    if (url.pathname === '/__fixture_bootstrap.js') {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' })
      response.end(fixtureBootstrap)
      return
    }

    const relative = decodeURIComponent(url.pathname === '/' ? fixturePath : url.pathname)
    const path = resolve(root, `.${relative}`)
    if (path !== root && !path.startsWith(root + sep)) throw new Error('Path outside fixture root')
    if (!(await stat(path)).isFile()) throw new Error('Not a file')
    let content = await readFile(path)
    if (injectedFixturePaths.has(relative)) {
      content = Buffer.from(content.toString('utf8').replace(
        '</body>',
        '<script src="/__fixture_bootstrap.js"></script><script src="/lib/client.js"></script></body>',
      ))
    }
    response.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' })
    response.end(content)
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`PRTS fixture server listening on http://127.0.0.1:${port}\n`)
})
