import assert from 'node:assert/strict'
import test from 'node:test'

import * as api from '../src/client/preferences.js'

test('normalizes unsupported values into the disabled version-eight defaults', () => {
  assert.deepEqual(
    api.normalizePreferences({ enabled: 'yes', scheme: 'neon', dossier: 0 }),
    api.DEFAULT_PREFERENCES,
  )
  assert.equal(api.DEFAULT_PREFERENCES.version, 8)
  assert.equal(api.DEFAULT_PREFERENCES.railDefaultHidden, false)
  assert.equal(Object.hasOwn(api.DEFAULT_PREFERENCES, 'glassEnabled'), false)
  assert.equal(Object.hasOwn(api.DEFAULT_PREFERENCES, 'glassHighlight'), false)
})

test('uses one four-state glass preference while migrating version-one controls', () => {
  assert.equal(api.DEFAULT_PREFERENCES.glass, 'standard')
  assert.equal(api.normalizePreferences({ version: 2, glass: 'off' }).glass, 'off')
  assert.equal(api.normalizePreferences({ version: 2, glass: 'soft' }).glass, 'soft')
  assert.equal(api.normalizePreferences({ version: 1, glass: 'liquid' }).glass, 'clear')
  assert.equal(api.normalizePreferences({ version: 1, glassEnabled: false, glass: 'clear' }).glass, 'off')
  assert.equal(api.normalizePreferences({ version: 1, glassEnabled: true, glass: 'clear' }).glass, 'clear')
  const migrated = api.normalizePreferences({ version: 1, glassHighlight: false })
  assert.equal(Object.hasOwn(migrated, 'glassEnabled'), false)
  assert.equal(Object.hasOwn(migrated, 'glassHighlight'), false)
})

test('loads and migrates a complete version-one payload without losing independent choices', () => {
  const legacy = {
    version: 1,
    enabled: true,
    preset: 'custom',
    dossier: false,
    texture: 'full',
    glassEnabled: true,
    glass: 'clear',
    glassHighlight: false,
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particlePattern: 'organic',
  }
  const migrated = api.loadPreferences({ getItem: () => JSON.stringify(legacy) })
  assert.deepEqual(migrated, {
    version: 8,
    enabled: true,
    preset: 'custom',
    texture: 'full',
    glass: 'clear',
    motion: 'system',
    bootAnimation: true,
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particleTraversalSpeed: 1,
    particlePattern: 'orthogonal',
    railDefaultHidden: false,
    conversationScaleMaxDistance: 96,
    conversationScaleFocusContrast: 70,
  })
})

test('falls back after malformed, unsupported, and unavailable storage', () => {
  assert.deepEqual(api.loadPreferences({ getItem: () => '{bad' }), api.DEFAULT_PREFERENCES)
  assert.deepEqual(api.loadPreferences({ getItem: () => JSON.stringify({ version: 99, enabled: true }) }), api.DEFAULT_PREFERENCES)
  assert.deepEqual(api.loadPreferences({ getItem: () => { throw new Error('blocked') } }), api.DEFAULT_PREFERENCES)
})

test('persists only the normalized version-eight payload', () => {
  let written
  const storage = { setItem: (key, value) => { written = [key, value] } }
  const saved = api.savePreferences(storage, { version: 1, enabled: true, texture: 'off', glassEnabled: false })
  assert.equal(written[0], 'dsh.ui.prts.v1')
  assert.deepEqual(JSON.parse(written[1]), saved)
  assert.equal(saved.version, 8)
  assert.equal(saved.glass, 'off')
  assert.equal(Object.hasOwn(saved, 'glassEnabled'), false)
})

test('drops retired fields from legacy payloads', () => {
  const normalized = api.normalizePreferences({
    version: 1,
    texture: 'restrained',
    contourLight: '#ABCDEF',
    contourDark: 'white',
    contourOpacity: 0.719,
    glassHighlight: true,
    dossier: false,
  })
  assert.equal(normalized.texture, 'restrained')
  for (const key of ['dossier', 'contourLight', 'contourDark', 'contourOpacity', 'glassHighlight']) {
    assert.equal(Object.hasOwn(normalized, key), false)
  }
})

test('normalizes, migrates, and resets the conversation scale controls', () => {
  assert.equal(api.normalizePreferences({ version: 4, conversationScaleMaxDistance: 8 }).conversationScaleMaxDistance, 16)
  assert.equal(api.normalizePreferences({ version: 4, conversationScaleMaxDistance: 101 }).conversationScaleMaxDistance, 104)
  assert.equal(api.normalizePreferences({ version: 4, conversationScaleMaxDistance: 999 }).conversationScaleMaxDistance, 240)
  assert.equal(api.normalizePreferences({ version: 4, conversationScaleMaxDistance: 'bad' }).conversationScaleMaxDistance, 96)
  assert.equal(api.loadPreferences({ getItem: () => JSON.stringify({ version: 3, enabled: true }) }).conversationScaleMaxDistance, 96)
  assert.equal(api.loadPreferences({ getItem: () => JSON.stringify({ version: 4, enabled: true }) }).conversationScaleFocusContrast, 70)
  assert.equal(api.normalizePreferences({ version: 6, conversationScaleFocusContrast: -1 }).conversationScaleFocusContrast, 0)
  assert.equal(api.normalizePreferences({ version: 6, conversationScaleFocusContrast: 64 }).conversationScaleFocusContrast, 60)
  assert.equal(api.normalizePreferences({ version: 6, conversationScaleFocusContrast: 999 }).conversationScaleFocusContrast, 100)
  assert.equal(api.normalizePreferences({ version: 6, conversationScaleFocusContrast: 'bad' }).conversationScaleFocusContrast, 70)
  let edited = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'railDefaultHidden', true)
  assert.equal(edited.railDefaultHidden, true)
  edited = api.updatePreferenceValue(edited, 'conversationScaleMaxDistance', 184)
  edited = api.updatePreferenceValue(edited, 'conversationScaleFocusContrast', 100)
  assert.equal(edited.conversationScaleMaxDistance, 184)
  assert.equal(edited.conversationScaleFocusContrast, 100)
  const reset = api.resetPreferenceGroup(edited, 'navigation')
  assert.equal(reset.railDefaultHidden, false)
  assert.equal(reset.conversationScaleMaxDistance, 96)
  assert.equal(reset.conversationScaleFocusContrast, 70)
})

test('normalizes, migrates, presets, and resets particle traversal speed independently', () => {
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: -1 }).particleTraversalSpeed, 0)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 0.62 }).particleTraversalSpeed, 0.5)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 1.88 }).particleTraversalSpeed, 2)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 99 }).particleTraversalSpeed, 2)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 'bad' }).particleTraversalSpeed, 1)
  assert.equal(api.loadPreferences({ getItem: () => JSON.stringify({ version: 6, enabled: true }) }).particleTraversalSpeed, 1)

  const edited = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'particleTraversalSpeed', 0.25)
  assert.equal(edited.particleTraversalSpeed, 0.25)
  assert.equal(edited.preset, 'standard-tactical')
  const quiet = api.applyVisualPreset(edited, 'quiet-reading')
  assert.equal(quiet.particleTraversalSpeed, 0.25)
  assert.equal(quiet.preset, 'quiet-reading')
  const reset = api.resetPreferenceGroup(quiet, 'particles')
  assert.equal(reset.particleTraversalSpeed, 1)
  assert.equal(reset.conversationParticleDensity, api.DEFAULT_PREFERENCES.conversationParticleDensity)
  assert.equal(reset.heroParticleDensity, api.DEFAULT_PREFERENCES.heroParticleDensity)
})

test('recognizes only the explicit safe-mode query', () => {
  assert.equal(api.isSafeMode('?prts-safe=1'), true)
  assert.equal(api.isSafeMode('?prts-safe=0'), false)
  assert.equal(api.isSafeMode('?mode=prts-safe'), false)
})

test('applies presets without changing independent navigation preferences', () => {
  const original = { ...api.DEFAULT_PREFERENCES, conversationScaleFocusContrast: 100 }
  const quiet = api.applyVisualPreset(original, 'quiet-reading')
  assert.equal(quiet.preset, 'quiet-reading')
  assert.equal(quiet.glass, 'soft')
  assert.equal(quiet.motion, 'reduced')
  assert.equal(quiet.conversationScaleFocusContrast, 100)
  const standard = api.applyVisualPreset(quiet, 'standard-tactical')
  assert.equal(standard.preset, 'standard-tactical')
  const visualEdit = api.updatePreferenceValue(standard, 'texture', 'off')
  assert.equal(visualEdit.preset, 'custom')
})

test('resets independent settings groups without changing unrelated preferences', () => {
  const current = {
    ...api.DEFAULT_PREFERENCES,
    enabled: true,
    preset: 'custom',
    texture: 'off',
    glass: 'clear',
    motion: 'reduced',
    bootAnimation: false,
  }
  const background = api.resetPreferenceGroup(current, 'background')
  assert.equal(background.texture, 'full')
  assert.equal(background.glass, 'clear')
  const material = api.resetPreferenceGroup(background, 'material')
  assert.equal(material.glass, 'standard')
  assert.equal(material.motion, 'reduced')
  const accessibility = api.resetPreferenceGroup(material, 'accessibility')
  assert.equal(accessibility.motion, 'system')
  assert.equal(accessibility.bootAnimation, true)
  assert.equal(accessibility.enabled, true)
})

test('migrates retired algorithms into one orthogonal density pair', () => {
  const migrated = api.normalizePreferences({
    version: 2,
    preset: 'custom',
    particlePattern: 'hex',
    particleDensities: {
      hex: { conversation: 'dense', hero: 'ultra' },
      orthogonal: { conversation: 'sparse', hero: 'light' },
    },
  })
  assert.equal(migrated.version, 8)
  assert.equal(migrated.particlePattern, 'orthogonal')
  assert.equal(migrated.conversationParticleDensity, 'dense')
  assert.equal(migrated.heroParticleDensity, 'ultra')
  assert.equal(Object.hasOwn(migrated, 'particleDensities'), false)
})

test('particle edits unlink presets while retired pattern edits are ignored', () => {
  let preferences = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'heroParticleDensity', 'ultra')
  assert.equal(preferences.preset, 'custom')
  assert.equal(preferences.heroParticleDensity, 'ultra')
  preferences = api.updatePreferenceValue(preferences, 'conversationParticleDensity', 'dense')
  preferences = api.updatePreferenceValue(preferences, 'particlePattern', 'organic')
  assert.equal(preferences.particlePattern, 'orthogonal')
  assert.equal(preferences.conversationParticleDensity, 'dense')
  assert.equal(preferences.heroParticleDensity, 'ultra')
  const restored = api.applyVisualPreset(preferences, 'standard-tactical')
  assert.equal(restored.particlePattern, 'orthogonal')
  assert.equal(restored.conversationParticleDensity, 'sparse')
  assert.equal(restored.heroParticleDensity, 'light')
})

test('maps the three particle detail levels onto the compatible density fields', () => {
  const compact = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'particleDetail', 'compact')
  assert.equal(compact.conversationParticleDensity, 'sparse')
  assert.equal(compact.heroParticleDensity, 'light')
  assert.equal(api.resolveParticleDetail(compact), 'compact')

  const standard = api.updatePreferenceValue(compact, 'particleDetail', 'standard')
  assert.equal(standard.conversationParticleDensity, 'light')
  assert.equal(standard.heroParticleDensity, 'standard')
  assert.equal(api.resolveParticleDetail(standard), 'standard')

  const precise = api.updatePreferenceValue(standard, 'particleDetail', 'precise')
  assert.equal(precise.conversationParticleDensity, 'dense')
  assert.equal(precise.heroParticleDensity, 'ultra')
  assert.equal(api.resolveParticleDetail(precise), 'precise')
})

test('derives the active preset from actual visual parameters', () => {
  const custom = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'texture', 'off')
  assert.equal(custom.preset, 'custom')
  const restored = api.updatePreferenceValue(custom, 'texture', api.DEFAULT_PREFERENCES.texture)
  assert.equal(restored.preset, 'standard-tactical')
  const quiet = api.applyVisualPreset(restored, 'quiet-reading')
  assert.equal(api.normalizePreferences({ ...quiet, preset: 'custom' }).preset, 'quiet-reading')
})

test('reports whether normalized preferences reached persistent storage', () => {
  let written
  const success = api.persistPreferences({ setItem(key, value) { written = [key, value] } }, { ...api.DEFAULT_PREFERENCES, enabled: true })
  assert.equal(success.persisted, true)
  assert.equal(success.preferences.enabled, true)
  assert.equal(written[0], api.PRTS_STORAGE_KEY)

  const failure = api.persistPreferences({ setItem() { throw new Error('blocked') } }, { ...api.DEFAULT_PREFERENCES, glass: 'clear' })
  assert.equal(failure.persisted, false)
  assert.equal(failure.preferences.glass, 'clear')
})
