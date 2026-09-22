export const PRTS_STORAGE_KEY = 'dsh.ui.prts.v1'

export const PARTICLE_TRAVERSAL_SPEED_MIN = 0
export const PARTICLE_TRAVERSAL_SPEED_MAX = 2
export const PARTICLE_TRAVERSAL_SPEED_STEP = 0.25
export const PARTICLE_TRAVERSAL_SPEED_DEFAULT = 1
export const SESSION_FLOW_SPEED_MIN = 0.25
export const SESSION_FLOW_SPEED_MAX = 2
export const SESSION_FLOW_SPEED_STEP = 0.25
export const SESSION_FLOW_SPEED_DEFAULT = 1

export const SESSION_FLOW_PALETTES = Object.freeze({
  triad: Object.freeze({ back: '#f7ddeb', core: '#65ddb0', front: '#6eb7f3' }),
  rhodes: Object.freeze({ back: '#b9edf4', core: '#5ccddb', front: '#5a9ee6' }),
  amber: Object.freeze({ back: '#ffe6a3', core: '#f0c800', front: '#ee8f42' }),
  alert: Object.freeze({ back: '#ffc0b8', core: '#ee625a', front: '#db5b8c' }),
})

export const DEFAULT_PREFERENCES = Object.freeze({
  version: 12,
  enabled: false,
  preset: 'standard-tactical',
  texture: 'full',
  glass: 'standard',
  motion: 'system',
  bootAnimation: true,
  conversationParticleDensity: 'sparse',
  heroParticleDensity: 'light',
  particleTraversalSpeed: PARTICLE_TRAVERSAL_SPEED_DEFAULT,
  particlePattern: 'orthogonal',
  railDefaultHidden: false,
  sessionFlow: true,
  sessionGlow: true,
  sessionFlowPalette: 'triad',
  sessionFlowColorBack: SESSION_FLOW_PALETTES.triad.back,
  sessionFlowColorCore: SESSION_FLOW_PALETTES.triad.core,
  sessionFlowColorFront: SESSION_FLOW_PALETTES.triad.front,
  sessionFlowSpeed: SESSION_FLOW_SPEED_DEFAULT,
  conversationStyle: 'native',
})

export const VISUAL_PRESETS = Object.freeze({
  'standard-tactical': Object.freeze({
    texture: 'full',
    glass: 'standard',
    motion: 'system',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
    particlePattern: 'orthogonal',
  }),
  'clear-glass': Object.freeze({
    texture: 'restrained',
    glass: 'clear',
    motion: 'system',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
    particlePattern: 'orthogonal',
  }),
  'quiet-reading': Object.freeze({
    texture: 'restrained',
    glass: 'soft',
    motion: 'reduced',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
    particlePattern: 'orthogonal',
  }),
})


export const PARTICLE_DETAIL_LEVELS = Object.freeze({
  compact: Object.freeze({ conversationParticleDensity: 'sparse', heroParticleDensity: 'light' }),
  standard: Object.freeze({ conversationParticleDensity: 'light', heroParticleDensity: 'standard' }),
  precise: Object.freeze({ conversationParticleDensity: 'dense', heroParticleDensity: 'ultra' }),
})
export const PREFERENCE_GROUPS = Object.freeze({
  background: Object.freeze(['texture']),
  particles: Object.freeze(['conversationParticleDensity', 'heroParticleDensity', 'particleTraversalSpeed']),
  material: Object.freeze(['glass']),
  accessibility: Object.freeze(['motion', 'bootAnimation']),
  navigation: Object.freeze(['railDefaultHidden']),
  conversation: Object.freeze(['sessionFlow', 'sessionGlow', 'sessionFlowPalette', 'sessionFlowColorBack', 'sessionFlowColorCore', 'sessionFlowColorFront', 'sessionFlowSpeed', 'conversationStyle']),
})

const TEXTURES = new Set(['off', 'restrained', 'full'])
const GLASS_STRENGTHS = new Set(['off', 'soft', 'standard', 'clear'])
const MOTIONS = new Set(['system', 'reduced'])
const PARTICLE_DENSITIES = new Set(['sparse', 'light', 'standard', 'dense', 'ultra'])
const PRESETS = new Set([...Object.keys(VISUAL_PRESETS), 'custom'])
const CONVERSATION_STYLES = new Set(['native', 'deck-chat'])
const SESSION_FLOW_PALETTE_IDS = new Set([...Object.keys(SESSION_FLOW_PALETTES), 'custom'])
const SESSION_FLOW_COLOR_KEYS = new Set(['sessionFlowColorBack', 'sessionFlowColorCore', 'sessionFlowColorFront'])
const PRESET_LINKED_KEYS = new Set(Object.keys(VISUAL_PRESETS['standard-tactical']))


function matchedVisualPreset(value) {
  for (const [preset, settings] of Object.entries(VISUAL_PRESETS)) {
    if ([...PRESET_LINKED_KEYS].every(key => value[key] === settings[key])) return preset
  }
  return 'custom'
}

export function resolveParticleDetail(value) {
  const normalized = normalizePreferences(value)
  const exact = Object.entries(PARTICLE_DETAIL_LEVELS).find(([, settings]) => (
    normalized.conversationParticleDensity === settings.conversationParticleDensity
    && normalized.heroParticleDensity === settings.heroParticleDensity
  ))
  if (exact) return exact[0]
  const rank = { sparse: 0, light: 1, standard: 2, dense: 3, ultra: 4 }
  const score = ((rank[normalized.conversationParticleDensity] ?? 0) + (rank[normalized.heroParticleDensity] ?? 1)) / 2
  return score < 1.5 ? 'compact' : score < 3 ? 'standard' : 'precise'
}
function booleanOr(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function enumOr(value, allowed, fallback) {
  return allowed.has(value) ? value : fallback
}

function colorOr(value, fallback) {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : fallback
}

function particleTraversalSpeedOr(value, fallback) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  const clamped = Math.min(PARTICLE_TRAVERSAL_SPEED_MAX, Math.max(PARTICLE_TRAVERSAL_SPEED_MIN, numeric))
  return Math.round(clamped / PARTICLE_TRAVERSAL_SPEED_STEP) * PARTICLE_TRAVERSAL_SPEED_STEP
}

function sessionFlowSpeedOr(value, fallback) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  const clamped = Math.min(SESSION_FLOW_SPEED_MAX, Math.max(SESSION_FLOW_SPEED_MIN, numeric))
  return Math.round(clamped / SESSION_FLOW_SPEED_STEP) * SESSION_FLOW_SPEED_STEP
}

function normalizeGlass(input) {
  if (input.glassEnabled === false || input.glass === 'off') return 'off'
  if (input.glass === 'liquid') return 'clear'
  return enumOr(input.glass, GLASS_STRENGTHS, DEFAULT_PREFERENCES.glass)
}

function legacyParticleDensities(input) {
  const source = input.particleDensities !== null
    && typeof input.particleDensities === 'object'
    && !Array.isArray(input.particleDensities)
    ? input.particleDensities
    : null
  const selected = source?.[input.particlePattern]
  return {
    conversation: input.conversationParticleDensity ?? selected?.conversation,
    hero: input.heroParticleDensity ?? selected?.hero,
  }
}

export function normalizePreferences(value) {
  const input = value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const migratedPreset = input.version === 1 && !Object.hasOwn(input, 'preset')
    ? 'custom'
    : input.preset
  const particlePreset = VISUAL_PRESETS[input.preset] ?? DEFAULT_PREFERENCES
  const legacyDensities = legacyParticleDensities(input)
  const sessionFlowPalette = enumOr(input.sessionFlowPalette, SESSION_FLOW_PALETTE_IDS, DEFAULT_PREFERENCES.sessionFlowPalette)
  const paletteColors = SESSION_FLOW_PALETTES[sessionFlowPalette]
  const customColors = {
    back: colorOr(input.sessionFlowColorBack, DEFAULT_PREFERENCES.sessionFlowColorBack),
    core: colorOr(input.sessionFlowColorCore, DEFAULT_PREFERENCES.sessionFlowColorCore),
    front: colorOr(input.sessionFlowColorFront, DEFAULT_PREFERENCES.sessionFlowColorFront),
  }
  const sessionFlowColors = paletteColors ?? customColors
  const normalized = {
    version: 12,
    enabled: booleanOr(input.enabled, DEFAULT_PREFERENCES.enabled),
    preset: enumOr(migratedPreset, PRESETS, DEFAULT_PREFERENCES.preset),
    texture: enumOr(input.texture, TEXTURES, DEFAULT_PREFERENCES.texture),
    glass: normalizeGlass(input),
    motion: input.motion === 'full' ? 'system' : enumOr(input.motion, MOTIONS, DEFAULT_PREFERENCES.motion),
    bootAnimation: booleanOr(input.bootAnimation, DEFAULT_PREFERENCES.bootAnimation),
    conversationParticleDensity: enumOr(legacyDensities.conversation, PARTICLE_DENSITIES, particlePreset.conversationParticleDensity),
    heroParticleDensity: enumOr(legacyDensities.hero, PARTICLE_DENSITIES, particlePreset.heroParticleDensity),
    particleTraversalSpeed: particleTraversalSpeedOr(
      input.particleTraversalSpeed,
      DEFAULT_PREFERENCES.particleTraversalSpeed,
    ),
    particlePattern: 'orthogonal',
    railDefaultHidden: booleanOr(input.railDefaultHidden, DEFAULT_PREFERENCES.railDefaultHidden),
    sessionFlow: booleanOr(input.sessionFlow, DEFAULT_PREFERENCES.sessionFlow),
    sessionGlow: booleanOr(input.sessionGlow, DEFAULT_PREFERENCES.sessionGlow),
    sessionFlowPalette,
    sessionFlowColorBack: sessionFlowColors.back,
    sessionFlowColorCore: sessionFlowColors.core,
    sessionFlowColorFront: sessionFlowColors.front,
    sessionFlowSpeed: sessionFlowSpeedOr(input.sessionFlowSpeed, DEFAULT_PREFERENCES.sessionFlowSpeed),
    conversationStyle: enumOr(input.conversationStyle, CONVERSATION_STYLES, DEFAULT_PREFERENCES.conversationStyle),
  }
  normalized.preset = matchedVisualPreset(normalized)
  return normalized
}

export function applyVisualPreset(value, preset) {
  const current = normalizePreferences(value)
  const settings = VISUAL_PRESETS[preset]
  if (!settings) return { ...current, preset: 'custom' }
  return normalizePreferences({
    ...current,
    ...settings,
  })
}


export function applyParticleDetail(value, level) {
  const current = normalizePreferences(value)
  const settings = PARTICLE_DETAIL_LEVELS[level]
  return settings ? normalizePreferences({ ...current, ...settings }) : current
}
export function updatePreferenceValue(value, key, nextValue) {
  if (key === 'preset') return applyVisualPreset(value, nextValue)
  if (key === 'particleDetail') return applyParticleDetail(value, nextValue)
  const current = normalizePreferences(value)
  if (key === 'sessionFlowPalette') {
    const palette = enumOr(nextValue, SESSION_FLOW_PALETTE_IDS, current.sessionFlowPalette)
    const colors = SESSION_FLOW_PALETTES[palette]
    return normalizePreferences({
      ...current,
      sessionFlowPalette: palette,
      ...(colors ? {
        sessionFlowColorBack: colors.back,
        sessionFlowColorCore: colors.core,
        sessionFlowColorFront: colors.front,
      } : {}),
    })
  }
  if (SESSION_FLOW_COLOR_KEYS.has(key)) {
    return normalizePreferences({
      ...current,
      sessionFlowPalette: 'custom',
      [key]: colorOr(nextValue, current[key]),
    })
  }
  if (key === 'conversationParticleDensity' || key === 'heroParticleDensity') {
    const density = enumOr(nextValue, PARTICLE_DENSITIES, current[key])
    return normalizePreferences({ ...current, [key]: density })
  }
  return normalizePreferences({ ...current, [key]: nextValue })
}

export function resetPreferenceGroup(value, group) {
  const current = normalizePreferences(value)
  const keys = PREFERENCE_GROUPS[group]
  if (!keys) return current
  const reset = { ...current }
  for (const key of keys) reset[key] = DEFAULT_PREFERENCES[key]
  return normalizePreferences(reset)
}

export function loadPreferences(storage) {
  try {
    const raw = storage?.getItem(PRTS_STORAGE_KEY)
    if (raw === null || raw === undefined) return { ...DEFAULT_PREFERENCES }
    const parsed = JSON.parse(raw)
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(parsed?.version)) return { ...DEFAULT_PREFERENCES }
    return normalizePreferences(parsed)
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function persistPreferences(storage, value) {
  const normalized = normalizePreferences(value)
  let persisted = false
  try {
    if (typeof storage?.setItem === 'function') {
      storage.setItem(PRTS_STORAGE_KEY, JSON.stringify(normalized))
      persisted = true
    }
  } catch {
    // Private browsing or storage policy can make persistence unavailable.
  }
  return { preferences: normalized, persisted }
}

export function savePreferences(storage, value) {
  return persistPreferences(storage, value).preferences
}

export function isSafeMode(search = '') {
  try {
    return new URLSearchParams(search).get('prts-safe') === '1'
  } catch {
    return false
  }
}
