const CONTROL_ATTRIBUTE = 'data-prts-glass-control'
const MENU_ATTRIBUTE = 'data-prts-glass-menu'
const COMPOSER_SIGNAL_ATTRIBUTE = 'data-prts-composer-signal'
const POPUP_SELECTOR = '[data-menu-material], [data-trigger-menu], [role="menu"], [role="listbox"]'
const TRIGGER_SELECTOR = 'button[aria-haspopup="menu"], button[aria-haspopup="listbox"], [data-slot="conversation.input.permission"] button'
const PRESET_TRIGGER_SELECTOR = '[data-slot="conversation.hero.agentPreset"] button[aria-haspopup="menu"]'
const COMPOSER_RELEVANCE_SELECTOR = [
  '[data-composer-card]',
  '[data-slot="conversation.input.overlay"]',
  '[data-slot="conversation.input.model"]',
  '[data-slot="conversation.input.permission"]',
  '[data-slot="conversation.hero.agentPreset"]',
  TRIGGER_SELECTOR,
  POPUP_SELECTOR,
].join(', ')

function controlledPopup(document, trigger) {
  const ids = trigger.getAttribute('aria-controls')?.split(/\s+/) ?? []
  return ids.map(id => document.getElementById(id)).find(node => node?.matches(POPUP_SELECTOR))
}

function localPopup(trigger) {
  return Array.from(trigger.parentElement?.children ?? []).find(node => node !== trigger && node.matches(POPUP_SELECTOR))
}

function anchoredPopup(trigger, popups) {
  const boundary = trigger.closest('[data-composer-card], [data-slot="conversation.hero.agentPreset"]')
  for (let anchor = trigger; anchor && anchor !== boundary; anchor = anchor.parentElement) {
    for (const name of anchor.style.getPropertyValue('anchor-name').split(',').map(value => value.trim()).filter(Boolean)) {
      const popup = popups.get(name)
      if (popup) return popup
    }
  }
}

function linkedMenu(document, trigger, popups) {
  return controlledPopup(document, trigger) ?? localPopup(trigger) ?? anchoredPopup(trigger, popups)
}

function markPopup(popup, kind, menus) {
  if (!popup) return
  const shell = popup.closest('[data-menu-material], [data-trigger-menu]') ?? popup
  menus.set(shell, kind)
  for (const nested of shell.querySelectorAll(POPUP_SELECTOR)) {
    if (shell.hasAttribute('data-menu-material') && !nested.hasAttribute('data-menu-material')) {
      menus.delete(nested)
      continue
    }
    menus.set(nested, kind)
  }
}

function syncMarkers(owned, next, attribute) {
  for (const node of owned) if (!next.has(node)) node.removeAttribute(attribute)
  owned.clear()
  for (const [node, kind] of next) {
    if (node.getAttribute(attribute) !== kind) node.setAttribute(attribute, kind)
    owned.add(node)
  }
}

export function createComposerGlassAdapter({ document, window }) {
  let observer
  let scanFrame
  const ownedSignals = new Set()
  const ownedControls = new Set()
  const ownedMenus = new Set()

  function ensureSignal(composer) {
    if (composer.querySelector(`:scope > [${COMPOSER_SIGNAL_ATTRIBUTE}]`)) return
    const signal = document.createElement('span')
    signal.setAttribute(COMPOSER_SIGNAL_ATTRIBUTE, '')
    signal.setAttribute('aria-hidden', 'true')
    composer.append(signal)
    ownedSignals.add(signal)
  }

  function mutationTouchesComposer(mutation) {
    if (mutation.type === 'attributes') {
      if (mutation.attributeName === 'style') return /(?:^|;)\s*(?:anchor-name|position-anchor)\s*:/.test(mutation.target.style.cssText)
        || /(?:^|;)\s*(?:anchor-name|position-anchor)\s*:/.test(mutation.oldValue ?? '')
      if (mutation.attributeName === 'data-composer-card') return true
      if (mutation.attributeName === 'data-slot' && mutation.oldValue?.startsWith('conversation.')) return true
      return mutation.target.matches(COMPOSER_RELEVANCE_SELECTOR)
        || ownedControls.has(mutation.target) || ownedMenus.has(mutation.target)
    }
    return [...mutation.addedNodes, ...mutation.removedNodes].some(node => node.nodeType === 1
      && (node.matches(COMPOSER_RELEVANCE_SELECTOR) || node.querySelector(COMPOSER_RELEVANCE_SELECTOR)))
  }

  function onMutations(mutations) {
    const relevant = mutations.filter(mutationTouchesComposer)
    if (!relevant.length) return
    const openingPopup = relevant.some(mutation =>
      (mutation.type === 'attributes' && ['aria-expanded', 'aria-controls'].includes(mutation.attributeName))
      || [...(mutation.addedNodes ?? [])].some(node => node.nodeType === 1
        && (node.matches(POPUP_SELECTOR) || node.querySelector(POPUP_SELECTOR))),
    )
    if (openingPopup) {
      cancelScan()
      scan()
    } else queueScan()
  }

  function cancelScan() {
    if (scanFrame === undefined) return
    if (window?.cancelAnimationFrame) window.cancelAnimationFrame(scanFrame)
    else window?.clearTimeout?.(scanFrame)
    scanFrame = undefined
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
    for (const signal of ownedSignals) {
      if (signal.isConnected && signal.parentElement?.matches('[data-composer-card]')) continue
      signal.remove()
      ownedSignals.delete(signal)
    }
    const controls = new Map()
    const menus = new Map()
    const popups = new Map()
    for (const popup of document.querySelectorAll('[data-menu-material]')) {
      const anchor = popup.style.getPropertyValue('position-anchor').trim()
      if (anchor) popups.set(anchor, popups.has(anchor) ? null : popup)
    }
    for (const overlay of document.querySelectorAll('[data-slot="conversation.input.overlay"]')) {
      for (const popup of overlay.querySelectorAll(POPUP_SELECTOR)) markPopup(popup, 'action', menus)
    }
    for (const composer of document.querySelectorAll('[data-composer-card]')) {
      ensureSignal(composer)
      for (const menu of composer.querySelectorAll(POPUP_SELECTOR)) markPopup(menu, 'action', menus)
      for (const trigger of composer.querySelectorAll(TRIGGER_SELECTOR)) {
        if (trigger.closest(POPUP_SELECTOR)) continue
        const menu = linkedMenu(document, trigger, popups)
        const kind = trigger.closest('[data-slot="conversation.input.permission"]') ? 'permission'
          : trigger.closest('[data-slot="conversation.input.model"]') || menu?.hasAttribute('aria-busy') ? 'model' : 'action'
        controls.set(trigger, kind)
        markPopup(menu, kind, menus)
      }
    }
    for (const trigger of document.querySelectorAll(PRESET_TRIGGER_SELECTOR)) {
      controls.set(trigger, 'preset')
      if (trigger.getAttribute('aria-expanded') === 'true') markPopup(linkedMenu(document, trigger, popups), 'preset', menus)
    }
    syncMarkers(ownedControls, controls, CONTROL_ATTRIBUTE)
    syncMarkers(ownedMenus, menus, MENU_ATTRIBUTE)
  }

  return {
    start() {
      if (!document || observer) return
      scan()
      const Observer = window?.MutationObserver
      if (!Observer) return
      const observationRoot = document.querySelector('[data-prts-region="operation"]')
        ?? document.querySelector('[data-slot="main.conversation"]')
      if (!observationRoot) return
      observer = new Observer(onMutations)
      if (observationRoot !== document.body) observer.observe(document.body, { childList: true })
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['aria-controls', 'aria-expanded', 'aria-busy', 'aria-haspopup', 'role', 'data-composer-card', 'data-slot', 'data-menu-material', 'style'],
      })
    },
    dispose() {
      observer?.disconnect()
      observer = undefined
      cancelScan()
      syncMarkers(ownedControls, new Map(), CONTROL_ATTRIBUTE)
      syncMarkers(ownedMenus, new Map(), MENU_ATTRIBUTE)
      for (const signal of ownedSignals) signal.remove()
      ownedSignals.clear()
    },
  }
}
