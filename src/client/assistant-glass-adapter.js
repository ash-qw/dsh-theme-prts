export const ASSISTANT_SURFACE_ATTRIBUTE = 'data-prts-ai-surface'
export const ASSISTANT_STATE_ATTRIBUTE = 'data-prts-ai-surface-state'
export const ASSISTANT_AVATAR_PROPERTY = '--prts-assistant-avatar-image'

const STEP_SELECTOR = '[data-chat-flow-kind="assistant-step"]'
const AVATAR_SELECTOR = ':is([data-chat-flow-kind="assistant-step"], [data-message-role="assistant"])'
const AVATAR_ROW_SELECTOR = '[data-chat-flow-kind="user"], [data-chat-flow-kind="steering"], [data-message-role="user"], ' + AVATAR_SELECTOR
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

function avatarOwner(node) {
  let owner = node?.closest?.(AVATAR_SELECTOR)
  const scope = owner?.closest('[data-conversation-scroll]')
  while (owner) {
    const ancestor = owner.parentElement?.closest(AVATAR_SELECTOR)
    if (!ancestor || ancestor.closest('[data-conversation-scroll]') !== scope) break
    owner = ancestor
  }
  return owner
}

function hasAvatarContent(surface) {
  return Boolean(surface?.textContent?.trim() || surface?.querySelector('img,video,audio,canvas,svg'))
}

function containsAvatarRows(node) {
  if (!isElement(node)) return false
  const relevant = candidate => candidate.getAttribute('data-chat-group-part') !== 'reasoning'
  return (node.matches(AVATAR_ROW_SELECTOR) && relevant(node))
    || [...node.querySelectorAll(AVATAR_ROW_SELECTOR)].some(relevant)
}

export function createAssistantGlassAdapter({ document, window, avatarImage = '' }) {
  let observer
  let observationRoot
  let groupAvatars = true
  let avatarsDirty = true
  let loadingTransitions = false
  const streamingSteps = new Set()
  const revealAnimations = new Map()
  function cancelReveal(step) {
    const animations = revealAnimations.get(step)
    revealAnimations.delete(step)
    for (const animation of animations ?? []) animation.cancel()
  }
  function revealResponse(step, surface) {
    cancelReveal(step)
    if (!loadingTransitions || !surface?.animate || !surface.isConnected
      || document.documentElement.getAttribute('data-prts-motion') === 'reduced'
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      || step.closest('[hidden], [data-turn-process-hidden="true"]')) return
    const bounds = surface.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const animations = [surface.animate([
      { width: '78px', height: '42px', overflow: 'clip' },
      { width: `${bounds.width}px`, height: `${bounds.height}px`, overflow: 'clip' },
    ], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' })]
    for (const child of surface.children) {
      if (!child.animate) continue
      animations.push(child.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: 160, delay: 80, fill: 'backwards', easing: 'ease-out' }))
    }
    revealAnimations.set(step, animations)
    void Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => {
      if (revealAnimations.get(step) === animations) revealAnimations.delete(step)
    })
  }
  const avatarSteps = new Set()
  const emptySteps = new Set()
  function refreshAvatars() {
    if (!avatarsDirty || !observationRoot) return
    avatarsDirty = false
    for (const step of avatarSteps) {
      if (!observationRoot.contains(step) || !step.matches(AVATAR_SELECTOR)) {
        step.removeAttribute('data-prts-avatar-hidden')
        avatarSteps.delete(step)
      }
    }
    emptySteps.clear()
    if (!groupAvatars) {
      for (const step of avatarSteps) step.removeAttribute('data-prts-avatar-hidden')
      avatarSteps.clear()
      return
    }
    const groups = new Set()
    for (const node of observationRoot.querySelectorAll(AVATAR_ROW_SELECTOR)) {
      const scope = node.closest('[data-conversation-scroll]') ?? observationRoot
      if (!node.matches(AVATAR_SELECTOR)) {
        if (!node.closest('[hidden], [data-turn-process-hidden="true"]')) groups.delete(scope)
        continue
      }
      const duplicate = avatarOwner(node) !== node
      const surface = avatarSurface(node)
      const hasContent = !duplicate && hasAvatarContent(surface)
      if (!duplicate && !hasContent) emptySteps.add(node)
      const eligible = hasContent && node.getAttribute('data-chat-group-part') !== 'reasoning'
        && !node.closest('[hidden], [data-turn-process-hidden="true"]')
      const show = eligible && !groups.has(scope)
      if (show) groups.add(scope)
      if (show) node.removeAttribute('data-prts-avatar-hidden')
      else if (!node.hasAttribute('data-prts-avatar-hidden')) node.setAttribute('data-prts-avatar-hidden', '')
      avatarSteps.add(node)
    }
  }
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
    if (!observationRoot?.contains(step)) {
      step.removeAttribute?.('data-prts-avatar-hidden')
      avatarSteps.delete(step)
      emptySteps.delete(step)
    }
    streamingSteps.delete(step)
    cancelReveal(step)
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
    if (!step?.isConnected || !step.matches?.(STEP_SELECTOR)
      || step.getAttribute('data-chat-group-part') === 'reasoning') {
      releaseStep(step)
      return
    }
    const previousSurface = stepSurfaces.get(step)
    const { surface, kind } = resolution(step)
    if (step.getAttribute(ASSISTANT_STATE_ATTRIBUTE) !== kind) {
      step.setAttribute(ASSISTANT_STATE_ATTRIBUTE, kind)
    }
    ownedSteps.add(step)
    if (previousSurface && previousSurface !== surface) {
      previousSurface.removeAttribute?.(ASSISTANT_SURFACE_ATTRIBUTE)
      ownedSurfaces.delete(previousSurface)
    }
    if (!surface || surface === step) {
      stepSurfaces.delete(step)
      return
    }
    if (surface.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE) !== kind) {
      surface.setAttribute(ASSISTANT_SURFACE_ATTRIBUTE, kind)
    }
    ownedSurfaces.add(surface)
    stepSurfaces.set(step, surface)
    const streaming = surface.parentElement?.hasAttribute('data-streaming') === true
    const wasStreaming = streamingSteps.has(step)
    if (streaming) { streamingSteps.add(step); cancelReveal(step) }
    else {
      streamingSteps.delete(step)
      if (wasStreaming) revealResponse(step, surface)
    }
  }

  function scan() {
    refreshAvatars()
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

  function avatarSurface(step) {
    const surface = stepSurfaces.get(step)
    return surface?.isConnected && step.contains(surface)
      ? surface
      : resolveAssistantSurface(step) ?? (step.matches(STEP_SELECTOR) ? null : step)
  }

  function avatarContentChanged(step) {
    const hasContent = hasAvatarContent(avatarSurface(step))
    return emptySteps.has(step) ? hasContent : !hasContent
  }

  function affectsAvatars(mutation, stableContentMutation) {
    if (avatarsDirty || !groupAvatars) return false
    const target = mutation.target
    if (mutation.type === 'attributes') {
      const attribute = mutation.attributeName
      if (attribute === 'hidden' || attribute === 'data-turn-process-hidden') return containsAvatarRows(target)
      if (['data-chat-flow-kind', 'data-message-role', 'data-chat-group-part'].includes(attribute)) return true
      const step = avatarOwner(target)
      return step && step.getAttribute('data-chat-group-part') !== 'reasoning'
        && !stableContentMutation && !isExcluded(target, step)
        && ['class', 'data-markdown', 'data-slot'].includes(attribute)
    }
    const element = isElement(target) ? target : target.parentElement
    const step = avatarOwner(element)
    if (mutation.type === 'childList'
      && [...mutation.addedNodes, ...mutation.removedNodes].some(containsAvatarRows)) return true
    if (!step || step.getAttribute('data-chat-group-part') === 'reasoning' || isExcluded(element, step)) return false
    if (mutation.type === 'characterData') {
      return (emptySteps.has(step) || !target.data?.trim()) && avatarContentChanged(step)
    }
    return !stableContentMutation
      || ((emptySteps.has(step) || mutation.removedNodes.length) && avatarContentChanged(step))
  }

  function onMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        if (affectsAvatars(mutation, true)) avatarsDirty = true
        continue
      }
      const parentStep = mutation.target?.closest?.(STEP_SELECTOR)
      const stableContentMutation = parentStep
        && stableBodyContains(parentStep, mutation.target)
        && !(mutation.type === 'attributes' && stepSurfaces.get(parentStep) === mutation.target)
      if (affectsAvatars(mutation, stableContentMutation)) avatarsDirty = true
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
    if (pendingSteps.size || avatarsDirty) scan()
  }

  function removeMarkers() {
    for (const step of [...ownedSteps]) releaseStep(step)
    pendingSteps.clear()
  }

  return {
    start({ groupAvatars: enabled = true, loading = false } = {}) {
      loadingTransitions = loading
      if (!loading) for (const step of [...revealAnimations.keys()]) cancelReveal(step)
      if (!document) return
      if (groupAvatars !== enabled) {
        groupAvatars = enabled
        avatarsDirty = true
        refreshAvatars()
      }
      mountAvatarImage()
      observationRoot = document.querySelector('[data-prts-region="operation"]')
        ?? document.querySelector('[data-slot="main.conversation"], [data-slot="conversation"]')
      if (!observationRoot) return
      if (observer) return
      avatarsDirty = true
      collectInitialSteps(observationRoot)
      scan()
      const Observer = window?.MutationObserver
      if (!Observer) return
      observer = new Observer(onMutations)
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-streaming', 'class', 'data-chat-flow-kind', 'data-message-role', 'data-chat-group-part', 'data-markdown', 'data-slot', 'data-chat-turn', 'hidden', 'data-turn-process-hidden', 'data-turn-process-member', 'data-turn-process-answer'],
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
      for (const step of [...revealAnimations.keys()]) cancelReveal(step)
      streamingSteps.clear()
      removeMarkers()
      for (const step of avatarSteps) step.removeAttribute('data-prts-avatar-hidden')
      avatarSteps.clear()
      emptySteps.clear()
      observationRoot = undefined
      releaseAvatarImage()
    },
  }
}
