function closestCommonContainer(root, nodes) {
  let candidate = nodes[0]?.parentElement
  while (candidate && candidate !== root) {
    if (nodes.every(node => candidate === node || candidate.contains(node))) return candidate
    candidate = candidate.parentElement
  }
  return root && nodes.every(node => root.contains(node)) ? root : null
}

const LAYOUT_CONTRACTS = [
  {
    version: '0.1.5',
    center: '[data-slot="main"]',
    auxiliary: '[data-slot="rightbar"]',
  },
  {
    version: '0.1.2',
    center: '[data-slot="conversation"]',
    auxiliary: '[data-slot="details"]',
  },
]

export function resolveRc7Regions(document, report = () => {}) {
  const root = document?.querySelector('[data-slot="root"]')
  const sidebarSlot = root?.querySelector('[data-slot="sidebar"]')
  const contract = LAYOUT_CONTRACTS
    .map(candidate => ({
      ...candidate,
      centerSlot: root?.querySelector(candidate.center),
      auxiliarySlot: root?.querySelector(candidate.auxiliary),
    }))
    .find(candidate => candidate.centerSlot && candidate.auxiliarySlot)
  if (!root || !sidebarSlot || !contract) {
    report('required layout slots are unavailable', {
      root: Boolean(root), sidebar: Boolean(sidebarSlot),
      main: Boolean(root?.querySelector('[data-slot="main"]')),
      rightbar: Boolean(root?.querySelector('[data-slot="rightbar"]')),
      conversation: Boolean(root?.querySelector('[data-slot="conversation"]')),
      details: Boolean(root?.querySelector('[data-slot="details"]')),
    })
    return null
  }
  const { centerSlot, auxiliarySlot } = contract
  const sidebar = sidebarSlot?.parentElement
  const center = centerSlot?.parentElement
  const auxiliary = auxiliarySlot?.parentElement

  if (!sidebar || !center || !auxiliary) {
    report('required layout region containers are unavailable', {
      sidebar: Boolean(sidebar), center: Boolean(center), auxiliary: Boolean(auxiliary),
    })
    return null
  }

  const frame = closestCommonContainer(root, [sidebar, center, auxiliary])
  if (!frame) {
    report('common layout container is unavailable')
    return null
  }

  return {
    root,
    frame,
    sidebar,
    center,
    auxiliary,
    sidebarSlot,
    centerSlot,
    auxiliarySlot,
    layoutVersion: contract.version,
    // Legacy aliases keep the internal adapter face compatible with callers
    // built against the 0.1.2 layout vocabulary.
    conversationSlot: centerSlot,
    details: auxiliary,
    detailsSlot: auxiliarySlot,
  }
}

export function createRc7Adapter({ document, warn } = {}) {
  const owned = []
  let mounted
  let lastDiagnostic
  const writeWarning = typeof warn === 'function'
    ? warn
    : (...args) => document?.defaultView?.console?.warn?.(...args)

  function reportLayoutIssue(message, details) {
    const signature = `${message}:${JSON.stringify(details ?? {})}`
    if (signature === lastDiagnostic) return
    lastDiagnostic = signature
    writeWarning(`[dsh-theme-prts] ${message}`, details)
  }

  return {
    mount() {
      if (mounted) return mounted
      const regions = resolveRc7Regions(document, reportLayoutIssue)
      if (!regions) return null
      lastDiagnostic = undefined
      for (const [node, value] of [
        [regions.frame, 'frame'],
        [regions.sidebar, 'sessions'],
        [regions.center, 'operation'],
        [regions.auxiliary, 'auxiliary'],
      ]) {
        owned.push([node, node.getAttribute('data-prts-region')])
        node.setAttribute('data-prts-region', value)
      }
      mounted = regions
      return mounted
    },
    dispose() {
      for (const [node, previous] of owned.splice(0).reverse()) {
        if (previous === null) node.removeAttribute('data-prts-region')
        else node.setAttribute('data-prts-region', previous)
      }
      mounted = undefined
    },
  }
}
