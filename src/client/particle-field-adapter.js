const PHONE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024
const HERO_SELECTOR = '[data-slot="conversation.hero.brand.mark"], [data-phase="hero"] [data-slot*="hero.brand.mark"]'
const TRANSITION_MS = 900
const DENSITY_DEBOUNCE_MS = 180
const DENSITY_REASSEMBLY_MS = 780
const DENSITY_CROSSFADE_MS = 140
const RESIZE_SETTLE_MS = 160
const RESIZE_RESTORE_MS = 120
const HYDRATION_SETTLE_MS = 120
const IDLE_SETTLE_FRAMES = 8
const IDLE_SETTLE_SPEED = 0.02
const IDLE_SETTLE_GLOW_DISTANCE = 0.15
const HERO_MINIMUM_DENSITY = 'standard'
const DENSITY_ORDER = Object.freeze(['sparse', 'light', 'standard', 'dense', 'ultra'])
export const PARTICLE_DENSITY_PROFILES = Object.freeze({
  sparse: Object.freeze({ pitch: 5.4, radius: 1.04 }),
  light: Object.freeze({ pitch: 4.8, radius: 0.92 }),
  standard: Object.freeze({ pitch: 4.2, radius: 0.82 }),
  dense: Object.freeze({ pitch: 3.7, radius: 0.73 }),
  ultra: Object.freeze({ pitch: 3.25, radius: 0.65 }),
})
const SIGNIFICANT_COMPONENT_AREA = 20
const LATTICE_PHASE_DIVISIONS = 20
const MASK_COMPONENT_CACHE = new WeakMap()

function countMatchingDescendants(node, selector, limit = 16) {
  const document = node?.ownerDocument
  if (!document?.createTreeWalker) {
    return Math.min(limit, node?.querySelectorAll?.(selector)?.length ?? 0)
  }
  const showElement = document.defaultView?.NodeFilter?.SHOW_ELEMENT ?? 1
  const walker = document.createTreeWalker(node, showElement)
  let count = 0
  let current = walker.firstChild()
  while (current && count < limit) {
    if (current.matches?.(selector)) count += 1
    current = walker.nextNode()
  }
  return count
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function pointerRadiusForFieldSize(fieldSize) {
  const size = Number(fieldSize)
  return clamp((Number.isFinite(size) ? size : 0) * 0.2, 56, 96)
}

function easeInOut(value) {
  const progress = clamp(value, 0, 1)
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2
}

function easeOut(value) {
  return 1 - Math.pow(1 - clamp(value, 0, 1), 3)
}

function interpolate(from, to, progress) {
  return from + (to - from) * clamp(progress, 0, 1)
}

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let result = value
    result = Math.imul(result ^ result >>> 15, result | 1)
    result ^= result + Math.imul(result ^ result >>> 7, result | 61)
    return ((result ^ result >>> 14) >>> 0) / 4294967296
  }
}

function stableHash(value) {
  let hash = 2166136261
  for (const character of String(value)) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function findAlphaBounds(pixels, width, height, threshold = 16) {
  const channels = pixels?.length >= width * height * 4 ? 4 : 1
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * channels + (channels === 4 ? 3 : 0)]
      if (alpha <= threshold) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < left || bottom < top) return null
  return { left, top, right, bottom, width: right - left + 1, height: bottom - top + 1 }
}

function alphaAt(mask, x, y) {
  const column = Math.round(x)
  const row = Math.round(y)
  if (column < 0 || row < 0 || column >= mask.width || row >= mask.height) return 0
  return mask.alpha[row * mask.width + column] ?? 0
}

function maskComponents(mask) {
  const cached = MASK_COMPONENT_CACHE.get(mask)
  if (cached) return cached
  const labels = new Int32Array(mask.width * mask.height)
  labels.fill(-1)
  const sizes = []
  for (let index = 0; index < labels.length; index += 1) {
    if (labels[index] >= 0 || (mask.alpha[index] ?? 0) <= 40) continue
    const id = sizes.length
    const queue = [index]
    labels[index] = id
    let size = 0
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor]
      const x = current % mask.width
      const y = Math.floor(current / mask.width)
      size += 1
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (!offsetX && !offsetY) continue
          const column = x + offsetX
          const row = y + offsetY
          if (column < 0 || row < 0 || column >= mask.width || row >= mask.height) continue
          const neighbor = row * mask.width + column
          if (labels[neighbor] >= 0 || (mask.alpha[neighbor] ?? 0) <= 40) continue
          labels[neighbor] = id
          queue.push(neighbor)
        }
      }
    }
    sizes.push(size)
  }
  const required = new Set(sizes.flatMap((size, index) => size >= SIGNIFICANT_COMPONENT_AREA ? [index] : []))
  const result = { labels, sizes, required }
  MASK_COMPONENT_CACHE.set(mask, result)
  return result
}

function latticeAtPhase(mask, pitch, offsetX, offsetY, components) {
  const points = []
  const componentHits = new Set()
  const probe = Math.max(1.5, pitch * 0.46)
  let latticeRow = 0
  for (let y = offsetY; y < mask.height; y += pitch, latticeRow += 1) {
    let latticeColumn = 0
    for (let x = offsetX; x < mask.width; x += pitch, latticeColumn += 1) {
      if (alphaAt(mask, x, y) <= 40) continue
      const pixelX = Math.round(x)
      const pixelY = Math.round(y)
      const component = components.labels[pixelY * mask.width + pixelX]
      if (component >= 0) componentHits.add(component)
      const boundary = alphaAt(mask, x - probe, y) <= 40
        || alphaAt(mask, x + probe, y) <= 40
        || alphaAt(mask, x, y - probe) <= 40
        || alphaAt(mask, x, y + probe) <= 40
      points.push({
        x: (x - mask.width / 2) / Math.max(mask.width, mask.height),
        y: (y - mask.height / 2) / Math.max(mask.width, mask.height),
        kind: boundary ? 'skeleton' : 'fill',
        latticeColumn,
        latticeRow,
        component,
      })
    }
  }
  let missing = 0
  for (const component of components.required) if (!componentHits.has(component)) missing += 1
  return { points, componentHits, missing }
}

export function findOrthogonalLayout(mask, density = 'standard') {
  if (!mask?.alpha?.length || !Number.isInteger(mask.width) || !Number.isInteger(mask.height)) return null
  const profile = PARTICLE_DENSITY_PROFILES[density] ?? PARTICLE_DENSITY_PROFILES.standard
  const components = maskComponents(mask)
  if (!components.sizes.length) return null
  const hint = mask.latticeHints?.[density]
  if (Number.isFinite(hint?.pitch) && Number.isFinite(hint?.offsetX) && Number.isFinite(hint?.offsetY)) {
    const candidate = latticeAtPhase(mask, hint.pitch, hint.offsetX, hint.offsetY, components)
    if (candidate.missing === 0) {
      return { ...candidate, pitch: hint.pitch, offsetX: hint.offsetX, offsetY: hint.offsetY }
    }
  }
  let pitch = profile.pitch
  let best
  for (let refinement = 0; refinement < 12; refinement += 1) {
    for (let phaseY = 0; phaseY < LATTICE_PHASE_DIVISIONS; phaseY += 1) {
      for (let phaseX = 0; phaseX < LATTICE_PHASE_DIVISIONS; phaseX += 1) {
        const offsetX = (phaseX + 0.5) * pitch / LATTICE_PHASE_DIVISIONS
        const offsetY = (phaseY + 0.5) * pitch / LATTICE_PHASE_DIVISIONS
        const candidate = latticeAtPhase(mask, pitch, offsetX, offsetY, components)
        if (!best
          || candidate.missing < best.missing
          || candidate.missing === best.missing && candidate.points.length > best.points.length) {
          best = { ...candidate, pitch, offsetX, offsetY }
        }
      }
    }
    if (best?.missing === 0) break
    pitch *= 0.94
  }
  return best ?? null
}

export function createOrthogonalTargets(mask, density = 'standard') {
  return findOrthogonalLayout(mask, density)?.points ?? []
}

export function inspectOrthogonalCoverage(mask, density = 'standard') {
  const targets = createOrthogonalTargets(mask, density)
  const components = maskComponents(mask)
  const hits = new Set(targets.map(target => target.component).filter(component => component >= 0))
  const missingComponents = [...components.required].filter(component => !hits.has(component))
  return {
    targets,
    requiredComponents: components.required.size,
    coveredComponents: components.required.size - missingComponents.length,
    missingComponents,
  }
}
function sideForSegment(segment) {
  return Math.abs(segment) % 2 === 0 ? -1 : 1
}

function normalizeEmblems(emblems, legacyEmblem) {
  const normalized = Array.isArray(emblems)
    ? emblems.filter(item => item && (item.key || typeof item.source === 'string')).map((item, index) => ({
      key: String(item.key || `emblem-${index + 1}`),
      label: String(item.label || item.key || `徽记 ${index + 1}`),
      source: typeof item.source === 'string' ? item.source : '',
    }))
    : []
  if (normalized.length) return normalized
  return legacyEmblem ? [{ key: 'rhodes-island', label: '罗德岛', source: legacyEmblem }] : []
}
function decodeAlphaMask(encoded, window, encoding, expectedLength) {
  if (typeof encoded !== 'string' || !encoded) return null
  try {
    const binary = window.atob(encoded)
    if (encoding === 'binary-rle-v1') {
      if (!Number.isInteger(expectedLength) || expectedLength < 1 || !binary.length) return null
      const alpha = new Uint8Array(expectedLength)
      let byteIndex = 1
      let outputIndex = 0
      let value = binary.charCodeAt(0) ? 255 : 0
      while (byteIndex < binary.length && outputIndex < expectedLength) {
        let runLength = 0
        let shift = 0
        let byte
        do {
          if (byteIndex >= binary.length || shift > 28) return null
          byte = binary.charCodeAt(byteIndex++)
          runLength |= (byte & 0x7f) << shift
          shift += 7
        } while (byte & 0x80)
        if (runLength < 1 || outputIndex + runLength > expectedLength) return null
        alpha.fill(value, outputIndex, outputIndex + runLength)
        outputIndex += runLength
        value = value ? 0 : 255
      }
      return outputIndex === expectedLength ? alpha : null
    }
    const alpha = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) alpha[index] = binary.charCodeAt(index)
    return alpha
  } catch {
    return null
  }
}
function normalizeEmblemMasks(masks, window) {
  const records = new Map()
  for (const mask of Array.isArray(masks) ? masks : []) {
    const width = Number(mask?.width)
    const height = Number(mask?.height)
    const alpha = decodeAlphaMask(mask?.alpha, window, mask?.encoding, width * height)
    if (!mask?.key || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) continue
    if (!alpha || alpha.length !== width * height) continue
    records.set(String(mask.key), {
      width,
      height,
      alpha,
      opticalScale: Number(mask.opticalScale) || 0.86,
      latticeHints: mask.latticeHints && typeof mask.latticeHints === 'object' ? mask.latticeHints : {},
    })
  }
  return records
}


function createAmbient(document) {
  const layer = document.createElement('div')
  layer.setAttribute('data-prts-ambient-layer', '')
  layer.setAttribute('aria-hidden', 'true')

  const glow = document.createElement('span')
  glow.setAttribute('data-prts-ambient-glow', '')
  layer.appendChild(glow)

  for (const side of ['left', 'right']) {
    const edge = document.createElement('span')
    edge.setAttribute('data-prts-ambient-edge', side)
    layer.appendChild(edge)
  }

  return { layer, glow }
}


export function createParticleFieldAdapter({ document, window, emblem = '', emblems = [], emblemMasks = [], heroEmblemMask, onStateChange = () => {} }) {
  const suppliedMasks = document && window ? normalizeEmblemMasks(emblemMasks, window) : new Map()
  const requestedEmblems = normalizeEmblems(emblems, emblem)
  const emblemSequence = requestedEmblems.filter(entry => suppliedMasks.has(entry.key))
  const missingEmblems = requestedEmblems.filter(entry => !suppliedMasks.has(entry.key))
  const rhodesIndex = Math.max(0, emblemSequence.findIndex(entry => entry.key === 'rhodes-island'))
  const suppliedHeroMask = normalizeEmblemMasks(heroEmblemMask ? [heroEmblemMask] : [], window).get('rhodes-island-hero')
  const empty = { mounted: false, hero: false, side: -1, transition: null, anchor: { horizontalProgress: 0, verticalProgress: 0 }, phase: 'error', error: '徽记资源异常' }
  if (!document || !window) return { update() {}, inspect: () => empty, dispose() {} }

  let preferences = {}
  let operation
  let scroller
  let ambient
  let glow
  let canvas
  let context
  let mutationObserver
  let mountFrame
  let resizeObserver
  let intersectionObserver
  let mediaQuery
  let mediaListener
  let frame
  let resizeFrame
  let resizeCommitFrame
  let resizeFinishFrame
  let resizeTimer
  let resizeRestoreTimer
  let pendingResizeSize
  const maskRecords = emblemSequence.map(entry => {
    const mask = suppliedMasks.get(entry.key)
    return {
      mask: { key: entry.key, width: mask.width, height: mask.height, alpha: mask.alpha, latticeHints: mask.latticeHints },
      opticalScale: mask.opticalScale,
    }
  })
  const heroMaskRecord = suppliedHeroMask ? {
    mask: {
      key: 'rhodes-island-hero',
      width: suppliedHeroMask.width,
      height: suppliedHeroMask.height,
      alpha: suppliedHeroMask.alpha,
      latticeHints: suppliedHeroMask.latticeHints,
    },
    opticalScale: suppliedHeroMask.opticalScale,
  } : maskRecords[rhodesIndex]
  const targetCache = new Map()
  let particles = []
  let pointerActive = false
  let pointerX = 0
  let pointerY = 0
  let pointerClientX = 0
  let pointerClientY = 0
  let width = 1
  let height = 1
  let dpr = 1
  let side = -1
  let segment = 0
  let transition
  let traversalOffset = 0
  let pendingSegment
  let transitionStartedAt
  let densityTransition
  let densityStartedAt
  let densityDebounce
  let queuedDensityCount
  let queuedTargetRefresh = false
  let geometryDirty = true
  let resizing = false
  let resizeObservations = 0
  let resizeCommits = 0
  let backingStoreCommits = 0
  let targetPrewarmHandle
  let targetPrewarmQueue = []
  let pauseStartedAt
  let hydrationPaused = false
  let hydrationTimer
  let hydrationFrame
  let hydrationStableFrames = 0
  let mutationBurstScore = 0
  let mutationBurstTimer
  let glowX = 0
  let glowY = 0
  let idleStableFrames = 0
  let heroMarker
  let heroActive = false
  let disposed = false
  let documentVisible = document.visibilityState !== 'hidden'
  let canvasVisible = true
  let stateReported = false
  let particleState = {
    phase: missingEmblems.length || !emblemSequence.length ? 'error' : 'preparing',
    requestedPattern: 'orthogonal',
    appliedPattern: null,
    error: missingEmblems.length || !emblemSequence.length ? '徽记资源异常' : null,
  }

  const motionReduced = () => preferences.motion === 'reduced' || Boolean(mediaQuery?.matches)
  const phoneStatic = () => window.innerWidth <= PHONE_BREAKPOINT
  const effectiveHeroDensity = density => {
    const requested = DENSITY_ORDER.indexOf(density)
    const minimum = DENSITY_ORDER.indexOf(HERO_MINIMUM_DENSITY)
    return requested < minimum ? HERO_MINIMUM_DENSITY : density
  }
  const activeDensity = () => heroActive
    ? effectiveHeroDensity(preferences.heroParticleDensity)
    : preferences.conversationParticleDensity
  const densityProfile = density => PARTICLE_DENSITY_PROFILES[density] ?? PARTICLE_DENSITY_PROFILES.standard
  const particleRadius = density => densityProfile(density ?? activeDensity()).radius
  const canRenderFrame = () => documentVisible && canvasVisible && !hydrationPaused && !resizing
  const layoutWidth = () => width
  const layoutHeight = () => height
  const layoutShiftX = () => 0

  function reportState(next) {
    const state = { ...particleState, ...next }
    if (missingEmblems.length || !emblemSequence.length) {
      state.phase = 'error'
      state.error = '徽记资源异常'
    }
    const changed = !stateReported || Object.keys(state).some(key => state[key] !== particleState[key])
    particleState = state
    stateReported = true
    if (changed) onStateChange({ ...particleState })
  }

  function sequenceIndexForSegment(segmentValue) {
    const length = Math.max(1, emblemSequence.length)
    return ((segmentValue % length) + length) % length
  }

  function emblemForSegment(segmentValue) {
    return emblemSequence[sequenceIndexForSegment(segmentValue)] ?? emblemSequence[0]
  }

  function targetsForIndex(index, density = 'standard') {
    const key = `${index}:${density}`
    const cached = targetCache.get(key)
    if (cached) return cached
    const record = maskRecords[index]
    const targets = record ? createOrthogonalTargets(record.mask, density) : []
    if (!targets.length) return []
    targetCache.set(key, targets)
    return targets
  }

  function targetsForSegment(segmentValue, density = preferences.conversationParticleDensity) {
    return targetsForIndex(sequenceIndexForSegment(segmentValue), density)
  }

  function heroEmblem() {
    return emblemSequence[rhodesIndex] ?? emblemSequence[0]
  }

  function targetsForHero(density = preferences.heroParticleDensity) {
    const effectiveDensity = effectiveHeroDensity(density)
    const key = `hero:${effectiveDensity}`
    const cached = targetCache.get(key)
    if (cached) return cached
    const targets = heroMaskRecord ? createOrthogonalTargets(heroMaskRecord.mask, effectiveDensity) : []
    if (targets.length) targetCache.set(key, targets)
    return targets
  }

  function populationSource(density = activeDensity()) {
    return heroActive ? targetsForHero(density) : targetsForSegment(segment, density)
  }

  function targetParticleCount(density = activeDensity()) {
    return populationSource(density).length
  }

  function heroLogoSizeFor(fieldWidth, fieldHeight) {
    const viewportWidth = Number(window.innerWidth) || fieldWidth
    const viewportHeight = Number(window.innerHeight) || fieldHeight
    const phoneSize = Math.min(viewportWidth * 0.58, 240)
    const tabletSize = Math.min(fieldWidth * 0.4, 420)
    const desktopSize = clamp(fieldWidth * 0.42, 320, 580)
    const phoneToTablet = clamp((viewportWidth - 560) / 160, 0, 1)
    const tabletToDesktop = clamp((viewportWidth - 960) / 128, 0, 1)
    let size = interpolate(phoneSize, tabletSize, phoneToTablet)
    size = interpolate(size, desktopSize, tabletToDesktop)
    size = Math.min(size, viewportHeight * 0.42)
    return Math.max(1, Math.min(size, fieldWidth * 0.9))
  }

  function heroLogoSize() {
    return heroLogoSizeFor(layoutWidth(), layoutHeight())
  }

  function heroCenterFor(fieldWidth, fieldHeight, shiftX = 0) {
    const size = heroLogoSizeFor(fieldWidth, fieldHeight)
    const operationRect = operation?.getBoundingClientRect?.() ?? { top: 0 }
    const scrollerRect = scroller?.getBoundingClientRect?.() ?? { top: operationRect.top }
    const composer = scroller?.querySelector?.('[data-composer-seat]')
    const composerRect = composer?.getBoundingClientRect?.()
    let paddingTop = 0
    let reserved = size + 44
    try {
      paddingTop = Number.parseFloat(window.getComputedStyle(scroller).paddingTop) || 0
      if (!/jsdom/i.test(window.navigator?.userAgent || '')) {
        const pseudo = window.getComputedStyle(scroller, '::before')
        reserved = Number.parseFloat(pseudo?.marginTop) || reserved
      }
    } catch {}
    const minY = Math.max(12, scrollerRect.top - operationRect.top + 12)
    const recordTop = scrollerRect.top - operationRect.top + paddingTop + reserved
    const composerLimit = composerRect ? composerRect.top - operationRect.top - 40 : fieldHeight - 40
    const maxCenter = Math.max(minY + size / 2, composerLimit - size / 2)
    return {
      x: fieldWidth * 0.5 + shiftX,
      y: clamp(recordTop - 22 - size / 2, minY + size / 2, maxCenter),
    }
  }

  function heroCenter() {
    return heroCenterFor(layoutWidth(), layoutHeight(), layoutShiftX())
  }

  function currentLayout() {
    if (transition?.fromHero) {
      const progress = easeInOut(transition.progress)
      const to = centerFromAnchor(anchorFor(transition.toSide, 0))
      return {
        center: {
          x: transition.fromCenter.x + (to.x - transition.fromCenter.x) * progress,
          y: transition.fromCenter.y + (to.y - transition.fromCenter.y) * progress,
        },
        size: transition.fromSize + (logoSize() - transition.fromSize) * progress,
      }
    }
    if (heroActive) return { center: heroCenter(), size: heroLogoSize() }
    return { center: centerFromAnchor(inspectAnchor()), size: logoSize() }
  }


  function particleTraversalSpeed(value = preferences) {
    const numeric = Number(value?.particleTraversalSpeed)
    return Number.isFinite(numeric) ? clamp(numeric, 0, 2) : 1
  }

  function currentScrollTop() {
    return Number(scroller?.scrollTop) || 0
  }

  function traversalViewport() {
    return Math.max(1, Number(scroller?.clientHeight) || height)
  }

  function traversalCoordinate(value = preferences) {
    return traversalOffset + currentScrollTop() * particleTraversalSpeed(value) / traversalViewport()
  }

  function scrollProgress() {
    if (!scroller) return 0
    const coordinate = traversalCoordinate()
    return coordinate - Math.floor(coordinate)
  }

  function restoreTraversalFromScroll() {
    traversalOffset = 0
    const coordinate = traversalCoordinate()
    segment = Math.floor(coordinate)
    side = sideForSegment(segment)
    pendingSegment = undefined
    transition = undefined
    transitionStartedAt = undefined
  }

  function reanchorTraversal(coordinate = traversalCoordinate()) {
    if (transition) {
      const targetSegment = transition.targetSegment
      side = sideForSegment(targetSegment)
      transition = undefined
      transitionStartedAt = undefined
      commitTransitionTargets(targetSegment, true)
    }
    pendingSegment = undefined
    traversalOffset = coordinate - currentScrollTop() * particleTraversalSpeed() / traversalViewport()
    if (particles.length) snapParticlesToCurrentLayout()
  }

  function anchorFor(sideValue, verticalProgress) {
    if (phoneStatic()) return { horizontalProgress: 0.5, verticalProgress: 0.52 }
    return {
      horizontalProgress: sideValue < 0 ? 0.28 : 0.72,
      verticalProgress: clamp(verticalProgress, 0, 1),
    }
  }

  function inspectAnchor() {
    if (heroActive) {
      const center = heroCenter()
      return { horizontalProgress: 0.5, verticalProgress: clamp(center.y / Math.max(1, layoutHeight()), 0, 1) }
    }
    if (transition?.fromHero) {
      const progress = easeInOut(transition.progress)
      const to = centerFromAnchor(anchorFor(transition.toSide, 0))
      return {
        horizontalProgress: (transition.fromCenter.x + (to.x - transition.fromCenter.x) * progress) / Math.max(1, layoutWidth()),
        verticalProgress: (transition.fromCenter.y + (to.y - transition.fromCenter.y) * progress) / Math.max(1, layoutHeight()),
      }
    }
    if (!transition || motionReduced() || phoneStatic()) {
      return anchorFor(side, motionReduced() ? 0 : scrollProgress())
    }
    const down = transition.direction > 0
    const from = anchorFor(transition.fromSide, down ? 1 : 0)
    const to = anchorFor(transition.toSide, down ? 0 : 1)
    const progress = easeInOut(transition.progress)
    return {
      horizontalProgress: from.horizontalProgress + (to.horizontalProgress - from.horizontalProgress) * progress,
      verticalProgress: from.verticalProgress + (to.verticalProgress - from.verticalProgress) * progress,
    }
  }

  function centerFromAnchorFor(anchor, fieldWidth, fieldHeight, shiftX = 0) {
    if (phoneStatic()) return { x: fieldWidth * 0.5 + shiftX, y: fieldHeight * 0.52 }
    return {
      x: fieldWidth * anchor.horizontalProgress + shiftX,
      y: fieldHeight * (0.54 - anchor.verticalProgress * 0.34),
    }
  }

  function centerFromAnchor(anchor) {
    return centerFromAnchorFor(anchor, layoutWidth(), layoutHeight(), layoutShiftX())
  }

  function logoSizeFor(fieldWidth) {
    if (phoneStatic()) return Math.min(fieldWidth * 0.72, 250)
    if (fieldWidth <= TABLET_BREAKPOINT) return Math.min(fieldWidth * 0.31, 230)
    return clamp(fieldWidth * 0.23, 230, 320)
  }

  function logoSize() {
    return logoSizeFor(layoutWidth())
  }

  function createParticle(target, center, size, random, density = activeDensity()) {
    return {
      target,
      kind: target.kind || 'fill',
      fromKind: target.kind || 'fill',
      toKind: target.kind || 'fill',
      fromTarget: target,
      toTarget: target,
      x: center.x + target.x * size,
      y: center.y + target.y * size,
      vx: 0,
      vy: 0,
      size: particleRadius(density),
      scatterX: (random() - 0.5) * 2,
      scatterY: (random() - 0.5) * 2,
      gatherX: (random() - 0.5) * 2,
      gatherY: (random() - 0.5) * 2,
    }
  }
  function cancelTargetPrewarm() {
    if (targetPrewarmHandle !== undefined) window.cancelIdleCallback?.(targetPrewarmHandle)
    targetPrewarmHandle = undefined
    targetPrewarmQueue = []
  }

  function scheduleTargetPrewarm() {
    cancelTargetPrewarm()
    if (typeof window.requestIdleCallback !== 'function' || !particles.length) return
    targetPrewarmQueue = emblemSequence.map((_, index) => index)
      .filter(index => index !== sequenceIndexForSegment(segment))
    const warmNext = () => {
      targetPrewarmHandle = undefined
      if (!canvas?.isConnected || disposed) {
        targetPrewarmQueue = []
        return
      }
      const index = targetPrewarmQueue.shift()
      if (index !== undefined) targetsForIndex(index, preferences.conversationParticleDensity)
      if (targetPrewarmQueue.length) {
        targetPrewarmHandle = window.requestIdleCallback(warmNext, { timeout: 800 })
      }
    }
    if (targetPrewarmQueue.length) {
      targetPrewarmHandle = window.requestIdleCallback(warmNext, { timeout: 800 })
    }
  }

  function buildParticles() {
    const selected = populationSource()
    if (!selected.length) {
      reportState({ phase: 'error', error: '徽记资源异常' })
      return false
    }
    const random = seededRandom(0x50525453)
    const { center, size } = currentLayout()
    particles = selected.map(target => createParticle(target, center, size, random))
    reportState({ phase: 'applied', appliedPattern: 'orthogonal', error: null })
    scheduleTargetPrewarm()
    return true
  }

  function reconcileParticlePopulation(nextCount) {
    const count = Math.max(1, Math.round(nextCount))
    if (count === particles.length) return
    if (count < particles.length) {
      particles.length = count
      return
    }
    const availableTargets = populationSource()
    const currentTargets = availableTargets.slice(0, count)
    const transitionTargets = transition
      ? targetsForSegment(transition.targetSegment).slice(0, count)
      : currentTargets
    const nextTargets = transitionTargets.length === count ? transitionTargets : currentTargets
    const random = seededRandom(0x50525453 + particles.length)
    const { center, size } = currentLayout()
    for (let index = particles.length; index < count; index += 1) {
      const particle = createParticle(currentTargets[index], center, size, random)
      particle.fromTarget = currentTargets[index]
      particle.fromKind = currentTargets[index]?.kind || 'fill'
      particle.toKind = nextTargets[index]?.kind || 'fill'
      particle.toTarget = nextTargets[index]
      particles.push(particle)
    }
  }

  function completeDensityReassembly() {
    if (!densityTransition) return
    const targetCount = densityTransition.to
    particles.length = targetCount
    particles.forEach(particle => {
      particle.size = densityTransition.toRadius
      particle.target = particle.densityToTarget
      particle.kind = particle.densityToKind || particle.densityToTarget?.kind || 'fill'
      particle.fromTarget = particle.target
      particle.toTarget = particle.target
      particle.fromKind = particle.kind
      particle.toKind = particle.kind
      delete particle.densityFromTarget
      delete particle.densityToTarget
      delete particle.densityFromKind
      delete particle.densityToKind
      delete particle.densityScatterX
      delete particle.densityScatterY
      delete particle.existedBeforeDensity
      delete particle.existsAfterDensity
      delete particle.densityDelay
    })
    densityTransition = undefined
    densityStartedAt = undefined
    reportState({ phase: 'applied', appliedPattern: 'orthogonal', error: null })
    const queuedSegment = pendingSegment
    pendingSegment = undefined
    if (queuedSegment !== undefined && queuedSegment !== segment) {
      startTransition(queuedSegment)
      return
    }
    const queued = queuedDensityCount
    const force = queuedTargetRefresh
    queuedDensityCount = undefined
    queuedTargetRefresh = false
    if (queued !== undefined && (queued !== particles.length || force)) startDensityReassembly(queued, force)
  }

  function startDensityReassembly(nextCount, force = false) {
    const baseNextTargets = populationSource()
    const targetCount = baseNextTargets.length
    if (!targetCount) {
      reportState({ phase: 'error', error: '徽记资源异常' })
      return
    }
    if (!particles.length) {
      buildParticles()
      return
    }
    if (transition || densityTransition) {
      queuedDensityCount = targetCount
      queuedTargetRefresh ||= force
      return
    }
    if (targetCount === particles.length && !force) return

    const fromCount = particles.length
    const workingCount = Math.max(fromCount, targetCount)
    const random = seededRandom(stableHash((heroActive ? heroEmblem() : emblemForSegment(segment))?.key) ^ targetCount)
    const { center, size } = currentLayout()
    const nextTargets = baseNextTargets
    for (let index = 0; index < workingCount; index += 1) {
      let particle = particles[index]
      const nextTarget = nextTargets[index]
      if (!particle) {
        particle = createParticle(nextTarget, center, size, random)
        particles.push(particle)
      }
      particle.densityFromTarget = particle.target
      particle.densityToTarget = nextTarget ?? particle.target
      particle.densityFromKind = particle.kind || particle.target?.kind || 'fill'
      particle.densityToKind = nextTarget?.kind || particle.densityFromKind
      particle.densityScatterX = (random() - 0.5) * 2
      particle.densityScatterY = (random() - 0.5) * 2
      particle.existedBeforeDensity = index < fromCount
      particle.existsAfterDensity = index < targetCount
      particle.densityDelay = 0
    }
    densityTransition = {
      from: fromCount,
      to: targetCount,
      duration: motionReduced() || phoneStatic() ? DENSITY_CROSSFADE_MS : DENSITY_REASSEMBLY_MS,
      mode: motionReduced() || phoneStatic() ? 'crossfade' : 'reassemble',
      layout: false,
      fromRadius: particles[0]?.size ?? particleRadius(),
      toRadius: particleRadius(),
      progress: 0,
    }
    densityStartedAt = undefined
    pointerActive = false
    reportState({ phase: 'reassembling', requestedPattern: 'orthogonal', error: null })
    scheduleFrame()
  }

  function scheduleDensityReassembly(nextCount, force = false) {
    if (densityDebounce !== undefined) window.clearTimeout?.(densityDebounce)
    reportState({ phase: 'preparing', requestedPattern: 'orthogonal', error: null })
    densityDebounce = window.setTimeout?.(() => {
      densityDebounce = undefined
      if (transition || densityTransition) {
        queuedDensityCount = nextCount
        queuedTargetRefresh ||= force
      } else startDensityReassembly(nextCount, force)
    }, DENSITY_DEBOUNCE_MS)
  }

  function advanceDensity(timestamp) {
    if (!densityTransition) return
    densityStartedAt ??= timestamp
    densityTransition.progress = clamp((timestamp - densityStartedAt) / densityTransition.duration, 0, 1)
    if (densityTransition.progress >= 1) completeDensityReassembly()
  }

  function densityAlpha(particle) {
    if (!densityTransition) return 1
    const progress = densityTransition.progress
    if (densityTransition.mode === 'crossfade') {
      let alpha
      if (!particle.existedBeforeDensity) alpha = progress < 0.5 ? 0 : easeOut((progress - 0.5) * 2)
      else if (!particle.existsAfterDensity) alpha = 1 - easeOut(Math.min(1, progress * 2))
      else alpha = progress < 0.5 ? 1 - easeOut(progress * 2) : easeOut((progress - 0.5) * 2)
      return alpha
    }
    if (!particle.existedBeforeDensity) return progress < 0.28 ? 0 : easeOut((progress - 0.28) / 0.72)
    if (!particle.existsAfterDensity) return 1 - easeOut(progress / 0.46)
    return progress < 0.28
      ? 1 - easeOut(progress / 0.28) * 0.7
      : 0.3 + easeOut((progress - 0.28) / 0.72) * 0.7
  }

  function prepareTransitionTargets(targetSegment) {
    const targetDensity = preferences.conversationParticleDensity
    const selected = targetsForSegment(targetSegment, targetDensity)
    if (!selected.length) return { fromCount: particles.length, toCount: 0 }
    const fromCount = particles.length
    const toCount = selected.length
    const workingCount = Math.max(fromCount, toCount)
    const random = seededRandom(stableHash('transition:' + targetSegment + ':' + activeDensity()))
    const { center, size } = currentLayout()
    for (let index = 0; index < workingCount; index += 1) {
      let particle = particles[index]
      const nextTarget = selected[index] ?? selected[index % toCount]
      if (!particle) {
        const source = particles[index % Math.max(1, fromCount)]?.target ?? nextTarget
        particle = createParticle(source, center, size, random, preferences.conversationParticleDensity)
        particles.push(particle)
      }
      particle.fromTarget = particle.target
      particle.fromKind = particle.kind || particle.target?.kind || 'fill'
      particle.toKind = nextTarget?.kind || 'fill'
      particle.toTarget = nextTarget
      particle.existedBeforeTransition = index < fromCount
      particle.existsAfterTransition = index < toCount
    }
    return {
      fromCount,
      toCount,
      fromRadius: particles[0]?.size ?? particleRadius(),
      toRadius: particleRadius(targetDensity),
      targetDensity,
    }
  }

  function commitTransitionTargets(targetSegment, snap = false, density = preferences.conversationParticleDensity) {
    const selected = targetsForSegment(targetSegment, density)
    if (!selected.length) return
    segment = targetSegment
    const { center, size } = currentLayout()
    const random = seededRandom(stableHash('commit:' + targetSegment + ':' + activeDensity()))
    if (particles.length > selected.length) particles.length = selected.length
    while (particles.length < selected.length) {
      particles.push(createParticle(selected[particles.length], center, size, random, density))
    }
    particles.forEach((particle, index) => {
      const target = selected[index]
      particle.size = particleRadius(density)
      particle.target = target
      particle.kind = target.kind || 'fill'
      particle.fromTarget = target
      particle.fromKind = particle.kind
      particle.toTarget = target
      particle.toKind = particle.kind
      delete particle.existedBeforeTransition
      delete particle.existsAfterTransition
      if (snap) {
        particle.x = center.x + target.x * size
        particle.y = center.y + target.y * size
        particle.vx = 0
        particle.vy = 0
      }
    })
    scheduleTargetPrewarm()
  }

  function clearDensityMetadata() {
    particles.forEach(particle => {
      delete particle.densityFromTarget
      delete particle.densityToTarget
      delete particle.densityFromKind
      delete particle.densityToKind
      delete particle.densityScatterX
      delete particle.densityScatterY
      delete particle.densityDelay
      delete particle.existedBeforeDensity
      delete particle.existsAfterDensity
    })
    densityTransition = undefined
    densityStartedAt = undefined
  }


  function syncCanvasBackingStore() {
    if (!canvas) return
    const nextDpr = Math.min(Number(window.devicePixelRatio) || 1, 1.5)
    const pixelWidth = Math.round(width * nextDpr)
    const pixelHeight = Math.round(height * nextDpr)
    const changed = canvas.width !== pixelWidth || canvas.height !== pixelHeight || dpr !== nextDpr
    dpr = nextDpr
    if (!changed) return
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight
    context?.setTransform(nextDpr, 0, 0, nextDpr, 0, 0)
    backingStoreCommits += 1
    return true
  }

  function projectPointerFromClient() {
    if (!pointerActive || !canvas) return
    const rect = canvas.getBoundingClientRect?.() ?? {}
    const rectWidth = Math.max(1, Number(rect.width) || width)
    const rectHeight = Math.max(1, Number(rect.height) || height)
    pointerX = (pointerClientX - (Number(rect.left) || 0)) * width / rectWidth
    pointerY = (pointerClientY - (Number(rect.top) || 0)) * height / rectHeight
  }

  function sizeFromRect(rect = {}) {
    return {
      width: Math.max(1, Number(rect.width) || Number(operation?.clientWidth) || Number(window.innerWidth) || 1),
      height: Math.max(1, Number(rect.height) || Number(operation?.clientHeight) || Number(window.innerHeight) || 1),
    }
  }

  function readOperationSize() {
    const rect = operation.getBoundingClientRect?.() ?? {}
    return sizeFromRect(rect)
  }

  function applyFieldSize(nextSize) {
    const nextWidth = nextSize?.width ?? width
    const nextHeight = nextSize?.height ?? height
    const changed = nextWidth !== width || nextHeight !== height
    width = nextWidth
    height = nextHeight
    projectPointerFromClient()
    geometryDirty ||= changed
    return changed
  }

  function clearResizeTimers() {
    if (resizeFrame !== undefined) {
      window.cancelAnimationFrame?.(resizeFrame)
      window.clearTimeout?.(resizeFrame)
    }
    for (const pendingFrame of [resizeCommitFrame, resizeFinishFrame]) {
      if (pendingFrame === undefined) continue
      window.cancelAnimationFrame?.(pendingFrame)
      window.clearTimeout?.(pendingFrame)
    }
    if (resizeTimer !== undefined) window.clearTimeout?.(resizeTimer)
    if (resizeRestoreTimer !== undefined) window.clearTimeout?.(resizeRestoreTimer)
    resizeFrame = undefined
    resizeCommitFrame = undefined
    resizeFinishFrame = undefined
    resizeTimer = undefined
    resizeRestoreTimer = undefined
  }

  function clearResizeState() {
    clearResizeTimers()
    pendingResizeSize = undefined
    resizing = false
    setParticleResizeState('data-prts-resizing', false)
    setParticleResizeState('data-prts-resize-restoring', false)
  }

  function setParticleResizeState(attribute, active) {
    for (const node of [canvas, ambient]) {
      if (!node || node.hasAttribute(attribute) === active) continue
      node.toggleAttribute(attribute, active)
    }
  }

  function resumePausedTimelines(timestamp) {
    if (pauseStartedAt === undefined) return
    const pausedFor = Math.max(0, timestamp - pauseStartedAt)
    if (transitionStartedAt !== undefined) transitionStartedAt += pausedFor
    if (densityStartedAt !== undefined) densityStartedAt += pausedFor
    pauseStartedAt = undefined
  }

  function requestResizeFrame(callback) {
    return window.requestAnimationFrame?.(callback) ?? window.setTimeout?.(() => callback(Number(window.performance?.now?.()) || 0), 16)
  }

  function restoreResizeTransaction() {
    resizeFinishFrame = undefined
    resizing = false
    setParticleResizeState('data-prts-resizing', false)
    setParticleResizeState('data-prts-resize-restoring', true)
    resizeRestoreTimer = window.setTimeout?.(() => {
      resizeRestoreTimer = undefined
      setParticleResizeState('data-prts-resize-restoring', false)
    }, RESIZE_RESTORE_MS)
    updateFrameGate()
  }

  function paintResizeCommit(timestamp) {
    resizeCommitFrame = undefined
    if (!operation || !canvas) {
      clearResizeState()
      return
    }
    resumePausedTimelines(Number(timestamp) || Number(window.performance?.now?.()) || 0)
    syncCanvasBackingStore()
    geometryDirty = false
    resizing = false
    cancelFrame()
    draw(Number(timestamp) || Number(window.performance?.now?.()) || 0)
    cancelFrame()
    resizing = true
    resizeFinishFrame = requestResizeFrame(restoreResizeTransaction)
  }

  function finishResizeTransaction() {
    resizeTimer = undefined
    if (!operation || !canvas) {
      clearResizeState()
      return
    }
    const finalSize = pendingResizeSize ?? readOperationSize()
    pendingResizeSize = undefined
    const changed = applyFieldSize(finalSize)
    if (changed && particles.length) snapParticlesToCurrentLayout()
    resizeCommits += changed ? 1 : 0
    const { center } = currentLayout()
    if (!glowX && !glowY) {
      glowX = center.x
      glowY = center.y
    }
    resizeCommitFrame = requestResizeFrame(paintResizeCommit)
  }

  function enterResizeFreeze() {
    if (resizing) return
    resizing = true
    pointerActive = false
    setParticleResizeState('data-prts-resize-restoring', false)
    setParticleResizeState('data-prts-resizing', true)
    updateFrameGate()
  }

  function beginResizeTransaction(nextSize) {
    if (!operation || !canvas) return
    pendingResizeSize = nextSize ?? pendingResizeSize ?? readOperationSize()
    if (!resizing && pendingResizeSize.width === width && pendingResizeSize.height === height) {
      pendingResizeSize = undefined
      return
    }
    enterResizeFreeze()
    if (resizeTimer !== undefined) window.clearTimeout?.(resizeTimer)
    resizeTimer = window.setTimeout?.(finishResizeTransaction, RESIZE_SETTLE_MS)
  }

  function onOperationResize(entries = []) {
    if (!operation || !canvas) return
    resizeObservations += 1
    const entry = entries.find(candidate => candidate.target === operation) ?? entries[0]
    const contentRect = entry?.contentRect
    pendingResizeSize = contentRect ? sizeFromRect(contentRect) : readOperationSize()
    if (resizeFrame !== undefined) return
    resizeFrame = window.requestAnimationFrame?.(() => {
      resizeFrame = undefined
      beginResizeTransaction(pendingResizeSize)
    }) ?? window.setTimeout?.(() => {
      resizeFrame = undefined
      beginResizeTransaction(pendingResizeSize)
    }, 0)
    if (!resizing && (pendingResizeSize.width !== width || pendingResizeSize.height !== height)) {
      enterResizeFreeze()
    }
    if (!resizing) return
  }

  function initializeFieldSize() {
    const changed = applyFieldSize(readOperationSize())
    const { center } = currentLayout()
    if (!glowX && !glowY) {
      glowX = center.x
      glowY = center.y
    }
    return changed
  }

  function targetPosition(particle, frameGeometry) {
    if (densityTransition) {
      const { center, size } = frameGeometry.activeLayout
      const fromTarget = particle.densityFromTarget ?? particle.target
      const toTarget = particle.densityToTarget ?? particle.target
      const fromX = center.x + fromTarget.x * size
      const fromY = center.y + fromTarget.y * size
      const toX = center.x + toTarget.x * size
      const toY = center.y + toTarget.y * size
      const progress = densityTransition.progress
      if (densityTransition.mode === 'crossfade') {
        return progress < 0.5
          ? { x: fromX, y: fromY, accent: 0 }
          : { x: toX, y: toY, accent: 0 }
      }
      const breakPoint = 0.28
      const scatterX = fromX + particle.densityScatterX * size * 0.34
      const scatterY = fromY + particle.densityScatterY * size * 0.28
      if (progress < breakPoint) {
        const local = easeOut(progress / breakPoint)
        return {
          x: fromX + (scatterX - fromX) * local,
          y: fromY + (scatterY - fromY) * local,
          accent: local * 0.42,
        }
      }
      const local = easeInOut((progress - breakPoint) / (1 - breakPoint))
      return {
        x: scatterX + (toX - scatterX) * local,
        y: scatterY + (toY - scatterY) * local,
        accent: (1 - local) * 0.42,
      }
    }
    if (!transition || frameGeometry.staticField) {
      const { center, size } = frameGeometry.activeLayout
      return { x: center.x + particle.target.x * size, y: center.y + particle.target.y * size, accent: 0 }
    }

    const { from, to, fromSize, toSize } = frameGeometry.transitionLayout
    const fromX = from.x + particle.fromTarget.x * fromSize
    const fromY = from.y + particle.fromTarget.y * fromSize
    const toX = to.x + particle.toTarget.x * toSize
    const toY = to.y + particle.toTarget.y * toSize
    const progress = transition.progress

    if (progress < 0.36) {
      const local = easeOut(progress / 0.36)
      return {
        x: fromX + particle.scatterX * width * 0.46 * local,
        y: fromY + particle.scatterY * height * 0.38 * local,
        accent: local * 0.45,
      }
    }
    if (progress < 0.7) {
      const local = easeInOut((progress - 0.36) / 0.34)
      const startX = fromX + particle.scatterX * width * 0.46
      const startY = fromY + particle.scatterY * height * 0.38
      const endX = toX + particle.gatherX * width * 0.32
      const endY = toY + particle.gatherY * height * 0.28
      return {
        x: startX + (endX - startX) * local,
        y: startY + (endY - startY) * local + Math.sin(local * Math.PI) * particle.scatterY * 44,
        accent: 0.45 + Math.sin(local * Math.PI) * 0.55,
      }
    }
    const local = easeInOut((progress - 0.7) / 0.3)
    return {
      x: toX + particle.gatherX * width * 0.32 * (1 - local),
      y: toY + particle.gatherY * height * 0.28 * (1 - local),
      accent: 1 - local,
    }
  }

  function transitionAlpha(particle) {
    if (!transition) return 1
    if (!particle.existedBeforeTransition) {
      return easeOut(clamp((transition.progress - 0.42) / 0.58, 0, 1))
    }
    if (!particle.existsAfterTransition) {
      return 1 - easeOut(clamp(transition.progress / 0.58, 0, 1))
    }
    return 1
  }

  function particleColor(accent, lightScheme) {
    const base = lightScheme ? [41, 49, 46] : [238, 246, 242]
    const cyan = lightScheme ? [0, 142, 156] : [32, 213, 227]
    return base.map((value, index) => Math.round(value + (cyan[index] - value) * accent))
  }

  function completeTransition() {
    const completed = transition
    side = completed.toSide
    transition = undefined
    transitionStartedAt = undefined
    commitTransitionTargets(completed.targetSegment, false, completed.targetDensity)
    const queued = pendingSegment
    pendingSegment = undefined
    if (queued !== undefined && queued !== segment) {
      if (sideForSegment(queued) !== side) {
        startTransition(queued)
        return
      }
      commitTransitionTargets(queued)
    }
    const queuedDensity = queuedDensityCount
    const force = queuedTargetRefresh
    queuedDensityCount = undefined
    queuedTargetRefresh = false
    if (queuedDensity !== undefined && (queuedDensity !== particles.length || force)) startDensityReassembly(queuedDensity, force)
  }

  function draw(timestamp) {
    frame = undefined
    if (!ambient || !canvas) return
    if (!canRenderFrame()) return
    if (geometryDirty) {
      syncCanvasBackingStore()
      geometryDirty = false
    }
    if (transition) {
      transitionStartedAt ??= timestamp
      transition.progress = clamp((timestamp - transitionStartedAt) / TRANSITION_MS, 0, 1)
      if (transition.progress >= 1) completeTransition()
    }

    advanceDensity(timestamp)
    const reducedMotion = motionReduced()
    const staticPhone = phoneStatic()
    const staticField = reducedMotion || staticPhone
    const activeLayout = currentLayout()
    let transitionLayout
    if (transition && !staticField) {
      const down = transition.direction > 0
      transitionLayout = {
        from: transition.fromHero
          ? transition.fromCenter
          : centerFromAnchor(anchorFor(transition.fromSide, down ? 1 : 0)),
        to: centerFromAnchor(anchorFor(transition.toSide, transition.fromHero ? 0 : (down ? 0 : 1))),
        fromSize: transition.fromHero ? transition.fromSize : logoSize(),
        toSize: logoSize(),
      }
    }
    const frameGeometry = { activeLayout, staticField, transitionLayout }
    const { center, size: fieldSize } = activeLayout
    const follow = reducedMotion ? 1 : 0.035
    glowX += (center.x - glowX) * follow
    glowY += (center.y - glowY) * follow
    if (glow) glow.style.transform = 'translate3d(calc(' + glowX.toFixed(2) + 'px - 50%), calc(' + glowY.toFixed(2) + 'px - 50%), 0)'
    const glowDistance = Math.hypot(center.x - glowX, center.y - glowY)
    let maximumVelocity = 0

    if (context) {
      context.clearRect(0, 0, width, height)
      const heroPhysics = heroActive
      const pointerRadius = pointerRadiusForFieldSize(fieldSize)
      const spring = heroPhysics ? 0.029 : 0.034
      const damping = heroPhysics ? 0.86 : 0.84
      const pointerForce = heroPhysics ? 2.2 : 2.7
      const lightScheme = document.documentElement.dataset.prtsScheme === 'light'
      const baseAlpha = lightScheme ? 0.66 : 0.72
      const radiusScale = lightScheme ? 1.12 : 1
      const particleBatches = typeof context.moveTo === 'function' ? new Map() : null

      for (const particle of particles) {
        const target = targetPosition(particle, frameGeometry)
        if (staticField) {
          particle.x = target.x
          particle.y = target.y
          particle.vx = 0
          particle.vy = 0
        }
        if (!staticField) {
          particle.vx += (target.x - particle.x) * spring
          particle.vy += (target.y - particle.y) * spring

          if (pointerActive && !transition) {
            const dx = particle.x - pointerX
            const dy = particle.y - pointerY
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared < pointerRadius * pointerRadius && distanceSquared > 1) {
              const distance = Math.sqrt(distanceSquared)
              const force = Math.pow(1 - distance / pointerRadius, 2) * pointerForce
              particle.vx += dx / distance * force
              particle.vy += dy / distance * force
            }
          }

          particle.vx *= damping
          particle.vy *= damping
          particle.x += particle.vx
          particle.y += particle.vy
        }
        maximumVelocity = Math.max(maximumVelocity, Math.abs(particle.vx), Math.abs(particle.vy))
        const alpha = clamp(
          baseAlpha * densityAlpha(particle) * transitionAlpha(particle),
          0,
          1,
        )
        const color = particleColor(target.accent, lightScheme)
        const fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')'
        const densityRadius = densityTransition
          ? interpolate(densityTransition.fromRadius, densityTransition.toRadius, easeInOut(densityTransition.progress))
          : particle.size
        const transitionRadius = transition
          ? interpolate(transition.fromRadius ?? densityRadius, transition.toRadius ?? densityRadius, easeInOut(transition.progress))
          : densityRadius
        const radius = transitionRadius * radiusScale
        if (particleBatches) {
          const points = particleBatches.get(fillStyle) ?? []
          points.push(particle.x, particle.y, radius)
          particleBatches.set(fillStyle, points)
        } else {
          context.fillStyle = fillStyle
          context.beginPath()
          context.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
          context.fill()
        }
      }
      if (particleBatches) {
        for (const [fillStyle, points] of particleBatches) {
          context.fillStyle = fillStyle
          context.beginPath()
          for (let index = 0; index < points.length; index += 3) {
            context.moveTo(points[index] + points[index + 2], points[index + 1])
            context.arc(points[index], points[index + 1], points[index + 2], 0, Math.PI * 2)
          }
          context.fill()
        }
      }
    }
    if (!canvas.hasAttribute('data-prts-particle-ready')) {
      canvas.setAttribute('data-prts-particle-ready', '')
      canvas.style.visibility = ''
    }
    const explicitMotion = Boolean(densityTransition || transition)
    const animatedField = !staticField && context && particles.length
    if (explicitMotion) {
      idleStableFrames = 0
    } else if (animatedField) {
      if (maximumVelocity <= IDLE_SETTLE_SPEED && glowDistance <= IDLE_SETTLE_GLOW_DISTANCE) {
        idleStableFrames += 1
      } else {
        idleStableFrames = 0
      }
    } else {
      idleStableFrames = 0
    }
    if (!disposed && (explicitMotion || (animatedField && idleStableFrames < IDLE_SETTLE_FRAMES))) scheduleFrame()
  }

  function scheduleFrame() {
    if (frame !== undefined || disposed || !canRenderFrame()) return
    frame = window.requestAnimationFrame?.(draw)
  }

  function cancelFrame() {
    if (frame !== undefined) window.cancelAnimationFrame?.(frame)
    frame = undefined
  }

  function startTransition(targetSegment) {
    if (densityTransition) {
      pendingSegment = targetSegment
      return
    }
    const targetSide = sideForSegment(targetSegment)
    const direction = targetSegment > segment ? 1 : -1
    if (targetSide === side || motionReduced() || phoneStatic()) {
      side = targetSide
      transition = undefined
      transitionStartedAt = undefined
      commitTransitionTargets(targetSegment, motionReduced() || phoneStatic())
      return
    }
    const population = prepareTransitionTargets(targetSegment)
    if (!population.toCount) {
      reportState({ phase: 'error', error: '徽记资源异常' })
      return
    }
    transition = {
      ...population,
      fromSide: side,
      toSide: targetSide,
      direction,
      targetSegment,
      progress: 0,
    }
    transitionStartedAt = undefined
    pointerActive = false
    scheduleFrame()
  }

  function retargetTransition(targetSegment) {
    if (!transition || targetSegment === transition.targetSegment) return
    const population = prepareTransitionTargets(targetSegment)
    if (!population.toCount) {
      reportState({ phase: 'error', error: '徽记资源异常' })
      return
    }
    transition = {
      ...transition,
      ...population,
      toSide: sideForSegment(targetSegment),
      direction: targetSegment >= segment ? 1 : -1,
      targetSegment,
    }
    pendingSegment = undefined
  }

  function resetTraversal() {
    side = -1
    segment = 0
    traversalOffset = -currentScrollTop() * particleTraversalSpeed() / traversalViewport()
    pendingSegment = undefined
    queuedDensityCount = undefined
    queuedTargetRefresh = false
    densityTransition = undefined
    densityStartedAt = undefined
    if (densityDebounce !== undefined) window.clearTimeout?.(densityDebounce)
    densityDebounce = undefined
    transition = undefined
    transitionStartedAt = undefined
    pointerActive = false
    glowX = 0
    glowY = 0
    if (maskRecords.length) buildParticles()
  }

  function enterHero(marker) {
    heroMarker = marker
    heroActive = true
    scroller?.setAttribute('data-prts-hero-active', '')
    resetTraversal()
    scheduleFrame()
  }

  function leaveHero() {
    const fromCenter = heroCenter()
    const fromSize = heroLogoSize()
    heroMarker = undefined
    heroActive = false
    scroller?.removeAttribute('data-prts-hero-active')
    side = -1
    segment = 0
    traversalOffset = -currentScrollTop() * particleTraversalSpeed() / traversalViewport()
    pendingSegment = undefined
    queuedDensityCount = undefined
    queuedTargetRefresh = false
    if (densityDebounce !== undefined) window.clearTimeout?.(densityDebounce)
    densityDebounce = undefined
    densityTransition = undefined
    densityStartedAt = undefined
    if (motionReduced() || phoneStatic() || !particles.length) {
      resetTraversal()
      commitTransitionTargets(0, true)
      return
    }
    const population = prepareTransitionTargets(0)
    transition = {
      ...population,
      fromHero: true,
      fromCenter,
      fromSize,
      fromSide: -1,
      toSide: -1,
      direction: 1,
      targetSegment: 0,
      progress: 0,
    }
    transitionStartedAt = undefined
    pointerActive = false
    scheduleFrame()
  }

  function syncHeroState() {
    if (!scroller) return
    const nextMarker = scroller.querySelector(HERO_SELECTOR)
    if (nextMarker) {
      if (!heroActive || nextMarker !== heroMarker) enterHero(nextMarker)
      return
    }
    if (heroActive) leaveHero()
  }
  function onScroll() {
    if (!scroller) return
    if (heroActive) {
      scheduleFrame()
      return
    }
    const desiredSegment = Math.floor(traversalCoordinate())
    if (transition) retargetTransition(desiredSegment)
    else if (desiredSegment !== segment) startTransition(desiredSegment)
    scheduleFrame()
  }

  function onPointerMove(event) {
    if (!operation || transition || motionReduced() || phoneStatic()) return
    pointerClientX = event.clientX
    pointerClientY = event.clientY
    pointerActive = true
    projectPointerFromClient()
    scheduleFrame()
  }

  function onPointerLeave() {
    pointerActive = false
    scheduleFrame()
  }

  function cancelHydrationResume() {
    if (hydrationTimer !== undefined) window.clearTimeout?.(hydrationTimer)
    if (hydrationFrame !== undefined) {
      if (window.cancelAnimationFrame) window.cancelAnimationFrame(hydrationFrame)
      else window.clearTimeout?.(hydrationFrame)
    }
    hydrationTimer = undefined
    hydrationFrame = undefined
    hydrationStableFrames = 0
  }

  function resumeAfterStableFrames() {
    hydrationFrame = undefined
    hydrationStableFrames += 1
    if (hydrationStableFrames < 2) {
      hydrationFrame = window.requestAnimationFrame?.(resumeAfterStableFrames)
        ?? window.setTimeout?.(resumeAfterStableFrames, 16)
      return
    }
    hydrationPaused = false
    updateFrameGate()
  }

  function registerContentMutations(mutations) {
    let weight = mutations.length
    for (const mutation of mutations) {
      for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
        if (node?.nodeType === 1) {
          if (node.matches?.('[data-chat-flow-kind], [data-message-role]')) weight += 1
          weight += countMatchingDescendants(
            node,
            '[data-chat-flow-kind], [data-message-role]',
          )
        } else if (node?.nodeType === 3) weight += 1
      }
    }
    mutationBurstScore += weight
    if (mutationBurstTimer !== undefined) window.clearTimeout?.(mutationBurstTimer)
    mutationBurstTimer = window.setTimeout?.(() => {
      mutationBurstTimer = undefined
      mutationBurstScore = 0
    }, 48)
    if (mutationBurstScore >= 12) pauseForHydration()
  }

  function pauseForHydration() {
    hydrationPaused = true
    updateFrameGate()
    cancelHydrationResume()
    hydrationTimer = window.setTimeout?.(() => {
      hydrationTimer = undefined
      hydrationFrame = window.requestAnimationFrame?.(resumeAfterStableFrames)
        ?? window.setTimeout?.(resumeAfterStableFrames, 16)
    }, HYDRATION_SETTLE_MS)
  }

  function snapParticlesToCurrentLayout() {
    const { center, size } = currentLayout()
    particles.forEach(particle => {
      if (!particle.target) return
      particle.x = center.x + particle.target.x * size
      particle.y = center.y + particle.target.y * size
      particle.vx = 0
      particle.vy = 0
    })
  }

  function updateFrameGate() {
    const now = Number(window.performance?.now?.()) || 0
    if (!canRenderFrame()) {
      pauseStartedAt ??= now
      cancelFrame()
      return
    }
    if (pauseStartedAt !== undefined) {
      resumePausedTimelines(now)
      if (canvas && particles.length) {
        syncCanvasBackingStore()
        cancelFrame()
        draw(now)
        return
      }
    }
    scheduleFrame()
  }

  function onVisibilityChange() {
    documentVisible = document.visibilityState !== 'hidden'
    updateFrameGate()
  }

  function onIntersection(entries) {
    canvasVisible = entries.some(entry => entry.isIntersecting || entry.intersectionRatio > 0)
    updateFrameGate()
  }

  function unmount() {
    clearResizeState()
    cancelTargetPrewarm()
    scroller?.removeAttribute('data-prts-hero-active')
    heroMarker = undefined
    heroActive = false
    scroller?.removeEventListener('scroll', onScroll)
    operation?.removeEventListener('pointermove', onPointerMove)
    operation?.removeEventListener('pointerleave', onPointerLeave)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    intersectionObserver = undefined
    canvasVisible = true
    resizeObserver = undefined
    ambient?.remove()
    canvas?.remove()
    ambient = undefined
    glow = undefined
    canvas = undefined
    context = undefined
    scroller = undefined
    geometryDirty = true
    particles = []
    idleStableFrames = 0
    transition = undefined
    densityTransition = undefined
    densityStartedAt = undefined
    queuedDensityCount = undefined
    queuedTargetRefresh = false
    if (densityDebounce !== undefined) window.clearTimeout?.(densityDebounce)
    densityDebounce = undefined
    pauseStartedAt = undefined
    hydrationPaused = false
    cancelHydrationResume()
    if (mutationBurstTimer !== undefined) window.clearTimeout?.(mutationBurstTimer)
    mutationBurstTimer = undefined
    mutationBurstScore = 0
    cancelFrame()
  }

  function mount(nextOperation, nextScroller) {
    if (operation === nextOperation && scroller === nextScroller && ambient?.isConnected && canvas?.isConnected) return
    unmount()
    operation = nextOperation
    scroller = nextScroller
    if (!operation || !scroller) return

    const created = createAmbient(document)
    ambient = created.layer
    glow = created.glow
    canvas = document.createElement('canvas')
    canvas.setAttribute('data-prts-particle-layer', '')
    canvas.setAttribute('aria-label', '随对话滚动轮换阵营标识的粒子画布')
    canvas.style.visibility = 'hidden'
    if (typeof window.CanvasRenderingContext2D === 'function') context = canvas.getContext('2d')
    targetCache.clear()
    initializeFieldSize()
    syncHeroState()
    if (!heroActive) restoreTraversalFromScroll()
    if (!particles.length && maskRecords.length) buildParticles()
    if (context && particles.length) {
      syncCanvasBackingStore()
      geometryDirty = false
      draw(Number(window.performance?.now?.()) || 0)
    } else {
      canvas.setAttribute('data-prts-particle-ready', '')
      canvas.style.visibility = ''
    }
    operation.insertBefore(ambient, operation.firstChild)
    operation.insertBefore(canvas, ambient.nextSibling)
    scroller.addEventListener('scroll', onScroll, { passive: true })
    operation.addEventListener('pointermove', onPointerMove, { passive: true })
    operation.addEventListener('pointerleave', onPointerLeave)
    if (typeof window.ResizeObserver === 'function') {
      resizeObserver = new window.ResizeObserver(onOperationResize)
      resizeObserver.observe(operation)
    }
    if (typeof window.IntersectionObserver === 'function') {
      intersectionObserver = new window.IntersectionObserver(onIntersection)
      intersectionObserver.observe(canvas)
    }
    if (!maskRecords.length) reportState({ phase: 'error', error: '徽记资源异常' })
    scheduleFrame()
  }

  function scheduleFindMount() {
    if (mountFrame !== undefined) return
    mountFrame = window.requestAnimationFrame?.(() => {
      mountFrame = undefined
      findMount()
    }) ?? window.setTimeout?.(() => {
      mountFrame = undefined
      findMount()
    }, 0)
  }

  function cancelFindMount() {
    if (mountFrame === undefined) return
    if (window.cancelAnimationFrame) window.cancelAnimationFrame(mountFrame)
    else window.clearTimeout?.(mountFrame)
    mountFrame = undefined
  }

  function findMount() {
    const nextOperation = document.querySelector('[data-prts-region="operation"]')
    const nextScroller = nextOperation?.querySelector('[data-conversation-scroll]')
    mount(nextOperation, nextScroller)
    syncHeroState()
  }

  function onViewportChange() {
    transition = undefined
    transitionStartedAt = undefined
    side = sideForSegment(segment)
    if (particles.length) snapParticlesToCurrentLayout()
    scheduleFrame()
  }

  mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  mediaListener = onViewportChange
  mediaQuery?.addEventListener?.('change', mediaListener)
  if (!mediaQuery?.addEventListener) mediaQuery?.addListener?.(mediaListener)
  document.addEventListener?.('visibilitychange', onVisibilityChange)
  return {
    update(nextPreferences = {}) {
      const previousPreferences = preferences
      const traversalSpeedChanged = previousPreferences.particleTraversalSpeed !== undefined
        && particleTraversalSpeed(previousPreferences) !== particleTraversalSpeed(nextPreferences)
      const preservedTraversalCoordinate = traversalSpeedChanged && scroller && !heroActive
        ? traversalCoordinate(previousPreferences)
        : undefined
      preferences = nextPreferences
      disposed = false
      if (!preferences.enabled) {
        mutationObserver?.disconnect()
        mutationObserver = undefined
        cancelFindMount()
        unmount()
        operation = undefined
        return
      }

      findMount()
      const previousActiveDensity = heroActive
        ? previousPreferences.heroParticleDensity
        : previousPreferences.conversationParticleDensity
      const activeDensityChanged = previousActiveDensity !== undefined && previousActiveDensity !== activeDensity()
      reportState({ requestedPattern: 'orthogonal' })
      if (particles.length && activeDensityChanged) scheduleDensityReassembly(targetParticleCount(), true)
      if (preservedTraversalCoordinate !== undefined && scroller && !heroActive) reanchorTraversal(preservedTraversalCoordinate)
      if (!mutationObserver && window.MutationObserver && document.body) {
        const observationRoot = document.querySelector('[data-slot="root"]')
          ?? document.querySelector('[data-prts-region="frame"]')
          ?? operation
        if (observationRoot) {
          mutationObserver = new window.MutationObserver(mutations => {
            let mountChanged = !operation?.isConnected || !scroller?.isConnected
            let heroChanged = false
            let contentChanged = false
            for (const mutation of mutations) {
              if (mutation.target?.closest?.('[data-prts-particle-layer], [data-prts-ambient-layer]')) continue
              if (operation?.contains?.(mutation.target)) contentChanged = true
              for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
                if (node?.nodeType !== 1) continue
                if (node.matches?.('[data-prts-region="operation"], [data-conversation-scroll]')
                  || node.querySelector?.('[data-prts-region="operation"], [data-conversation-scroll]')) mountChanged = true
                if (node === heroMarker || node.matches?.(HERO_SELECTOR) || node.querySelector?.(HERO_SELECTOR)) heroChanged = true
              }
            }
            if (contentChanged) registerContentMutations(mutations)
            if (mountChanged) scheduleFindMount()
            else if (heroChanged) syncHeroState()
          })
          mutationObserver.observe(observationRoot, { childList: true, subtree: true })
        }
      }
      if (ambient) ambient.hidden = preferences.texture === 'off'
      scheduleFrame()
    },
    inspect() {
      return {
        mounted: Boolean(ambient?.isConnected && canvas?.isConnected),
        hero: heroActive,
        side,
        emblemKey: (heroActive || transition?.fromHero ? heroEmblem() : emblemForSegment(segment))?.key,
        nextEmblemKey: transition ? emblemForSegment(transition.targetSegment)?.key : null,
        segment,
        traversalSpeed: particleTraversalSpeed(),
        traversalOffset,
        traversalCoordinate: traversalCoordinate(),
        traversalProgress: scrollProgress(),
        transition: transition ? {
          fromSide: transition.fromSide,
          toSide: transition.toSide,
          direction: transition.direction,
        } : null,
        anchor: inspectAnchor(),
        particles: densityTransition
          ? Math.round(densityTransition.from + (densityTransition.to - densityTransition.from) * easeInOut(densityTransition.progress))
          : transition?.toCount !== undefined
            ? Math.round(transition.fromCount + (transition.toCount - transition.fromCount) * easeInOut(transition.progress))
            : particles.length,
        targetParticles: transition?.toCount ?? targetParticleCount(),
        density: activeDensity() || 'standard',
        firstFrameReady: canvas?.hasAttribute('data-prts-particle-ready') === true,
        hydrationPaused,
        sleeping: Boolean(context && particles.length && frame === undefined && canRenderFrame() && !motionReduced() && !phoneStatic()),
        pointer: {
          active: pointerActive,
          clientX: pointerClientX,
          clientY: pointerClientY,
          x: pointerX,
          y: pointerY,
        },
        densityCapped: false,
        pattern: 'orthogonal',
        appliedPattern: particleState.appliedPattern,
        phase: particleState.phase,
        error: particleState.error,
        densityTransition: densityTransition ? { mode: densityTransition.mode, from: densityTransition.from, to: densityTransition.to } : null,
        densityPending: densityDebounce !== undefined || queuedDensityCount !== undefined || queuedTargetRefresh,
        layoutPending: false,
        layoutPhase: null,
        layoutFractureProgress: null,
        layoutStable: null,
        layoutReassemblyProgress: null,
        canvasWidth: canvas?.width ?? 0,
        canvasHeight: canvas?.height ?? 0,
        resizing,
        resizePending: resizing || resizeFrame !== undefined || resizeCommitFrame !== undefined || resizeFinishFrame !== undefined || resizeTimer !== undefined,
        resizeObservations,
        resizeCommits,
        backingStoreCommits,
        fieldWidth: width,
        fieldHeight: height,
        resizeRestorePending: resizeRestoreTimer !== undefined,
        layoutReassemblies: 0,
        heroSize: heroActive || transition?.fromHero ? heroLogoSize() : null,
        suspended: !canRenderFrame(),
      }
    },
    dispose() {
      disposed = true
      mutationObserver?.disconnect()
      mutationObserver = undefined
      cancelFindMount()
      unmount()
      operation = undefined
      if (mediaQuery && mediaListener) {
        mediaQuery.removeEventListener?.('change', mediaListener)
        mediaQuery.removeListener?.(mediaListener)
      }
      mediaQuery = undefined
      mediaListener = undefined
      document.removeEventListener?.('visibilitychange', onVisibilityChange)
    },
  }
}
