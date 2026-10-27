import { createThemeTransfer } from './theme-transfer.js'
import { createBackgroundStore } from './custom-background.js'
import { createNativePreferences } from './native-preferences.js'
import { createComposerGlassSurface } from './composer-glass-surface.js'
import { createAvatarStore } from './custom-avatar.js'
import { registerEmblemToolPreview } from './emblem-tool-preview.js'
import { createCustomEmblemStore } from './custom-emblem.js'
import { DEFAULT_PREFERENCES, isSafeMode, loadPreferences, resetPreferenceGroup, updatePreferenceValue } from './preferences.js'
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
  const composerSurface = createComposerGlassSurface({document, window, React, mount: environment.mountComposerGlassSurface})
  const safeMode = isSafeMode(window?.location?.search ?? '')
  const stopEmblemPreview = safeMode ? null : registerEmblemToolPreview(ctx, React)
  const storage = window?.localStorage
  const themeService = contextService(ctx, 'theme')
  const composerGlass = createComposerGlassAdapter({ document, window })
  const assistantGlass = createAssistantGlassAdapter({
    document,
    window,
    avatarImage: assets.prtsEmblem,
  })
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
  const backgroundStore = createBackgroundStore({window,document})
  const avatarStore = createAvatarStore({window,document})
  const customEmblemStore = createCustomEmblemStore({ window, emblems: assets.emblems, preview: entry => particleField.previewEmblem?.(entry), onChange: value => particleField.setCustomEmblemConfiguration?.(value) })
  const startup = createPrtsStartupSequence({
    document,
    window,
    prtsEmblem: assets.prtsEmblem,
    rhodesEmblem: assets.emblem,
    timings: startupTimings,
    onActiveChange(active) {
      particleField.setStartupActive(active)
    },
    onReady() {
      particleField.setStartupActive(false)
    },
  })
  const theme = createThemeController({
    document,
    window,
    cssText,
    service: themeService,
    cursorAssets: assets.cursor,
    onSchemeChange() { particleField.repaintScheme() },
    onTransitionStateChange(active) {
      particleField.setSchemeTransitionActive(active)
    },
  })
  const toBottom = createToBottomAdapter({ document, window })
  const conversationControls = createConversationControlAdapter({ document, window })
  const layoutDiagnostics = createLayoutStabilityDiagnostics({ document, window })
  const sidebarControls = createSidebarControlAdapter({
    document,
    window,
    getSessionStatus: () => contextService(ctx, 'uiSession')?.sessionStatus,
    getUiWorkspace: () => contextService(ctx, 'uiWorkspace'),
    getSessions: () => contextService(ctx, 'sessions'),
    getWorkspaces: () => contextService(ctx, 'workspaces'),
    getUiConversation: () => contextService(ctx, 'uiConversation'),
  })
  const floatingGlass = createFloatingGlassAdapter({ document, window })
  const adapter = createRc7Adapter({ document })
  const hostGeometry = createHostGeometryAdapter({ document, window })
  const connection = contextService(ctx, 'connection')
  let themeTransfer
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
    for (const actions of bindings) actions.sync({ ...preferences }, { ...status, settingsPersistence }, revision)
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
    backgroundStore.setEnabled(false)
    particleField.update({ ...preferences, enabled: false })
    startup.stop({ restoreFocus: false })
    stopStartupReadyWatch()
    stopMountWatch()
    mountWarningIssued = false
    disposeOperations()
    composerGlass.dispose()
    assistantGlass.dispose()
    toBottom.dispose()
    conversationControls.dispose()
    layoutDiagnostics.dispose()
    sidebarControls.dispose()
    composerSurface.dispose()
    floatingGlass.dispose()
    theme.apply({ ...preferences, enabled: false })
  }

  const applyVisualState = ({ themeAlreadyApplied = false } = {}) => {
    if (safeMode || !preferences.enabled) {
      disposeVisualState()
      return
    }
    backgroundStore.setEnabled(preferences.backgroundMode !== 'off')
    if (!themeAlreadyApplied) theme.apply(preferences)
    operations ||= createOperationsShell({
      document, window, assets, adapter, hostGeometry, customEmblemStore, avatarStore, backgroundStore,
      themeTransfer: themeTransfer ||= createThemeTransfer({ window, getPreferences: () => nativePreferences.value,
        savePreferences: (value, revision) => nativePreferences.replace(value, revision),
        onAvatarConfiguration: value => avatarStore.applySnapshot(value),
        checkWritable: () => nativePreferences.checkWritable(), checkExport: () => nativePreferences.checkReadable(), themeVersion: version }),
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
        if (key === 'cornerColor') { document.documentElement.style.setProperty('--prts-corner-color', String(value)); return }
        if (key === 'particleTraversalSpeed') {
          particleField.update(updatePreferenceValue(preferences, key, value))
          return
        }
        if (key === 'sessionFlowSpeed') {
          const preview = updatePreferenceValue(preferences, key, value)
          document.documentElement.dataset.prtsSessionFlowSpeed = String(preview.sessionFlowSpeed)
          return
        }
        const sessionFlowColorProperties = {
          sessionFlowColorBack: '--prts-session-flow-back',
          sessionFlowColorCore: '--prts-session-flow-core',
          sessionFlowColorFront: '--prts-session-flow-front',
        }
        if (sessionFlowColorProperties[key]) {
          document.documentElement.dataset.prtsSessionFlowPalette = 'custom'
          document.documentElement.style.setProperty(sessionFlowColorProperties[key], String(value))
        }
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
    if (preferences.conversationStyle === 'deck-chat') assistantGlass.start({ groupAvatars: preferences.bakerGroupAvatars, loading: preferences.bakerLoading })
    else assistantGlass.dispose()
    toBottom.start()
    conversationControls.start()
    layoutDiagnostics.start()
    sidebarControls.start(preferences)
    if (preferences.composerGlass || preferences.backgroundMode !== 'off') composerSurface.start()
    else composerSurface.dispose()
    floatingGlass.start()
  }

  const nativePreferences = createNativePreferences({
    storage,
    onChange(next, persistence) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(next)
      const wasEnabled = preferences.enabled
      preferences = next
      settingsPersistence = persistence
      if (changed) {
        const play = !safeMode && !wasEnabled && preferences.enabled && preferences.bootAnimation
        if (play) particleField.setStartupActive(true)
        applyVisualState()
        if (play && !startup.play()) particleField.setStartupActive(false)
      }
      operations?.update(preferences, status, settingsPersistence)
      sync()
    },
  })
  preferences = nativePreferences.value
  const persistAndApply = next => nativePreferences.update(next)
  const retryPersistence = () => nativePreferences.retry()
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
  const stopBackgroundRedraw = backgroundStore.subscribe(() => { if (!safeMode) particleField.update(preferences) })
  const bindNativePreferences = settingsCtx => {
    const forms = contextService(settingsCtx, 'configForms')
    if (forms) settingsCtx.effect(() => nativePreferences.bind(forms.get('theme-prts')))
  }
  if (typeof ctx.inject === 'function') ctx.inject(['configForms'], bindNativePreferences)
  else bindNativePreferences(ctx)
  ctx.effect(() => () => {
    if (typeof stopEmblemPreview === 'function') stopEmblemPreview()
    nativePreferences.dispose()
    statusSource.dispose()
    customEmblemStore.dispose()
    avatarStore.dispose()
    stopBackgroundRedraw()
    backgroundStore.dispose()
    particleField.dispose()
    startup.dispose({ restoreFocus: false })
    stopStartupReadyWatch()
    stopMountWatch()
    disposeOperations()
    composerGlass.dispose()
    assistantGlass.dispose()
    toBottom.dispose()
    conversationControls.dispose()
    layoutDiagnostics.dispose()
    sidebarControls.dispose()
    composerSurface.dispose()
    floatingGlass.dispose()
    if (typeof stopThemeSync === 'function') stopThemeSync()
    theme.dispose()
    bindings.clear()
  }, 'dsh-theme-prts: visual cleanup')

  const initialStoreState = { preferences, status: { ...status, settingsPersistence }, revision }
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
      retryPersistence,
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
  const { defineStore } = require('@deepseek-ai/dsh-client-store')
  applyPrtsPlugin(ctx, {
    document,
    window,
    React,
    defineStore,
    mountComposerGlassSurface(container, props) {
      const { createRoot } = require('react-dom/client')
      const root = createRoot(container)
      const update = props => root.render(React.createElement(PrtsGlassSurface.default, {
        width: '100%', height: '100%',
        // Gentle edge refraction; a fully calm center avoids shifting input content.
        distortionScale: -18, redOffset: 0, greenOffset: 1, blueOffset: 2,
        opacity: 1, backgroundOpacity: 0.5, displace: 5,
        ...props,
      }))
      update(props)
      const dispose = () => root.unmount()
      dispose.update = update
      return dispose
    },
    cssText: PRTS_CSS,
    assets: PRTS_ASSETS,
    version: PRTS_VERSION,
  })
}
