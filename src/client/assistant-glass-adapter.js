export const ASSISTANT_SURFACE_ATTRIBUTE = 'data-prts-ai-surface'
export const ASSISTANT_STATE_ATTRIBUTE = 'data-prts-ai-surface-state'
export const ASSISTANT_AVATAR_PROPERTY = '--prts-assistant-avatar-image'

const STEP_SELECTOR = '[data-chat-flow-kind="assistant-step"]'
const CONTENT_HINT_SELECTOR = [
  '[data-markdown]',
  '[data-slot*="markdown" i]',
  '.markdown-body',
].join(', ')
const EXCLUDED_SELECTOR = [
  '[role="toolbar"]',
  '[data-slot*="toolbar" i]',
  '[data-slot*="action" i]',
  '[data-slot*="sentinel" i]',
  '[data-prts-scroll-sentinel]',
].join(', ')
const SCAN_CHUNK_LIMIT = 64
const SCAN_BUDGET_MS = 4
const INITIAL_LATEST_LIMIT = 12

function isElement(node) {
  return node?.nodeType === 1
}

function classTokenEndsWith(node, suffix) {
  return isElement(node) && [...(node.classList ?? [])].some(token => token.endsWith(suffix))
}

function isExcluded(node, step) {
  if (!isElement(node)) return true
  const excluded = node.closest?.(EXCLUDED_SELECTOR)
  if (excluded && step.contains(excluded)) return true
  return classTokenEndsWith(node, '_toolbar')
    || classTokenEndsWith(node, '_actions')
    || classTokenEndsWith(node, '_sentinel')
}

function closestBody(node, step) {
  let current = node
  while (isElement(current) && current !== step) {
    if (classTokenEndsWith(current, '_body') && !isExcluded(current, step)) return current
    current = current.parentElement
  }
  return null
}

function bodyFromStep(step) {
  const contentHints = [...(step.querySelectorAll?.(CONTENT_HINT_SELECTOR) ?? [])]
  for (const hint of contentHints) {
    if (isExcluded(hint, step)) continue
    const body = closestBody(hint, step)
    if (body) return body
  }

  const descendants = [...(step.querySelectorAll?.('*') ?? [])]
  const tokenBody = descendants.find(node => classTokenEndsWith(node, '_body') && !isExcluded(node, step))
  if (tokenBody) return tokenBody

  for (const hint of contentHints) {
    if (!isExcluded(hint, step)) return hint
  }
  return null
}

function rootFromStep(step) {
  const direct = [...(step.children ?? [])].filter(node => !isExcluded(node, step))
  if (!direct.length) return null
  for (const root of direct) {
    const body = bodyFromStep(root)
    if (body) return body
    const descendants = [...(root.querySelectorAll?.('*') ?? [])]
    const tokenRoot = descendants.find(node => classTokenEndsWith(node, '_root') && !isExcluded(node, step))
    if (tokenRoot) {
      const children = [...tokenRoot.children].filter(node => !isExcluded(node, step))
      if (children.length === 1) return children[0]
    }
  }
  return direct.find(node => node.textContent?.trim() || node.children.length) ?? direct[0]
}

function resolution(step) {
  if (!isElement(step)) return { surface: null, kind: 'unresolved' }
  const body = bodyFromStep(step)
  if (body) return { surface: body, kind: 'body' }
  const root = rootFromStep(step)
  if (!root) return { surface: null, kind: 'unresolved' }
  return { surface: root, kind: 'root' }
}

export function resolveAssistantSurface(step) {
  return resolution(step).surface
}

function cssUrl(value) {
  if (!value) return ''
  const escaped = String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\n', '')
  return `url("${escaped}")`
}

export function createAssistantGlassAdapter({ document, window, avatarImage = '' }) {
  let observer
  let scanFrame
  const ownedSurfaces = new Set()
  const ownedSteps = new Set()
  const stepSurfaces = new Map()
  const pendingSteps = new Set()
  let previousAvatarImage
  let ownsAvatarImage = false

  function mountAvatarImage() {
    const root = document?.documentElement
    const value = cssUrl(avatarImage)
    if (!root?.style || !value || ownsAvatarImage) return
    previousAvatarImage = root.style.getPropertyValue(ASSISTANT_AVATAR_PROPERTY)
    root.style.setProperty(ASSISTANT_AVATAR_PROPERTY, value)
    ownsAvatarImage = true
  }

  function releaseAvatarImage() {
    if (!ownsAvatarImage) return
    const root = document?.documentElement
    if (previousAvatarImage) root?.style?.setProperty(ASSISTANT_AVATAR_PROPERTY, previousAvatarImage)
    else root?.style?.removeProperty(ASSISTANT_AVATAR_PROPERTY)
    previousAvatarImage = undefined
    ownsAvatarImage = false
  }

  function collectSteps(node, includeParent = true) {
    if (!isElement(node)) return
    if (node.matches?.(STEP_SELECTOR)) pendingSteps.add(node)
    for (const step of node.querySelectorAll?.(STEP_SELECTOR) ?? []) pendingSteps.add(step)
    if (includeParent) {
      const parentStep = node.closest?.(STEP_SELECTOR)
      if (parentStep) pendingSteps.add(parentStep)
    }
  }

  function collectInitialSteps(node) {
    if (!isElement(node)) return
    const steps = [...(node.querySelectorAll?.(STEP_SELECTOR) ?? [])]
    if (node.matches?.(STEP_SELECTOR)) steps.unshift(node)
    const priorityStart = Math.max(0, steps.length - INITIAL_LATEST_LIMIT)

    // The host restores conversations in chronological DOM order. Resolve the
    // newest screenful synchronously so the startup cover never reveals plain
    // assistant content while an older history backlog is still being scanned.
    for (let index = steps.length - 1; index >= priorityStart; index -= 1) {
      processStep(steps[index])
    }
    for (let index = priorityStart - 1; index >= 0; index -= 1) {
      pendingSteps.add(steps[index])
    }
  }

  function stableBodyContains(step, node) {
    const surface = stepSurfaces.get(step)
    return step?.getAttribute?.(ASSISTANT_STATE_ATTRIBUTE) === 'body'
      && surface?.isConnected && step.contains(surface)
      && (node === surface || surface.contains(node))
  }

  function releaseStep(step) {
    const previousSurface = stepSurfaces.get(step)
    stepSurfaces.delete(step)
    ownedSteps.delete(step)
    step.removeAttribute?.(ASSISTANT_STATE_ATTRIBUTE)
    if (previousSurface) {
      previousSurface.removeAttribute?.(ASSISTANT_SURFACE_ATTRIBUTE)
      ownedSurfaces.delete(previousSurface)
    }
  }

  function processStep(step) {
    if (!step?.isConnected || !step.matches?.(STEP_SELECTOR)) {
      releaseStep(step)
      return
    }
    const previousSurface = stepSurfaces.get(step)
    const { surface, kind } = resolution(step)
    step.setAttribute(ASSISTANT_STATE_ATTRIBUTE, kind)
    ownedSteps.add(step)
    if (previousSurface && previousSurface !== surface) {
      previousSurface.removeAttribute?.(ASSISTANT_SURFACE_ATTRIBUTE)
      ownedSurfaces.delete(previousSurface)
    }
    if (!surface || surface === step) {
      stepSurfaces.delete(step)
      return
    }
    surface.setAttribute(ASSISTANT_SURFACE_ATTRIBUTE, kind)
    ownedSurfaces.add(surface)
    stepSurfaces.set(step, surface)
  }

  function scan() {
    const startedAt = window?.performance?.now?.() ?? Date.now()
    let processed = 0
    for (const step of pendingSteps) {
      pendingSteps.delete(step)
      processStep(step)
      processed += 1
      const elapsed = (window?.performance?.now?.() ?? Date.now()) - startedAt
      if (processed >= SCAN_CHUNK_LIMIT || elapsed >= SCAN_BUDGET_MS) break
    }
    if (pendingSteps.size) {
      queueScan()
      return
    }
  }

  function queueScan() {
    if (scanFrame !== undefined) return
    const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
    scanFrame = requestFrame(() => {
      scanFrame = undefined
      scan()
    })
  }

  function onMutations(mutations) {
    for (const mutation of mutations) {
      const parentStep = mutation.target?.closest?.(STEP_SELECTOR)
      const stableContentMutation = parentStep
        && stableBodyContains(parentStep, mutation.target)
        && !(mutation.type === 'attributes' && stepSurfaces.get(parentStep) === mutation.target)
      if (parentStep && !stableContentMutation) {
        pendingSteps.add(parentStep)
      }
      for (const node of mutation.addedNodes ?? []) collectSteps(node, false)
      for (const node of mutation.removedNodes ?? []) {
        if (!isElement(node)) continue
        collectSteps(node, false)
        const surface = parentStep ? stepSurfaces.get(parentStep) : null
        if (surface && (surface === node || node.contains?.(surface))) pendingSteps.add(parentStep)
      }
    }
    if (pendingSteps.size) queueScan()
  }

  function removeMarkers() {
    for (const step of [...ownedSteps]) releaseStep(step)
    pendingSteps.clear()
  }

  return {
    start() {
      if (!document) return
      mountAvatarImage()
      const observationRoot = document.querySelector('[data-prts-region="operation"]')
        ?? document.querySelector('[data-slot="main.conversation"], [data-slot="conversation"]')
      if (!observationRoot) return
      if (observer) return
      collectInitialSteps(observationRoot)
      scan()
      const Observer = window?.MutationObserver
      if (!Observer) return
      observer = new Observer(onMutations)
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'data-chat-flow-kind', 'data-markdown', 'data-slot'],
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
      releaseAvatarImage()
    },
  }
}
