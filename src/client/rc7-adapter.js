function closestCommonContainer(root, nodes) {
  let candidate = nodes[0]?.parentElement
  while (candidate && candidate !== root) {
    if (nodes.every(node => candidate === node || candidate.contains(node))) return candidate
    candidate = candidate.parentElement
  }
  return root && nodes.every(node => root.contains(node)) ? root : null
}

export function resolveRc7Regions(document, report = () => {}) {
  const root = document?.querySelector('[data-slot="root"]')
  const sidebarSlot = root?.querySelector('[data-slot="sidebar"]')
  const conversationSlot = root?.querySelector('[data-slot="conversation"]')
  const detailsSlot = root?.querySelector('[data-slot="details"]')
  if (!root || !sidebarSlot || !conversationSlot || !detailsSlot) {
    report('required layout slots are unavailable', {
      root: Boolean(root), sidebar: Boolean(sidebarSlot),
      conversation: Boolean(conversationSlot), details: Boolean(detailsSlot),
    })
    return null
  }
  const sidebar = sidebarSlot?.parentElement
  const center = conversationSlot?.parentElement
  const details = detailsSlot?.parentElement

  if (!sidebar || !center || !details) {
    report('required layout region containers are unavailable', {
      sidebar: Boolean(sidebar), conversation: Boolean(center), details: Boolean(details),
    })
    return null
  }

  const frame = closestCommonContainer(root, [sidebar, center, details])
  if (!frame) {
    report('common layout container is unavailable')
    return null
  }

  return { root, frame, sidebar, center, details, sidebarSlot, conversationSlot, detailsSlot }
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
        [regions.details, 'details'],
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
