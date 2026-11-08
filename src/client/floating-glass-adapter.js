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

const FLOATING_GLASS_ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]'
const FLOATING_GLASS_INPUT_SELECTOR = 'input, textarea, select, [contenteditable="true"]'
const FLOATING_GLASS_DANGER_SELECTOR = '[class*="_danger_"], [class*="_deleteAction"], [data-variant="danger"], [data-danger="true"]'
const FLOATING_GLASS_CONTENT_SELECTOR = [FLOATING_GLASS_ITEM_SELECTOR, FLOATING_GLASS_INPUT_SELECTOR, FLOATING_GLASS_DANGER_SELECTOR].join(', ')
const FLOATING_GLASS_PRESERVED_SELECTOR = '[data-prts-preserve-popup-style], [data-prts-floating-preserved]'

export function createFloatingGlassAdapter({ document, window }) {
  let observer
  let active = false
  const owned = new Set()
  const contentObservers = new Map()
  let classified = new WeakSet()

  function own(node, attribute, value = '') {
    if (node.getAttribute(attribute) !== value) markFloatingGlass(node, attribute, value)
    owned.add(node)
  }

  function update(node, attribute, enabled) {
    if (enabled) own(node, attribute)
    else if (owned.has(node) && node.hasAttribute(attribute)) {
      node.removeAttribute(attribute)
      if (!node.matches(FLOATING_GLASS_OWNED_SELECTOR)) owned.delete(node)
    }
  }

  function preserveThirdParty(node) {
    if (!floatingForeignPluginOwner(node) || !floatingHasCompleteCustomMaterial(window, node)) return false
    own(node, 'data-prts-floating-preserved', 'custom')
    return true
  }

  function classifyPopup(node) {
    if (!floatingVisible(node) || classified.has(node)
      || node.closest('[data-prts-preserve-popup-style]')
      || node.parentElement?.closest('[data-prts-floating-preserved]')) return
    if (preserveThirdParty(node)) {
      classified.add(node)
      return
    }
    const parentPopup = node.parentElement?.closest(FLOATING_GLASS_POPUP_SELECTOR)
    if (parentPopup?.hasAttribute('data-menu-material')
      && node.matches('[role="menu"], [role="listbox"]')
      && !node.hasAttribute('data-menu-material')) return
    classified.add(node)
    const kind = floatingPopupKind(node)
    own(node, 'data-prts-floating-glass', kind)
    own(node, 'data-prts-floating-kind', kind)
    if (parentPopup) own(node, 'data-prts-floating-nested')
    if (kind === 'dialog') {
      const scrim = node.parentElement?.matches?.('[role="presentation"]') ? node.parentElement : null
      if (scrim) own(scrim, 'data-prts-floating-scrim')
    }
  }

  function classifyContent(node) {
    if (node.closest(FLOATING_GLASS_PRESERVED_SELECTOR)) return
    const popup = node.closest('[data-prts-floating-glass]')
    if (!popup || !floatingVisible(popup)) return
    const section = node.closest('[data-slot="settings.section"], [data-slot="settings.plugins.tab"]')
    const ownsContent = !section || !popup.contains(section)
    const item = ownsContent && node.matches(FLOATING_GLASS_ITEM_SELECTOR)
    const danger = ownsContent && (item && (floatingClassHas(node, '_danger_') || node.matches('[data-variant="danger"], [data-danger="true"]'))
      || popup.dataset.prtsFloatingGlass === 'dialog' && node.matches(FLOATING_GLASS_DANGER_SELECTOR))
    update(node, 'data-prts-floating-item', item)
    update(node, 'data-prts-floating-input', ownsContent && node.matches(FLOATING_GLASS_INPUT_SELECTOR))
    update(node, 'data-prts-floating-danger', danger)
  }

  function classifyTree(node) {
    if (node?.nodeType !== 1 || node.closest(FLOATING_GLASS_PRESERVED_SELECTOR)) return
    if (node.matches(FLOATING_GLASS_POPUP_SELECTOR)) classifyPopup(node)
    for (const popup of node.querySelectorAll(FLOATING_GLASS_POPUP_SELECTOR)) classifyPopup(popup)
    classifyContent(node)
    for (const content of node.querySelectorAll(FLOATING_GLASS_CONTENT_SELECTOR)) classifyContent(content)
  }

  function releaseTree(node) {
    if (node?.nodeType !== 1) return
    const candidates = [node, ...node.querySelectorAll(`${FLOATING_GLASS_OWNED_SELECTOR}, ${FLOATING_GLASS_POPUP_SELECTOR}`)]
    for (const candidate of candidates) {
      classified.delete(candidate)
      if (!owned.has(candidate)) continue
      for (const attribute of FLOATING_GLASS_OWNED_ATTRIBUTES) candidate.removeAttribute(attribute)
      owned.delete(candidate)
    }
  }

  function scanBodyChild(node) {
    if (node?.nodeType !== 1 || node.parentElement !== document.body
      || node.matches('[data-prts-body-target-frame], [data-prts-body-target-ghost], [data-prts-click-ripple], [data-prts-ripple-interference]')
      || !node.matches(`${FLOATING_GLASS_POPUP_SELECTOR}, ${FLOATING_GLASS_PORTAL_ROOT_SELECTOR}`)) return
    classifyTree(node)
    const Observer = window?.MutationObserver
    if (!Observer || contentObservers.has(node)) return
    const contentObserver = new Observer(records => {
      if (!active || node.parentElement !== document.body) return
      for (const record of records) {
        if (record.type === 'attributes') {
          const target = record.target
          if (record.attributeName === 'style') {
            if (!classified.has(target) && target.matches(FLOATING_GLASS_POPUP_SELECTOR) && floatingVisible(target)) classifyTree(target)
          } else if ((target.matches(FLOATING_GLASS_POPUP_SELECTOR) && !classified.has(target))
            || record.attributeName === 'hidden' || record.attributeName === 'aria-hidden') {
            classifyTree(target)
          } else classifyContent(target)
        } else {
          for (const removed of record.removedNodes) {
            if (!node.contains(removed)) releaseTree(removed)
          }
          for (const added of record.addedNodes) classifyTree(added)
        }
      }
    })
    contentObserver.observe(node, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['role', 'aria-modal', 'hidden', 'aria-hidden', 'class', 'data-variant', 'data-danger', 'contenteditable', 'style'],
    })
    contentObservers.set(node, contentObserver)
  }

  function clear() {
    for (const node of owned) {
      for (const attribute of FLOATING_GLASS_OWNED_ATTRIBUTES) node.removeAttribute(attribute)
    }
    owned.clear()
    classified = new WeakSet()
  }

  return {
    start() {
      if (!document?.body || active) return
      active = true
      const Observer = window?.MutationObserver
      if (Observer) {
        observer = new Observer(records => {
          for (const record of records) {
            for (const node of record.removedNodes) {
              contentObservers.get(node)?.disconnect()
              contentObservers.delete(node)
              releaseTree(node)
            }
            for (const node of record.addedNodes) scanBodyChild(node)
          }
        })
        observer.observe(document.body, { childList: true })
      }
      for (const child of document.body.children) scanBodyChild(child)
    },
    dispose() {
      active = false
      observer?.disconnect()
      observer = undefined
      for (const contentObserver of contentObservers.values()) contentObserver.disconnect()
      contentObservers.clear()
      clear()
    },
  }
}
