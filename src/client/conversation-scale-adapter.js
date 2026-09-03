import { CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT, CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, CONVERSATION_SCALE_FOCUS_CONTRAST_MIN } from './preferences.js'

export const CONVERSATION_USER_TURN_SELECTOR = [
  '[data-chat-flow-kind="user"]',
  '[data-chat-flow-kind="user-step"]',
  '[data-message-role="user"]',
].join(',')

export const CONVERSATION_SCALE_SPACING = 8
export const CONVERSATION_SCALE_BASE_LENGTHS = Object.freeze([24, 18, 14, 10, 6])
export const CONVERSATION_SCALE_CONTRAST_DELTAS = Object.freeze([5, -3, -4, -4, -3])

export function resolveConversationScaleLengths(value = CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT) {
  const numeric = Number(value)
  const contrast = Number.isFinite(numeric)
    ? Math.min(CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, Math.max(CONVERSATION_SCALE_FOCUS_CONTRAST_MIN, numeric))
    : CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT
  const ratio = contrast / CONVERSATION_SCALE_FOCUS_CONTRAST_MAX
  return CONVERSATION_SCALE_BASE_LENGTHS.map((length, index) =>
    Math.round(length + CONVERSATION_SCALE_CONTRAST_DELTAS[index] * ratio))
}

export const CONVERSATION_SCALE_LENGTHS = Object.freeze(resolveConversationScaleLengths())
export const CONVERSATION_SCALE_WAVE_DURATION = 140

export const CONVERSATION_JUMP_BOTTOM_THRESHOLD = 25
export const CONVERSATION_JUMP_SMOOTH_VIEWPORT_LIMIT = 1.5
export const CONVERSATION_JUMP_SETTLE_MAX_DISTANCE = 88
export const CONVERSATION_JUMP_SETTLE_VIEWPORT_RATIO = .12
export const CONVERSATION_JUMP_SETTLE_DURATION = 180
export const CONVERSATION_JUMP_VERIFY_DURATION = 900
export const CONVERSATION_HISTORY_PAGE_LIMIT = 10
export const CONVERSATION_HISTORY_TIME_LIMIT = 8000

const ASSISTANT_SELECTOR = '[data-chat-flow-kind="assistant-step"], [data-message-role="assistant"]'
const FORMAL_ANSWER_SELECTOR = '[data-prts-ai-surface], [data-markdown], [data-slot*="markdown" i], .markdown-body'
const AUXILIARY_SELECTOR = '[data-chat-flow-kind*="reason" i], [data-chat-flow-kind*="tool" i], [data-slot*="reason" i], [data-slot*="tool" i], [data-role*="reason" i], [data-role*="tool" i]'
const STREAMING_SELECTOR = '[aria-busy="true"], [data-streaming], [data-status*="stream" i], [data-state*="stream" i]'
const CONVERSATION_THIRD_PARTY_OVERLAY_SELECTOR = [
  '[data-shell-overlay] [data-plugin]:not([data-plugin="dsh-theme-prts"])',
  '[data-slot="shell.overlay"] [data-plugin]:not([data-plugin="dsh-theme-prts"])',
].join(', ')
const CONVERSATION_BLOCKING_OVERLAY_SELECTOR = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  'dialog[open]',
  '[data-prts-floating-glass="dialog"]',
  '[data-prts-floating-scrim]',
  '[data-slot*="dialog" i]',
  '[data-slot*="modal" i]',
  '[class*="_dialog"]',
  '[class*="_modal"]',
  '[class*="_scrim"]',
  '[class*="_backdrop"]',
].join(', ')
const CONVERSATION_OVERLAY_SELECTOR = [
  CONVERSATION_THIRD_PARTY_OVERLAY_SELECTOR,
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[popover]',
  '[data-prts-floating-glass]',
  '[aria-modal="true"]',
  'dialog[open]',
  '[data-slot*="dialog" i]',
  '[data-slot*="modal" i]',
  '[data-prts-floating-scrim]',
  '[class*="_dialog"]',
  '[class*="_modal"]',
  '[class*="_scrim"]',
  '[class*="_backdrop"]',
].join(', ')
const CONVERSATION_PORTAL_ROOT_SELECTOR = [
  '[role="presentation"]',
  '[class*="_portal_"]',
  '[data-floating-ui-portal]',
  '[data-radix-portal]',
].join(', ')
const PREVIEW_REMOVE_SELECTOR = [
  '[hidden]',
  '[aria-hidden="true"]',
  'button',
  '[role="toolbar"]',
  '[data-slot*="toolbar" i]',
  '[data-slot*="action" i]',
  '[data-slot*="sentinel" i]',
  'script',
  'style',
].join(',')
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const MINIMUM_TURNS = 2
export const CONVERSATION_SCALE_WIDTH = 32
export const CONVERSATION_SCALE_CONTENT_GAP = 12
export const CONVERSATION_SCALE_PREVIEW_WIDTH = 360
export const CONVERSATION_SCALE_PREVIEW_GAP = 8
export const CONVERSATION_SCALE_RIGHT_GAP = 12
export const CONVERSATION_SCALE_HYSTERESIS = 16
export const CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE = 96
const SCALE_WIDTH = CONVERSATION_SCALE_WIDTH
const PREVIEW_WIDTH = CONVERSATION_SCALE_PREVIEW_WIDTH
const PREVIEW_GAP = CONVERSATION_SCALE_PREVIEW_GAP
const PREVIEW_FALLBACK_HEIGHT = 128
const PREVIEW_DELAY = 100
const HISTORY_TRIGGER_HEIGHT = CONVERSATION_SCALE_SPACING
const PREVIEW_REFRESH_INTERVAL = 100
const PREVIEW_TOUCH_DURATION = 1200
const SNAP_DELAY = 110
const TOUCH_WAVE_DURATION = 620
const HISTORY_PAGE_SETTLE_LIMIT = 4000
const GEOMETRY_SETTLE_FRAME_LIMIT = 8
const GEOMETRY_SETTLE_STABLE_FRAMES = 2
let scaleInstanceSeed = 0

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function resolveConversationScaleGeometry({
  operationWidth,
  contentLeft,
  maximumDistance = CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE,
  previouslyHidden = false,
} = {}) {
  const width = Number(operationWidth)
  const content = Number(contentLeft)
  const maximum = Number(maximumDistance)
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(content) || content <= 0) {
    return { visible: false, reason: 'unmeasured' }
  }
  const recovery = previouslyHidden ? CONVERSATION_SCALE_HYSTERESIS : 0
  const minimumCorridor = CONVERSATION_SCALE_WIDTH + CONVERSATION_SCALE_CONTENT_GAP * 2 + recovery
  if (content < minimumCorridor) return { visible: false, reason: 'corridor' }
  const configuredLeft = clamp(
    Number.isFinite(maximum) ? maximum : CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE,
    CONVERSATION_SCALE_CONTENT_GAP,
    Math.max(CONVERSATION_SCALE_CONTENT_GAP, width - CONVERSATION_SCALE_WIDTH - CONVERSATION_SCALE_RIGHT_GAP),
  )
  const centered = configuredLeft + CONVERSATION_SCALE_WIDTH + CONVERSATION_SCALE_CONTENT_GAP > content
  const left = centered ? (content - CONVERSATION_SCALE_WIDTH) / 2 : configuredLeft
  const previewRight = left
    + CONVERSATION_SCALE_WIDTH
    + CONVERSATION_SCALE_PREVIEW_GAP
    + CONVERSATION_SCALE_PREVIEW_WIDTH
    + CONVERSATION_SCALE_RIGHT_GAP
    + recovery
  if (previewRight > width) return { visible: false, reason: 'preview', left, centered }
  return { visible: true, reason: 'ready', left, centered }
}


export function resolveConversationScaleCalibrationState({
  operationWidth,
  contentLeft,
  maximumDistance = CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE,
  turnCount = 0,
  drawerMode,
  viewportWidth,
  previouslyHidden = false,
} = {}) {
  const numeric = Number(maximumDistance)
  const normalizedMaximum = Number.isFinite(numeric)
    ? clamp(Math.round(numeric / 8) * 8, 16, 240)
    : CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE
  const resolution = drawerMode === 'overlay'
    ? { visible: false, reason: 'drawer' }
    : Number(viewportWidth) <= 640
      ? { visible: false, reason: 'phone' }
      : resolveConversationScaleGeometry({
        operationWidth,
        contentLeft,
        maximumDistance: normalizedMaximum,
        previouslyHidden,
      })
  if (!resolution.visible) return {
    ...resolution,
    mode: 'hidden',
    maximumDistance: normalizedMaximum,
  }
  if (Number(turnCount) < MINIMUM_TURNS) return {
    visible: false,
    reason: 'turns',
    mode: 'hidden',
    maximumDistance: normalizedMaximum,
    left: resolution.left,
    centered: resolution.centered,
  }
  return {
    ...resolution,
    mode: resolution.centered ? 'centered' : 'configured',
    maximumDistance: normalizedMaximum,
  }
}

function visible(node) {
  return node && !node.hidden && node.getAttribute('aria-hidden') !== 'true'
}

function follows(first, second) {
  return Boolean(first?.compareDocumentPosition?.(second) & 4)
}

function truncateText(value, limit) {
  const characters = Array.from(value)
  return characters.length > limit ? `${characters.slice(0, limit).join('')}…` : value
}

function attachmentSummary(node) {
  const named = node?.querySelector?.('[data-file-name], [download], img[alt]')
  const name = named?.getAttribute('data-file-name')
    || named?.getAttribute('download')
    || named?.getAttribute('alt')
  if (name?.trim()) return `${named?.matches('img') ? '图片' : '附件'} · ${name.trim()}`
  if (node?.querySelector?.('img, [data-file], [data-attachment], input[type="file"]')) return '附件消息'
  return ''
}

export function sanitizeConversationPreviewNode(node, limit = 360) {
  if (!node) return ''
  const clone = node.cloneNode(true)
  for (const removable of clone.querySelectorAll?.(PREVIEW_REMOVE_SELECTOR) || []) removable.remove()
  for (const block of clone.querySelectorAll?.('pre') || []) {
    const firstLine = block.textContent?.split(/\r?\n/).map(line => line.trim()).find(Boolean) || ''
    block.textContent = firstLine ? `代码：${firstLine}` : '代码'
  }
  const text = clone.textContent?.replace(/\s+/g, ' ').trim() || attachmentSummary(node)
  return truncateText(text, limit)
}

export function collectConversationTurns(scroller) {
  if (!scroller) return []
  return Array.from(scroller.querySelectorAll(CONVERSATION_USER_TURN_SELECTOR)).filter(node => {
    if (!visible(node) || node.closest('[data-prts-conversation-scale], [data-prts-conversation-preview]')) return false
    const parent = node.parentElement?.closest?.(CONVERSATION_USER_TURN_SELECTOR)
    return !parent || !scroller.contains(parent)
  })
}

function hasClassSuffix(node, suffix) {
  return [...(node?.classList ?? [])].some(token => token.endsWith(suffix))
}

export function findConversationOlderButton(root) {
  for (const button of root?.querySelectorAll?.('button') ?? []) {
    for (let current = button.parentElement; current && root.contains(current); current = current.parentElement) {
      if (hasClassSuffix(current, '_older')) return button
    }
  }
  return null
}

export function resolveConversationHistorySnapshot(sessions) {
  try {
    const listSnapshot = sessions?.list?.getSnapshot?.()
    const current = listSnapshot?.current
      ?? listSnapshot?.currentId
      ?? listSnapshot?.currentSessionId
    if (current === undefined || current === null) return {}
    const binding = sessions?.binding?.(current)
    const session = binding?.session
    const snapshot = session?.getSnapshot?.() ?? binding?.getSnapshot?.()
    return { key: current, hasMore: snapshot?.hasMore === true, loading: snapshot?.loadingOlder === true }
  } catch {
    return {}
  }
}

function collectAssistantCandidates(scroller, turn, nextTurn) {
  return Array.from(scroller?.querySelectorAll?.(ASSISTANT_SELECTOR) || []).filter(node => {
    if (!visible(node)) return false
    const parent = node.parentElement?.closest?.(ASSISTANT_SELECTOR)
    if (parent && scroller.contains(parent)) return false
    if (!follows(turn, node)) return false
    return !nextTurn || follows(node, nextTurn)
  })
}

function formalBodies(candidate) {
  const bodies = []
  if (candidate.matches?.(FORMAL_ANSWER_SELECTOR)) bodies.push(candidate)
  bodies.push(...candidate.querySelectorAll?.(FORMAL_ANSWER_SELECTOR) || [])
  return bodies.filter(body => !body.closest?.(AUXILIARY_SELECTOR))
}

export function getConversationTurnPreview(scroller, turns, index) {
  const turn = turns?.[index]
  if (!turn) return { question: '', answer: '尚无有效回复', state: 'empty', answerSource: undefined }
  const nextTurn = turns[index + 1]
  const questionSource = turn.querySelector?.('[class$="_bubble"], [data-message-role="user"]') || turn
  const question = sanitizeConversationPreviewNode(questionSource, 180) || attachmentSummary(turn) || '附件消息'
  const candidates = collectAssistantCandidates(scroller, turn, nextTurn)

  for (const candidate of candidates) {
    for (const body of formalBodies(candidate)) {
      const answer = sanitizeConversationPreviewNode(body, 420)
      if (answer) return { question, answer, state: 'answer', answerSource: body }
    }
  }

  for (const candidate of candidates) {
    const answer = sanitizeConversationPreviewNode(candidate, 420)
    if (answer) return { question, answer, state: 'fallback', answerSource: candidate }
  }

  const streaming = candidates.some(candidate => candidate.matches?.(STREAMING_SELECTOR) || candidate.querySelector?.(STREAMING_SELECTOR))
  return {
    question,
    answer: streaming ? '正在生成…' : '尚无有效回复',
    state: streaming ? 'streaming' : 'empty',
    answerSource: candidates[0],
  }
}

export function getConversationScaleLayout(count, height, requestedOffset = 0) {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0))
  const safeHeight = Math.max(1, Number(height) || 1)
  const span = Math.max(0, safeCount - 1) * CONVERSATION_SCALE_SPACING
  const usableHeight = Math.max(0, safeHeight - 1)
  const maxOffset = Math.max(0, span - usableHeight)
  const offset = clamp(Number(requestedOffset) || 0, 0, maxOffset)
  const start = .5 + (maxOffset === 0 ? (usableHeight - span) / 2 : 0)
  const positions = Array.from({ length: safeCount }, (_, index) =>
    start + index * CONVERSATION_SCALE_SPACING - offset)
  return { count: safeCount, height: safeHeight, span, maxOffset, offset, start, positions }
}

export function conversationScaleWaveLength(distance, lengths = CONVERSATION_SCALE_LENGTHS) {
  const safeDistance = Math.abs(Number(distance) || 0)
  const lower = Math.floor(safeDistance)
  if (lower >= lengths.length - 1) return lengths.at(-1)
  const progress = safeDistance - lower
  const from = lengths[lower]
  const to = lengths[lower + 1]
  return from + (to - from) * progress
}

export function visibleConversationTickRange(layout, buffer = 2) {
  if (!layout?.count) return { minimum: 0, maximum: -1 }
  const padding = Math.max(0, Math.floor(Number(buffer) || 0))
  const minimum = Math.max(
    0,
    Math.ceil((layout.offset - layout.start) / CONVERSATION_SCALE_SPACING) - padding,
  )
  const maximum = Math.min(
    layout.count - 1,
    Math.floor((layout.height - .5 + layout.offset - layout.start) / CONVERSATION_SCALE_SPACING) + padding,
  )
  return { minimum, maximum }
}

export function nearestVisibleConversationTick(layout, localY) {
  if (!layout?.count) return -1
  const minimum = Math.max(0, Math.ceil((layout.offset - layout.start) / CONVERSATION_SCALE_SPACING))
  const maximum = Math.min(
    layout.count - 1,
    Math.floor((layout.height - .5 + layout.offset - layout.start) / CONVERSATION_SCALE_SPACING),
  )
  if (maximum < minimum) return -1
  const raw = Math.round((Number(localY) + layout.offset - layout.start) / CONVERSATION_SCALE_SPACING)
  return clamp(raw, minimum, maximum)
}

export function snapConversationScaleOffset(offset, maximum) {
  return clamp(
    Math.round((Number(offset) || 0) / CONVERSATION_SCALE_SPACING) * CONVERSATION_SCALE_SPACING,
    0,
    Math.max(0, Number(maximum) || 0),
  )
}

export function shouldFollowConversationScaleBottom(offset, maximum) {
  return Math.max(0, Number(maximum) || 0) - (Number(offset) || 0) <= 1
}

export function calculateConversationJumpTop({
  scrollTop,
  scrollHeight,
  clientHeight,
  turnTop,
  visibleTop,
  visibleHeight,
}) {
  const target = (Number(scrollTop) || 0)
    + (Number(turnTop) || 0)
    - (Number(visibleTop) || 0)
    - Math.max(0, Number(visibleHeight) || 0) * .28
  return clamp(target, 0, Math.max(0, (Number(scrollHeight) || 0) - (Number(clientHeight) || 0)))
}

export function resolveConversationJumpBehavior(distance, viewportHeight, prefersReducedMotion = false) {
  if (prefersReducedMotion) return 'auto'
  const height = Math.max(0, Number(viewportHeight) || 0)
  const delta = Math.abs(Number(distance) || 0)
  return height > 0 && delta <= height * CONVERSATION_JUMP_SMOOTH_VIEWPORT_LIMIT ? 'smooth' : 'auto'
}

export function resolveConversationJumpSettle(distance, viewportHeight, prefersReducedMotion = false) {
  if (prefersReducedMotion || resolveConversationJumpBehavior(distance, viewportHeight) === 'smooth') {
    return { offset: 0, duration: 0 }
  }
  const height = Math.max(0, Number(viewportHeight) || 0)
  const delta = Number(distance) || 0
  if (height <= 0 || Math.abs(delta) <= 2) return { offset: 0, duration: 0 }
  const offset = Math.sign(delta) * Math.min(
    Math.abs(delta),
    CONVERSATION_JUMP_SETTLE_MAX_DISTANCE,
    height * CONVERSATION_JUMP_SETTLE_VIEWPORT_RATIO,
  )
  return { offset, duration: CONVERSATION_JUMP_SETTLE_DURATION }
}

function scrollConversationTo(scroller, top, behavior) {
  if (typeof scroller?.scrollTo === 'function') scroller.scrollTo({ top, behavior })
  else if (scroller) scroller.scrollTop = top
}

export async function performConversationJump({
  scroller,
  getTargetTop,
  prefersReducedMotion = false,
  requestFrame = callback => globalThis.requestAnimationFrame?.(callback) ?? globalThis.setTimeout?.(callback, 16),
  now = () => globalThis.performance?.now?.() ?? Date.now(),
  cancelled = () => false,
  onFrame = () => {},
} = {}) {
  if (!scroller || typeof getTargetTop !== 'function') return false
  const nextFrame = () => new Promise(resolve => requestFrame(timestamp => {
    resolve(Number.isFinite(timestamp) ? timestamp : now())
  }))
  const targetTop = () => {
    const raw = getTargetTop()
    if (raw === null || raw === undefined) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  }

  let top = targetTop()
  if (top === null) return false
  const floor = Math.max(0, Number(scroller.scrollHeight) - Number(scroller.clientHeight))
  const bottomDistance = floor - Number(scroller.scrollTop)
  if (bottomDistance <= CONVERSATION_JUMP_BOTTOM_THRESHOLD && top < Number(scroller.scrollTop)) {
    scroller.scrollTop = Math.max(0, Number(scroller.scrollTop) - 1)
    await nextFrame()
    if (cancelled()) return null
    top = targetTop()
    if (top === null) return false
  }

  const distance = top - Number(scroller.scrollTop)
  const behavior = resolveConversationJumpBehavior(distance, scroller.clientHeight, prefersReducedMotion)
  const settle = resolveConversationJumpSettle(distance, scroller.clientHeight, prefersReducedMotion)
  if (settle.duration > 0) {
    const limit = () => Math.max(0, Number(scroller.scrollHeight) - Number(scroller.clientHeight))
    const beforeTarget = clamp(top - settle.offset, 0, limit())
    scrollConversationTo(scroller, beforeTarget, 'auto')
    await nextFrame()
    if (cancelled()) return null
    const from = Number(scroller.scrollTop)
    const startedAt = now()
    let progress = 0
    while (progress < 1) {
      const timestamp = await nextFrame()
      if (cancelled()) return null
      progress = Math.min(1, (timestamp - startedAt) / settle.duration)
      const eased = 1 - (1 - progress) ** 3
      const liveTarget = targetTop()
      if (liveTarget === null) return false
      scroller.scrollTop = from + (liveTarget - from) * eased
      onFrame()
    }
  } else {
    scrollConversationTo(scroller, top, behavior)
    onFrame()
  }

  let stableFrames = 0
  let verificationFrames = 0
  const verificationStartedAt = now()
  while (now() - verificationStartedAt < CONVERSATION_JUMP_VERIFY_DURATION && verificationFrames < 72) {
    await nextFrame()
    verificationFrames += 1
    if (cancelled()) return null
    const liveTarget = targetTop()
    if (liveTarget === null) return false
    stableFrames = Math.abs(Number(scroller.scrollTop) - liveTarget) <= 2 ? stableFrames + 1 : 0
    if (stableFrames >= 2) return true
  }

  top = targetTop()
  if (top === null) return false
  scrollConversationTo(scroller, top, 'auto')
  await nextFrame()
  await nextFrame()
  if (cancelled()) return null
  const correctedTarget = targetTop()
  return correctedTarget !== null && Math.abs(Number(scroller.scrollTop) - correctedTarget) <= 2
}

export function buildConversationScalePaths(layout, interactionIndex = -1, animation, lengths = CONVERSATION_SCALE_LENGTHS) {
  const gray = []
  const yellow = []
  const history = []
  const hovering = interactionIndex >= 0 && interactionIndex < layout.count
  const animatedCenter = Number.isFinite(animation?.center) ? animation.center : interactionIndex
  const animatedIntensity = animation
    ? clamp(Number(animation.intensity) || 0, 0, 1)
    : hovering ? 1 : 0
  const restingLength = lengths.at(-1)
  const { minimum, maximum } = visibleConversationTickRange(layout)
  for (let index = minimum; index <= maximum; index += 1) {
    const rawY = layout.start + index * CONVERSATION_SCALE_SPACING - layout.offset
    if (rawY < .5 || rawY > layout.height - .5) continue
    const y = Number(rawY.toFixed(2))
    const waveLength = conversationScaleWaveLength(Math.abs(index - animatedCenter), lengths)
    if (animation?.historyAvailable && index === 0) {
      const selected = interactionIndex === 0
      const intensity = selected ? animatedIntensity : 0
      const restingFirstEnd = 2 + restingLength
      const restingSecondStart = restingFirstEnd + 4
      const restingSecondEnd = restingSecondStart + restingLength
      const firstEnd = Number((
        restingFirstEnd + (14 - restingFirstEnd) * intensity
      ).toFixed(2))
      const secondStart = Number((
        restingSecondStart + (16 - restingSecondStart) * intensity
      ).toFixed(2))
      const secondEnd = Number((
        restingSecondEnd + (30 - restingSecondEnd) * intensity
      ).toFixed(2))
      history.push(`M2 ${y}H${firstEnd}M${secondStart} ${y}H${secondEnd}`)
      continue
    }
    const length = restingLength + (waveLength - restingLength) * animatedIntensity
    const command = `M2 ${y}H${Number((2 + length).toFixed(2))}`
    const accented = hovering ? index === interactionIndex : index === layout.count - 1
    ;(accented ? yellow : gray).push(command)
  }
  return { gray: gray.join(''), yellow: yellow.join(''), history: history.join('') }
}

function createPreview(document, id) {
  const preview = document.createElement('aside')
  preview.id = id
  preview.setAttribute('data-prts-conversation-preview', '')
  preview.setAttribute('data-prts-owned-conversation-preview', '')
  preview.setAttribute('role', 'tooltip')
  preview.setAttribute('aria-hidden', 'true')
  const connector = document.createElement('span')
  connector.setAttribute('data-prts-conversation-preview-connector', '')
  connector.setAttribute('aria-hidden', 'true')
  const body = document.createElement('div')
  body.setAttribute('data-prts-conversation-preview-body', '')
  const question = document.createElement('div')
  question.setAttribute('data-prts-conversation-preview-row', 'question')
  const questionLabel = document.createElement('b')
  questionLabel.textContent = 'Q'
  const questionText = document.createElement('span')
  questionText.setAttribute('data-prts-conversation-preview-question', '')
  question.append(questionLabel, questionText)
  const answer = document.createElement('div')
  answer.setAttribute('data-prts-conversation-preview-row', 'answer')
  const answerLabel = document.createElement('b')
  answerLabel.textContent = 'A'
  const answerText = document.createElement('span')
  answerText.setAttribute('data-prts-conversation-preview-answer', '')
  answer.append(answerLabel, answerText)
  body.append(question, answer)
  preview.append(connector, body)
  preview._prtsBody = body
  preview._prtsQuestion = questionText
  preview._prtsAnswer = answerText
  return preview
}

function createScale(document) {
  const instance = ++scaleInstanceSeed
  const maskId = `prts-conversation-scale-fade-${instance}`
  const previewId = `prts-conversation-preview-${instance}`
  const historyTooltipId = `prts-conversation-history-tooltip-${instance}`
  const scale = document.createElement('div')
  scale.setAttribute('data-prts-conversation-scale', '')
  scale.setAttribute('data-prts-owned-conversation-scale', '')
  scale.setAttribute('role', 'slider')
  scale.setAttribute('aria-label', '会话刻度导航')
  scale.setAttribute('aria-orientation', 'vertical')
  scale.tabIndex = 0

  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
  svg.setAttribute('data-prts-conversation-scale-svg', '')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('preserveAspectRatio', 'none')
  const defs = document.createElementNS(SVG_NAMESPACE, 'defs')
  const gradient = document.createElementNS(SVG_NAMESPACE, 'linearGradient')
  gradient.id = `${maskId}-gradient`
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
  gradient.setAttribute('x1', '0')
  gradient.setAttribute('y1', '0')
  gradient.setAttribute('x2', '0')
  gradient.setAttribute('y2', '24')
  const transparent = document.createElementNS(SVG_NAMESPACE, 'stop')
  transparent.setAttribute('offset', '0')
  transparent.setAttribute('stop-color', 'white')
  transparent.setAttribute('stop-opacity', '0')
  const opaque = document.createElementNS(SVG_NAMESPACE, 'stop')
  opaque.setAttribute('offset', '1')
  opaque.setAttribute('stop-color', 'white')
  gradient.append(transparent, opaque)
  const mask = document.createElementNS(SVG_NAMESPACE, 'mask')
  mask.id = maskId
  mask.setAttribute('maskUnits', 'userSpaceOnUse')
  mask.setAttribute('x', '0')
  mask.setAttribute('y', '0')
  mask.setAttribute('width', String(SCALE_WIDTH))
  const maskRect = document.createElementNS(SVG_NAMESPACE, 'rect')
  maskRect.setAttribute('x', '0')
  maskRect.setAttribute('y', '0')
  maskRect.setAttribute('width', String(SCALE_WIDTH))
  maskRect.setAttribute('fill', `url(#${gradient.id})`)
  mask.append(maskRect)
  defs.append(gradient, mask)
  const marks = document.createElementNS(SVG_NAMESPACE, 'g')
  marks.setAttribute('data-prts-conversation-scale-marks', '')
  const gray = document.createElementNS(SVG_NAMESPACE, 'path')
  gray.setAttribute('data-prts-conversation-scale-gray', '')
  const yellow = document.createElementNS(SVG_NAMESPACE, 'path')
  yellow.setAttribute('data-prts-conversation-scale-accent', '')
  const history = document.createElementNS(SVG_NAMESPACE, 'path')
  history.setAttribute('data-prts-conversation-scale-history', '')
  marks.append(gray, yellow, history)
  const hit = document.createElementNS(SVG_NAMESPACE, 'rect')
  hit.setAttribute('data-prts-conversation-scale-hit', '')
  hit.setAttribute('x', '0')
  hit.setAttribute('y', '0')
  hit.setAttribute('width', String(SCALE_WIDTH))
  hit.setAttribute('fill', 'transparent')
  svg.append(defs, marks, hit)
  scale.append(svg)
  scale._prtsSvg = svg
  scale._prtsMarks = marks
  scale._prtsMask = mask
  scale._prtsMaskRect = maskRect
  scale._prtsMaskId = maskId
  scale._prtsGray = gray
  scale._prtsAccent = yellow
  scale._prtsHistory = history
  scale._prtsHit = hit
  scale._prtsPreview = createPreview(document, previewId)
  const historyStatus = document.createElement('div')
  historyStatus.setAttribute('data-prts-conversation-history-status', '')
  historyStatus.setAttribute('role', 'status')
  historyStatus.setAttribute('aria-live', 'polite')
  historyStatus.hidden = true
  const historyText = document.createElement('span')
  historyText.setAttribute('data-prts-conversation-history-text', '')
  const historyAction = document.createElement('button')
  historyAction.type = 'button'
  historyAction.setAttribute('data-prts-conversation-history-action', '')
  historyStatus.append(historyText, historyAction)
  const historyHint = document.createElement('div')
  historyHint.setAttribute('data-prts-conversation-history-hint', '')
  historyHint.setAttribute('data-prts-owned-conversation-scale', '')
  historyHint.hidden = true
  const historyTrigger = document.createElement('button')
  historyTrigger.type = 'button'
  historyTrigger.tabIndex = -1
  historyTrigger.setAttribute('data-prts-conversation-history-trigger', '')
  historyTrigger.setAttribute('aria-label', '载入更早内容并前往会话开头')
  const historyTooltip = document.createElement('div')
  historyTooltip.id = historyTooltipId
  historyTooltip.setAttribute('data-prts-conversation-history-tooltip', '')
  historyTooltip.setAttribute('role', 'tooltip')
  historyTooltip.setAttribute('aria-hidden', 'true')
  historyTooltip.hidden = true
  const historyTooltipConnector = document.createElement('span')
  historyTooltipConnector.setAttribute('data-prts-conversation-history-tooltip-connector', '')
  historyTooltipConnector.setAttribute('aria-hidden', 'true')
  const historyTooltipBody = document.createElement('div')
  historyTooltipBody.setAttribute('data-prts-conversation-preview-body', '')
  historyTooltipBody.setAttribute('data-prts-conversation-history-tooltip-body', '')
  const historyTooltipHeader = document.createElement('div')
  historyTooltipHeader.setAttribute('data-prts-conversation-preview-row', 'question')
  const historyTooltipHeaderLabel = document.createElement('b')
  historyTooltipHeaderLabel.textContent = 'H'
  const historyTooltipHeaderText = document.createElement('span')
  historyTooltipHeaderText.setAttribute('data-prts-conversation-history-tooltip-label', '')
  historyTooltipHeaderText.textContent = '历史断点'
  historyTooltipHeader.append(historyTooltipHeaderLabel, historyTooltipHeaderText)
  const historyTooltipDetail = document.createElement('div')
  historyTooltipDetail.setAttribute('data-prts-conversation-preview-row', 'answer')
  const historyTooltipDetailLabel = document.createElement('b')
  historyTooltipDetailLabel.textContent = '↥'
  const historyTooltipContent = document.createElement('div')
  historyTooltipContent.setAttribute('data-prts-conversation-history-tooltip-content', '')
  const historyTooltipTitle = document.createElement('strong')
  historyTooltipTitle.textContent = '更早内容尚未加载'
  const historyTooltipDescription = document.createElement('span')
  historyTooltipDescription.textContent = '点击断点，载入历史并前往会话开头'
  historyTooltipContent.append(historyTooltipTitle, historyTooltipDescription)
  historyTooltipDetail.append(historyTooltipDetailLabel, historyTooltipContent)
  historyTooltipBody.append(historyTooltipHeader, historyTooltipDetail)
  historyTooltip.append(historyTooltipConnector, historyTooltipBody)
  historyHint.append(historyTrigger, historyTooltip)
  scale._prtsHistoryStatus = historyStatus
  scale._prtsHistoryText = historyText
  scale._prtsHistoryAction = historyAction
  scale._prtsHistoryHint = historyHint
  scale._prtsHistoryTrigger = historyTrigger
  scale._prtsHistoryTooltip = historyTooltip
  return scale
}

export function createConversationScaleAdapter({ document, window, sessions }) {
  let operation
  let scroller
  let composer
  let scale
  let preview
  let historyStatus
  let historyHint
  let mutationObserver
  let resizeObserver
  let previewObserver
  let previewSource
  let frame
  let waveFrame
  let snapTimer
  let touchTimer
  let previewDelayTimer
  let previewHideTimer
  let previewRefreshTimer
  let turns = []
  let resizeSettleTimer
  let resizeActive = false
  let layout
  let geometry
  let scaleOffset = 0
  let previousMaximum = 0
  let followBottom = true
  let cursorIndex = 0
  let hoverIndex = -1
  let previewIndex = -1
  let pendingPreviewIndex = -1
  let keyboardActive = false
  let pointerInside = false
  let pointerStart
  let lastDirectJump = 0
  let jumpRequest = 0
  let historyRequest = 0
  let historyMutationRevision = 0
  let historyAvailable = false
  let historyPhase = 'idle'
  let historyPages = 0
  let historyMessage = ''
  let historySessionKey
  let historyHintHovered = false
  let scanPending = false
  let fullScanPending = false
  let pendingMutations = []
  let obstructionDirty = true
  const overlayCandidates = new Set()
  let overlayScanPending = false
  let scaleObstructed = false
  let scaleBlockingObstructed = false
  let scaleSpaceObstructed = true
  let maximumDistance = CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE
  let focusContrast = CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT
  let scaleLengths = resolveConversationScaleLengths(focusContrast)
  let contentLeft
  let geometryDirty = true
  let geometrySettleFrame
  let geometrySettleFramesRemaining = 0
  let geometrySettleStableFrames = 0
  let geometrySettleSignature
  let observedOperationWidth
  let observedOperationHeight
  let started = false
  let failed = false
  let waveCenter = 0
  let waveIntensity = 0
  let waveStartCenter = 0
  let waveStartIntensity = 0
  let waveTargetCenter = 0
  let waveTargetIntensity = 0
  let waveStartedAt = 0

  const requestFrame = callback => window?.requestAnimationFrame?.(callback) ?? window?.setTimeout?.(callback, 0)
  const cancelFrame = id => {
    if (id === undefined) return
    if (window?.cancelAnimationFrame) window.cancelAnimationFrame(id)
    else window?.clearTimeout?.(id)
  }
  const currentTime = timestamp => Number.isFinite(timestamp)
    ? timestamp
    : window?.performance?.now?.() ?? Date.now()
  const phoneScaleHidden = () => Number(window?.innerWidth) <= 640

  function currentGeometrySignature() {
    if (!operation || !scroller) return undefined
    const operationBox = operation.getBoundingClientRect?.()
    const scrollerBox = scroller.getBoundingClientRect?.()
    const composerBox = composer?.getBoundingClientRect?.()
    if (!operationBox || !scrollerBox) return undefined
    const values = [
      operationBox.width,
      operationBox.height,
      scrollerBox.top - operationBox.top,
      scrollerBox.bottom - operationBox.top,
      scrollerBox.left - operationBox.left,
      scrollerBox.right - operationBox.left,
      composerBox ? composerBox.top - operationBox.top : -1,
      composerBox ? composerBox.bottom - operationBox.top : -1,
      composerBox ? composerBox.left - operationBox.left : -1,
      composerBox ? composerBox.right - operationBox.left : -1,
    ]
    if (!values.every(Number.isFinite)) return undefined
    return values.map(value => Number(value.toFixed(2))).join(':')
  }

  function sampleGeometryStabilization() {
    geometrySettleFrame = undefined
    if (!started || failed || geometrySettleFramesRemaining <= 0) return
    geometrySettleFramesRemaining -= 1
    const signature = currentGeometrySignature()
    if (signature === undefined) {
      geometrySettleStableFrames = 0
    } else if (signature !== geometrySettleSignature) {
      geometrySettleSignature = signature
      geometrySettleStableFrames = 1
      geometryDirty = true
      obstructionDirty = true
      schedule()
    } else {
      geometrySettleStableFrames += 1
    }
    if (geometrySettleStableFrames >= GEOMETRY_SETTLE_STABLE_FRAMES) {
      geometrySettleFramesRemaining = 0
      return
    }
    if (geometrySettleFramesRemaining > 0) {
      geometrySettleFrame = requestFrame(sampleGeometryStabilization)
    }
  }

  function requestGeometryStabilization() {
    if (!started || failed || phoneScaleHidden()) return
    geometrySettleFramesRemaining = GEOMETRY_SETTLE_FRAME_LIMIT
    geometrySettleStableFrames = 0
    if (geometrySettleFrame === undefined) {
      geometrySettleFrame = requestFrame(sampleGeometryStabilization)
    }
  }

  function stopGeometryStabilization() {
    cancelFrame(geometrySettleFrame)
    geometrySettleFrame = undefined
    geometrySettleFramesRemaining = 0
    geometrySettleStableFrames = 0
    geometrySettleSignature = undefined
  }

  function onHostGeometryChange() {
    if (phoneScaleHidden()) {
      stopGeometryStabilization()
      return
    }
    requestGeometryStabilization()
    schedule(true)
  }

  function reducedMotion() {
    return window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      || document.documentElement.dataset.prtsMotion === 'reduced'
  }

  function sampleWave(timestamp = currentTime()) {
    if (waveFrame === undefined) return
    const progress = clamp((currentTime(timestamp) - waveStartedAt) / CONVERSATION_SCALE_WAVE_DURATION, 0, 1)
    const eased = 1 - (1 - progress) ** 3
    waveCenter = waveStartCenter + (waveTargetCenter - waveStartCenter) * eased
    waveIntensity = waveStartIntensity + (waveTargetIntensity - waveStartIntensity) * eased
  }

  function animateWave(timestamp) {
    waveFrame = undefined
    if (!started || failed) return
    const time = currentTime(timestamp)
    const progress = clamp((time - waveStartedAt) / CONVERSATION_SCALE_WAVE_DURATION, 0, 1)
    const eased = 1 - (1 - progress) ** 3
    waveCenter = waveStartCenter + (waveTargetCenter - waveStartCenter) * eased
    waveIntensity = waveStartIntensity + (waveTargetIntensity - waveStartIntensity) * eased
    schedule()
    if (progress < 1) waveFrame = requestFrame(animateWave)
  }

  function retargetWave(index) {
    const time = currentTime()
    sampleWave(time)
    cancelFrame(waveFrame)
    waveFrame = undefined
    waveStartCenter = waveCenter
    waveStartIntensity = waveIntensity
    waveTargetCenter = index >= 0 ? index : waveCenter
    waveTargetIntensity = index >= 0 ? 1 : 0
    waveStartedAt = time
    if (reducedMotion()) {
      waveCenter = waveTargetCenter
      waveIntensity = waveTargetIntensity
      schedule()
      return
    }
    waveFrame = requestFrame(animateWave)
  }

  function resetWave() {
    cancelFrame(waveFrame)
    waveFrame = undefined
    waveCenter = 0
    waveIntensity = 0
    waveStartCenter = 0
    waveStartIntensity = 0
    waveTargetCenter = 0
    waveTargetIntensity = 0
    waveStartedAt = 0
  }

  function cancelJump() {
    jumpRequest += 1
  }

  function historyPrefix() {
    return historyAvailable ? 1 : 0
  }

  function scaleItemCount() {
    return turns.length + historyPrefix()
  }

  function scaleToTurnIndex(index) {
    return index - historyPrefix()
  }

  function turnToScaleIndex(index) {
    return index + historyPrefix()
  }

  function syncHistoryStatus() {
    if (!historyStatus || !scale) return
    const visible = historyPhase === 'loading' || historyPhase === 'paused' || historyPhase === 'error'
    historyStatus.hidden = !visible
    historyStatus.dataset.prtsHistoryPhase = historyPhase
    scale.dataset.prtsHistoryPhase = historyPhase
    scale.toggleAttribute('data-prts-conversation-history-available', historyAvailable)
    if (!visible) {
      syncHistoryHint()
      return
    }
    const page = historyPhase === 'loading' ? historyPages + 1 : historyPages
    const fallback = historyPhase === 'loading'
      ? `正在载入更早内容 · 第 ${page} 页`
      : historyPhase === 'error'
        ? historyMessage || '更早内容载入失败'
        : historyPages > 0
          ? `已载入 ${historyPages} 页 · 尚未到达开头`
          : '已载入部分内容 · 尚未到达开头'
    scale._prtsHistoryText.textContent = fallback
    scale._prtsHistoryAction.textContent = historyPhase === 'loading' ? '取消' : '继续'
    scale._prtsHistoryAction.setAttribute(
      'aria-label',
      historyPhase === 'loading' ? '取消前往会话开头' : '继续前往会话开头',
    )
    syncHistoryHint()
  }

  function syncHistoryHint() {
    if (!historyHint || !scale) return
    const railUnavailable = scaleSpaceObstructed || scaleBlockingObstructed || scaleObstructed
      || scaleItemCount() < MINIMUM_TURNS
    const visible = historyAvailable && historyPhase === 'idle' && !railUnavailable
    if (!visible) historyHintHovered = false
    const selected = visible && (
      historyHintHovered
      || (pointerInside && hoverIndex === 0)
    )
    historyHint.hidden = !visible
    historyHint.toggleAttribute('data-prts-history-selected', selected)
    scale.toggleAttribute('data-prts-conversation-history-selected', selected)
    const tooltip = scale._prtsHistoryTooltip
    tooltip.hidden = !selected
    tooltip.setAttribute('aria-hidden', String(!selected))
    const tooltipId = tooltip.id
    for (const target of [scale, scale._prtsHistoryTrigger]) {
      if (selected) target.setAttribute('aria-describedby', tooltipId)
      else if (target.getAttribute('aria-describedby') === tooltipId) target.removeAttribute('aria-describedby')
    }
  }

  function selectHistoryHint({ keyboard = false } = {}) {
    if (!historyAvailable || historyPhase !== 'idle') return
    keyboardActive = keyboard
    hoverIndex = 0
    cursorIndex = 0
    ensureVisible(0)
    retargetWave(0)
    syncAccessibility()
    schedule()
  }

  function setHistoryAvailable(next) {
    const available = Boolean(next)
    if (available === historyAvailable) return
    const previousPrefix = historyPrefix()
    historyAvailable = available
    const delta = historyPrefix() - previousPrefix
    if (cursorIndex >= previousPrefix) cursorIndex = Math.max(0, cursorIndex + delta)
    if (hoverIndex >= previousPrefix) hoverIndex = Math.max(0, hoverIndex + delta)
    if (!followBottom && scaleOffset > 0) scaleOffset = Math.max(0, scaleOffset + delta * CONVERSATION_SCALE_SPACING)
    geometryDirty = true
    syncHistoryStatus()
  }

  function readHistoryState() {
    const snapshot = resolveConversationHistorySnapshot(sessions)
    const olderButton = findConversationOlderButton(operation)
    if (snapshot.key !== undefined && snapshot.key !== historySessionKey) {
      historyRequest += 1
      historySessionKey = snapshot.key
      historyPages = 0
      historyPhase = 'idle'
      historyMessage = ''
    }
    const available = snapshot.hasMore || Boolean(olderButton) || historyPhase === 'loading'
    setHistoryAvailable(available)
    if (!available && historyPhase !== 'loading') {
      historyPhase = 'idle'
      historyMessage = ''
      syncHistoryStatus()
    }
    return { ...snapshot, olderButton }
  }

  function cancelHistory({ paused = true } = {}) {
    if (historyPhase !== 'loading') return
    historyRequest += 1
    historyPhase = paused && historyAvailable ? 'paused' : 'idle'
    historyMessage = ''
    syncHistoryStatus()
    schedule()
  }

  function cancelNavigation() {
    cancelJump()
    cancelHistory()
  }

  function onHistoryAction(event) {
    event.preventDefault()
    event.stopPropagation()
    if (historyPhase === 'loading') cancelHistory()
    else void loadHistoryToStart()
  }

  function onHistoryHintPointerEnter() {
    historyHintHovered = true
    selectHistoryHint()
  }

  function onHistoryHintPointerLeave() {
    historyHintHovered = false
    if (!pointerInside) {
      hoverIndex = -1
      retargetWave(-1)
    }
    schedule()
  }

  function schedule(scan = false) {
    if (scan) {
      scanPending = true
      fullScanPending = true
    }
    if (frame !== undefined || failed) return
    frame = requestFrame(flush)
  }

  function clearTimers() {
    for (const timer of [snapTimer, touchTimer, previewDelayTimer, previewHideTimer, previewRefreshTimer, resizeSettleTimer]) {
      if (timer !== undefined) window?.clearTimeout?.(timer)
    }
    snapTimer = undefined
    touchTimer = undefined
    previewDelayTimer = undefined
    previewHideTimer = undefined
    previewRefreshTimer = undefined
    resizeSettleTimer = undefined
  }

  function setScaleResizeState(active) {
    resizeActive = Boolean(active)
    for (const node of [scale, preview, historyHint, historyStatus, composer]) {
      if (!node || node.hasAttribute('data-prts-resizing') === resizeActive) continue
      node.toggleAttribute('data-prts-resizing', resizeActive)
    }
  }

  function disconnectPreviewObserver() {
    resizeSettleTimer = undefined
    previewObserver?.disconnect()
    previewObserver = undefined
    previewSource = undefined
  }

  function observePreviewSource(source) {
    if (source === previewSource) return
    disconnectPreviewObserver()
    const MutationObserver = window?.MutationObserver
    if (!source || typeof MutationObserver !== 'function') return
    previewSource = source
    previewObserver = new MutationObserver(queuePreviewRefresh)
    previewObserver.observe(source, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden', 'aria-hidden'],
    })
  }

  function resolveRoots() {
    const nextOperation = document?.querySelector?.('[data-prts-region="operation"]')
    const nextScroller = nextOperation?.querySelector?.('[data-conversation-scroll]')
    if (!nextOperation || !nextScroller) {
      if (operation || scroller || scale || preview) disconnectRoots()
      return false
    }
    const nextComposer = nextScroller.querySelector('[data-composer-seat], [data-slot="conversation.composer"]')
    if (operation === nextOperation && scroller === nextScroller && scale?.isConnected && preview?.isConnected
      && historyHint?.isConnected && historyStatus?.isConnected) {
      if (composer !== nextComposer) {
        if (composer) resizeObserver?.unobserve?.(composer)
        composer = nextComposer
        if (composer) resizeObserver?.observe(composer)
        geometryDirty = true
      }
      return true
    }

    disconnectRoots()
    operation = nextOperation
    scroller = nextScroller
    composer = nextComposer
    scale = createScale(document)
    preview = scale._prtsPreview
    historyHint = scale._prtsHistoryHint
    historyStatus = scale._prtsHistoryStatus
    operation.append(scale, preview, historyHint, historyStatus)
    scale._prtsHistoryTrigger.addEventListener('click', onHistoryAction)
    scale._prtsHistoryTrigger.addEventListener('pointerenter', onHistoryHintPointerEnter)
    scale._prtsHistoryTrigger.addEventListener('pointerleave', onHistoryHintPointerLeave)
    scale._prtsHistoryAction.addEventListener('click', onHistoryAction)
    scroller.setAttribute('data-prts-conversation-scale-ready', '')
    scale.addEventListener('pointermove', onPointerMove)
    scale.addEventListener('pointerleave', onPointerLeave)
    scale.addEventListener('pointerdown', onPointerDown)
    scale.addEventListener('pointerup', onPointerUp)
    scale.addEventListener('pointercancel', onPointerCancel)
    scale.addEventListener('click', onClick)
    scale.addEventListener('wheel', onWheel, { passive: false })
    scale.addEventListener('keydown', onKeydown)
    scale.addEventListener('focus', onFocus)
    scale.addEventListener('blur', onBlur)
    scroller.addEventListener('wheel', cancelNavigation, { passive: true })
    scroller.addEventListener('touchstart', cancelNavigation, { passive: true })
    scroller.addEventListener('pointerdown', cancelNavigation, { passive: true })
    resizeObserver?.observe(operation)
    resizeObserver?.observe(scroller)
    if (composer) resizeObserver?.observe(composer)
    turns = []
    scaleOffset = 0
    previousMaximum = 0
    followBottom = true
    obstructionDirty = true
    cursorIndex = 0
    hoverIndex = -1
    previewIndex = -1
    pendingPreviewIndex = -1
    contentLeft = undefined
    geometryDirty = true
    scaleSpaceObstructed = true
    overlayScanPending = true
    historyRequest += 1
    historyAvailable = false
    historyPhase = 'idle'
    historyPages = 0
    historyMessage = ''
    historySessionKey = undefined
    historyHintHovered = false
    setScaleResizeState(resizeActive)
    cancelJump()
    resetWave()
    requestGeometryStabilization()
    return true
  }

  function disconnectRoots() {
    stopGeometryStabilization()
    clearTimers()
    hidePreview()
    disconnectPreviewObserver()
    if (scroller) {
      scroller.removeAttribute('data-prts-conversation-scale-ready')
      scroller.removeAttribute('data-prts-conversation-scale-empty')
      scroller.removeEventListener('wheel', cancelNavigation)
      scroller.removeEventListener('touchstart', cancelNavigation)
      scroller.removeEventListener('pointerdown', cancelNavigation)
    }
    if (scale) {
      scale.removeEventListener('pointermove', onPointerMove)
      scale.removeEventListener('pointerleave', onPointerLeave)
      scale.removeEventListener('pointerdown', onPointerDown)
      scale.removeEventListener('pointerup', onPointerUp)
      scale.removeEventListener('pointercancel', onPointerCancel)
      scale.removeEventListener('click', onClick)
      scale.removeEventListener('wheel', onWheel)
      scale.removeEventListener('keydown', onKeydown)
      scale.removeEventListener('focus', onFocus)
      scale.removeEventListener('blur', onBlur)
      scale._prtsHistoryTrigger?.removeEventListener('click', onHistoryAction)
      scale._prtsHistoryTrigger?.removeEventListener('pointerenter', onHistoryHintPointerEnter)
      scale._prtsHistoryTrigger?.removeEventListener('pointerleave', onHistoryHintPointerLeave)
      scale._prtsHistoryAction?.removeEventListener('click', onHistoryAction)
      scale.remove()
    }
    preview?.remove()
    historyHint?.remove()
    historyStatus?.remove()
    resizeObserver?.disconnect()
    historyRequest += 1
    operation = undefined
    scroller = undefined
    composer = undefined
    scale = undefined
    preview = undefined
    historyHint = undefined
    historyStatus = undefined
    turns = []
    layout = undefined
    geometry = undefined
    hoverIndex = -1
    previewIndex = -1
    keyboardActive = false
    pointerInside = false
    pointerStart = undefined
    historyHintHovered = false
    resizeActive = false
    cancelJump()
    resetWave()
    overlayCandidates.clear()
    obstructionDirty = true
    overlayScanPending = false
    scaleObstructed = false
    scaleBlockingObstructed = false
    scaleSpaceObstructed = true
    contentLeft = undefined
    observedOperationWidth = undefined
    observedOperationHeight = undefined
    geometryDirty = true
    pendingMutations = []
    fullScanPending = false
  }

  function isTopLevelTurn(node) {
    if (!node?.matches?.(CONVERSATION_USER_TURN_SELECTOR) || !scroller?.contains(node) || !visible(node)) return false
    if (node.closest('[data-prts-conversation-scale], [data-prts-conversation-preview]')) return false
    const parent = node.parentElement?.closest?.(CONVERSATION_USER_TURN_SELECTOR)
    return !parent || !scroller.contains(parent)
  }

  function collectTurnsFromNode(node, target) {
    if (node?.nodeType !== 1) return
    if (node.matches?.(CONVERSATION_USER_TURN_SELECTOR)) target.add(node)
    for (const turn of node.querySelectorAll?.(CONVERSATION_USER_TURN_SELECTOR) ?? []) target.add(turn)
  }

  function collectOverlayCandidates(node) {
    if (node?.nodeType !== 1) return
    if (node.matches?.(CONVERSATION_OVERLAY_SELECTOR)) overlayCandidates.add(node)
    for (const candidate of node.querySelectorAll?.(CONVERSATION_OVERLAY_SELECTOR) ?? []) {
      overlayCandidates.add(candidate)
    }
  }

  function mutationNodeAffectsScale(node) {
    if (node?.nodeType !== 1) return false
    if (node.matches?.(CONVERSATION_OVERLAY_SELECTOR)
      || node.matches?.(CONVERSATION_PORTAL_ROOT_SELECTOR)
      || node.matches?.('[data-prts-region="operation"], [data-slot="conversation"]')) return true
    return Boolean(node.querySelector?.([
      CONVERSATION_OVERLAY_SELECTOR,
      CONVERSATION_PORTAL_ROOT_SELECTOR,
      '[data-prts-region="operation"]',
      '[data-slot="conversation"]',
    ].join(', ')))
  }

  function mutationAffectsTurns(mutation) {
    if (mutation.type === 'attributes') {
      if (mutation.attributeName === 'data-chat-flow-kind'
        || mutation.attributeName === 'data-message-role') return true
      if (mutation.target?.matches?.(CONVERSATION_USER_TURN_SELECTOR)
        || mutation.target?.querySelector?.(CONVERSATION_USER_TURN_SELECTOR)) return true
    }
    for (const node of [...(mutation.addedNodes ?? []), ...(mutation.removedNodes ?? [])]) {
      if (node?.nodeType !== 1) continue
      if (node.matches?.(CONVERSATION_USER_TURN_SELECTOR)
        || node.querySelector?.(CONVERSATION_USER_TURN_SELECTOR)) return true
    }
    return false
  }

  function mutationAffectsOverlay(mutation) {
    if (overlayCandidates.has(mutation.target)) return true
    if (mutationNodeAffectsScale(mutation.target)) return true
    for (const node of mutation.addedNodes ?? []) if (mutationNodeAffectsScale(node)) return true
    for (const node of mutation.removedNodes ?? []) {
      if (mutationNodeAffectsScale(node)) return true
      if ([...overlayCandidates].some(candidate => candidate === node || node?.contains?.(candidate))) return true
    }
    return false
  }

  function collectExternalOverlayCandidates() {
    for (const child of document?.body?.children ?? []) {
      if (child === operation || child.contains?.(operation)) continue
      collectOverlayCandidates(child)
    }
  }

  function updateOverlayCandidates(mutations, full = false) {
    if (full || overlayScanPending) {
      overlayCandidates.clear()
      collectOverlayCandidates(operation)
      collectExternalOverlayCandidates()
      overlayScanPending = false
    } else {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          if (mutation.target?.matches?.(CONVERSATION_OVERLAY_SELECTOR)) overlayCandidates.add(mutation.target)
          else overlayCandidates.delete(mutation.target)
        }
        for (const node of mutation.addedNodes ?? []) collectOverlayCandidates(node)
      }
    }
    for (const candidate of [...overlayCandidates]) {
      if (!candidate.isConnected) overlayCandidates.delete(candidate)
    }
  }

  function applyTurns(nextTurns) {
    const wasAtBottom = shouldFollowConversationScaleBottom(scaleOffset, previousMaximum)
    const previousList = turns
    const previousTurns = new Set(previousList)
    const previousCount = turns.length
    const previousPrefix = historyPrefix()
    const turnAtScaleIndex = index => previousList[index - previousPrefix]
    const cursorTurn = turnAtScaleIndex(cursorIndex)
    const hoverTurn = turnAtScaleIndex(hoverIndex)
    const cursorWasHistory = historyAvailable && cursorIndex === 0
    const hoverWasHistory = historyAvailable && hoverIndex === 0
    const previewTurn = previousList[previewIndex]
    const pendingPreviewTurn = previousList[pendingPreviewIndex]
    const previewWasVisible = previewIndex >= 0
    const anchorScaleIndex = layout
      ? nearestVisibleConversationTick(layout, .5)
      : -1
    const anchorTurn = turnAtScaleIndex(anchorScaleIndex)
    const anchorY = layout && anchorScaleIndex >= 0
      ? layout.start + anchorScaleIndex * CONVERSATION_SCALE_SPACING - scaleOffset
      : undefined
    const replaced = previousCount > 0 && nextTurns.length > 0 && !nextTurns.some(turn => previousTurns.has(turn))
    turns = nextTurns
    if (replaced || turns.length !== previousCount) geometryDirty = true
    if (replaced || turns.length > previousCount) cancelJump()
    followBottom = replaced || previousCount === 0 || (turns.length > previousCount && wasAtBottom)
    const nextScaleIndex = node => {
      const index = node ? turns.indexOf(node) : -1
      return index < 0 ? -1 : turnToScaleIndex(index)
    }
    cursorIndex = cursorWasHistory ? 0 : nextScaleIndex(cursorTurn)
    if (cursorIndex < 0) cursorIndex = Math.max(0, scaleItemCount() - 1)
    hoverIndex = hoverWasHistory ? 0 : nextScaleIndex(hoverTurn)
    previewIndex = previewTurn ? turns.indexOf(previewTurn) : -1
    pendingPreviewIndex = pendingPreviewTurn ? turns.indexOf(pendingPreviewTurn) : -1
    if (previewWasVisible && previewIndex < 0) hidePreview()
    if (!followBottom && anchorTurn && Number.isFinite(anchorY)) {
      const nextAnchor = nextScaleIndex(anchorTurn)
      if (nextAnchor >= 0) {
        scaleOffset = Math.max(0, nextAnchor * CONVERSATION_SCALE_SPACING + (layout?.start ?? .5) - anchorY)
      }
    }
    if ((previousCount === 0 || replaced) && turns.length) cursorIndex = scaleItemCount() - 1
    const empty = scaleItemCount() < MINIMUM_TURNS
    scale.dataset.prtsScaleCount = String(turns.length)
    scale.toggleAttribute('data-prts-conversation-scale-partial', historyAvailable)
    scale.toggleAttribute('data-prts-conversation-scale-empty', empty)
    scroller.toggleAttribute('data-prts-conversation-scale-empty', empty)
    syncAccessibility()
  }

  function syncTurns(mutations = [], full = false) {
    updateOverlayCandidates(mutations, full)
    const conversationMutations = mutations.filter(mutation => operation?.contains?.(mutation.target))
    if (full || !turns.length) {
      applyTurns(collectConversationTurns(scroller))
      return
    }
    const next = new Set(turns.filter(turn => turn.isConnected && scroller.contains(turn)))
    const touched = new Set()
    for (const mutation of conversationMutations) {
      if (mutation.type === 'attributes') {
        collectTurnsFromNode(mutation.target, touched)
        const closest = mutation.target?.closest?.(CONVERSATION_USER_TURN_SELECTOR)
        if (closest) touched.add(closest)
      }
      for (const node of mutation.addedNodes ?? []) collectTurnsFromNode(node, touched)
      for (const node of mutation.removedNodes ?? []) {
        if (node?.nodeType !== 1) continue
        for (const turn of next) {
          if (turn === node || node.contains?.(turn)) next.delete(turn)
        }
      }
    }
    for (const turn of touched) {
      if (isTopLevelTurn(turn)) next.add(turn)
      else next.delete(turn)
    }
    const ordered = [...next].filter(isTopLevelTurn).sort((left, right) => {
      if (left === right) return 0
      return follows(left, right) ? -1 : 1
    })
    applyTurns(ordered)
  }

  function representativeContentLeft(operationBox) {
    if (!geometryDirty) return contentLeft
    const assistant = scroller.querySelector?.([
      '[data-prts-ai-surface]:not([hidden])',
      '[data-chat-flow-kind="assistant-step"]:not([hidden])',
      '[data-message-role="assistant"]:not([hidden])',
    ].join(', '))
    const representatives = [assistant, turns[0], turns.at(-1)].filter(Boolean)
    const positions = []
    for (const node of representatives) {
      if (!visible(node)) continue
      const style = window?.getComputedStyle?.(node)
      if (style?.display === 'none' || style?.visibility === 'hidden') continue
      const box = node.getBoundingClientRect?.()
      if (!box || box.width <= 0 || box.height <= 0) continue
      positions.push(box.left - operationBox.left)
    }
    contentLeft = positions.length ? Math.min(...positions) : undefined
    geometryDirty = false
    return contentLeft
  }

  function visibleGeometry() {
    const operationBox = operation.getBoundingClientRect()
    const scrollerBox = scroller.getBoundingClientRect()
    const composerBox = composer?.getBoundingClientRect?.()
    const top = clamp(scrollerBox.top - operationBox.top + 12, 8, Math.max(8, operationBox.height - 92))
    const bottomEdge = composerBox && composerBox.height > 0 && composerBox.top < operationBox.bottom
      ? composerBox.top - operationBox.top - 12
      : Math.min(scrollerBox.bottom, operationBox.bottom) - operationBox.top - 18
    const height = Math.max(84, bottomEdge - top)
    const drawerMode = document.documentElement.dataset.prtsDrawerMode
    const scaleGeometry = drawerMode === 'overlay'
      ? { visible: false, reason: 'drawer' }
      : window.innerWidth <= 640
        ? { visible: false, reason: 'phone' }
        : resolveConversationScaleGeometry({
          operationWidth: operationBox.width,
          contentLeft: representativeContentLeft(operationBox),
          maximumDistance,
          previouslyHidden: scaleSpaceObstructed,
        })
    const left = Number.isFinite(scaleGeometry.left)
      ? scaleGeometry.left
      : CONVERSATION_SCALE_CONTENT_GAP
    return { operationBox, scrollerBox, composerBox, top, height, left, scaleGeometry }
  }

  function boxesIntersect(left, right) {
    return left.right > right.left
      && left.left < right.right
      && left.bottom > right.top
      && left.top < right.bottom
  }

  function overlayIntersects(candidate, targets) {
    if (!candidate?.isConnected || candidate.hidden || candidate.getAttribute('aria-hidden') === 'true') return false
    if (candidate.closest?.('[data-prts-owned-conversation-scale], [data-prts-owned-conversation-preview]')) return false
    const style = window?.getComputedStyle?.(candidate)
    if (style?.display === 'none' || style?.visibility === 'hidden' || style?.opacity === '0') return false
    const box = candidate.getBoundingClientRect?.()
    if (!box || box.width <= 0 || box.height <= 0) return false
    return targets.some(target => target?.width > 0 && target?.height > 0 && boxesIntersect(box, target))
  }

  function blockingOverlay(candidate) {
    if (candidate?.matches?.(CONVERSATION_BLOCKING_OVERLAY_SELECTOR)) return true
    const plugin = candidate?.matches?.('[data-plugin]') ? candidate : candidate?.closest?.('[data-plugin]')
    return Boolean(plugin
      && plugin.getAttribute('data-plugin') !== 'dsh-theme-prts'
      && plugin.closest?.('[data-shell-overlay], [data-slot="shell.overlay"]'))
  }

  function syncScaleInteractiveState() {
    if (!scale) return true
    const hidden = scaleSpaceObstructed || scaleBlockingObstructed || scaleObstructed || scaleItemCount() < MINIMUM_TURNS
    const wasHidden = scale.tabIndex === -1
    if (hidden && !wasHidden) {
      hidePreview()
      pointerInside = false
      hoverIndex = -1
      keyboardActive = false
      retargetWave(-1)
      scale.tabIndex = -1
      scale.setAttribute('aria-hidden', 'true')
      if (document.activeElement === scale) scale.blur?.()
    } else if (!hidden && wasHidden) {
      scale.tabIndex = 0
      scale.removeAttribute('aria-hidden')
    }
    syncHistoryHint()
    return hidden
  }

  function syncScaleSpaceObstruction(resolution) {
    const obstructed = !resolution.visible
    scaleSpaceObstructed = obstructed
    scale.toggleAttribute('data-prts-conversation-scale-space-obstructed', obstructed)
    if (obstructed) scale.dataset.prtsScaleHiddenReason = resolution.reason || 'space'
    else delete scale.dataset.prtsScaleHiddenReason
    scale.toggleAttribute('data-prts-conversation-scale-centered', Boolean(resolution.centered))
    syncScaleInteractiveState()
    return scaleSpaceObstructed || scaleItemCount() < MINIMUM_TURNS
  }

  function syncScaleObstruction(currentGeometry) {
    if (!scale) return false
    obstructionDirty = false
    if (scaleSpaceObstructed) {
      scaleBlockingObstructed = false
      scaleObstructed = false
      scale.removeAttribute('data-prts-conversation-scale-blocked')
      scale.removeAttribute('data-prts-conversation-scale-obstructed')
      syncScaleInteractiveState()
      return false
    }
    const candidates = [...overlayCandidates]
    const operationBox = currentGeometry?.operationBox
    const blocked = Boolean(operationBox?.width && operationBox?.height)
      && candidates.some(candidate => blockingOverlay(candidate) && overlayIntersects(candidate, [operationBox]))
    const scaleBox = scale.getBoundingClientRect?.()
    const previewBox = preview?.hasAttribute?.('data-prts-conversation-preview-visible')
      ? preview.getBoundingClientRect?.()
      : undefined
    const historyHintBox = historyHint && !historyHint.hidden
      ? historyHint.getBoundingClientRect?.()
      : undefined
    const historyTooltipBox = scale._prtsHistoryTooltip && !scale._prtsHistoryTooltip.hidden
      ? scale._prtsHistoryTooltip.getBoundingClientRect?.()
      : undefined
    const historyStatusBox = historyStatus && !historyStatus.hidden
      ? historyStatus.getBoundingClientRect?.()
      : undefined
    const localTargets = [scaleBox, previewBox, historyHintBox, historyTooltipBox, historyStatusBox].filter(Boolean)
    const obstructed = !blocked
      && localTargets.length > 0
      && candidates.some(candidate => !blockingOverlay(candidate) && overlayIntersects(candidate, localTargets))
    scaleBlockingObstructed = blocked
    scaleObstructed = obstructed
    scale.toggleAttribute('data-prts-conversation-scale-blocked', blocked)
    scale.toggleAttribute('data-prts-conversation-scale-obstructed', obstructed)
    syncScaleInteractiveState()
    return blocked || obstructed
  }

  function positionPreview(index) {
    if (!preview || !layout || !geometry || index < 0 || index >= layout.count) return
    const scaleIndex = turnToScaleIndex(index)
    const tickY = clamp(layout.positions[scaleIndex], .5, layout.height - .5)
    const anchor = geometry.top + tickY
    const previewBox = preview.getBoundingClientRect?.()
    const measuredHeight = previewBox?.height || preview.offsetHeight || PREVIEW_FALLBACK_HEIGHT
    const maximumTop = Math.max(geometry.top, geometry.top + geometry.height - measuredHeight)
    const top = clamp(anchor - measuredHeight / 2, geometry.top, maximumTop)
    const left = geometry.left + SCALE_WIDTH + PREVIEW_GAP
    preview.style.left = `${Number(left.toFixed(2))}px`
    preview.style.top = `${Number(top.toFixed(2))}px`
    preview.style.setProperty('--prts-preview-anchor-y', `${Number(clamp(anchor - top, 1, measuredHeight - 1).toFixed(2))}px`)
  }

  function render() {
    if (!operation || !scroller || !scale) return
    geometry = visibleGeometry()
    scale.style.top = `${Number(geometry.top.toFixed(2))}px`
    scale.style.left = `${Number(geometry.left.toFixed(2))}px`
    scale.style.height = `${Number(geometry.height.toFixed(2))}px`
    historyStatus.style.top = `${Number(geometry.top.toFixed(2))}px`
    historyStatus.style.left = `${Number((geometry.left + SCALE_WIDTH + PREVIEW_GAP).toFixed(2))}px`
    scale.dataset.prtsScaleMaxDistance = String(maximumDistance)
    scale.dataset.prtsScaleFocusContrast = String(focusContrast)
    syncHistoryStatus()
    if (syncScaleSpaceObstruction(geometry.scaleGeometry)) return
    if (obstructionDirty) {
      if (syncScaleObstruction(geometry)) return
    } else if (scaleBlockingObstructed || scaleObstructed) {
      return
    }

    const provisional = getConversationScaleLayout(scaleItemCount(), geometry.height, scaleOffset)
    if (followBottom) scaleOffset = provisional.maxOffset
    layout = getConversationScaleLayout(scaleItemCount(), geometry.height, scaleOffset)
    scaleOffset = layout.offset
    previousMaximum = layout.maxOffset
    followBottom = false
    const historyY = layout.positions[0] ?? .5
    historyHint.style.top = `${Number((geometry.top + historyY).toFixed(2))}px`
    historyHint.style.left = `${Number(geometry.left.toFixed(2))}px`
    syncHistoryHint()
    const historyAnchor = geometry.top + historyY
    const historyTooltipTop = clamp(
      historyAnchor - PREVIEW_FALLBACK_HEIGHT / 2,
      geometry.top,
      Math.max(geometry.top, geometry.top + geometry.height - PREVIEW_FALLBACK_HEIGHT),
    )
    const historyTooltip = scale._prtsHistoryTooltip
    historyTooltip.style.setProperty('--prts-history-tooltip-top', `${Number((historyTooltipTop - historyAnchor + HISTORY_TRIGGER_HEIGHT / 2).toFixed(2))}px`)
    historyTooltip.style.setProperty('--prts-history-tooltip-anchor-y', `${Number(clamp(historyAnchor - historyTooltipTop, 1, PREVIEW_FALLBACK_HEIGHT - 1).toFixed(2))}px`)

    const interactionIndex = hoverIndex >= 0
      ? hoverIndex
      : keyboardActive && scale.matches(':focus') ? cursorIndex : -1
    const paths = buildConversationScalePaths(layout, interactionIndex, {
      center: waveCenter,
      intensity: waveIntensity,
      historyAvailable,
    }, scaleLengths)
    scale._prtsSvg.setAttribute('viewBox', `0 0 ${SCALE_WIDTH} ${layout.height}`)
    scale._prtsGray.setAttribute('d', paths.gray)
    scale._prtsAccent.setAttribute('d', paths.yellow)
    scale._prtsHistory.setAttribute('d', paths.history)
    scale._prtsHit.setAttribute('height', String(layout.height))
    scale._prtsMask.setAttribute('height', String(layout.height))
    scale._prtsMaskRect.setAttribute('height', String(layout.height))
    if (scaleOffset > 0) {
      scale._prtsMarks.setAttribute('mask', `url(#${scale._prtsMaskId})`)
      scale.setAttribute('data-prts-conversation-scale-top-fade', '')
    } else {
      scale._prtsMarks.removeAttribute('mask')
      scale.removeAttribute('data-prts-conversation-scale-top-fade')
    }
    scale.dataset.prtsScaleCount = String(turns.length)
    scale.toggleAttribute('data-prts-conversation-scale-partial', historyAvailable)
    scale.dataset.prtsScaleOffset = String(Number(scaleOffset.toFixed(2)))
    scale.dataset.prtsScaleMaximum = String(Number(layout.maxOffset.toFixed(2)))
    if (interactionIndex >= 0) scale.dataset.prtsScaleWave = String(interactionIndex + 1)
    else delete scale.dataset.prtsScaleWave
    if (previewIndex >= 0) positionPreview(previewIndex)
    syncAccessibility()
  }

  function syncAccessibility() {
    if (!scale) return
    const maximum = Math.max(1, scaleItemCount())
    const current = clamp(cursorIndex + 1, 1, maximum)
    scale.setAttribute('aria-valuemin', '1')
    scale.setAttribute('aria-valuemax', String(maximum))
    scale.setAttribute('aria-valuenow', String(current))
    scale.setAttribute(
      'aria-valuetext',
      historyAvailable && cursorIndex === 0
        ? '更早内容尚未载入，按回车前往会话开头'
        : turns.length
          ? `当前已载入第 ${scaleToTurnIndex(cursorIndex) + 1} 轮，共 ${turns.length} 轮${historyAvailable ? '，前方仍有更早内容' : ''}`
          : '无可用会话刻度',
    )
  }

  function flush() {
    frame = undefined
    if (!started || failed) return
    try {
      if (!resolveRoots()) return
      readHistoryState()
      if (scanPending) {
        scanPending = false
        const mutations = pendingMutations
        const full = fullScanPending
        pendingMutations = []
        fullScanPending = false
        syncTurns(mutations, full)
      }
      render()
    } catch {
      failed = true
      disconnectRoots()
    }
  }

  function localIndex(event) {
    if (!layout || scaleItemCount() < MINIMUM_TURNS) return -1
    const box = scale.getBoundingClientRect()
    return nearestVisibleConversationTick(layout, event.clientY - box.top)
  }

  function ensureVisible(index) {
    if (!layout || index < 0) return
    const target = layout.start + index * CONVERSATION_SCALE_SPACING - scaleOffset
    if (target < .5) scaleOffset += target - .5
    else if (target > layout.height - .5) scaleOffset += target - (layout.height - .5)
    scaleOffset = clamp(scaleOffset, 0, layout.maxOffset)
  }

  function animatePreviewContent() {
    if (reducedMotion() || typeof preview?._prtsBody?.animate !== 'function') return
    preview._prtsBody.animate([
      { opacity: .28 },
      { opacity: 1 },
    ], { duration: 70, easing: 'ease-out' })
  }

  function updatePreviewContent(index, animate = false) {
    if (!preview || index < 0 || index >= turns.length) return
    const content = getConversationTurnPreview(scroller, turns, index)
    const changed = preview._prtsQuestion.textContent !== content.question
      || preview._prtsAnswer.textContent !== content.answer
    preview._prtsQuestion.textContent = content.question
    preview._prtsAnswer.textContent = content.answer
    preview.dataset.prtsPreviewState = content.state
    preview.dataset.prtsPreviewTurn = String(index + 1)
    observePreviewSource(content.answerSource)
    if (changed && animate && preview.hasAttribute('data-prts-conversation-preview-visible')) animatePreviewContent()
  }

  function showPreview(index, { animate = true, temporary = false } = {}) {
    if (!preview || index < 0 || index >= turns.length) return
    if (previewDelayTimer !== undefined) window?.clearTimeout?.(previewDelayTimer)
    if (previewHideTimer !== undefined) window?.clearTimeout?.(previewHideTimer)
    previewDelayTimer = undefined
    previewHideTimer = undefined
    pendingPreviewIndex = -1
    const switched = previewIndex !== index
    previewIndex = index
    updatePreviewContent(index, animate && switched)
    preview.setAttribute('data-prts-conversation-preview-visible', '')
    preview.setAttribute('aria-hidden', 'false')
    scale?.setAttribute('aria-describedby', preview.id)
    positionPreview(index)
    if (temporary) {
      previewHideTimer = window?.setTimeout?.(() => {
        previewHideTimer = undefined
        hidePreview()
      }, PREVIEW_TOUCH_DURATION)
    }
  }

  function queuePreview(index) {
    if (index < 0 || index >= turns.length) return
    if (preview?.hasAttribute('data-prts-conversation-preview-visible')) {
      showPreview(index)
      return
    }
    if (pendingPreviewIndex === index && previewDelayTimer !== undefined) return
    if (previewDelayTimer !== undefined) window?.clearTimeout?.(previewDelayTimer)
    pendingPreviewIndex = index
    previewDelayTimer = window?.setTimeout?.(() => {
      previewDelayTimer = undefined
      const pending = pendingPreviewIndex
      pendingPreviewIndex = -1
      if (pointerInside && scaleToTurnIndex(hoverIndex) === pending) showPreview(pending)
    }, PREVIEW_DELAY)
  }

  function hidePreview() {
    if (previewDelayTimer !== undefined) window?.clearTimeout?.(previewDelayTimer)
    if (previewHideTimer !== undefined) window?.clearTimeout?.(previewHideTimer)
    if (previewRefreshTimer !== undefined) window?.clearTimeout?.(previewRefreshTimer)
    previewDelayTimer = undefined
    previewHideTimer = undefined
    previewRefreshTimer = undefined
    pendingPreviewIndex = -1
    previewIndex = -1
    disconnectPreviewObserver()
    preview?.removeAttribute('data-prts-conversation-preview-visible')
    preview?.setAttribute('aria-hidden', 'true')
    scale?.removeAttribute('aria-describedby')
  }

  function queuePreviewRefresh() {
    if (previewIndex < 0 || previewRefreshTimer !== undefined) return
    previewRefreshTimer = window?.setTimeout?.(() => {
      previewRefreshTimer = undefined
      if (previewIndex >= 0) {
        updatePreviewContent(previewIndex, true)
        positionPreview(previewIndex)
      }
    }, PREVIEW_REFRESH_INTERVAL)
  }

  function wait(milliseconds) {
    return new Promise(resolve => window?.setTimeout?.(resolve, milliseconds))
  }

  async function waitForHistoryPage(request, before, deadline) {
    let sawLoading = false
    while (Date.now() < deadline) {
      await wait(40)
      if (request !== historyRequest) return 'cancelled'
      const state = readHistoryState()
      sawLoading ||= state.loading || Boolean(state.olderButton?.disabled)
      const firstTurn = collectConversationTurns(scroller)[0]
      const progressed = historyMutationRevision > before.revision
        && (firstTurn !== before.firstTurn || !state.loading)
      if (!state.hasMore && !state.olderButton && !state.loading) return 'complete'
      if (progressed && !state.loading && !state.olderButton?.disabled) return 'progress'
      if (sawLoading && !state.loading && !state.olderButton?.disabled) return 'progress'
    }
    return 'timeout'
  }

  async function loadHistoryToStart() {
    if (!operation || !scroller || historyPhase === 'loading') return
    const initial = readHistoryState()
    if (!historyAvailable) {
      if (turns[0]) jump(0)
      return
    }
    const request = historyRequest + 1
    historyRequest = request
    const startedAt = Date.now()
    const sessionKey = initial.key
    let loadedThisRun = 0
    historyPhase = 'loading'
    historyMessage = ''
    hidePreview()
    syncHistoryStatus()
    schedule()

    while (loadedThisRun < CONVERSATION_HISTORY_PAGE_LIMIT
      && Date.now() - startedAt < CONVERSATION_HISTORY_TIME_LIMIT) {
      if (request !== historyRequest) return
      const state = readHistoryState()
      if (sessionKey !== undefined && state.key !== undefined && state.key !== sessionKey) {
        cancelHistory({ paused: false })
        return
      }
      if (!state.hasMore && !state.olderButton && !state.loading) {
        setHistoryAvailable(false)
        historyPhase = 'idle'
        syncTurns([], true)
        schedule()
        if (turns[0]) jump(0)
        return
      }
      if (state.loading || state.olderButton?.disabled) {
        const result = await waitForHistoryPage(
          request,
          {
            firstTurn: collectConversationTurns(scroller)[0],
            revision: historyMutationRevision,
          },
          Math.min(startedAt + CONVERSATION_HISTORY_TIME_LIMIT, Date.now() + HISTORY_PAGE_SETTLE_LIMIT),
        )
        if (result === 'cancelled') return
        if (result === 'timeout') {
          historyPhase = 'error'
          historyMessage = '载入超时，可继续重试'
          break
        }
        historyPages += 1
        loadedThisRun += 1
        syncTurns([], true)
        syncHistoryStatus()
        schedule()
        continue
      }
      if (!state.olderButton) {
        const availableDeadline = Math.min(startedAt + CONVERSATION_HISTORY_TIME_LIMIT, Date.now() + 600)
        while (request === historyRequest && Date.now() < availableDeadline && !findConversationOlderButton(operation)) {
          await wait(40)
        }
      }
      const button = findConversationOlderButton(operation)
      if (!button || button.disabled) {
        historyPhase = 'error'
        historyMessage = '暂时无法载入更早内容'
        break
      }
      const before = {
        firstTurn: collectConversationTurns(scroller)[0],
        revision: historyMutationRevision,
      }
      button.click()
      const result = await waitForHistoryPage(
        request,
        before,
        Math.min(startedAt + CONVERSATION_HISTORY_TIME_LIMIT, Date.now() + HISTORY_PAGE_SETTLE_LIMIT),
      )
      if (result === 'cancelled') return
      if (result === 'timeout') {
        historyPhase = 'error'
        historyMessage = '载入超时，可继续重试'
        break
      }
      historyPages += 1
      loadedThisRun += 1
      syncTurns([], true)
      syncHistoryStatus()
      schedule()
    }

    if (request !== historyRequest) return
    const finalState = readHistoryState()
    if (!finalState.hasMore && !finalState.olderButton && !finalState.loading) {
      setHistoryAvailable(false)
      historyPhase = 'idle'
      syncTurns([], true)
      if (turns[0]) jump(0)
    } else if (historyPhase === 'loading') {
      historyPhase = 'paused'
    }
    syncHistoryStatus()
    schedule()
  }

  function jump(index) {
    const turn = turns[index]
    if (!turn || !scroller || !operation) return
    const jumpScroller = scroller
    const jumpOperation = operation
    const jumpComposer = composer
    const request = jumpRequest + 1
    jumpRequest = request
    const getTargetTop = () => {
      if (!turn.isConnected || scroller !== jumpScroller || operation !== jumpOperation) return Number.NaN
      const operationBox = jumpOperation.getBoundingClientRect()
      const scrollerBox = jumpScroller.getBoundingClientRect()
      const composerBox = jumpComposer?.getBoundingClientRect?.()
      const visibleTop = Math.max(scrollerBox.top, operationBox.top)
      const visibleBottom = Math.min(scrollerBox.bottom, operationBox.bottom, composerBox?.top ?? operationBox.bottom)
      return calculateConversationJumpTop({
        scrollTop: jumpScroller.scrollTop,
        scrollHeight: jumpScroller.scrollHeight,
        clientHeight: jumpScroller.clientHeight,
        turnTop: turn.getBoundingClientRect().top,
        visibleTop,
        visibleHeight: Math.max(0, visibleBottom - visibleTop),
      })
    }
    void performConversationJump({
      scroller: jumpScroller,
      getTargetTop,
      prefersReducedMotion: reducedMotion(),
      requestFrame,
      now: () => currentTime(),
      cancelled: () => request !== jumpRequest,
      onFrame: schedule,
    }).catch(() => {
      if (request === jumpRequest) cancelJump()
    })
    cursorIndex = turnToScaleIndex(index)
    syncAccessibility()
  }

  function showScalePreview(index, options) {
    const turnIndex = scaleToTurnIndex(index)
    if (turnIndex < 0) {
      hidePreview()
      return
    }
    showPreview(turnIndex, options)
  }

  function queueScalePreview(index) {
    const turnIndex = scaleToTurnIndex(index)
    if (turnIndex < 0) {
      hidePreview()
      return
    }
    queuePreview(turnIndex)
  }

  function activateScaleIndex(index, options) {
    if (historyAvailable && index === 0) {
      hidePreview()
      void loadHistoryToStart()
      return
    }
    const turnIndex = scaleToTurnIndex(index)
    if (turnIndex < 0) return
    showPreview(turnIndex, options)
    jump(turnIndex)
  }

  function showWave(index, temporary = false) {
    if (index < 0) return
    hoverIndex = index
    cursorIndex = index
    ensureVisible(index)
    retargetWave(index)
    if (touchTimer !== undefined) window?.clearTimeout?.(touchTimer)
    if (temporary) {
      touchTimer = window?.setTimeout?.(() => {
        touchTimer = undefined
        hoverIndex = -1
        retargetWave(-1)
        schedule()
      }, TOUCH_WAVE_DURATION)
    }
    schedule()
  }

  function onPointerMove(event) {
    if (event.pointerType === 'touch') return
    pointerInside = true
    keyboardActive = false
    const index = localIndex(event)
    if (index === hoverIndex) return
    showWave(index)
    queueScalePreview(index)
  }

  function onPointerLeave(event) {
    if (event.pointerType === 'touch') return
    pointerInside = false
    hoverIndex = -1
    retargetWave(-1)
    hidePreview()
    schedule()
  }

  function onPointerDown(event) {
    cancelNavigation()
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    pointerInside = true
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }
    scale.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }

  function onPointerUp(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId) return
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
    pointerStart = undefined
    if (event.pointerType === 'touch') pointerInside = false
    scale.releasePointerCapture?.(event.pointerId)
    if (distance > 8) return
    const index = localIndex(event)
    if (index < 0) return
    lastDirectJump = Date.now()
    keyboardActive = false
    showWave(index, true)
    activateScaleIndex(index, { temporary: true })
    scale.focus({ preventScroll: true })
    event.preventDefault()
  }

  function onPointerCancel(event) {
    if (pointerStart?.id === event.pointerId) {
      pointerStart = undefined
      if (event.pointerType === 'touch') pointerInside = false
    }
  }

  function onClick(event) {
    if (Date.now() - lastDirectJump < 300) return
    keyboardActive = false
    const index = localIndex(event)
    if (index < 0) return
    showWave(index)
    activateScaleIndex(index)
    scale.focus({ preventScroll: true })
  }

  function queueSnap() {
    if (snapTimer !== undefined) window?.clearTimeout?.(snapTimer)
    snapTimer = window?.setTimeout?.(() => {
      snapTimer = undefined
      if (!layout) return
      scaleOffset = snapConversationScaleOffset(scaleOffset, layout.maxOffset)
      schedule()
    }, SNAP_DELAY)
  }

  function onWheel(event) {
    cancelNavigation()
    event.preventDefault()
    event.stopPropagation()
    hidePreview()
    if (!layout || layout.maxOffset <= 0) return
    const factor = event.deltaMode === 1 ? CONVERSATION_SCALE_SPACING : event.deltaMode === 2 ? layout.height : 1
    scaleOffset = clamp(scaleOffset + event.deltaY * factor, 0, layout.maxOffset)
    keyboardActive = false
    hoverIndex = -1
    retargetWave(-1)
    schedule()
    queueSnap()
  }

  function page(direction) {
    if (!layout) return
    const distance = Math.max(CONVERSATION_SCALE_SPACING, Math.floor(layout.height / CONVERSATION_SCALE_SPACING) * CONVERSATION_SCALE_SPACING)
    scaleOffset = clamp(scaleOffset + direction * distance, 0, layout.maxOffset)
    const edgeY = direction < 0 ? .5 : layout.height - .5
    const nextLayout = getConversationScaleLayout(scaleItemCount(), layout.height, scaleOffset)
    cursorIndex = nearestVisibleConversationTick(nextLayout, edgeY)
    hoverIndex = cursorIndex
    retargetWave(cursorIndex)
    showScalePreview(cursorIndex)
    schedule()
  }

  function onKeydown(event) {
    if (scaleItemCount() < MINIMUM_TURNS) return
    if (event.key === 'Escape' && historyPhase === 'loading') {
      cancelHistory()
      event.preventDefault()
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      keyboardActive = true
      cursorIndex = clamp(cursorIndex + (event.key === 'ArrowUp' ? -1 : 1), 0, scaleItemCount() - 1)
      hoverIndex = cursorIndex
      ensureVisible(cursorIndex)
      showScalePreview(cursorIndex)
    } else if (event.key === 'Home' || event.key === 'End') {
      keyboardActive = true
      cursorIndex = event.key === 'Home' ? 0 : scaleItemCount() - 1
      hoverIndex = cursorIndex
      ensureVisible(cursorIndex)
      showScalePreview(cursorIndex)
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      keyboardActive = true
      page(event.key === 'PageUp' ? -1 : 1)
      event.preventDefault()
      return
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateScaleIndex(cursorIndex)
      return
    } else return
    event.preventDefault()
    retargetWave(cursorIndex)
    schedule()
  }

  function onFocus() {
    ensureVisible(cursorIndex)
    schedule()
  }

  function onBlur() {
    keyboardActive = false
    hoverIndex = -1
    retargetWave(-1)
    if (!pointerInside) hidePreview()
    schedule()
  }

  return {
    getCalibrationState(candidate = maximumDistance) {
      if (!started || failed || (!operation && !resolveRoots())) {
        const fallback = resolveConversationScaleCalibrationState({
          maximumDistance: candidate,
          viewportWidth: window?.innerWidth,
        })
        return { ...fallback, simulated: true }
      }
      const cachedOperationBox = geometry?.operationBox
      const operationBox = cachedOperationBox ?? operation.getBoundingClientRect?.()
      const cachedContentLeft = Number.isFinite(contentLeft) ? contentLeft : undefined
      return resolveConversationScaleCalibrationState({
        operationWidth: operationBox?.width,
        contentLeft: cachedContentLeft ?? representativeContentLeft(operationBox),
        maximumDistance: candidate,
        turnCount: turns.length,
        drawerMode: document.documentElement.dataset.prtsDrawerMode,
        viewportWidth: window?.innerWidth,
        previouslyHidden: scaleSpaceObstructed,
      })
    },
    update(nextPreferences = {}) {
      const distanceNumeric = Number(nextPreferences.conversationScaleMaxDistance)
      const nextDistance = Number.isFinite(distanceNumeric)
        ? clamp(Math.round(distanceNumeric / 8) * 8, 16, 240)
        : CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE
      const contrastNumeric = Number(nextPreferences.conversationScaleFocusContrast)
      const nextContrast = Number.isFinite(contrastNumeric)
        ? clamp(Math.round(contrastNumeric / 10) * 10, 0, 100)
        : CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT
      if (nextDistance === maximumDistance && nextContrast === focusContrast) return
      maximumDistance = nextDistance
      if (nextContrast !== focusContrast) {
        focusContrast = nextContrast
        scaleLengths = resolveConversationScaleLengths(focusContrast)
      }
      schedule()
    },
    start() {
      if (started || !document) return
      started = true
      failed = false
      window?.addEventListener?.('resize', onHostGeometryChange)
      window?.addEventListener?.('orientationchange', onHostGeometryChange)
      window?.addEventListener?.('pageshow', onHostGeometryChange)
      window?.visualViewport?.addEventListener?.('resize', onHostGeometryChange)
      const ResizeObserver = window?.ResizeObserver
      if (typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver((entries = []) => {
          geometryDirty = true
          if (phoneScaleHidden()) {
            stopGeometryStabilization()
            if (resizeSettleTimer !== undefined) window?.clearTimeout?.(resizeSettleTimer)
            resizeSettleTimer = undefined
            setScaleResizeState(false)
            return
          }
          requestGeometryStabilization()
          const operationEntry = entries.find(entry => entry.target === operation)
          const width = Number(operationEntry?.contentRect?.width)
          const height = Number(operationEntry?.contentRect?.height)
          const operationChanged = !entries.length || Boolean(operationEntry) && (
            !Number.isFinite(width)
            || !Number.isFinite(height)
            || width !== observedOperationWidth
            || height !== observedOperationHeight
          )
          if (operationEntry) {
            if (Number.isFinite(width)) observedOperationWidth = width
            if (Number.isFinite(height)) observedOperationHeight = height
          }
          if (!operationChanged) {
            schedule()
            return
          }
          if (!resizeActive) {
            schedule()
            setScaleResizeState(true)
          }
          if (resizeSettleTimer !== undefined) window?.clearTimeout?.(resizeSettleTimer)
          resizeSettleTimer = window?.setTimeout?.(() => {
            resizeSettleTimer = undefined
            obstructionDirty = true
            setScaleResizeState(false)
            schedule()
          }, 160)
        })
      }
      const MutationObserver = window?.MutationObserver
      if (typeof MutationObserver === 'function' && document.body) {
        mutationObserver = new MutationObserver(mutations => {
          const external = mutations.filter(mutation =>
            !mutation.target?.closest?.('[data-prts-conversation-scale], [data-prts-conversation-preview], [data-prts-conversation-history-hint], [data-prts-conversation-history-status]')
          )
          if (phoneScaleHidden()) return
          if (external.some(mutation =>
            operation?.contains?.(mutation.target)
            || mutation.target?.contains?.(operation)
            || mutation.target?.matches?.('header, [data-host-header], [data-slot*="header" i]')
            || mutationAffectsOverlay(mutation)
          )) requestGeometryStabilization()
          const historyRelevant = external.some(mutation =>
            mutation.type === 'childList'
              && operation?.contains?.(mutation.target)
              && ((mutation.addedNodes?.length ?? 0) > 0 || (mutation.removedNodes?.length ?? 0) > 0)
          )
          if (historyRelevant) historyMutationRevision += 1
          const relevant = external.filter(mutation =>
            mutationAffectsTurns(mutation) || mutationAffectsOverlay(mutation)
          )
          if (relevant.some(mutationAffectsOverlay)) obstructionDirty = true
          if (!relevant.length && !historyRelevant) return
          if (previewIndex >= 0) queuePreviewRefresh()
          pendingMutations.push(...relevant)
          scanPending ||= relevant.length > 0
          schedule()
        })
        mutationObserver.observe(document.body, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: [
            'data-chat-flow-kind',
            'data-message-role',
            'data-prts-floating-glass',
            'hidden',
            'aria-hidden',
            'aria-modal',
            'role',
            'open',
            'popover',
            'class',
            'data-slot',
            'data-plugin',
            'style',
          ],
        })
      }
      document.fonts?.ready?.then?.(() => {
        if (started) requestGeometryStabilization()
      }).catch?.(() => {})
      schedule(true)
    },
    dispose() {
      window?.removeEventListener?.('resize', onHostGeometryChange)
      window?.removeEventListener?.('orientationchange', onHostGeometryChange)
      window?.removeEventListener?.('pageshow', onHostGeometryChange)
      window?.visualViewport?.removeEventListener?.('resize', onHostGeometryChange)
      stopGeometryStabilization()
      started = false
      failed = false
      mutationObserver?.disconnect()
      mutationObserver = undefined
      resizeObserver?.disconnect()
      resizeObserver = undefined
      disconnectPreviewObserver()
      if (frame !== undefined) {
        if (window?.cancelAnimationFrame) window.cancelAnimationFrame(frame)
        else window?.clearTimeout?.(frame)
      }
      frame = undefined
      scanPending = false
      fullScanPending = false
      pendingMutations = []
      overlayCandidates.clear()
      overlayScanPending = false
      scaleObstructed = false
      scaleBlockingObstructed = false
      scaleSpaceObstructed = true
      contentLeft = undefined
      geometryDirty = true
      clearTimers()
      setScaleResizeState(false)
      disconnectRoots()
    },
  }
}
