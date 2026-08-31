import { ensureFacilityGraphic, ensureFacilityTextureDefs, renderFacilityGraphic } from './facility-vector.js'

const OWNED_ATTRIBUTES = [
  'data-prts-row-title',
  'data-prts-workspace-disclosure',
  'data-prts-workspace-icon',
  'data-prts-row-menu-open',
  'data-prts-workspace-row',
  'data-prts-workspace-actions',
  'data-prts-workspace-menu-anchor',
  'data-prts-workspace-menu',
  'data-prts-workspace-create',
  'data-prts-session-row',
  'data-prts-session-actions',
  'data-prts-session-menu-anchor',
  'data-prts-session-menu',
  'data-prts-session-time',
  'data-prts-session-index',
  'data-prts-facility-face',
  'data-prts-facility-spine',
  'data-prts-facility-vector',
  'data-prts-facility-size',
  'data-prts-facility-texture',
  'data-prts-spine-vector',
]

function markSidebarNode(node, attribute, next) {
  if (!node) return
  node.setAttribute(attribute, '')
  next.add(node)
}

function resolveRowControls(row, kind) {
  const menu = row.querySelector(':scope > span > span > button[type="button"]')
  const anchor = menu?.parentElement
  const actions = anchor?.parentElement
  if (!menu || !anchor || actions?.parentElement !== row) return {}
  const create = kind === 'workspace'
    ? actions.querySelector(':scope > button[type="button"]')
    : undefined
  return { actions, anchor, create, menu }
}

function resolveRowTitle(row, kind, actions) {
  const candidates = Array.from(row.querySelectorAll(':scope > span')).filter(node => (
    node !== actions
    && !node.hasAttribute('data-prts-row-projection')
    && node.getAttribute('aria-hidden') !== 'true'
    && !node.querySelector('button')
    && node.textContent.trim()
  ))
  if (kind === 'session') return candidates.find(node => node.matches('[class*="title"], [data-session-title]')) ?? candidates.at(-1)
  return candidates.find(node => node.matches('[class*="project"], [class*="workspace"], [data-workspace-title]')) ?? candidates.at(-1)
}

function resolveWorkspaceIcon(row, title, actions) {
  return Array.from(row.children).find(node => (
    node.tagName === 'SPAN'
    && node !== title
    && node !== actions
    && !node.hasAttribute('data-prts-facility-face')
    && !node.hasAttribute('data-prts-facility-spine')
    && !node.hasAttribute('data-prts-row-projection')
  ))
}

function resolveWorkspaceDisclosure(row, title, actions, icon) {
  return Array.from(row.children).find(node => (
    node.tagName === 'SPAN'
    && node !== title
    && node !== actions
    && node !== icon
    && !node.hasAttribute('data-prts-facility-face')
    && !node.hasAttribute('data-prts-facility-spine')
    && !node.hasAttribute('data-prts-row-projection')
    && !node.querySelector('button')
  ))
}

function resolveSessionTime(row, title, actions) {
  const candidates = Array.from(row.querySelectorAll(':scope > span')).filter(node => (
    node !== title
    && node !== actions
    && !node.hasAttribute('data-prts-facility-face')
    && !node.hasAttribute('data-prts-row-projection')
    && node.getAttribute('aria-hidden') !== 'true'
    && !node.querySelector('button')
    && node.textContent.trim()
  ))
  return candidates.find(node => node.matches('[class*="time" i], time, [data-session-time]')) ?? candidates.at(-1)
}

function ensureFacilityFace(document, row, kind, next) {
  let face = row.querySelector(':scope > [data-prts-facility-face]')
  if (!face) {
    face = document.createElement('span')
    face.setAttribute('data-prts-owned-facility', '')
    row.insertBefore(face, row.firstChild)
  }
  face.setAttribute('data-prts-facility-face', kind)
  face.setAttribute('data-prts-facility-texture', kind === 'workspace' ? 'silhouette' : 'pickup')
  face.setAttribute('aria-hidden', 'true')
  next.add(face)
  return face
}

function ensureFacilitySpine(document, row, kind, next) {
  let spine = row.querySelector(':scope > [data-prts-facility-spine]')
  if (!spine) {
    spine = document.createElement('span')
    spine.setAttribute('data-prts-owned-facility-spine', '')
    row.insertBefore(spine, row.firstChild)
  }
  spine.setAttribute('data-prts-facility-spine', kind)
  spine.setAttribute('aria-hidden', 'true')
  next.add(spine)
  return spine
}


export function createSidebarControlAdapter({ document, window }) {
  let observer
  let resizeObserver
  let resizeFrame
  let resizeTimer
  let scanFrame
  let owned = new Set()
  let vectorOwners = new Set()
  const dirtyVectors = new Map()
  const vectorSizes = new WeakMap()

  function scheduleVectors() {
    if (resizeFrame !== undefined) return
    const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
    resizeFrame = requestFrame?.(flushVectors)
  }

  function flushVectors() {
    resizeFrame = undefined
    const measurements = []
    for (const [owner, observedSize] of dirtyVectors) {
      if (!vectorOwners.has(owner) || !owner.isConnected) continue
      let size = observedSize
      if (!size) {
        const box = owner.getBoundingClientRect?.()
        size = {
          width: owner.clientWidth || owner.offsetWidth || box?.width || 0,
          height: owner.clientHeight || owner.offsetHeight || box?.height || 0,
        }
      }
      const previous = vectorSizes.get(owner)
      if (previous?.width === size.width && previous?.height === size.height) continue
      vectorSizes.set(owner, size)
      measurements.push([owner, size])
    }
    dirtyVectors.clear()
    for (const [owner, size] of measurements) renderFacilityGraphic(owner, size)
  }

  function registerVector(owner, options, next, nextVectorOwners) {
    if (!owner) return
    const graphic = ensureFacilityGraphic(document, owner, options)
    if (!graphic) return
    next.add(graphic)
    nextVectorOwners.add(owner)
    if (!vectorOwners.has(owner)) resizeObserver?.observe(owner)
    if (!vectorSizes.has(owner)) dirtyVectors.set(owner, undefined)
  }

  function syncVectorOwners(next) {
    for (const owner of vectorOwners) {
      if (next.has(owner)) continue
      resizeObserver?.unobserve?.(owner)
      dirtyVectors.delete(owner)
    }
    vectorOwners = next
    scheduleVectors()
  }


  function queueScan() {
    if (scanFrame !== undefined) return
    const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
    scanFrame = requestFrame(() => {
      scanFrame = undefined
      scan()
    })
  }

  function scan() {
    const root = document?.querySelector?.('[data-prts-region="sessions"] [data-slot="sidebar.workspaces"]')
    const next = new Set()
    const nextVectorOwners = new Set()
    if (root) {
      for (const projection of root.querySelectorAll('[data-prts-owned-projection]')) projection.remove()
      for (const row of root.querySelectorAll('div[role="treeitem"][aria-expanded]')) {
        const controls = resolveRowControls(row, 'workspace')
        const face = ensureFacilityFace(document, row, 'workspace', next)
        const spine = ensureFacilitySpine(document, row, 'workspace', next)
        registerVector(face, { kind: 'face', topNotch: true, texture: 'silhouette' }, next, nextVectorOwners)
        registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
        markSidebarNode(row, 'data-prts-workspace-row', next)
        const title = resolveRowTitle(row, 'workspace', controls.actions)
        markSidebarNode(title, 'data-prts-row-title', next)
        const icon = resolveWorkspaceIcon(row, title, controls.actions)
        markSidebarNode(icon, 'data-prts-workspace-icon', next)
        markSidebarNode(resolveWorkspaceDisclosure(row, title, controls.actions, icon), 'data-prts-workspace-disclosure', next)
        row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
          || row.classList.contains('menuOpen'))
        markSidebarNode(controls.actions, 'data-prts-workspace-actions', next)
        markSidebarNode(controls.anchor, 'data-prts-workspace-menu-anchor', next)
        markSidebarNode(controls.menu, 'data-prts-workspace-menu', next)
        markSidebarNode(controls.create, 'data-prts-workspace-create', next)
        registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
        registerVector(controls.create, { kind: 'button' }, next, nextVectorOwners)
      }
      let sessionOrdinal = 0
      for (const row of root.querySelectorAll('div[role="treeitem"][aria-selected]')) {
        const sessionIndex = String(++sessionOrdinal).padStart(2, '0')
        const controls = resolveRowControls(row, 'session')
        const face = ensureFacilityFace(document, row, 'session', next)
        const spine = ensureFacilitySpine(document, row, 'session', next)
        registerVector(face, { kind: 'face', topNotch: true, texture: 'pickup' }, next, nextVectorOwners)
        registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
        markSidebarNode(row, 'data-prts-session-row', next)
        row.dataset.prtsSessionIndex = sessionIndex
        const title = resolveRowTitle(row, 'session', controls.actions)
        markSidebarNode(title, 'data-prts-row-title', next)
        markSidebarNode(resolveSessionTime(row, title, controls.actions), 'data-prts-session-time', next)
        if (title) title.dataset.prtsSessionIndex = sessionIndex
        row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
          || row.classList.contains('menuOpen'))
        markSidebarNode(controls.actions, 'data-prts-session-actions', next)
        markSidebarNode(controls.anchor, 'data-prts-session-menu-anchor', next)
        markSidebarNode(controls.menu, 'data-prts-session-menu', next)
        registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
      }
    }
    for (const node of owned) {
      if (next.has(node)) continue
      if (node.hasAttribute?.('data-prts-owned-projection')
        || node.hasAttribute?.('data-prts-owned-facility')
        || node.hasAttribute?.('data-prts-owned-facility-spine')
        || node.hasAttribute?.('data-prts-owned-facility-vector')) {
        node.remove()
        continue
      }
      for (const attribute of OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
    }
    syncVectorOwners(nextVectorOwners)
    owned = next
  }

  function clear() {
    for (const node of document?.querySelectorAll?.('[data-prts-owned-projection], [data-prts-owned-facility], [data-prts-owned-facility-spine], [data-prts-owned-facility-vector], [data-prts-owned-facility-defs]') ?? []) node.remove()
    for (const node of owned) {
      for (const attribute of OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
    }
    for (const attribute of OWNED_ATTRIBUTES) {
      for (const node of document?.querySelectorAll?.(`[${attribute}]`) ?? []) node.removeAttribute(attribute)
    }
    vectorOwners.clear()
    dirtyVectors.clear()
    owned.clear()
  }

  return {
    start() {
      if (!document) return
      ensureFacilityTextureDefs(document)
      const ResizeObserver = window?.ResizeObserver
      if (!resizeObserver && typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const rect = entry.contentRect
            dirtyVectors.set(entry.target, rect ? { width: rect.width, height: rect.height } : undefined)
          }
          if (resizeTimer !== undefined) window?.clearTimeout?.(resizeTimer)
          resizeTimer = window?.setTimeout?.(() => {
            resizeTimer = undefined
            scheduleVectors()
          }, 160)
        })
      }
      scan()
      if (observer || !window?.MutationObserver) return
      const observationRoot = document.querySelector('[data-prts-region="sessions"]')
      if (!observationRoot) return
      observer = new window.MutationObserver(queueScan)
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['aria-expanded', 'aria-selected', 'class'],
      })
    },
    dispose() {
      observer?.disconnect()
      observer = undefined
      if (scanFrame !== undefined) {
        if (window?.cancelAnimationFrame) window.cancelAnimationFrame(scanFrame)
        else window?.clearTimeout?.(scanFrame)
      }
      scanFrame = undefined
      resizeObserver?.disconnect()
      resizeObserver = undefined
      if (resizeFrame !== undefined) {
        if (window?.cancelAnimationFrame) window.cancelAnimationFrame(resizeFrame)
        else window?.clearTimeout?.(resizeFrame)
      }
      resizeFrame = undefined
      if (resizeTimer !== undefined) window?.clearTimeout?.(resizeTimer)
      resizeTimer = undefined
      clear()
    },
  }
}
