import { DEFAULT_PREFERENCES, isSafeMode, loadPreferences, persistPreferences, resetPreferenceGroup, updatePreferenceValue } from './preferences.js'
import { createHostGeometryAdapter } from './host-geometry-adapter.js'
import { createComposerGlassAdapter } from './composer-glass-adapter.js'
import { createAssistantGlassAdapter } from './assistant-glass-adapter.js'
import { createRc7Adapter } from './rc7-adapter.js'
import { createHarnessStatusSource, EMPTY_STATUS, projectHarnessStatus } from './status-projection.js'
import { createPrtsUiStore } from './ui-store.js'
import { createSettingsPage } from './settings-page.js'
import { createPrtsStartupSequence, findNativeHarnessLoader } from './startup-sequence.js'
import { createOperationsShell } from './operations-shell-v2.js'
import { createThemeController } from './theme-controller-v2.js'
import { createParticleFieldAdapter } from './particle-field-adapter.js'
import { createToBottomAdapter } from './to-bottom-adapter.js'
import { createConversationControlAdapter } from './conversation-control-adapter.js'
import { createConversationScaleAdapter } from './conversation-scale-adapter.js'
import { createLayoutStabilityDiagnostics } from './layout-stability-diagnostics.js'
import { createSidebarControlAdapter } from './sidebar-control-adapter.js'
import { createFloatingGlassAdapter } from './floating-glass-adapter.js'

export const inject = ['slots', 'theme']

function contextService(ctx, name) {
  try {
    const service = ctx?.[name]
    if (service !== undefined && service !== null) return service
  } catch {}
  try {
    return ctx?.get?.(name)
  } catch {
    return undefined
  }
}

export function applyPrtsPlugin(ctx, environment) {
  const {
    document,
    window,
    React,
    defineStore,
    cssText = '',
    assets = {},
    version = 'development',
    startupTimings,
  } = environment
  const safeMode = isSafeMode(window?.location?.search ?? '')
  const storage = window?.localStorage
  const themeService = contextService(ctx, 'theme')
  const startup = createPrtsStartupSequence({ document, window, prtsEmblem: assets.prtsEmblem, rhodesEmblem: assets.emblem, timings: startupTimings })
  const composerGlass = createComposerGlassAdapter({ document, window })
  const assistantGlass = createAssistantGlassAdapter({ document, window })
  const particleField = createParticleFieldAdapter({
    document,
    window,
    emblems: assets.emblems,
    emblemMasks: assets.emblemMasks,
    heroEmblemMask: assets.heroEmblemMask,
    onStateChange(next) {
      status = { ...status, particle: next }
      sync()
    },
  })
  const theme = createThemeController({
    document,
    window,
    cssText,
    service: themeService,
    onTransitionStateChange(active) {
      particleField.setSchemeTransitionActive(active)
    },
  })
  const sessions = contextService(ctx, 'sessions')
  const toBottom = createToBottomAdapter({ document, window })
  const conversationControls = createConversationControlAdapter({ document, window })
  const conversationScale = createConversationScaleAdapter({ document, window, sessions })
  const layoutDiagnostics = createLayoutStabilityDiagnostics({ document, window })
  const sidebarControls = createSidebarControlAdapter({ document, window })
  const floatingGlass = createFloatingGlassAdapter({ document, window })
  const adapter = createRc7Adapter({ document })
  const hostGeometry = createHostGeometryAdapter({ document, window })
  const connection = contextService(ctx, 'connection')
  let operations
  let mountObserver
  let mountFrame
  let startupReadyObserver
  let startupSettleFrame
  let preferences = loadPreferences(storage)
  let settingsPersistence = { phase: 'idle', revision: 0 }
  let status = connection ? projectHarnessStatus({ connection }) : EMPTY_STATUS
  const bindings = new Set()
  let revision = 0
  const stopThemeSync = typeof ctx.on === 'function'
    ? ctx.on('theme/change', value => value == null ? theme.refresh() : theme.sync(value))
    : undefined
  let mountWarningIssued = false

  const sync = () => {
    revision += 1
    for (const actions of bindings) actions.sync({ ...preferences }, { ...status }, revision)
  }

  const cancelMountFrame = () => {
    if (mountFrame === undefined) return
    if (window?.cancelAnimationFrame) window.cancelAnimationFrame(mountFrame)
    else window?.clearTimeout?.(mountFrame)
    mountFrame = undefined
  }

  const stopMountWatch = () => {
    mountObserver?.disconnect()
    mountObserver = undefined
    cancelMountFrame()
  }

  const stopStartupReadyWatch = () => {
    startupReadyObserver?.disconnect()
    startupReadyObserver = undefined
    if (startupSettleFrame === undefined) return
    if (window?.cancelAnimationFrame) window.cancelAnimationFrame(startupSettleFrame)
    else window?.clearTimeout?.(startupSettleFrame)
    startupSettleFrame = undefined
  }

  const disposeOperations = () => {
    operations?.dispose()
    operations = undefined
  }

  const scheduleMountCheck = () => {
    if (mountFrame !== undefined) return
    const run = () => {
      mountFrame = undefined
      if (!preferences.enabled || safeMode || operations) return
      applyVisualState()
    }
    mountFrame = window?.requestAnimationFrame?.(run)
    if (mountFrame === undefined) mountFrame = window?.setTimeout?.(run, 16)
  }

  const watchMount = () => {
    if (mountObserver || !window?.MutationObserver || !document?.body) return
    mountObserver = new window.MutationObserver(scheduleMountCheck)
    mountObserver.observe(document.body, { childList: true, subtree: true })
  }

  const disposeVisualState = () => {
    startup.stop({ restoreFocus: false })
    stopStartupReadyWatch()
    stopMountWatch()
    mountWarningIssued = false
    disposeOperations()
    composerGlass.dispose()
    assistantGlass.dispose()
    particleField.update({ ...preferences, enabled: false })
    toBottom.dispose()
    conversationControls.dispose()
    conversationScale.dispose()
    layoutDiagnostics.dispose()
    sidebarControls.dispose()
    floatingGlass.dispose()
    theme.apply({ ...preferences, enabled: false })
  }

  const applyVisualState = ({ themeAlreadyApplied = false } = {}) => {
    if (safeMode || !preferences.enabled) {
      disposeVisualState()
      return
    }
    if (!themeAlreadyApplied) theme.apply(preferences)
    operations ||= createOperationsShell({
      document, window, assets, adapter, hostGeometry,
      onSchemeToggle(next, interaction) {
        return theme.setTheme(next, { ...interaction, animate: true })
      },
      onSchemeDragStart(next, interaction) {
        return theme.beginThemeTransition(next, interaction)
      },
      onThemeDisable() {
        persistAndApply(updatePreferenceValue(preferences, 'enabled', false))
      },
      onPreferenceChange(key, value) {
        persistAndApply(updatePreferenceValue(preferences, key, value))
      },
      onPreferencePreview(key, value) {
        if (key !== 'particleTraversalSpeed') return
        particleField.update(updatePreferenceValue(preferences, key, value))
      },
      onVisualReset() {
        persistAndApply({
          ...DEFAULT_PREFERENCES,
          enabled: preferences.enabled,
          bootAnimation: preferences.bootAnimation,
        })
      },
      onRetrySave() {
        retryPersistence()
      },
      getConversationScalePreview(value) {
        return conversationScale.getCalibrationState(value)
      },
    })
    if (!operations.update(preferences, status, settingsPersistence)) {
      if (!mountWarningIssued) {
        window?.console?.warn?.(
          '[dsh-theme-prts] operations shell mount deferred; base theme remains active',
        )
        mountWarningIssued = true
      }
      disposeOperations()
      watchMount()
    } else {
      mountWarningIssued = false
      stopMountWatch()
    }
    particleField.update(preferences)
    composerGlass.start()
    assistantGlass.start()
    toBottom.start()
    conversationControls.start()
    conversationScale.update(preferences)
    conversationScale.start()
    layoutDiagnostics.start()
    sidebarControls.start()
    floatingGlass.start()
  }

  const persistAndApply = next => {
    const wasEnabled = Boolean(preferences.enabled)
    const result = persistPreferences(storage, next)
    preferences = result.preferences
    settingsPersistence = {
      phase: result.persisted ? 'saved' : 'error',
      revision: settingsPersistence.revision + 1,
    }
    applyVisualState()
    sync()
    if (!safeMode && !wasEnabled && preferences.enabled && preferences.bootAnimation) startup.play()
  }


  const retryPersistence = () => {
    const result = persistPreferences(storage, preferences)
    preferences = result.preferences
    settingsPersistence = {
      phase: result.persisted ? 'saved' : 'error',
      revision: settingsPersistence.revision + 1,
    }
    operations?.update(preferences, status, settingsPersistence)
    sync()
  }
  const statusSource = createHarnessStatusSource({
    connection,
    onChange(next) {
      status = next
      operations?.update(preferences, status, settingsPersistence)
      sync()
    },
  })


  const nativeLoader = !safeMode && preferences.enabled && preferences.bootAnimation
    ? findNativeHarnessLoader(document)
    : null
  if (nativeLoader?.isConnected) {
    theme.apply(preferences)
    let visualStatePending = true
    let visualStateSettled = false
    let settleFrames = 0
    const requestSettleFrame = callback => window?.requestAnimationFrame?.(callback)
      ?? window?.setTimeout?.(callback, 16)
    const ensureVisualState = () => {
      if (nativeLoader.isConnected) return false
      if (visualStatePending) {
        visualStatePending = false
        applyVisualState({ themeAlreadyApplied: true })
        const settle = () => {
          startupSettleFrame = undefined
          const particleCanvas = document.querySelector('[data-prts-particle-layer]')
          const particleReady = !particleCanvas || particleCanvas.hasAttribute('data-prts-particle-ready')
          settleFrames = particleReady ? settleFrames + 1 : 0
          if (settleFrames >= 2) {
            visualStateSettled = true
            startupReadyObserver?.disconnect()
            startupReadyObserver = undefined
            return
          }
          startupSettleFrame = requestSettleFrame(settle)
        }
        startupSettleFrame = requestSettleFrame(settle)
      }
      return visualStateSettled
    }
    if (window?.MutationObserver && document?.body) {
      startupReadyObserver = new window.MutationObserver(ensureVisualState)
      startupReadyObserver.observe(document.body, { childList: true, subtree: true })
    }
    const takeoverStarted = startup.play({
      waitForReady: true,
      readyWhen: ensureVisualState,
    })
    if (!takeoverStarted) {
      stopStartupReadyWatch()
      applyVisualState({ themeAlreadyApplied: true })
    }
  } else {
    applyVisualState()
  }
  ctx.effect(() => () => {
    statusSource.dispose()
    startup.dispose({ restoreFocus: false })
    stopStartupReadyWatch()
    stopMountWatch()
    disposeOperations()
    composerGlass.dispose()
    assistantGlass.dispose()
    particleField.dispose()
    toBottom.dispose()
    conversationControls.dispose()
    conversationScale.dispose()
    layoutDiagnostics.dispose()
    sidebarControls.dispose()
    floatingGlass.dispose()
    if (typeof stopThemeSync === 'function') stopThemeSync()
    theme.dispose()
    bindings.clear()
  }, 'dsh-theme-prts: visual cleanup')

  const initialStoreState = { preferences, status, revision }
  const settingsStore = createPrtsUiStore(defineStore, initialStoreState)
  const PrtsSettingsPage = createSettingsPage(React, {
    emblem: assets.emblem,
    version,
    safeMode,
  })
  const injectActions = actions => {
    bindings.add(actions)
    sync()
    return {
      updatePreference(key, value) { persistAndApply(updatePreferenceValue(preferences, key, value)) },
      resetPreferenceGroup(group) {
        persistAndApply(resetPreferenceGroup(preferences, group))
      },
      resetPreferences() {
        persistAndApply({
          ...DEFAULT_PREFERENCES,
          enabled: preferences.enabled,
          bootAnimation: preferences.bootAnimation,
        })
      },
    }
  }

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'prts-appearance',
    order: 20,
    label: () => 'P.R.T.S.',
    store: settingsStore,
    inject: injectActions,
  }, PrtsSettingsPage))
}

export function apply(ctx) {
  const React = require('react')
  const { defineStore } = require('@deepseek-ai/dsh-client-runtime/client')
  applyPrtsPlugin(ctx, {
    document,
    window,
    React,
    defineStore,
    cssText: PRTS_CSS,
    assets: PRTS_ASSETS,
    version: PRTS_VERSION,
  })
}
