const CONTROL_ATTRIBUTE = 'data-prts-glass-control'
const MENU_ATTRIBUTE = 'data-prts-glass-menu'
const FALLBACK_COMPOSER_ATTRIBUTE = 'data-prts-composer-fallback'
const COMPOSER_SIGNAL_ATTRIBUTE = 'data-prts-composer-signal'
const COMPOSER_RELEVANCE_SELECTOR = [
  '[data-composer-card]',
  'form textarea',
  'button[aria-haspopup="menu"]',
  'button[aria-haspopup="listbox"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[data-trigger-menu]',
  '[data-slot="conversation.input.overlay"]',
].join(', ')
const PRESET_TRIGGER_SELECTOR = [
  '[data-slot="conversation.hero.agentPreset"] button[aria-haspopup="menu"]',
  'button[class*="cubgiG_seat"][aria-haspopup="menu"]',
].join(', ')

function mark(node, attribute, value) {
  if (node?.nodeType === 1) node.setAttribute(attribute, value)
}

function controlledPopup(document, trigger) {
  const id = trigger.getAttribute('aria-controls')
  if (!id) return null
  return document.getElementById(id)
}

function localPopup(trigger) {
  const selector = '[role="menu"], [role="listbox"], [data-trigger-menu], [class*="mufS8W_card"]'
  const sibling = trigger.nextElementSibling
  if (sibling?.matches(selector)) return sibling
  return trigger.parentElement?.querySelector(`:scope > ${selector}`) ?? null
}

function overlayPopup(document) {
  const overlay = document.querySelector('[data-slot="conversation.input.overlay"]')
  if (!overlay) return null
  return overlay.querySelector('[data-trigger-menu], [role="listbox"], [role="menu"], [class*="mufS8W_card"]')
}

function linkedMenu(document, trigger) {
  return controlledPopup(document, trigger)
    ?? localPopup(trigger)
    ?? overlayPopup(document)
}

function markPopup(popup, kind) {
  if (!popup) return
  mark(popup, MENU_ATTRIBUTE, kind)
  const card = popup.closest?.('[data-trigger-menu], [class*="mufS8W_card"]')
  mark(card, MENU_ATTRIBUTE, kind)
  for (const nested of popup.querySelectorAll?.('[role="menu"], [role="listbox"], [data-trigger-menu], [class*="mufS8W_card"]') ?? []) {
    mark(nested, MENU_ATTRIBUTE, kind)
  }
}

export function createComposerGlassAdapter({ document, window }) {
  let observer
  let scanFrame
  const ownedFallbacks = new Set()
  const ownedSignals = new Set()

  function ensureSignal(composer) {
    let signal = composer.querySelector?.(`:scope > [${COMPOSER_SIGNAL_ATTRIBUTE}]`)
    if (signal) return signal
    signal = document.createElement('span')
    signal.setAttribute(COMPOSER_SIGNAL_ATTRIBUTE, '')
    signal.setAttribute('aria-hidden', 'true')
    composer.append(signal)
    ownedSignals.add(signal)
    return signal
  }

  function mutationTouchesComposer(mutation) {
    if (mutation.target?.closest?.('[data-composer-card], [data-prts-composer-fallback], [data-slot="conversation.input.overlay"]')) return true
    for (const node of [...(mutation.addedNodes ?? []), ...(mutation.removedNodes ?? [])]) {
      if (node?.nodeType !== 1) continue
      if (node.matches?.(COMPOSER_RELEVANCE_SELECTOR) || node.querySelector?.(COMPOSER_RELEVANCE_SELECTOR)) return true
    }
    return mutation.type === 'attributes' && (
      mutation.target?.matches?.(COMPOSER_RELEVANCE_SELECTOR)
      || mutation.target?.closest?.(PRESET_TRIGGER_SELECTOR)
    )
  }

  function onMutations(mutations) {
    if (mutations.some(mutationTouchesComposer)) queueScan()
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
    for (const signal of [...ownedSignals]) {
      if (signal.isConnected) continue
      signal.remove?.()
      ownedSignals.delete(signal)
    }
    for (const form of [...ownedFallbacks]) {
      if (!form.isConnected || form.hasAttribute('data-composer-card')) {
        form.removeAttribute?.(FALLBACK_COMPOSER_ATTRIBUTE)
        ownedFallbacks.delete(form)
      }
    }
    const fallbackForms = new Set(
      [...(document?.querySelectorAll?.('form textarea') ?? [])]
        .map(textarea => textarea.closest('form'))
        .filter(form => form && !form.querySelector('[data-composer-card]')),
    )
    for (const form of fallbackForms) {
      form.setAttribute(FALLBACK_COMPOSER_ATTRIBUTE, '')
      ownedFallbacks.add(form)
    }
    const composers = [
      ...(document?.querySelectorAll?.('[data-composer-card]') ?? []),
      ...fallbackForms,
    ]
    for (const composer of composers) {
      ensureSignal(composer)
      for (const menu of composer.querySelectorAll('[role="menu"], [role="listbox"]')) markPopup(menu, 'action')

      for (const trigger of composer.querySelectorAll('button[aria-haspopup="menu"], button[aria-haspopup="listbox"]')) {
        const menu = linkedMenu(document, trigger)
          ?? trigger.parentElement?.querySelector('[role="menu"][aria-busy], [role="listbox"][aria-busy]')
        const isModel = trigger.matches('[class*="_7KE1Ra_"]')
          || menu?.hasAttribute('aria-busy')
        const isCommands = trigger.getAttribute('aria-haspopup') === 'listbox'
          || trigger.getAttribute('aria-label') === 'Commands'
          || trigger.matches('[class*="uV2eYG_add"]')
        const kind = isModel ? 'model' : isCommands ? 'action' : 'action'
        mark(trigger, CONTROL_ATTRIBUTE, kind)
        markPopup(menu, kind)
      }

      const permissionCandidates = [
        ...composer.querySelectorAll('button.Sh0Q9G_trigger'),
        ...composer.querySelectorAll('button[class*="Sh0Q9G_"]'),
      ]
      for (const trigger of new Set(permissionCandidates)) {
        mark(trigger, CONTROL_ATTRIBUTE, 'permission')
        markPopup(linkedMenu(document, trigger), 'permission')
      }
    }

    for (const popup of document?.querySelectorAll?.(`[${MENU_ATTRIBUTE}="preset"]`) ?? []) {
      popup.removeAttribute(MENU_ATTRIBUTE)
    }
    for (const trigger of document?.querySelectorAll?.(PRESET_TRIGGER_SELECTOR) ?? []) {
      mark(trigger, CONTROL_ATTRIBUTE, 'preset')
      if (trigger.getAttribute('aria-expanded') !== 'true') continue
      const popup = controlledPopup(document, trigger)
        ?? localPopup(trigger)
      markPopup(popup, 'preset')
    }

    const overlay = document?.querySelector?.('[data-slot="conversation.input.overlay"]')
    if (overlay) {
      for (const popup of overlay.querySelectorAll('[data-trigger-menu], [role="menu"], [role="listbox"], [class*="mufS8W_card"]')) {
        markPopup(popup, popup.hasAttribute('aria-busy') ? 'model' : 'action')
      }
    }
  }

  function removeMarkers() {
    for (const node of document?.querySelectorAll?.(`[${CONTROL_ATTRIBUTE}], [${MENU_ATTRIBUTE}]`) ?? []) {
      node.removeAttribute(CONTROL_ATTRIBUTE)
      node.removeAttribute(MENU_ATTRIBUTE)
    }
    for (const form of ownedFallbacks) form.removeAttribute?.(FALLBACK_COMPOSER_ATTRIBUTE)
    ownedFallbacks.clear()
    for (const signal of ownedSignals) signal.remove?.()
    ownedSignals.clear()
  }

  return {
    start() {
      if (!document || observer) return
      scan()
      const Observer = window?.MutationObserver
      if (!Observer) return
      const observationRoot = document.querySelector('[data-prts-region="operation"]')
        ?? document.querySelector('[data-slot="conversation"]')
      if (!observationRoot) return
      observer = new Observer(onMutations)
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['aria-controls', 'aria-expanded', 'aria-busy', 'class', 'role'],
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
      removeMarkers()
    },
  }
}
