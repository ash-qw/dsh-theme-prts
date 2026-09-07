import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = (await Promise.all([
  readFile(new URL('../src/styles/prts.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/stabilization.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/refinement.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/theme-settings-workbench.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/facility-vector.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/startup-sequence.css', import.meta.url), 'utf8'),
])).join('\n')

function includesAll(values) {
  for (const value of values) assert.ok(css.includes(value), `missing CSS contract: ${value}`)
}

test('styles the host frame without taking ownership of the shared details column', () => {
  includesAll([
    'html[data-dsh-prts][data-prts-scheme="dark"]',
    'html[data-dsh-prts][data-prts-scheme="light"]',
    '[data-prts-shell]',
    '[data-prts-nav-rail]',
    '[data-prts-region="frame"]',
    '[data-prts-region="sessions"]',
    '[data-prts-region="operation"]',
    '--prts-nav-width: 52px',
    '--prts-rail-width: 52px',
    '[data-prts-rail-mode="overlay"]',
    '[data-prts-rail-launcher]',
    '--prts-sessions-width: 286px',
    '--prts-sessions-compact: 54px',
  ])
  assert.doesNotMatch(css, /\[data-prts-region="details"\]/)
  assert.doesNotMatch(css, /--prts-frame-details|--prts-details-compact/)
  assert.doesNotMatch(css, /grid-template-columns:[^;]*--prts-frame-details/)
  assert.doesNotMatch(css, /transition:[^;]*grid-template-columns/)
  assert.doesNotMatch(css, /TACTICAL OVERVIEW|data-prts-tactical|data-prts-overview[^\n]*\{[^}]*grid/s)
  assert.ok(Buffer.byteLength(css) < 137_728, 'the replacement stylesheets must stay compact')
})

test('models the facility card as one notched face and one notched side spine', () => {
  includesAll([
    '--prts-workspace-height: 38px',
    '--prts-session-height: 36px',
    '--prts-facility-gap: 7px',
    '@media (max-height: 820px) and (hover: hover) and (pointer: fine)',
    '--prts-session-height: 32px',
    '--prts-spine-width: 8px',
    '--prts-spine-rest: .25',
    '--prts-spine-travel: 6px',
    '[data-prts-facility-face]',
    '[data-prts-facility-svg]',
    '[data-prts-facility-layer="outline"]',
    'vector-effect: non-scaling-stroke',
    'shape-rendering: geometricPrecision',
    'calc(50% - 25px) 0, calc(50% - 20px) 3.333px, calc(50% + 20px) 3.333px, calc(50% + 25px) 0',
    'calc(100% - 2px) calc(50% - 3px)',
    '2px calc(50% + 3px)',
    'transform-origin: left center',
    'transform: scaleX(var(--prts-spine-rest))',
    'transform: translate3d(var(--prts-row-shift), 0, 0)',
  ])
  assert.match(css, /\[data-prts-workspace-row\]::before\s*\{[^}]*background:\s*var\(--prts-cyan\)/s)
  assert.match(css, /\[data-prts-session-row\]\[aria-selected="true"\]::before\s*\{[^}]*background:\s*var\(--prts-yellow\)/s)
  assert.doesNotMatch(css, /\[aria-selected="true"\][^{]*\[data-prts-facility-face\][^{]*\{[^}]*yellow/s)
  assert.doesNotMatch(css, /chassis|shoulder|bracket|foot|feet/i)
})

test('keeps the spine left edge fixed and moves the facility face to the right on expansion', () => {
  assert.match(css, /\[data-slot="sidebar\.workspaces"\] \[role="tree"\][^{]*\{[^}]*overflow-x:\s*hidden;/s)
  assert.match(css, /\[data-prts-(?:workspace|session)-row\]::before\s*\{[\s\S]*?inset:\s*0 auto 0 0;[\s\S]*?width:\s*var\(--prts-spine-width\);[\s\S]*?transform-origin:\s*left center;/)
  assert.match(css, /:is\(:hover, :focus-within, \[data-prts-row-menu-open\]\)\s*\{\s*--prts-row-shift:\s*var\(--prts-spine-travel\);/)
  assert.match(css, /\[data-prts-facility-face\][^{]*\{[^}]*transform:\s*translate3d\(var\(--prts-row-shift\), 0, 0\)/s)
  assert.doesNotMatch(css, /\[data-prts-facility-face\][^{]*\{[^}]*transition:[^;]*(?:left|width|height)/s)
  assert.doesNotMatch(css, /\[data-prts-(?:workspace|session)-row\][^{]*\{[^}]*transition:[^;]*(?:left|width|height)/s)
  assert.match(css, /\[data-prts-workspace-row\] > \[data-prts-facility-spine\][^{]*\{[^}]*position:\s*absolute !important;[^}]*transform-origin:\s*left center;/s)
  assert.match(css, /\[data-prts-workspace-row\]\[data-prts-spine-vector\]::before[^{]*\{[^}]*content:\s*none !important;/s)
})

test('keeps card and docked buttons equal-height and replaces vertical reveal with collision docking', () => {
  includesAll([
    'height: var(--prts-facility-height) !important',
    '@keyframes prts-facility-button-dock',
    'translate3d(34px, 0, 0) scaleX(.94)',
    'translate3d(-4px, 0, 0) scaleX(.96)',
    'translate3d(3px, 0, 0) scaleX(1.035)',
    'animation-delay: 55ms',
    'animation-delay: 125ms',
  ])
  assert.doesNotMatch(css, /prts-workspace-vertical-reveal|prts-session-integrated-reveal|mask-size:\s*100% 0%/)
})

test('draws complete layered contours without styling popup items', () => {
  includesAll([
    '[data-prts-composer-fallback]',
    'calc(50% - 37px) 5px, calc(50% + 37px) 5px',
    '--prts-control-outline: var(--prts-line)',
    '--prts-control-surface: var(--prts-panel-raised)',
    '[data-prts-conversation-control]',
    '[data-prts-facility-texture="silhouette"]',
    '[data-prts-facility-silhouette]',
    '[data-prts-silhouette-layer="far"]',
    '[data-prts-silhouette-layer="near"]',
    '--prts-silhouette-fill: #3f4d56',
    '--prts-silhouette-near-opacity: .52',
    'animation-duration: 22.4s',
    'animation-duration: 6.4s',
    'animation-play-state: paused',
    '[data-produced-files-row] > button[type="button"]',
    'button:not([data-slot="conversation.input.attachments"] *):not([data-prts-glass-menu] *)',
    'inset: 1px',
    'stroke-width: 1',
    'stroke-linejoin: miter',
    'mask: url("#prts-facility-grid-mask")',
  ])
  assert.match(css, /\[data-prts-workspace-actions\] button::before/)
  assert.match(css, /\[data-prts-conversation-control="danger"\][^{]*\{[^}]*--prts-control-outline:\s*var\(--prts-red\)/s)
})

test('limits custom composer geometry to the empty-session hero', () => {
  includesAll([
    '[data-prts-hero-active] [data-composer-card]',
    '[data-prts-hero-active] [data-composer-card] textarea',
    '[data-prts-hero-active] [data-prts-glass-control]',
    'min-height: 64px',
    'width: min(calc(780px + 32px), 100%)',
  ])
  assert.doesNotMatch(css, /\[data-conversation-scroll\]\s*\{[^}]*scroll-padding-bottom:\s*170px/s)
  assert.doesNotMatch(css, /html\[data-dsh-prts\] textarea\s*\{[^}]*min-height:\s*64px/s)
  assert.doesNotMatch(css, /width:\s*min\((?:920|960)px,\s*100%\)/)
})

test('replaces session projections with a hover-only pickup waveform and keeps the narrowed action rail', () => {
  includesAll([
    '[data-prts-facility-texture="pickup"]',
    '[data-prts-session-pickup]',
    '[data-prts-session-pickup-baseline]',
    '[data-prts-session-pickup-indicator]',
    '[data-prts-session-pickup-bar]',
    'prts-session-pickup-sample',
    '--prts-pickup-duration: 480ms',
    'opacity: .58',
    '--prts-row-end-reserve: 29px',
    'width: 57px',
    'width: 28px',
    'min-width: 28px',
    'gap: 1px',
    'pointer-events: none',
  ])
  assert.doesNotMatch(css, /html\[data-dsh-prts\] \[data-prts-row-projection/)
  assert.doesNotMatch(css, /prts-projection-(?:acquire|scan)/)
})
test('leaves the native dsh turn navigator untouched and emits no replacement gutter markers', () => {
  includesAll([
    '[data-chat-flow-kind="user"] [class$="_bubble"]',
    '[data-message-role="user"] :is([data-markdown], [class*="markdown" i])',
  ])
  assert.doesNotMatch(css, /\[data-conversation-scroll\]::before|\[data-(?:message-role|chat-flow-kind)[^\]]*\]::before/)
  assert.doesNotMatch(css, /--turn-natural-height|--prts-turn-mark/)
  assert.doesNotMatch(css, /data-prts-conversation-(?:scale|preview|history)/)
  assert.doesNotMatch(css, /data-prts-turn-summary|data-prts-timeline-active|data-prts-timeline-turn/)
  assert.equal(css.includes('PROCESS / 执行步骤'), false)
  assert.equal(css.includes('[data-prts-ai-surface]'), false)
  assert.equal(css.includes('[data-chat-flow-kind="assistant-step"] {'), false)
  assert.equal(css.includes('[data-message-role="assistant"] {'), false)
  assert.equal(css.includes('[data-testid*="tool-call" i]'), false)
  assert.equal(css.includes('[data-testid*="subagent" i]'), false)
  assert.equal(css.includes('[data-testid*="deliverable" i]'), false)
  assert.doesNotMatch(css, /(?:width|max-width):\s*min\((?:760|880|960)px\b/)
  assert.equal(css.includes('[data-prts-conversation-control] { min-height: 36px'), false)
})

test('keeps particle emblems and composer geometry without retired dossier styles', () => {
  includesAll([
    '[data-prts-ambient-layer]',
    '[data-prts-particle-layer]',
    '[data-prts-resizing]',
    '[data-prts-resize-restoring]',
  ])
  assert.doesNotMatch(css, /dossier|data-prts-details-toggle|prts-host-details-inset/i)
  assert.doesNotMatch(css, /data-prts-conversation-state/)
  assert.match(css, /\[data-composer-card\]::before[^{]*\{[^}]*background:\s*var\(--prts-line-strong\)/s)
  assert.doesNotMatch(css, /\[data-composer-card\]::before[^{]*\{[^}]*linear-gradient\(var\(--prts-yellow\)/s)
  assert.match(css, /\[data-composer-card\]::after[^{]*\{[^}]*inset:\s*1px 1px 3px;[^}]*clip-path:\s*polygon/s)
  assert.match(css, /\[data-prts-composer-signal\]::before[^{]*\{[^}]*transition:\s*transform 160ms[^;]*, opacity 160ms/s)
  assert.doesNotMatch(css, /\[data-prts-composer-signal\]::after/)
})

test("keeps display-contents attachment slots above composer glass without restyling native controls", () => {
  assert.match(css, /\[data-composer-card\] > \[data-slot="conversation\.input\.attachments"\] > \*[^{]*\{[^}]*position:\s*relative;[^}]*z-index:\s*2;/s)
  assert.ok((css.match(/:not\(\[data-slot="conversation\.input\.attachments"\] \*\)/g) || []).length >= 10)
  assert.equal(css.includes("[data-composer-card] button,"), false)
  assert.equal(css.includes("[data-composer-card] button:is(:hover, :focus-visible)"), false)
  assert.equal(css.includes("[data-composer-card] button:active"), false)
})

test('supports fixed host-owned themes, tactical takeover, and accessibility fallbacks', () => {
  includesAll([
    '[data-prts-scheme-toggle]',
    '[data-prts-scheme-current="dark"]',
    '[data-prts-scheme-transition-mode="view"]',
    '[data-prts-scheme-transition-interactive]',
    '[data-prts-scheme-reveal-edge]',
    '[data-prts-scheme-reveal-grid]',
    '[data-prts-scheme-reveal-blend]',
    '[data-prts-scheme-reveal-node]',
    '[data-prts-scheme-reveal-meter]',
    '[data-prts-scheme-reveal-meter-fill]',
    '[data-prts-scheme-reveal-label]',
    '[data-prts-scheme-reveal-value]',
    'clip-path: inset(',
    'backdrop-filter: blur(2px)',
    'mask-image: linear-gradient(',
    '--prts-scheme-grid-diagonal-cell: 40px',
    '@keyframes prts-scheme-view-hold',
    '@keyframes prts-scheme-hud-release',
    'view-transition-name: prts-scheme-edge',
    'view-transition-name: prts-scheme-node',
    'view-transition-name: prts-scheme-grid',
    '::view-transition-new(prts-scheme-node)',
    '::view-transition-new(root)',
    'touch-action: none',
    'scale(.96)',
    '@media (max-width: 640px)',
    '@media (prefers-reduced-motion: reduce)',
    '@media (prefers-reduced-transparency: reduce)',
    '@media (prefers-contrast: more)',
    '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))',
    ':focus-visible',
    '--prts-host-top-inset: 0px',
    'height: calc(100dvh - var(--prts-host-top-inset))',
    'inset: var(--prts-host-top-inset) auto 0 0',
    '[data-prts-theme-settings]::backdrop',
    'width: min(clamp(50rem, 55vw, 65rem), calc(100vw - 2rem))',
    'max-height: min(60rem, calc(100dvh - 2rem))',
    'height: 100dvh',
    'height: calc(100% - 48px) !important',
  ])
  assert.match(css, /html\[data-dsh-prts\]\[data-prts-scheme-transition-mode="view"\]\s*\{[^}]*--prts-scheme-grid-axis:/s)
  assert.match(css, /\[data-prts-scheme-reveal-edge\]\s*\{[^}]*transform:\s*translate3d\(-14px, 0, 0\)/s)
  assert.doesNotMatch(css, /\[data-prts-scheme-reveal-edge\]\s*\{[^}]*transform:[^;}]*--prts-scheme-reveal-x/s)
  assert.doesNotMatch(css, /view-transition-name:\s*prts-scheme-(?:toggle|icon)/)
  assert.doesNotMatch(css, /OPTICAL SYNC/)
  assert.doesNotMatch(css, /\[data-prts-region="frame"\]\s*\{[^}]*min-height:\s*100dvh/s)
  assert.doesNotMatch(css, /prefers-color-scheme/)
  assert.doesNotMatch(css, /color\s*:\s*transparent\b/i)
  assert.doesNotMatch(css, /font-size\s*:\s*0(?:\D|$)/i)
  assert.doesNotMatch(css, /data-prts-drawer-open="sessions"/)
})

test('retains scoped floating surfaces and a readable responsive settings workbench', () => {
  includesAll([
    '[data-prts-glass-control="model"]',
    '[data-prts-glass-control="permission"]',
    '[data-prts-glass-control="preset"]',
    '[data-prts-floating-glass="menu"]',
    '[data-prts-floating-glass="dialog"]',
    '[data-prts-floating-item]',
    '[data-prts-floating-input]',
    '[data-prts-floating-danger]',
    '[data-prts-settings-presets]',
    '[data-prts-preset-card].is-selected',
    '[data-prts-option-sample="texture"]',
    '[data-prts-option-sample="glass"]',
    '[data-prts-setting-feedback]',
    '[data-prts-setting-note]',
    '[data-prts-settings-common]',
    '[data-prts-settings-advanced]',
    '[data-prts-particle-detail-preview]',
    '[data-prts-persistence-error]',
    '[data-prts-reset-confirm]',
    '[data-prts-retry-save]',
    '.prts-plugin-settings__row',
    'container: prts-plugin-settings / inline-size',
    '@container prts-plugin-settings (max-width: 22rem)',
    '.prts-plugin-settings__safe',
    '[data-prts-setting-range]',
    '--prts-settings-text: .875rem',
    '--prts-settings-small: .75rem',
    'container: prts-settings / inline-size',
    '@container prts-settings (max-width: 52rem)',
  ])
  assert.match(css, /\[data-prts-floating-glass="dialog"\][^{]*\{[^}]*backdrop-filter:\s*none/s)
  assert.doesNotMatch(css, /html\[data-dsh-prts\]\s+button:not\(\[data-slot="sidebar\.settings"\] button\)/)
  assert.equal(css.includes('[data-sonner-toast]'), false)
  assert.doesNotMatch(css, /\.prts-settings__(?:recovery|startup|meta)/)
  assert.match(css, /html\[data-dsh-prts-settings\] \.prts-plugin-settings button\[role='switch'\]/)
  assert.doesNotMatch(css, /\[data-prts-settings-grid\]/)
  assert.doesNotMatch(css, /\[data-prts-settings-diagnostic\]/)
  assert.doesNotMatch(css, /\[data-prts-density-preview\]/)
})

test('owns one responsive startup layer with a reduced-motion completion state', () => {
  includesAll([
    '[data-prts-startup]',
    '[data-prts-startup-emblem]',
    '[data-prts-startup-progress]',
    '[data-prts-startup-percent]',
    '[data-prts-startup-fill]',
    '[data-reduced-motion]',
    '[data-copy-transition]',
    '[data-exit-content]',
    'will-change: transform',
    'max-width: none',
    'max-height: none',
    'min-height: 100dvh',
    '@keyframes prts-startup-scan',
    '@media (prefers-reduced-motion: reduce)',
  ])
  assert.equal(css.includes('[data-stage="timeout"]'), false)
  assert.match(css, /\[data-prts-startup-fill\][^{]*\{[^}]*transform:\s*scaleX\(var\(--prts-startup-progress\)\)/s)
  assert.doesNotMatch(css, /\[data-prts-startup-fill\][^{]*\{[^}]*(?:width|left):\s*calc\([^}]*--prts-startup-progress/s)
  assert.match(css, /\[data-prts-startup-cut\][^{]*\{[^}]*width:\s*8px/s)
  assert.match(css, /prts-startup-cut-left[\s\S]*translate3d\(-50vw, 0, 0\)/)
  assert.match(css, /prts-startup-cut-right[\s\S]*translate3d\(50vw, 0, 0\)/)
  assert.doesNotMatch(css, /translate3d\(-?132vw, 0, 0\)/)
})

test('preserves native composer metrics and uses continuous empty-session geometry', () => {
  assert.doesNotMatch(css, /html\[data-dsh-prts\]\s+(?:button|input|textarea|select)[^{]*\{[^}]*font:\s*inherit/s)
  assert.doesNotMatch(css, /html\[data-dsh-prts\]\s+button\s*\{[^}]*color:\s*inherit/s)
  assert.match(css, /\[data-prts-shell\]\s+button,[^{]*\[data-prts-theme-settings\]\s+button\s*\{[^}]*color:\s*inherit/s)
  assert.doesNotMatch(css, /html\[data-dsh-prts\]\s+button:not\([^}]*color:\s*inherit/s)
  assert.match(css, /\[data-prts-shell\] :is\(button, input, textarea, select\)[^{]*\{[^}]*font:\s*inherit/s)
  assert.match(css, /\[data-prts-theme-settings\] :is\(button, input, textarea, select\)[^{]*\{[^}]*font:\s*inherit/s)
  assert.match(css, /\[data-slot="sidebar\.settings"\]\s*>\s*button\s*\{[^}]*color:\s*var\(--prts-ink\)\s*!important/s)
  assert.doesNotMatch(css, /\[data-slot="sidebar\.settings"\]\s+button\s*\{[^}]*color:/s)
  assert.doesNotMatch(css, /\[data-composer-seat\][^{]*\{[^}]*width:\s*calc\(100% \+ 48px\)/s)
  includesAll([
    '--prts-hero-narrow-spacer: clamp(24px, 8dvh, 72px)',
    '--prts-hero-wide-spacer: clamp(96px, 22dvh, 340px)',
    'calc(var(--prts-hero-narrow-spacer) + 63vw - 403.2px)',
    'gap: clamp(24px, calc(5vw - 8px), 40px)',
  ])
})

test('keeps each expanded workspace spine open without promoting projection or actions', () => {
  assert.match(css, /\[data-prts-workspace-row\]\[aria-expanded="true"\][^{]*\{\s*--prts-row-shift:\s*var\(--prts-spine-travel\);/s)
  assert.match(css, /\[data-prts-workspace-row\]\[aria-expanded="true"\]::before[^{]*\{[^}]*transform:\s*scaleX\(1\);/s)
  assert.match(css, /\[data-prts-workspace-row\]\[aria-expanded="true"\] > \[data-prts-facility-spine\][^{]*\{[^}]*transform:\s*scaleX\(1\) !important;/s)
  assert.doesNotMatch(css, /\[data-prts-workspace-row\]\[aria-expanded="true"\][^{]*(?:\[data-prts-row-projection\]|\[data-prts-workspace-actions\])/s)
})
