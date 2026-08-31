const FLOATING_GLASS_OWNED_ATTRIBUTES = [
  'data-prts-floating-glass',
  'data-prts-floating-kind',
  'data-prts-floating-item',
  'data-prts-floating-input',
  'data-prts-floating-danger',
  'data-prts-floating-scrim',
  'data-prts-floating-nested',
  'data-prts-floating-preserved',
]
const FLOATING_GLASS_OWNED_SELECTOR = FLOATING_GLASS_OWNED_ATTRIBUTES.map(attribute => `[${attribute}]`).join(', ')

const FLOATING_GLASS_POPUP_SELECTOR = [
  '[role="menu"]',
  '[role="listbox"]',
  '[role="dialog"][aria-modal="true"]',
  '[popover]',
].join(', ')

const FLOATING_GLASS_PORTAL_ROOT_SELECTOR = [
  '[role="presentation"]',
  '[class*="_portal_"]',
  '[data-floating-ui-portal]',
  '[data-radix-portal]',
].join(', ')

function markFloatingGlass(node, attribute, value = '') {
  if (!node?.setAttribute) return
  node.setAttribute(attribute, value)
}

function floatingClassHas(node, fragment) {
  return [...(node?.classList ?? [])].some(token => token.includes(fragment))
}

function floatingPopupKind(node) {
  if (node.matches('[role="dialog"]')) return 'dialog'
  if (node.matches('[role="listbox"]')) return 'listbox'
  if (node.matches('[role="menu"]')) return 'menu'
  return 'popover'
}

function floatingVisible(node) {
  return !node.hidden
    && node.getAttribute('aria-hidden') !== 'true'
    && node.style?.display !== 'none'
}

function floatingForeignPluginOwner(node) {
  const owner = node.closest?.('[data-plugin]')
  if (!owner) return null
  const id = owner.getAttribute('data-plugin')
  return id && id !== 'dsh-theme-prts' ? owner : null
}

function floatingHasCompleteCustomMaterial(window, node) {
  let style
  try {
    style = window.getComputedStyle(node)
  } catch {
    return false
  }
  const radius = Number.parseFloat(style.borderRadius) || 0
  const hasDepth = style.boxShadow !== 'none'
    || style.backdropFilter !== 'none'
    || style.webkitBackdropFilter !== 'none'
    || style.backgroundImage !== 'none'
  return radius >= 10 && hasDepth
}

function floatingCandidatesForBodyChild(node, body) {
  if (node?.nodeType !== 1 || node.parentElement !== body) return []
  if (node.matches(FLOATING_GLASS_POPUP_SELECTOR)) return [node]
  if (!node.matches(FLOATING_GLASS_PORTAL_ROOT_SELECTOR)) return []
  return [...node.querySelectorAll(FLOATING_GLASS_POPUP_SELECTOR)]
}

export function createFloatingGlassAdapter({ document, window }) {
  let observer
  const owned = new Set()
  const classified = new WeakSet()

  function own(node, attribute, value = '') {
    markFloatingGlass(node, attribute, value)
    owned.add(node)
  }

  function preserveThirdParty(node) {
    if (node.closest?.('[data-prts-preserve-popup-style]')) return true
    if (!floatingForeignPluginOwner(node) || !floatingHasCompleteCustomMaterial(window, node)) return false
    own(node, 'data-prts-floating-preserved', 'custom')
    return true
  }

  function classify(node) {
    if (!floatingVisible(node) || classified.has(node)) return
    classified.add(node)
    if (preserveThirdParty(node)) return

    const kind = floatingPopupKind(node)
    own(node, 'data-prts-floating-glass', kind)
    own(node, 'data-prts-floating-kind', kind)
    if (node.parentElement?.closest?.(FLOATING_GLASS_POPUP_SELECTOR)) own(node, 'data-prts-floating-nested')

    for (const item of node.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]')) {
      own(item, 'data-prts-floating-item')
      if (floatingClassHas(item, '_danger_') || item.matches('[data-variant="danger"], [data-danger="true"]')) {
        own(item, 'data-prts-floating-danger')
      }
    }

    if (kind === 'dialog') {
      const scrim = node.parentElement?.matches?.('[role="presentation"]') ? node.parentElement : null
      if (scrim) own(scrim, 'data-prts-floating-scrim')
      for (const input of node.querySelectorAll('input, textarea, select, [contenteditable="true"]')) {
        own(input, 'data-prts-floating-input')
      }
      for (const danger of node.querySelectorAll('[class*="_danger_"], [class*="_deleteAction"], [data-variant="danger"], [data-danger="true"]')) {
        own(danger, 'data-prts-floating-danger')
      }
    } else {
      for (const input of node.querySelectorAll('input, textarea, select, [contenteditable="true"]')) {
        own(input, 'data-prts-floating-input')
      }
    }
  }

  function scanBodyChild(node) {
    for (const candidate of floatingCandidatesForBodyChild(node, document.body)) classify(candidate)
  }

  function scan() {
    for (const child of document?.body?.children ?? []) scanBodyChild(child)
  }

  function releaseTree(node) {
    if (node?.nodeType !== 1) return
    const candidates = [
      node,
      ...(node.querySelectorAll?.(FLOATING_GLASS_OWNED_SELECTOR) ?? []),
    ]
    for (const candidate of candidates) {
      if (!owned.has(candidate)) continue
      for (const attribute of FLOATING_GLASS_OWNED_ATTRIBUTES) candidate.removeAttribute?.(attribute)
      owned.delete(candidate)
      classified.delete(candidate)
    }
  }

  function clear() {
    for (const node of owned) {
      for (const attribute of FLOATING_GLASS_OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
    }
    owned.clear()
  }

  return {
    start() {
      if (!document?.body || observer) return
      scan()
      const Observer = window?.MutationObserver
      if (!Observer) return
      observer = new Observer(records => {
        for (const record of records) {
          for (const node of record.removedNodes) releaseTree(node)
          for (const node of record.addedNodes) scanBodyChild(node)
        }
      })
      observer.observe(document.body, { childList: true })
    },
    dispose() {
      observer?.disconnect()
      observer = undefined
      clear()
    },
  }
}
