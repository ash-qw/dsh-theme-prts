window.__ModuleLoader__.load({
  id: "@ash-qw/dsh-theme-prts",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const PRTS_VERSION = "1.0.3";
    const PRTS_CSS = "html[data-dsh-prts]{--prts-canvas: #080a0c; --prts-canvas-elevated: #0d1114; --prts-rail: #060809; --prts-panel: #11161a; --prts-panel-raised: #171d21; --prts-panel-muted: #20272c; --prts-ink: #edf1f2; --prts-muted: #98a3a9; --prts-dim: #68747a; --prts-line: #38434a; --prts-line-strong: #5e6a70; --prts-yellow: #f0c800; --prts-yellow-ink: #161300; --prts-cyan: #5ccddb; --prts-red: #ee625a; --prts-green: #8fcf79; --dsw-alias-label-primary-inverted: #15191c; --prts-host-top-inset: 0px; --prts-rail-width: 52px; --prts-nav-width: 52px; --prts-sessions-width: 286px; --prts-sessions-compact: 54px; --prts-workspace-height: 38px; --prts-session-height: 36px; --prts-facility-gap: 7px; --prts-facility-height: var(--prts-workspace-height); --prts-spine-width: 8px; --prts-spine-rest: .25; --prts-spine-travel: 6px; --prts-chamfer: 3px; --prts-radius-control: 3px; --prts-radius-card: 3px; --prts-radius-overlay: 4px; --prts-body: 'Noto Sans SC','Microsoft YaHei UI','Segoe UI',sans-serif; --prts-display: 'Arial Narrow','Noto Sans SC',sans-serif; --prts-mono: 'Roboto Mono','Noto Sans Mono CJK SC',Consolas,monospace; --prts-ease-spring: cubic-bezier(.2,.86,.28,1.16); --prts-ease-snap: cubic-bezier(.22,1,.36,1); --prts-shadow-glass-overlay: 0 18px 48px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.06); --prts-glass-border: rgba(119,140,150,.52); --prts-glass-soft-surface: rgba(15,21,25,.82); --prts-glass-standard-surface: rgba(15,21,25,.9); --prts-glass-clear-surface: rgba(15,21,25,.72); --prts-glass-dense: rgba(7,10,12,.94); --prts-active-glass: var(--prts-glass-standard-surface); --prts-active-glass-filter: blur(18px) saturate(145%); --prts-chat-user-surface: #3a3211; --prts-chat-user-edge: #8c7718; --prts-chat-assistant-surface: rgba(17,24,28,.97); --prts-chat-assistant-edge: #34474f; --prts-chat-avatar-surface: #151c20; --prts-chat-shadow: rgba(0,0,0,.3); --prts-chat-backdrop: #0a0e11; --prts-chat-backdrop-edge: #0e1519; --prts-chat-link: #4d7079; color-scheme: dark; accent-color: var(--prts-yellow)}html[data-dsh-prts][data-prts-scheme=\"dark\"]{color-scheme: dark}html[data-dsh-prts][data-prts-scheme=\"light\"]{--prts-canvas: #eef1f3; --prts-canvas-elevated: #e5eaed; --prts-rail: #111518; --prts-panel: #f7f9fa; --prts-panel-raised: #e5eaed; --prts-panel-muted: #d5dde1; --prts-ink: #15191c; --prts-muted: #4f5c63; --prts-dim: #738087; --prts-line: #9eabb1; --prts-line-strong: #65727a; --dsw-alias-label-primary-inverted: #edf1f2; --prts-glass-border: rgba(62,82,92,.48); --prts-glass-soft-surface: rgba(247,250,251,.9); --prts-glass-standard-surface: rgba(244,249,251,.94); --prts-glass-clear-surface: rgba(244,249,251,.78); --prts-glass-dense: rgba(249,251,252,.97); --prts-shadow-glass-overlay: 0 18px 44px rgba(48,63,70,.18),inset 0 1px rgba(255,255,255,.86); --prts-chat-user-surface: #fff0af; --prts-chat-user-edge: #c9a610; --prts-chat-assistant-surface: rgba(250,252,253,.97); --prts-chat-assistant-edge: #c7d4da; --prts-chat-avatar-surface: #e4e9ec; --prts-chat-shadow: rgba(45,59,66,.16); --prts-chat-backdrop: #edf1f3; --prts-chat-backdrop-edge: #e4ebee; --prts-chat-link: #6b8d96; color-scheme: light}html[data-dsh-prts][data-prts-glass=\"soft\"]{--prts-active-glass: var(--prts-glass-soft-surface); --prts-active-glass-filter: blur(18px) saturate(145%)}html[data-dsh-prts][data-prts-glass=\"standard\"]{--prts-active-glass: var(--prts-glass-standard-surface); --prts-active-glass-filter: blur(22px) saturate(155%)}html[data-dsh-prts][data-prts-glass=\"clear\"]{--prts-active-glass: var(--prts-glass-clear-surface); --prts-active-glass-filter: blur(28px) saturate(180%)}html[data-dsh-prts][data-prts-glass=\"off\"]{--prts-active-glass: var(--prts-panel); --prts-active-glass-filter: none}html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] ),html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::before,html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::after{box-sizing: border-box}html[data-dsh-prts] body{--dsw-alias-bg-base: var(--prts-canvas); --dsw-alias-bg-layer-1: var(--prts-panel); --dsw-alias-bg-layer-2: var(--prts-panel-raised); --dsw-alias-bg-layer-3: var(--prts-panel-muted); --dsw-alias-label-primary: var(--prts-ink); --dsw-alias-label-secondary: var(--prts-muted); --dsw-alias-border-l2: var(--prts-line); min-height: 100dvh; margin: 0; overflow: hidden; background: var(--prts-canvas); color: var(--prts-ink); font-family: var(--prts-body)}html[data-dsh-prts] ::selection{background: var(--prts-yellow); color: var(--prts-yellow-ink)}html[data-dsh-prts] a{color: var(--prts-cyan); text-underline-offset: 3px}html[data-dsh-prts] [data-prts-shell] :is(button,input,textarea,select),html[data-dsh-prts] [data-prts-theme-settings] :is(button,input,textarea,select){font: inherit}html[data-dsh-prts] [data-prts-shell] button,html[data-dsh-prts] [data-prts-theme-settings] button{color: inherit}html[data-dsh-prts] :focus-visible{outline: 2px solid var(--prts-yellow) !important; outline-offset: 2px !important}html[data-dsh-prts] [hidden]{display: none !important}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"]{--prts-nav-width: 0px}html[data-dsh-prts] [data-prts-shell]{position: fixed; z-index: 124; inset: var(--prts-host-top-inset) auto 0 0; width: var(--prts-nav-width); pointer-events: none; font-family: var(--prts-mono)}html[data-dsh-prts] [data-prts-shell] button,html[data-dsh-prts] [data-prts-nav-rail]{pointer-events: auto}html[data-dsh-prts] [data-prts-topbar]{display: none}html[data-dsh-prts] [data-prts-nav-rail]{position: fixed; z-index: 120; inset: var(--prts-host-top-inset) auto 0 0; width: var(--prts-rail-width); display: flex; flex-direction: column; align-items: stretch; border-right: 1px solid #30383d; background: var(--prts-rail); color: #e8edef; box-shadow: 4px 0 18px rgba(0,0,0,.18)}html[data-dsh-prts] [data-prts-rail-launcher]{display: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-nav-rail]{opacity: 0; visibility: hidden; transform: translate3d(-100%,0,0); transition: transform 180ms var(--prts-ease-snap),opacity 120ms ease,visibility 0s linear 180ms; pointer-events: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"][data-prts-rail-open] [data-prts-nav-rail]{opacity: 1; visibility: visible; transform: translate3d(0,0,0); transition-delay: 0s; pointer-events: auto}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"][data-prts-rail-open] [data-prts-rail-launcher]{opacity: 0; visibility: hidden; pointer-events: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]{position: fixed; z-index: 121; top: 50%; left: 0; width: 12px; height: 96px; display: grid; place-items: center; padding: 0; overflow: hidden; border: 1px solid color-mix(in srgb,var(--prts-yellow) 40%,transparent); border-left: 0; border-radius: 0 3px 3px 0; opacity: .34; background: color-mix(in srgb,var(--prts-rail) 86%,transparent); color: var(--prts-yellow); font: 700 8px/1 var(--prts-mono); letter-spacing: .08em; transform: translateY(-50%); transition: width 140ms var(--prts-ease-snap),opacity 120ms ease,background-color 120ms ease; cursor: pointer}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher] > span{opacity: 0; writing-mode: vertical-rl; transition: opacity 100ms ease}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]:is(:hover,:focus-visible){width: 40px; opacity: 1; background: var(--prts-rail)}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]:is(:hover,:focus-visible) > span{opacity: 1}@media (hover: none),(pointer: coarse){html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]{top: 50%; width: 24px; height: 88px; opacity: .58; transform: translateY(-50%); touch-action: none}html[data-dsh-prts] [data-prts-rail-launcher] > span{opacity: 0}html[data-dsh-prts] [data-prts-rail-launcher][data-prts-rail-gesture-active]{width: 40px; opacity: 1}html[data-dsh-prts] [data-prts-rail-gesture-cue]{position: absolute; inset: calc(27px + var(--prts-rail-gesture-progress,0px)) 10px auto auto; display: block; opacity: 0; font: 700 14px/8px sans-serif}html[data-dsh-prts] [data-prts-rail-gesture-active] [data-prts-rail-gesture-cue]{opacity: 1; animation: prts-rail-swipe-cue 720ms ease-in-out infinite}html[data-dsh-prts] [data-prts-rail-gesture-ready] [data-prts-rail-gesture-cue]{filter: drop-shadow(0 0 3px currentColor)}}@keyframes prts-rail-swipe-cue{50%{opacity: .45}}html[data-dsh-prts] [data-prts-rail-brand]{height: 64px; display: grid; place-items: center; padding: 8px 5px; border-bottom: 1px solid #30383d; overflow: hidden}html[data-dsh-prts] [data-prts-rail-brand] svg{width: 38px; height: 38px; color: #edf1f2}html[data-dsh-prts] [data-prts-rail-brand] > span{position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)}html[data-dsh-prts] [data-prts-nav-rail] > button{position: relative; width: 100%; min-height: 52px; display: grid; place-items: center; gap: 2px; padding: 7px 2px 6px; border: 0; border-bottom: 1px solid #242b2f; background: transparent; color: #9fa9ae; cursor: pointer; clip-path: polygon(0 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%)}html[data-dsh-prts] [data-prts-nav-rail] > button::after{content: \"\"; position: absolute; inset: 8px auto 8px 0; width: 2px; background: transparent}html[data-dsh-prts] [data-prts-nav-rail] > button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-nav-rail] > button[aria-expanded=\"true\"]{background: #151a1d; color: #f0f3f4}html[data-dsh-prts] [data-prts-nav-rail] > button[aria-expanded=\"true\"]::after{background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-nav-rail] > button:active{transform: translateY(1px) scale(.98)}html[data-dsh-prts] [data-prts-nav-rail] b{font-size: 15px; line-height: 1}html[data-dsh-prts] [data-prts-nav-rail] small{font-size: 8px; letter-spacing: .04em}html[data-dsh-prts] [data-prts-nav-bottom]{display: grid; margin-top: auto; border-top: 1px solid #30383d}html[data-dsh-prts] [data-prts-connection-indicator]{min-height: 40px; display: grid; place-items: center; gap: 3px; padding: 6px 2px; color: #8c969b; font-size: 7px; text-align: center}html[data-dsh-prts] [data-prts-connection-indicator] i{width: 6px; height: 6px; border: 1px solid currentColor; background: currentColor; transform: rotate(45deg)}html[data-dsh-prts] [data-prts-connection-indicator][data-state=\"connected\"]{color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-connection-indicator][data-state=\"disconnected\"]{color: var(--prts-red)}html[data-dsh-prts] [data-prts-scheme-toggle] svg{width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.7}html[data-dsh-prts] [data-prts-scheme-toggle]{touch-action: none; user-select: none}html[data-dsh-prts][data-prts-scheme-transition-interactive] [data-prts-scheme-toggle]{cursor: ew-resize}html[data-dsh-prts] [data-prts-scheme-toggle][data-prts-scheme-press]{animation: prts-scheme-toggle-press 100ms var(--prts-ease-snap) both}@keyframes prts-scheme-toggle-press{0%,100%{transform: translateY(0) scale(1)}50%{transform: translateY(0) scale(.96)}}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(root){animation: prts-scheme-view-hold var(--prts-scheme-duration,520ms) linear both}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-old(root),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(root){animation: none; mix-blend-mode: normal}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-old(root){z-index: 1}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(root){z-index: 2; clip-path: inset(0 max(0px,calc(100vw - var(--prts-scheme-reveal-x))) 0 0)}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-grid),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-edge),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-node),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-mark){animation: none}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-grid){z-index: 3}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-edge){z-index: 4}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-node),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-group(prts-scheme-mark){z-index: 5}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-old(prts-scheme-grid),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-old(prts-scheme-edge),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-old(prts-scheme-node),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-old(prts-scheme-mark){opacity: 0; animation: none}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(prts-scheme-grid),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(prts-scheme-edge),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(prts-scheme-node),html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(prts-scheme-mark){opacity: 1; animation: none; mix-blend-mode: normal}@keyframes prts-scheme-view-hold{from,to{opacity: 1}}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]{--prts-scheme-grid-cell: 20px; --prts-scheme-grid-diagonal-cell: 40px; --prts-scheme-grid-axis: rgba(132,158,166,.14); --prts-scheme-grid-node: rgba(150,180,188,.22); --prts-scheme-grid-diagonal-opacity: .16}html[data-dsh-prts][data-prts-scheme-transition=\"light\"]{--prts-scheme-grid-axis: rgba(28,36,41,.12); --prts-scheme-grid-node: rgba(24,31,35,.2); --prts-scheme-grid-diagonal-opacity: .14}html[data-dsh-prts] [data-prts-scheme-reveal]{box-sizing: border-box; position: fixed; z-index: 2147483647; inset: 0; width: 100vw; max-width: none; height: 100dvh; max-height: none; margin: 0; padding: 0; overflow: hidden; border: 0; background: transparent; color: #ffd400; --prts-scheme-grid-cell: 20px; --prts-scheme-grid-diagonal-cell: 40px; --prts-scheme-grid-axis: rgba(132,158,166,.08); --prts-scheme-grid-node: rgba(150,180,188,.13); --prts-scheme-grid-diagonal-opacity: .075; pointer-events: none}html[data-dsh-prts] [data-prts-scheme-reveal=\"light\"]{--prts-scheme-grid-axis: rgba(28,36,41,.065); --prts-scheme-grid-node: rgba(24,31,35,.105); --prts-scheme-grid-diagonal-opacity: .06}html[data-dsh-prts] [data-prts-scheme-reveal-edge]{isolation: isolate; position: absolute; top: 0; left: 0; width: 29px; height: 100vh; background: linear-gradient(90deg,transparent 13px,rgba(244,247,247,.96) 13px 14px,rgba(255,212,0,.22) 14px 15px,transparent 15px); transform: translate3d(-14px,0,0); transform-origin: 50% 50%; view-transition-name: prts-scheme-edge; will-change: transform}html[data-dsh-prts] [data-prts-scheme-reveal-grid]{position: absolute; z-index: -2; inset: 0 auto 0 -206px; display: block; width: 220px; height: 100vh; view-transition-name: prts-scheme-grid; pointer-events: none}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(prts-scheme-grid){background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%2396b4bc' stroke-width='.55'%3E%3Cpath d='M0 0H40M0 20H40M0 40H40M0 0V40M20 0V40M40 0V40' stroke-opacity='.22'/%3E%3Cpath d='M0 0L20 20L0 40M20 0L40 20L20 40' stroke-opacity='.46'/%3E%3Cpath d='M20 0L0 20L20 40M40 0L20 20L40 40' stroke-opacity='.22'/%3E%3C/g%3E%3Cg fill='%2396b4bc' fill-opacity='.36'%3E%3Ccircle cx='0' cy='0' r='1'/%3E%3Ccircle cx='20' cy='0' r='1'/%3E%3Ccircle cx='40' cy='0' r='1'/%3E%3Ccircle cx='0' cy='20' r='1'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='40' cy='20' r='1'/%3E%3Ccircle cx='0' cy='40' r='1'/%3E%3Ccircle cx='20' cy='40' r='1'/%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E\"); background-repeat: repeat; background-position: calc(220px - var(--prts-scheme-reveal-x)) 0; background-size: var(--prts-scheme-grid-diagonal-cell) var(--prts-scheme-grid-diagonal-cell); -webkit-mask-image: linear-gradient(90deg,transparent 0,rgba(0,0,0,.12) 16%,rgba(0,0,0,.48) 56%,#000 100%); mask-image: linear-gradient(90deg,transparent 0,rgba(0,0,0,.12) 16%,rgba(0,0,0,.48) 56%,#000 100%)}html[data-dsh-prts][data-prts-scheme-transition=\"light\"]::view-transition-new(prts-scheme-grid){background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%231c2429' stroke-width='.55'%3E%3Cpath d='M0 0H40M0 20H40M0 40H40M0 0V40M20 0V40M40 0V40' stroke-opacity='.2'/%3E%3Cpath d='M0 0L20 20L0 40M20 0L40 20L20 40' stroke-opacity='.42'/%3E%3Cpath d='M20 0L0 20L20 40M40 0L20 20L40 40' stroke-opacity='.2'/%3E%3C/g%3E%3Cg fill='%231c2429' fill-opacity='.32'%3E%3Ccircle cx='0' cy='0' r='1'/%3E%3Ccircle cx='20' cy='0' r='1'/%3E%3Ccircle cx='40' cy='0' r='1'/%3E%3Ccircle cx='0' cy='20' r='1'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='40' cy='20' r='1'/%3E%3Ccircle cx='0' cy='40' r='1'/%3E%3Ccircle cx='20' cy='40' r='1'/%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E\")}html[data-dsh-prts] [data-prts-scheme-reveal-blend]{position: absolute; z-index: -1; inset: 0; width: 29px; background: linear-gradient(90deg,transparent,rgba(255,212,0,.025) 43%,rgba(235,244,245,.11) 50%,rgba(255,212,0,.018) 58%,transparent); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); opacity: .54}html[data-dsh-prts] [data-prts-scheme-reveal=\"light\"] [data-prts-scheme-reveal-blend]{background: linear-gradient(90deg,transparent,rgba(28,36,41,.04) 42%,rgba(255,255,255,.2) 50%,rgba(255,212,0,.018) 58%,transparent)}html[data-dsh-prts] [data-prts-scheme-reveal=\"dark\"] [data-prts-scheme-reveal-blend]{background: linear-gradient(90deg,transparent,rgba(132,158,166,.035) 42%,rgba(235,244,245,.12) 50%,rgba(255,212,0,.018) 58%,transparent)}html[data-dsh-prts] [data-prts-scheme-reveal-edge]::before{content: \"\"; position: absolute; top: 18%; left: 7px; width: 15px; height: 28px; border-top: 1px solid rgba(235,244,245,.58); border-bottom: 1px solid rgba(235,244,245,.58); background: linear-gradient(rgba(255,212,0,.72),rgba(255,212,0,.72)) 50% 50% / 100% 1px no-repeat}html[data-dsh-prts] [data-prts-scheme-reveal-edge]::after{content: \"\"; position: absolute; top: calc(18% + 12px); left: 12px; width: 5px; height: 5px; border: 1px solid rgba(255,212,0,.78); background: rgba(8,12,14,.68); transform: rotate(45deg)}html[data-dsh-prts] [data-prts-scheme-reveal-node]{position: absolute; z-index: 2; bottom: clamp(88px,18vh,176px); left: 14px; display: block; box-sizing: border-box; width: 46px; height: 62px; color: #ffd400; font-style: normal; transform: translateX(10px); view-transition-name: prts-scheme-node; transition: transform 120ms var(--prts-ease-snap)}html[data-dsh-prts] [data-prts-scheme-reveal-edge][data-prts-scheme-reveal-side=\"left\"] [data-prts-scheme-reveal-node]{transform: translateX(calc(-100% - 10px))}html[data-dsh-prts] [data-prts-scheme-reveal-node]::before{content: \"\"; position: absolute; top: 30px; left: -10px; width: 10px; border-top: 1px solid rgba(255,212,0,.76)}html[data-dsh-prts] [data-prts-scheme-reveal-edge][data-prts-scheme-reveal-side=\"left\"] [data-prts-scheme-reveal-node]::before{right: -10px; left: auto}html[data-dsh-prts] [data-prts-scheme-reveal-mark]{position: absolute; top: 20px; left: 20px; display: block; width: 6px; height: 6px; border-top: 1px solid currentColor; border-right: 1px solid currentColor; view-transition-name: prts-scheme-mark}html[data-dsh-prts] [data-prts-scheme-reveal-meter]{position: absolute; top: 6px; left: 0; display: block; box-sizing: border-box; width: 6px; height: 50px; border: 1px solid rgba(255,212,0,.34); background: rgba(8,12,14,.32)}html[data-dsh-prts] [data-prts-scheme-reveal-meter]::after{content: \"\"; position: absolute; top: -1px; left: 6px; width: 3px; border-top: 1px solid rgba(255,212,0,.64); box-shadow: 0 24px rgba(255,212,0,.42),0 49px rgba(255,212,0,.64)}html[data-dsh-prts] [data-prts-scheme-reveal-meter-fill]{position: absolute; inset: 1px; display: block; background: currentColor; box-shadow: 0 0 5px rgba(255,212,0,.28); opacity: 0; transform-origin: 50% 100%}html[data-dsh-prts] [data-prts-scheme-reveal-label],html[data-dsh-prts] [data-prts-scheme-reveal-value]{position: absolute; left: 12px; display: block; color: currentColor; font-family: var(--prts-mono); font-style: normal; line-height: 1; white-space: nowrap}html[data-dsh-prts] [data-prts-scheme-reveal-label]{top: 7px; font-size: 7px; font-weight: 600; letter-spacing: .16em; opacity: .72}html[data-dsh-prts] [data-prts-scheme-reveal-value]{bottom: 7px; width: 24px; height: 11px; font-size: 11px; font-weight: 700; letter-spacing: .08em}html[data-dsh-prts][data-prts-scheme-transition-mode=\"view\"]::view-transition-new(prts-scheme-node){background-image: linear-gradient(#ffd400,#ffd400); background-position: left 1px bottom 7px; background-repeat: no-repeat; background-size: 2px var(--prts-scheme-control-meter-height,0); object-fit: none}html[data-dsh-prts][data-prts-scheme-transition-interactive]::view-transition-new(prts-scheme-node){background-image: var(--prts-scheme-control-value-image),linear-gradient(#ffd400,#ffd400); background-position: left 12px bottom 7px,left 1px bottom 7px; background-size: 24px 11px,2px var(--prts-scheme-control-meter-height,0)}html[data-dsh-prts][data-prts-scheme-transition-complete]::view-transition-group(prts-scheme-grid),html[data-dsh-prts][data-prts-scheme-transition-complete]::view-transition-group(prts-scheme-edge),html[data-dsh-prts][data-prts-scheme-transition-complete]::view-transition-group(prts-scheme-node),html[data-dsh-prts][data-prts-scheme-transition-complete]::view-transition-group(prts-scheme-mark){animation: prts-scheme-hud-release 100ms ease-out both}@keyframes prts-scheme-hud-release{0%,35%{opacity: 1}100%{opacity: 0}}@media (max-width: 640px){html[data-dsh-prts] [data-prts-scheme-reveal]{--prts-scheme-grid-cell: 16px; --prts-scheme-grid-diagonal-cell: 32px}}html[data-dsh-prts] [data-prts-scheme-current=\"dark\"] [data-prts-scheme-icon=\"light\"],html[data-dsh-prts] [data-prts-scheme-current=\"light\"] [data-prts-scheme-icon=\"dark\"]{display: none}html[data-dsh-prts] [data-prts-region=\"frame\"]{width: calc(100vw - var(--prts-nav-width)); height: calc(100dvh - var(--prts-host-top-inset)); min-height: 0; margin-left: var(--prts-nav-width); display: grid !important; background: var(--prts-canvas)}html[data-dsh-prts] [data-prts-region=\"sessions\"],html[data-dsh-prts] [data-prts-region=\"operation\"]{min-width: 0; min-height: 0}html[data-dsh-prts] [data-prts-region=\"sessions\"]{box-sizing: border-box; position: relative; overflow: hidden; border-right: 1px solid var(--prts-line); background: var(--prts-panel); transition: opacity 180ms ease}html[data-dsh-prts] [data-prts-region=\"operation\"]{position: relative; overflow: hidden; background: var(--prts-canvas); color: var(--prts-ink)}html[data-dsh-prts] [data-prts-region=\"frame\"][data-sidebar-collapsed] [data-prts-region=\"sessions\"] :is( [data-slot=\"sidebar.workspaces\"],[data-slot=\"sidebar.settings\"] ){opacity: 0; pointer-events: none}html[data-dsh-prts] [data-sidebar-collapsed] :is([data-prts-owned-facility],[data-prts-owned-facility-spine],[data-prts-owned-facility-vector]){visibility: hidden; content-visibility: hidden}html[data-dsh-prts] [data-prts-region=\"sessions\"] > *,html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar\"]{height: 100%}html[data-dsh-prts] [data-prts-region=\"sessions\"] :is( [data-rc7-sidebar-root],[data-slot=\"sidebar\"] > :first-child){box-sizing: border-box; width: 100% !important; min-width: var(--prts-sessions-width); padding: 14px 10px; overflow: hidden auto; background: transparent !important; color: var(--prts-ink)}html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.workspaces\"] [role=\"tree\"]{overflow-x: hidden}html[data-dsh-prts] [data-prts-region=\"sessions\"] > * > [data-slot=\"sidebar\"] > :first-child > button[aria-label*=\"new session\" i]{display: none !important}html[data-dsh-prts] [data-prts-workspace-row],html[data-dsh-prts] [data-prts-session-row]{--prts-row-shift: 0px; --prts-row-end-reserve: 29px; --prts-facility-height: var(--prts-workspace-height); position: relative; width: calc(100% - 20px); height: var(--prts-facility-height) !important; min-height: var(--prts-facility-height); display: flex; align-items: center; gap: 0 !important; margin: 0 0 var(--prts-facility-gap) 0; padding: 0 !important; overflow: visible; border: 0 !important; background: transparent !important; color: var(--prts-ink); isolation: isolate}html[data-dsh-prts] [data-prts-session-row]{--prts-facility-height: var(--prts-session-height); margin-left: 8px}@media (max-height: 820px) and (hover: hover) and (pointer: fine){html[data-dsh-prts]{--prts-workspace-height: 34px; --prts-session-height: 32px; --prts-facility-gap: 5px}}html[data-dsh-prts] [data-prts-workspace-row]::before{background: var(--prts-cyan) !important}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"],html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]),html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open]){--prts-row-shift: var(--prts-spine-travel)}html[data-dsh-prts] [data-prts-workspace-row]::before,html[data-dsh-prts] [data-prts-session-row]::before{content: \"\"; position: absolute; z-index: 2; inset: 0 auto 0 0; width: var(--prts-spine-width); background: var(--prts-line-strong); clip-path: polygon( 3px 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px ); transform: scaleX(var(--prts-spine-rest)); transform-origin: left center; transition: transform 220ms var(--prts-ease-spring),background-color 160ms ease}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"]::before,html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open])::before,html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open])::before{transform: scaleX(1)}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"]::before{background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-facility-face]{position: absolute; z-index: -1; inset: 0 0 0 5px; border: 1px solid var(--prts-line); background: var(--prts-panel-raised); clip-path: polygon( 3px 0,calc(50% - 25px) 0,calc(50% - 20px) 3.333px,calc(50% + 20px) 3.333px,calc(50% + 25px) 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px ); transform: translate3d(var(--prts-row-shift),0,0); transition: transform 220ms var(--prts-ease-spring),border-color 160ms ease,background-color 160ms ease; pointer-events: none}html[data-dsh-prts] :is([data-prts-workspace-row],[data-prts-session-row]) [data-prts-facility-face]{right: var(--prts-row-end-reserve)}html[data-dsh-prts] [data-prts-row-title],html[data-dsh-prts] [data-prts-session-row] > span:not([data-prts-facility-face]):not([data-prts-row-projection]):not([data-prts-session-actions]),html[data-dsh-prts] [data-prts-workspace-row] > span:not([data-prts-facility-face]):not([data-prts-row-projection]):not([data-prts-workspace-actions]){position: relative; z-index: 3; min-width: 0; transform: translate3d(var(--prts-row-shift),0,0); transition: transform 220ms var(--prts-ease-spring),color 160ms ease}html[data-dsh-prts] [data-prts-row-title]{flex: 1; overflow: hidden; padding: 0 10px 0 13px; font-size: 12px; font-weight: 650; line-height: var(--prts-facility-height); text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-session-row] > span:has(> [data-state]){padding-left: 0 !important}html[data-dsh-prts] [data-prts-session-row] [data-prts-row-title]::before{content: attr(data-prts-session-index); margin-right: 8px; color: var(--prts-dim); font-family: var(--prts-mono); font-size: 9px; letter-spacing: .08em}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"] [data-prts-row-title]{font-weight: 700}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"] [data-prts-row-title]::before{color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-workspace-actions],html[data-dsh-prts] [data-prts-session-actions]{position: absolute; z-index: 5; inset: 0 0 auto auto; height: var(--prts-facility-height) !important; align-items: stretch !important; gap: 1px !important; margin: 0 !important; transform: translate3d(var(--prts-row-shift),0,0)}html[data-dsh-prts] [data-prts-workspace-actions]{width: 57px}html[data-dsh-prts] [data-prts-session-actions]{position: relative; inset: auto; width: auto; flex: 0 0 auto; margin-left: auto !important}html[data-dsh-prts] [data-prts-session-quick-actions]{display: none !important}html[data-dsh-prts] [data-prts-workspace-actions] > *,html[data-dsh-prts] [data-prts-session-actions] > *{height: 100% !important}html[data-dsh-prts] [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-actions] button{width: 28px !important; min-width: 28px !important; height: var(--prts-facility-height) !important; min-height: var(--prts-facility-height) !important; display: grid !important; place-items: center; padding: 0 !important; border: 1px solid var(--prts-line) !important; border-radius: 0 !important; background: var(--prts-panel-raised) !important; color: var(--prts-muted) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px); cursor: pointer}html[data-dsh-prts] [data-prts-workspace-actions] button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-session-actions] button:is(:hover,:focus-visible){border-color: var(--prts-yellow) !important; color: var(--prts-yellow) !important}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-session-actions] button{animation: prts-facility-button-dock 520ms both}html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-workspace-actions] > :nth-child(1) button{animation-delay: 55ms}html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-workspace-actions] > :nth-child(2){animation-delay: 125ms}}@keyframes prts-facility-button-dock{0%{opacity: 0; transform: translate3d(34px,0,0) scaleX(.94)}52%{opacity: 1; transform: translate3d(-4px,0,0) scaleX(.96)}72%{transform: translate3d(3px,0,0) scaleX(1.035)}88%{transform: translate3d(-1px,0,0) scaleX(.99)}100%{opacity: 1; transform: translate3d(0,0,0) scaleX(1)}}html[data-dsh-prts] :is( [data-slot=\"main.conversation\"],[data-slot=\"conversation\"]){min-width: 0; height: 100%; background: transparent}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-slot=\"main.conversation\"],[data-slot=\"conversation\"]) > [data-phase]{background: transparent !important}html[data-dsh-prts] [data-slot=\"conversation.session.header\"]{border-bottom: 1px solid var(--prts-line); background: color-mix(in srgb,var(--prts-canvas-elevated) 92%,transparent); font-family: var(--prts-mono)}html[data-dsh-prts] [data-session-code]{color: var(--prts-yellow); font-size: 11px; letter-spacing: .12em}html[data-dsh-prts] [data-prts-conversation-control=\"header\"]{margin-left: auto}html[data-dsh-prts] [data-conversation-scroll]{position: relative; z-index: 2}html[data-dsh-prts] [data-width-handle]:not([data-dragging]){z-index: 3}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-message-role=\"user\"],html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-chat-flow-kind=\"user\"]{position: relative; color: var(--prts-ink)}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-message-role=\"user\"],html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"]{border: 1px solid var(--prts-line-strong) !important; border-left: 4px solid var(--prts-yellow) !important; border-radius: var(--prts-radius-card) !important; background: var(--prts-panel-raised) !important; color: var(--prts-ink) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px); box-shadow: none !important}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-message-role=\"user\"] :is([data-markdown],[class*=\"markdown\" i]),html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] :is([data-markdown],[class*=\"markdown\" i]){background: transparent !important}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-message-role=\"user\"] :is(pre,table,blockquote),html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] :is(pre,table,blockquote){border: 1px solid var(--prts-line); background: var(--prts-glass-dense)}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-message-role=\"user\"] :is(pre,code),html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] :is(pre,code){font-family: var(--prts-mono) !important}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-message-role=\"user\"] pre,html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] pre{max-width: 100%; overflow: auto; padding: 14px; border-left: 3px solid var(--prts-cyan) !important; color: var(--prts-ink) !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-chat-flow-kind=\"user\"],[data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"]) ){position: relative; box-sizing: border-box; overflow: visible}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"]{padding-inline-end: 54px; color: var(--prts-ink)}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"]){--prts-chat-link-x: 22px; padding-inline-start: 56px; color: var(--prts-ink)}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"])::after,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::after{content: \"\"; position: absolute; z-index: 1; top: 54px; left: calc(var(--prts-chat-link-x) - 1px); width: 2px; height: 30px; border-radius: 1px; background: linear-gradient(to bottom,color-mix(in srgb,var(--prts-chat-link) 56%,transparent),color-mix(in srgb,var(--prts-chat-link) 20%,transparent) 72%,transparent); pointer-events: none}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"])::before,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"]::after,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::before,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]::after{position: absolute; z-index: 2; top: 2px; display: grid; place-items: center; box-sizing: border-box; width: 42px; height: 42px; border: 1px solid var(--prts-line); border-radius: 14px; background-color: var(--prts-chat-avatar-surface); box-shadow: inset 0 1px rgba(255,255,255,.08),0 8px 20px var(--prts-chat-shadow); pointer-events: none}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"])::before,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::before{content: \"\"; left: 0; width: 44px; height: 48px; border-color: color-mix(in srgb,var(--prts-cyan) 42%,var(--prts-line)); border-radius: 14px 14px 16px 16px; background-image: var(--prts-assistant-avatar-image,none),linear-gradient(145deg,rgba(255,255,255,.08),transparent 56%); background-repeat: no-repeat; background-position: center,center; background-size: cover,auto; box-shadow: inset 0 -2px color-mix(in srgb,var(--prts-cyan) 72%,transparent),inset 0 1px rgba(255,255,255,.08),0 8px 20px var(--prts-chat-shadow)}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"]::after,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]::after{content: \"我\"; right: 0; border-color: color-mix(in srgb,var(--prts-yellow) 58%,var(--prts-line)); background: linear-gradient(145deg,color-mix(in srgb,var(--prts-yellow) 18%,transparent),transparent 58%),var(--prts-chat-avatar-surface); color: color-mix(in srgb,var(--prts-yellow) 78%,var(--prts-ink)); font: 500 13px/1 var(--prts-mono)}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"],html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]{border: 1px solid var(--prts-chat-user-edge) !important; border-radius: 18px 6px 18px 18px !important; padding: 13px 18px !important; background: linear-gradient(145deg,color-mix(in srgb,var(--prts-yellow) 10%,transparent),transparent 54%),var(--prts-chat-user-surface) !important; color: var(--prts-ink) !important; clip-path: none !important; box-shadow: inset 0 1px color-mix(in srgb,var(--prts-yellow) 22%,transparent),0 9px 24px var(--prts-chat-shadow) !important; overflow-wrap: anywhere}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]{width: calc(100% - 54px); margin-inline-start: auto}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]::after{right: -54px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]{--prts-chat-link-x: -34px; position: relative; width: calc(100% - 56px); margin-inline-start: calc((100% - min(var(--dsh-chat-content-width,748px),100%)) / 2 + 56px); padding: 16px 22px !important; border: 1px solid var(--prts-chat-assistant-edge) !important; border-radius: 6px 18px 18px 18px !important; background: linear-gradient(118deg,color-mix(in srgb,var(--prts-cyan) 6%,transparent),transparent 44%),var(--prts-chat-assistant-surface) !important; color: var(--prts-ink) !important; box-shadow: inset 0 1px color-mix(in srgb,var(--prts-cyan) 10%,transparent),0 10px 28px var(--prts-chat-shadow) !important; overflow-wrap: anywhere}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::before{left: -56px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"]) [class$=\"_body\"]:has(:is([data-markdown],[data-slot*=\"markdown\" i],.markdown-body)),html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-prts-ai-surface]{box-sizing: border-box; width: fit-content; max-width: 100%; padding: 16px 22px !important; border: 1px solid var(--prts-chat-assistant-edge) !important; border-radius: 6px 18px 18px 18px !important; background: linear-gradient(118deg,color-mix(in srgb,var(--prts-cyan) 6%,transparent),transparent 44%),var(--prts-chat-assistant-surface) !important; color: var(--prts-ink) !important; box-shadow: inset 0 1px color-mix(in srgb,var(--prts-cyan) 10%,transparent),0 10px 28px var(--prts-chat-shadow) !important; overflow-wrap: anywhere}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-prts-ai-surface] > *{color: inherit}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-prts-ai-surface],[data-message-role=\"assistant\"] ) :is(p,li,h1,h2,h3,h4,h5,h6){color: var(--prts-ink) !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-prts-ai-surface],[data-message-role=\"assistant\"],[data-message-role=\"user\"],[data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] ) :is([data-markdown],[class*=\"markdown\" i]){background: transparent !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-prts-ai-surface],[data-message-role=\"assistant\"],[data-message-role=\"user\"],[data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] ) :is(pre,table,blockquote){border: 1px solid color-mix(in srgb,var(--prts-cyan) 24%,var(--prts-line)); background: color-mix(in srgb,var(--prts-canvas) 88%,transparent)}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-prts-ai-surface],[data-message-role=\"assistant\"],[data-message-role=\"user\"],[data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] ) :is(pre,code){font-family: var(--prts-mono) !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-prts-ai-surface],[data-message-role=\"assistant\"],[data-message-role=\"user\"],[data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] ) pre{max-width: 100%; overflow: auto; padding: 14px; border-left: 3px solid var(--prts-cyan) !important; color: var(--prts-ink) !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] :is( [data-prts-ai-surface],[data-message-role=\"assistant\"] ) blockquote{border-inline-start: 3px solid var(--prts-cyan)}html[data-dsh-prts] [aria-invalid=\"true\"],html[data-dsh-prts] [data-status=\"error\"],html[data-dsh-prts] [data-status=\"denied\"]{border-color: var(--prts-red) !important; color: var(--prts-red) !important}html[data-dsh-prts][data-prts-conversation-style=\"native\"] [data-prts-ambient-layer]{position: absolute; z-index: 0; inset: 0; overflow: hidden; opacity: .86; background: radial-gradient(circle at 48% 35%,color-mix(in srgb,var(--prts-cyan) 7%,transparent),transparent 32%),linear-gradient(115deg,transparent 0 42%,color-mix(in srgb,var(--prts-line) 18%,transparent) 42.2% 42.5%,transparent 42.7%),repeating-linear-gradient(0deg,transparent 0 27px,color-mix(in srgb,var(--prts-line) 12%,transparent) 27px 28px); pointer-events: none}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-prts-ambient-layer]{position: absolute; z-index: 0; inset: 0; overflow: hidden; opacity: 1; background: linear-gradient(90deg,color-mix(in srgb,var(--prts-chat-backdrop-edge) 58%,transparent),transparent 14% 86%,color-mix(in srgb,var(--prts-chat-backdrop-edge) 58%,transparent)),linear-gradient(180deg,color-mix(in srgb,var(--prts-chat-backdrop) 96%,var(--prts-canvas)),var(--prts-chat-backdrop)); pointer-events: none}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-prts-ambient-layer]::before,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-prts-ambient-layer]::after{display: none}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"][data-prts-conversation-state=\"active\"] [data-prts-particle-layer]{opacity: .04}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"][data-prts-conversation-state=\"active\"] [data-prts-ambient-glow],html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"][data-prts-conversation-state=\"active\"] [data-prts-ambient-edge]{display: none}html[data-dsh-prts][data-prts-texture=\"restrained\"] [data-prts-ambient-layer]{opacity: .56}html[data-dsh-prts][data-prts-texture=\"off\"] [data-prts-ambient-layer]{display: none}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"][data-prts-texture=\"restrained\"] [data-prts-ambient-layer]{opacity: .82}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"][data-prts-texture=\"off\"] [data-prts-ambient-layer]{display: block; opacity: .72}html[data-dsh-prts] [data-prts-particle-layer]{position: absolute; z-index: 1; inset: 0; width: 100%; height: 100%; pointer-events: none}html[data-dsh-prts] [data-prts-particle-layer]{opacity: 1; transition: opacity 120ms ease-out}html[data-dsh-prts] [data-prts-resize-shield]{content-visibility: hidden !important; contain-intrinsic-size: auto 800px}html[data-dsh-prts] [data-prts-particle-layer][data-prts-resizing]{opacity: .78; transition: none}html[data-dsh-prts] [data-prts-particle-layer][data-prts-resize-restoring]{opacity: 1; transition: opacity 120ms ease-out}html[data-dsh-prts] [data-prts-ambient-layer][data-prts-resizing]{opacity: .42; background: color-mix(in srgb,var(--prts-panel) 92%,var(--prts-canvas)); transition: none}html[data-dsh-prts] [data-prts-ambient-layer][data-prts-resizing] :is( [data-prts-ambient-glow],[data-prts-session-pickup] ){animation-play-state: paused !important}html[data-dsh-prts] :is( [data-prts-theme-settings][data-prts-resizing],[data-prts-settings-backdrop][data-prts-resizing] ),html[data-dsh-prts] [data-prts-resizing] > [data-composer-card]{backdrop-filter: none !important; -webkit-backdrop-filter: none !important; transition: none !important}html[data-dsh-prts] [data-prts-hero-active]::before{content: \"\"; position: absolute; inset: 0; pointer-events: none}html[data-dsh-prts]{--prts-hero-mark-base: clamp(380px,46%,720px); --prts-hero-mark-size: min(var(--prts-hero-mark-base),42dvh)}html[data-dsh-prts] [data-prts-hero-active] [data-composer-seat],html[data-dsh-prts] [data-prts-hero-active] [data-slot=\"conversation.composer\"]{position: relative; z-index: 5}html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-composer-fallback]{position: relative; border: 1px solid var(--prts-line-strong) !important; border-bottom: 3px solid var(--prts-yellow) !important; border-radius: var(--prts-radius-card) !important; background: var(--prts-active-glass) !important; clip-path: polygon(3px 0,calc(50% - 42px) 0,calc(50% - 37px) 5px,calc(50% + 37px) 5px,calc(50% + 42px) 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px); box-shadow: 0 14px 34px rgba(0,0,0,.18); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-composer-card] :is(textarea,[data-composer-input]),html[data-dsh-prts] [data-prts-composer-fallback] :is(textarea,[data-composer-input]){border: 0 !important; background: transparent !important; color: var(--prts-ink) !important; caret-color: var(--prts-yellow)}html[data-dsh-prts] [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),html[data-dsh-prts] [data-prts-conversation-control]{border: 1px solid var(--prts-line) !important; border-radius: var(--prts-radius-control) !important; background: var(--prts-panel-raised) !important; color: var(--prts-ink) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px)}html[data-dsh-prts] [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *):is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-conversation-control]:is(:hover,:focus-visible){border-color: var(--prts-yellow) !important}html[data-dsh-prts] [data-composer-card] button[aria-label*=\"send\" i],html[data-dsh-prts] [data-composer-card] button[type=\"submit\"]{background: var(--prts-yellow) !important; color: var(--prts-yellow-ink) !important}html[data-dsh-prts] [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *):active,html[data-dsh-prts] [data-prts-conversation-control]:active{transform: translateY(1px) scale(.98)}html[data-dsh-prts] [data-produced-files-row] > button[type=\"button\"],html[data-dsh-prts] [data-prts-to-bottom]{min-height: 36px; border: 1px solid var(--prts-line) !important; background: var(--prts-active-glass) !important; color: var(--prts-ink) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px)}html[data-dsh-prts] [data-prts-glass-control=\"model\"],html[data-dsh-prts] [data-prts-glass-control=\"permission\"],html[data-dsh-prts] [data-prts-glass-control=\"preset\"]{border: 1px solid var(--prts-line) !important; border-radius: var(--prts-radius-control) !important; background: var(--prts-active-glass) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-glass-menu],html[data-dsh-prts] [data-prts-floating-glass=\"menu\"],html[data-dsh-prts] [data-prts-floating-glass=\"listbox\"],html[data-dsh-prts] [data-prts-floating-glass=\"popover\"]{border: 1px solid var(--prts-glass-border) !important; border-radius: var(--prts-radius-overlay) !important; background: var(--prts-active-glass) !important; color: var(--prts-ink) !important; box-shadow: var(--prts-shadow-glass-overlay) !important; backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-prts-floating-glass=\"dialog\"]{border: 1px solid var(--prts-glass-border) !important; border-radius: var(--prts-radius-overlay) !important; background: var(--prts-panel) !important; color: var(--prts-ink) !important; box-shadow: var(--prts-shadow-glass-overlay) !important; backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-prts-floating-item]{min-height: 38px; border-radius: var(--prts-radius-control) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-floating-item]:is(:hover,[data-highlighted]){background: var(--prts-panel-muted) !important}html[data-dsh-prts] [data-prts-floating-input]{min-height: 44px; border: 1px solid var(--prts-line) !important; background: var(--prts-panel) !important; color: var(--prts-ink) !important}html[data-dsh-prts] :is( [data-prts-floating-glass=\"menu\"],[data-prts-floating-glass=\"listbox\"],[data-prts-floating-glass=\"popover\"] ) [data-prts-floating-danger]{color: var(--prts-red) !important}html[data-dsh-prts] [data-prts-floating-scrim]{background: rgba(3,5,6,.62) !important}html[data-dsh-prts-settings] .prts-plugin-settings{width: 100%; display: grid; gap: 16px; container: prts-plugin-settings / inline-size; color: inherit; font: inherit}html[data-dsh-prts-settings] .prts-plugin-settings__header{display: grid; gap: 5px; padding-bottom: 14px; border-bottom: 1px solid color-mix(in srgb,currentColor 18%,transparent)}html[data-dsh-prts-settings] .prts-plugin-settings__header h3,html[data-dsh-prts-settings] .prts-plugin-settings__header p{margin: 0}html[data-dsh-prts-settings] .prts-plugin-settings__header h3{font-size: 18px; font-weight: 650}html[data-dsh-prts-settings] .prts-plugin-settings__header p,html[data-dsh-prts-settings] .prts-plugin-settings__copy small{color: color-mix(in srgb,currentColor 62%,transparent); font-size: 12px; line-height: 1.5}html[data-dsh-prts-settings] .prts-plugin-settings__safe{margin: 0; padding: 10px 12px; border: 1px solid color-mix(in srgb,#df5750 42%,transparent); border-radius: 8px; background: color-mix(in srgb,#df5750 8%,transparent); color: inherit; font-size: 12px}html[data-dsh-prts-settings] .prts-plugin-settings__list{overflow: hidden; border: 1px solid color-mix(in srgb,currentColor 16%,transparent); border-radius: 10px}html[data-dsh-prts-settings] .prts-plugin-settings__row{min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 14px}html[data-dsh-prts-settings] .prts-plugin-settings__row + .prts-plugin-settings__row{border-top: 1px solid color-mix(in srgb,currentColor 12%,transparent)}html[data-dsh-prts-settings] .prts-plugin-settings__copy{min-width: 0; display: grid; gap: 3px}html[data-dsh-prts-settings] .prts-plugin-settings__copy strong{font-size: 13px; font-weight: 600}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch']{position: relative; width: 42px; height: 24px; flex: 0 0 auto; padding: 0; border: 0; border-radius: 999px; background: color-mix(in srgb,currentColor 18%,transparent); color: inherit; cursor: pointer}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'] > span{position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: currentColor; transition: transform 120ms ease}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'].is-active{background: var(--color-primary,#d9b800); color: #111}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'].is-active > span{transform: translateX(18px)}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch']:disabled{cursor: not-allowed; opacity: .45}@media (prefers-reduced-motion: reduce){html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'] > span{transition: none}}@container prts-plugin-settings (max-width: 22rem){html[data-dsh-prts-settings] .prts-plugin-settings__row{flex-direction: column; align-items: stretch; gap: 10px}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch']{align-self: flex-end}}@media (max-width: 640px){html[data-dsh-prts]{--prts-nav-width: 52px}html[data-dsh-prts] [data-slot=\"conversation.session.header\"]{padding-inline: 12px}html[data-dsh-prts-settings] .prts-settings{padding: 12px}}@media (max-width: 760px){html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"]{padding-inline: 8px 50px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"]){padding-inline: 0 8px; padding-inline-start: 50px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"])::before,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::before{left: 8px; width: 34px; height: 38px; border-radius: 11px 11px 13px 13px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"]::after,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]::after{right: 8px; width: 34px; height: 34px; border-radius: 11px; font-size: 11px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"],html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]{padding: 11px 15px !important; border-radius: 16px 5px 16px 16px !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"]) [class$=\"_body\"]:has(:is([data-markdown],[data-slot*=\"markdown\" i],.markdown-body)),html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-prts-ai-surface],html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]{padding: 13px 16px !important; border-radius: 5px 16px 16px 16px !important}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]{width: calc(100% - 42px)}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"user\"]::after{right: -42px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]{--prts-chat-link-x: -25px; width: calc(100% - 42px); margin-inline-start: 42px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::before{left: -42px}html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-chat-flow-kind=\"assistant-step\"]:not([data-chat-group-part=\"reasoning\"])::after,html[data-dsh-prts][data-prts-conversation-style=\"deck-chat\"] [data-message-role=\"assistant\"]::after{display: none}}@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))){html[data-dsh-prts] [data-prts-floating-glass],html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-glass-menu]{background: var(--prts-panel) !important}}@media (hover: hover) and (pointer: fine){html[data-dsh-prts] [data-prts-nav-rail] > button:hover b{transform: translateY(-1px)}}@media (prefers-reduced-transparency: reduce){html[data-dsh-prts]{--prts-active-glass: var(--prts-panel); --prts-active-glass-filter: none}}@media (prefers-contrast: more){html[data-dsh-prts]{--prts-line: currentColor; --prts-line-strong: currentColor}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] ),html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::before,html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::after{scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important}}html[data-dsh-prts]{--prts-hero-mark-base: clamp(300px,38%,520px); --prts-hero-mark-size: min(var(--prts-hero-mark-base),32dvh)}html[data-dsh-prts] [data-prts-region=\"sessions\"] > * > [data-slot=\"sidebar\"] > :first-child > button[aria-label*=\"new session\" i]{min-height: 40px; display: grid !important; place-items: center; margin: 0 0 14px; border: 1px solid var(--prts-line) !important; border-radius: var(--prts-radius-card) !important; background: var(--prts-panel-raised) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-rail-brand],html[data-dsh-prts] [data-prts-nav-rail] > button,html[data-dsh-prts] [data-prts-nav-bottom] > button{position: relative; width: 100%; min-width: 0; min-height: 48px; display: grid; place-items: center; padding: 0; border: 0; border-bottom: 1px solid #242b2f; border-radius: 0; background: transparent; color: #aeb8bd !important; cursor: pointer; clip-path: none}html[data-dsh-prts] [data-prts-rail-brand]{height: 64px; border-bottom-color: #30383d}html[data-dsh-prts] [data-prts-rail-brand]:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-rail-brand][aria-expanded=\"true\"],html[data-dsh-prts] [data-prts-nav-rail] > button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-nav-bottom] > button:is(:hover,:focus-visible){background: #151a1d; color: #f3f6f7 !important}html[data-dsh-prts] [data-prts-theme-disable]::after{content: \"\"; position: absolute; inset: 8px auto 8px 0; width: 2px; background: var(--prts-yellow); transform: scaleY(0); transition: transform 160ms var(--prts-ease-snap)}html[data-dsh-prts] [data-prts-theme-disable]:is(:hover,:focus-visible){color: var(--prts-yellow) !important}html[data-dsh-prts] [data-prts-theme-disable]:is(:hover,:focus-visible)::after{transform: scaleY(1)}html[data-dsh-prts] [data-prts-theme-disable-icon]{width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; transition: transform 120ms var(--prts-ease-snap),opacity 120ms ease}html[data-dsh-prts] [data-prts-theme-disable]:active [data-prts-theme-disable-icon]{opacity: .72; transform: scale(.9)}html[data-dsh-prts] [data-prts-rail-brand][aria-expanded=\"true\"]::after{content: \"\"; position: absolute; inset: 7px auto 7px 0; width: 2px; background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-nav-rail] small,html[data-dsh-prts] [data-prts-connection-label]{position: absolute; z-index: 180; top: 50%; left: calc(100% + 9px); width: max-content; max-width: 180px; padding: 6px 8px; border: 1px solid #3d474d; border-radius: 3px; opacity: 0; background: #0e1215; color: #eef2f3; font: 700 9px/1.2 var(--prts-mono); letter-spacing: .04em; text-align: left; transform: translate3d(-5px,-50%,0); transition: opacity 130ms ease,transform 160ms var(--prts-ease-snap); pointer-events: none; white-space: nowrap}html[data-dsh-prts] [data-prts-nav-rail] button:is(:hover,:focus-visible) small,html[data-dsh-prts] [data-prts-connection-indicator]:is(:hover,:focus-visible) [data-prts-connection-label]{opacity: 1; transform: translate3d(0,-50%,0)}html[data-dsh-prts] [data-prts-connection-indicator]{position: relative; min-height: 38px; padding: 0; color: #9da8ad}html[data-dsh-prts] [data-prts-nav-bottom] svg,html[data-dsh-prts] [data-prts-nav-bottom] b{display: block; color: currentColor}html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-composer-fallback],html[data-dsh-prts] [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),html[data-dsh-prts] [data-prts-conversation-control],html[data-dsh-prts] [data-produced-files-row] > button[type=\"button\"],html[data-dsh-prts] [data-prts-to-bottom]{border-radius: 3px !important; clip-path: none !important}html[data-dsh-prts] [data-prts-facility-face]{right: 0 !important; border: 0 !important; background: var(--prts-line-strong)}html[data-dsh-prts] [data-prts-facility-face]::after{content: \"\"; position: absolute; inset: 1px; background: var(--prts-panel-raised); clip-path: polygon( 3px 0,calc(50% - 25px) 0,calc(50% - 20px) 3.333px,calc(50% + 20px) 3.333px,calc(50% + 25px) 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px )}html[data-dsh-prts] [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-actions] button{border: 1px solid var(--prts-line-strong) !important; border-radius: 3px !important; clip-path: none !important}html[data-dsh-prts] [data-prts-hero-active]{display: grid; grid-template-rows: minmax(220px,1fr) auto; align-content: center; gap: clamp(28px,5dvh,54px); padding-top: 24px; padding-bottom: 34px}html[data-dsh-prts] [data-prts-hero-active] [data-phase=\"hero\"]{min-height: min(36dvh,390px); align-self: end}html[data-dsh-prts] [data-prts-hero-active] [data-composer-seat]{align-self: start; justify-self: center}html[data-dsh-prts]{--prts-hero-mark-base: clamp(320px,42%,580px); --prts-hero-mark-size: min(var(--prts-hero-mark-base),42dvh)}html[data-dsh-prts] [data-prts-region=\"frame\"]{position: relative}html[data-dsh-prts] [data-prts-region=\"frame\"] > [data-shell-overlay]{position: absolute !important; inset: 0; min-width: 0; min-height: 0; pointer-events: none}html[data-dsh-prts] [data-prts-region=\"frame\"] > [data-shell-overlay] > *{pointer-events: auto}html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.settings\"]{opacity: 1; visibility: visible; pointer-events: auto}html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.settings\"] > button{color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-workspace-icon]{display: none !important}html[data-dsh-prts] [data-prts-workspace-disclosure]{position: relative; z-index: 4; width: 14px; flex: 0 0 14px; display: grid; place-items: center; margin-left: calc(var(--prts-spine-width) + 4px); color: var(--prts-muted); transform: translate3d(var(--prts-row-shift),0,0); transition: transform 220ms var(--prts-ease-spring),color 160ms ease}html[data-dsh-prts] [data-prts-workspace-row]::before,html[data-dsh-prts] [data-prts-session-row]::before{clip-path: polygon( 1px 0,calc(100% - 1px) 0,100% 1px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 1px),calc(100% - 1px) 100%,1px 100%,0 calc(100% - 1px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 1px ) !important}html[data-dsh-prts] :is([data-prts-workspace-row],[data-prts-session-row]) [data-prts-facility-face]{right: var(--prts-row-end-reserve) !important}html[data-dsh-prts] [data-prts-facility-face]{border: 0 !important; background: var(--prts-line-strong) !important; clip-path: polygon( 1px 0,calc(50% - 25px) 0,calc(50% - 20px) 3.333px,calc(50% + 20px) 3.333px,calc(50% + 25px) 0,calc(100% - 1px) 0,100% 1px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 1px),calc(100% - 1px) 100%,1px 100%,0 calc(100% - 1px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 1px ) !important}html[data-dsh-prts] [data-prts-facility-face]::after{content: \"\"; position: absolute; inset: 1px; background: var(--prts-panel-raised); clip-path: polygon( 0 0,calc(50% - 24px) 0,calc(50% - 19px) 3.333px,calc(50% + 19px) 3.333px,calc(50% + 24px) 0,100% 0,100% calc(50% - 4px),calc(100% - 2px) calc(50% - 2px),calc(100% - 2px) calc(50% + 2px),100% calc(50% + 4px),100% 100%,0 100%,0 calc(50% + 4px),2px calc(50% + 2px),2px calc(50% - 2px),0 calc(50% - 4px) )}html[data-dsh-prts] [data-prts-workspace-actions]{width: 57px !important}html[data-dsh-prts] [data-prts-session-actions]{width: auto !important}html[data-dsh-prts] [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-actions] button{width: 28px !important; min-width: 28px !important; position: relative; isolation: isolate; overflow: hidden; border: 0 !important; border-radius: 0 !important; background: var(--prts-line) !important; clip-path: polygon( 1px 0,calc(100% - 1px) 0,100% 1px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 1px),calc(100% - 1px) 100%,1px 100%,0 calc(100% - 1px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 1px ) !important}html[data-dsh-prts] [data-prts-workspace-actions] button::before,html[data-dsh-prts] [data-prts-session-actions] button::before{content: \"\"; position: absolute; z-index: -1; inset: 1px; background: var(--prts-panel-raised); clip-path: polygon( 0 0,100% 0,100% calc(50% - 4px),calc(100% - 2px) calc(50% - 2px),calc(100% - 2px) calc(50% + 2px),100% calc(50% + 4px),100% 100%,0 100%,0 calc(50% + 4px),2px calc(50% + 2px),2px calc(50% - 2px),0 calc(50% - 4px) ); pointer-events: none}html[data-dsh-prts] [data-prts-workspace-actions] button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-session-actions] button:is(:hover,:focus-visible){background: var(--prts-yellow) !important}html[data-dsh-prts] [data-prts-session-time]{position: relative; z-index: 3; flex: 0 0 auto; margin-right: 39px; padding-left: 8px; transform: translate3d(var(--prts-row-shift),0,0); transition: opacity 120ms ease,transform 220ms var(--prts-ease-spring)}html[data-dsh-prts] [data-prts-session-row]:hover [data-prts-session-time]{opacity: 0}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"] [data-prts-session-time]{opacity: 0}html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-composer-fallback]{position: relative; isolation: isolate; overflow: visible; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; clip-path: none !important; backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-composer-card]::before,html[data-dsh-prts] [data-prts-composer-fallback]::before{content: \"\"; position: absolute; z-index: 0; inset: 0; background: var(--prts-line-strong); clip-path: polygon( 3px 0,calc(50% - 42px) 0,calc(50% - 37px) 5px,calc(50% + 37px) 5px,calc(50% + 42px) 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px ); box-shadow: 0 14px 34px rgba(0,0,0,.18); pointer-events: none}html[data-dsh-prts] [data-composer-card]::after,html[data-dsh-prts] [data-prts-composer-fallback]::after{content: \"\"; position: absolute; z-index: 1; inset: 1px 1px 3px; background: var(--prts-composer-surface,var(--prts-active-glass)); clip-path: polygon( 2px 0,calc(50% - 41px) 0,calc(50% - 36px) 5px,calc(50% + 36px) 5px,calc(50% + 41px) 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px ); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter); pointer-events: none}html[data-dsh-prts] [data-composer-card] > :not([data-prts-composer-signal]):not([data-slot=\"conversation.input.attachments\"]),html[data-dsh-prts] [data-prts-composer-fallback] > :not([data-prts-composer-signal]):not([data-slot=\"conversation.input.attachments\"]){position: relative; z-index: 2}html[data-dsh-prts] [data-composer-card] > [data-slot=\"conversation.input.attachments\"] > *,html[data-dsh-prts] [data-prts-composer-fallback] > [data-slot=\"conversation.input.attachments\"] > *{position: relative; z-index: 2}html[data-dsh-prts] [data-prts-composer-signal]{position: absolute; z-index: 3; inset: 0; overflow: visible; pointer-events: none}html[data-dsh-prts] [data-prts-composer-signal]::before{content: \"\"; position: absolute; left: 50%; background: var(--prts-yellow); opacity: .82; pointer-events: none; transition: transform 160ms var(--prts-ease-snap),opacity 160ms ease}html[data-dsh-prts] [data-prts-composer-signal]::before{bottom: 0; width: calc(100% - 6px); height: 3px; transform: translateX(-50%) scaleX(.16)}html[data-dsh-prts] [data-composer-card]:focus-within,html[data-dsh-prts] [data-prts-composer-fallback]:focus-within{--prts-composer-surface: color-mix(in srgb,var(--prts-active-glass) 94%,var(--prts-ink) 6%)}html[data-dsh-prts] :is([data-composer-card],[data-prts-composer-fallback]):focus-within [data-prts-composer-signal]::before{opacity: 1; transform: translateX(-50%) scaleX(1)}html[data-dsh-prts] [data-composer-card] :is(textarea,[data-composer-input]):focus-visible,html[data-dsh-prts] [data-prts-composer-fallback] :is(textarea,[data-composer-input]):focus-visible{outline: none !important}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-composer-signal]::before{transition: none}}html[data-dsh-prts] [data-prts-theme-settings] :is(input,textarea,select):focus-visible,html[data-dsh-prts] [data-prts-floating-input]:focus-visible{outline: none !important; border-color: var(--prts-yellow) !important; box-shadow: 0 0 0 1px var(--prts-yellow) !important}html[data-dsh-prts] [data-prts-conversation-control=\"header\"]{height: 36px; min-height: 36px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px}html[data-dsh-prts] [data-prts-conversation-control=\"header\"] svg{width: 16px; height: 16px; flex: 0 0 16px}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] button[aria-label*=\"send\" i],html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] button[type=\"submit\"]{min-width: 40px !important; padding: 0 !important; font-size: 11px}html[data-dsh-prts] [data-prts-hero-active] [data-prts-glass-control=\"action\"]{width: 36px !important; min-width: 36px !important; padding: 0 !important; flex: 0 0 36px}html[data-dsh-prts] :is( [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-composer-fallback] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-glass-control],[data-prts-conversation-control]:not([data-prts-conversation-control=\"micro\"]),[data-produced-files-row] > button[type=\"button\"] ){--prts-control-outline: var(--prts-line); --prts-control-surface: var(--prts-panel-raised); position: relative; isolation: isolate; overflow: hidden; border: 0 !important; border-radius: 0 !important; background: var(--prts-control-outline) !important; color: var(--prts-ink) !important; clip-path: polygon( 3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px ) !important}html[data-dsh-prts] :is( [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-composer-fallback] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-glass-control],[data-prts-conversation-control]:not([data-prts-conversation-control=\"micro\"]),[data-produced-files-row] > button[type=\"button\"] )::before{content: \"\"; position: absolute; z-index: -1; inset: 1px; background: var(--prts-control-surface); clip-path: polygon( 2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px ); pointer-events: none}html[data-dsh-prts] :is( [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-composer-fallback] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-glass-control],[data-prts-conversation-control]:not([data-prts-conversation-control=\"micro\"]),[data-produced-files-row] > button[type=\"button\"] ):is(:hover,:focus-visible){--prts-control-outline: var(--prts-yellow)}html[data-dsh-prts] :is( [data-prts-glass-control=\"model\"],[data-prts-glass-control=\"permission\"],[data-prts-glass-control=\"preset\"],[data-prts-conversation-control=\"utility\"],[data-produced-files-row] > button[type=\"button\"] ){--prts-control-surface: var(--prts-active-glass) !important}html[data-dsh-prts] [data-composer-card] button[aria-label*=\"send\" i],html[data-dsh-prts] [data-composer-card] button[type=\"submit\"],html[data-dsh-prts] [data-prts-conversation-control=\"cta\"]{font-size: 11px; --prts-control-outline: var(--prts-yellow) !important; --prts-control-surface: var(--prts-yellow) !important; color: var(--prts-yellow-ink) !important}html[data-dsh-prts] [data-prts-conversation-control=\"danger\"]{--prts-control-outline: var(--prts-red) !important; --prts-control-surface: color-mix(in srgb,var(--prts-red) 14%,var(--prts-panel-raised)) !important; color: var(--prts-red) !important}html[data-dsh-prts] [data-prts-hero-active]{--prts-hero-narrow-spacer: clamp(24px,8dvh,72px); --prts-hero-wide-spacer: clamp(96px,22dvh,340px); min-height: 100%; height: calc(100% - 48px) !important; overflow-y: auto; display: grid; grid-template-columns: minmax(0,1fr); grid-template-rows: minmax(0,1fr) auto min( var(--prts-hero-wide-spacer),max(var(--prts-hero-narrow-spacer),calc(var(--prts-hero-narrow-spacer) + 63vw - 403.2px)) ); align-content: stretch; gap: clamp(24px,calc(5vw - 8px),40px); padding: clamp(18px,calc(1.875vw + 6px),24px) clamp(12px,3vw,42px) 0 clamp(18px,3vw,42px)}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card],html[data-dsh-prts] [data-prts-hero-active] [data-prts-composer-fallback]{width: 100%; margin-inline: auto; padding: 10px 12px}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] :is(textarea,[data-composer-input]),html[data-dsh-prts] [data-prts-hero-active] [data-prts-composer-fallback] :is(textarea,[data-composer-input]){min-height: 64px; line-height: 1.55}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] textarea,html[data-dsh-prts] [data-prts-hero-active] [data-prts-composer-fallback] textarea{resize: vertical}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] button:not([data-slot=\"conversation.input.attachments\"] *):not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),html[data-dsh-prts] [data-prts-hero-active] [data-prts-glass-control]{min-height: 36px}html[data-dsh-prts] [data-prts-hero-active]::before{margin-top: calc(var(--prts-hero-mark-size) + 44px)}html[data-dsh-prts] [data-prts-hero-active] [data-phase=\"hero\"]{grid-row: 1; min-height: 0; align-self: stretch}html[data-dsh-prts] [data-prts-hero-active] [data-composer-seat]{grid-row: 2; width: min(calc(var(--dsh-chat-content-width,748px) + 64px),100%); min-width: 0 !important; align-self: end; justify-self: center}html[data-dsh-prts] [data-prts-theme-settings]{--prts-settings-text: .875rem; --prts-settings-small: .75rem; --prts-settings-heading: .875rem; position: fixed; z-index: 10000; inset: 50% auto auto 50%; width: min(clamp(50rem,55vw,65rem),calc(100vw - 2rem)); height: auto; max-width: none; max-height: min(60rem,calc(100dvh - 2rem)); container: prts-settings / inline-size; margin: 0; padding: 0; overflow: visible; border: 0; border-radius: 0; background: transparent; color: var(--prts-ink); box-shadow: 0 28px 90px rgba(0,0,0,.46); clip-path: none; opacity: 0; transform: translate(-50%,calc(-50% + 8px)) scale(.992); pointer-events: none; transition: opacity 150ms ease,transform 220ms var(--prts-ease-spring)}html[data-dsh-prts] [data-prts-theme-settings][open]{display: block}html[data-dsh-prts] [data-prts-theme-settings][data-prts-settings-visible]{opacity: 1; transform: translate(-50%,-50%) scale(1); pointer-events: auto}html[data-dsh-prts] [data-prts-theme-settings][data-prts-resizing]{transition: none}html[data-dsh-prts] [data-prts-theme-settings][data-prts-resizing]::backdrop,html[data-dsh-prts] [data-prts-settings-backdrop][data-prts-resizing]{backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-prts-theme-settings][data-prts-resizing] [data-prts-option-sample=\"glass\"]::after{backdrop-filter: none; -webkit-backdrop-filter: none; transition: none}html[data-dsh-prts] [data-prts-theme-settings]::before{content: none}html[data-dsh-prts] [data-prts-theme-settings]::backdrop{background: color-mix(in srgb,var(--prts-canvas) 72%,transparent); backdrop-filter: blur(5px) saturate(.82); -webkit-backdrop-filter: blur(5px) saturate(.82)}html[data-dsh-prts] [data-prts-settings-backdrop]{z-index: 9999; inset: 0; background: color-mix(in srgb,var(--prts-canvas) 72%,transparent); backdrop-filter: blur(5px) saturate(.82); -webkit-backdrop-filter: blur(5px) saturate(.82)}html[data-dsh-prts] [data-prts-settings-frame]{position: relative; height: auto; max-height: inherit; display: grid; grid-template-rows: auto minmax(0,1fr); overflow: hidden; isolation: isolate; border: 1px solid var(--prts-line-strong); background: linear-gradient(125deg,color-mix(in srgb,var(--prts-cyan) 4%,transparent),transparent 34%),var(--prts-panel); clip-path: polygon(4px 0,calc(100% - 38px) 0,100% 38px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px)}html[data-dsh-prts] [data-prts-settings-frame]::before{content: \"\"; position: absolute; z-index: 3; top: 0; right: 37px; width: 118px; height: 2px; background: var(--prts-cyan); pointer-events: none}html[data-dsh-prts] [data-prts-theme-settings-header]{display: grid; align-items: center; min-height: 68px; grid-template-columns: minmax(180px,auto) minmax(0,1fr); gap: 14px; padding: 13px 48px 12px 16px; border-bottom: 1px solid var(--prts-line-strong); background: color-mix(in srgb,var(--prts-canvas-elevated) 92%,transparent)}html[data-dsh-prts] [data-prts-theme-settings-header] > span{display: grid; gap: 4px}html[data-dsh-prts] [data-prts-theme-settings-header] small,html[data-dsh-prts] [data-prts-theme-settings] section > header small,html[data-dsh-prts] [data-prts-theme-settings] summary small,html[data-dsh-prts] [data-prts-settings-actions] small{color: var(--prts-muted); font: 700 8px/1.3 var(--prts-mono); letter-spacing: .08em}html[data-dsh-prts] [data-prts-theme-settings-header] strong{font: 800 19px/1 var(--prts-display); letter-spacing: .07em}html[data-dsh-prts] [data-prts-settings-summary]{display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px}html[data-dsh-prts] [data-prts-settings-summary] span{min-height: 22px; padding: 4px 7px; box-shadow: inset 0 0 0 1px var(--prts-line); background: color-mix(in srgb,var(--prts-panel-raised) 86%,transparent); color: var(--prts-cyan); font: 700 8px/1 var(--prts-mono); clip-path: polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}html[data-dsh-prts] [data-prts-theme-settings-close]{position: absolute; z-index: 5; top: 13px; right: 13px; width: 36px; height: 36px; color: var(--prts-ink)}html[data-dsh-prts] [data-prts-theme-settings-scroll]{min-height: 0; overflow-y: auto; padding: 12px; scrollbar-gutter: stable}html[data-dsh-prts] [data-prts-settings-presets],html[data-dsh-prts] [data-prts-settings-common],html[data-dsh-prts] [data-prts-settings-advanced],html[data-dsh-prts] [data-prts-settings-actions]{position: relative; margin: 0; overflow: hidden; border: 0; border-bottom: 1px solid var(--prts-line-strong); background: color-mix(in srgb,var(--prts-canvas-elevated) 82%,transparent); clip-path: none}html[data-dsh-prts] [data-prts-settings-presets] > header,html[data-dsh-prts] [data-prts-settings-common] > header{min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 11px; border-bottom: 1px solid color-mix(in srgb,var(--prts-line) 72%,transparent)}html[data-dsh-prts] [data-prts-settings-presets] > header span,html[data-dsh-prts] [data-prts-settings-common] > header span,html[data-dsh-prts] [data-prts-settings-advanced] summary > span{display: flex; align-items: baseline; gap: 9px}html[data-dsh-prts] [data-prts-settings-presets] > header strong,html[data-dsh-prts] [data-prts-settings-common] > header strong,html[data-dsh-prts] [data-prts-settings-advanced] summary strong{font: 800 13px/1 var(--prts-display); letter-spacing: .05em}html[data-dsh-prts] [data-prts-advanced-summary]{pointer-events: none; color: var(--prts-cyan); font: 800 8px/1 var(--prts-mono); letter-spacing: .06em}html[data-dsh-prts] [data-prts-settings-presets],html[data-dsh-prts] [data-prts-settings-common],html[data-dsh-prts] [data-prts-settings-advanced],html[data-dsh-prts] [data-prts-settings-actions]{border-inline: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-settings-presets]{border-top: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-settings-presets] > div{display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 0; padding: 0}html[data-dsh-prts] [data-prts-preset-card]{display: grid; text-align: left; min-height: 66px; align-content: center; gap: 6px; padding: 11px 12px !important; border-right: 1px solid var(--prts-line) !important; position: relative; overflow: hidden; box-shadow: none; background: transparent !important; clip-path: none}html[data-dsh-prts] [data-prts-preset-card]:last-child{border-right: 0 !important}html[data-dsh-prts] [data-prts-preset-card] strong{font-size: 12px}html[data-dsh-prts] [data-prts-preset-card] span{overflow: hidden; font-size: 8px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-preset-card].is-selected{box-shadow: inset 0 -2px 0 var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 9%,transparent) !important}html[data-dsh-prts] [data-prts-settings-common-grid]{display: grid; grid-template-columns: repeat(2,minmax(0,1fr))}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{min-height: 50px; grid-template-columns: 94px minmax(0,1fr); align-items: center; gap: 8px; padding: 7px 10px; border-right: 1px solid var(--prts-line); border-bottom: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:nth-child(2n){border-right: 0}html[data-dsh-prts] [data-prts-settings-common] :is( [data-prts-setting-row=\"sessionFlowPalette\"],[data-prts-setting-row=\"sessionFlowColors\"],[data-prts-setting-row=\"sessionFlowSpeed\"],[data-prts-setting-row=\"conversationStyle\"] ){grid-column: 1 / -1; border-right: 0}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row=\"conversationStyle\"]{border-bottom: 0}html[data-dsh-prts] [data-prts-setting-row] > div{min-width: 0; display: flex; gap: 4px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row] > span{min-width: 0; display: grid; gap: 3px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row] > span > strong{font: 700 9px/1.1 var(--prts-display)}html[data-dsh-prts] [data-prts-setting-note]{color: var(--prts-yellow); font: 700 7px/1.25 var(--prts-mono); letter-spacing: 0}html[data-dsh-prts] [data-prts-settings-common] button[data-prts-setting-key]{min-width: 0; flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; gap: 5px}html[data-dsh-prts] [data-prts-setting-row=\"sessionFlowPalette\"] > div{flex-wrap: wrap}html[data-dsh-prts] [data-prts-setting-row=\"sessionFlowPalette\"] button[data-prts-setting-key]{flex-basis: 98px}html[data-dsh-prts] [data-prts-option-sample]{position: relative; width: 22px; height: 14px; flex: 0 0 22px; overflow: hidden; border: 1px solid color-mix(in srgb,currentColor 45%,var(--prts-line)); background: var(--prts-canvas)}html[data-dsh-prts] [data-prts-option-sample=\"texture\"][data-prts-option-sample-value=\"off\"]{background: linear-gradient(var(--prts-line),var(--prts-line)) 50% 50% / 12px 1px no-repeat,var(--prts-canvas)}html[data-dsh-prts] [data-prts-option-sample=\"texture\"][data-prts-option-sample-value=\"restrained\"]{background: repeating-linear-gradient(115deg,var(--prts-canvas) 0 6px,color-mix(in srgb,var(--prts-cyan) 38%,var(--prts-canvas)) 6px 7px)}html[data-dsh-prts] [data-prts-option-sample=\"texture\"][data-prts-option-sample-value=\"full\"]{background: repeating-linear-gradient(115deg,transparent 0 4px,color-mix(in srgb,var(--prts-cyan) 62%,transparent) 4px 5px),repeating-linear-gradient(25deg,var(--prts-canvas) 0 7px,color-mix(in srgb,var(--prts-line-strong) 72%,var(--prts-canvas)) 7px 8px)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"]{background: linear-gradient(135deg,color-mix(in srgb,var(--prts-cyan) 54%,transparent) 25%,transparent 25%) 0 0 / 8px 8px,linear-gradient(315deg,color-mix(in srgb,var(--prts-yellow) 38%,transparent) 25%,transparent 25%) 4px 4px / 8px 8px,var(--prts-canvas)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"]::after{content: \"\"; position: absolute; inset: 0; background: color-mix(in srgb,var(--prts-panel-raised) 64%,transparent); backdrop-filter: blur(2px) saturate(1.15); -webkit-backdrop-filter: blur(2px) saturate(1.15)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"off\"]::after{background: var(--prts-panel-raised); backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"soft\"]::after{background: color-mix(in srgb,var(--prts-panel-raised) 82%,transparent); backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"standard\"]::after{background: color-mix(in srgb,var(--prts-panel-raised) 62%,transparent)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"clear\"]::after{background: color-mix(in srgb,var(--prts-panel-raised) 34%,transparent); backdrop-filter: blur(4px) saturate(1.35); -webkit-backdrop-filter: blur(4px) saturate(1.35)}html[data-dsh-prts] [data-prts-option-sample=\"sessionFlowPalette\"]{border: 0; background: linear-gradient(90deg,#f7ddeb 0 33%,#65ddb0 33% 66%,#6eb7f3 66%); clip-path: polygon(0 40%,24% 18%,48% 54%,72% 24%,100% 46%,100% 68%,72% 46%,48% 76%,24% 40%,0 62%)}html[data-dsh-prts] [data-prts-option-sample=\"sessionFlowPalette\"][data-prts-option-sample-value=\"rhodes\"]{background: linear-gradient(90deg,#b9edf4 0 33%,#5ccddb 33% 66%,#5a9ee6 66%)}html[data-dsh-prts] [data-prts-option-sample=\"sessionFlowPalette\"][data-prts-option-sample-value=\"amber\"]{background: linear-gradient(90deg,#ffe6a3 0 33%,#f0c800 33% 66%,#ee8f42 66%)}html[data-dsh-prts] [data-prts-option-sample=\"sessionFlowPalette\"][data-prts-option-sample-value=\"alert\"]{background: linear-gradient(90deg,#ffc0b8 0 33%,#ee625a 33% 66%,#db5b8c 66%)}html[data-dsh-prts] [data-prts-option-sample=\"sessionFlowPalette\"][data-prts-option-sample-value=\"custom\"]{background: linear-gradient(90deg,#d95785 0 33%,#d0a900 33% 66%,#268fbd 66%)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row=\"sessionFlowColors\"]{align-items: stretch; padding-block: 9px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-session-flow-color-workbench]{display: grid; grid-template-columns: minmax(160px,.8fr) minmax(0,1.2fr); align-items: center; gap: 10px}html[data-dsh-prts] [data-prts-session-flow-preview]{--prts-lifeline-pink: #f7ddeb; --prts-lifeline-green: #65ddb0; --prts-lifeline-blue: #6eb7f3; width: 100%; height: 54px; display: block; overflow: visible; border: 1px solid var(--prts-line); background: color-mix(in srgb,var(--prts-canvas) 72%,transparent)}html[data-dsh-prts] [data-prts-session-flow-preview][data-prts-session-flow-preview-palette=\"rhodes\"]{--prts-lifeline-pink: #b9edf4; --prts-lifeline-green: #5ccddb; --prts-lifeline-blue: #5a9ee6}html[data-dsh-prts] [data-prts-session-flow-preview][data-prts-session-flow-preview-palette=\"amber\"]{--prts-lifeline-pink: #ffe6a3; --prts-lifeline-green: #f0c800; --prts-lifeline-blue: #ee8f42}html[data-dsh-prts] [data-prts-session-flow-preview][data-prts-session-flow-preview-palette=\"alert\"]{--prts-lifeline-pink: #ffc0b8; --prts-lifeline-green: #ee625a; --prts-lifeline-blue: #db5b8c}html[data-dsh-prts] [data-prts-session-flow-preview][data-prts-session-flow-preview-palette=\"custom\"]{--prts-lifeline-pink: var(--prts-session-flow-back); --prts-lifeline-green: var(--prts-session-flow-core); --prts-lifeline-blue: var(--prts-session-flow-front)}html[data-dsh-prts] [data-prts-session-flow-preview-filament=\"back\"]{--prts-preview-color: var(--prts-lifeline-pink)}html[data-dsh-prts] [data-prts-session-flow-preview-filament=\"core\"]{--prts-preview-color: var(--prts-lifeline-green)}html[data-dsh-prts] [data-prts-session-flow-preview-filament=\"front\"]{--prts-preview-color: var(--prts-lifeline-blue)}html[data-dsh-prts] [data-prts-session-flow-preview-layer]{fill: none; stroke: var(--prts-preview-color); stroke-linecap: round; stroke-linejoin: round}html[data-dsh-prts] [data-prts-session-flow-preview-layer=\"body\"]{stroke-width: 1.3; opacity: .92}html[data-dsh-prts] [data-prts-session-flow-preview-layer=\"halo\"],html[data-dsh-prts] [data-prts-session-flow-preview-layer=\"core\"]{opacity: 0}html[data-dsh-prts][data-prts-session-glow=\"on\"] [data-prts-session-flow-preview-layer=\"halo\"]{stroke-width: 5; opacity: .25; filter: blur(1.2px)}html[data-dsh-prts][data-prts-session-glow=\"on\"] [data-prts-session-flow-preview-layer=\"body\"]{stroke-width: 2.2}html[data-dsh-prts][data-prts-session-glow=\"on\"] [data-prts-session-flow-preview-layer=\"core\"]{stroke: color-mix(in srgb,var(--prts-preview-color) 18%,#fff); stroke-width: .72; opacity: .98}html[data-dsh-prts][data-prts-scheme=\"light\"][data-prts-session-glow=\"on\"] [data-prts-session-flow-preview-layer=\"halo\"]{stroke: color-mix(in srgb,var(--prts-preview-color) 42%,#fff); stroke-width: 5.5; opacity: .45; filter: blur(1.3px)}html[data-dsh-prts][data-prts-scheme=\"light\"][data-prts-session-glow=\"on\"] [data-prts-session-flow-preview-layer=\"core\"]{stroke: color-mix(in srgb,var(--prts-preview-color) 58%,#fff)}html[data-dsh-prts] [data-prts-session-flow-color-inputs]{display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 5px}html[data-dsh-prts] [data-prts-session-flow-color-inputs] label{min-width: 0; display: grid; grid-template-columns: 34px minmax(34px,1fr); gap: 4px; align-items: center; color: var(--prts-muted); font: 700 8px/1 var(--prts-mono)}html[data-dsh-prts] [data-prts-session-flow-color-inputs] input[type=\"color\"]{width: 100%; height: 28px; padding: 2px; border: 1px solid var(--prts-line); border-radius: 0; background: var(--prts-panel-raised); cursor: pointer}html[data-dsh-prts] [data-prts-session-flow-color-inputs] output{grid-column: 1 / -1; color: var(--prts-ink); font: 700 8px/1 var(--prts-mono); text-align: center; text-transform: uppercase}html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key],html[data-dsh-prts] [data-prts-retry-save],html[data-dsh-prts] [data-prts-reset-visual],html[data-dsh-prts] [data-prts-reset-confirm-action],html[data-dsh-prts] [data-prts-reset-cancel]{position: relative; overflow: hidden; min-height: 30px; padding: 6px 8px; border: 0 !important; box-shadow: inset 0 0 0 1px var(--prts-line); background: var(--prts-panel-raised); color: var(--prts-muted); font: 700 8px/1 var(--prts-mono); white-space: nowrap; clip-path: polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key].is-selected{box-shadow: inset 0 0 0 1px var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 12%,var(--prts-panel-raised)); color: var(--prts-ink); html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key]::after{content: \"\"; position: absolute; z-index: 3; inset: 0; opacity: 0; box-shadow: inset 0 0 0 1px var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 18%,transparent); pointer-events: none}html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key][data-prts-setting-feedback]::after{opacity: 1}}html[data-dsh-prts] [data-prts-theme-settings] button:focus-visible,html[data-dsh-prts] [data-prts-theme-settings] summary:focus-visible,html[data-dsh-prts] [data-prts-theme-settings] input:focus-visible{outline: 2px solid var(--prts-cyan); outline-offset: 2px}html[data-dsh-prts] [data-prts-settings-advanced] summary{min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px; cursor: pointer; list-style: none}html[data-dsh-prts] [data-prts-settings-advanced] summary::-webkit-details-marker{display: none}html[data-dsh-prts] [data-prts-settings-advanced] summary::after{content: \"+\"; width: 24px; height: 24px; display: grid; place-items: center; margin-left: 2px; border: 1px solid var(--prts-line); color: var(--prts-cyan); font: 800 13px/1 var(--prts-mono)}html[data-dsh-prts] [data-prts-settings-advanced][open] summary::after{content: \"−\"}html[data-dsh-prts] [data-prts-settings-advanced-content]{display: grid; grid-template-columns: minmax(0,1fr); border-top: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-settings-advanced-content] > section{padding: 11px}html[data-dsh-prts] [data-prts-settings-advanced-content] > section + section{border-left: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-advanced-content] section > header{min-height: 30px; display: grid; gap: 4px}html[data-dsh-prts] [data-prts-settings-advanced-content] section > header strong{font-size: 10px}html[data-dsh-prts] [data-prts-settings-advanced-content] section > header span{color: var(--prts-muted); font-size: 8px}html[data-dsh-prts] [data-prts-particle-detail] > div{display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 5px; margin-top: 8px}html[data-dsh-prts] [data-prts-particle-detail] button[role=\"radio\"]{min-width: 0; display: grid; gap: 5px}html[data-dsh-prts] [data-prts-particle-detail-preview]{height: 32px; display: grid; grid-template-columns: repeat(6,1fr); place-items: center; overflow: hidden; border: 1px solid color-mix(in srgb,currentColor 44%,transparent)}html[data-dsh-prts] [data-prts-particle-detail-preview] b{width: 2px; height: 2px; background: currentColor}html[data-dsh-prts] [data-prts-particle-traversal]{margin-top: 9px; padding-top: 9px; border-top: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-particle-traversal] > span{display: grid; gap: 3px}html[data-dsh-prts] [data-prts-particle-traversal] > span strong{font-size: 9px}html[data-dsh-prts] [data-prts-particle-traversal] > span small{color: var(--prts-muted); font: 600 8px/1.35 var(--prts-mono)}html[data-dsh-prts] [data-prts-particle-traversal-output]{min-width: 132px; color: var(--prts-cyan); font: 800 8px/1.2 var(--prts-mono); text-align: right}html[data-dsh-prts] [data-prts-session-flow-speed-output]{min-width: 64px; color: var(--prts-cyan); font: 800 8px/1.2 var(--prts-mono); text-align: right}html[data-dsh-prts] [data-prts-session-flow-speed] input[type=\"range\"]{min-width: 120px}html[data-dsh-prts] [data-prts-particle-error]{margin: 8px 0 0; color: var(--prts-yellow); font: 700 8px/1.4 var(--prts-mono)}html[data-dsh-prts] [data-prts-setting-range-row]{display: grid; gap: 7px; padding: 8px 0 0; border: 0}html[data-dsh-prts] [data-prts-setting-range-row] > div{display: flex; align-items: center; gap: 8px}html[data-dsh-prts] [data-prts-setting-range-row] input[type=\"range\"]{min-width: 0; flex: 1}html[data-dsh-prts] [data-prts-setting-range]{accent-color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-settings-actions]{min-height: 58px; display: block; padding: 0; border-bottom: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-persistence-error],html[data-dsh-prts] [data-prts-reset-zone]{min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 11px}html[data-dsh-prts] [data-prts-persistence-error]{border-bottom: 1px solid var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 7%,transparent)}html[data-dsh-prts] [data-prts-persistence-error] > span,html[data-dsh-prts] [data-prts-reset-zone] > span{display: grid; gap: 4px}html[data-dsh-prts] [data-prts-persistence-error] strong{color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-reset-visual],html[data-dsh-prts] [data-prts-reset-confirm-action]{color: var(--prts-yellow); box-shadow: inset 0 0 0 1px var(--prts-yellow)}html[data-dsh-prts] [data-prts-reset-confirm]{display: flex; align-items: center; justify-content: flex-end; gap: 5px; color: var(--prts-yellow); font: 700 8px/1.3 var(--prts-mono)}html[data-dsh-prts] [hidden]{display: none !important}html[data-dsh-prts] :is( [data-prts-theme-settings-header] small,[data-prts-theme-settings] section > header small,[data-prts-theme-settings] summary small,[data-prts-settings-actions] small,[data-prts-settings-summary] span,[data-prts-advanced-summary],[data-prts-preset-card] span,[data-prts-setting-note],[data-prts-settings-advanced-content] section > header span,[data-prts-particle-error],[data-prts-reset-confirm] ){font-size: var(--prts-settings-small); line-height: 1.4}html[data-dsh-prts] :is( [data-prts-settings-presets] > header strong,[data-prts-settings-common] > header strong,[data-prts-settings-advanced] summary strong,[data-prts-preset-card] strong,[data-prts-settings-common] [data-prts-setting-row] > span > strong,[data-prts-settings-advanced-content] section > header strong,[data-prts-theme-settings] button[data-prts-setting-key],[data-prts-retry-save],[data-prts-reset-visual],[data-prts-reset-confirm-action],[data-prts-reset-cancel] ){font-size: var(--prts-settings-text); line-height: 1.25}html[data-dsh-prts] [data-prts-theme-settings-header] strong{font-size: 1.375rem; line-height: 1.1}html[data-dsh-prts] [data-prts-settings-summary] span{min-height: 28px; padding: 6px 9px}html[data-dsh-prts] [data-prts-preset-card]{min-height: 84px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{min-height: 72px; grid-template-columns: minmax(7.5rem,auto) minmax(0,1fr)}html[data-dsh-prts] :is( [data-prts-theme-settings] button[data-prts-setting-key],[data-prts-retry-save],[data-prts-reset-visual],[data-prts-reset-confirm-action],[data-prts-reset-cancel] ){min-height: 40px; padding: 8px 10px}@container prts-settings (max-width: 52rem){html[data-dsh-prts] [data-prts-settings-common-grid],html[data-dsh-prts] [data-prts-settings-advanced-content]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{border-right: 0}html[data-dsh-prts] [data-prts-settings-advanced-content] > section + section{border-left: 0; border-top: 1px solid var(--prts-line)}}@media (max-height: 820px) and (min-width: 721px){html[data-dsh-prts] [data-prts-theme-settings-header]{min-height: 60px; padding-block: 10px}html[data-dsh-prts] [data-prts-theme-settings-close]{top: 10px}}@media (max-width: 720px){html[data-dsh-prts] [data-prts-theme-settings]{inset: 0; width: 100vw; height: 100dvh; max-height: none; margin: 0; transform: translateY(10px)}html[data-dsh-prts] [data-prts-theme-settings][data-prts-settings-visible]{transform: translateY(0)}html[data-dsh-prts] [data-prts-settings-frame]{height: 100%; max-height: none; clip-path: none; border: 0}html[data-dsh-prts] [data-prts-settings-frame]::before{right: 0}html[data-dsh-prts] [data-prts-theme-settings-header]{grid-template-columns: minmax(0,1fr); padding: 12px 48px 11px 13px}html[data-dsh-prts] [data-prts-settings-summary]{display: none}html[data-dsh-prts] [data-prts-theme-settings-scroll]{padding: 8px; scrollbar-gutter: auto}html[data-dsh-prts] [data-prts-settings-presets] > div{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-preset-card]{min-height: 54px; border-right: 0 !important; border-bottom: 1px solid var(--prts-line) !important}html[data-dsh-prts] [data-prts-preset-card]:last-child{border-bottom: 0 !important}html[data-dsh-prts] [data-prts-settings-common-grid]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{min-height: 62px}html[data-dsh-prts] [data-prts-settings-common] button[data-prts-setting-key]{min-height: 40px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{border-right: 0; border-bottom: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-session-flow-color-workbench]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:nth-last-child(2),html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:nth-last-child(3){border-bottom: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:last-child{border-bottom: 0}html[data-dsh-prts] [data-prts-settings-advanced-content]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-advanced-content] > section + section{border-left: 0; border-top: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-reset-zone]{align-items: flex-start; flex-direction: column}html[data-dsh-prts] [data-prts-reset-confirm]{width: 100%; flex-wrap: wrap; justify-content: flex-start}}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key][data-prts-setting-feedback]::after{animation: prts-setting-feedback 300ms ease-out both}}@keyframes prts-setting-feedback{0%{opacity: .82}100%{opacity: 0}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-theme-settings]{transition-duration: 1ms}}@media (prefers-reduced-transparency: reduce){html[data-dsh-prts] [data-prts-theme-settings]::backdrop,html[data-dsh-prts] [data-prts-settings-backdrop]{background: color-mix(in srgb,var(--prts-canvas) 94%,transparent); backdrop-filter: none; -webkit-backdrop-filter: none}}html[data-dsh-prts] [data-prts-facility-defs]{position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none}html[data-dsh-prts] [data-prts-facility-svg]{position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none}html[data-dsh-prts] [data-prts-session-status-underlay]{fill: var(--prts-session-status-color,transparent); opacity: 0}html[data-dsh-prts] [data-prts-session-state=\"ongoing\"]{--prts-session-status-color: var(--dsw-static-deepseek-450,var(--prts-cyan))}html[data-dsh-prts] [data-prts-session-state=\"done\"]{--prts-session-status-color: var(--dsw-alias-state-success-primary,var(--prts-green))}html[data-dsh-prts] [data-prts-session-state=\"warning\"]{--prts-session-status-color: var(--dsw-alias-state-warn-primary,var(--prts-yellow))}html[data-dsh-prts] [data-prts-session-state=\"error\"]{--prts-session-status-color: var(--dsw-alias-state-error-primary,var(--prts-red))}html[data-dsh-prts] [data-prts-session-state] [data-prts-session-status-underlay]{opacity: 1}html[data-dsh-prts] [data-prts-session-idle-indicator]{fill: var(--prts-dim)}html[data-dsh-prts] [data-prts-session-state] [data-prts-session-idle-indicator]{opacity: 0}html[data-dsh-prts] [data-prts-session-summary-header]{position: relative; z-index: 18; overflow: visible !important}html[data-dsh-prts] [data-prts-session-summary-label]{margin-right: 2px}html[data-dsh-prts] [data-prts-session-summary]{position: static; z-index: 19; display: inline-flex; flex: 0 0 auto; align-items: center; gap: 3px; color: var(--prts-muted); font-family: var(--prts-mono)}html[data-dsh-prts] [data-prts-session-summary][data-prts-summary-search-hidden]{display: none}html[data-dsh-prts] [data-prts-session-summary-group]{position: static; display: inline-flex}html[data-dsh-prts] [data-prts-session-summary-trigger]{min-width: 30px; height: 22px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 0 6px; border: 1px solid color-mix(in srgb,currentColor 38%,transparent); border-radius: 0; background: color-mix(in srgb,currentColor 7%,transparent); color: inherit; font: 700 9px/1 var(--prts-mono); cursor: pointer}html[data-dsh-prts] [data-prts-session-summary-group=\"ongoing\"]{--prts-summary-state-color: var(--dsw-static-deepseek-450,var(--prts-cyan)); color: var(--prts-summary-state-color)}html[data-dsh-prts] [data-prts-session-summary-group=\"warning\"]{--prts-summary-state-color: var(--dsw-alias-state-warn-primary,var(--prts-yellow)); color: var(--prts-summary-state-color)}html[data-dsh-prts] [data-prts-session-summary-group=\"done\"]{--prts-summary-state-color: var(--dsw-alias-state-success-primary,var(--prts-green)); color: var(--prts-summary-state-color)}html[data-dsh-prts] [data-prts-session-summary-trigger]:is(:hover,:focus-visible){background: color-mix(in srgb,currentColor 14%,var(--prts-panel))}html[data-dsh-prts] [data-prts-session-summary-signal]{position: relative; width: 9px; height: 9px; display: inline-block; flex: 0 0 9px; color: inherit}html[data-dsh-prts] [data-prts-session-summary-signal=\"ongoing\"]::before{content: \"\"; position: absolute; top: 0; left: 0; width: 2px; height: 2px; background: currentColor; box-shadow: 3.5px 0 currentColor,7px 0 currentColor,7px 3.5px currentColor,7px 7px currentColor,3.5px 7px currentColor,0 7px currentColor,0 3.5px currentColor}html[data-dsh-prts] [data-prts-session-summary-signal=\"done\"]::before{content: \"\"; position: absolute; inset: 1px; background: currentColor; clip-path: polygon(50% 0,100% 50%,50% 100%,0 50%)}html[data-dsh-prts] [data-prts-session-summary-signal=\"warning\"]::before{content: \"\"; position: absolute; inset: 0; border: 1px solid currentColor}html[data-dsh-prts] [data-prts-session-summary-signal=\"warning\"]::after{content: \"\"; position: absolute; top: 2px; left: 4px; width: 1px; height: 3px; background: currentColor; box-shadow: 0 3px currentColor}html[data-dsh-prts] [data-prts-session-summary-popover]{position: absolute; z-index: 40; top: calc(100% + 6px); right: 0; left: 0; width: auto; display: block; padding: 8px; border: 1px solid color-mix(in srgb,currentColor 44%,var(--prts-line)); background: var(--prts-glass-dense,var(--prts-panel)); box-shadow: var(--prts-shadow-glass-overlay); color: var(--prts-ink); opacity: 0; visibility: hidden; transform: translate3d(0,-4px,0); transition: opacity 120ms ease,transform 160ms var(--prts-ease-snap),visibility 0s linear 160ms; pointer-events: none}html[data-dsh-prts] [data-prts-session-summary-popover]::before{content: \"\"; position: absolute; right: 0; bottom: 100%; left: 0; height: 16px}html[data-dsh-prts] [data-prts-session-summary-group]:is(:hover,:has(:focus-visible)) [data-prts-session-summary-popover]{opacity: 1; visibility: visible; transform: translate3d(0,0,0); transition-delay: 0s; pointer-events: auto}@media (hover: none){html[data-dsh-prts] [data-prts-session-summary-group]:focus-within [data-prts-session-summary-popover]{opacity: 1; visibility: visible; transform: translate3d(0,0,0); transition-delay: 0s; pointer-events: auto}}html[data-dsh-prts] [data-prts-session-summary-heading]{height: 28px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 6px 6px; color: currentColor; font: 700 10px/1 var(--prts-mono)}html[data-dsh-prts] [data-prts-session-summary-heading] small{color: var(--prts-dim); font-size: 9px; font-weight: 500}html[data-dsh-prts] [data-prts-session-summary-item]{width: 100%; height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 7px; border: 0; border-top: 1px solid var(--prts-line); border-radius: 0; background: transparent; color: var(--prts-ink); cursor: pointer}html[data-dsh-prts] [data-prts-session-summary-item] [data-prts-session-summary-signal]{color: var(--prts-summary-state-color)}html[data-dsh-prts] [data-prts-session-summary-item] > span:not([data-prts-session-summary-signal]){min-width: 0; overflow: hidden; font-size: 11px; text-align: left; text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-session-summary-item-status]{flex: 0 0 auto; margin-left: auto; color: var(--prts-summary-state-color); font: 700 9px/1 var(--prts-mono)}html[data-dsh-prts] [data-prts-session-summary-item]:is(:hover,:focus-visible){background: color-mix(in srgb,currentColor 9%,transparent)}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-session-summary-popover]{animation: none; transition-duration: 0s}}html[data-dsh-prts] [data-prts-facility-layer=\"surface\"]{fill: var(--prts-facility-surface,var(--prts-panel-raised))}html[data-dsh-prts] [data-prts-facility-layer=\"texture\"]{fill: none; opacity: 0; pointer-events: none; transition: opacity 160ms ease}html[data-dsh-prts] [data-prts-facility-layer=\"outline\"]{fill: none; stroke: var(--prts-facility-outline,var(--prts-line-strong)); stroke-width: 1; stroke-linejoin: miter; stroke-miterlimit: 2; vector-effect: non-scaling-stroke; shape-rendering: geometricPrecision; pointer-events: none}html[data-dsh-prts] [data-prts-facility-vector][data-prts-facility-texture=\"grid\"] [data-prts-facility-layer=\"texture\"]{fill: var(--prts-facility-texture-color,var(--prts-cyan)); opacity: var(--prts-facility-texture-opacity,.12); mask: url(\"#prts-facility-grid-mask\")}html[data-dsh-prts] [data-prts-facility-vector][data-prts-facility-texture=\"scanline\"] [data-prts-facility-layer=\"texture\"]{fill: var(--prts-facility-texture-color,var(--prts-cyan)); opacity: var(--prts-facility-texture-opacity,.1); mask: url(\"#prts-facility-scanline-mask\")}html[data-dsh-prts] [data-prts-workspace-row]{--prts-facility-texture-color: var(--prts-cyan); --prts-silhouette-fill: #f3f6f7; --prts-silhouette-far-opacity: .06; --prts-silhouette-near-opacity: .12}html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-workspace-row]{--prts-silhouette-fill: #3f4d56; --prts-silhouette-far-opacity: .13; --prts-silhouette-near-opacity: .26}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"],html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]){--prts-silhouette-far-opacity: .24; --prts-silhouette-near-opacity: .52}html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-workspace-row][aria-expanded=\"true\"],html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]){--prts-silhouette-far-opacity: .25; --prts-silhouette-near-opacity: .5}html[data-dsh-prts] [data-prts-facility-texture=\"silhouette\"] [data-prts-facility-layer=\"texture\"]{opacity: 0}html[data-dsh-prts] [data-prts-facility-silhouette]{fill: var(--prts-silhouette-fill); opacity: 0; pointer-events: none}html[data-dsh-prts] [data-prts-facility-texture=\"silhouette\"] [data-prts-facility-silhouette]{opacity: 1}html[data-dsh-prts] [data-prts-silhouette-layer]{transform-box: fill-box; transform-origin: left center; animation-timing-function: linear; animation-iteration-count: infinite; animation-play-state: paused; will-change: transform; transition: opacity 180ms ease}html[data-dsh-prts] [data-prts-silhouette-layer=\"far\"]{opacity: var(--prts-silhouette-far-opacity); animation-name: prts-silhouette-far-drift; animation-duration: 22.4s}html[data-dsh-prts] [data-prts-silhouette-layer=\"near\"]{opacity: var(--prts-silhouette-near-opacity); animation-name: prts-silhouette-near-drift; animation-duration: 6.4s}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts]:not([data-prts-motion=\"reduced\"]) [data-prts-workspace-row]:hover [data-prts-silhouette-layer]{animation-play-state: running}}@keyframes prts-silhouette-far-drift{to{transform: translate3d(-512px,0,0)}}@keyframes prts-silhouette-near-drift{to{transform: translate3d(-512px,0,0)}}html[data-dsh-prts] [data-prts-facility-texture=\"pickup\"] [data-prts-facility-layer=\"texture\"]{opacity: 0}html[data-dsh-prts] [data-prts-session-pickup]{color: var(--prts-session-pickup-fill); fill: currentColor; opacity: 0; transform: translate3d(5px,0,0); transform-box: view-box; transform-origin: center; transition: opacity 150ms ease,transform 240ms cubic-bezier(.22,1,.36,1); pointer-events: none}html[data-dsh-prts] [data-prts-session-lifeline]{--prts-lifeline-pink: #f7ddeb; --prts-lifeline-green: #65ddb0; --prts-lifeline-blue: #6eb7f3; opacity: 0; transition: opacity 160ms ease; pointer-events: none}html[data-dsh-prts][data-prts-session-flow-palette=\"rhodes\"] [data-prts-session-lifeline]{--prts-lifeline-pink: #b9edf4; --prts-lifeline-green: #5ccddb; --prts-lifeline-blue: #5a9ee6}html[data-dsh-prts][data-prts-session-flow-palette=\"amber\"] [data-prts-session-lifeline]{--prts-lifeline-pink: #ffe6a3; --prts-lifeline-green: #f0c800; --prts-lifeline-blue: #ee8f42}html[data-dsh-prts][data-prts-session-flow-palette=\"alert\"] [data-prts-session-lifeline]{--prts-lifeline-pink: #ffc0b8; --prts-lifeline-green: #ee625a; --prts-lifeline-blue: #db5b8c}html[data-dsh-prts][data-prts-session-flow-palette=\"custom\"] [data-prts-session-lifeline]{--prts-lifeline-pink: var(--prts-session-flow-back); --prts-lifeline-green: var(--prts-session-flow-core); --prts-lifeline-blue: var(--prts-session-flow-front)}html[data-dsh-prts] [data-prts-session-lifeline-filament]{--prts-lifeline-color: currentColor}html[data-dsh-prts] [data-prts-session-lifeline-layer]{fill: none; stroke: var(--prts-lifeline-color); stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; shape-rendering: geometricPrecision; transition: opacity 160ms ease,stroke-width 160ms ease}html[data-dsh-prts] [data-prts-session-lifeline-filament=\"back\"]{--prts-lifeline-color: var(--prts-lifeline-pink); opacity: .92}html[data-dsh-prts] [data-prts-session-lifeline-filament=\"core\"]{--prts-lifeline-color: var(--prts-lifeline-green); opacity: .9}html[data-dsh-prts] [data-prts-session-lifeline-filament=\"front\"]{--prts-lifeline-color: var(--prts-lifeline-blue); opacity: .98}html[data-dsh-prts] [data-prts-session-lifeline-layer=\"body\"]{stroke-width: .9}html[data-dsh-prts] [data-prts-session-lifeline-layer=\"halo\"],html[data-dsh-prts] [data-prts-session-lifeline-layer=\"core\"]{opacity: 0}html[data-dsh-prts][data-prts-session-glow=\"off\"] :is([data-prts-session-lifeline-layer=\"halo\"],[data-prts-session-lifeline-layer=\"core\"]){opacity: 0}html[data-dsh-prts][data-prts-session-glow=\"on\"] [data-prts-session-lifeline-layer=\"halo\"]{stroke-width: 4.25; opacity: .28; filter: blur(1.15px)}html[data-dsh-prts][data-prts-session-glow=\"on\"] [data-prts-session-lifeline-layer=\"body\"]{stroke-width: 1.65; opacity: .98}html[data-dsh-prts][data-prts-session-glow=\"on\"] [data-prts-session-lifeline-layer=\"core\"]{stroke: color-mix(in srgb,var(--prts-lifeline-color) 18%,#fff); stroke-width: .58; opacity: .96}html[data-dsh-prts][data-prts-scheme=\"light\"][data-prts-session-glow=\"on\"] [data-prts-session-lifeline-layer=\"halo\"]{stroke: color-mix(in srgb,var(--prts-lifeline-color) 42%,#fff); stroke-width: 4.4; opacity: .45; filter: blur(1.05px)}html[data-dsh-prts][data-prts-scheme=\"light\"][data-prts-session-glow=\"on\"] [data-prts-session-lifeline-layer=\"body\"]{stroke-width: 1.5}html[data-dsh-prts][data-prts-scheme=\"light\"][data-prts-session-glow=\"on\"] [data-prts-session-lifeline-layer=\"core\"]{stroke: color-mix(in srgb,var(--prts-lifeline-color) 58%,#fff); stroke-width: .52}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"] [data-prts-session-lifeline]{opacity: .98}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"]:hover [data-prts-session-lifeline]{opacity: 0}html[data-dsh-prts][data-prts-session-flow=\"off\"] [data-prts-session-row] [data-prts-session-lifeline]{opacity: 0}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-session-lifeline],html[data-dsh-prts] [data-prts-session-lifeline-layer]{transition-duration: 0s}}html[data-dsh-prts][data-prts-motion=\"reduced\"] [data-prts-session-lifeline],html[data-dsh-prts][data-prts-motion=\"reduced\"] [data-prts-session-lifeline-layer]{transition-duration: 0s}html[data-dsh-prts] [data-prts-session-row]:hover [data-prts-facility-texture=\"pickup\"] [data-prts-session-pickup]{opacity: .58; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-session-pickup-baseline]{fill: none; stroke: currentColor; stroke-width: 1; opacity: .2; vector-effect: non-scaling-stroke}html[data-dsh-prts] [data-prts-session-pickup-indicator]{fill: var(--prts-yellow)}html[data-dsh-prts] [data-prts-session-pickup-bar]{transform-box: fill-box; transform-origin: center}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(1){--prts-pickup-duration: 520ms; --prts-pickup-delay: -.12s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(2){--prts-pickup-duration: 1180ms; --prts-pickup-delay: -.28s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(3){--prts-pickup-duration: 760ms; --prts-pickup-delay: -.44s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(4){--prts-pickup-duration: 1420ms; --prts-pickup-delay: -.18s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(5){--prts-pickup-duration: 640ms; --prts-pickup-delay: -.36s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(6){--prts-pickup-duration: 980ms; --prts-pickup-delay: -.52s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(7){--prts-pickup-duration: 480ms; --prts-pickup-delay: -.22s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(8){--prts-pickup-duration: 1260ms; --prts-pickup-delay: -.46s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(9){--prts-pickup-duration: 720ms; --prts-pickup-delay: -.14s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(10){--prts-pickup-duration: 1520ms; --prts-pickup-delay: -.4s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(11){--prts-pickup-duration: 560ms; --prts-pickup-delay: -.3s}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts]:not([data-prts-motion=\"reduced\"]) [data-prts-session-row]:hover [data-prts-session-pickup-indicator]{animation: prts-session-record-indicator 1.1s ease-in-out infinite}html[data-dsh-prts]:not([data-prts-motion=\"reduced\"]) [data-prts-session-row]:hover [data-prts-session-pickup-bar]{animation: prts-session-pickup-sample var(--prts-pickup-duration) ease-in-out var(--prts-pickup-delay) infinite}}@keyframes prts-session-record-indicator{0%,100%{opacity: .45}50%{opacity: 1}}@keyframes prts-session-pickup-sample{0%,100%{transform: scaleY(.28)}34%{transform: scaleY(1.08)}57%{transform: scaleY(.46)}78%{transform: scaleY(.86)}}html[data-dsh-prts] [data-prts-session-row]{--prts-facility-texture-color: var(--prts-muted); --prts-session-pickup-fill: #f3f6f7}html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-session-row]{--prts-session-pickup-fill: #3f4d56}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"]{--prts-facility-texture-color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-workspace-row] > [data-prts-facility-spine],html[data-dsh-prts] [data-prts-session-row] > [data-prts-facility-spine]{--prts-facility-surface: var(--prts-line-strong); position: absolute !important; z-index: 2 !important; inset: 0 auto 0 0; height: 100% !important; isolation: isolate; width: var(--prts-spine-width); min-width: 0; transform: scaleX(var(--prts-spine-rest)) !important; transform-origin: left center; transition: transform 220ms var(--prts-ease-spring); pointer-events: none}html[data-dsh-prts] [data-prts-workspace-row] > [data-prts-facility-spine]{--prts-facility-surface: var(--prts-cyan)}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"] > [data-prts-facility-spine]{--prts-facility-surface: var(--prts-yellow)}html[data-dsh-prts] [data-prts-facility-spine] [data-prts-facility-layer=\"outline\"]{display: none}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"] > [data-prts-facility-spine],html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) > [data-prts-facility-spine],html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) > [data-prts-facility-spine]{transform: scaleX(1) !important}html[data-dsh-prts] [data-prts-workspace-row][data-prts-spine-vector]::before,html[data-dsh-prts] [data-prts-session-row][data-prts-spine-vector]::before{content: none !important; display: none !important}html[data-dsh-prts] [data-prts-facility-face][data-prts-facility-vector]{border: 0 !important; background: transparent !important; clip-path: none !important}html[data-dsh-prts] [data-prts-facility-face][data-prts-facility-vector]::after{content: none !important; display: none !important}html[data-dsh-prts] :is( [data-prts-workspace-actions],[data-prts-session-actions] ) button[data-prts-facility-vector]{--prts-facility-outline: var(--prts-line); --prts-facility-surface: var(--prts-panel-raised); overflow: visible; border: 0 !important; background: transparent !important; clip-path: none !important}html[data-dsh-prts] :is( [data-prts-workspace-actions],[data-prts-session-actions] ) button[data-prts-facility-vector]::before{content: none !important; display: none !important}html[data-dsh-prts] :is( [data-prts-workspace-actions],[data-prts-session-actions] ) button[data-prts-facility-vector]:is(:hover,:focus-visible){--prts-facility-outline: var(--prts-yellow); background: transparent !important}html[data-dsh-prts] [data-prts-startup]{--prts-startup-bg: #07090b; --prts-startup-ink: #e8edef; --prts-startup-muted: #7d898f; --prts-startup-line: #394349; --prts-startup-accent: #f0c800; position: fixed; z-index: 2147483647; inset: 0; width: 100vw; max-width: none; height: 100dvh; max-height: none; min-height: 100dvh; margin: 0; padding: 0; border: 0; overflow: hidden; isolation: isolate; box-sizing: border-box; background: var(--prts-startup-bg); color: var(--prts-startup-ink); font-family: var(--prts-body,sans-serif); opacity: 1; outline: 0; pointer-events: auto; transition: opacity 120ms ease}html[data-dsh-prts] [data-prts-startup]::before,html[data-dsh-prts] [data-prts-startup]::after{content: \"\"; position: absolute; z-index: -3; top: 0; bottom: 0; width: calc(50% + 2px); background: var(--prts-startup-bg); transition: transform 350ms cubic-bezier(.76,0,.24,1)}html[data-dsh-prts] [data-prts-startup]::before{left: 0}html[data-dsh-prts] [data-prts-startup]::after{right: 0}html[data-dsh-prts] [data-prts-startup][data-exiting]:not([data-reduced-motion]){background: transparent}html[data-dsh-prts] [data-prts-startup][data-exiting]::before{transform: translate3d(-101%,0,0)}html[data-dsh-prts] [data-prts-startup][data-exiting]::after{transform: translate3d(101%,0,0)}html[data-dsh-prts] [data-prts-startup-grid]{position: absolute; z-index: -2; inset: 0; opacity: 0; background: linear-gradient(90deg,transparent calc(50% - .5px),rgba(232,237,239,.17) 50%,transparent calc(50% + .5px)),linear-gradient(0deg,transparent calc(50% - .5px),rgba(232,237,239,.09) 50%,transparent calc(50% + .5px)),repeating-linear-gradient(90deg,rgba(232,237,239,.045) 0 1px,transparent 1px 80px),repeating-linear-gradient(0deg,rgba(232,237,239,.035) 0 1px,transparent 1px 80px); transform: scale3d(1.04,1.04,1); transition: opacity 220ms linear,transform 520ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-grid]{opacity: 1; transform: scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup-scan]{position: absolute; z-index: 4; top: -18%; right: 0; left: 0; height: 18%; opacity: 0; background: linear-gradient(180deg,transparent,rgba(240,200,0,.035) 68%,rgba(240,200,0,.24)); border-bottom: 1px solid rgba(240,200,0,.62); pointer-events: none}html[data-dsh-prts] [data-prts-startup][data-visible]:not([data-reduced-motion]) [data-prts-startup-scan]{opacity: 1; animation: prts-startup-scan 1100ms linear 120ms 2 both}html[data-dsh-prts] [data-prts-startup-cut]{position: absolute; z-index: 6; top: -15%; width: 8px; height: 130%; opacity: 0; background: var(--prts-startup-accent); transform: skewX(-13deg) translate3d(0,0,0); pointer-events: none}html[data-dsh-prts] [data-prts-startup-cut=\"left\"]{left: calc(50% - 4px)}html[data-dsh-prts] [data-prts-startup-cut=\"right\"]{right: calc(50% - 4px)}html[data-dsh-prts] [data-prts-startup][data-exiting] [data-prts-startup-cut=\"left\"]{animation: prts-startup-cut-left 350ms cubic-bezier(.76,0,.24,1) both}html[data-dsh-prts] [data-prts-startup][data-exiting] [data-prts-startup-cut=\"right\"]{animation: prts-startup-cut-right 350ms cubic-bezier(.76,0,.24,1) both}html[data-dsh-prts] [data-prts-startup-header]{position: absolute; z-index: 2; top: clamp(22px,4.5dvh,52px); right: clamp(22px,4vw,68px); left: clamp(22px,4vw,68px); display: flex; align-items: baseline; justify-content: space-between; gap: 24px; padding-bottom: 10px; border-bottom: 1px solid var(--prts-startup-line); opacity: 0; transform: translate3d(0,-9px,0); transition: opacity 180ms linear 60ms,transform 320ms cubic-bezier(.16,1,.3,1) 60ms}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-header]{opacity: 1; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-startup-header] span{font: 800 clamp(10px,1vw,13px)/1 var(--prts-display,sans-serif); letter-spacing: .18em}html[data-dsh-prts] [data-prts-startup-header] small,html[data-dsh-prts] [data-prts-startup-telemetry],html[data-dsh-prts] [data-prts-startup-coordinate]{color: var(--prts-startup-muted); font: 700 8px/1.35 var(--prts-mono,monospace); letter-spacing: .12em}html[data-dsh-prts] [data-prts-startup-telemetry]{position: absolute; z-index: 2; top: 50%; left: clamp(22px,4vw,68px); display: grid; gap: 12px; padding-left: 12px; border-left: 2px solid var(--prts-startup-accent); opacity: 0; transform: translate3d(-9px,-50%,0); transition: opacity 200ms linear 100ms,transform 360ms cubic-bezier(.16,1,.3,1) 100ms}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-telemetry]{opacity: 1; transform: translate3d(0,-50%,0)}html[data-dsh-prts] [data-prts-startup-core]{position: absolute; z-index: 3; top: 49%; left: 50%; width: min(76vw,560px); display: grid; justify-items: center; gap: clamp(15px,2.4dvh,26px); transform: translate3d(-50%,-50%,0)}html[data-dsh-prts] [data-prts-startup-frame]{position: relative; width: clamp(220px,27vw,320px); aspect-ratio: 1; display: grid; place-items: center}html[data-dsh-prts] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup-frame-inner]{position: absolute; inset: 15%; border: 1px solid var(--prts-startup-line); opacity: 0; transform: rotate(45deg) scale3d(.72,.72,1); transition: opacity 160ms linear,transform 420ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup-frame-inner]{inset: 23%; border-color: rgba(240,200,0,.76); transform: rotate(-45deg) scale3d(.68,.68,1); transition-delay: 80ms}html[data-dsh-prts] [data-prts-startup-reticle]{position: absolute; inset: 7%; opacity: 0; background: linear-gradient(var(--prts-startup-accent),var(--prts-startup-accent)) 50% 0 / 1px 15% no-repeat,linear-gradient(var(--prts-startup-accent),var(--prts-startup-accent)) 50% 100% / 1px 15% no-repeat,linear-gradient(90deg,var(--prts-startup-accent),var(--prts-startup-accent)) 0 50% / 15% 1px no-repeat,linear-gradient(90deg,var(--prts-startup-accent),var(--prts-startup-accent)) 100% 50% / 15% 1px no-repeat; transform: scale3d(.8,.8,1); transition: opacity 160ms linear,transform 400ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup-emblem]{position: relative; z-index: 2; width: 180px; max-width: 62%; height: auto; display: block; opacity: 0; clip-path: inset(48% 0 48% 0); transform: scale3d(.96,.96,1); transition: opacity 160ms linear,clip-path 380ms cubic-bezier(.16,1,.3,1),transform 420ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"linking\"] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-stage=\"authenticating\"] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-frame-outer]{opacity: .92; transform: rotate(45deg) scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"authenticating\"] :is([data-prts-startup-frame-inner],[data-prts-startup-reticle]),html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] :is([data-prts-startup-frame-inner],[data-prts-startup-reticle]),html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] :is([data-prts-startup-frame-inner],[data-prts-startup-reticle]){opacity: 1; transform: rotate(-45deg) scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"authenticating\"] [data-prts-startup-reticle],html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] [data-prts-startup-reticle],html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-reticle]{transform: scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] [data-prts-startup-emblem],html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-emblem]{opacity: 1; clip-path: inset(0 0 0 0); transform: scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup-signature]{min-height: 44px; display: flex; align-items: center; gap: 10px; opacity: 0; transform: translate3d(0,8px,0); transition: opacity 180ms linear,transform 230ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup-signature] > span,html[data-dsh-prts] [data-prts-startup-signature] svg{width: 42px; height: 42px; display: block}html[data-dsh-prts] [data-prts-startup-signature] small{color: var(--prts-startup-muted); font: 800 8px/1.3 var(--prts-mono,monospace); letter-spacing: .1em}html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-signature]{opacity: 1; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-startup-state]{display: grid; justify-items: center; gap: 6px; text-align: center; opacity: 1; transform: translate3d(0,0,0); transition: opacity 90ms linear,transform 90ms cubic-bezier(.4,0,1,1)}html[data-dsh-prts] [data-prts-startup][data-copy-transition] [data-prts-startup-state]{opacity: 0; transform: translate3d(0,-4px,0)}html[data-dsh-prts] [data-prts-startup-state] strong{font: 900 clamp(18px,2.4vw,30px)/1 var(--prts-display,sans-serif); letter-spacing: .16em}html[data-dsh-prts] [data-prts-startup-state] span{color: var(--prts-startup-muted); font: 700 10px/1.2 var(--prts-mono,monospace); letter-spacing: .12em}html[data-dsh-prts] [data-prts-startup-progress]{position: absolute; z-index: 3; right: clamp(22px,7vw,120px); bottom: clamp(28px,6dvh,70px); left: clamp(22px,7vw,120px); display: grid; gap: 10px; opacity: 0; transform: translate3d(0,10px,0); transition: opacity 220ms linear 100ms,transform 480ms cubic-bezier(.16,1,.3,1) 100ms}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-progress]{opacity: 1; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-startup-progress] output{justify-self: start; color: var(--prts-startup-muted); font: 800 9px/1 var(--prts-mono,monospace); letter-spacing: .12em}html[data-dsh-prts] [data-prts-startup-percent]{color: var(--prts-startup-ink)}html[data-dsh-prts] [data-prts-startup-track]{position: relative; height: 18px; border-top: 1px solid var(--prts-startup-line)}html[data-dsh-prts] [data-prts-startup-fill]{--prts-startup-progress: 0; position: absolute; top: -2px; right: 0; left: 0; height: 3px; background: var(--prts-startup-accent); transform: scaleX(var(--prts-startup-progress)); transform-origin: left center; will-change: transform; transition: transform 80ms linear}html[data-dsh-prts] [data-prts-startup-ticks]{position: absolute; inset: 4px 0 0; display: grid; grid-template-columns: repeat(21,minmax(0,1fr))}html[data-dsh-prts] [data-prts-startup-ticks] i{width: 1px; height: 4px; background: var(--prts-startup-line)}html[data-dsh-prts] [data-prts-startup-ticks] i[data-major]{height: 9px; background: var(--prts-startup-muted)}html[data-dsh-prts] [data-prts-startup-coordinate]{position: absolute; right: clamp(22px,4vw,68px); top: 50%; writing-mode: vertical-rl; transform: translateY(-50%)}html[data-dsh-prts] [data-prts-startup][data-exit-content] > :not([data-prts-startup-cut]){opacity: 0; transition: opacity 120ms linear}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-grid],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-header],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-telemetry],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-coordinate],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-state],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-inner],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-reticle],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-emblem],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-signature],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-progress]{opacity: 1; clip-path: none; transform: none; animation: none; transition: none}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-fill]{transition: none}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-outer]{transform: rotate(45deg)}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-inner]{transform: rotate(-45deg)}html[data-dsh-prts] [data-prts-startup][data-reduced-motion]{transition: opacity 160ms ease}html[data-dsh-prts] [data-prts-startup][data-reduced-motion][data-exiting]{opacity: 0}html[data-dsh-prts] [data-prts-startup][data-reduced-motion][data-exiting] > :not([data-prts-startup-cut]){opacity: 1}html[data-dsh-prts] [data-prts-startup][data-reduced-motion]::before,html[data-dsh-prts] [data-prts-startup][data-reduced-motion]::after{transform: none; transition: none}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-cut]{display: none}@keyframes prts-startup-scan{from{transform: translate3d(0,0,0)}to{transform: translate3d(0,660%,0)}}@keyframes prts-startup-cut-left{0%{opacity: 0; transform: skewX(-13deg) translate3d(0,0,0)}18%{opacity: 1}100%{opacity: 0; transform: skewX(-13deg) translate3d(-50vw,0,0)}}@keyframes prts-startup-cut-right{0%{opacity: 0; transform: skewX(-13deg) translate3d(0,0,0)}18%{opacity: .72}100%{opacity: 0; transform: skewX(-13deg) translate3d(50vw,0,0)}}@media (max-width: 640px){html[data-dsh-prts] [data-prts-startup-header]{right: 18px; left: 18px}html[data-dsh-prts] [data-prts-startup-header] small,html[data-dsh-prts] [data-prts-startup-telemetry],html[data-dsh-prts] [data-prts-startup-coordinate]{display: none}html[data-dsh-prts] [data-prts-startup-core]{top: 47%; width: calc(100vw - 32px)}html[data-dsh-prts] [data-prts-startup-frame]{width: min(66vw,240px)}html[data-dsh-prts] [data-prts-startup-signature] > span,html[data-dsh-prts] [data-prts-startup-signature] svg{width: 34px; height: 34px}html[data-dsh-prts] [data-prts-startup-state] strong{max-width: 94vw; font-size: clamp(15px,5vw,22px); letter-spacing: .1em}html[data-dsh-prts] [data-prts-startup-progress]{right: 20px; bottom: max(28px,env(safe-area-inset-bottom)); left: 20px}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-startup] *,html[data-dsh-prts] [data-prts-startup]::before,html[data-dsh-prts] [data-prts-startup]::after{animation: none !important}}@media (any-pointer: fine){html[data-dsh-prts][data-prts-cursor=\"prts\"]{--prts-hand-cursor: var(--prts-hand-frame,url(\"data:image/png;base64,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\") 7 6); --prts-text-cursor: var(--prts-text-frame,url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAClElEQVR4nO3Yv2sTYRgH8O97l/euuSRt6HG0SNVWAzHpGIooha7n5OIqTgZEB+niGKtVtIM4SkVMHIqlXRTqIAWLOOg/UBCKOMRamv7imh/mvXvzOiQVaTuZt6bD+4EbLne8z33JcbzPAyiKoiiKovwzIns913WNvr7zpFpdJpZlif03FApVH5jj0grKWgiABoAC8AFEABj7rgcAKq37eOtoW0jGInvOZTK9169eG+/pjoa3trYoNE0HAHAhDJPWI9FuuvhxqTCbz3/J5XLaxMREQ2b9tmSzGWrbdmzqydMpz9sVh3k9P7+USqVOu65rQv7r2zYtnU5HAcRv3R5/9HNtzQ944DOfsTpj/GX+1QKAM46TjkLyPy+TPjo66gA4e/f+5GwQBKIhhHi78G4ZwIWRkbH+BBKmzIKazMUA8Fo8XnEcp1Ipl78FnIMAKJfLa4ZhbPQM0toKVpjMgrID4OLQEC+VSsw0uzRCmq+5EaIaY8wnO/0BgAOf1nZID9AihBDi71NIfvA9RxXgv1EBOk0F6DQVoNNUgE6THsDzPAKAkL19BACAEBzR9ll6gK/VKnEcx2Cs/mc34Qd+I2YYVNc3dEgOIjuAbq6vR0qlkmWGw6dCoea2PxKNOLuM9W5u1iwkDrSax4aWTCZjAOLZGzfv/VhdZZxzVvfrrParxp9NP38DYNC27RiOY0OTzWapbSdjDx5PPdzxvMNbyrm598PDwycTEltKqVOJMXfsxOVLV+70xuPh7Z3tkKYRHQAEF4KGu+oGpcaHxU/TMzMvPudyOSGjqZc8VklQYCVAc6xCAeitaw0cHKsEMorK/rRpruvSVCqlFYtFYGCg+WuxCMtKC+A7CoWCD0kzIUVRFEVRlDb9BqKuBusP6ygzAAAAAElFTkSuQmCC\") 24 24); cursor: var(--prts-hand-cursor),default}html[data-dsh-prts][data-prts-cursor=\"prts\"] :is(button,a[href],summary,[role=\"button\"],[role=\"tab\"],[role=\"treeitem\"],[role=\"menuitem\"],[role=\"menuitemcheckbox\"],[role=\"menuitemradio\"],[role=\"option\"],[data-prts-workspace-row],[data-prts-session-row],.dsh-partner-sidebar-row,select,input[type=\"button\"],input[type=\"submit\"],input[type=\"checkbox\"],input[type=\"radio\"],input[type=\"color\"],input[type=\"range\"]){cursor: var(--prts-hand-cursor),pointer}html[data-dsh-prts][data-prts-cursor=\"prts\"] :is(textarea,input:not([type]),input[type=\"text\"],input[type=\"search\"],input[type=\"email\"],input[type=\"url\"],input[type=\"password\"],input[type=\"number\"],input[type=\"tel\"],[contenteditable=\"\"],[contenteditable=\"true\"],[contenteditable=\"plaintext-only\"]){cursor: var(--prts-text-cursor),text}html[data-dsh-prts][data-prts-cursor=\"prts\"] :is(:disabled,[aria-disabled=\"true\"]){cursor: not-allowed !important}}";
    const PRTS_ASSETS = Object.freeze({
      cursor: {"hotspot":[7,6],"textHotspot":[24,24],"textClick":[{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAClElEQVR4nO3Yv2sTYRgH8O97l/euuSRt6HG0SNVWAzHpGIooha7n5OIqTgZEB+niGKtVtIM4SkVMHIqlXRTqIAWLOOg/UBCKOMRamv7imh/mvXvzOiQVaTuZt6bD+4EbLne8z33JcbzPAyiKoiiKovwzIns913WNvr7zpFpdJpZlif03FApVH5jj0grKWgiABoAC8AFEABj7rgcAKq37eOtoW0jGInvOZTK9169eG+/pjoa3trYoNE0HAHAhDJPWI9FuuvhxqTCbz3/J5XLaxMREQ2b9tmSzGWrbdmzqydMpz9sVh3k9P7+USqVOu65rQv7r2zYtnU5HAcRv3R5/9HNtzQ944DOfsTpj/GX+1QKAM46TjkLyPy+TPjo66gA4e/f+5GwQBKIhhHi78G4ZwIWRkbH+BBKmzIKazMUA8Fo8XnEcp1Ipl78FnIMAKJfLa4ZhbPQM0toKVpjMgrID4OLQEC+VSsw0uzRCmq+5EaIaY8wnO/0BgAOf1nZID9AihBDi71NIfvA9RxXgv1EBOk0F6DQVoNNUgE6THsDzPAKAkL19BACAEBzR9ll6gK/VKnEcx2Cs/mc34Qd+I2YYVNc3dEgOIjuAbq6vR0qlkmWGw6dCoea2PxKNOLuM9W5u1iwkDrSax4aWTCZjAOLZGzfv/VhdZZxzVvfrrParxp9NP38DYNC27RiOY0OTzWapbSdjDx5PPdzxvMNbyrm598PDwycTEltKqVOJMXfsxOVLV+70xuPh7Z3tkKYRHQAEF4KGu+oGpcaHxU/TMzMvPudyOSGjqZc8VklQYCVAc6xCAeitaw0cHKsEMorK/rRpruvSVCqlFYtFYGCg+WuxCMtKC+A7CoWCD0kzIUVRFEVRlDb9BqKuBusP6ygzAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADAUlEQVR4nO2YPWhTURTH/+8l7+W7xr6EiFQqGolJ3EoRodD1Obm4ipMB0UG6OMb6hXYQR6mIjUOxtItCHaRgEQcdXbq0oEOssYR+pOmL7/M6JGnTtNHad5QO9wcPXvIO95z/vede7jkAh8PhcDgczr4RqMdTVVVOJM4KmjYnBINB1m5QKGgmMGmTOaQaCIAIQAJgAggBkNu+WwA2GnZ243GNl2KQJqf7+rqvXLo8dKgrHFheXpYgih4AgM2Y7JP0ULhLmnk/W5gYG/uUz+fF4eFhh9K/K3K5PklRlMjIo8cjlco6242XU1Oz6XS6V1VVH+jT1zViJpMJA4hevzH04HupZFq2ZRqmYeiGYT8fezEN4EQ8ngmDeOUp8QwMDMQBnLx15+6EZVnMYYy9nn4zB+Bcf//gkSSSPkqHIuVgAOxaNLoRi8W06nr1i2XbEABUq9WSLMtlRQloC1gwKB1SC8AZRXHK5bLu9/sFQainuSxLomEYViyWtQHsOFrdQCqAMSZsvbKtQB3GADi6XhNabEggE9AMrOtHV8cZrtUsp9WWAhIBzYAEQfhjejRtqERQCNge/KnOhrqubbOlEOFKAGNMYIztaebboRJBfgr9b1wJcDmLe943v8P1CuxHhJvUa4ckhVpFzM/Pd7Tz+YLsb06svUC2B5oBJRKJjisR1SOkwQPEm7glMHHzHtH4BUBEgjZ44B+cQpqmCbFYTDYMffM2YZqmE5FlqVT67AVxHUAtwLO0tBQql8sBn9/f6/XWr/2hUCi+bhiH19bMAJI7Ss0Dg5hKpSIAormr125/W1w0bNs2dFM3aj9r9pPRp68AHFcUJYKDWNDkcjlJUVKRew9H7q9WKruXlJOTb7PZ7LEkYUlJ2pUYVAePXjh/8WZ3NBpYWV3xiqLgAQBmMyYF/LosSfK7mQ+j4+PPPubzeUZR1BO3VZISsGCh3laRAHga3xzsbKtYFE6pOwOiqqpSOp0Wi8Ui0NNT/7dYRDCYYcBXFAoFE0Q9IQ6Hw+FwOByX/AL46VfqPeb/vgAAAABJRU5ErkJggg==","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADU0lEQVR4nO2YP2gTURzHv+9y75JLc1oTSkHqHySlJhl7UAShIh1OKLg4uIiTAdFBujiGiop2EEdRpI2DqHFRsIMUrogFhTsncWkHh9Dqcq3pnzT3p88hiZb+Adv7DQ73gVvu3r1333e/P+/3AyIiIiIiIiIi9g2jns8wDKW7e4CtrX1jyWRSbB1QLq95QCUgW5BqIgASAA7AA9ABQNny3Aew2hoXtK7QyBSTtDnZ35++cunyyMEDKdVxHA5JigEAAiGUOG90pA7wqQ/T5ZcTE59LpZI0Ojq6Qbl+KIrFfp7JZLSxBw/HarVlsRMvXr+ezuVyxwzDiIPefEMj5fP5FIDO6zdG7i38+OH5ge+5nus2XDcYn3j2DsCJrq58CsR/npLY6dNGF4Ds6O07r3w/EBtCiLeTk98AnBoYONudRTZOuaBEORmAoF6XV9PpdH25tvw9CHwwACvLKz8VRVnSNGl9DnMu5YLUAnDx4iBzHMdPJBQB1jRzRebMdV1vaGgIALaF1jCQCrAsi6uqygB4QohNHyoEAH9xsTmGck0yAaZpygBQqVR8AGKHqcWXL199gFYEiQAhhKxpGtN13VdVdVcTiceTQtd1D6ATEVqAaZqybdtM13UfgOjt7d11bKOxxgCAUkQoAaZp/tl57NE5dV33bNtui9h3UgslQNM0Zts2sM/IMj8/HzoihcqIuq77lmXJlmXxtln8K5v+3p7e20pYH9jmlLOzs7sOjsebx2uqjweIotBenHKL34SGLA+0RQwPD+/qlIXCIX7m786TZGTSTLzJJDhj4o+I1pmCJxIJBqKdb0N+FhofH99Ip9N8fd1laJ0mAj8QKUXhMzMzgroIoBYQS6VSScdx4glVPRqTm0Eu2ZHoWnHdg79+eSqy20rN/wapr69PA9BZvHrt1vzCQiMIArfhNdz6ej149PjJGwDHM5mMhv+xoCkWizyT6dPu3B+7u1Sr7VxSVirvC4XCkSxhSUnalRg0Bg+fP3fhZrqzU11cWpQlicUAQARCcDXRUDhXzKmPj58/f/qpVCoJiqKeuK2S5cCcj2ZbhQOItZ5tYHtbhSQakQcFwzB4LpeTqtUq0NPTvFutIpnMC+A7yuWyB6KeUERERERERERESH4DyfBulRDEWHcAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD2klEQVR4nO2YT2jbVhzHv5IsOVbsWMQYLcFhf0hI7IyAMWXGS8jVg8IuY7exy+ZhBqH0sKUn1WUdWwZjl8FYGY53KAvuDhuEQCm4HsNkEDAEs26Qw7KZNvEgtTxHiWQ9vR0cdyxpoa0ebAd9QCD0nn7f30/S0+/3foCHh4eHh4eHx1PDsbaXzWYlVX2JM4yfOVmW6ekJpZLRA8qEmSArQwB4ACKAHoBhANKpcRvA4ck8cnK4xsfCyICZVGr07TfevBgeCQYODg5E8LwAACCUSn7RHA6OiLd+uF1aW139SdM0vlAoOCz1XZHLpcRIJBJa+fSzFb3zF30Y39y4cTsejz+bzWb9YP/5uoZPJBJBAMrShYsf7e3vWTaxe1bPskzLJMXVr9cBvBCNJoJg/OZZIszPz0cBTF0ufPAtIYQ6lNLv19d/AfBy4ty5ZyYx6WcpyLM0BoB0Oh1jfPx5zjgy/ujZPXAADg+NP2VZPh71+80d7FgsBVkHwC0vLwcJMXqCKFg81zcv+gTbMAzzraUlmbUmS2NcvV4PA8PY39/XOcrRB0mgf9Lttlqk1miEAQisRFkFwFUqlTAAXLq0pAOgHMedTmL0arHY4btdu9aohVlpszDC1ev1sKIoSCaTejweP5N9B6TGUkin0x2+y9u1Wk1hoe/WAFev18PdbpdLJpM6ADo1NfXIyaZpcAD6QfC8XWu4D8LNzdzW1tYIIYQuLCy0MfjSH5N0Ot1p/962t7e3w5qmPbUfrqKXJIlvtVoUT+j8AEEQiM/n+8/eAJ2bm9MVRfFtbm6OPOnNlUolODExMaRpWttNTeR2DTiZTKbtOM5jBaGqKoC+86qq+tfyeb1cdldas/gL/SuIjY2NR068c+dXOnC+oWntQrVquxVnlQf6QQQdX6FQCJ0ZPak7z59fDKqq6s/n1/TXXT75ASwzsZN5MaOL4bBvbGwsRCl9UC47/Zw8PDMT8+fza3q1WnD95AewLmvJ5+990pUkKWbZlp/S/tp0CBECgYBcLBb3qtWbzJwH2BdzAqIY2t3dteUhOSb6RABAQJajR0dH0l1dFzEJpuU0S/jp6ekQAOWd/LtX7t67ZxJCLLNnWsfHx/YX1659B+C5SCQSwv9xQ5PL5cRIZDp09eOVD9udzsO3lOXyzdnZ2YlJhltKpl2Jxezi+KuvvPb+qKIE7rfv+3ieEwCAElAx4DclUZQqt3788vr1rzY1TaMsNvWM2yqTIrBjo99WEfFP3e/gbFuFyWJm3Rngs9msGI/H+WazCcRi/avNJmQ5QYHfUCqVemDUE/Lw8PDw8PDwcMnfJJejLtpQYVwAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAElUlEQVR4nO2YX2xTdRTHv797e1vWbsBWWMXNMEvjbBeMydgWNNhk4aHAkslifBluiexP0F3MbKoPU5uRKOCyGF7AWQnUJUQFhsNho9QMyUj0wcTMxC1zW/enUFpwK/vf9t7786GbEpwstD8TH+4n6cvtL+ec7+937j3ndwAVFRUVFRUVlZQhrO05HA6tyVRGFhZ+I3q9nj64wOtdSADnZWYOWRkCwAEQACQAGABoH/hfAjC/vE5e/qWNhoWRFZ4uLs6pf6X2zQ3rMzOmpqYEcBwPAJAp1eqEmCFzveC/fs37xdmzP7ndbq61tVVh6T8tGhqKBaPRmHW8/aO2mZlZuhqfX7hwzWq1bnU4HDqwT9+04Ww2WyaA7DeanUdDt2/HJVlKxBPx+FIsJp85+9kVAObNm22ZYHzyLNGUlJQYAdiOHD3mkySJKpTSr698Mwqg3Gw251osFh1LhxxLYwAknS5Xqa6uNi7OLUwkJAkEwNz8fPj5F8p1O3fu5IeHh2MsHTIVIIqi7lj7e1uDkci0JEtRnk+a5zhuaXwycLe+vj7f6XQaWPpkJqC2tnZdoyhui9y8OfvD1au3BK0GdLkK8IQjwUAg0t/ff7eu7jVzW1sbMxFMBIiiqGtpaTH/EQrNVlVVBQFQQsl9RSwp5fDhw+GRkZ/vVFRUmJ2MRKQtwF5bu04UxW2haHTWbrdPiqL4r2sPHHCSioqXbw8NDUUO7d//JIuTSEuAKIq6k++8lQy+tHQS5OGf9nA4DEIIKisrw2NjY3eqqqrSTqeUBZw4cULX1NRkHv99/J69tHQSAP5K+odAKQUhBLt37w7/cuNGeO+Lews6Ll/WpxpHygIkSeJknuejN6MJACBr7P79KIpCAKB/ZESSZZ7nIxE+1ThSFuB0OhdPX7oUKCsvy/X7/aaVnV0LSikhhFCP58ucmoMH8773+Sbq6upmU40jrXeg3eWa7+rqGi0oKNjc3d1tomukkMlkQjJ4T055eXGe3+ebaG5ujj7K6f0nONvaDAMDA9v9/m4Tkm10dsu77mOxeJxSSumFi129ALYCW/QejydncHDwmY6Ojg3Ao6XeajCpA+0u13xPT89oXt5TuV6v9zEgWQj+XpGMsqXlVeOuXbvyfT7fRGNj4z1CCNY6tbVg1hW6XK75QGAuUFOzp3DHjucypIRMVzZXgUI3bdqUs2/fPsHn8w2tpE26wQOM29qTJ1vnJCk0bt1eWMTx3HpFVgANoMiy1rb92S2dnZ2/njp1KrryIrPwybob1fT19SmdZ85M6TMyCjSa5P4YDAbT9V5/rKvr25jFYtGxCp41XGFhYRaA7IZDrx+5FQotybIcjyVi8cXFJeljz6dfASgwGo1Z+D9eaBoaGgSjsTDr/eMffhCdmVn9Snn+/HdFRUVPWBheKZlOJewO++OVe156O2fjxozp6LSG4wgPAFQGFTJ0Ma0gaHv9fZ+cO3f6R7fbTVlc6hmPVSwCMCwhOVYRAKy0CAr+OVaRWDhlXQI5h8MhWK1WLhgMAvn5yafBIPR6GwXG4PV6E2A0E1JRUVFRUVFRSZM/AS9M9S4Sy9CRAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEwklEQVR4nO2YX0xbdRTHv79LbxkdtEA1iNliCQVWIHERFkxuZ4sspoSHvUCo0TmNWzMnPpSEOFeTBpSZOWVmW8RgiMDDYPwxbdZ0oiRuuumAzfAgGIkaZgqzEwp2ytbb3v58aO+cGzPSe5fs4X6SJs398zvne87v3HvPARQUFBQUFBQUUobIvZ7NZlPn5VWR1dUZotFo6J0X9PauRoEhQTaDci0EgAHAAogC2AhAfcf5GIC/ktcJyZ9kVHIsIrKloiJ3767dzTptZkYoFGLBMGkAAIFQdXpaZGOmlh376mzvqZ6ecbfbzbS2tsbltC8Jh6OC1ev1WYffP3okfP1PuhYDw8NnTSbTYzabLR3yb1/JMKUPl2YCyH3l1dfeWbh6lY8JsSgf5flIJBL7uLvHB6BQry/JgsyZlw2LxaICkLtRp7O+d/SDb/lolMYppf7R0QVtzkPPAsizWCwb5LQpWyQopYQQEmtra8vTZGUZFn9fnBYE4UlWpUJoefnXF3c9rysoNhqcTU3jyWvvekKlAiPHIqJDx7q6Curr67ee9nimYjF+MS0tUcOsSnXj1KfD323nOOPIwEg5IYRSSmWpAckCROe7jh0rsFmtFR6P5/K5c+fmNmzQEEoTQWaYNCYYCAR7uru/Ka98vNjv95fKJULSFhKd7+zsNDy1Y0fl56OjEwcPHpwHtFoqeg+AUBoHQE6cOH01Pz9/1W63mz0ePwghM1K3U8oZuBX5rq6CmpqayrHR0YmmpqYrbrdbBYTXcog2NNSpXC5XcGBg4LypvHiL1+stk5qJlDMgOl9dXV3p8/kmnU7nFUopqa2tvWc0V1bCNCk8COCC3f6c2ev1ghAynaof686AGK3+/n6D2WLZOjIyMu50OufEjBQVFf3n/WLEXS5XsK/vk6+NRmOR3z9Wmjx3/wWIaLVaNSGEmZv7/maqa5w5M35TEARodBnpABCPx9etYN0CxIKrq6ub/XFm5ocDB97e3t7envd/97KYKYfDoevrO/70UjgcsHLcVKrFnHINJA3OeL1eUt/YyAG4QAgJut3ue4rIztbect7Z0mL5IxQKVJvNlwghKW0fSQLEiBNCpj0eP7Xb7WYA510uVwj3+FCbmJiOORwOXXNzc/ViKBQwV1VdIoTgtifuupH0HrhNxIzH70d9YyO3tLQ02dHRcZ38K6SJ/09syc1xOlu2/bZ0bd7KcZelOi9ZQMK1f0QMDQ2Rl/bs4Xw+3xTP36SihjiNUwA5bxx6syQYuvaLleMmk/dINS/Pt5AooqGhYXry4sXZvfv2VYESnRBPNF08H1Xv39+07efZ2aCV4y4RhkEqBXvfaRgcTAOg32wwPHOk4+gFPhqllFLq8382bygsfAHAI8ZEM/NAwuhLSrIA5Ox+ee9b8wsLEUEQ+Agf4Vdv3Igd//AjDwDDA9vQOBwOVq8vyWo//O6hlXB4zZayf3Dwi7Kyss1GGVtKWacSFpvl0Z219a/nZmdnLK8sq0ASkSZxEmcz0iNqllV/OXa+6+TJ7otut5vK0dTLPFYxssBPMSTGKmziGAiAOO4eq8TkMCr3ZICx2WysyWRiAoEAsGlT4mggAI2mlAJz6O3tjUKmmZCCgoKCgoKCgkT+BhgwOY2mVNWhAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFA0lEQVR4nO2YX2xTdRTHz+9Hb+/d7W0ZHdnYglRlZKski0oW+zQmT62dLlGcJgvCFqgmxBcT8IWkTAPSQQIxotlf1kUgUpaYsA0IRJbhXMt4IQQiKoldJhvEtbd1Hb236+/4sHY2AkrXG325n6QvN7+e3/n+zjn3/s4B0NHR0dHR0dFZNkRre06n01hW9gqZn79NRFHEvy/w++dTAIG0ZhtqZQgAKABwAJACABMAGHPsIwAsAEAisy6d+RWMQQsjWao3bbLu2rb9I4vZJEajsgEIMSAyQnBF2ljEKSZR4i6Pjvi/6esLeb1e2tbWxrTcvyA8nk1cSUmJ2Xf06OH43Bw+jjNnB0bs9pdsTqeTB+3Tt2BoVVWVGQBWte70HJmenmaIaVVNKaqaUtNfdXRcAIDnM2s0izzVyhAAYE1NzTwASIJg+P3M2YEfFTXFcQYjd+nyFTkYDN6y2Tbw0h0piYiaFbFWAgghBAOBADcyMvLmizUv83fu/PRdNksePLh/a01FRfTk6RNv319730wIQUTUJIW0EEAyDgmhUKhFslhEj2fnSbNZekjpoo8mSQLfgQPfquqCPHT+/M5169at0kpEoQKWnB8fH281ioLkdrl6AGDWYOQQMbsJYTzPJ7bU13/9MJGInRsa2mWz2Yq1EFGIgL+cD4VaRFEybamr72xsbIwCAACDnFckoqIozOvtSDocDv/DZDI2ODjo0ULEsgXkpo0oilJ9fV1nNBqNlZeXr3jSf27fvkEJpUlHbW1fIpGIDV4Y3rWywHRalgBCCCCiMH7tWqsgilJ9XV1nVI7GEJFEIpFHrg9ZZDmOyBihhCgOh6MvMTcfHxseXooEIflryFcAyTjPh65f3waIQl1DQ5csyzFkSAghT3Q+B2SIhFKqOGpr+2dnZ2fPnRtqbW5utgAA5BuJZUXAZrMRkyhKajI5HwuHk4QQyPP0MJ1OEwBQEsnknCAIkiCUGpaqPg/yFYAAAJOTk0m3y3Wi2Gq1TExMbGeM8XTx9J9KBaUUCCFkdGysaUNlZfWhQwe7e3qORjIHkZeKvCOAiMAYI+FwWH7d7e4SJNESnAjuYIg8oRTj8fg/iqCUAmOMjo6NNZWvWVP9aVtbV29v7z1EJP9FBABg6Q1EJicnow3O17pMgmllcGJiBzLGu93uJ94wa2rKlpwvKy21H2lv7+rv7/8N8anrR1uyBWez2Ypv3Ly5NxgMvg8AFovFYt23b79PUVVERAwMDIzwPP8cAEijo6Pv/nz37v7W3bsrcm0sl4K+xNlIhMNh+Y2Ghk6z2Wy5+sPV9+LxuMgYo9mKIIRQRVGMwxcvvlVWXl59pL29q/f48XtanHzBd6FcES6Xq7tIKLIc+/yLd2bliAEyrv0xl2Af7P7QVbp6dfUnPl93R0eHZmmjyW00pybkpq1NgZmZGUtl5fpXkS2WQ4nVagfG1u/dsydwsrt7xuv10v8l5/+FbENT3NzScvje9DRLpxdUJaWqSUVJHzv+5XkAeFbrhkYzPB4PV1JSZT7o830mx2OPbSlPBwKXNm7c+Eylhi2lplOJzc7NFY2urR9bi4uLItEIRwgxIAAQJGmhiFcMHGe8cvn7zlOneoJerxe1aOo1HqtUcgC/LMDiWIUDgOzNlMGjY5UFLTbVejJAnU4nZ7fb6dTUFMDatYtPp6ZAFF9AgF/B7/enQKOZkI6Ojo6Ojo5OgfwJk6V8nmzMxmYAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFCUlEQVR4nO2YbUxTVxjH/89ty+WtVWkWAx/clriA3QeNTPdtDSJLzYyG4GIQWl2iNc7RFjVRx+BaJFWZ4PBlCyqBhqWD8tLhorLphlOJuLhk6vSDLy2I02UgKnOGtrc9+2AruLjF0rvty/0l98O9Oec5z/95nnPOPQeQkZGRkZGRkZk0JLU9g8GQMH36mwT0AwA0Gg0bHR19Oo7T+TgItIUkG1AqQwA4ACoAQQApABIi7wAgRr7/EWkXijxxo5TCSJSs7Oy0NcaVG6ZOUScPDQ0niCFRDYBTKpS/JyUljiWnqJUnT59ytjY1nRcEgbPb7WEpx48LszlbpdVq1bv37Nk9cv8Bex5tHZ5TmZmzXzEYDDykL9+44QwGgwZAmqV0Q+v9Bw+YKIqBMb8/GBRFdrCh8SKALL1enwoJMy9ZFBhjHBGxsrIKU2bWa2sHf7nLbyy1zuUTEtDxZddtr9d7NzGRb7esX1/HGAsSkSTlw0lhJOJ8uGrHx4tXvWey/XTxYvv1a9d6OO6J+dHR0eunT3/fkJebV+hyuUxEFGaMSTJ23EQdqa6uXer1+X5sam5eDSDjo4qKPf5AgDHGWIfHcxZA1ofl9nyfz3eh3eMxT+wbD3HVYjTyDseuxcveLajoO9d7YJXR+Hl6eroGwNh4QwR4ng84tgvHeV4RMBmN9ha3O0xEh6M24hUyKeeB8cg3u1pXAkBNTU0SgGll5cLOaAbaOzp7ALy8f//+VADY7nAYfL4BSTIxqQw8G/n8ir4fzh0wrljhZIxxFovlb6PZ1dXHIn27GcAVFxZWxpuJmAUwxoiIwrW1dUsLluULZ3p79xYXrmiKOlBSUvKP/aMTmIiOceFwqMhkcnR4PAoiqo/YZv+aAEEQOCIKf1rfsCh3wVtbvjp6dO8H69Y5o6Je1M4EEV8/fPhIsWbt6rIjR44EiKgxVhEx1d62bdsAAGlTUqYolUrVlUuXhgAwxLGfXL16eZgjosSUFO1k+seUgUjkiIha2jo71Vu2bq3MyMgIEVF3LDUcbWuxWLI3bNz4Sf/AYPfbubl1k5kHMc8BImIREYdcra0oKi6uYgoFR0THIpP4hZy32WxvlFitdT6v93hOTs4Oxlgo1vqflIAJIjgiOtTu8ZCxsKiSgDARdbvdbm7fvn3P7TdnTnrU+bkWq7Xu1uDgNzk5OQ7GWJjof/i3i67fLW73at/AwAV7VdU7AJRqtVpbVl7+dB/o6PR8x/P8qwB4i8Uyz+vz9n7b01MOQMkYI8Qxh+LaiSesJofbPR7OVGS0i6EQt10QzisUquhhBoyg8vv9KrPZPM9qs+0auDV4Ine8bIAnC8F/L+AvIg62tLjDpqKiyoGbN2vu3LkjRsvi8aPHwfnz58+2Wm2bfP39RxcuWOCQwnlJBADPiGj8rL5+6sK8vPdv3PSJUd/4RH5GfkFB6aWfL58pXL68VirnpYZbsmSJGsBLpZs2d90bGWFiSAz4A/7gmN/PDjU2XQHwuk6nT4VeL+lRVhLMZrNKq81U76iu3vnb8PBzj5RftLWd0Ol0M2ZKeKSU9FZCb9BnLF20bHPatGnJw/eGVOEQ0hiYglPQvdSkFL8yQaXsOXn2oMvV0CcIApPiUC/xtcpMFXBDxPi1SuKT7xgDEMCz1yqiFINKvXtwBoNBNWvWLO42biN5RMc0mjT2q/IslzyiY0A/nE5nEBLdCcnIyMjIyMjIxMmfsZmVJpiz4UQAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFlklEQVR4nO2YbUyTVxTH//eBWkq1atXhglEnmDgkRYdDJFNwQyV8kmV+WCKBuiBx0zmX4SJIHmpmR+nc4luyGGEw2UDFFjehOHRVmyj9sBjFuCyCvAi+tINV2hKxfXr2wdZVk22trbIs/SX9ds85/3NP7z33OUCECBEiRIgQ4X8KETEiYs8zRnSY/bGcnJwJcXFxDJgLxpgLABXwvBi9vQCAurpRF3BcCFvAcDkCwAEQAXABkAKQxMfPTpbLJ4s7OzuvABgF4PCuE7y/kAlrBRakpsqLCgo+niqTTRwYHJTMnDlzTUyMJLbnZnfr1GnTbLFSKdduNNYdra018zzPqVQqTzjjh8TGjamixMRE2edarXZgcJCIiARBILfgJiIityBQQ+Oxs2lpaa+sW7duAsJb/dDheT4agATAysM1tUP3LFZyu13uB2MPPA6nU/ixpdUza86cDQBieZ6fMM5yn4SIOACYn5S06ErntdvVNTWd20pKWgWPQERE3x09eq28ouL8ja4u+7v5+blem6jxVe3FJ16hWJL8W9eNW79cvvwrgOVbtmz9cuzhQyIiqm9oNAHIPGcytd+1WO3Kok3ZXtuQkwjpEBMRxxjzKBSK5BO6RoPT6RxJXbz4bQCOKXL54wMqEYs9IpFoJGv58g0XOzq+rty9qxlwr2WMnSGiKMbYM99IXKjiFygUyU06XavD6RxZlJKSy/N8D4BRInL5LRdcLtfQgQMH/shIT19/s+fmOY1arVcWFWUzxoRQKvFMFfCJfzUlZeFJna7VaXfYFy9KyeU4rg9AjHcN81vPALDz56+DiGyMsfxLZvMRzW61HkBeKJUIugJExHw739zU1OYvXhAEbnh4mP7O1mYbIa8P27KlS/O7urovaNRqvVKp9FUiaD1BGXjF0wKFIvmUXt82Ojo64i+eMfavjYkx9jiJjIz09V3d3Re0X2ib3ysuXsUY8wT7dgr4L+RzXFhYPL90Z8kPFovVmrEs/R2O4/rKy8sDEu+fhPehZ2OMFZw+3V79mWpX47zZ89ZyHGfybVQgvgKuQEVFBeM4jqIknEQmk013OOwWADZBEDiVShVQsKeT8MYfvX33zp3o6Ci5IAiTiQgIoksHXAGVSuXx7sxVGhPyNFXq5osd5m8ZY+uJyPZIU2C7BoB5fUW3GAzajPRlxVptlVKtVp/ynbFAdQV1Bryl52pqDp3dvmNHXmLCvBUXL3bUM8amAE/ePAGIF7W2te1JX7r0fY1Gu0GtVtd6b7egqhn0Neo9aFGMsTMA8jS71fpLZvMRxlg+Ednkcvk/JuETf6q1bU/a62kfaKuqNlRWVn4TakMLGl/zURYVZVusVvsls/kUgKlGozEGwNSycr7S95RoOqEzApit0RyeBEDcYjAc/H1omD4tLS309/XC8U/insXq6OjoaAHwskQimVXOq6p8CZzQNRulUulCANNbDIaDQ8PDVLpz5/iK9/FXEpuyrVar3WQynQaQsq2kZI8vge8bj5kALDmh11dbh4aorKxM6W877viE5BcWrunt73d+tW/fT5u3fqTzeDy+BK5u2vzh8Z6+Pvpk+44if5v/DEajMRqAJCkpaV1dfb391sCA4Ha7hbGHY5779++7Wwxt9MaKFdsBSPfu3SsOV9ywfRM3NDSwtLQ0UXZO7msrs7ImzoqPh0twgzEGmUwWtXpVNixW65uusbFj+/cb7uBRswq6AT5N2BI4dOiQkJmZKZsRN2Piz8bztf39vZMSExJWi8Ux0s7r1w0vTZNbY2KlUQkJyfFmc/UtnufZs3TwpwnzWGXOBKDPN1aRZmW9tWKyXD7xpO54OwA7nhyruMMRNNyTAS4nJ0cUFxfH5s6dC5VK9RAA8Twv7n082KpzIUwzoefOixgtRogQIUKECBHGkz8Bsazm9WBEuDQAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFPUlEQVR4nO2YbWwTdRzHv91oR8cYtAU2H9jAqJiob8SQMIIkxCU1GQnEXGIE5YXh9M2UMXEbbLt26zYeHc4EdiuKgGzt3ZWZ8aAw1nWbRiITDSCBwMCBykNMBGSD613780Wve6gTN9KtLOnn1b24++f7/f+/v/v97oA4ceLEiRNnlCAiHRElxFrHQ8Fx3IShrscFPM/rAUys2rjlgz1f1jsAmFiW1cda13BIyMvLMwJI5ez24p7eXiIiqm9wOwGksyybzDBMIgBdjHUOSQLDMCkA0t9ZtariQtdF+nT79iNr8tfu7b5ylTZs3rwXwNNzLHMmA4uiFqmoFRjLsomiKD6Wu3pN9fLly9edOn2mp+tCV68uAQneVt/NhQsXrqjcuMl5bwrNs1qNiRzHPTrF3dnZqQeQkpef7zj+wwm6duMGBSgQJA3Z76e/796lX86dpy3V29wA0jiBM8RaN4A+8cYSjivs6emhz3ft8r7x5lvO6zdukqoqquyXFTUQoOptnzSvLShsUAMB2udy8QDM2rOxQxAEAwBjaamtQJb91Nre3gJgPoAsu6NCUFWViIgOHjp8BsAyAC+7RdFJRNQgirWIpYnwzpfabAWy30++jo4WALPnZ2fPSEtLm722oKBSlmUiInK5hWN6vf7FnJycDAAWyeOpIyJyCdIOACZtI8ZefInd/pEs94vneVa/cuXKiQBMxaW2jbLfT0REUmOjD0AGw+QZNbEWQTPRIAhja2KQeL+ffKHYzOZ5Xk9Eutzc3CQApvUl3IY+A579rQAys7NXTBqwhln0NPIhE2N0En2xKdVi097RAmAWz/P68GtxOAYGrGURPR6eiMglSTsAmEfNRH/mywaLZ1k9EfV11uEaGLCmWZC0OI1WYWvDWBJnLy9UVXVQ5iMb0kgMDDBhkTyNdUREoiTVApgStQFQG4d11TU179++fZsOff3NEQBzwpmPvH+kBgDoNBPpzp07+UAgQE1NB2oAJA21fiTDbedkMU9LS01NRXf3r9cB3Lk/c2aCTqejYT7/wLUvXbqkA3Cv88efrgWDQaSkTHoS0Rz4tOOc6hKEHaFj3u8EYBkqqw8ZoWR7ecW6QDBIx7zeZgAZixZFb+AD0Dfjm92iWEtEJEieOgxRcA9RxEabw1GkqCp5fd5mALO0b4foj9zaK87skqTQSXg8PCJOYoSvUWN5RUWhX1GotbXtKICM/6qtaJswNQhhE42DBrMRNLLkkHiVvG1tRwFkjrr4f5sI1YTg8dQBsAiCYAgbGDRKeBp9ADJzcthk7dnkMkdlkV9RqMXraw6LH9NvhLAJl3YSUsiE2WplpptMppkFRUX9w5wgthgMhucY5u0nAEwq0zLf4usXPyY7H0m4kzZohe0SpDoALwCYV1JWVq8GAkRE1HTw8CkArwF4fj1nL/YrCrWOdWz+z0S9O2TCUVX1xVKGqfnt9z+CiqKo9/33FVmWacvH2w4ve/31rT29vbHf+Ug4jjMAmFbLO3efOHmSui5fpkj+unWLfj59murdru8APMNxnCEa4qPSLOw2m8KcPXvnvXdXbS22lz2+dMmSV/d8u+/P8+fOtydOmCBPnzFt/oKsBbO+P378VLmjstJqtV4BoEapk0eNxKysrMkAnqratGlP95WrtDr/w89eWby48sLFLnXX7t3tAF4ym82pc+fOfWR/coV/bKW7RM9ORQ1QkIi8bW1eAM8yDGPURoTY5/5BaGPH1K+aDtT42jpEAJlsxHfDI482ABoAJGnX40d8GO33+vgTHidOnDhxxg3/AGSrz/cbn/IyAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGNUlEQVR4nO2Ye1BUZRjGHxDlsrACiWbNZDXWOI5kGy5pOp0ZVw25CIqrpThUppVCuMCeRciOm6VWjo5/VJKaCNrFSa2UYRQSu445aaZjtbsQYcBZZI+Enr3B4tsfexZXRBNc2KbhmdmZ/WPn7O953+f7vvc7wKAGNahB/W9FRAFEFOhvjj6J4bggz/fly5cP9SdLr1VcXDwUQOjCxZmqVavy5gOIyM7ODvY3121Jgg9LS0+f18Tzl2w2O+XpdFoAco7jQvzNd0txHDcMQNjs5OR03mxubWhqsp47/ysvWq2UV1CgAyDfunXrf7MTEnzEU4mJC8zNzX9fbGlxzkmbl3PvfffNNxiNjTa7nV7JzS0EEKnRaEL9zXudpNiEJyQlPG0wGlt+MxiE8RMmZAF4QPqkHqs+ZmhsbHRl5+QUAYj2VZwC7vQBHMcN0+v1Q9PS0pPWruO2hQSHRh0+dPj05SuXT8uHRw4l6qQOZ0enzW4dk5ScMiNSLseHu0uK3tmw4V2O45x6vd7hCyN9hoeU+SaebzXV1NizclYdaBEE6kmbNm/++mhVVZ1otVI+u5qFPxe2Bz45NTWdN5uFFotgVy9cmAVA8dLK7G1ms7nd1enqcLY7O5ztzs7iHTurAcyIjX009TeDoV4URcr1l4luu41gsQiOBYsXvwAgipk1axyAcfo33vzE5XLRVSI6VF5+HsC0adOmPwJghEKpVBmMNRdEq5VyWXZgTXj2+cSUlHnuylscizIylgIIz8zMDGEYJmTkyJGj8tmCjQ6nk4iIPv5037Hg4OCxDMOEq9XqYQDCFEqlymgyuTuRP0AmPPCzU1PTeZ4XWiwWxzPuysukriAzMzMEQPSrr619y9neTkREnx08eBzA/YxaHQ50jRZhsR4TA9GJ62PTLFgEoQvee0yQvkcVreE2dhnYf6AawJiZMzNknt91mVAoVcba2v41IcHLPJkXBMGekZG5tDt8bwxIzw0CEPZYfPx0j4mcPK3OpyY8mb2223Rl/gb43hoArnVCoVSqTKba+iuiDzvBMEwQgJDElLR55ubmVkG45Fi0aNFN4ftiALjWiViFQmUy1dbbHXbSFhTqAIT3eRQnogCO4wKXr1ih4s3mlobGhtbUuXNXAIjyLFhfGfAyETExLi7pzNmzJkG45NK/sT4LQOCtLkW3ui0F6PV6CpfJo2Uy2Yi/29qsJ3748a/hw4cTz/P07yXota4mJCQE/HLqVHNdXV1rdHTUkJExd40GQOjryCO1LyJPq9OKokg1NX9ciFUoVQDCOK8bl7f6GKHAyZMnhwIYf7Sy6nsiot179mwHECOtwb5LApLnabW6K6JIJlNtvULpNtFTPntrwBu+4milN/wo6Uy544ET0m4gz8nT6kSrlYy1tfWPxcdPRw+d6OU2GhgXFxcGd+W/IyIqKdv7AYBR0p3hzuG7m8hlWdZjwhMn707crgHvyldWffWtd+V9Dn9TEyZTfWy3OPU4Sux3jxIzM9wG1Gr1EA/8kUp3bEqlykv/4Xv4G0zks6woimQ0ma5bEwzDhMTExNzNFqy+Nszt23dMLg8eO2fOnAiGYYKSkz2xqfzODV82MPA3mOjqRG29wh2nSJUq6UEAY9foX//I1dlJRERfHi4/B+Dxx5988qGHR48eAa/Ml+4t65/M376J1ewVUSSD0VivmDQpBUDs88te3NLE8w6Xy9XhaHd02O32znffL64AwACY0n23GbDK38xEPsuyVpuNTpw8WffssmU7WtvaerxSvr1pc/muklL3gi0t9cmC9cWlPkSv1wezhYUrVr788vqGxiZ88+03Xwd00oVQWWgQrhJdDQBdtFjkU6c8kRivnDSkvKJi13NLlhRqNJq2LVu2OOA+bf0nqRORWa+sKuTNZldVdfXvAFIBjIH7tcqUbdu3H2+7fJneKy7eBeDeAc/8v0kCiszRaFbb7Hb69Xdjw4SJE+cCmFpx5OiPREQ7S0p2ArjnPwfvkfTaUK7RanU2m41O/3zmz4Off/GT+4Qt2wF/7Da9lWdhs0VrWFG0EhFR2d5+Gg/6S9JpLCtau3bl+8Xb1wGI8dlgNlCSRotAAAF3PBL7S0QUSERD/M0xqEENalD9p38A7RA4tP26lHAAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAIvElEQVR4nO2ZeVCU9xnHv4DugqgIyy4LQZddf+CyyiK8LEeDvnbG9ajoTJK+IZR2UCsYJzXGTOuVQ5q2qU2PaSdJ26nTqoAo4BGTAKaZCssuGlw2f+gEa6csxy5bp6NtalsRWHz6x757yCGHEMhMn5n9b4/v5/l9n+P9LfD/mNkImsbvDhEEISTSHkk3598kk8nknsbfmurQSRhjCwEoASwBEBEbGzsP05uwqQnGmFSn00UBWHH2vffqrrS0XF+ZkbURgEyn082faX2PDMaYVGvQygDoq86caSIxrDabMyMrawuA6FkLwRiTarVaGYDUyqrqJiKiz260fX7x44+dRERXW23OtIyMzZiNEIwxKZeUFA1Af6rmrImIqKPTcW/9pk37QiRhX28wNXV6IFq9EHKdjp8dEA+Jr642ERF1dnXde1rI3wMgISIiRp3A2DqT2dJORNRibXWmZWSLJzHDEB7bGGSB4rscjnvCc8+9CECRkpISuWzZsgUAotWMGRvNFrsXIj3dkAdAPmN2YoxJOc6b+ZpGn/j8/D0AFBzHRUBsm3q9PhxAtDoxeW2TJQDCkJOHmTiJANuk+MR3Oe4J+QUvA1CtWrVusdFoDC8qKgotKioKFQQhzMDzSqUyQZWYmPy1JkuzXawJxxde2IwxaVISFw1Af1oU3+1w9D7tEb8UgAZADIAoADLxFQVAAUANQKNmLM9ktnQQEV0NtBM/8ZOY0GRkjEmDIyIW/MVmi62sqn6n4FlhdbfDcf+7+w4cqjldWZ2s5+K/USBsjVPEuO/8844EwcEhAIBBotAwaW/QnDmLPqr/U+2HF2rMS5N0+mN/OPrrVU9+RW212Zwv7N69y3rlyic6HX+/rc30n4mCjEs8x3EP28bh6H22sPAlAIq0tLS48PBwxVu/+OVb/7r7bxopas6du7QsJWWZSqVTAlAwrdZobr7ssZPN5kg3TFNhM8akSWLBVvq7Ta9QWLgHgCKV5xcBmCsWa+R3Xnr5yN9u3RpwD7oH+gf6+/v6+wePHS+rBbA0JkYfDkAiipQzpjWaLSKEtdXph5iiwg7wfMrJqiqP+O5uX+ZF8cHi2+fk5ubKASwt/cEPq9xuNz0govdr69oA5BgMvFIFVaj3u0VgOdOuMJqb/YUtdqfHhwgUf6q6Rsx8d69QIGY+NXURhtQRl5c3Ty6XK7+3/8CP7/f1ERFRZVX1JYlEkrhWWBsx9P1+CK2xSYSYkjkR2G18tunu7s0vKBhVPADs3r1bCiDq1ddLf9LX309ERGfOnm8EkGA0fjN8pN/yzgmm1Rp9Ldba6szIzp5ci2WMSQ3ihK0UM985DvEBAJGvvHb4iB/gXAMA1WgAo0G0tAauHeOECNwq/bbxT9ghnp8ygEAIdWLiWv/aYe2ZyLCTxHnE609VeWzT0dXl221SUx8t/nEBAIDjuHkA5GqmNTYGLIDe5wkRcsQIER8Dl1edOdskev6/zwjCixiy20wnABBwEmpmbDCZ20U7ubjMzE0AFul0OsmwDwmCIAGgPHP+fD0R0Y2bN29v2LR5PwDVeDI/lQBeiLCwsDiVRvNUbf1HN8SHIkfumjVZHMfNJaIgBIqKjIwkABKFXJkAAN3d3b2XLjW0x8TEBDvv3xoE8GC8Pz4Vce3aNbdGszyky26/1W5v/zsAksminggND19ks9kelJaWPuwGnufnaDSaiCdXr97Y0mpzERE1mEydCQlsHcbwXmBMxQnoAInBYJABSD5WVnaRiMjZ43IX79y1D4CM5/nQET8oXn3IMrKytnxitfYQETVaLO1qpjUCkIsFNq0AOkAi7lzaE+XldURETqfTvb3k+UMAFCyTLcSjalFsVdFpGRmbW7wQZotdnZi4FuM4iccBCBCfXFZ+so6IqMflGti+o+QQgBh+jBY+AkT25pbWVicRUZOl2c60WuNYEJMFCBR/oryi3mObnoHtJR7xY82fUSEysrM3X7WOH6KoqCgUE1wlAsUfL6+46BW/daKZHwVCnp5uyGvxQjT7IOQjQWQLQphcLlfuO3DwiHeZO1VVfWmBRJK4YcOGYf4NLNjyipP1XttsLd55EJPJ/HAI3gNhyMm72trqICIyNzfbmXbFSBBzeD4vGoDmte+/UekeHCQiovdra68DyDIYeCUYpIHivZkvP3nSZxuv+Nzc3MjHEj8cwpDntZPZctnOxO4knlSI3vOwElmy64U3elyu/sHBwf6+gb7+3vu9g7/93dELABLkct18AHMBhPoKtkK0jcs1sLW4eGoyPxxC54ew2cSTuOyzE2Mr5Qvj46Pe/OnPf/T53bs0UpyuqfljYkqKJi4uTrZy5Uo5gOSyQM9PwjYTeqjX6fj5bW2mUENOTva7b7/9GwPHxVuaL3ds21Hy/F///Nn11OzsxQXP5BcrlQr6x53b0pCQ4GAAICKShs3rDQrCggsffHDW2tx8+fbt27KyioqffauwcH2Py+V+tbT09eNHj/6e5/l+k8l0F9M1+cWrD3l6ut9OJrOlQ6VJ2gjPtcoSANHwXKcoxJf3euUJuVzOAKw8EVCw20pKDgCISZkqz48JETDsvIXdZGm2L01K2hAbG7uEW7UqNi+vZJ6wd2+YsHdvmCAIYRzHRefkfFUFQP9Qq9y58yAAxaRb5eQh+PkAotMNOf4Wa7HY1YnJwyY2A5OKrVJ7osIzpHr8nv/ixfshhs+JRrPFrmYssMV675O0x8vLfbbZvmPH5Cbs1EPw/rXDXxPtIkTc8uUZiwHoTpSV1Q2xzcyL94Z3Tog14SQiamhstMfHq54CkO1diXtcLt96IF4MzLx4bzy8xXogPqyrv/mrd95t8nje5VvMZszzY4VvAczK2mK1fer0DrCeHpd727eLX8Fsss1o4YXgMnM2WW2fdnd0dvVtLynZD0DB87PMNqNEkNh9IhJ1qZlr1q9fD0DGMjMX4ksg3hfi1YcEQIj4DDv7/6UfGkQUdPjw4S9P1mci/gdqZpR7mNaEswAAAABJRU5ErkJggg==","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAIoElEQVR4nO1Ze2xT9xX+nIcTO46dONiOY+fmgSGdpziabmwYynQhJlH+iAKO8VLKVKRNywaGagyxQmkH67pCXqBpqjZaMbJ1ZaUkxKmUagQIzdRSHpU2kpRNCPzYUmhBWwr4nZjf/vC9fiQ2mARIKu1I9y9f2993zne+c+7vAv+PBwaPEMKbbxCzCZ5Wq+VrNMgCkMkwTDaAtPkGlXLQtFIIIA/gf0NdVmYAINVoDGJ8DUjwdDpdjghYpFKVrBwa/uuVK//450SzpaUVgKyqqioPYRILUlY8mqaFIpFIVkRRxtNDQ9cJGw6Xy20ym60A5AzD5AFIn2esM0On0+WIRKJFcooyDp45c50QQs6d/+TG20ffuUIIIXan020yma0AFFVMpBILIngseFkRRRlPDQ1dI4SQy6Njt2ia/gGA+p4+26eEEHLd4fA0mVkSVUweFoCc4mQzeDoMfmRs7MsahlkPgNIt1ZUBMPTYbBcJIcTucHCVmHc5RTKvUqlqTw2dZTM/eus7K1e2AJDT9GqJQqHL0Wg0MgD6Xlv/BbYS7iZWTsw8ySlONoMs+JHRsS9Z8DKDIWKbPLVaLeBInOAq4XRyja1gonJ6uuBVKqqWk83l0bFbNcyq9QKBQG0ymeSNra3CjRv3ZFssFoFl2zZBfX291GBg1ACWx8qJqwS9mpY8DRLRzBdRRk42MZovBpAHQAKgYNqVB0AsFUhVAFb09HEkopWYjTs9igPwdDqd0G63C8VSqa67u/tQ3apVi0fGxm5bt2x54aPh4Q/1er245bnnWiVisWDiPxMZyEgLN2iIkKxsvj9bKMwa/GDw2MmTAyNut7u8x2b7jXnNGr3D5fJs3779xb7e3uNMFRMcvjx8F8D9RyGSCviIz3NWOTIW0bxcbzQW5OfnS9q6DnbcvXuPJIpjPb1nKyoqSmmalpSXl8sBVPf1hxvb7nxyjR3VPEVNcxtjbMNmVFRU5ALI3/KTn+6/+cUXk1OhqcngZDAYCAZDR7r/OACgvKKgIpemkalUKoVcY0dJON3cnGAtdk4keHigz9c+i3i3AYD0mpoaGYDFe3/52rGpqSlynxDy/sAHVwB8W69nCjXQZHG/HeNO1Zw7OZzOe2vWrduM+GE3OwJc5hUqqpaTzd9HoplfsWJFLqb1Ed3YKJTJZIU7Xty5zx8IEEIIOXrsvSE+n7+kYUODePr9sSQije10RCox27Vj2nrAuc1nEZ9PBB4Atm7dmgVA+vLP97YFgkFCCCE9vX0fAiitq/teTqL/iqtEX4I58Yhyih9Sp2c07HTZJCKQv/uVPfujBE6cBVCShMBMErHDjlsAq1KsRDKf59yGBZ/UfmdJAECcnPQxPZH6FqtU0kIRELdVJsj8A2fHXAhMIxFTiWhP0HSSia3VavkSiSRPXVrKnDozZOessoZhngUgT6b5x01gGglDpBIul2dtc/MmAAVKJS3k7k0DAEIIL0hRPIlEVtR9pPvQ6tpVZZ9cvDT+ox/+eNdHw8Mf0zQdOHfunBsASQXAXGN8fNzn8Xg8FEX9u3nt2l3vHH33fClFCQ8eONix4fnnV+Xk3AlZLJb0CIG9e/fyJLdv388S8UXKQoUaAOx2+53z5z/+19Kluozx8fGppwE8Nm7evDklkRSmA/jvyNhnn/v8/vuFysKcwqKiwmvXroW0Wm28Gtijj3xLS0ur3en0EEJIb5/tUwDLNBqNTK1WC1L548chIQCZNE0vAlC2r72zOxAIEI/XS/a1d/4WQJFWqxUhgZx57CogM5nNVofT6SaEkBM220UA1amSeAwEOPCl7V0HDnt9PuLxesnrbR1vAqAqKyvzAWQk+3Iau5crEpDQp0JijgQy9Xp9AYDS9o6uwz6/Pw48+1lS8BES7NBQmExmqz15JRI60hwIxGXe5/cTjycCvkRv1BcAzEPBR0iw41thMseQ6Hs4iY0bN2bj0VaJOPBtnZ2/97Gy2cdl3mhMKfMzSLCTT9FkNlvtToebEEJ6ZpKIi+UWi0AmkxX+bOeu/dwy9+dj7w3l8vlLGhpmLHM8JJVNWzjzKcomOYnwSqtYs27dZofTee8hckpnmMZFAMpf+cWrR6dCIUIIIe8PDIwCWKbXM4UIH/jOBM/JJuw2hwCUsJnPnC34CAlOTk0xcurr778AtrGVSqUQQDrrYnmtm6yvfn7jRjAUCgUDk4Ggz+8L/e7Nt/oBlBYUFOSyoPg0zbCa7zrs8/mJ1+uLNKxxjplPQIKVkykqJ5ZEtUajkRkMBrFUKhX/qq399a/u3k34SPnu8eODWq2W0mq1IvbBp6S9IybzMQ1Lp5j5R3moT2OqGPHw5WG+yWy2dHV1tZWVlOT02fovNZvWbpHLy1xlzxSLW8zmF6R5UsHEVxMZaWm8dAAgIUIyBdkBfmYm/y8nTx8Z/dulsatXr4o7ug7stm7e9H1CCH79xhtvvbRjx2t6o9Fz6cyZOwCeyPSPNLbJbLbaHWE59dr6LwBYrlGp1AByET5WWQRAzl4yAPkABGr1EhWAJVzDen1R2TwuzT+UBDfsmkxmq93hiJ0Ty6q/WV1cX18vtWzbJuCuxsZWYcOGBnFDQ4MawOL2rgOHfT4/8Xg803z+yYOPkGCPA+PmBGux+gTuxH8mxm2mrwez9fm5k4hp7OtsJVg5xZLgRyZsIp9/SrJJFumsxcpNsXJiK1FcXFxUWWlQAyjjZOOOrgfU8vrl0vkED4QlEhl2TWaz9brD4YkhUQvgW22dnd0+v494H8N68KQi6k6mqDv94e0/nd+5++UefyBAvF5fjM/Pr2ySRZycHC6XhxBCgpOTxOvzkX0dCxs8EJFTVR4AebPFssnhcrm9Pj/ZH36SovT6hSWbZJHGHn1Im7+73rxj50ubARRV1tTkM18D8FzwaJoWAsgCkFFXV5eDhfhu+GFhsVjS9+zZk4EF+mZ+QcT/AO1CpcfMMDorAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAItklEQVR4nO1Ya1BT6Rl+IAESyUn8EqMQMNEkm7jZYR0mowZM9wwsaAqCF5qdnWoXx926OlZH7NRup7Xo1o46nfZnu3UVKHIRtLvVFbeQBCEh6PRHW8XVrgkgYNVeVlyhyi18/ZFzQkSoyEWcjs9MJjOZc3Ke532f93I+4CVeYkqImMn/LiwsFKhUqoj3b98O4MCB4Rl81rRDYDKZJACkAAgAiclkip5lThOGICkpiQBYVFZZefyPDodLKBavAEBsNlvMbJN7GoTWJCsBoC0uKa2mHOqc9VcZokxVy2SEZVnRbJMcDwKr1UoA6I4Xl1RTSumXN250uxobuyiltM7hahExTIpUKpW/iCKEPPljHPmOzq7eTFtWQbRYvL7B7fEHM+FskRCyMlEqlb9IdhKyLDsXgPa3RUWnguQ7ezfY7dsBJBISr1artelur9dHKaW1DsdVEcOkyGQyon8BRPCR1x4vCUa+69bfe/Ls9m0AFMuX26Rms3kOALnBYEr3NDf7KaW01um6whAy63YayzY933rrrZ0AEux2u9Jut4vz8/NF2dnZRK1Wxxtfe211faM7lAneTnq9/rlnQsguDdom3PNZa3J3AVABWAxgHgBF2LcGQCIhytUNje72YGE7W8QMY5FNoTtNZhILrVYr09TUJD9eXHJoy+Z8e2dX139279mz99PTpy8e+PnhXfMUcwcf9j4cppEQAkDEcORwpCAiIBAKFGfPnqtsv9naU1JU8tEb1lRdncvVstZu3x4dCFwnJPlhR0dj32SETBQCvmCPFRcHI9/V1bsuL28bAJVCpTAePHzk118/6KFjoayq6k+vJie/IRaLVWq1Nr3B7eHs5LzKMCR1pmviiYLt6Orq5Qs2KSmJEC2RAZj7vd17Dt+5e3dwKDA0ODA4MNA/MBAoKi4+j6C1pOrgpFZoDYZ0b/PFUGHP5JwIK9jikOfz7G9vA6BITU1luOsEVqtVCUC3/2cHq4aGhugwpfRszflrAFKWLWPj+IK1WCxiAESrNaQ3eoKZqHM6WyQSsnK6RYRsczREvrN3XZ49nHyolsxr1sxRKpVxP/jhB4f6+vsppZRWVFXXR0dHv2LbaJOGX8uRVCRoNGnupqYROxGSopbJiGYaRDxhm84w24wmDwA7d+6MASD/yU/3H+kfGKCUUnr69582AFiUmbkpdvQDxpoTda76y7ydpjKxQ7b5mJuwNzs6e/OCkZezLCsZTT5MAPnxvsLDIwI+uQBAM5YAIJQJuUanS2twPzknJpOJkG2Oh3WbDRvs2wHMC/P8E5iMACBUEwqNTpfm8XIT2+EMrR3PkgnB0qVLOfLcetB1qydUsLm545KfioAwEcRgMqU3er1BES7XZYaQVJlMRiYysSO4N6lFRcW/OxWKfHAxU4xnm+kSAIzYKUGjSWv0eG4EW6zzGsPIVygUCoZlWeG4N2/dujUKgKysorIoEAhQn9//L1tWVgGAxOXLbdKnPXw6BADBTMTGxi5YvFifU+dw/I1SSh3O+r8qlUqd2WyOopSGghgZfqPZbAaASKKQayMjI9F569aj+gvum0Sliujrux2YyMOnA5cuXRrS65OE7e3+f3R03vonAMTFL0iUSEisVqt97HDgMQFOp3NYqTQNbnn33b21Ltf1dJZdWFf3+S/EQqHhypUrMZxHZxYsK0yyWiWXL1+SlJaVFb63ZfM3WtvaHhTu27+rvf1GRxtpi4yIiKDj3s+dHhCGkNRal+sKpZS6vV6/wWRKB0CeJmIqFjLDHMW17iVllVU1lFLq87d+lZ27/h0AivjgzJhIEFiRTCYjIoZJqXU4r1JKqcfb7NfodGkAFP9LxGQFsCzLzx1DecXJ80Hy/m5bdvZGAIRrIBOHhmVFiVKpXELIylqH4yqllDa43T5OxLi7yqQEsKyQO4oxlp4o/4xSSn2trd0569blY4Ldb0zYbLYYqVQqFzFMSp2r/jKllHqam/0GgykdgNw8Rkrz8/NFeIZVgmUhtFgscgBLKqqqz1NK6Q2//6usnJxNABSZmZmxkyLPQ8OyIrVMRhhCQnZyNzX5EjSaNASj81gmLHa7WKlUxu394EeH+WWusqq6nomOfsVme2KZE1pMFjkAQ1lFZQ0f+aw1a7+DkXVl6mBZViSVSuUSCVlZ53S2UEppo8fj02oNowtbwLJr5gHQ7jvwYcVQIEAppfRsTU0LgBXLlrFx0CMGAMxm8AVrPFFRwdvmXnZOTj6mI/LjiRAxTEqtM9idvM0X/TqjMQ2A3Gg0MkaFkQEg27p9x4e379zpDwQCA/2D/QOP+h4FPjr68RkAGoVCwSiVSglPvvJk9ed8t7Fl527EdEZ+PBEMQ1J5OzW4PZyd5sTPnz9fe/DQkV/e//rBmK+UFSdPNuiWLDEnJyerACwpLQ8WrL+trZuL/DN3m2dOkUbDirq7/zJnQCB49cypU79Z9eabSW5vs3/zd9/bPtTbe//9HTt2x8+PG+zp6UEE91JPKaggKmowEBiWOx3OsnNnPrl2orzyV5u+/bbN19Z2r2D39/fUfPaHc5mZmX0Oh+MhgPEH1XSAnxNihrHUObiaaPK2xiUkfBPBY5WFCB6nzOc+8wAkcr+/XlpWXst7nuvzcs7zzw96vT5m9Jyob3T7dEbjaqPRqFq1apXcbi8Q2wsKxBkZGbKMjAwVgKTi0hOhbpOdsy5/VsjzCNUEIaHCDpsTfHeK5teDipPchG1t/TfXKhUzVrAThd5mixm9dri9Xl+CWpsei9gFfMGeKA+R77YFh9TMdZtnhc1mC9mJnxMNbo9PpVqYA2B5aVkZb5t7OWvXbsZU1oOZwlhzorbO9eXRY8c8I30+O7zPvzjkebAja0dqrav+C77/+9ra7mfn5r6DyWyVzxt8JsSM3OK60PjnL65dv5u7fv2LHfnR4E4PpAB0sXPnvg5AOtbm+kKDZVmh2WyOAiA0bzVHzTafySIi/AThJf4f8V86TSnLyuT9HQAAAABJRU5ErkJggg==","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFXElEQVR4nO2YX0xTdxTHv+cWpNo/YkXQZUa3l5lFnUlN3AO4PexPHeKiodmWaECYiExqVxhsgXptxAkq/2pchtkyGsTiLeicwWQEKQyCumj2sASzbJl/qw/+ibRs0r9nD7QZM4sptsiy9JPcl5t7zznfc+7vnPv7AQkSJEiQIEGC/ymiKArMLEynD4q3PZ1ONysjI4OwdClsFosPAOeJYor6wQN2u91ks/3pBxzBuDmMlyEAAoBkAAEACgDKTfr31i3QzFe3tHxxCsAoAE/4uWD4ipmkeBiJsEyr1RRv3WpSzlaorl+/Pn/5iuXr5yjmyNMXpb+Rpkm7oVSrZT39fa0nWlsviqIoWCyWUDz9x0RRkTZZq9XOrbJYDt26fZuZmb0+L4+Pj4eYmQOhILceO9a7enXmi3q9fhbiVP24LTCttgiXL1/29/f2XBkYHPK6XLdDMpksRAKRZ8wTdDoHcPrU6QuXLg3dzczMJAAcL98xw8wyACg2GN6/6XIFP6+t+874cdmpYCjIzMySo/Pn/IIP2265XFx38GAlAFnknRknEkip0Zh77/59f5/T2QVglansk0avz8vMzO32E0MAXrW1tTWPut1cb7WWAaAZFzE5+Lv37gUGBwc7AKTL5fLFZtFywOvzMTNz18lvnQqFYiUAjeRw7Hd7PNw00yIez/zg0JAdgNrpdMoBpFaZxdqIgM6uk04Ai+vqvlIBSO6QpFq3Z4wbm5tNsYp4qjbKzDIiChqNxtxqs9l+5covnVmZmUXMPJafn5+Cf+8wQm9vf4iZQ0Rk7pAkFBYU1gMAETVGbE67AGYWiCi4c5dJX11dZR8ZGelcm5VVxMx/EBFKS0uf2F2IKMjMICKz5HBwYUFhPQSAiJqeRsSUBDAzEVHIZDLpq6qrO0ZGRqS1WVnbw8EzomyNYRFMRLslhwPbCrfVMwSBiOrDCYp6wEUtgJlJEARuaGjI2bx5yzfnh8/b16/PLmXmsakEP0lEKJwQy5dHj/IHev3BeampXiI6HL4flb2pDDJiZigUCo18tlzx2+9X7wB4FLYRy1Dy/XjppzsKpRKpqanpEV/Rvhx1BcIZE4iozf3oUdqOom2HFi5MDxKReaplB/5uBKLFUlJeVm7tG+i3bszJ2Tdtn9AkETIiakwWBBRsLTgkORxMRLvDZY9qAUaC37t33w7DrtIjzoH+w+9mZ1cys2+qiZhyFwovQBkRNTAzFxYU1ndIEoUrwQaDIargxZqaEoPBcOSHoUHrhuzsCmYOTDX4mAgPH2psbja5PWPcIUm1AJKHh4dn48mDDBZLTclDt4fPdHc3A0iJ2HpmwT8uoslqLXN7PCx1de0HoNJoNM9X79lTN/lXQqlUvgxAZampKRl1u/lM99mZDf5xEfVWa9mox8O2dnsDgJfKKz5tiPzM2SXHIIBVn5nNFQ/dbu4++4/gYyLmHdmkNdEY8vuF/Ly8AwajcY7P65uXJJswLxOEue/k5Gz5qLjY1Hfu3JFNGzdWMrM/2l7/THAyJwFQ5ecXVB+XpMDVa9d8gYA/5PP7+OHoqP/s9z1cXlHRAiBNFMVZ8fIbtz2xfft20mq1wrwFC1SvZ62VLVqYIRv3jjOA0Fy1OmndW2/i5s0bL6xZs0bZ3t7uwcR3H3MF4noq8ZpO91xuzoZKhUKhvOVyLXplxcq3VWoVLly8OKRWKX9VKlVJPef6W47bvr4giiL/pzb1AARgiRwTVU0FsGTnToNoFi1NAJYB0GDi2CUFcax8vNuXoNPpkjMyMggAbDZbAADy8vKSgKUArsFms/kRpzOhaYeZiZlnrscnSJAgQYIECaaZvwDmxND6wsZ3FQAAAABJRU5ErkJggg==","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFT0lEQVR4nO2Ya0xTZxjH/8/pBWxpFVmCGlDncCxshHSVwpIqu33ovmCyuezLFt1ECDpcRqNQZBQmBuIFM90XljEpLaggFDFb3JyXwBkTExNjMmLYEsplWLl4KZdeaHn3gXbTRTNKz7ZsOb/kfDvnef7/933e9z3PC4iIiIiIiIj8v6H/UnAyGAzy+Ph4AgC1Ws0AwOVy/Z7HYpmZBVoCgiUUKhAADoAMwCwAJQA5AEUwhxuAD8B08L1A8IkYqRBBQjyn1S7f8d7Wwli1Sjk2Nir1A6uISMoCbEQVo/AsUaok33desZyur+8xm81cRUXFnJD5IyI3VyuLi4tTHT762eHRsXH2OFpa7VeS09LWGgyGKPzNa2MxcNnZ2SoAK0rKzJfuP3jA/AG/z+vzzvpmZ5m1sakfgCYlJSVGq9XKhEoq2CgwxjgiktbW1ZlVSuVbfX1990zFxZlymQwtrW39g4OD7sTExJ533t5SyBhzEREDwCLNywmgPSSetbW3F7768ivv29vbDw4MDvJE8+PjnnEP2BpslakvPJ/VyfP7iUjOGAMEGMCIDYTEt9rPml7UaHbWf1X/UcupU+cTVyVIGZtfo0qlQn7jxvWb1VVVOasTEl7v6uKPEFGUUCYiEg+A2trai/sdjsHKysrNAKQqlSqupKysyuvzMcYYa22zX4qKinoaQHRBQUFmv8Nxq5PnjwNYwhijf8VESHyr3V7U7xgYLjWbswGgubl5CYDYfZ+Yq0MGzrS2XQawxmz+PAYA8vLydP0OR98VvvM4gOhQrMXoWNQ58GjZpOXXn7DsrKyo6GCMcbt3737i3t7dfZUFv73mB94tNZU0dPH8ESIyMsa8oTUTDmGvAcYYERE7e/ZcsVaTlt9os31YUVHWERT2lwcTEc0xxri62tprh47WbE1ISHitq7v7SHBhh+0grBkIif/6/Hnjs0lJOceOHdtVU1OzYPF/NkFEPQ/u399WVrrvC/6HH6uJaC9jzB+ciQVtsYvahZQxiqc4jpu7ebN3dDHfA0B5eTmICOfs34y73R6PTCqJX4yesGaAiFhwFj7t5PmYL+tq6w/W1Gwlop5wZiH0rkajSWpqOmmdnJoczsjQFRCRF/OLecEHXNiOgyY8m/T6PUNDQxf3fFxo2Z6XpwuVxULFp6ZuWGdtbLRNTk45denpOziOm2CMIXhCL5hFlRARgTHm26jXGweGBy6Umky2vKCJtWvXPjHm+vXP0Lz41HWnm61NU1PTIzrdhu0cx00EAoF/bhsFwIImvES0t5PnUWwyNcjl8m1Go/G6SqXigD+qKTiq1NHxbUCj0SRZbTara2pqJFOXnsNx3N1AIEDhjnyISH4lQiY8m/T6PcNDwxcLjYX123JyMicnJ2USiUQWKmUGJgUQHRs7nWS12azT09N3MtMjFx+pgYdN+DZu1BuHhn+9YCoqOvGSXr9h7M5EgKP58G6Pd06hUK9psFpPzMzM3M7Q6T4QQjwgTEf2cDmZ7B0dip35+Qd6f7o1juDJKpFKVuwrK9nvdDpH3zAYdnEcCSJeaLisrKwYAKvLKw9cHZ+YYP6A3+fxevwzbvecrenkCICMlStXKoRsaAQjNzdXlpycrKo+dKhqxOl8bEt5quXMdyla7eokAVtKQW8lsrKyVm1+c0tRXFys8rbTKZVJo9ZxHOQ+r+fnpUuXeSQyqfTyBf6Lpqa6q2azmQnR1At8rZIkA37xY/46JRrAMgASAPcAePHotYpfiKRCNxKcwWCQZWTEU69rOaWo1QEA6HW5JIq7agY4YLFYZiHQnZCIiIiIiIiISIT8BlFBmhCJvq/gAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFK0lEQVR4nO2Yf0xTVxTHz7n0tfqwFKxDHeqmspTC4haVoSWZI86t/rU/BqmJ2cQf6/aPCWLI1G08OqvMEGBOmIsos0xcBHUmkpn4IzjEhi3+YyICE39kQiIooGXUvtf2nf3RVtkmy+h7/vc+yfvr3XfO+d5z7rv3HgANDQ0NDQ0NjbhBte3Z7Xb9zJk56PdfR57n6Z8DPB5/EKA5rJpDtQwBAAMADgCCAJAIAPpx9gkAQgAwFh0Xjj6K0alhJEbGkiXTP/pgXXGSMZEfGXmoI0COKIwMdCH9VE5M5Kdx59sueo4dPvyrIAjM5XLJavpXhNO5hDObzcaK6uoK3+goPYum4ycuWq3Wl+x2uwHUL1/FMIvFZgSA5PWbnF8PDA5SOByWpKAoSZIk7//uwDkAWBAdo1rmmVqGiIh6erxjaWlpL8yeNSt49FhTtxQMcpxOrzt74cJwV0/XHzabbXpPjzcgCIJqpaOKACJCRCSTyWQ6eerU+nnz5vi7rnWeZYwBAODAvcFOTqe/va+mprCgoGC2y+WSiUiVElIsYFzwKW3t7UWhUOjxJ07nYbM5RUKMxJiUNI1VVuw59WBo6Hf37t1FDodjLiKSGiIU1SIRIUNGYDKltLW1FwWC4uPc5csPAAAk6PQyUWQbQEwIGQyGsXdXrfJ4vd41X7rdxQBQhYh3YxMQbwxxZyDmmExJyVfb2ooCQfFxzuKl+5oE4c/o+6dBkQyiKMpbt1aEbDZb/dD9+93uXe4ta9eunaM0E/EKiMyayZRytb19S0CS/DlLl+5DxLHOO8AgsnH9iytXfkPGWNBmsx0afDDUXVbmKlYqYtICoo7IFA1eCgT8OdnZNYg4JssyDicNT1gOer2BZFlGxlgod9my+sHBB92unTuLCwsL414TkxIQc1DgdJp+uXRps+/hw0fZ2dk1jLGxSdTyUxG5y77vvXnz2rYd2za73e608T6eiwAAAMYYTeE4Hc8nGv3+wCgAiOFwGGGCspkAin4T7O/v9+n1UxINBoM+nsU8KQExBz/U1g65hNK9CxbOz7jc0bEBEVnsn/+/oo9m6/Tp0/l5b761sv5gw7clJSW3EREmKyKeNQBEhI2NjX1lglCVap6RcbmjY6MsyzrGGPl8vv8U8TT4n/Mzs7JWHjnSUON2l3YSEY7/cT03AQCRTDwRUSZUpc4wZ3i93o2yLHOOxYsnjGLRotcAEanlTEtBZpZlZWP9kZrS0tJOImJK9oK4iS04h8Mx90Zvb5XX6/0YAKYZjUbzZ18IX4mSREREx0+cbDUYDPMBgG9pOVNw69at/du3b381akPRaUDRThzLBCLeBYBq965dW1pbWwvz8vJ+ApCf2MYEliCKou7Hpqb3rZkWW11dXW15efm16MwrOtgpPtb+XcTU6h2fby2pqKxY03vj9pO14PONhtat22DPsFheP+ipq1YreACVzuWISNEb1t17w/31q99+Z1P6KwtzSY7El5KcbE2dndpfXVlZ39DQ0KVW8GrD0tPfSAKA5A83bNp7b2CAwuGQJAUlKSCK8je1tecB4GWbTd0LjWo4nU7ObLYY3Xv2lI88evTMK+Wx5uZzWVlZc9NVvFKq2pVYYV/x4nur8z+dnmLih4dHdACMk0lGBiw0hdeLHKfnWs+3Hzh69FCHIAikxqVe5bZKOgfQG4JIW4UDgISoDxki7ZbxbZWQGk7V7gwwu93OWa1W1tfXB3xmJgEA+K9fR57PJIA74PF4gqBST0hDQ0NDQ0NDQyF/ASvNjWJe56UnAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAE1klEQVR4nO2Yb2xTVRjGn3Pbu5VB61yFyUQLW00tJTajZG2KcWSZ7hI/SIJ8ZGZGS4xZQhCQfTDNIkqQuFUbRYdFFsjcygguanBjdrRhCcPEZF8MCf/WrYHFjbIWGOtt73390DUgf0JoLwkf7i9p0tze+57nec85fe97ABUVFRUVFRWVvGFKxxMEoai83MlmZ/9hJSUldO8NnZ2zaeCopNiASgUCwAHgAaQBLARQdM/vGQC35u+T5j8Fo1UiSI5XHI6yDza/u+0Zw6IF8fh1HoxpwUCQiIqK+dTCRQZ+MHKqs+fQoRGv18u1trbKSo5fEB6Pgzcajfq9X7XvS964SQ+iu7f3lNVqNQmCUAzll2/BcBaLRQ/g2S0ffrTnytWroiRl0mJaFFNiKtMROPgbgEqj0aKHwjOvGA6PhwdgNFVWrm//+pu/xHSaiIhO9PdPVpotTQCen8++YiiWCSJijLG03+9fodVqV1yKToxKkrSG12oxPT09tnHjBoPVZlv5XmNjiOM4yLIyy59TIsi8eOo+dmzVunXr7EeOHBkmWZ7WaDQAgKLi4ts/7N8/bLfZTKFQyCnLMohIkT1QsIE74rtXVdvtjp6ensjw8HBUp9MxomwZ4DiOSyaTUz6f70+TyWTuD4WcjDHiuMLzV1CEnPiurqO26lcdq4/39g7t3r17DABHOfUAGEEGgMOHI//6fD8OrDCZqgbD4RolZiJvA3cvG0dN9Zpf+/qGdu3aNe71ejUA7qvAALBp01tav3/PlN/nO/nS0qUvDwwMuBhjxLH8PeRtgDFG3d3dqxzV1auDx4+f2r59+wQRsXg8/kDxADAzkyQiYn6/f8rv/2mgqqqqsj8UcspEYHmaeGwDuSnvO9Fns9vt9kOBwNCnO3ZEczPyqOcZY/Mm9ky1tbX1LysvXx4Oh2soTxN5z8DCktJijUaD0dHR24/7bE5oMBhMiZIk63Q6Xb46HtsAY4wYY6ivrf370vj4+ba2toaWlpbFucw+OgIxAOR2u/WRSES4NTs77XQ6TzPGcNe+f3IGACA33UJ9/dmxsbGLTU1NbzY3Ny9mjFFZWdlDTZSWGhjAyO126wOBQEMikYi/5nJFGGNyPuKBAioxEeX+ic4MhsNy89atbwCLTra2ts7gIS9qExNTktvt1nd0dDQkEolrrqx4KV/xQIF1IFeM6mtrz16ORi82b33/zcbGxiUAZPa/HZn9TjRuOHDwgJC4eTPucrnChYov2AAA5IpRQ13dSCwavfDxzp31FRUVSzJiiu54IAJgaG9vr5+ZuXFtbVZ83svmbhR5F8pt4Lq6upHz585d3tnSUpeWZIMkZZuu2bk5vnnbttcnJycTaxXK/JOAbQoGNQCec9TUbNjX7hsRRZGIiH4/8cfVakfNFgAvmM3mp7KZAe40NKWbm5o+i125IkokiSkxJd6em8t8+933vwBYbnlaGxqPx8MbjRb953u//CKRTD6wpfw5GDxps9leNCvYUip6KlEr1Fa8vf6dT8pKSxdcn7muBctmmslM5hcUp4p4vmho8HRHV1fgjNfrJSWaeoWPVcw8cCGD7LEKn70GBkDG/ccqGSUGVXozcYIg8FarlYvFYsCyZdmrsRhKSlYSMIbOzs40FDoTUlFRUVFRUVEpkP8AMx1JsigHvqcAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEnElEQVR4nO2YX0hbdxTHv78bkyxR0z/XNlXbudp0XpXRMWdloPWhbEuIdBRt8aUtFHZBR5aqgT60I7jRfytlhMAYq2NmQlmtDqHGZqPQ0u3B7aGshf6ZiqY2VqWaSsQ/ubk3vz0kgbW1a01+gz3cD9yX3N8953d+55z8zjmAioqKioqKikraENbyrFarzmyuIouLd4nRaKTPLvD5FmPAJYWZQlaCAHAAtABiALIB6J55LwNYSK5Tkk/GZLEQkkKoqFj/8YFDrWtMOYZwOKwFx2kAAAqhOr0mmp1j0l69cd13sbPzd7fbzbW3t8dZ6s8IUazQ8jyfe+bcV2cjkXm6Ej/29FwvLS0tslqterAP34zhysrKcgCsdba0nZqcmpJkRY5JMUmKSpL8fecPfgDbNmwoywFjz7MkSxAqeQBvnTh99mdZlmmcUnp5IDAG4P3i4uKNFotFz1QhS2EAZEEoxK5dlRsXFxaCMVnGaxoNFuYj0x/a7YYt+fm6jo6OKAiA5/6f0oNjIyaBKIrGo8ePW8bHRx/LseU5jSYhntNwS0N3h6YOHz5c5PF4TKAAIWxSgJkBoigajxw5IkwEg+FAIBDSZulAk6fMEQ0ZGxueHhz8c9Jut2/3eDwmStm4gIkBoigaXS5Xyezs7ExDQ8MDAJQS8o8dJnbb2to8eevWrUd2u3272+MxsdCdsQEtLS0Gp9NVMvTwYbimpmbc4XC8MDba2tq4+vr6yZv3b04cSHoiU/0ZGeB2u41NnzYJ4fD0bN3u3Q9eFte3b0+DEIL9dfunUp7oytCItA3oPtdt2Ldv35t3/rozU1NTM04IwavENaUUhBDU19dPBgK/TlTZbNu6urpMyXerzuy0DVjesMzp9Xpu7O6YvNpv4/E4AYDHj4OSwnHc/Py8Jt19pG3AwYMHFwYGBkb27NlT0Nvbm5862ZdBKSWEEOr1evnGxsbiP65cCTY3Nz8BAPJU4r8aGeWA0+mM+P3+4R07dhR093dvopTCAssL15vNZqQ2b7PZ3vDfuBE85HDMphM6THF7PKaRkZGK/v7+TUiU1OuOfeY+HZUkSimlPb0/XQNQBMDg9Xr5e/fuvev1enkg8wuNyT3QnvSEIAiFHR0dBQDo04IJAUBbW4/l2Wy2rX6/P+hwOGZfNfH/DSa1ECEETqczAmC4urq6vKqqyhiNSUgdroI4zcvL4/furcvu6+u773K5ZlK5kKluJh5InaLT6Yx87fONvlNZWajJ0qxRlES/Elfi+p0733v9Yl/PhMvlmiGEpJWw/z21yBIEgQfw9hcnTwViskwppfSyf2AUwAdms5l5Oc0SroQvyQWwTmz65POJR4+WFUWRolJUWlpalr85f74PwFae53Pxf2xoRFHU8nxJ7okzX56ci0RWbikvXfqlvLx8i4VhS8l0KlFrrS34yNZwdP3atYYnc0+yOI5oAIAqoFqDPqrTanXXrv727YUL3w263W7KoqlnPFaxaIERGYmxihZAqkSI4/mxyqpLkJVgfQNyVqtVW1payoVCIWDz5sSvoRCMxjIKBOHz+WJgNBNSUVFRUVFRUcmQvwFn3/kZiLR7ugAAAABJRU5ErkJggg==","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD8klEQVR4nO2YT4gbVRzHvzPJS5pk88eEkCKtEdmw5o+XLBLQhTaHQoTSXtz1pJ66iwiL5LLkUGIodc0epCAIhhU3jRRlikRhKdjCLtKDufS02y6Yg7Kp20WdbCIJmT9vnockK2xbaHfewcN8YGCYefP7M+838/sDWFhYWFhYWFgcG4G3vFwu54hEMkK/f19wu93s6IJqta8BEuWmkJcgACIAAkAD4AHgOHJfB9AbraOjwzR2HkLGvDo9Hbz07vt5v2/CJcsygSjaAACUMYeTKJ4JH7nz82b1u7W1RrFYFEulksFTvynm56dJKBTyrnx2baXT/Yc9iW9v3tyMx+PRXC7nBP/wNY2YSCQmAAQWP8p/urf/SNWprqmaqiqqQr9eu74O4JVwODEBzjvPE9vMzEwYQOzjK1e/p5QygzH24/r6DoA3U5lMZBKTTp4KRZ7CANBfu91+LBaz9/r9XU3XIQDo9/p/Bn0+LUCI2kRT4amQtwPCF+WyjzGm2kVREYVhmNtsIlUoHVxaXPTOzs7aeCrk6YDQaDSC6PfRbDYPBEFg4yQgCALr9XqdQVvRCoVCkKcTvBwQbjduBwEgn8+3ARiCIPyXxEZnlcq1TqfT0QqFQhAoctHNQ8jwzQPIZDLyhfiFx7LvmHjwrJDNZg86nY52797FEA/9ZgWIjUYjSD0edi5zTgbAEHv64n3sAwDGTuzs7JgOJzMOiFtbWwFVVY03Uqk2DgPl2chmswe7u7va0tLSC8Xi8cPJ1A4M7HbxL11neE7jx/ze6xmBQEBMJpPHzspmHDDKly+3o34/2djYCDzvw/V63Xs2k3LVajV5bm7u2IWdqR2QJImm0+m//c/oRCQSATA0PpVKuVaKK+1SqaSbsYHHX8hIp384dOLWrc+fuvDBg012d2R8rVaTK5WKZlY5pzxQMpaXl2W/30/K5ev+o3dHCRnnz7/jOzky3uybH8OtKpQkiQKQFxbeOxmNRt2U0cMP0zAMgRAy8drrCdRqtYe8jAc4l7WSJNHt7e0OIZ6XDIM5GRv2K7ph2Fxer+eb1dVH9Xqdm/EA/2LO5gqHTzSb9zWn48RpYicAALfLHe7KMmk29+yYBNdymifi1NSUF0Bg4YMPr/yxt6dQSlVFU9TBYKB/ubpaB/ByKBTy4v/Y0MzPz5NQaMp7tbzyyUG3++SWUpJ+SiaTpyc5tpRcpxJncmdevPjW20vBQMDVPmjbRVGwAQCjYMTlVByEODbu3K3cuPHVL8VikfFo6jmPVSYJ0NQxHKsQAONCzcDjYxUuHzPvyYCYy+VIPB4XW60WcOrU8GqrBbc7wYDfUK1WNXCaCVlYWFhYWFhYmORfml6yB9+RnlwAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADhklEQVR4nO2YTWgbRxTH/7Py7Gr1FVliY1PithhZrta6WWCCAsE9bSHQS9lb6amC0h5KLjkqbkhofSg9ViklVjAhkXUppTmUmIZSQgvrW/DFrshB1GkLkqM4tjW7o+lBcjGKE1rtHHLYH+xF+/Q+eG/fm3lAQEBAQEBAQMDIENn6LMtSJyYWyP7+JolEImJYoFrdd4E1Ls2gLEUAFAAUgAsgCkAdeu8BeDaQ44PHN2MylBzx1vx86sP3P7h4KhHTW60WhaKEAABcCFWj3WgsQe/9fL96Z2Xlt3K5rCwtLfVk2vdFqTRP0+l0fPnLr5Y7nafiJG7X6/dzudwblmVpkF++vlFM04wBSH7y6cXPdx4/dj3uucxlrMsYv7Fy8wcA04ZhxiA58zIJnTtnGQAyl69cWeMeFz0hxPd3724COLuw8PZEBhlNpkFFpjIA/CD597NUKnX4tLP3yOMeCIC9zt5fqqruxuPK4Ta2mUyDsgPAhfkLSqvV8nRd74H0y5xSCsaYVywWCYDnWqsfpAbgOA6dmpoiAJgQ/JijQgBgAFB7+HC4vfpCWgCO49BwOEzq9ToDIE5S/eDB7y42N1Gr1aQFISWAI+fz+bz7MjlNiwjbttn09LSQlQnfAQw5L2ZmZl4o2+3uEwAoFArSMuErACHEWKPR+Nf5//Nf27ZZu90WgyBGHmq+BsrGxsaR4ZE6SzabFYZh+JrIvjJQKBQ8ACOVQqVSoYZhKKNk7zh+vwFh2zaDacJxHIr/WAqVSoUWi8WRSm8YKV3IzudZo9EgtVqNbm1tvUTyTziOI815QOIcsG2bmaaJxcXFF36UpmnSRCLhu2yOI3US5/N5Fo1GBQBKiDgWBCEA6OTkJMlms4NBJwfpZ6HV1VU+Pj6uHjJG+icIwPO4iKmqur6+3sOrfBYCENI0Ldput9WwHnk9NNbv0npEO73HWOLJE1dHBlKP0zJRZmdn4wCSpY8+/uyPnZ0u55x13S47ODzgX1//5jsAb6bT6ThexQtNqVSi6fRs/OoXy9d2O52Tr5Rraz/Ozc1NZSReKaVuJc5b51979533LqWSSb292x5TFBICAMGFoHq4q1Kq/nTvl+u3bn37a7lcFjIu9ZLXKhkKbHvor1UogNDgXQ/Pr1U8GUZlbwYUy7JoLpdTms0mcOZM/9dmE5GIKYBHqFarLiTthAICAgICAgICfPIPV6BysZV5AhcAAAAASUVORK5CYII=","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADAUlEQVR4nO2YPWhTURTH/+8l7+W7xr6EiFQqGolJ3EoRodD1Obm4ipMB0UG6OMb6hXYQR6mIjUOxtItCHaRgEQcdXbq0oEOssYR+pOmL7/M6JGnTtNHad5QO9wcPXvIO95z/vede7jkAh8PhcDgczr4RqMdTVVVOJM4KmjYnBINB1m5QKGgmMGmTOaQaCIAIQAJgAggBkNu+WwA2GnZ243GNl2KQJqf7+rqvXLo8dKgrHFheXpYgih4AgM2Y7JP0ULhLmnk/W5gYG/uUz+fF4eFhh9K/K3K5PklRlMjIo8cjlco6242XU1Oz6XS6V1VVH+jT1zViJpMJA4hevzH04HupZFq2ZRqmYeiGYT8fezEN4EQ8ngmDeOUp8QwMDMQBnLx15+6EZVnMYYy9nn4zB+Bcf//gkSSSPkqHIuVgAOxaNLoRi8W06nr1i2XbEABUq9WSLMtlRQloC1gwKB1SC8AZRXHK5bLu9/sFQainuSxLomEYViyWtQHsOFrdQCqAMSZsvbKtQB3GADi6XhNabEggE9AMrOtHV8cZrtUsp9WWAhIBzYAEQfhjejRtqERQCNge/KnOhrqubbOlEOFKAGNMYIztaebboRJBfgr9b1wJcDmLe943v8P1CuxHhJvUa4ckhVpFzM/Pd7Tz+YLsb06svUC2B5oBJRKJjisR1SOkwQPEm7glMHHzHtH4BUBEgjZ44B+cQpqmCbFYTDYMffM2YZqmE5FlqVT67AVxHUAtwLO0tBQql8sBn9/f6/XWr/2hUCi+bhiH19bMAJI7Ss0Dg5hKpSIAormr125/W1w0bNs2dFM3aj9r9pPRp68AHFcUJYKDWNDkcjlJUVKRew9H7q9WKruXlJOTb7PZ7LEkYUlJ2pUYVAePXjh/8WZ3NBpYWV3xiqLgAQBmMyYF/LosSfK7mQ+j4+PPPubzeUZR1BO3VZISsGCh3laRAHga3xzsbKtYFE6pOwOiqqpSOp0Wi8Ui0NNT/7dYRDCYYcBXFAoFE0Q9IQ6Hw+FwOByX/AL46VfqPeb/vgAAAABJRU5ErkJggg==","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAClElEQVR4nO3Yv2sTYRgH8O97l/euuSRt6HG0SNVWAzHpGIooha7n5OIqTgZEB+niGKtVtIM4SkVMHIqlXRTqIAWLOOg/UBCKOMRamv7imh/mvXvzOiQVaTuZt6bD+4EbLne8z33JcbzPAyiKoiiKovwzIns913WNvr7zpFpdJpZlif03FApVH5jj0grKWgiABoAC8AFEABj7rgcAKq37eOtoW0jGInvOZTK9169eG+/pjoa3trYoNE0HAHAhDJPWI9FuuvhxqTCbz3/J5XLaxMREQ2b9tmSzGWrbdmzqydMpz9sVh3k9P7+USqVOu65rQv7r2zYtnU5HAcRv3R5/9HNtzQ944DOfsTpj/GX+1QKAM46TjkLyPy+TPjo66gA4e/f+5GwQBKIhhHi78G4ZwIWRkbH+BBKmzIKazMUA8Fo8XnEcp1Ipl78FnIMAKJfLa4ZhbPQM0toKVpjMgrID4OLQEC+VSsw0uzRCmq+5EaIaY8wnO/0BgAOf1nZID9AihBDi71NIfvA9RxXgv1EBOk0F6DQVoNNUgE6THsDzPAKAkL19BACAEBzR9ll6gK/VKnEcx2Cs/mc34Qd+I2YYVNc3dEgOIjuAbq6vR0qlkmWGw6dCoea2PxKNOLuM9W5u1iwkDrSax4aWTCZjAOLZGzfv/VhdZZxzVvfrrParxp9NP38DYNC27RiOY0OTzWapbSdjDx5PPdzxvMNbyrm598PDwycTEltKqVOJMXfsxOVLV+70xuPh7Z3tkKYRHQAEF4KGu+oGpcaHxU/TMzMvPudyOSGjqZc8VklQYCVAc6xCAeitaw0cHKsEMorK/rRpruvSVCqlFYtFYGCg+WuxCMtKC+A7CoWCD0kzIUVRFEVRlDb9BqKuBusP6ygzAAAAAElFTkSuQmCC","duration":16.666666666666668},{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAClElEQVR4nO3Yv2sTYRgH8O97l/euuSRt6HG0SNVWAzHpGIooha7n5OIqTgZEB+niGKtVtIM4SkVMHIqlXRTqIAWLOOg/UBCKOMRamv7imh/mvXvzOiQVaTuZt6bD+4EbLne8z33JcbzPAyiKoiiKovwzIns913WNvr7zpFpdJpZlif03FApVH5jj0grKWgiABoAC8AFEABj7rgcAKq37eOtoW0jGInvOZTK9169eG+/pjoa3trYoNE0HAHAhDJPWI9FuuvhxqTCbz3/J5XLaxMREQ2b9tmSzGWrbdmzqydMpz9sVh3k9P7+USqVOu65rQv7r2zYtnU5HAcRv3R5/9HNtzQ944DOfsTpj/GX+1QKAM46TjkLyPy+TPjo66gA4e/f+5GwQBKIhhHi78G4ZwIWRkbH+BBKmzIKazMUA8Fo8XnEcp1Ipl78FnIMAKJfLa4ZhbPQM0toKVpjMgrID4OLQEC+VSsw0uzRCmq+5EaIaY8wnO/0BgAOf1nZID9AihBDi71NIfvA9RxXgv1EBOk0F6DQVoNNUgE6THsDzPAKAkL19BACAEBzR9ll6gK/VKnEcx2Cs/mc34Qd+I2YYVNc3dEgOIjuAbq6vR0qlkmWGw6dCoea2PxKNOLuM9W5u1iwkDrSax4aWTCZjAOLZGzfv/VhdZZxzVvfrrParxp9NP38DYNC27RiOY0OTzWapbSdjDx5PPdzxvMNbyrm598PDwycTEltKqVOJMXfsxOVLV+70xuPh7Z3tkKYRHQAEF4KGu+oGpcaHxU/TMzMvPudyOSGjqZc8VklQYCVAc6xCAeitaw0cHKsEMorK/rRpruvSVCqlFYtFYGCg+WuxCMtKC+A7CoWCD0kzIUVRFEVRlDb9BqKuBusP6ygzAAAAAElFTkSuQmCC","duration":60000}],"hold":"data:image/png;base64,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","press":[{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":60000}],"release":[{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":16.666666666666668},{"url":"data:image/png;base64,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","duration":60000}]},
      emblem: "<svg id=\"prts-rhodes-emblem\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 510 510\" aria-hidden=\"true\">\n  <title>Rhodes Island</title>\n  <!-- Fan-made vector redraw traced and size-corrected from the classic Rhodes Island emblem. -->\n  <path data-emblem-ink d=\"M 265 71 C 265.589 72.100, 266.295 73, 266.570 73 C 266.845 73, 266.589 72.100, 266 71 C 265.411 69.900, 264.705 69, 264.430 69 C 264.155 69, 264.411 69.900, 265 71 M 243 76 C 242.411 77.100, 242.155 78, 242.430 78 C 242.705 78, 243.411 77.100, 244 76 C 244.589 74.900, 244.845 74, 244.570 74 C 244.295 74, 243.589 74.900, 243 76 M 268 76 C 268.589 77.100, 269.295 78, 269.570 78 C 269.845 78, 269.589 77.100, 269 76 C 268.411 74.900, 267.705 74, 267.430 74 C 267.155 74, 267.411 74.900, 268 76 M 252.585 90.626 C 251.163 93.170, 250 95.645, 250 96.126 C 250 96.607, 252.700 97, 256 97 C 259.602 97, 262 96.572, 262 95.928 C 262 94.348, 256.947 86, 255.990 86 C 255.540 86, 254.008 88.082, 252.585 90.626 M 227 103 C 226.411 104.100, 226.155 105, 226.430 105 C 226.705 105, 227.411 104.100, 228 103 C 228.589 101.900, 228.845 101, 228.570 101 C 228.295 101, 227.589 101.900, 227 103 M 284 103 C 284.589 104.100, 285.295 105, 285.570 105 C 285.845 105, 285.589 104.100, 285 103 C 284.411 101.900, 283.705 101, 283.430 101 C 283.155 101, 283.411 101.900, 284 103 M 220 115 C 219.411 116.100, 219.155 117, 219.430 117 C 219.705 117, 220.411 116.100, 221 115 C 221.589 113.900, 221.845 113, 221.570 113 C 221.295 113, 220.589 113.900, 220 115 M 245.813 113.683 C 246.534 113.972, 247.397 113.936, 247.729 113.604 C 248.061 113.272, 247.471 113.036, 246.417 113.079 C 245.252 113.127, 245.015 113.364, 245.813 113.683 M 291 115 C 291.589 116.100, 292.295 117, 292.570 117 C 292.845 117, 292.589 116.100, 292 115 C 291.411 113.900, 290.705 113, 290.430 113 C 290.155 113, 290.411 113.900, 291 115 M 285.813 143.683 C 286.534 143.972, 287.397 143.936, 287.729 143.604 C 288.061 143.272, 287.471 143.036, 286.417 143.079 C 285.252 143.127, 285.015 143.364, 285.813 143.683 M 224.813 145.683 C 225.534 145.972, 226.397 145.936, 226.729 145.604 C 227.061 145.272, 226.471 145.036, 225.417 145.079 C 224.252 145.127, 224.015 145.364, 224.813 145.683 M 218.813 150.683 C 219.534 150.972, 220.397 150.936, 220.729 150.604 C 221.061 150.272, 220.471 150.036, 219.417 150.079 C 218.252 150.127, 218.015 150.364, 218.813 150.683 M 288.813 152.683 C 289.534 152.972, 290.397 152.936, 290.729 152.604 C 291.061 152.272, 290.471 152.036, 289.417 152.079 C 288.252 152.127, 288.015 152.364, 288.813 152.683 M 218.813 153.683 C 219.534 153.972, 220.397 153.936, 220.729 153.604 C 221.061 153.272, 220.471 153.036, 219.417 153.079 C 218.252 153.127, 218.015 153.364, 218.813 153.683 M 293.813 154.683 C 294.534 154.972, 295.397 154.936, 295.729 154.604 C 296.061 154.272, 295.471 154.036, 294.417 154.079 C 293.252 154.127, 293.015 154.364, 293.813 154.683 M 191 164 C 190.411 165.100, 190.155 166, 190.430 166 C 190.705 166, 191.411 165.100, 192 164 C 192.589 162.900, 192.845 162, 192.570 162 C 192.295 162, 191.589 162.900, 191 164 M 244.979 167.215 C 244.640 171.758, 242.104 192.216, 241.853 192.434 C 241.659 192.602, 238.304 193.044, 234.397 193.416 L 227.295 194.092 226.750 181.482 C 226.451 174.547, 225.952 168.618, 225.641 168.308 C 224.968 167.635, 209.797 169.889, 208.150 170.907 C 206.946 171.652, 206.004 176.004, 203.477 192.500 C 202.635 198, 201.012 208.575, 199.872 216 C 198.731 223.425, 197.568 232.537, 197.286 236.250 L 196.774 243 200.387 243 C 203.522 243, 204 243.314, 204 245.371 C 204 247.479, 204.583 247.817, 209.250 248.419 C 212.137 248.791, 216.188 249.357, 218.250 249.676 C 221.285 250.145, 222 249.945, 222 248.628 C 222 247.548, 222.862 247, 224.559 247 C 226.017 247, 226.851 246.568, 226.498 245.996 C 226.157 245.444, 224.829 245.256, 223.548 245.577 C 222.267 245.899, 220.918 245.676, 220.550 245.081 C 219.856 243.958, 221.562 243.657, 228.235 243.724 C 230.290 243.744, 231.772 243.440, 231.529 243.047 C 231.005 242.199, 230.032 242.282, 247.500 241.672 C 255.200 241.403, 260.600 241.525, 259.501 241.942 C 258.401 242.359, 254.590 242.795, 251.031 242.910 C 247.473 243.026, 241.523 243.759, 237.810 244.540 C 234.097 245.321, 230.297 245.668, 229.366 245.310 C 228.272 244.890, 227.912 245.049, 228.350 245.758 C 228.739 246.386, 228.061 247.148, 226.765 247.540 C 224.150 248.329, 220 252.687, 220 254.643 C 220 256.030, 197.333 347.969, 196.377 350.460 C 195.900 351.703, 191.807 352.905, 179.274 355.485 C 176.645 356.026, 174.648 358.032, 168.486 366.324 C 155.420 383.909, 156.745 382.630, 150.825 383.376 C 140.257 384.708, 119.119 388.548, 118.401 389.266 C 117.997 389.670, 179.054 389.959, 254.083 389.910 C 332.364 389.858, 389.222 389.452, 387.500 388.957 C 384.541 388.106, 364.079 384.326, 356.712 383.270 C 353.216 382.768, 352.155 381.704, 342.914 369.434 L 332.903 356.142 322.983 353.848 L 313.062 351.555 310.975 342.527 C 309.827 337.562, 307.366 327.200, 305.507 319.500 C 303.647 311.800, 300.474 298.300, 298.456 289.500 C 296.437 280.700, 293.709 269.143, 292.393 263.819 C 291.077 258.494, 290 253.242, 290 252.148 C 290 249.990, 291.302 249.559, 301.250 248.425 C 306.408 247.837, 307 247.531, 307 245.451 C 307 243.665, 307.632 243.060, 309.750 242.816 C 312.382 242.514, 312.499 242.264, 312.475 237 C 312.462 233.975, 311.636 225.875, 310.641 219 C 309.646 212.125, 307.710 198.628, 306.338 189.006 C 304.967 179.384, 303.721 171.388, 303.569 171.236 C 302.800 170.467, 285.388 168.391, 284.709 168.988 C 284.273 169.370, 283.641 175.188, 283.302 181.917 C 282.709 193.711, 282.612 194.131, 280.594 193.589 C 279.442 193.280, 275.978 193.021, 272.895 193.014 L 267.290 193 266.395 180.250 L 265.500 167.500 255.250 167.215 C 249.613 167.058, 244.990 167.058, 244.979 167.215 M 336 191 C 336.589 192.100, 337.295 193, 337.570 193 C 337.845 193, 337.589 192.100, 337 191 C 336.411 189.900, 335.705 189, 335.430 189 C 335.155 189, 335.411 189.900, 336 191 M 168 203 C 167.411 204.100, 167.155 205, 167.430 205 C 167.705 205, 168.411 204.100, 169 203 C 169.589 201.900, 169.845 201, 169.570 201 C 169.295 201, 168.589 201.900, 168 203 M 241 201.965 C 238.525 202.259, 237.175 202.742, 238 203.039 C 239.869 203.710, 247.871 202.699, 246.500 201.965 C 245.950 201.670, 243.475 201.670, 241 201.965 M 274 201.378 C 274 201.585, 274.788 202.373, 275.750 203.128 C 277.336 204.371, 277.371 204.336, 276.128 202.750 C 274.821 201.084, 274 200.555, 274 201.378 M 278 201.378 C 278 201.585, 278.788 202.373, 279.750 203.128 C 281.336 204.371, 281.371 204.336, 280.128 202.750 C 278.821 201.084, 278 200.555, 278 201.378 M 343 203 C 343.589 204.100, 344.295 205, 344.570 205 C 344.845 205, 344.589 204.100, 344 203 C 343.411 201.900, 342.705 201, 342.430 201 C 342.155 201, 342.411 201.900, 343 203 M 233.733 203.124 C 234.412 203.808, 235.219 204.115, 235.526 203.807 C 235.834 203.499, 235.279 202.940, 234.293 202.564 C 232.868 202.022, 232.753 202.136, 233.733 203.124 M 270 202.393 C 270 202.609, 270.698 203.054, 271.552 203.382 C 272.442 203.723, 272.843 203.555, 272.493 202.989 C 271.906 202.038, 270 201.583, 270 202.393 M 227.250 203.689 C 228.213 203.941, 229.787 203.941, 230.750 203.689 C 231.713 203.438, 230.925 203.232, 229 203.232 C 227.075 203.232, 226.287 203.438, 227.250 203.689 M 258.250 235.732 C 253.176 236.189, 252.530 238, 257.441 238 C 259.334 238, 261.190 238.498, 261.566 239.107 C 262.048 239.886, 262.486 239.831, 263.049 238.921 C 263.695 237.875, 264.196 237.897, 265.674 239.034 C 266.678 239.807, 266.409 239.216, 265.076 237.720 C 263.742 236.224, 262.617 235.079, 262.576 235.175 C 262.534 235.271, 260.587 235.522, 258.250 235.732 M 340.504 236.373 C 338.696 237.696, 338.710 237.773, 340.888 238.465 C 342.133 238.860, 343.417 238.917, 343.742 238.591 C 344.067 238.266, 343.528 238, 342.544 238 C 341.067 238, 340.972 237.738, 342 236.500 C 343.552 234.629, 342.958 234.579, 340.504 236.373 M 238.335 236.668 C 239.263 237.596, 252.001 237.673, 252 236.750 C 252 236.338, 248.775 236, 244.833 236 C 240.892 236, 237.967 236.301, 238.335 236.668 M 220.815 240.864 C 222.032 241.636, 227 241.250, 227 240.383 C 227 240.173, 225.313 240.007, 223.250 240.015 C 220.860 240.025, 219.977 240.333, 220.815 240.864 M 343.507 241.989 C 343.157 242.555, 343.558 242.723, 344.448 242.382 C 346.180 241.717, 346.497 241, 345.059 241 C 344.541 241, 343.843 241.445, 343.507 241.989 M 168.813 242.683 C 169.534 242.972, 170.397 242.936, 170.729 242.604 C 171.061 242.272, 170.471 242.036, 169.417 242.079 C 168.252 242.127, 168.015 242.364, 168.813 242.683 M 164.083 243.365 C 164.313 243.565, 165.625 244.265, 167 244.920 C 169.357 246.042, 169.389 246.022, 167.559 244.555 C 165.966 243.279, 162.711 242.164, 164.083 243.365 M 163.269 247.693 C 164.242 247.947, 165.592 247.930, 166.269 247.656 C 166.946 247.382, 166.150 247.175, 164.500 247.195 C 162.850 247.215, 162.296 247.439, 163.269 247.693 M 234.269 247.693 C 235.242 247.947, 236.592 247.930, 237.269 247.656 C 237.946 247.382, 237.150 247.175, 235.500 247.195 C 233.850 247.215, 233.296 247.439, 234.269 247.693 M 230 248.703 C 230 249.857, 232.838 252.523, 233.395 251.893 C 233.586 251.677, 232.900 250.634, 231.871 249.575 C 230.842 248.516, 230 248.124, 230 248.703 M 348.441 250.555 C 346.611 252.022, 346.643 252.042, 349 250.920 C 352.061 249.462, 352.628 249, 351.358 249 C 350.821 249, 349.509 249.700, 348.441 250.555 M 372 252 C 372.589 253.100, 373.295 254, 373.570 254 C 373.845 254, 373.589 253.100, 373 252 C 372.411 250.900, 371.705 250, 371.430 250 C 371.155 250, 371.411 250.900, 372 252 M 351.507 254.989 C 351.157 255.555, 351.558 255.723, 352.448 255.382 C 354.180 254.717, 354.497 254, 353.059 254 C 352.541 254, 351.843 254.445, 351.507 254.989 M 156.083 255.356 C 156.313 255.552, 158.075 256.002, 160 256.355 C 162.462 256.807, 163.055 256.706, 162 256.014 C 160.644 255.125, 155.092 254.508, 156.083 255.356 M 352.500 259 C 351.718 260.266, 353.042 260.266, 355 259 C 356.293 258.165, 356.266 258.029, 354.809 258.015 C 353.879 258.007, 352.840 258.450, 352.500 259 M 154.250 262.689 C 155.213 262.941, 156.787 262.941, 157.750 262.689 C 158.713 262.438, 157.925 262.232, 156 262.232 C 154.075 262.232, 153.287 262.438, 154.250 262.689 M 357.441 266.555 C 355.611 268.022, 355.643 268.042, 358 266.920 C 361.061 265.462, 361.628 265, 360.358 265 C 359.821 265, 358.509 265.700, 357.441 266.555 M 149 269.393 C 149 269.609, 149.698 270.054, 150.552 270.382 C 151.442 270.723, 151.843 270.555, 151.493 269.989 C 150.906 269.038, 149 268.583, 149 269.393 M 360.507 269.989 C 360.157 270.555, 360.558 270.723, 361.448 270.382 C 363.180 269.717, 363.497 269, 362.059 269 C 361.541 269, 360.843 269.445, 360.507 269.989 M 362 275 C 361.099 275.582, 360.975 275.975, 361.691 275.985 C 362.346 275.993, 363.160 275.550, 363.500 275 C 364.267 273.758, 363.921 273.758, 362 275 M 143 277.449 C 143 277.724, 144.350 278.647, 146 279.500 C 147.650 280.353, 149 280.826, 149 280.551 C 149 280.276, 147.650 279.353, 146 278.500 C 144.350 277.647, 143 277.174, 143 277.449 M 364.500 279 C 362.870 279.701, 362.812 279.872, 364.191 279.930 C 365.121 279.968, 366.160 279.550, 366.500 279 C 367.211 277.850, 367.176 277.850, 364.500 279 M 141 281.350 C 141 281.581, 142.180 282.543, 143.623 283.489 C 145.066 284.434, 145.941 284.713, 145.567 284.109 C 144.854 282.955, 141 280.626, 141 281.350 M 367 284 C 366.099 284.582, 365.975 284.975, 366.691 284.985 C 367.346 284.993, 368.160 284.550, 368.500 284 C 369.267 282.758, 368.921 282.758, 367 284 M 116 291 C 115.411 292.100, 115.155 293, 115.430 293 C 115.705 293, 116.411 292.100, 117 291 C 117.589 289.900, 117.845 289, 117.570 289 C 117.295 289, 116.589 289.900, 116 291 M 370 290 C 369.099 290.582, 368.975 290.975, 369.691 290.985 C 370.346 290.993, 371.160 290.550, 371.500 290 C 372.267 288.758, 371.921 288.758, 370 290 M 395 291 C 395.589 292.100, 396.295 293, 396.570 293 C 396.845 293, 396.589 292.100, 396 291 C 395.411 289.900, 394.705 289, 394.430 289 C 394.155 289, 394.411 289.900, 395 291 M 139.813 290.683 C 140.534 290.972, 141.397 290.936, 141.729 290.604 C 142.061 290.272, 141.471 290.036, 140.417 290.079 C 139.252 290.127, 139.015 290.364, 139.813 290.683 M 136.500 293 C 137.600 293.473, 139.175 293.859, 140 293.859 C 140.945 293.859, 140.761 293.542, 139.500 293 C 138.400 292.527, 136.825 292.141, 136 292.141 C 135.055 292.141, 135.239 292.458, 136.500 293 M 113 296 C 112.411 297.100, 112.155 298, 112.430 298 C 112.705 298, 113.411 297.100, 114 296 C 114.589 294.900, 114.845 294, 114.570 294 C 114.295 294, 113.589 294.900, 113 296 M 398 296 C 398.589 297.100, 399.295 298, 399.570 298 C 399.845 298, 399.589 297.100, 399 296 C 398.411 294.900, 397.705 294, 397.430 294 C 397.155 294, 397.411 294.900, 398 296 M 135.813 298.683 C 136.534 298.972, 137.397 298.936, 137.729 298.604 C 138.061 298.272, 137.471 298.036, 136.417 298.079 C 135.252 298.127, 135.015 298.364, 135.813 298.683 M 132.083 299.283 C 132.313 299.439, 133.400 300.226, 134.500 301.033 C 136.350 302.390, 136.397 302.369, 135.128 300.750 C 134.373 299.788, 133.285 299, 132.711 299 C 132.137 299, 131.854 299.127, 132.083 299.283 M 377 301 C 376.099 301.582, 375.975 301.975, 376.691 301.985 C 377.346 301.993, 378.160 301.550, 378.500 301 C 379.267 299.758, 378.921 299.758, 377 301 M 128 303.393 C 128 303.609, 128.698 304.054, 129.552 304.382 C 130.442 304.723, 130.843 304.555, 130.493 303.989 C 129.906 303.038, 128 302.583, 128 303.393 M 381.507 303.989 C 381.157 304.555, 381.558 304.723, 382.448 304.382 C 384.180 303.717, 384.497 303, 383.059 303 C 382.541 303, 381.843 303.445, 381.507 303.989 M 103 313 C 102.411 314.100, 102.155 315, 102.430 315 C 102.705 315, 103.411 314.100, 104 313 C 104.589 311.900, 104.845 311, 104.570 311 C 104.295 311, 103.589 311.900, 103 313 M 408 313 C 408.589 314.100, 409.295 315, 409.570 315 C 409.845 315, 409.589 314.100, 409 313 C 408.411 311.900, 407.705 311, 407.430 311 C 407.155 311, 407.411 311.900, 408 313 M 241.702 312.631 C 241.355 312.979, 238.805 313.212, 236.035 313.149 C 231.923 313.057, 230.979 313.354, 230.885 314.768 C 230.821 315.721, 230.686 316.950, 230.585 317.500 C 229.465 323.573, 228.408 326.065, 225.979 328.358 C 224.404 329.844, 222.855 331.882, 222.536 332.887 C 222.217 333.892, 220.953 335.194, 219.728 335.781 C 217.803 336.703, 218.006 336.792, 221.220 336.434 C 223.266 336.206, 225.291 335.962, 225.720 335.892 C 227.910 335.531, 230 336.124, 230 337.107 C 230 337.718, 229.272 337.935, 228.373 337.590 C 227.479 337.246, 226.202 337.417, 225.537 337.969 C 224.872 338.522, 221.775 339.155, 218.655 339.377 C 215.536 339.599, 211.923 340.476, 210.626 341.325 C 208.793 342.526, 207.968 342.606, 206.911 341.685 C 206.164 341.033, 206.329 341.435, 207.277 342.579 C 209.301 345.020, 209.754 348.154, 207.800 346.200 C 205.694 344.094, 204.842 344.915, 206.872 347.093 C 209.099 349.484, 215 350.365, 215 348.307 C 215 347.302, 217.844 347, 227.327 347 L 239.654 347 240.860 340.457 C 241.523 336.859, 241.799 333.484, 241.474 332.957 C 241.148 332.431, 239.334 332, 237.441 332 C 235.178 332, 234 331.526, 234 330.617 C 234 329.856, 233.100 328.998, 232 328.710 C 230.900 328.423, 230 327.643, 230 326.977 C 230 326.259, 230.814 325.979, 232 326.290 C 233.100 326.577, 234 326.389, 234 325.871 C 234 325.325, 234.841 325.380, 236 326 C 237.434 326.767, 238 326.760, 238 325.976 C 238 325.374, 238.450 325.160, 239 325.500 C 239.550 325.840, 240 325.668, 240 325.118 C 240 323.588, 238.223 322.831, 237.776 324.171 C 237.559 324.822, 236.846 325.023, 236.191 324.618 C 234.473 323.556, 234.723 321.956, 236.500 322.638 C 237.325 322.955, 238 322.700, 238 322.072 C 238 321.276, 238.554 321.226, 239.824 321.906 C 241.394 322.746, 241.881 322.231, 243.329 318.191 C 244.253 315.611, 245.008 313.163, 245.005 312.750 C 244.999 311.839, 242.581 311.753, 241.702 312.631 M 388 315.059 C 388 315.641, 388.450 315.840, 389 315.500 C 389.550 315.160, 390 314.684, 390 314.441 C 390 314.198, 389.550 314, 389 314 C 388.450 314, 388 314.477, 388 315.059 M 389.441 318.555 C 387.577 320.049, 387.589 320.067, 389.750 319.020 C 390.988 318.420, 392 317.720, 392 317.465 C 392 316.700, 391.481 316.921, 389.441 318.555 M 119.589 318.856 C 119.298 319.326, 120.172 319.499, 121.530 319.239 C 122.889 318.979, 124 318.594, 124 318.383 C 124 317.610, 120.101 318.027, 119.589 318.856 M 96.500 324 C 95.647 325.650, 95.174 327, 95.449 327 C 95.724 327, 96.647 325.650, 97.500 324 C 98.353 322.350, 98.826 321, 98.551 321 C 98.276 321, 97.353 322.350, 96.500 324 M 414.500 324 C 415.353 325.650, 416.276 327, 416.551 327 C 416.826 327, 416.353 325.650, 415.500 324 C 414.647 322.350, 413.724 321, 413.449 321 C 413.174 321, 413.647 322.350, 414.500 324 M 117.750 323.662 C 118.438 323.940, 119.563 323.940, 120.250 323.662 C 120.938 323.385, 120.375 323.158, 119 323.158 C 117.625 323.158, 117.063 323.385, 117.750 323.662 M 249 326.893 C 249 327.384, 249.739 328.069, 250.641 328.416 C 252.014 328.943, 252.076 328.796, 251.019 327.523 C 249.579 325.788, 249 325.607, 249 326.893 M 289 328.929 C 289 329.518, 288.298 330, 287.441 330 C 286.584 330, 286.174 330.472, 286.530 331.049 C 286.974 331.766, 287.568 331.774, 288.413 331.072 C 289.266 330.365, 290.012 330.412, 290.824 331.224 C 291.471 331.871, 292 332.053, 292 331.629 C 292 331.204, 291.325 330.182, 290.500 329.357 C 289.675 328.532, 289 328.339, 289 328.929 M 90 335 C 89.411 336.100, 89.155 337, 89.430 337 C 89.705 337, 90.411 336.100, 91 335 C 91.589 333.900, 91.845 333, 91.570 333 C 91.295 333, 90.589 333.900, 90 335 M 421 335 C 421.589 336.100, 422.295 337, 422.570 337 C 422.845 337, 422.589 336.100, 422 335 C 421.411 333.900, 420.705 333, 420.430 333 C 420.155 333, 420.411 333.900, 421 335 M 110 334.430 C 110 334.705, 110.900 335.411, 112 336 C 113.100 336.589, 114 336.845, 114 336.570 C 114 336.295, 113.100 335.589, 112 335 C 110.900 334.411, 110 334.155, 110 334.430 M 87 340 C 86.411 341.100, 86.155 342, 86.430 342 C 86.705 342, 87.411 341.100, 88 340 C 88.589 338.900, 88.845 338, 88.570 338 C 88.295 338, 87.589 338.900, 87 340 M 424 340 C 424.589 341.100, 425.295 342, 425.570 342 C 425.845 342, 425.589 341.100, 425 340 C 424.411 338.900, 423.705 338, 423.430 338 C 423.155 338, 423.411 338.900, 424 340 M 430.500 351 C 431.353 352.650, 432.276 354, 432.551 354 C 432.826 354, 432.353 352.650, 431.500 351 C 430.647 349.350, 429.724 348, 429.449 348 C 429.174 348, 429.647 349.350, 430.500 351 M 239.856 349.990 C 238.402 350.419, 232.777 350.807, 227.356 350.851 C 213.724 350.963, 208.330 351.673, 202.378 354.140 C 198.407 355.785, 197.362 356.668, 197.728 358.067 C 198.151 359.686, 193.687 366.973, 191.744 367.835 C 191.328 368.020, 191.245 368.587, 191.559 369.095 C 191.873 369.603, 191.201 371.201, 190.065 372.645 C 188.929 374.088, 188 376.334, 188 377.635 C 188 379.972, 186.479 380.933, 185.833 379.003 C 185.650 378.454, 184.175 379.144, 182.556 380.536 C 180.937 381.927, 179.025 382.840, 178.308 382.565 C 177.590 382.289, 175.989 382.479, 174.751 382.988 C 173.253 383.603, 178.251 383.899, 189.694 383.873 C 201.878 383.846, 207.003 383.494, 207.282 382.667 C 207.567 381.820, 208.131 381.877, 209.337 382.872 C 210.768 384.054, 211 384.019, 211 382.622 C 211 381.730, 211.563 380.993, 212.250 380.985 C 213.118 380.974, 213.061 380.692, 212.064 380.061 C 211.025 379.403, 210.920 378.786, 211.683 377.826 C 212.262 377.097, 213.301 373.439, 213.991 369.698 C 215.274 362.742, 216.852 360.088, 219.821 359.886 C 225.387 359.508, 227.287 358.868, 228.966 356.807 L 230.843 354.500 233.922 357.437 C 235.615 359.052, 237 359.826, 237 359.156 C 237 358.486, 236.325 357.678, 235.500 357.362 C 233.568 356.620, 233.555 355, 235.481 355 C 236.295 355, 237.228 356.062, 237.554 357.360 C 237.977 359.046, 238.768 359.654, 240.323 359.488 C 241.520 359.360, 243.118 359.198, 243.872 359.128 C 244.921 359.030, 244.976 358.676, 244.105 357.627 C 243.478 356.871, 243.234 355.554, 243.562 354.700 C 244.008 353.536, 243.664 353.275, 242.192 353.660 C 241.110 353.943, 239.887 353.627, 239.474 352.957 C 238.990 352.175, 239.217 351.908, 240.111 352.209 C 240.875 352.467, 242.905 352.093, 244.623 351.378 C 247.581 350.148, 249 350.382, 249 352.099 C 249 352.521, 248.100 353.151, 247 353.500 C 244.293 354.359, 244.476 355.470, 247.352 355.635 C 249.290 355.746, 249.717 355.264, 249.784 352.885 C 249.829 351.298, 249.559 349.970, 249.183 349.933 C 248.807 349.895, 247.150 349.718, 245.500 349.537 C 243.850 349.357, 241.310 349.561, 239.856 349.990 M 80 352 C 79.411 353.100, 79.155 354, 79.430 354 C 79.705 354, 80.411 353.100, 81 352 C 81.589 350.900, 81.845 350, 81.570 350 C 81.295 350, 80.589 350.900, 80 352 M 70.500 368 C 69.647 369.650, 69.174 371, 69.449 371 C 69.724 371, 70.647 369.650, 71.500 368 C 72.353 366.350, 72.826 365, 72.551 365 C 72.276 365, 71.353 366.350, 70.500 368 M 440.500 368 C 441.353 369.650, 442.276 371, 442.551 371 C 442.826 371, 442.353 369.650, 441.500 368 C 440.647 366.350, 439.724 365, 439.449 365 C 439.174 365, 439.647 366.350, 440.500 368 M 62.771 381.250 C 60.583 384.623, 58.621 388.640, 59.718 387.500 C 61.120 386.043, 65.245 379, 64.697 379 C 64.440 379, 63.573 380.012, 62.771 381.250 M 450.500 385 C 451.353 386.650, 452.276 388, 452.551 388 C 452.826 388, 452.353 386.650, 451.500 385 C 450.647 383.350, 449.724 382, 449.449 382 C 449.174 382, 449.647 383.350, 450.500 385 M 54 396 C 53.411 397.100, 53.155 398, 53.430 398 C 53.705 398, 54.411 397.100, 55 396 C 55.589 394.900, 55.845 394, 55.570 394 C 55.295 394, 54.589 394.900, 54 396 M 457 396 C 457.589 397.100, 458.295 398, 458.570 398 C 458.845 398, 458.589 397.100, 458 396 C 457.411 394.900, 456.705 394, 456.430 394 C 456.155 394, 456.411 394.900, 457 396 M 289.157 396.997 C 284.674 398.054, 283.600 399.331, 283.600 403.603 C 283.600 406.653, 284.399 407.957, 288.800 412.089 C 294.065 417.033, 295.289 420.311, 292.800 422.800 C 290.577 425.023, 286.069 424.246, 284.781 421.418 C 283.606 418.840, 283.603 418.840, 282.787 421.047 C 281.591 424.280, 283.566 426, 288.476 426 C 293.949 426, 298 422.553, 298 417.897 C 298 415.333, 296.910 413.643, 292.500 409.372 C 286.734 403.787, 285.693 400.770, 288.934 399.035 C 291.715 397.547, 292.670 397.730, 294.961 400.189 L 297 402.377 297 399.689 C 297 398.210, 296.587 397, 296.082 397 C 295.577 397, 294.564 396.822, 293.832 396.604 C 293.099 396.387, 290.996 396.563, 289.157 396.997 M 338.728 396.605 C 338.328 397.006, 337.986 403.221, 337.968 410.417 C 337.930 425.990, 337.502 425.873, 330.911 408.493 C 328.514 402.172, 326.049 397, 325.433 397 C 324.817 397, 322.105 402.962, 319.407 410.250 C 314.653 423.087, 314.404 423.509, 311.415 423.801 C 306.394 424.291, 305.789 422.590, 306.165 409.044 L 306.500 396.997 303.815 396.999 L 301.130 397 301.677 405.750 C 301.977 410.563, 301.794 416.808, 301.270 419.629 L 300.317 424.757 307.832 425.240 C 317.344 425.850, 319 425.419, 319 422.334 C 319 420.996, 319.700 418.546, 320.556 416.891 C 321.862 414.367, 322.623 413.931, 325.277 414.191 C 328.079 414.465, 328.674 415.102, 330.464 419.750 L 332.486 425 338.493 424.921 C 341.797 424.878, 343.938 424.615, 343.250 424.338 C 342.375 423.985, 342 421.030, 342 414.494 L 342 405.156 352.423 415.821 C 358.156 421.687, 363.070 426.263, 363.343 425.990 C 363.617 425.717, 363.989 419.082, 364.170 411.245 L 364.500 396.997 361.820 396.999 C 359.273 397, 359.186 397.161, 360.070 400.243 C 360.581 402.027, 360.979 406.865, 360.952 410.993 L 360.905 418.500 350.181 407.188 C 344.283 400.967, 339.129 396.204, 338.728 396.605 M 120.500 410.900 L 120.500 424.998 123.500 425.001 L 126.500 425.004 126.161 419.002 C 125.704 410.896, 127.123 411.112, 134.368 420.250 C 138.068 424.917, 138.233 425, 143.817 425.002 L 149.500 425.003 149.500 417.752 L 149.500 410.500 156.500 410.500 L 163.500 410.500 163.808 414.210 C 163.977 416.251, 163.676 419.513, 163.139 421.460 L 162.161 425 166.203 425 C 169.623 425, 170.059 424.777, 169.040 423.548 C 168.199 422.535, 167.935 418.305, 168.167 409.547 L 168.500 396.997 165.741 396.999 C 163.019 397, 162.985 397.077, 163.241 402.750 L 163.500 408.500 156.250 408.794 L 149 409.088 149 403.044 C 149 397.118, 148.947 397, 146.250 396.999 L 143.500 396.997 143.829 409.999 C 144.037 418.172, 143.790 423, 143.164 423 C 141.920 423, 134 414.088, 134 412.688 C 134 412.121, 134.670 410.918, 135.488 410.013 C 138.072 407.158, 138.390 402.703, 136.203 400.002 C 134.546 397.955, 133.173 397.519, 127.370 397.190 L 120.500 396.801 120.500 410.900 M 177.841 398.524 C 173.799 400.720, 171 405.994, 171 411.418 C 171 417.617, 173.179 421.540, 177.981 423.990 C 188.943 429.582, 201.010 422.767, 200.982 411 C 200.968 405.329, 199.381 402.173, 195.088 399.280 C 191.091 396.586, 182.132 396.194, 177.841 398.524 M 203.500 410.958 L 203.500 424.916 208.657 425.562 C 216.392 426.530, 221.727 425.277, 225.811 421.534 C 228.969 418.640, 229.399 417.633, 229.791 412.211 C 230.573 401.402, 225.217 397.001, 211.282 396.999 L 203.500 396.999 203.500 410.958 M 232.500 410.884 L 232.500 424.770 237.848 425.323 C 240.790 425.627, 244.165 425.514, 245.348 425.073 C 246.532 424.631, 248.400 424.627, 249.500 425.064 C 253.138 426.511, 257.686 426.035, 260.365 423.927 C 262.417 422.313, 263 420.981, 263 417.905 C 263 414.428, 262.339 413.315, 257.483 408.612 C 252.678 403.958, 252.078 402.960, 252.841 400.884 C 254.017 397.680, 258.429 397.112, 260.193 399.938 C 261.922 402.706, 263 402.538, 263 399.500 C 263 397.182, 262.652 397, 258.223 397 C 251.989 397, 249 399.075, 249 403.403 C 249 406.046, 250.081 407.790, 254.500 412.281 C 260.269 418.143, 260.827 419.486, 258.701 422.395 C 256.870 424.899, 251.803 424.190, 250.513 421.250 C 249.463 418.856, 248 418.225, 248 420.167 C 248 420.808, 247.703 421.036, 247.340 420.673 C 246.977 420.310, 246.033 420.936, 245.243 422.063 C 244.277 423.442, 242.937 424.014, 241.153 423.807 C 238.635 423.516, 238.485 423.181, 238.202 417.250 C 237.910 411.122, 237.955 411, 240.484 411 C 241.902 411, 243.322 411.675, 243.638 412.500 C 244.605 415.018, 246 414.173, 246 411.070 C 246 408.352, 245.801 408.196, 243.250 408.916 C 238.884 410.148, 238 409.306, 238 403.917 C 238 399.161, 238.095 399, 240.893 399 C 242.709 399, 244.052 399.651, 244.500 400.750 C 245.156 402.356, 245.282 402.336, 246.037 400.500 C 247.428 397.118, 247.215 397, 239.750 396.999 L 232.500 396.999 232.500 410.884 M 273.808 410.154 C 274.042 420.168, 273.803 423.509, 272.808 424.140 C 271.991 424.658, 273.046 424.975, 275.613 424.985 L 279.727 425 278.752 419.750 C 278.216 416.863, 278.023 410.563, 278.323 405.750 L 278.870 397 276.185 396.998 L 273.500 396.996 273.808 410.154 M 369.832 408.912 C 370.033 416.150, 369.742 421.614, 369.089 422.834 C 368.077 424.724, 368.401 424.884, 374.610 425.549 C 388.082 426.991, 396 421.606, 396 411 C 396 401.518, 389.941 397.061, 377 397.021 L 369.500 396.997 369.832 408.912 M 127.243 398.850 C 126.651 399.215, 126.041 402.211, 125.886 405.507 C 125.625 411.061, 125.769 411.524, 127.857 411.827 C 131.104 412.298, 133 410.265, 133 406.312 C 133 400.871, 130.085 397.093, 127.243 398.850 M 180.277 399.973 C 177.304 401.785, 176.817 402.736, 175.540 409.225 C 174.858 412.688, 177.272 419.051, 180.203 421.517 C 184.378 425.030, 189.291 424.862, 193.077 421.077 C 195.615 418.539, 196 417.413, 196 412.527 C 196 400.657, 188.706 394.833, 180.277 399.973 M 74 400.059 C 74 400.641, 74.450 400.840, 75 400.500 C 75.550 400.160, 76 399.684, 76 399.441 C 76 399.198, 75.550 399, 75 399 C 74.450 399, 74 399.477, 74 400.059 M 208.750 399.570 C 207.651 400.688, 207.834 418.433, 208.975 421.435 C 209.820 423.658, 210.544 424, 214.399 424 C 225.450 424, 230.011 409.996, 221.549 402.046 C 219.024 399.674, 210.305 397.987, 208.750 399.570 M 374.667 399.667 C 373.442 400.892, 373.917 421.517, 375.200 422.800 C 377.125 424.725, 384.401 424.259, 387.236 422.029 C 392.912 417.564, 392.511 406.017, 386.521 401.448 C 383.423 399.086, 376.316 398.018, 374.667 399.667 M 438.079 401.583 C 438.127 402.748, 438.364 402.985, 438.683 402.188 C 438.972 401.466, 438.936 400.603, 438.604 400.271 C 438.272 399.939, 438.036 400.529, 438.079 401.583 M 84.567 406.433 C 83.705 407.845, 82.315 410.125, 81.477 411.500 L 79.954 414 86.541 414 L 93.128 414 90.848 409.943 C 87.506 403.997, 86.423 403.392, 84.567 406.433 M 421.542 408.338 C 420.144 410.724, 419 412.974, 419 413.338 C 419 413.702, 421.726 414, 425.058 414 L 431.115 414 428.308 409.001 C 426.763 406.252, 425.181 404.002, 424.792 404.001 C 424.403 404, 422.940 405.952, 421.542 408.338 M 323.613 407.407 C 323.280 408.731, 322.733 410.531, 322.397 411.407 C 321.937 412.607, 322.414 413, 324.334 413 C 327.700 413, 328.092 412.123, 326.459 408.240 C 324.830 404.365, 324.407 404.242, 323.613 407.407 M 47 408 C 46.411 409.100, 46.155 410, 46.430 410 C 46.705 410, 47.411 409.100, 48 408 C 48.589 406.900, 48.845 406, 48.570 406 C 48.295 406, 47.589 406.900, 47 408 M 464 408 C 464.589 409.100, 465.295 410, 465.570 410 C 465.845 410, 465.589 409.100, 465 408 C 464.411 406.900, 463.705 406, 463.430 406 C 463.155 406, 463.411 406.900, 464 408 M 445.813 412.683 C 446.534 412.972, 447.397 412.936, 447.729 412.604 C 448.061 412.272, 447.471 412.036, 446.417 412.079 C 445.252 412.127, 445.015 412.364, 445.813 412.683 M 471 420 C 471.589 421.100, 472.295 422, 472.570 422 C 472.845 422, 472.589 421.100, 472 420 C 471.411 418.900, 470.705 418, 470.430 418 C 470.155 418, 470.411 418.900, 471 420 M 57.216 422.184 C 56.547 422.853, 56 423.992, 56 424.716 C 56 425.778, 61.342 425.980, 83.750 425.766 C 110.745 425.507, 111.500 425.446, 111.500 423.500 C 111.500 421.557, 110.745 421.492, 84.966 421.234 C 65.167 421.036, 58.123 421.277, 57.216 422.184 M 399.380 422.452 C 399.074 423.251, 399.114 424.376, 399.470 424.952 C 400.148 426.049, 456 426.525, 456 425.434 C 456 425.123, 455.534 423.998, 454.965 422.934 C 453.981 421.095, 452.600 421, 426.933 421 C 404.255 421, 399.848 421.232, 399.380 422.452 M 34 430 C 33.411 431.100, 33.155 432, 33.430 432 C 33.705 432, 34.411 431.100, 35 430 C 35.589 428.900, 35.845 428, 35.570 428 C 35.295 428, 34.589 428.900, 34 430 M 477 430 C 477.589 431.100, 478.295 432, 478.570 432 C 478.845 432, 478.589 431.100, 478 430 C 477.411 428.900, 476.705 428, 476.430 428 C 476.155 428, 476.411 428.900, 477 430 M 144.750 442.750 C 205.937 442.892, 306.062 442.892, 367.250 442.750 C 428.437 442.608, 378.375 442.491, 256 442.491 C 133.625 442.491, 83.562 442.608, 144.750 442.750\" fill=\"#07090a\" fill-rule=\"evenodd\"/>\n  <path data-emblem-knockout d=\"M 237.383 86.769 C 227.418 103.671, 213.303 127.625, 206.016 140 C 198.728 152.375, 191.761 164.075, 190.532 166 C 189.303 167.925, 184.103 176.700, 178.976 185.500 C 173.848 194.300, 164.855 209.600, 158.991 219.500 C 145.174 242.827, 125.966 275.399, 123.018 280.500 C 121.747 282.700, 114.851 294.400, 107.693 306.500 C 100.536 318.600, 86.593 342.225, 76.709 359 C 66.825 375.775, 52.881 399.400, 45.722 411.500 C 27.127 442.931, 27.633 441.999, 29.165 442.005 C 67.412 442.163, 483.394 441.939, 483.570 441.761 C 483.711 441.617, 482.235 438.800, 480.288 435.500 C 478.341 432.200, 471.467 420.500, 465.012 409.500 C 450.955 385.544, 422.370 337.052, 404 306 C 396.679 293.625, 389.231 280.952, 387.449 277.838 C 385.666 274.724, 379.717 264.599, 374.228 255.338 C 362.449 235.466, 339.219 196.180, 323.472 169.500 C 317.304 159.050, 305.325 138.800, 296.851 124.500 C 288.377 110.200, 275.832 88.950, 268.972 77.279 C 262.112 65.607, 256.275 56.053, 256 56.047 C 255.725 56.042, 247.347 69.866, 237.383 86.769 M 252.585 90.626 C 251.163 93.170, 250 95.645, 250 96.126 C 250 96.607, 252.700 97, 256 97 C 259.602 97, 262 96.572, 262 95.928 C 262 94.348, 256.947 86, 255.990 86 C 255.540 86, 254.008 88.082, 252.585 90.626 M 245.813 113.683 C 246.534 113.972, 247.397 113.936, 247.729 113.604 C 248.061 113.272, 247.471 113.036, 246.417 113.079 C 245.252 113.127, 245.015 113.364, 245.813 113.683 M 285.813 143.683 C 286.534 143.972, 287.397 143.936, 287.729 143.604 C 288.061 143.272, 287.471 143.036, 286.417 143.079 C 285.252 143.127, 285.015 143.364, 285.813 143.683 M 224.813 145.683 C 225.534 145.972, 226.397 145.936, 226.729 145.604 C 227.061 145.272, 226.471 145.036, 225.417 145.079 C 224.252 145.127, 224.015 145.364, 224.813 145.683 M 218.813 150.683 C 219.534 150.972, 220.397 150.936, 220.729 150.604 C 221.061 150.272, 220.471 150.036, 219.417 150.079 C 218.252 150.127, 218.015 150.364, 218.813 150.683 M 288.813 152.683 C 289.534 152.972, 290.397 152.936, 290.729 152.604 C 291.061 152.272, 290.471 152.036, 289.417 152.079 C 288.252 152.127, 288.015 152.364, 288.813 152.683 M 218.813 153.683 C 219.534 153.972, 220.397 153.936, 220.729 153.604 C 221.061 153.272, 220.471 153.036, 219.417 153.079 C 218.252 153.127, 218.015 153.364, 218.813 153.683 M 293.813 154.683 C 294.534 154.972, 295.397 154.936, 295.729 154.604 C 296.061 154.272, 295.471 154.036, 294.417 154.079 C 293.252 154.127, 293.015 154.364, 293.813 154.683 M 244.979 167.215 C 244.640 171.758, 242.104 192.216, 241.853 192.434 C 241.659 192.602, 238.304 193.044, 234.397 193.416 L 227.295 194.092 226.750 181.482 C 226.451 174.547, 225.952 168.618, 225.641 168.308 C 224.968 167.635, 209.797 169.889, 208.150 170.907 C 206.946 171.652, 206.004 176.004, 203.477 192.500 C 202.635 198, 201.012 208.575, 199.872 216 C 198.731 223.425, 197.568 232.537, 197.286 236.250 L 196.774 243 200.387 243 C 203.522 243, 204 243.314, 204 245.371 C 204 247.479, 204.583 247.817, 209.250 248.419 C 212.137 248.791, 216.188 249.357, 218.250 249.676 C 221.285 250.145, 222 249.945, 222 248.628 C 222 247.548, 222.862 247, 224.559 247 C 226.017 247, 226.851 246.568, 226.498 245.996 C 226.157 245.444, 224.829 245.256, 223.548 245.577 C 222.267 245.899, 220.918 245.676, 220.550 245.081 C 219.856 243.958, 221.562 243.657, 228.235 243.724 C 230.290 243.744, 231.772 243.440, 231.529 243.047 C 231.005 242.199, 230.032 242.282, 247.500 241.672 C 255.200 241.403, 260.600 241.525, 259.501 241.942 C 258.401 242.359, 254.590 242.795, 251.031 242.910 C 247.473 243.026, 241.523 243.759, 237.810 244.540 C 234.097 245.321, 230.297 245.668, 229.366 245.310 C 228.272 244.890, 227.912 245.049, 228.350 245.758 C 228.739 246.386, 228.061 247.148, 226.765 247.540 C 224.150 248.329, 220 252.687, 220 254.643 C 220 256.030, 197.333 347.969, 196.377 350.460 C 195.900 351.703, 191.807 352.905, 179.274 355.485 C 176.645 356.026, 174.648 358.032, 168.486 366.324 C 155.420 383.909, 156.745 382.630, 150.825 383.376 C 140.257 384.708, 119.119 388.548, 118.401 389.266 C 117.997 389.670, 179.054 389.959, 254.083 389.910 C 332.364 389.858, 389.222 389.452, 387.500 388.957 C 384.541 388.106, 364.079 384.326, 356.712 383.270 C 353.216 382.768, 352.155 381.704, 342.914 369.434 L 332.903 356.142 322.983 353.848 L 313.062 351.555 310.975 342.527 C 309.827 337.562, 307.366 327.200, 305.507 319.500 C 303.647 311.800, 300.474 298.300, 298.456 289.500 C 296.437 280.700, 293.709 269.143, 292.393 263.819 C 291.077 258.494, 290 253.242, 290 252.148 C 290 249.990, 291.302 249.559, 301.250 248.425 C 306.408 247.837, 307 247.531, 307 245.451 C 307 243.665, 307.632 243.060, 309.750 242.816 C 312.382 242.514, 312.499 242.264, 312.475 237 C 312.462 233.975, 311.636 225.875, 310.641 219 C 309.646 212.125, 307.710 198.628, 306.338 189.006 C 304.967 179.384, 303.721 171.388, 303.569 171.236 C 302.800 170.467, 285.388 168.391, 284.709 168.988 C 284.273 169.370, 283.641 175.188, 283.302 181.917 C 282.709 193.711, 282.612 194.131, 280.594 193.589 C 279.442 193.280, 275.978 193.021, 272.895 193.014 L 267.290 193 266.395 180.250 L 265.500 167.500 255.250 167.215 C 249.613 167.058, 244.990 167.058, 244.979 167.215 M 241 201.965 C 238.525 202.259, 237.175 202.742, 238 203.039 C 239.869 203.710, 247.871 202.699, 246.500 201.965 C 245.950 201.670, 243.475 201.670, 241 201.965 M 274 201.378 C 274 201.585, 274.788 202.373, 275.750 203.128 C 277.336 204.371, 277.371 204.336, 276.128 202.750 C 274.821 201.084, 274 200.555, 274 201.378 M 278 201.378 C 278 201.585, 278.788 202.373, 279.750 203.128 C 281.336 204.371, 281.371 204.336, 280.128 202.750 C 278.821 201.084, 278 200.555, 278 201.378 M 233.733 203.124 C 234.412 203.808, 235.219 204.115, 235.526 203.807 C 235.834 203.499, 235.279 202.940, 234.293 202.564 C 232.868 202.022, 232.753 202.136, 233.733 203.124 M 270 202.393 C 270 202.609, 270.698 203.054, 271.552 203.382 C 272.442 203.723, 272.843 203.555, 272.493 202.989 C 271.906 202.038, 270 201.583, 270 202.393 M 227.250 203.689 C 228.213 203.941, 229.787 203.941, 230.750 203.689 C 231.713 203.438, 230.925 203.232, 229 203.232 C 227.075 203.232, 226.287 203.438, 227.250 203.689 M 258.250 235.732 C 253.176 236.189, 252.530 238, 257.441 238 C 259.334 238, 261.190 238.498, 261.566 239.107 C 262.048 239.886, 262.486 239.831, 263.049 238.921 C 263.695 237.875, 264.196 237.897, 265.674 239.034 C 266.678 239.807, 266.409 239.216, 265.076 237.720 C 263.742 236.224, 262.617 235.079, 262.576 235.175 C 262.534 235.271, 260.587 235.522, 258.250 235.732 M 340.504 236.373 C 338.696 237.696, 338.710 237.773, 340.888 238.465 C 342.133 238.860, 343.417 238.917, 343.742 238.591 C 344.067 238.266, 343.528 238, 342.544 238 C 341.067 238, 340.972 237.738, 342 236.500 C 343.552 234.629, 342.958 234.579, 340.504 236.373 M 238.335 236.668 C 239.263 237.596, 252.001 237.673, 252 236.750 C 252 236.338, 248.775 236, 244.833 236 C 240.892 236, 237.967 236.301, 238.335 236.668 M 220.815 240.864 C 222.032 241.636, 227 241.250, 227 240.383 C 227 240.173, 225.313 240.007, 223.250 240.015 C 220.860 240.025, 219.977 240.333, 220.815 240.864 M 343.507 241.989 C 343.157 242.555, 343.558 242.723, 344.448 242.382 C 346.180 241.717, 346.497 241, 345.059 241 C 344.541 241, 343.843 241.445, 343.507 241.989 M 168.813 242.683 C 169.534 242.972, 170.397 242.936, 170.729 242.604 C 171.061 242.272, 170.471 242.036, 169.417 242.079 C 168.252 242.127, 168.015 242.364, 168.813 242.683 M 164.083 243.365 C 164.313 243.565, 165.625 244.265, 167 244.920 C 169.357 246.042, 169.389 246.022, 167.559 244.555 C 165.966 243.279, 162.711 242.164, 164.083 243.365 M 163.269 247.693 C 164.242 247.947, 165.592 247.930, 166.269 247.656 C 166.946 247.382, 166.150 247.175, 164.500 247.195 C 162.850 247.215, 162.296 247.439, 163.269 247.693 M 234.269 247.693 C 235.242 247.947, 236.592 247.930, 237.269 247.656 C 237.946 247.382, 237.150 247.175, 235.500 247.195 C 233.850 247.215, 233.296 247.439, 234.269 247.693 M 230 248.703 C 230 249.857, 232.838 252.523, 233.395 251.893 C 233.586 251.677, 232.900 250.634, 231.871 249.575 C 230.842 248.516, 230 248.124, 230 248.703 M 348.441 250.555 C 346.611 252.022, 346.643 252.042, 349 250.920 C 352.061 249.462, 352.628 249, 351.358 249 C 350.821 249, 349.509 249.700, 348.441 250.555 M 351.507 254.989 C 351.157 255.555, 351.558 255.723, 352.448 255.382 C 354.180 254.717, 354.497 254, 353.059 254 C 352.541 254, 351.843 254.445, 351.507 254.989 M 156.083 255.356 C 156.313 255.552, 158.075 256.002, 160 256.355 C 162.462 256.807, 163.055 256.706, 162 256.014 C 160.644 255.125, 155.092 254.508, 156.083 255.356 M 352.500 259 C 351.718 260.266, 353.042 260.266, 355 259 C 356.293 258.165, 356.266 258.029, 354.809 258.015 C 353.879 258.007, 352.840 258.450, 352.500 259 M 154.250 262.689 C 155.213 262.941, 156.787 262.941, 157.750 262.689 C 158.713 262.438, 157.925 262.232, 156 262.232 C 154.075 262.232, 153.287 262.438, 154.250 262.689 M 357.441 266.555 C 355.611 268.022, 355.643 268.042, 358 266.920 C 361.061 265.462, 361.628 265, 360.358 265 C 359.821 265, 358.509 265.700, 357.441 266.555 M 149 269.393 C 149 269.609, 149.698 270.054, 150.552 270.382 C 151.442 270.723, 151.843 270.555, 151.493 269.989 C 150.906 269.038, 149 268.583, 149 269.393 M 360.507 269.989 C 360.157 270.555, 360.558 270.723, 361.448 270.382 C 363.180 269.717, 363.497 269, 362.059 269 C 361.541 269, 360.843 269.445, 360.507 269.989 M 362 275 C 361.099 275.582, 360.975 275.975, 361.691 275.985 C 362.346 275.993, 363.160 275.550, 363.500 275 C 364.267 273.758, 363.921 273.758, 362 275 M 143 277.449 C 143 277.724, 144.350 278.647, 146 279.500 C 147.650 280.353, 149 280.826, 149 280.551 C 149 280.276, 147.650 279.353, 146 278.500 C 144.350 277.647, 143 277.174, 143 277.449 M 364.500 279 C 362.870 279.701, 362.812 279.872, 364.191 279.930 C 365.121 279.968, 366.160 279.550, 366.500 279 C 367.211 277.850, 367.176 277.850, 364.500 279 M 141 281.350 C 141 281.581, 142.180 282.543, 143.623 283.489 C 145.066 284.434, 145.941 284.713, 145.567 284.109 C 144.854 282.955, 141 280.626, 141 281.350 M 367 284 C 366.099 284.582, 365.975 284.975, 366.691 284.985 C 367.346 284.993, 368.160 284.550, 368.500 284 C 369.267 282.758, 368.921 282.758, 367 284 M 370 290 C 369.099 290.582, 368.975 290.975, 369.691 290.985 C 370.346 290.993, 371.160 290.550, 371.500 290 C 372.267 288.758, 371.921 288.758, 370 290 M 139.813 290.683 C 140.534 290.972, 141.397 290.936, 141.729 290.604 C 142.061 290.272, 141.471 290.036, 140.417 290.079 C 139.252 290.127, 139.015 290.364, 139.813 290.683 M 136.500 293 C 137.600 293.473, 139.175 293.859, 140 293.859 C 140.945 293.859, 140.761 293.542, 139.500 293 C 138.400 292.527, 136.825 292.141, 136 292.141 C 135.055 292.141, 135.239 292.458, 136.500 293 M 135.813 298.683 C 136.534 298.972, 137.397 298.936, 137.729 298.604 C 138.061 298.272, 137.471 298.036, 136.417 298.079 C 135.252 298.127, 135.015 298.364, 135.813 298.683 M 132.083 299.283 C 132.313 299.439, 133.400 300.226, 134.500 301.033 C 136.350 302.390, 136.397 302.369, 135.128 300.750 C 134.373 299.788, 133.285 299, 132.711 299 C 132.137 299, 131.854 299.127, 132.083 299.283 M 377 301 C 376.099 301.582, 375.975 301.975, 376.691 301.985 C 377.346 301.993, 378.160 301.550, 378.500 301 C 379.267 299.758, 378.921 299.758, 377 301 M 128 303.393 C 128 303.609, 128.698 304.054, 129.552 304.382 C 130.442 304.723, 130.843 304.555, 130.493 303.989 C 129.906 303.038, 128 302.583, 128 303.393 M 381.507 303.989 C 381.157 304.555, 381.558 304.723, 382.448 304.382 C 384.180 303.717, 384.497 303, 383.059 303 C 382.541 303, 381.843 303.445, 381.507 303.989 M 241.702 312.631 C 241.355 312.979, 238.805 313.212, 236.035 313.149 C 231.923 313.057, 230.979 313.354, 230.885 314.768 C 230.821 315.721, 230.686 316.950, 230.585 317.500 C 229.465 323.573, 228.408 326.065, 225.979 328.358 C 224.404 329.844, 222.855 331.882, 222.536 332.887 C 222.217 333.892, 220.953 335.194, 219.728 335.781 C 217.803 336.703, 218.006 336.792, 221.220 336.434 C 223.266 336.206, 225.291 335.962, 225.720 335.892 C 227.910 335.531, 230 336.124, 230 337.107 C 230 337.718, 229.272 337.935, 228.373 337.590 C 227.479 337.246, 226.202 337.417, 225.537 337.969 C 224.872 338.522, 221.775 339.155, 218.655 339.377 C 215.536 339.599, 211.923 340.476, 210.626 341.325 C 208.793 342.526, 207.968 342.606, 206.911 341.685 C 206.164 341.033, 206.329 341.435, 207.277 342.579 C 209.301 345.020, 209.754 348.154, 207.800 346.200 C 205.694 344.094, 204.842 344.915, 206.872 347.093 C 209.099 349.484, 215 350.365, 215 348.307 C 215 347.302, 217.844 347, 227.327 347 L 239.654 347 240.860 340.457 C 241.523 336.859, 241.799 333.484, 241.474 332.957 C 241.148 332.431, 239.334 332, 237.441 332 C 235.178 332, 234 331.526, 234 330.617 C 234 329.856, 233.100 328.998, 232 328.710 C 230.900 328.423, 230 327.643, 230 326.977 C 230 326.259, 230.814 325.979, 232 326.290 C 233.100 326.577, 234 326.389, 234 325.871 C 234 325.325, 234.841 325.380, 236 326 C 237.434 326.767, 238 326.760, 238 325.976 C 238 325.374, 238.450 325.160, 239 325.500 C 239.550 325.840, 240 325.668, 240 325.118 C 240 323.588, 238.223 322.831, 237.776 324.171 C 237.559 324.822, 236.846 325.023, 236.191 324.618 C 234.473 323.556, 234.723 321.956, 236.500 322.638 C 237.325 322.955, 238 322.700, 238 322.072 C 238 321.276, 238.554 321.226, 239.824 321.906 C 241.394 322.746, 241.881 322.231, 243.329 318.191 C 244.253 315.611, 245.008 313.163, 245.005 312.750 C 244.999 311.839, 242.581 311.753, 241.702 312.631 M 388 315.059 C 388 315.641, 388.450 315.840, 389 315.500 C 389.550 315.160, 390 314.684, 390 314.441 C 390 314.198, 389.550 314, 389 314 C 388.450 314, 388 314.477, 388 315.059 M 389.441 318.555 C 387.577 320.049, 387.589 320.067, 389.750 319.020 C 390.988 318.420, 392 317.720, 392 317.465 C 392 316.700, 391.481 316.921, 389.441 318.555 M 119.589 318.856 C 119.298 319.326, 120.172 319.499, 121.530 319.239 C 122.889 318.979, 124 318.594, 124 318.383 C 124 317.610, 120.101 318.027, 119.589 318.856 M 117.750 323.662 C 118.438 323.940, 119.563 323.940, 120.250 323.662 C 120.938 323.385, 120.375 323.158, 119 323.158 C 117.625 323.158, 117.063 323.385, 117.750 323.662 M 249 326.893 C 249 327.384, 249.739 328.069, 250.641 328.416 C 252.014 328.943, 252.076 328.796, 251.019 327.523 C 249.579 325.788, 249 325.607, 249 326.893 M 289 328.929 C 289 329.518, 288.298 330, 287.441 330 C 286.584 330, 286.174 330.472, 286.530 331.049 C 286.974 331.766, 287.568 331.774, 288.413 331.072 C 289.266 330.365, 290.012 330.412, 290.824 331.224 C 291.471 331.871, 292 332.053, 292 331.629 C 292 331.204, 291.325 330.182, 290.500 329.357 C 289.675 328.532, 289 328.339, 289 328.929 M 110 334.430 C 110 334.705, 110.900 335.411, 112 336 C 113.100 336.589, 114 336.845, 114 336.570 C 114 336.295, 113.100 335.589, 112 335 C 110.900 334.411, 110 334.155, 110 334.430 M 239.856 349.990 C 238.402 350.419, 232.777 350.807, 227.356 350.851 C 213.724 350.963, 208.330 351.673, 202.378 354.140 C 198.407 355.785, 197.362 356.668, 197.728 358.067 C 198.151 359.686, 193.687 366.973, 191.744 367.835 C 191.328 368.020, 191.245 368.587, 191.559 369.095 C 191.873 369.603, 191.201 371.201, 190.065 372.645 C 188.929 374.088, 188 376.334, 188 377.635 C 188 379.972, 186.479 380.933, 185.833 379.003 C 185.650 378.454, 184.175 379.144, 182.556 380.536 C 180.937 381.927, 179.025 382.840, 178.308 382.565 C 177.590 382.289, 175.989 382.479, 174.751 382.988 C 173.253 383.603, 178.251 383.899, 189.694 383.873 C 201.878 383.846, 207.003 383.494, 207.282 382.667 C 207.567 381.820, 208.131 381.877, 209.337 382.872 C 210.768 384.054, 211 384.019, 211 382.622 C 211 381.730, 211.563 380.993, 212.250 380.985 C 213.118 380.974, 213.061 380.692, 212.064 380.061 C 211.025 379.403, 210.920 378.786, 211.683 377.826 C 212.262 377.097, 213.301 373.439, 213.991 369.698 C 215.274 362.742, 216.852 360.088, 219.821 359.886 C 225.387 359.508, 227.287 358.868, 228.966 356.807 L 230.843 354.500 233.922 357.437 C 235.615 359.052, 237 359.826, 237 359.156 C 237 358.486, 236.325 357.678, 235.500 357.362 C 233.568 356.620, 233.555 355, 235.481 355 C 236.295 355, 237.228 356.062, 237.554 357.360 C 237.977 359.046, 238.768 359.654, 240.323 359.488 C 241.520 359.360, 243.118 359.198, 243.872 359.128 C 244.921 359.030, 244.976 358.676, 244.105 357.627 C 243.478 356.871, 243.234 355.554, 243.562 354.700 C 244.008 353.536, 243.664 353.275, 242.192 353.660 C 241.110 353.943, 239.887 353.627, 239.474 352.957 C 238.990 352.175, 239.217 351.908, 240.111 352.209 C 240.875 352.467, 242.905 352.093, 244.623 351.378 C 247.581 350.148, 249 350.382, 249 352.099 C 249 352.521, 248.100 353.151, 247 353.500 C 244.293 354.359, 244.476 355.470, 247.352 355.635 C 249.290 355.746, 249.717 355.264, 249.784 352.885 C 249.829 351.298, 249.559 349.970, 249.183 349.933 C 248.807 349.895, 247.150 349.718, 245.500 349.537 C 243.850 349.357, 241.310 349.561, 239.856 349.990 M 289.157 396.997 C 284.674 398.054, 283.600 399.331, 283.600 403.603 C 283.600 406.653, 284.399 407.957, 288.800 412.089 C 294.065 417.033, 295.289 420.311, 292.800 422.800 C 290.577 425.023, 286.069 424.246, 284.781 421.418 C 283.606 418.840, 283.603 418.840, 282.787 421.047 C 281.591 424.280, 283.566 426, 288.476 426 C 293.949 426, 298 422.553, 298 417.897 C 298 415.333, 296.910 413.643, 292.500 409.372 C 286.734 403.787, 285.693 400.770, 288.934 399.035 C 291.715 397.547, 292.670 397.730, 294.961 400.189 L 297 402.377 297 399.689 C 297 398.210, 296.587 397, 296.082 397 C 295.577 397, 294.564 396.822, 293.832 396.604 C 293.099 396.387, 290.996 396.563, 289.157 396.997 M 338.728 396.605 C 338.328 397.006, 337.986 403.221, 337.968 410.417 C 337.930 425.990, 337.502 425.873, 330.911 408.493 C 328.514 402.172, 326.049 397, 325.433 397 C 324.817 397, 322.105 402.962, 319.407 410.250 C 314.653 423.087, 314.404 423.509, 311.415 423.801 C 306.394 424.291, 305.789 422.590, 306.165 409.044 L 306.500 396.997 303.815 396.999 L 301.130 397 301.677 405.750 C 301.977 410.563, 301.794 416.808, 301.270 419.629 L 300.317 424.757 307.832 425.240 C 317.344 425.850, 319 425.419, 319 422.334 C 319 420.996, 319.700 418.546, 320.556 416.891 C 321.862 414.367, 322.623 413.931, 325.277 414.191 C 328.079 414.465, 328.674 415.102, 330.464 419.750 L 332.486 425 338.493 424.921 C 341.797 424.878, 343.938 424.615, 343.250 424.338 C 342.375 423.985, 342 421.030, 342 414.494 L 342 405.156 352.423 415.821 C 358.156 421.687, 363.070 426.263, 363.343 425.990 C 363.617 425.717, 363.989 419.082, 364.170 411.245 L 364.500 396.997 361.820 396.999 C 359.273 397, 359.186 397.161, 360.070 400.243 C 360.581 402.027, 360.979 406.865, 360.952 410.993 L 360.905 418.500 350.181 407.188 C 344.283 400.967, 339.129 396.204, 338.728 396.605 M 120.500 410.900 L 120.500 424.998 123.500 425.001 L 126.500 425.004 126.161 419.002 C 125.704 410.896, 127.123 411.112, 134.368 420.250 C 138.068 424.917, 138.233 425, 143.817 425.002 L 149.500 425.003 149.500 417.752 L 149.500 410.500 156.500 410.500 L 163.500 410.500 163.808 414.210 C 163.977 416.251, 163.676 419.513, 163.139 421.460 L 162.161 425 166.203 425 C 169.623 425, 170.059 424.777, 169.040 423.548 C 168.199 422.535, 167.935 418.305, 168.167 409.547 L 168.500 396.997 165.741 396.999 C 163.019 397, 162.985 397.077, 163.241 402.750 L 163.500 408.500 156.250 408.794 L 149 409.088 149 403.044 C 149 397.118, 148.947 397, 146.250 396.999 L 143.500 396.997 143.829 409.999 C 144.037 418.172, 143.790 423, 143.164 423 C 141.920 423, 134 414.088, 134 412.688 C 134 412.121, 134.670 410.918, 135.488 410.013 C 138.072 407.158, 138.390 402.703, 136.203 400.002 C 134.546 397.955, 133.173 397.519, 127.370 397.190 L 120.500 396.801 120.500 410.900 M 177.841 398.524 C 173.799 400.720, 171 405.994, 171 411.418 C 171 417.617, 173.179 421.540, 177.981 423.990 C 188.943 429.582, 201.010 422.767, 200.982 411 C 200.968 405.329, 199.381 402.173, 195.088 399.280 C 191.091 396.586, 182.132 396.194, 177.841 398.524 M 203.500 410.958 L 203.500 424.916 208.657 425.562 C 216.392 426.530, 221.727 425.277, 225.811 421.534 C 228.969 418.640, 229.399 417.633, 229.791 412.211 C 230.573 401.402, 225.217 397.001, 211.282 396.999 L 203.500 396.999 203.500 410.958 M 232.500 410.884 L 232.500 424.770 237.848 425.323 C 240.790 425.627, 244.165 425.514, 245.348 425.073 C 246.532 424.631, 248.400 424.627, 249.500 425.064 C 253.138 426.511, 257.686 426.035, 260.365 423.927 C 262.417 422.313, 263 420.981, 263 417.905 C 263 414.428, 262.339 413.315, 257.483 408.612 C 252.678 403.958, 252.078 402.960, 252.841 400.884 C 254.017 397.680, 258.429 397.112, 260.193 399.938 C 261.922 402.706, 263 402.538, 263 399.500 C 263 397.182, 262.652 397, 258.223 397 C 251.989 397, 249 399.075, 249 403.403 C 249 406.046, 250.081 407.790, 254.500 412.281 C 260.269 418.143, 260.827 419.486, 258.701 422.395 C 256.870 424.899, 251.803 424.190, 250.513 421.250 C 249.463 418.856, 248 418.225, 248 420.167 C 248 420.808, 247.703 421.036, 247.340 420.673 C 246.977 420.310, 246.033 420.936, 245.243 422.063 C 244.277 423.442, 242.937 424.014, 241.153 423.807 C 238.635 423.516, 238.485 423.181, 238.202 417.250 C 237.910 411.122, 237.955 411, 240.484 411 C 241.902 411, 243.322 411.675, 243.638 412.500 C 244.605 415.018, 246 414.173, 246 411.070 C 246 408.352, 245.801 408.196, 243.250 408.916 C 238.884 410.148, 238 409.306, 238 403.917 C 238 399.161, 238.095 399, 240.893 399 C 242.709 399, 244.052 399.651, 244.500 400.750 C 245.156 402.356, 245.282 402.336, 246.037 400.500 C 247.428 397.118, 247.215 397, 239.750 396.999 L 232.500 396.999 232.500 410.884 M 273.808 410.154 C 274.042 420.168, 273.803 423.509, 272.808 424.140 C 271.991 424.658, 273.046 424.975, 275.613 424.985 L 279.727 425 278.752 419.750 C 278.216 416.863, 278.023 410.563, 278.323 405.750 L 278.870 397 276.185 396.998 L 273.500 396.996 273.808 410.154 M 369.832 408.912 C 370.033 416.150, 369.742 421.614, 369.089 422.834 C 368.077 424.724, 368.401 424.884, 374.610 425.549 C 388.082 426.991, 396 421.606, 396 411 C 396 401.518, 389.941 397.061, 377 397.021 L 369.500 396.997 369.832 408.912 M 127.243 398.850 C 126.651 399.215, 126.041 402.211, 125.886 405.507 C 125.625 411.061, 125.769 411.524, 127.857 411.827 C 131.104 412.298, 133 410.265, 133 406.312 C 133 400.871, 130.085 397.093, 127.243 398.850 M 180.277 399.973 C 177.304 401.785, 176.817 402.736, 175.540 409.225 C 174.858 412.688, 177.272 419.051, 180.203 421.517 C 184.378 425.030, 189.291 424.862, 193.077 421.077 C 195.615 418.539, 196 417.413, 196 412.527 C 196 400.657, 188.706 394.833, 180.277 399.973 M 74 400.059 C 74 400.641, 74.450 400.840, 75 400.500 C 75.550 400.160, 76 399.684, 76 399.441 C 76 399.198, 75.550 399, 75 399 C 74.450 399, 74 399.477, 74 400.059 M 208.750 399.570 C 207.651 400.688, 207.834 418.433, 208.975 421.435 C 209.820 423.658, 210.544 424, 214.399 424 C 225.450 424, 230.011 409.996, 221.549 402.046 C 219.024 399.674, 210.305 397.987, 208.750 399.570 M 374.667 399.667 C 373.442 400.892, 373.917 421.517, 375.200 422.800 C 377.125 424.725, 384.401 424.259, 387.236 422.029 C 392.912 417.564, 392.511 406.017, 386.521 401.448 C 383.423 399.086, 376.316 398.018, 374.667 399.667 M 438.079 401.583 C 438.127 402.748, 438.364 402.985, 438.683 402.188 C 438.972 401.466, 438.936 400.603, 438.604 400.271 C 438.272 399.939, 438.036 400.529, 438.079 401.583 M 84.567 406.433 C 83.705 407.845, 82.315 410.125, 81.477 411.500 L 79.954 414 86.541 414 L 93.128 414 90.848 409.943 C 87.506 403.997, 86.423 403.392, 84.567 406.433 M 421.542 408.338 C 420.144 410.724, 419 412.974, 419 413.338 C 419 413.702, 421.726 414, 425.058 414 L 431.115 414 428.308 409.001 C 426.763 406.252, 425.181 404.002, 424.792 404.001 C 424.403 404, 422.940 405.952, 421.542 408.338 M 323.613 407.407 C 323.280 408.731, 322.733 410.531, 322.397 411.407 C 321.937 412.607, 322.414 413, 324.334 413 C 327.700 413, 328.092 412.123, 326.459 408.240 C 324.830 404.365, 324.407 404.242, 323.613 407.407 M 445.813 412.683 C 446.534 412.972, 447.397 412.936, 447.729 412.604 C 448.061 412.272, 447.471 412.036, 446.417 412.079 C 445.252 412.127, 445.015 412.364, 445.813 412.683 M 57.216 422.184 C 56.547 422.853, 56 423.992, 56 424.716 C 56 425.778, 61.342 425.980, 83.750 425.766 C 110.745 425.507, 111.500 425.446, 111.500 423.500 C 111.500 421.557, 110.745 421.492, 84.966 421.234 C 65.167 421.036, 58.123 421.277, 57.216 422.184 M 399.380 422.452 C 399.074 423.251, 399.114 424.376, 399.470 424.952 C 400.148 426.049, 456 426.525, 456 425.434 C 456 425.123, 455.534 423.998, 454.965 422.934 C 453.981 421.095, 452.600 421, 426.933 421 C 404.255 421, 399.848 421.232, 399.380 422.452\" fill=\"currentColor\" fill-rule=\"evenodd\"/>\n</svg>\n",
      prtsEmblem: "data:image/png;base64,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",
      emblems: [{"key":"rhodes-island","label":"罗德岛"},{"key":"lungmen","label":"龙门"},{"key":"penguin-logistics","label":"企鹅物流"},{"key":"rhine-lab","label":"莱茵生命"},{"key":"reunion","label":"整合运动"}],
      emblemMasks: [{"key":"rhodes-island","width":320,"height":320,"alpha":"AJpqBAECAQS0AgMBBAEDuAIEugIItwIKtgIKtgIKtgIKtQIMswIOsQIQsAIQrwISrgISrQIUqwIWqgIWqgIWqAIapgIapQIcpAIcpAINAg2jAh6hAiCfAiKeAiKeAiKdAiSbAiaZAiiYAiiYAiiXAiqVAiyUAiyTAi6SAi6RAjCPAjKOAjKNAjSMAjSLAjaJAjiIAjiHAjqGAjqFAjyDAj6CAj6CAj6BAkD/AUL9AUT8AUT8AUT7AUb5AUj3AUr2AUr2AUr1AUzzAU7xAVDwAVDwAVDvAVLtAVTrAVbqASgGKOoBEAcOCg8HEekBEQcOCg8IEecBEQgOCg8IEuYBEAkOCg8IEuUBEQkOCg8IE+QBEQkOCg4KEuQBEQkOCg4KEuIBEwkOCg4KFOABEgsNCg4LE98BEwsNCw0LFN4BEwsNCw0LFN0BFAsNCwwMFdsBFQsMDAwMFtoBFQsMDQsMFtkBFg0HEgcOF9gBFjwW1wEXEgUNBRMX1QEYDA4GDg4Y1AEYCw8GDw0Y0wEYDQwLCg8Z0gEYDQEZAhQZ0QEZPRrPARk+G84BGT4bzgEZPhvNARo+HMwBGj4cygEcPx3IARw/HcgBHEAcxwEdQB3FAR1BHsQBHUEewwEeQR/CAR5BH8IBHkEfwAEgQSG+ASAYDhshvQEhFhAbIrwBIQsDBxYWIrwBIAoIAxsTIbsBIggKARwCBgojuQElByQSJrcBJwcaGye2ASgGGRsotgFGFDC0AT8cM7IBPhw0sQE/HDWwAT4cNrABNQYCHTauATYnN6wBNSg3qwE2KTeqATYpN6oBNio2qQE3KjenATgqOKYBOCo4pQE4KzmkATgrOaMBOCw6oQE5LDugATktOp8BOS47ngE5LjudATovO5sBOy88mgE7MDuZATwwPJgBPDA8lwE8MT2VAT0xPpQBPDI+kwE9Mj+SAT0yP5EBPTQ/jwE+NECOAT41P44BPjU/jQE/NUCLAUA2QIkBQTZBiAFBEQIjQYgBQBEFIUGHAUANCiFChQFBDAshQ4MBQgwLIUSCAUIMCyFEggFCDAsiQ4EBQg0LI0N/QwwMI0R9RAsVG0V8RAsWGkV8RAoXDQYHRXtEChgMCgVFeUUJFg8LBEZ3RQkRFQkGR3ZFCBIkR3ZFBhMlR3VGAxYlSHNHAhcmSHJHARgmSHFIARgnSHBHAhgnSG9IAhgnSW1mJEpsaCJKa2kjSmppI0ppayRJZ2snSGZqKkZmPgkhMz9lPgkYAQg1P2M+CRcFBDdAYT4JE0VBYD4JEkdAYD0JE0g/Xz0KEko/XT4KEkpAWz4KE0tAWj0LE00+WjwLFE0+WT0KFU0/Vz0LFU4/VT4KFk8/VDwGHk4+VDsHH049UzsMGFE+UTWDAThP8gFO8gFO8gFN9AFL9gFK9gFJ+AFI+AFI+AFG/AFE/AFD/gFC/gFC5AEBGUEZAsoBARo/ggI9hAI8hAI8hAI6iAIyAQWIAjICA4oCMQIDigIxAgOKAjECAY4CLwIBjgIvkgIuAQGQAi4BAZACLpQCLJQCLJQCLJQCLJQClmk=","encoding":"binary-rle-v1","opticalScale":0.86,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.135,"offsetY":1.485},"light":{"pitch":4.8,"offsetX":2.52,"offsetY":3.7199999999999998},"standard":{"pitch":4.2,"offsetX":1.9949999999999999,"offsetY":0.10500000000000001},"dense":{"pitch":3.7,"offsetX":3.2375,"offsetY":3.6075000000000004},"ultra":{"pitch":3.25,"offsetX":1.86875,"offsetY":1.05625}}},{"key":"lungmen","width":320,"height":320,"alpha":"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","encoding":"binary-rle-v1","opticalScale":0.84,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.9450000000000001,"offsetY":2.835},"light":{"pitch":4.8,"offsetX":3,"offsetY":0.8400000000000001},"standard":{"pitch":4.2,"offsetX":1.9949999999999999,"offsetY":4.095000000000001},"dense":{"pitch":3.7,"offsetX":2.8675,"offsetY":2.1275000000000004},"ultra":{"pitch":3.25,"offsetX":3.00625,"offsetY":1.86875}}},{"key":"penguin-logistics","width":320,"height":320,"alpha":"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BRwBHsgBHAMYBhoDHMsBGwgSBhUIGc8BIgERCDXQATIJEQIh1gEeGQQOH9kBLgcx2gFl4AFb5QFb5gFa7AFO8gFO8wFM+QE/ggI9hAI8iAI2kQImmwIkngIgqSKQAa8BkgGtAZQBrAGUAawBlAGsAZQBrAEJBw8EDwEFAQ8HDwEFAQ8BDwEFAQmsAQkBBAIPARIBBQEPBw8BBQEPAQ8BBQEJrAEJAQUBDwESAQUBDwcPAQUBDwEPAQUBCawBCQEFAQ8BEgEFAQ8HDwEFAQ8BDwEFAQmXAQ0ICQEFAQ8BEgEFAQ8CFAEFAQ8BDwEFAQkIDYIBDgcJAQUBDwESAgMCDwEVAQUBDwEPAgMCCQcOggEOBwkBBQEPARIHDwEVAQUBDwEPBwkHDoIBDgcJAQUBDwESBw8BFQEFAQ8BDwcJBw6CAQ4HCQIDAg8CEQcPAhQBBQEPAQ8HCQcOggEOBwkHDwQPBw8HDwEFAQ8BDwcJBw6CAQ4HCQIUAhEHDwIDAg8BBQEPAQ8HCQcOggENCAkBFQESBw8BBQEPAQUBDwEPBwkIDZcBCQEVARIHDwEFAQ8BBQEPAQ8HCawBCQEVARIDAQMPAQUBDwEFAQ8BDwMCAgmsAQkBFQESAQUBDwEFAQ8BBQEPAQ8BBQEJrAEJARUBEgEFAQ8BBQEPAQUBDwEPAQUBCawBCQEVARIBBQEPAQUBDwEFAQ8BDwEFAQmsAQkBFQESAQUBDwEFAQ8CBAEPAQ8BBQEJrAEJARUDEAEFAQ8DAQMPAwEDDwEPAQUBCawBHwQVAQ8HDwcfAQ+sAZQBrAGUAawBlAGsAZQBrQGSAcULAg4FCgYEAgcGBAkDAwQJBwXbAQQMBwgIAgQFCAILAQUCCwUH2QEGCggICAEGBAgBDAEFAQwECdgBBgkLBQkBBgMJAgsBBQEMAwrYAQYHDgILAQYBCwIKAgUBDAEL2QEGBwYDBgEGBgYBBgkGBAUBDAEG3gEGBwUEBgEFBwYBBgoFBAUBBgEFAQbeAQYHBQQGAQUHBgEICAUEBQEGAQUCB9wBBgcFBAYBBQcGAwYIBQQFAQYDAQUG3AEGBwUEBgEFBwYEBgcFBAUBBgoG2wEGBwUEBgEFAgQBBgQIBQUEBQEGCwfZAQYHBQQGAQUBBQEGBQcFBQQFAQYMB9gBBgcFBAYBBQEFAQYHBQUFBAUBBg0G2AEGBwUEBgEFAQUBBgIDAgUFBQQFAQYCAwMEAQbYAQYHBQQGAQUBBQEGAQUBBQUFBAUBBgEFAQUBBtgBBgcFBAYBBQEFAQYBBQEFBQUEBQEGAQUBBQEG2AELAg8BCwEGAQsFBQQFAQwBC9kBDAINAwoBBgIJBgUEBQEMAgrZAQwECQcIAQYEBQgFBAUBDAQG2wEMBAkHCAEGBAUIBQQFAQwEBtsBDAQJBwgBBgQFCAUEBQEMBAbvMg==","encoding":"binary-rle-v1","opticalScale":0.87,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.135,"offsetY":0.675},"light":{"pitch":4.8,"offsetX":2.76,"offsetY":0.8400000000000001},"standard":{"pitch":4.2,"offsetX":2.415,"offsetY":0.9450000000000001},"dense":{"pitch":3.7,"offsetX":0.4625,"offsetY":3.0525},"ultra":{"pitch":3.25,"offsetX":2.03125,"offsetY":3.00625}}},{"key":"rhine-lab","width":320,"height":320,"alpha":"AIXGAR92H4sBIHUhigEhdCKBATFkMXkyYzJ5M2I0cj1YPW0+Vz9sP1VBZkhPRmJKTkdhS0xIX09ITFxRRk5bUUZPWFVCVFRXQFZTV0BXUFs8Wk5dOlxNXTpdSmE4XUljN11JYzdeRmc1YENpNGBDKhQrNCQTKUErFS0yIxQrPiwXLDEiFis9JiInMR0gJj0mIygvHCEmPSUkKS8aIyc7ICwmMRUrIjkiLCgvFCwjNyIvJy8TLSI3IDInMA8xIDcgMygYARUOMiA3HzYoEwUVDTMgNh06JxEHVh8vAgIfOycND1EgLgIBHzwoChJRHy4CAR1AJwgTUx0uAgEdHgUeKAQXUR0uAgEdHQcdKQIZUB0uAgEdHAgfJwEaUB0uAgEdGwseQVEcLgIBHBsNHUFSHC0CARocDh8/UxwsAgEaHA4gPlMdKx0cDiA+Ux0rAQEbHA4iPFMdLBwcDiM7Ux0rHRwOIztUHCsdHA4lOVYaKx0cDiY4VhsqHB0OJjhWHSgaHw4oNlYdKBoVIx41ISAVHSgaFCUdNSAiFB0oGhMmHzEiIxMdKBoSKR4vISYSHSgaESsdLyAoER0oGhAtHishKhAdKBoQLR8pIioQHSgaEC0fKSIqEB0oGhAtHykiKhAdKBoQLB8sISkQHSgaESsdLyAoER0oGhMnHy8iJBMdKBoTJh8yISMTHSgaFCUdNh8iFB0oGx4PKDdUHSgcHQ4oOVMdKB0cDiY9UR0oHRwOJj5PGysdHA4lQE0cKx0cDiNESh0rHRwOI0RKHSsCARocDiFHSR0rAgEaHA4fS0cdKwIBGhwOH0tHGy0CARwaDh0mASdFGy4CAR0aDRsoASlBHS4CAR0cChsnBSdBHS4CAR0cCBwnBydAHS4CAR8bBxsoByk+HS4CAh8bBBwnCyc+HS4CAx46Jw0nPB4uAgMeOCkNKTggLgIEHjcnESc4HjYfNScTJzYeNyAyKRMpMiA3IjAnFycyIDcjLicZJzAhOCUpKBopKiU5JCknHSgoJDwkJycfKSUkPSgeKyAsHyc+KB0qIyoeKEAnGyolKhwpQC8LMScyCzFAMAkxKTIJMEIyBjErMgcwQ2gtaEVlL2ZHYzJiSWIzYkpgNl9NXThcT1w6W1BaPVhTV0BUVVZBVFZURFFZT0hOW05KTV1LTEtiRU9HZURRRWdCU0JsO1s8bzldOnI2Xzh4LWgsfyxpLIABKmsqiwEVgAEWlgEUgQEUmQEQhAES8igGGAMDAxUKFQMGAxUJLQMfAxgGSggWBQEFFAoUBQQFEwssBB0FFghJCBYFAQUTDBMFBAUTCysGHAUWCEkKFAUBBRQKFAcCBRMLKwYaCRQKRwsTBQEFFAoUCAEFEwosBhkLEwtGBQEFEwUBBRYGFggBBRMFMQYZBQEFEwUBBUYLEwsWBhYOEwoVAxQGGQsTC0YKFAsWBhYOEwsUBBMGGQsTC0YIFgsWBhYOEwsTBRMGGQsTC0YKFAsWBhYOEwsTBRMGGQsTC0YLEwsWBhYOEwoVBBMGGQsTC0YFAQUTBQEFFgYWBQEIEwUxBhkFAQUTBQEFRgUBBRMFAQUVCBUFAQgTCiwKFQUBBRMLRgUBBRMFAQUUChQFAQgTCysLFAUBBRMLRgUBBRMFAQUTDBMFBAUTCysMEwUBBRMLRgUBBRMFAQUTDBMFBAUTCysMEwUBBRMLRgUBBRMFAQUTDBMFBAUTCysMEwUBBRML48UB","encoding":"binary-rle-v1","opticalScale":0.87,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":2.2950000000000004,"offsetY":1.215},"light":{"pitch":4.8,"offsetX":1.8,"offsetY":2.76},"standard":{"pitch":4.2,"offsetX":0.31500000000000006,"offsetY":0.9450000000000001},"dense":{"pitch":3.7,"offsetX":2.3125,"offsetY":3.6075000000000004},"ultra":{"pitch":3.25,"offsetX":1.38125,"offsetY":2.51875}}},{"key":"reunion","width":320,"height":320,"alpha":"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","encoding":"binary-rle-v1","opticalScale":0.85,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.675,"offsetY":0.4050000000000001},"light":{"pitch":4.8,"offsetX":0.36,"offsetY":1.0799999999999998},"standard":{"pitch":4.2,"offsetX":3.0450000000000004,"offsetY":1.365},"dense":{"pitch":3.7,"offsetX":2.6825,"offsetY":3.2375},"ultra":{"pitch":3.25,"offsetX":2.51875,"offsetY":0.56875}}}],
      heroEmblemMask: {"key":"rhodes-island-hero","width":320,"height":320,"alpha":"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","encoding":"binary-rle-v1","opticalScale":0.94,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":2.2950000000000004,"offsetY":2.835},"light":{"pitch":4.8,"offsetX":3.7199999999999998,"offsetY":0.36},"standard":{"pitch":4.2,"offsetX":0.10500000000000001,"offsetY":2.205},"dense":{"pitch":3.7,"offsetX":0.6475000000000001,"offsetY":3.4225000000000003},"ultra":{"pitch":3.25,"offsetX":1.54375,"offsetY":2.35625}}}
    });
    const PRTS_STORAGE_KEY = 'dsh.ui.prts.v1'
const PARTICLE_TRAVERSAL_SPEED_MIN = 0
const PARTICLE_TRAVERSAL_SPEED_MAX = 2
const PARTICLE_TRAVERSAL_SPEED_STEP = 0.25
const PARTICLE_TRAVERSAL_SPEED_DEFAULT = 1
const SESSION_FLOW_SPEED_MIN = 0.25
const SESSION_FLOW_SPEED_MAX = 2
const SESSION_FLOW_SPEED_STEP = 0.25
const SESSION_FLOW_SPEED_DEFAULT = 1
const SESSION_FLOW_PALETTES = Object.freeze({
triad: Object.freeze({ back: '#f7ddeb', core: '#65ddb0', front: '#6eb7f3' }),
rhodes: Object.freeze({ back: '#b9edf4', core: '#5ccddb', front: '#5a9ee6' }),
amber: Object.freeze({ back: '#ffe6a3', core: '#f0c800', front: '#ee8f42' }),
alert: Object.freeze({ back: '#ffc0b8', core: '#ee625a', front: '#db5b8c' }),
})
const DEFAULT_PREFERENCES = Object.freeze({
version: 12,
enabled: false,
preset: 'standard-tactical',
texture: 'full',
glass: 'standard',
motion: 'system',
bootAnimation: true,
cursor: 'prts',
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
const VISUAL_PRESETS = Object.freeze({
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
const PARTICLE_DETAIL_LEVELS = Object.freeze({
compact: Object.freeze({ conversationParticleDensity: 'sparse', heroParticleDensity: 'light' }),
standard: Object.freeze({ conversationParticleDensity: 'light', heroParticleDensity: 'standard' }),
precise: Object.freeze({ conversationParticleDensity: 'dense', heroParticleDensity: 'ultra' }),
})
const PREFERENCE_GROUPS = Object.freeze({
background: Object.freeze(['texture']),
particles: Object.freeze(['conversationParticleDensity', 'heroParticleDensity', 'particleTraversalSpeed']),
material: Object.freeze(['glass']),
accessibility: Object.freeze(['motion', 'bootAnimation', 'cursor']),
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
function resolveParticleDetail(value) {
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
function normalizePreferences(value) {
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
cursor: input.cursor === 'system' ? 'system' : DEFAULT_PREFERENCES.cursor,
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
function applyVisualPreset(value, preset) {
const current = normalizePreferences(value)
const settings = VISUAL_PRESETS[preset]
if (!settings) return { ...current, preset: 'custom' }
return normalizePreferences({
...current,
...settings,
})
}
function applyParticleDetail(value, level) {
const current = normalizePreferences(value)
const settings = PARTICLE_DETAIL_LEVELS[level]
return settings ? normalizePreferences({ ...current, ...settings }) : current
}
function updatePreferenceValue(value, key, nextValue) {
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
function resetPreferenceGroup(value, group) {
const current = normalizePreferences(value)
const keys = PREFERENCE_GROUPS[group]
if (!keys) return current
const reset = { ...current }
for (const key of keys) reset[key] = DEFAULT_PREFERENCES[key]
return normalizePreferences(reset)
}
function loadPreferences(storage) {
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
function persistPreferences(storage, value) {
const normalized = normalizePreferences(value)
let persisted = false
try {
if (typeof storage?.setItem === 'function') {
storage.setItem(PRTS_STORAGE_KEY, JSON.stringify(normalized))
persisted = true
}
} catch {
}
return { preferences: normalized, persisted }
}
function savePreferences(storage, value) {
return persistPreferences(storage, value).preferences
}
function isSafeMode(search = '') {
try {
return new URLSearchParams(search).get('prts-safe') === '1'
} catch {
return false
}
}

const TOP_INSET_PROPERTY = '--prts-host-top-inset'
const RESIZE_SETTLE_DELAY = 160
function finiteInset(value, viewportHeight) {
const next = Number(value)
if (!Number.isFinite(next)) return 0
const limit = Math.max(0, Number(viewportHeight) || 0)
return Math.min(Math.max(0, next), limit)
}
function cssPixels(value) {
const rounded = Math.round(value * 100) / 100
return `${Object.is(rounded, -0) ? 0 : rounded}px`
}
function createHostGeometryAdapter({ document, window }) {
const root = document?.documentElement
let frame
let resizeObserver
let frameRequest
let resizeSettleTimer
let observedFrameHeight
let previousValue
let previousPriority
let started = false
function measure() {
if (!started || !root || !frame?.isConnected) return 0
const top = finiteInset(frame.getBoundingClientRect?.().top, window?.innerHeight)
const value = cssPixels(top)
if (root.style.getPropertyValue(TOP_INSET_PROPERTY) !== value) {
root.style.setProperty(TOP_INSET_PROPERTY, value)
}
return top
}
function scheduleMeasure() {
if (!started || frameRequest !== undefined) return
if (typeof window?.requestAnimationFrame !== 'function') {
measure()
return
}
frameRequest = window.requestAnimationFrame(() => {
frameRequest = undefined
measure()
})
}
function scheduleSettledMeasure() {
scheduleMeasure()
}
function onWindowResize() {
if (!started) return
if (resizeSettleTimer !== undefined) window?.clearTimeout?.(resizeSettleTimer)
resizeSettleTimer = window?.setTimeout?.(() => {
resizeSettleTimer = undefined
scheduleMeasure()
}, RESIZE_SETTLE_DELAY)
}
function onGeometryResize(entries = []) {
let shouldMeasure = false
for (const entry of entries) {
if (entry.target !== frame) continue
const height = Number(entry.contentRect?.height)
if (!Number.isFinite(height) || height <= 0) {
shouldMeasure = true
} else if (height !== observedFrameHeight) {
observedFrameHeight = height
shouldMeasure = true
}
}
if (shouldMeasure || !entries.length) scheduleMeasure()
}
function stopObservation() {
resizeObserver?.disconnect?.()
resizeObserver = undefined
window?.removeEventListener?.('resize', onWindowResize)
if (resizeSettleTimer !== undefined) window?.clearTimeout?.(resizeSettleTimer)
resizeSettleTimer = undefined
if (frameRequest !== undefined) window?.cancelAnimationFrame?.(frameRequest)
frameRequest = undefined
}
function dispose() {
if (!started) return
stopObservation()
if (previousValue) root.style.setProperty(TOP_INSET_PROPERTY, previousValue, previousPriority)
else root.style.removeProperty(TOP_INSET_PROPERTY)
previousValue = undefined
previousPriority = undefined
frame = undefined
observedFrameHeight = undefined
started = false
}
return {
start(nextFrame) {
if (!root || !nextFrame) return false
if (started && frame === nextFrame) {
scheduleSettledMeasure()
return true
}
if (started) dispose()
frame = nextFrame
previousValue = root.style.getPropertyValue(TOP_INSET_PROPERTY)
previousPriority = root.style.getPropertyPriority(TOP_INSET_PROPERTY)
started = true
measure()
if (typeof window?.ResizeObserver === 'function') {
resizeObserver = new window.ResizeObserver(onGeometryResize)
resizeObserver.observe(frame)
}
window?.addEventListener?.('resize', onWindowResize, { passive: true })
scheduleSettledMeasure()
return true
},
refresh: measure,
dispose,
}
}

const CONTROL_ATTRIBUTE = 'data-prts-glass-control'
const MENU_ATTRIBUTE = 'data-prts-glass-menu'
const FALLBACK_COMPOSER_ATTRIBUTE = 'data-prts-composer-fallback'
const COMPOSER_SIGNAL_ATTRIBUTE = 'data-prts-composer-signal'
const FALLBACK_COMPOSER_ROOT_SELECTOR = [
'[data-slot="conversation.composer"]',
'[data-composer-seat]',
].join(', ')
const COMPOSER_RELEVANCE_SELECTOR = [
'[data-composer-card]',
FALLBACK_COMPOSER_ROOT_SELECTOR,
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
function hasVisibleText(element) {
if (typeof element?.innerText === 'string') return element.innerText.trim().length > 0
const clone = element?.cloneNode?.(true)
if (!clone) return false
for (const hidden of clone.querySelectorAll?.('[hidden], [aria-hidden="true"]') ?? []) hidden.remove()
return clone.textContent?.trim().length > 0
}
function fallbackComposerForms(document) {
const forms = new Set()
for (const root of document?.querySelectorAll?.(FALLBACK_COMPOSER_ROOT_SELECTOR) ?? []) {
if (root.querySelector('[data-composer-card]')) continue
for (const textarea of root.querySelectorAll('form textarea')) {
const form = textarea.closest('form')
if (form && root.contains(form)) forms.add(form)
}
}
return forms
}
function createComposerGlassAdapter({ document, window }) {
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
const fallbackForms = fallbackComposerForms(document)
for (const form of [...ownedFallbacks]) {
if (form.isConnected && fallbackForms.has(form) && !form.hasAttribute('data-composer-card')) continue
form.removeAttribute?.(FALLBACK_COMPOSER_ATTRIBUTE)
ownedFallbacks.delete(form)
if (form.hasAttribute('data-composer-card')) continue
const signal = form.querySelector?.(`:scope > [${COMPOSER_SIGNAL_ATTRIBUTE}]`)
if (!ownedSignals.has(signal)) continue
signal.remove?.()
ownedSignals.delete(signal)
}
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
const isCommands = trigger.getAttribute('aria-haspopup') === 'listbox'
|| trigger.getAttribute('aria-label') === 'Commands'
|| trigger.matches('[class*="uV2eYG_add"]')
const isModel = !isCommands && (
menu?.hasAttribute('aria-busy')
|| (trigger.getAttribute('aria-haspopup') === 'menu' && hasVisibleText(trigger))
)
const kind = isModel ? 'model' : 'action'
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
?? document.querySelector('[data-slot="main.conversation"], [data-slot="conversation"]')
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

const FLOATING_GLASS_OWNED_ATTRIBUTES = [
'data-prts-floating-glass',
'data-prts-floating-kind',
'data-prts-floating-item',
'data-prts-floating-input',
'data-prts-floating-danger',
'data-prts-floating-scrim',
'data-prts-floating-nested',
'data-prts-floating-preserved',
]
const FLOATING_GLASS_OWNED_SELECTOR = FLOATING_GLASS_OWNED_ATTRIBUTES.map(attribute => `[${attribute}]`).join(', ')
const FLOATING_GLASS_POPUP_SELECTOR = [
'[role="menu"]',
'[role="listbox"]',
'[role="dialog"][aria-modal="true"]',
'[popover]',
].join(', ')
const FLOATING_GLASS_PORTAL_ROOT_SELECTOR = [
'[role="presentation"]',
'[class*="_portal_"]',
'[data-floating-ui-portal]',
'[data-radix-portal]',
].join(', ')
function markFloatingGlass(node, attribute, value = '') {
if (!node?.setAttribute) return
node.setAttribute(attribute, value)
}
function floatingClassHas(node, fragment) {
return [...(node?.classList ?? [])].some(token => token.includes(fragment))
}
function floatingPopupKind(node) {
if (node.matches('[role="dialog"]')) return 'dialog'
if (node.matches('[role="listbox"]')) return 'listbox'
if (node.matches('[role="menu"]')) return 'menu'
return 'popover'
}
function floatingVisible(node) {
return !node.hidden
&& node.getAttribute('aria-hidden') !== 'true'
&& node.style?.display !== 'none'
}
function floatingForeignPluginOwner(node) {
const owner = node.closest?.('[data-plugin]')
if (!owner) return null
const id = owner.getAttribute('data-plugin')
return id && id !== 'dsh-theme-prts' ? owner : null
}
function floatingHasCompleteCustomMaterial(window, node) {
let style
try {
style = window.getComputedStyle(node)
} catch {
return false
}
const radius = Number.parseFloat(style.borderRadius) || 0
const hasDepth = style.boxShadow !== 'none'
|| style.backdropFilter !== 'none'
|| style.webkitBackdropFilter !== 'none'
|| style.backgroundImage !== 'none'
return radius >= 10 && hasDepth
}
function floatingCandidatesForBodyChild(node, body) {
if (node?.nodeType !== 1 || node.parentElement !== body) return []
if (node.matches(FLOATING_GLASS_POPUP_SELECTOR)) return [node]
if (!node.matches(FLOATING_GLASS_PORTAL_ROOT_SELECTOR)) return []
return [...node.querySelectorAll(FLOATING_GLASS_POPUP_SELECTOR)]
}
function createFloatingGlassAdapter({ document, window }) {
let observer
const owned = new Set()
const classified = new WeakSet()
function own(node, attribute, value = '') {
markFloatingGlass(node, attribute, value)
owned.add(node)
}
function preserveThirdParty(node) {
if (node.closest?.('[data-prts-preserve-popup-style]')) return true
if (!floatingForeignPluginOwner(node) || !floatingHasCompleteCustomMaterial(window, node)) return false
own(node, 'data-prts-floating-preserved', 'custom')
return true
}
function classify(node) {
if (!floatingVisible(node) || classified.has(node)) return
classified.add(node)
if (preserveThirdParty(node)) return
const kind = floatingPopupKind(node)
own(node, 'data-prts-floating-glass', kind)
own(node, 'data-prts-floating-kind', kind)
if (node.parentElement?.closest?.(FLOATING_GLASS_POPUP_SELECTOR)) own(node, 'data-prts-floating-nested')
for (const item of node.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]')) {
own(item, 'data-prts-floating-item')
if (floatingClassHas(item, '_danger_') || item.matches('[data-variant="danger"], [data-danger="true"]')) {
own(item, 'data-prts-floating-danger')
}
}
if (kind === 'dialog') {
const scrim = node.parentElement?.matches?.('[role="presentation"]') ? node.parentElement : null
if (scrim) own(scrim, 'data-prts-floating-scrim')
for (const input of node.querySelectorAll('input, textarea, select, [contenteditable="true"]')) {
own(input, 'data-prts-floating-input')
}
for (const danger of node.querySelectorAll('[class*="_danger_"], [class*="_deleteAction"], [data-variant="danger"], [data-danger="true"]')) {
own(danger, 'data-prts-floating-danger')
}
} else {
for (const input of node.querySelectorAll('input, textarea, select, [contenteditable="true"]')) {
own(input, 'data-prts-floating-input')
}
}
}
function scanBodyChild(node) {
for (const candidate of floatingCandidatesForBodyChild(node, document.body)) classify(candidate)
}
function scan() {
for (const child of document?.body?.children ?? []) scanBodyChild(child)
}
function releaseTree(node) {
if (node?.nodeType !== 1) return
const candidates = [
node,
...(node.querySelectorAll?.(FLOATING_GLASS_OWNED_SELECTOR) ?? []),
]
for (const candidate of candidates) {
if (!owned.has(candidate)) continue
for (const attribute of FLOATING_GLASS_OWNED_ATTRIBUTES) candidate.removeAttribute?.(attribute)
owned.delete(candidate)
classified.delete(candidate)
}
}
function clear() {
for (const node of owned) {
for (const attribute of FLOATING_GLASS_OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
}
owned.clear()
}
return {
start() {
if (!document?.body || observer) return
scan()
const Observer = window?.MutationObserver
if (!Observer) return
observer = new Observer(records => {
for (const record of records) {
for (const node of record.removedNodes) releaseTree(node)
for (const node of record.addedNodes) scanBodyChild(node)
}
})
observer.observe(document.body, { childList: true })
},
dispose() {
observer?.disconnect()
observer = undefined
clear()
},
}
}

const ASSISTANT_SURFACE_ATTRIBUTE = 'data-prts-ai-surface'
const ASSISTANT_STATE_ATTRIBUTE = 'data-prts-ai-surface-state'
const ASSISTANT_AVATAR_PROPERTY = '--prts-assistant-avatar-image'
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
function resolveAssistantSurface(step) {
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
function createAssistantGlassAdapter({ document, window, avatarImage = '' }) {
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
if (!step?.isConnected || !step.matches?.(STEP_SELECTOR)
|| step.getAttribute('data-chat-group-part') === 'reasoning') {
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
attributeFilter: ['class', 'data-chat-flow-kind', 'data-chat-group-part', 'data-markdown', 'data-slot'],
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
const PARTICLE_DENSITY_PROFILES = Object.freeze({
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
function pointerRadiusForFieldSize(fieldSize) {
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
function findAlphaBounds(pixels, width, height, threshold = 16) {
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
function findOrthogonalLayout(mask, density = 'standard') {
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
function createOrthogonalTargets(mask, density = 'standard') {
return findOrthogonalLayout(mask, density)?.points ?? []
}
function inspectOrthogonalCoverage(mask, density = 'standard') {
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
function createParticleFieldAdapter({ document, window, emblem = '', emblems = [], emblemMasks = [], heroEmblemMask, onStateChange = () => {} }) {
const suppliedMasks = document && window ? normalizeEmblemMasks(emblemMasks, window) : new Map()
const requestedEmblems = normalizeEmblems(emblems, emblem)
const emblemSequence = requestedEmblems.filter(entry => suppliedMasks.has(entry.key))
const missingEmblems = requestedEmblems.filter(entry => !suppliedMasks.has(entry.key))
const rhodesIndex = Math.max(0, emblemSequence.findIndex(entry => entry.key === 'rhodes-island'))
const suppliedHeroMask = normalizeEmblemMasks(heroEmblemMask ? [heroEmblemMask] : [], window).get('rhodes-island-hero')
const empty = { mounted: false, hero: false, side: -1, transition: null, anchor: { horizontalProgress: 0, verticalProgress: 0 }, phase: 'error', error: '徽记资源异常' }
if (!document || !window) return { update() {}, setStartupActive() {}, setSchemeTransitionActive() {}, inspect: () => empty, dispose() {} }
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
let schemeTransitionPaused = false
let startupPaused = false
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
const canRenderFrame = () => !disposed && documentVisible && canvasVisible && !hydrationPaused && !startupPaused && !schemeTransitionPaused && !resizing
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
if (phoneStatic()) return 0
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
if (startupPaused) return false
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
if (phoneStatic()) {
const nextSize = pendingResizeSize
clearResizeState()
const changed = applyFieldSize(nextSize)
if (changed && particles.length) snapParticlesToCurrentLayout()
resizeCommits += changed ? 1 : 0
syncCanvasBackingStore()
geometryDirty = false
cancelFrame()
draw(Number(window.performance?.now?.()) || 0)
cancelFrame()
return
}
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
if (!scroller || phoneStatic()) return
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
if (phoneStatic()) return
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
const resumedFromPause = pauseStartedAt !== undefined
if (resumedFromPause) resumePausedTimelines(now)
let particlesBuilt = false
if (canvas && !particles.length && maskRecords.length) {
particlesBuilt = buildParticles()
}
if (canvas && particles.length && (resumedFromPause || particlesBuilt)) {
syncCanvasBackingStore()
cancelFrame()
draw(now)
return
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
function rebindScroller(nextScroller) {
scroller?.removeAttribute('data-prts-hero-active')
scroller?.removeEventListener('scroll', onScroll)
cancelHydrationResume()
hydrationPaused = false
mutationBurstScore = 0
if (mutationBurstTimer !== undefined) window.clearTimeout?.(mutationBurstTimer)
mutationBurstTimer = undefined
heroMarker = undefined
heroActive = false
scroller = nextScroller
scroller.addEventListener('scroll', onScroll, { passive: true })
syncHeroState()
if (!heroActive) {
resetTraversal()
if (!phoneStatic()) restoreTraversalFromScroll()
commitTransitionTargets(segment, true)
}
scheduleFrame()
}
function mount(nextOperation, nextScroller) {
if (operation === nextOperation && ambient?.isConnected && canvas?.isConnected) {
if (scroller === nextScroller) return
if (nextScroller) {
rebindScroller(nextScroller)
return
}
}
unmount()
operation = nextOperation
scroller = nextScroller
if (!operation || !scroller) return
const created = createAmbient(document)
ambient = created.layer
glow = created.glow
canvas = document.createElement('canvas')
canvas.setAttribute('data-prts-particle-layer', '')
canvas.setAttribute('aria-label', phoneStatic() ? '静态阵营标识粒子画布' : '随对话滚动轮换阵营标识的粒子画布')
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
setStartupActive(active) {
const next = Boolean(active)
if (startupPaused === next) return
startupPaused = next
updateFrameGate()
},
setSchemeTransitionActive(active) {
const next = Boolean(active)
if (schemeTransitionPaused === next) return
schemeTransitionPaused = next
updateFrameGate()
},
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
if (ambient) ambient.hidden = preferences.texture === 'off' && preferences.conversationStyle !== 'deck-chat'
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
targetParticles: startupPaused && !particles.length ? 0 : transition?.toCount ?? targetParticleCount(),
density: activeDensity() || 'standard',
firstFrameReady: canvas?.hasAttribute('data-prts-particle-ready') === true,
hydrationPaused,
sleeping: Boolean(context && particles.length && frame === undefined && canRenderFrame() && !motionReduced() && !phoneStatic()),
schemeTransitionPaused,
startupPaused,
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

const TO_BOTTOM_ATTRIBUTE = 'data-prts-to-bottom'
function isToBottomButton(node) {
return node?.tagName === 'BUTTON'
&& [...(node.classList ?? [])].some(token => token.endsWith('_toBottom'))
}
function createToBottomAdapter({ document, window }) {
let observer
let operation
const owned = new Set()
const pending = new Set()
function collectButtons(node) {
if (node?.nodeType !== 1) return
if (node.tagName === 'BUTTON') pending.add(node)
for (const button of node.querySelectorAll?.('button') ?? []) pending.add(button)
}
function process(button) {
if (button?.isConnected && operation?.contains(button) && isToBottomButton(button)) {
button.setAttribute(TO_BOTTOM_ATTRIBUTE, '')
owned.add(button)
return
}
button?.removeAttribute?.(TO_BOTTOM_ATTRIBUTE)
owned.delete(button)
}
function scan() {
for (const button of pending) process(button)
pending.clear()
for (const button of [...owned]) {
if (!button.isConnected) process(button)
}
}
function queueScan() {
scan()
}
function onMutations(mutations) {
for (const mutation of mutations) {
if (mutation.type === 'attributes') collectButtons(mutation.target)
for (const node of mutation.addedNodes ?? []) collectButtons(node)
for (const node of mutation.removedNodes ?? []) {
if (node?.nodeType !== 1) continue
for (const button of owned) {
if (button === node || node.contains?.(button)) pending.add(button)
}
}
}
if (pending.size) queueScan()
}
function clear() {
for (const button of owned) button.removeAttribute?.(TO_BOTTOM_ATTRIBUTE)
owned.clear()
pending.clear()
}
return {
start() {
if (!document) return
operation = document.querySelector('[data-prts-region="operation"]')
if (!operation) return
collectButtons(operation)
scan()
if (observer || !window?.MutationObserver) return
observer = new window.MutationObserver(onMutations)
observer.observe(operation, {
subtree: true,
childList: true,
attributes: true,
attributeFilter: ['class'],
})
},
dispose() {
observer?.disconnect()
observer = undefined
clear()
operation = undefined
},
}
}

const CONVERSATION_CONTROL_ATTRIBUTE = 'data-prts-conversation-control'
function hasClassSuffix(node, suffix) {
return [...(node?.classList ?? [])].some(token => token.endsWith(suffix))
}
function closestWithClassSuffix(node, suffix) {
for (let current = node; current?.nodeType === 1; current = current.parentElement) {
if (hasClassSuffix(current, suffix)) return current
}
return null
}
function classify(button, operation) {
if (button.tagName !== 'BUTTON' || !operation.contains(button)) return null
if (hasClassSuffix(button, '_sessionLogButton')) return 'header'
if (button.closest('[data-produced-files-row]') || hasClassSuffix(button, '_showFolder')) return 'utility'
if (closestWithClassSuffix(button, '_older')) return 'utility'
if (hasClassSuffix(button, '_inspectButton')) return 'inspect'
const approval = button.closest('[data-approval-key]')
if (approval) return hasClassSuffix(button, '_reject') ? 'danger' : 'cta'
if (hasClassSuffix(button, '_modalAction') || button.closest('[role="dialog"]')) return 'cta'
if (button.closest('[data-chat-flow-kind], [data-message-role]')) return 'micro'
return null
}
function createConversationControlAdapter({ document, window }) {
let observer
let operation
const owned = new Set()
const pending = new Set()
function collectButtons(node) {
if (node?.nodeType !== 1) return
if (node.tagName === 'BUTTON') pending.add(node)
for (const button of node.querySelectorAll?.('button') ?? []) pending.add(button)
const closest = node.closest?.('button')
if (closest) pending.add(closest)
}
function process(button) {
const kind = button?.isConnected ? classify(button, operation) : null
if (!kind) {
button?.removeAttribute?.(CONVERSATION_CONTROL_ATTRIBUTE)
owned.delete(button)
return
}
button.setAttribute(CONVERSATION_CONTROL_ATTRIBUTE, kind)
owned.add(button)
}
function scan() {
for (const button of pending) process(button)
pending.clear()
for (const button of [...owned]) {
if (!button.isConnected) process(button)
}
}
function queueScan() {
scan()
}
function onMutations(mutations) {
for (const mutation of mutations) {
if (mutation.type === 'attributes') collectButtons(mutation.target)
for (const node of mutation.addedNodes ?? []) collectButtons(node)
for (const node of mutation.removedNodes ?? []) {
if (node?.nodeType !== 1) continue
for (const button of owned) {
if (button === node || node.contains?.(button)) pending.add(button)
}
}
}
if (pending.size) queueScan()
}
function clear() {
for (const button of owned) button.removeAttribute?.(CONVERSATION_CONTROL_ATTRIBUTE)
owned.clear()
pending.clear()
}
return {
start() {
if (!document) return
operation = document.querySelector('[data-prts-region="operation"]')
if (!operation) return
collectButtons(operation)
scan()
if (observer || !window?.MutationObserver) return
observer = new window.MutationObserver(onMutations)
observer.observe(operation, {
subtree: true,
childList: true,
attributes: true,
attributeFilter: ['class', 'data-approval-key'],
})
},
dispose() {
observer?.disconnect()
observer = undefined
clear()
operation = undefined
},
}
}

const USER_TURN_SELECTOR = [
'[data-chat-flow-kind="user"]',
'[data-chat-flow-kind="user-step"]',
'[data-message-role="user"]',
].join(',')
const RECORD_LIMIT = 240
function nodeLabel(node) {
if (!node?.tagName) return ''
const role = node.getAttribute?.('data-chat-flow-kind')
|| node.getAttribute?.('data-message-role')
|| node.getAttribute?.('data-prts-conversation-control')
|| node.getAttribute?.('data-prts-to-bottom')
return `${node.tagName.toLowerCase()}${role ? `[${role}]` : ''}`
}
function createLayoutStabilityDiagnostics({ document, window }) {
let frame
let performanceObserver
let mutationObserver
let started = false
let lastSample
let lastUserInput = 0
const records = []
function enabled() {
if (document?.documentElement?.dataset?.prtsDiagnostics === 'layout') return true
try {
return new URLSearchParams(window?.location?.search ?? '').get('prtsDiagnostics') === 'layout'
} catch {
return false
}
}
function push(type, detail = {}) {
records.push({
type,
time: Number((window?.performance?.now?.() ?? Date.now()).toFixed?.(2) ?? Date.now()),
sinceUserInput: Math.max(0, Date.now() - lastUserInput),
...detail,
})
if (records.length > RECORD_LIMIT) records.splice(0, records.length - RECORD_LIMIT)
}
function visibleAnchor(scroller) {
const scrollerBox = scroller?.getBoundingClientRect?.()
if (!scrollerBox) return {}
for (const turn of scroller.querySelectorAll?.(USER_TURN_SELECTOR) ?? []) {
const box = turn.getBoundingClientRect?.()
if (box && box.bottom > scrollerBox.top && box.top < scrollerBox.bottom) {
return { node: nodeLabel(turn), top: Number(box.top.toFixed(2)) }
}
}
return {}
}
function sample() {
frame = undefined
if (!started) return
const scroller = document?.querySelector?.('[data-prts-region="operation"] [data-conversation-scroll]')
if (scroller) {
const anchor = visibleAnchor(scroller)
const next = {
scrollTop: Number(Number(scroller.scrollTop).toFixed(2)),
scrollHeight: Number(scroller.scrollHeight),
clientHeight: Number(scroller.clientHeight),
anchor: anchor.node,
anchorTop: anchor.top,
}
if (lastSample) {
const scrollDelta = next.scrollTop - lastSample.scrollTop
const heightDelta = next.scrollHeight - lastSample.scrollHeight
const anchorDelta = next.anchor === lastSample.anchor && Number.isFinite(next.anchorTop) && Number.isFinite(lastSample.anchorTop)
? Number((next.anchorTop - lastSample.anchorTop).toFixed(2))
: undefined
if (scrollDelta || heightDelta || anchorDelta) {
push('geometry', { scrollDelta, heightDelta, anchorDelta, anchor: next.anchor })
}
}
lastSample = next
} else {
lastSample = undefined
}
frame = window?.requestAnimationFrame?.(sample)
}
function onUserInput(event) {
lastUserInput = Date.now()
push('input', { event: event.type, key: event.key })
}
function startPerformanceObserver() {
const PerformanceObserver = window?.PerformanceObserver
if (typeof PerformanceObserver !== 'function') return
try {
performanceObserver = new PerformanceObserver(list => {
for (const entry of list.getEntries()) {
if (entry.entryType === 'layout-shift') {
push('layout-shift', {
value: entry.value,
recentInput: entry.hadRecentInput,
sources: (entry.sources ?? []).map(source => nodeLabel(source.node)).filter(Boolean),
})
} else if (entry.entryType === 'longtask') {
push('long-task', { duration: Number(entry.duration.toFixed(2)) })
}
}
})
performanceObserver.observe({ type: 'layout-shift', buffered: true })
performanceObserver.observe({ type: 'longtask', buffered: true })
} catch {
performanceObserver?.disconnect?.()
performanceObserver = undefined
}
}
return {
start() {
if (started || !enabled()) return false
started = true
window.__PRTS_LAYOUT_DIAGNOSTICS__ = records
for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
document?.addEventListener?.(type, onUserInput, { capture: true, passive: true })
}
if (window?.MutationObserver && document?.body) {
mutationObserver = new window.MutationObserver(mutations => {
for (const mutation of mutations) {
if (mutation.type === 'attributes') {
push('adapter-style', {
attribute: mutation.attributeName,
node: nodeLabel(mutation.target),
})
}
}
})
mutationObserver.observe(document.body, {
subtree: true,
attributes: true,
attributeFilter: ['data-prts-conversation-control', 'data-prts-to-bottom'],
})
}
startPerformanceObserver()
frame = window?.requestAnimationFrame?.(sample)
return true
},
dispose() {
started = false
if (frame !== undefined) window?.cancelAnimationFrame?.(frame)
frame = undefined
performanceObserver?.disconnect?.()
mutationObserver?.disconnect?.()
performanceObserver = undefined
mutationObserver = undefined
for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
document?.removeEventListener?.(type, onUserInput, { capture: true })
}
if (window?.__PRTS_LAYOUT_DIAGNOSTICS__ === records) delete window.__PRTS_LAYOUT_DIAGNOSTICS__
lastSample = undefined
},
}
}

const FACILITY_GEOMETRY = Object.freeze({
stroke: 1,
corner: 1,
sideDepth: 2,
sideOpening: 10,
sideInner: 6,
topOpening: 50,
topInner: 40,
topDepth: 10 / 3,
sessionTopOpening: 50,
sessionTopInner: 36.5,
sessionTopDepth: 4.5,
})
function number(value) {
return Number(value.toFixed(3)).toString()
}
function point(x, y) {
return `${number(x)} ${number(y)}`
}
function createFacilityPath({ width, height, topNotch = false, sessionNotch = false } = {}) {
if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 2 || height <= FACILITY_GEOMETRY.sideOpening + 2) return ''
const halfStroke = FACILITY_GEOMETRY.stroke / 2
const left = halfStroke
const right = width - halfStroke
const top = halfStroke
const bottom = height - halfStroke
const centerX = width / 2
const centerY = height / 2
const points = [point(left + FACILITY_GEOMETRY.corner, top)]
const topOpening = sessionNotch ? FACILITY_GEOMETRY.sessionTopOpening : FACILITY_GEOMETRY.topOpening
const topInner = sessionNotch ? FACILITY_GEOMETRY.sessionTopInner : FACILITY_GEOMETRY.topInner
const topDepth = sessionNotch ? FACILITY_GEOMETRY.sessionTopDepth : FACILITY_GEOMETRY.topDepth
if (topNotch && width >= topOpening + FACILITY_GEOMETRY.corner * 2 + FACILITY_GEOMETRY.stroke) {
points.push(
point(centerX - topOpening / 2, top),
point(centerX - topInner / 2, top + topDepth),
point(centerX + topInner / 2, top + topDepth),
point(centerX + topOpening / 2, top),
)
}
points.push(
point(right - FACILITY_GEOMETRY.corner, top),
point(right, top + FACILITY_GEOMETRY.corner),
point(right, centerY - FACILITY_GEOMETRY.sideOpening / 2),
point(right - FACILITY_GEOMETRY.sideDepth, centerY - FACILITY_GEOMETRY.sideInner / 2),
point(right - FACILITY_GEOMETRY.sideDepth, centerY + FACILITY_GEOMETRY.sideInner / 2),
point(right, centerY + FACILITY_GEOMETRY.sideOpening / 2),
point(right, bottom - FACILITY_GEOMETRY.corner),
point(right - FACILITY_GEOMETRY.corner, bottom),
point(left + FACILITY_GEOMETRY.corner, bottom),
point(left, bottom - FACILITY_GEOMETRY.corner),
point(left, centerY + FACILITY_GEOMETRY.sideOpening / 2),
point(left + FACILITY_GEOMETRY.sideDepth, centerY + FACILITY_GEOMETRY.sideInner / 2),
point(left + FACILITY_GEOMETRY.sideDepth, centerY - FACILITY_GEOMETRY.sideInner / 2),
point(left, centerY - FACILITY_GEOMETRY.sideOpening / 2),
point(left, top + FACILITY_GEOMETRY.corner),
)
return `M ${points.join(' L ')} Z`
}

const HOVER_SETTLE = 180
const STATIC_TIME = 2.4
const POINT_COUNT = 9
const DEFAULT_FLOW_SPEED = 1
function clamp(value, min, max) {
return Math.min(max, Math.max(min, value))
}
function number(value) {
return Number(value.toFixed(3))
}
function readGeometry(lifeline) {
const start = Number(lifeline?.getAttribute?.('data-prts-lifeline-start'))
const end = Number(lifeline?.getAttribute?.('data-prts-lifeline-end'))
const baseline = Number(lifeline?.getAttribute?.('data-prts-lifeline-baseline'))
const lift = Number(lifeline?.getAttribute?.('data-prts-lifeline-lift'))
if (![start, end, baseline, lift].every(Number.isFinite) || end <= start || lift <= 0) return null
return { start, end, baseline, lift }
}
function filamentNodes(lifeline) {
if (!lifeline) return []
if (lifeline.matches?.('[data-prts-session-lifeline-filament]')) return [lifeline]
return Array.from(lifeline.querySelectorAll?.('[data-prts-session-lifeline-filament]') ?? [])
}
function setFilamentPath(filament, path) {
const layers = Array.from(filament?.querySelectorAll?.('[data-prts-session-lifeline-layer]') ?? [])
if (layers.length === 0) {
filament?.setAttribute?.('d', path)
return
}
layers.forEach(layer => layer.setAttribute('d', path))
}
function createSmoothPath(points) {
if (points.length < 2) return ''
const commands = [`M ${number(points[0].x)} ${number(points[0].y)}`]
for (let index = 0; index < points.length - 1; index += 1) {
const previous = points[Math.max(0, index - 1)]
const current = points[index]
const next = points[index + 1]
const following = points[Math.min(points.length - 1, index + 2)]
const firstControl = {
x: current.x + (next.x - previous.x) / 6,
y: current.y + (next.y - previous.y) / 6,
}
const secondControl = {
x: next.x - (following.x - current.x) / 6,
y: next.y - (following.y - current.y) / 6,
}
commands.push([
'C',
number(firstControl.x),
number(firstControl.y),
number(secondControl.x),
number(secondControl.y),
number(next.x),
number(next.y),
].join(' '))
}
return commands.join(' ')
}
function sampleFlow(u, time, strand) {
const edgeEnvelope = Math.sin(Math.PI * u) ** .88
const slowTurn = Math.sin(time * .43 + u * Math.PI * 1.16 + Math.sin(time * .13) * .48)
const crossCurrent = Math.sin(time * -.29 + u * Math.PI * 2.42 + .7)
const fineCurrent = Math.sin(time * .19 + u * Math.PI * 3.76 - .9)
const sharedFlow = slowTurn * .52 + crossCurrent * .24 + fineCurrent * .08
const fan = Math.sin(Math.PI * u) ** 1.35
const separation = strand * (.15 + Math.sin(time * .31 + u * Math.PI * 1.48 + strand * .8) * .1)
const independentDrift = Math.sin(time * (.36 + strand * .021) + u * Math.PI * 2.18 + strand * 1.35) * .055
return edgeEnvelope * clamp(sharedFlow + fan * separation + independentDrift, -.9, .9)
}
function createSessionLifelinePath(geometry, time = STATIC_TIME, strength = 1, strand = 0) {
const { start, end, baseline, lift } = geometry
const span = end - start
const tension = clamp(strength, 0, 1)
const points = []
for (let index = 0; index < POINT_COUNT; index += 1) {
const u = index / (POINT_COUNT - 1)
points.push({
x: start + span * u,
y: baseline - lift * sampleFlow(u, time, strand) * tension,
})
}
return createSmoothPath(points)
}
function configureSessionLifeline(lifeline, { start, end, baseline, lift }) {
if (!lifeline) return false
const geometry = { start, end, baseline, lift }
lifeline.setAttribute('data-prts-lifeline-start', String(number(start)))
lifeline.setAttribute('data-prts-lifeline-end', String(number(end)))
lifeline.setAttribute('data-prts-lifeline-baseline', String(number(baseline)))
lifeline.setAttribute('data-prts-lifeline-lift', String(number(lift)))
filamentNodes(lifeline).forEach((filament, index, filaments) => {
const strand = filaments.length === 1 ? 0 : index - (filaments.length - 1) / 2
setFilamentPath(filament, createSessionLifelinePath(geometry, STATIC_TIME, 1, strand))
})
return true
}
function createSessionLifelineAnimator({ document, window }) {
const requestFrame = window?.requestAnimationFrame?.bind(window)
?? (callback => window?.setTimeout?.(() => callback(Date.now()), 1000 / 60))
const cancelFrame = window?.cancelAnimationFrame?.bind(window)
?? window?.clearTimeout?.bind(window)
const reducedMotion = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
const MotionObserver = window?.MutationObserver
let frame
let lastTime
let flowTime = STATIC_TIME
let strength = 1
let row
let lifeline
let filaments = []
let hovered = false
let motionObserver
function render() {
const geometry = readGeometry(lifeline)
if (!geometry || filaments.length === 0) return false
filaments.forEach((filament, index) => {
const strand = filaments.length === 1 ? 0 : index - (filaments.length - 1) / 2
setFilamentPath(filament, createSessionLifelinePath(geometry, flowTime, strength, strand))
})
return true
}
function canAnimate() {
return Boolean(
row?.isConnected
&& lifeline?.isConnected
&& row.getAttribute('aria-selected') === 'true'
&& document?.visibilityState !== 'hidden'
&& document?.documentElement?.dataset?.prtsSessionFlow !== 'off'
&& document?.documentElement?.dataset?.prtsMotion !== 'reduced'
&& !reducedMotion?.matches
)
}
function currentFlowSpeed() {
const value = Number(document?.documentElement?.dataset?.prtsSessionFlowSpeed)
return Number.isFinite(value) ? clamp(value, .25, 2) : DEFAULT_FLOW_SPEED
}
function cancel() {
if (frame !== undefined) cancelFrame?.(frame)
frame = undefined
lastTime = undefined
}
function needsFrame() {
return canAnimate() && (!hovered || strength > 0)
}
function schedule() {
if (frame !== undefined || !needsFrame()) return
frame = requestFrame?.(tick)
}
function tick(time) {
frame = undefined
if (!canAnimate()) {
lastTime = undefined
return
}
const now = Number.isFinite(time) ? time : Date.now()
if (lastTime === undefined) lastTime = now
const elapsed = Math.min(100, Math.max(0, now - lastTime))
lastTime = now
flowTime += elapsed / 1000 * currentFlowSpeed()
const target = hovered ? 0 : 1
if (strength !== target) {
const step = elapsed / HOVER_SETTLE
strength = target > strength
? Math.min(target, strength + step)
: Math.max(target, strength - step)
}
render()
schedule()
}
function motionReduced() {
return document?.documentElement?.dataset?.prtsMotion === 'reduced' || reducedMotion?.matches
}
function syncMotion() {
if (canAnimate()) {
schedule()
return
}
cancel()
if (lifeline && motionReduced()) {
flowTime = STATIC_TIME
strength = 1
render()
}
}
function onPointerEnter() {
hovered = true
syncMotion()
}
function onPointerLeave() {
hovered = false
syncMotion()
}
function detachRow() {
row?.removeEventListener?.('pointerenter', onPointerEnter)
row?.removeEventListener?.('pointerleave', onPointerLeave)
}
function attachObservers() {
document?.addEventListener?.('visibilitychange', syncMotion)
reducedMotion?.addEventListener?.('change', syncMotion)
if (!motionObserver && typeof MotionObserver === 'function' && document?.documentElement) {
motionObserver = new MotionObserver(syncMotion)
motionObserver.observe(document.documentElement, {
attributes: true,
attributeFilter: ['data-prts-motion', 'data-prts-session-flow', 'data-prts-session-flow-speed'],
})
}
}
return {
start() {
attachObservers()
syncMotion()
},
setTarget(nextRow, nextLifeline) {
if (row === nextRow && lifeline === nextLifeline) {
syncMotion()
return
}
cancel()
detachRow()
row = nextRow
lifeline = nextLifeline
filaments = filamentNodes(lifeline)
hovered = Boolean(row?.matches?.(':hover'))
flowTime = STATIC_TIME
strength = hovered ? 0 : 1
row?.addEventListener?.('pointerenter', onPointerEnter)
row?.addEventListener?.('pointerleave', onPointerLeave)
render()
syncMotion()
},
dispose() {
cancel()
detachRow()
row = undefined
lifeline = undefined
filaments = []
motionObserver?.disconnect()
motionObserver = undefined
document?.removeEventListener?.('visibilitychange', syncMotion)
reducedMotion?.removeEventListener?.('change', syncMotion)
},
}
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const SILHOUETTE_TRACK_WIDTH = 512
const SESSION_PICKUP_HEIGHTS = Object.freeze([5, 11, 7, 17, 11, 20, 13, 7, 15, 9, 5])
const SILHOUETTE_PATHS = Object.freeze({
far: [
'M0 38V26H14V22H30V25H43V18H60V22H73V15H84V11H89V6H93V2H97V6H101V11H106V20H121V16H138V22H151V13H158V9H163V4H168V9H173V13H180V21H196V17H211V12H226V20H241V23H253V15H270V19H285V11H293V7H297V3H301V7H305V11H313V18H329V21H342V14H360V19H374V22H388V16H401V12H405V8H409V12H413V16H422V20H438V13H454V18H470V24H484V20H499V23H512V26H512V38Z',
'M326 19V7H329V19ZM317 7H346V9H317ZM340 9L350 16H347L337 9Z',
'M218 12V7H220V12ZM214 7H224V9H214Z',
].join(' '),
near: [
'M0 38V32H16V29H31V33H48V26H61V31H78V28H94V34H112V30H126V32H141V25H156V29H174V33H191V27H206V31H223V34H240V29H256V26H270V32H289V30H305V34H324V27H340V31H357V29H374V34H392V30H410V26H425V31H443V33H460V28H477V31H494V27H512V32H512V38Z',
'M94 28V20H97V28ZM90 20H102V22H90Z',
'M203 27V23H219V25H205V27Z',
'M267 26V18H270V26ZM263 18H274V20H263Z',
'M418 26V21H421V26ZM414 21H425V23H414Z',
].join(' '),
})
let silhouetteId = 0
const FACILITY_TEXTURES = Object.freeze(['none', 'grid', 'scanline', 'silhouette', 'pickup'])
function svgNode(document, name, attributes = {}) {
const node = document.createElementNS(SVG_NS, name)
for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
return node
}
function appendPattern(document, defs, { id, width, height, path }) {
const pattern = svgNode(document, 'pattern', {
id: `prts-facility-${id}-pattern`,
patternUnits: 'userSpaceOnUse',
width,
height,
})
pattern.append(svgNode(document, 'path', {
d: path,
fill: 'none',
stroke: '#fff',
'stroke-width': '1',
opacity: '.72',
}))
defs.append(pattern)
const mask = svgNode(document, 'mask', {
id: `prts-facility-${id}-mask`,
maskUnits: 'userSpaceOnUse',
x: '0',
y: '0',
width: '4096',
height: '4096',
})
mask.append(svgNode(document, 'rect', {
x: '0',
y: '0',
width: '4096',
height: '4096',
fill: `url(#prts-facility-${id}-pattern)`,
}))
defs.append(mask)
}
function ensureFacilityTextureDefs(document) {
let root = document?.querySelector?.('svg[data-prts-facility-defs]')
if (root) return root
if (!document?.body) return null
root = svgNode(document, 'svg', {
'data-prts-facility-defs': '',
'data-prts-owned-facility-defs': '',
'aria-hidden': 'true',
focusable: 'false',
width: '0',
height: '0',
})
const defs = svgNode(document, 'defs')
appendPattern(document, defs, { id: 'grid', width: '8', height: '8', path: 'M 0 .5 H 8 M .5 0 V 8' })
appendPattern(document, defs, { id: 'scanline', width: '4', height: '4', path: 'M 0 .5 H 4' })
root.append(defs)
document.body.append(root)
return root
}
function appendSilhouetteScene(document, graphic) {
const clipId = `prts-facility-silhouette-clip-${++silhouetteId}`
const defs = svgNode(document, 'defs')
const clip = svgNode(document, 'clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' })
clip.append(svgNode(document, 'path', { 'data-prts-facility-clip': '' }))
defs.append(clip)
const scene = svgNode(document, 'g', {
'data-prts-facility-silhouette': '',
'clip-path': `url(#${clipId})`,
})
for (const layer of ['far', 'near']) {
const track = svgNode(document, 'g', { 'data-prts-silhouette-layer': layer })
for (const offset of [0, SILHOUETTE_TRACK_WIDTH]) {
track.append(svgNode(document, 'path', {
d: SILHOUETTE_PATHS[layer],
transform: `translate(${offset} 0)`,
}))
}
scene.append(track)
}
graphic.insertBefore(defs, graphic.firstChild)
graphic.insertBefore(scene, graphic.querySelector('[data-prts-facility-layer="outline"]'))
}
function appendSessionPickup(document, graphic) {
const clipId = `prts-facility-pickup-clip-${++silhouetteId}`
const defs = svgNode(document, 'defs')
const clip = svgNode(document, 'clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' })
clip.append(svgNode(document, 'path', { 'data-prts-facility-clip': '' }))
defs.append(clip)
const lifeline = svgNode(document, 'g', {
'data-prts-session-lifeline': '',
'clip-path': `url(#${clipId})`,
})
for (const strand of ['back', 'core', 'front']) {
const filament = svgNode(document, 'g', {
'data-prts-session-lifeline-filament': strand,
})
for (const layer of ['halo', 'body', 'core']) {
filament.append(svgNode(document, 'path', {
'data-prts-session-lifeline-layer': layer,
}))
}
lifeline.append(filament)
}
const pickup = svgNode(document, 'g', {
'data-prts-session-pickup': '',
'clip-path': `url(#${clipId})`,
})
pickup.append(svgNode(document, 'line', {
'data-prts-session-pickup-baseline': '',
x1: '60%',
x2: '98%',
y1: '19',
y2: '19',
}))
pickup.append(svgNode(document, 'circle', {
'data-prts-session-pickup-indicator': '',
cx: '56%',
cy: '19',
r: '2.5',
}))
SESSION_PICKUP_HEIGHTS.forEach((height, index) => {
pickup.append(svgNode(document, 'rect', {
'data-prts-session-pickup-bar': '',
x: `${76 + index * 2.15}%`,
y: String((38 - height) / 2),
width: '1.7',
height: String(height),
rx: '.4',
}))
})
graphic.insertBefore(defs, graphic.firstChild)
graphic.insertBefore(lifeline, graphic.querySelector('[data-prts-facility-layer="outline"]'))
graphic.insertBefore(pickup, graphic.querySelector('[data-prts-facility-layer="outline"]'))
}
function appendSessionStatusUnderlay(document, graphic) {
const surface = graphic.querySelector('[data-prts-facility-layer="surface"]')
if (!surface) return
if (!graphic.querySelector('[data-prts-session-status-underlay]')) {
graphic.insertBefore(svgNode(document, 'path', {
'data-prts-session-status-underlay': '',
'aria-hidden': 'true',
transform: 'translate(3 2)',
'shape-rendering': 'geometricPrecision',
}), surface)
}
if (!graphic.querySelector('[data-prts-session-idle-indicator]')) {
graphic.insertBefore(svgNode(document, 'rect', {
'data-prts-session-idle-indicator': '',
'aria-hidden': 'true',
y: '2.5',
width: '50',
height: '2.5',
}), surface)
}
}
function clamp(value, min, max) {
return Math.min(max, Math.max(min, value))
}
function sessionLifelineGeometry(width, height) {
const start = clamp(width * .04, 8, 12)
const end = Math.max(start + 1, width - 8)
const baseline = height * .56
const lift = clamp(height * .35, 10, 14)
return { start, end, baseline, lift }
}
function ensureFacilityGraphic(document, owner, { kind, topNotch = false, sessionNotch = false, texture = 'none' } = {}) {
if (!owner) return null
let graphic = owner.querySelector?.(':scope > svg[data-prts-facility-svg]')
if (!graphic) {
graphic = svgNode(document, 'svg', {
'data-prts-facility-svg': kind,
'data-prts-owned-facility-vector': '',
'aria-hidden': 'true',
focusable: 'false',
preserveAspectRatio: 'none',
})
for (const layer of ['surface', 'texture', 'outline']) {
const path = svgNode(document, 'path', { 'data-prts-facility-layer': layer })
if (layer === 'outline') {
path.setAttribute('fill', 'none')
path.setAttribute('stroke-width', '1')
path.setAttribute('stroke-linejoin', 'miter')
path.setAttribute('stroke-miterlimit', '2')
path.setAttribute('vector-effect', 'non-scaling-stroke')
path.setAttribute('shape-rendering', 'geometricPrecision')
}
graphic.append(path)
}
owner.insertBefore(graphic, owner.firstChild)
}
if (texture === 'silhouette' && !graphic.querySelector('[data-prts-facility-silhouette]')) appendSilhouetteScene(document, graphic)
if (texture === 'pickup') {
appendSessionStatusUnderlay(document, graphic)
if (!graphic.querySelector('[data-prts-session-pickup]')) appendSessionPickup(document, graphic)
}
graphic.setAttribute('data-prts-facility-svg', kind)
graphic.toggleAttribute('data-prts-top-notch', Boolean(topNotch))
graphic.toggleAttribute('data-prts-session-notch', Boolean(sessionNotch))
if (!owner.hasAttribute('data-prts-facility-texture')) owner.setAttribute('data-prts-facility-texture', texture)
return graphic
}
function setReady(owner, ready) {
owner.toggleAttribute('data-prts-facility-vector', ready)
if (owner.hasAttribute('data-prts-facility-spine')) {
owner.parentElement?.toggleAttribute('data-prts-spine-vector', ready)
}
}
function renderFacilityGraphic(owner, { width, height } = {}) {
const graphic = owner?.querySelector?.(':scope > svg[data-prts-facility-svg]')
const topNotch = graphic?.hasAttribute('data-prts-top-notch')
const sessionNotch = graphic?.hasAttribute('data-prts-session-notch')
const path = createFacilityPath({ width, height, topNotch, sessionNotch })
if (!graphic || !path) {
owner?.removeAttribute?.('data-prts-facility-size')
setReady(owner, false)
return false
}
const size = `${Number(width.toFixed(3))}x${Number(height.toFixed(3))}:${topNotch ? 't' : '-'}${sessionNotch ? 's' : '-'}`
const lifeline = graphic.querySelector('[data-prts-session-lifeline]')
const lifelineGeometry = lifeline ? sessionLifelineGeometry(width, height) : undefined
if (owner.getAttribute('data-prts-facility-size') !== size) {
graphic.setAttribute('viewBox', `0 0 ${Number(width.toFixed(3))} ${Number(height.toFixed(3))}`)
for (const layer of graphic.querySelectorAll('[data-prts-facility-layer], [data-prts-facility-clip]')) layer.setAttribute('d', path)
const statusUnderlay = graphic.querySelector('[data-prts-session-status-underlay]')
statusUnderlay?.setAttribute('d', createFacilityPath({ width, height }))
const idleIndicator = graphic.querySelector('[data-prts-session-idle-indicator]')
idleIndicator?.setAttribute('x', String(Number((width / 2 - 25).toFixed(3))))
const silhouette = graphic.querySelector('[data-prts-facility-silhouette]')
if (silhouette) {
const availableHeight = Math.max(1, height - 2)
silhouette.setAttribute('transform', `translate(0 1) scale(1 ${Number((availableHeight / 38).toFixed(5))})`)
}
const pickup = graphic.querySelector('[data-prts-session-pickup]')
if (pickup) {
const center = Number((height / 2).toFixed(3))
for (const baseline of pickup.querySelectorAll('[data-prts-session-pickup-baseline]')) {
baseline.setAttribute('y1', String(center))
baseline.setAttribute('y2', String(center))
}
for (const indicator of pickup.querySelectorAll('[data-prts-session-pickup-indicator]')) {
indicator.setAttribute('cy', String(center))
}
for (const bar of pickup.querySelectorAll('[data-prts-session-pickup-bar]')) {
const barHeight = Number(bar.getAttribute('height')) || 0
bar.setAttribute('y', String(Number((center - barHeight / 2).toFixed(3))))
}
}
if (lifeline) {
configureSessionLifeline(lifeline, lifelineGeometry)
}
owner.setAttribute('data-prts-facility-size', size)
}
setReady(owner, true)
return true
}

const OWNED_ATTRIBUTES = [
'data-prts-row-title',
'data-prts-workspace-disclosure',
'data-prts-workspace-icon',
'data-prts-row-menu-open',
'data-prts-workspace-row',
'data-prts-workspace-actions',
'data-prts-workspace-menu-anchor',
'data-prts-workspace-menu',
'data-prts-workspace-create',
'data-prts-session-row',
'data-prts-session-actions',
'data-prts-session-quick-actions',
'data-prts-session-menu-anchor',
'data-prts-session-menu',
'data-prts-session-time',
'data-prts-session-index',
'data-prts-session-state',
'data-prts-session-summary-header',
'data-prts-session-summary-label',
'data-prts-facility-face',
'data-prts-facility-spine',
'data-prts-facility-vector',
'data-prts-facility-size',
'data-prts-facility-texture',
'data-prts-spine-vector',
]
const SESSION_STATES = Object.freeze(['warning', 'ongoing', 'error', 'done'])
const PENDING_LABELS = Object.freeze({
approval: '待授权',
'plan-review': '待审阅',
question: '待回答',
})
function snapshotOf(source) {
try {
return source?.getSnapshot?.()
} catch {
return undefined
}
}
function nativeSessionState(row) {
for (const state of SESSION_STATES) {
if (row.querySelector(`[data-state="${state}"]:not([data-prts-owned-session-status])`)) return state
}
return undefined
}
function resolveSectionHeader(root) {
const tree = root?.querySelector?.('[role="tree"]')
if (!tree) return {}
for (const candidate of root.querySelectorAll('div')) {
if (candidate.contains(tree)) continue
const label = Array.from(candidate.children).find(child => (
child.tagName === 'SPAN'
&& child.textContent.trim()
&& !child.querySelector('button, input')
))
if (!label || candidate.querySelectorAll('button').length < 1) continue
return { header: candidate, label }
}
return {}
}
function visibleSessionSummaries(sessions, workspaces, sessionStatus) {
const list = snapshotOf(sessions?.list)
if (!list?.byId) return []
const statuses = snapshotOf(sessionStatus)
const workspaceList = snapshotOf(workspaces?.list)
const archived = new Set(workspaceList?.archivedSessionIds ?? [])
const ids = Array.isArray(list.ids) ? list.ids : Object.keys(list.byId)
return ids.flatMap(id => {
const summary = list.byId[id]
if (!summary || summary.blank || summary.origin === 'subagent' || archived.has(id)) return []
const status = statuses?.get?.(id)
const pendingLabel = PENDING_LABELS[status?.pendingInteraction?.kind]
if (pendingLabel) return [{ id, title: summary.displayTitle || id, state: 'warning', statusLabel: pendingLabel }]
const runningSubagent = list.projectionsBySession?.[id]?.values?.subagentCatalog?.some(child =>
(statuses?.get?.(child.id)?.running ?? list.byId[child.id]?.running) === true)
if ((status?.running ?? summary.running) || runningSubagent) {
return [{ id, title: summary.displayTitle || id, state: 'ongoing' }]
}
if (status ? status.completionUnread === true : summary.completed === true) {
return [{ id, title: summary.displayTitle || id, state: 'done' }]
}
return []
})
}
function markSidebarNode(node, attribute, next) {
if (!node) return
node.setAttribute(attribute, '')
next.add(node)
}
function resolveRowControls(row, kind) {
const menu = row.querySelector(':scope > span > span > button[type="button"]')
const anchor = menu?.parentElement
const actions = anchor?.parentElement
if (!menu || !anchor || actions?.parentElement !== row) return {}
const create = kind === 'workspace'
? actions.querySelector(':scope > button[type="button"]')
: undefined
const quickActions = kind === 'session'
? Array.from(actions.children).filter(child => child !== anchor && child.querySelector('button'))
: []
return { actions, anchor, create, menu, quickActions }
}
function resolveRowTitle(row, kind, actions) {
const candidates = Array.from(row.querySelectorAll(':scope > span')).filter(node => (
node !== actions
&& !node.hasAttribute('data-prts-row-projection')
&& node.getAttribute('aria-hidden') !== 'true'
&& !node.querySelector('button')
&& node.textContent.trim()
))
if (kind === 'session') return candidates.find(node => node.matches('[class*="title"], [data-session-title]')) ?? candidates.at(-1)
return candidates.find(node => node.matches('[class*="project"], [class*="workspace"], [data-workspace-title]')) ?? candidates.at(-1)
}
function resolveWorkspaceIcon(row, title, actions) {
return Array.from(row.children).find(node => (
node.tagName === 'SPAN'
&& node !== title
&& node !== actions
&& !node.hasAttribute('data-prts-facility-face')
&& !node.hasAttribute('data-prts-facility-spine')
&& !node.hasAttribute('data-prts-row-projection')
))
}
function resolveWorkspaceDisclosure(row, title, actions, icon) {
return Array.from(row.children).find(node => (
node.tagName === 'SPAN'
&& node !== title
&& node !== actions
&& node !== icon
&& !node.hasAttribute('data-prts-facility-face')
&& !node.hasAttribute('data-prts-facility-spine')
&& !node.hasAttribute('data-prts-row-projection')
&& !node.querySelector('button')
))
}
function resolveSessionTime(row, title, actions) {
const candidates = Array.from(row.querySelectorAll(':scope > span')).filter(node => (
node !== title
&& node !== actions
&& !node.hasAttribute('data-prts-facility-face')
&& !node.hasAttribute('data-prts-row-projection')
&& !node.querySelector('button')
&& node.textContent.trim()
))
return candidates.find(node => node.matches('[class*="time" i], time, [data-session-time]'))
?? candidates.filter(node => node.getAttribute('aria-hidden') !== 'true' && !node.querySelector('[data-state]')).at(-1)
}
function ensureFacilityFace(document, row, kind, next) {
let face = row.querySelector(':scope > [data-prts-facility-face]')
if (!face) {
face = document.createElement('span')
face.setAttribute('data-prts-owned-facility', '')
row.insertBefore(face, row.firstChild)
}
face.setAttribute('data-prts-facility-face', kind)
face.setAttribute('data-prts-facility-texture', kind === 'workspace' ? 'silhouette' : 'pickup')
face.setAttribute('aria-hidden', 'true')
next.add(face)
return face
}
function ensureFacilitySpine(document, row, kind, next) {
let spine = row.querySelector(':scope > [data-prts-facility-spine]')
if (!spine) {
spine = document.createElement('span')
spine.setAttribute('data-prts-owned-facility-spine', '')
row.insertBefore(spine, row.firstChild)
}
spine.setAttribute('data-prts-facility-spine', kind)
spine.setAttribute('aria-hidden', 'true')
next.add(spine)
return spine
}
function createSidebarControlAdapter({ document, window, sessions, workspaces, getSessionStatus, getUiWorkspace }) {
let observer
let resizeObserver
let resizeFrame
let resizeTimer
let scanFrame
let stopSessionList = () => {}
let stopWorkspaceList = () => {}
let stopSessionStatus = () => {}
let sessionStatus
let statusSourcesStarted = false
let summaryRoot
let summarySignature = ''
let owned = new Set()
let vectorOwners = new Set()
const dirtyVectors = new Map()
const vectorSizes = new WeakMap()
const lifelineAnimator = createSessionLifelineAnimator({ document, window })
function connectSessionStatus() {
const source = getSessionStatus?.()
if (source === sessionStatus) return
stopSessionStatus()
sessionStatus = source
stopSessionStatus = source?.subscribe?.(queueScan) ?? (() => {})
}
function openSession(sessionId) {
try {
const uiWorkspace = getUiWorkspace?.()
if (typeof uiWorkspace?.openSession === 'function') {
uiWorkspace.openSession(sessionId)
return
}
if (typeof sessions?.open === 'function') {
sessions.open(sessionId)
return
}
} catch {}
const row = Array.from(document.querySelectorAll('[data-prts-session-row]')).find(candidate => (
candidate.getAttribute('data-row-key') === `session:${sessionId}`
|| candidate.getAttribute('data-session-id') === sessionId
|| candidate.querySelector('[data-prts-row-title]')?.textContent.trim() === sessionId
))
row?.click?.()
}
function statusSignal(document, state) {
const signal = document.createElement('span')
signal.setAttribute('data-prts-session-summary-signal', state)
signal.setAttribute('aria-hidden', 'true')
return signal
}
function buildSummaryGroup(state, label, items) {
const group = document.createElement('span')
group.setAttribute('data-prts-session-summary-group', state)
const trigger = document.createElement('button')
trigger.type = 'button'
trigger.setAttribute('data-prts-session-summary-trigger', state)
trigger.setAttribute('aria-haspopup', 'menu')
trigger.setAttribute('aria-label', `${label} ${items.length}`)
trigger.append(statusSignal(document, state))
const count = document.createElement('span')
count.setAttribute('data-prts-session-summary-count', '')
count.textContent = String(items.length)
trigger.append(count)
const popover = document.createElement('span')
popover.setAttribute('data-prts-session-summary-popover', state)
popover.setAttribute('role', 'menu')
popover.setAttribute('aria-label', label)
const heading = document.createElement('span')
heading.setAttribute('data-prts-session-summary-heading', '')
const headingLabel = document.createElement('strong')
headingLabel.textContent = label
const hint = document.createElement('small')
hint.textContent = '选择会话'
heading.append(headingLabel, hint)
popover.append(heading)
for (const item of items) {
const button = document.createElement('button')
button.type = 'button'
button.setAttribute('role', 'menuitem')
button.setAttribute('data-prts-session-summary-item', item.id)
button.append(statusSignal(document, state))
const title = document.createElement('span')
title.textContent = item.title
button.append(title)
if (item.statusLabel) {
const detail = document.createElement('small')
detail.setAttribute('data-prts-session-summary-item-status', '')
detail.textContent = item.statusLabel
button.append(detail)
button.setAttribute('aria-label', `${item.title}，${item.statusLabel}`)
}
button.addEventListener('click', event => {
event.stopPropagation()
openSession(item.id)
})
popover.append(button)
}
group.append(trigger, popover)
return group
}
function syncSummary(root, next) {
const { header, label } = resolveSectionHeader(root)
if (!header || !label) {
summaryRoot?.remove()
summaryRoot = undefined
summarySignature = ''
return
}
header.setAttribute('data-prts-session-summary-header', '')
label.setAttribute('data-prts-session-summary-label', '')
next.add(header)
next.add(label)
const fromService = visibleSessionSummaries(sessions, workspaces, sessionStatus)
const nativeRows = Array.from(root.querySelectorAll('[data-prts-session-row]')).flatMap(row => {
const state = row.getAttribute('data-prts-session-state')
if (state !== 'warning' && state !== 'ongoing' && state !== 'done') return []
const title = row.querySelector('[data-prts-row-title]')?.textContent.trim()
const rowKey = row.getAttribute('data-row-key')
const id = row.getAttribute('data-session-id') || (rowKey?.startsWith('session:') ? rowKey.slice(8) : title)
return title ? [{ id, title, state }] : []
})
const rows = [...fromService]
const statePriority = { done: 1, ongoing: 2, warning: 3 }
for (const nativeRow of nativeRows) {
const index = rows.findIndex(item => item.id === nativeRow.id || item.title === nativeRow.title)
if (index === -1) {
rows.push(nativeRow)
} else if (statePriority[nativeRow.state] > statePriority[rows[index].state]) {
rows[index] = { ...rows[index], state: nativeRow.state }
}
}
const warning = rows.filter(item => item.state === 'warning')
const ongoing = rows.filter(item => item.state === 'ongoing')
const done = rows.filter(item => item.state === 'done')
const signature = JSON.stringify({
warning: warning.map(item => [item.id, item.title, item.statusLabel]),
ongoing: ongoing.map(item => [item.id, item.title]),
done: done.map(item => [item.id, item.title]),
})
if (!summaryRoot) {
summaryRoot = document.createElement('span')
summaryRoot.setAttribute('data-prts-owned-session-summary', '')
summaryRoot.setAttribute('data-prts-session-summary', '')
summaryRoot.setAttribute('role', 'group')
summaryRoot.setAttribute('aria-label', '会话状态总览')
label.insertAdjacentElement('afterend', summaryRoot)
} else if (summaryRoot.parentElement !== header) {
label.insertAdjacentElement('afterend', summaryRoot)
}
const labelHidden = Array.from(label.classList).some(name => /hidden/i.test(name))
summaryRoot.toggleAttribute('data-prts-summary-search-hidden', labelHidden)
summaryRoot.hidden = warning.length === 0 && ongoing.length === 0 && done.length === 0
if (signature === summarySignature) return
summarySignature = signature
summaryRoot.replaceChildren()
if (warning.length) summaryRoot.append(buildSummaryGroup('warning', '等待处理的会话', warning))
if (ongoing.length) summaryRoot.append(buildSummaryGroup('ongoing', '运行中的会话', ongoing))
if (done.length) summaryRoot.append(buildSummaryGroup('done', '完成未查看', done))
}
function scheduleVectors() {
if (resizeFrame !== undefined) return
const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
resizeFrame = requestFrame?.(flushVectors)
}
function flushVectors() {
resizeFrame = undefined
const measurements = []
for (const [owner, observedSize] of dirtyVectors) {
if (!vectorOwners.has(owner) || !owner.isConnected) continue
let size = observedSize
if (!size) {
const box = owner.getBoundingClientRect?.()
size = {
width: owner.clientWidth || owner.offsetWidth || box?.width || 0,
height: owner.clientHeight || owner.offsetHeight || box?.height || 0,
}
}
const previous = vectorSizes.get(owner)
if (previous?.width === size.width && previous?.height === size.height) continue
vectorSizes.set(owner, size)
measurements.push([owner, size])
}
dirtyVectors.clear()
for (const [owner, size] of measurements) renderFacilityGraphic(owner, size)
}
function registerVector(owner, options, next, nextVectorOwners) {
if (!owner) return
const previousSessionNotch = owner.querySelector?.(':scope > svg[data-prts-facility-svg]')
?.hasAttribute('data-prts-session-notch') ?? false
const graphic = ensureFacilityGraphic(document, owner, options)
if (!graphic) return
next.add(graphic)
nextVectorOwners.add(owner)
if (!vectorOwners.has(owner)) resizeObserver?.observe(owner)
if (previousSessionNotch !== Boolean(options.sessionNotch)) vectorSizes.delete(owner)
if (!vectorSizes.has(owner)) {
dirtyVectors.set(owner, undefined)
}
}
function syncVectorOwners(next) {
for (const owner of vectorOwners) {
if (next.has(owner)) continue
resizeObserver?.unobserve?.(owner)
dirtyVectors.delete(owner)
}
vectorOwners = next
scheduleVectors()
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
connectSessionStatus()
const root = document?.querySelector?.('[data-prts-region="sessions"] [data-slot="sidebar.workspaces"]')
const next = new Set()
const nextVectorOwners = new Set()
let activeLifelineRow
let activeLifeline
if (root) {
for (const projection of root.querySelectorAll('[data-prts-owned-projection]')) projection.remove()
for (const row of root.querySelectorAll('div[role="treeitem"][aria-expanded]')) {
const controls = resolveRowControls(row, 'workspace')
const face = ensureFacilityFace(document, row, 'workspace', next)
const spine = ensureFacilitySpine(document, row, 'workspace', next)
registerVector(face, { kind: 'face', topNotch: true, texture: 'silhouette' }, next, nextVectorOwners)
registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
markSidebarNode(row, 'data-prts-workspace-row', next)
const title = resolveRowTitle(row, 'workspace', controls.actions)
markSidebarNode(title, 'data-prts-row-title', next)
const icon = resolveWorkspaceIcon(row, title, controls.actions)
markSidebarNode(icon, 'data-prts-workspace-icon', next)
markSidebarNode(resolveWorkspaceDisclosure(row, title, controls.actions, icon), 'data-prts-workspace-disclosure', next)
row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
|| row.classList.contains('menuOpen'))
markSidebarNode(controls.actions, 'data-prts-workspace-actions', next)
markSidebarNode(controls.anchor, 'data-prts-workspace-menu-anchor', next)
markSidebarNode(controls.menu, 'data-prts-workspace-menu', next)
markSidebarNode(controls.create, 'data-prts-workspace-create', next)
registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
registerVector(controls.create, { kind: 'button' }, next, nextVectorOwners)
}
let sessionOrdinal = 0
for (const row of root.querySelectorAll('div[role="treeitem"][aria-selected]')) {
const sessionIndex = String(++sessionOrdinal).padStart(2, '0')
const controls = resolveRowControls(row, 'session')
const state = nativeSessionState(row)
const face = ensureFacilityFace(document, row, 'session', next)
const spine = ensureFacilitySpine(document, row, 'session', next)
registerVector(face, { kind: 'face', topNotch: true, sessionNotch: true, texture: 'pickup' }, next, nextVectorOwners)
registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
if (!activeLifelineRow && row.getAttribute('aria-selected') === 'true') {
activeLifelineRow = row
activeLifeline = face.querySelector('[data-prts-session-lifeline]')
}
markSidebarNode(row, 'data-prts-session-row', next)
if (state) {
row.setAttribute('data-prts-session-state', state)
next.add(row)
} else {
row.removeAttribute('data-prts-session-state')
}
row.dataset.prtsSessionIndex = sessionIndex
const title = resolveRowTitle(row, 'session', controls.actions)
markSidebarNode(title, 'data-prts-row-title', next)
markSidebarNode(resolveSessionTime(row, title, controls.actions), 'data-prts-session-time', next)
if (title) title.dataset.prtsSessionIndex = sessionIndex
row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
|| row.classList.contains('menuOpen'))
markSidebarNode(controls.actions, 'data-prts-session-actions', next)
for (const action of controls.quickActions ?? []) markSidebarNode(action, 'data-prts-session-quick-actions', next)
markSidebarNode(controls.anchor, 'data-prts-session-menu-anchor', next)
markSidebarNode(controls.menu, 'data-prts-session-menu', next)
registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
}
syncSummary(root, next)
} else {
summaryRoot?.remove()
summaryRoot = undefined
summarySignature = ''
}
lifelineAnimator.setTarget(activeLifelineRow, activeLifeline)
for (const node of owned) {
if (next.has(node)) continue
if (node.hasAttribute?.('data-prts-owned-projection')
|| node.hasAttribute?.('data-prts-owned-facility')
|| node.hasAttribute?.('data-prts-owned-facility-spine')
|| node.hasAttribute?.('data-prts-owned-facility-vector')) {
node.remove()
continue
}
for (const attribute of OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
}
syncVectorOwners(nextVectorOwners)
owned = next
}
function clear() {
lifelineAnimator.setTarget(undefined, undefined)
for (const node of document?.querySelectorAll?.('[data-prts-owned-projection], [data-prts-owned-facility], [data-prts-owned-facility-spine], [data-prts-owned-facility-vector], [data-prts-owned-facility-defs]') ?? []) node.remove()
for (const node of owned) {
for (const attribute of OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
}
for (const attribute of OWNED_ATTRIBUTES) {
for (const node of document?.querySelectorAll?.(`[${attribute}]`) ?? []) node.removeAttribute(attribute)
}
vectorOwners.clear()
dirtyVectors.clear()
owned.clear()
summaryRoot?.remove()
summaryRoot = undefined
summarySignature = ''
}
return {
start() {
if (!document) return
lifelineAnimator.start()
ensureFacilityTextureDefs(document)
const ResizeObserver = window?.ResizeObserver
if (!resizeObserver && typeof ResizeObserver === 'function') {
resizeObserver = new ResizeObserver(entries => {
for (const entry of entries) {
const rect = entry.contentRect
dirtyVectors.set(entry.target, rect ? { width: rect.width, height: rect.height } : undefined)
}
if (resizeTimer !== undefined) window?.clearTimeout?.(resizeTimer)
resizeTimer = window?.setTimeout?.(() => {
resizeTimer = undefined
scheduleVectors()
}, 160)
})
}
scan()
if (!statusSourcesStarted) {
statusSourcesStarted = true
stopSessionList = sessions?.list?.subscribe?.(queueScan) ?? (() => {})
stopWorkspaceList = workspaces?.list?.subscribe?.(queueScan) ?? (() => {})
}
if (observer || !window?.MutationObserver) return
const observationRoot = document.querySelector('[data-prts-region="sessions"]')
if (!observationRoot) return
observer = new window.MutationObserver(queueScan)
observer.observe(observationRoot, {
subtree: true,
childList: true,
attributes: true,
attributeFilter: ['aria-expanded', 'aria-selected', 'class', 'data-state'],
})
},
dispose() {
observer?.disconnect()
observer = undefined
stopSessionList()
stopSessionList = () => {}
stopWorkspaceList()
stopWorkspaceList = () => {}
stopSessionStatus()
stopSessionStatus = () => {}
sessionStatus = undefined
statusSourcesStarted = false
if (scanFrame !== undefined) {
if (window?.cancelAnimationFrame) window.cancelAnimationFrame(scanFrame)
else window?.clearTimeout?.(scanFrame)
}
scanFrame = undefined
resizeObserver?.disconnect()
resizeObserver = undefined
if (resizeFrame !== undefined) {
if (window?.cancelAnimationFrame) window.cancelAnimationFrame(resizeFrame)
else window?.clearTimeout?.(resizeFrame)
}
resizeFrame = undefined
if (resizeTimer !== undefined) window?.clearTimeout?.(resizeTimer)
resizeTimer = undefined
lifelineAnimator.dispose()
clear()
},
}
}

function closestCommonContainer(root, nodes) {
let candidate = nodes[0]?.parentElement
while (candidate && candidate !== root) {
if (nodes.every(node => candidate === node || candidate.contains(node))) return candidate
candidate = candidate.parentElement
}
return root && nodes.every(node => root.contains(node)) ? root : null
}
const LAYOUT_CONTRACTS = [
{
version: '0.1.5',
center: '[data-slot="main"]',
auxiliary: '[data-slot="rightbar"]',
},
{
version: '0.1.2',
center: '[data-slot="conversation"]',
auxiliary: '[data-slot="details"]',
},
]
function resolveRc7Regions(document, report = () => {}) {
const root = document?.querySelector('[data-slot="root"]')
const sidebarSlot = root?.querySelector('[data-slot="sidebar"]')
const contract = LAYOUT_CONTRACTS
.map(candidate => ({
...candidate,
centerSlot: root?.querySelector(candidate.center),
auxiliarySlot: root?.querySelector(candidate.auxiliary),
}))
.find(candidate => candidate.centerSlot && candidate.auxiliarySlot)
if (!root || !sidebarSlot || !contract) {
report('required layout slots are unavailable', {
root: Boolean(root), sidebar: Boolean(sidebarSlot),
main: Boolean(root?.querySelector('[data-slot="main"]')),
rightbar: Boolean(root?.querySelector('[data-slot="rightbar"]')),
conversation: Boolean(root?.querySelector('[data-slot="conversation"]')),
details: Boolean(root?.querySelector('[data-slot="details"]')),
})
return null
}
const { centerSlot, auxiliarySlot } = contract
const sidebar = sidebarSlot?.parentElement
const center = centerSlot?.parentElement
const auxiliary = auxiliarySlot?.parentElement
if (!sidebar || !center || !auxiliary) {
report('required layout region containers are unavailable', {
sidebar: Boolean(sidebar), center: Boolean(center), auxiliary: Boolean(auxiliary),
})
return null
}
const frame = closestCommonContainer(root, [sidebar, center, auxiliary])
if (!frame) {
report('common layout container is unavailable')
return null
}
return {
root,
frame,
sidebar,
center,
auxiliary,
sidebarSlot,
centerSlot,
auxiliarySlot,
layoutVersion: contract.version,
conversationSlot: centerSlot,
details: auxiliary,
detailsSlot: auxiliarySlot,
}
}
function createRc7Adapter({ document, warn } = {}) {
const owned = []
let mounted
let lastDiagnostic
const writeWarning = typeof warn === 'function'
? warn
: (...args) => document?.defaultView?.console?.warn?.(...args)
function reportLayoutIssue(message, details) {
const signature = `${message}:${JSON.stringify(details ?? {})}`
if (signature === lastDiagnostic) return
lastDiagnostic = signature
writeWarning(`[dsh-theme-prts] ${message}`, details)
}
return {
mount() {
if (mounted) return mounted
const regions = resolveRc7Regions(document, reportLayoutIssue)
if (!regions) return null
lastDiagnostic = undefined
for (const [node, value] of [
[regions.frame, 'frame'],
[regions.sidebar, 'sessions'],
[regions.center, 'operation'],
[regions.auxiliary, 'auxiliary'],
]) {
owned.push([node, node.getAttribute('data-prts-region')])
node.setAttribute('data-prts-region', value)
}
mounted = regions
return mounted
},
dispose() {
for (const [node, previous] of owned.splice(0).reverse()) {
if (previous === null) node.removeAttribute('data-prts-region')
else node.setAttribute('data-prts-region', previous)
}
mounted = undefined
},
}
}

function createCursorAdapter({ document, window, assets }) {
const root = document?.documentElement
let listening = false
let pointerId
let timer
let mode
let pressX
let pressY
let handPhase
const reducedMedia = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
const frameProperty = '--prts-hand-frame'
function clearTimer() {
if (timer !== undefined) window.clearTimeout(timer)
timer = undefined
}
function reset() {
clearTimer()
pointerId = undefined
root?.style.removeProperty(frameProperty)
root?.style.removeProperty('--prts-text-frame')
mode = undefined
handPhase = undefined
}
function show(url) {
const [x, y] = mode === 'text' ? assets.textHotspot : assets.hotspot
root.style.setProperty(mode === 'text' ? '--prts-text-frame' : frameProperty, `url("${url}") ${x} ${y}`)
}
function reduced() {
return root.dataset.prtsMotion === 'reduced' || reducedMedia?.matches
}
function play(frames, done) {
clearTimer()
let index = 0
function next() {
timer = undefined
if (index >= frames.length - 1) { done(); return }
const frame = frames[index++]
show(frame.url)
timer = window.setTimeout(next, frame.duration)
}
next()
}
function down(event) {
if (event.pointerType !== 'mouse' || event.button !== 0 || event.isPrimary === false) return
const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
const cursor = target ? window.getComputedStyle(target).cursor : ''
reset()
if (!cursor.includes('data:image/png')) return
mode = /,\s*text$/.test(cursor) ? 'text' : 'hand'
pointerId = event.pointerId
pressX = event.clientX
pressY = event.clientY
if (mode === 'text') {
if (reduced() || !assets.textClick) { reset(); return }
play(assets.textClick, reset)
return
}
if (reduced()) { clearTimer(); show(assets.hold); return }
handPhase = 'press'
play(assets.press, () => {
handPhase = 'hold'
show(assets.hold)
if (pointerId === undefined) timer = window.setTimeout(releaseHand, 48)
})
}
function releaseHand() {
handPhase = 'release'
play(assets.release, reset)
}
function up(event) {
if (pointerId === undefined || event.pointerId !== pointerId || event.button !== 0) return
pointerId = undefined
if (mode === 'text') return
if (reduced()) { reset(); return }
if (handPhase === 'press') return
releaseHand()
}
function move(event) {
if (mode === 'text') {
const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
const cursor = target ? window.getComputedStyle(target).cursor : ''
const selecting = pointerId === event.pointerId && (event.buttons & 1) && Math.hypot(event.clientX - pressX, event.clientY - pressY) > 4
if (!/,\s*text$/.test(cursor) || selecting) reset()
return
}
if (pointerId !== undefined && event.pointerId === pointerId && !(event.buttons & 1)) reset()
}
function leave(event) { if (!event.relatedTarget) reset() }
function blur(event) {
if (event.target === window) reset()
}
function visibility() { if (document.hidden) reset() }
const events = [['pointerdown', down], ['pointerup', up], ['pointermove', move], ['pointercancel', reset], ['blur', blur], ['dragstart', reset], ['pointerout', leave]]
function dispose() {
reset()
if (!listening) return
for (const [name, handler] of events) window.removeEventListener(name, handler, true)
document.removeEventListener('visibilitychange', visibility)
listening = false
}
return {
update(preferences) {
if (!root || !assets || !preferences.enabled || preferences.cursor !== 'prts') { dispose(); return }
if (listening) return
for (const [name, handler] of events) window.addEventListener(name, handler, true)
document.addEventListener('visibilitychange', visibility)
listening = true
},
dispose,
}
}

const ROOT_ATTRIBUTES = [
'data-dsh-prts',
'data-prts-scheme',
'data-prts-texture',
'data-prts-glass',
'data-prts-motion',
'data-prts-cursor',
'data-prts-particle-pattern',
'data-prts-session-flow',
'data-prts-session-glow',
'data-prts-session-flow-palette',
'data-prts-session-flow-speed',
'data-prts-conversation-style',
]
const SESSION_FLOW_COLOR_PROPERTIES = {
'--prts-session-flow-back': 'sessionFlowColorBack',
'--prts-session-flow-core': 'sessionFlowColorCore',
'--prts-session-flow-front': 'sessionFlowColorFront',
}
const TRANSITION_ATTRIBUTE = 'data-prts-scheme-transition'
const TRANSITION_MODE_ATTRIBUTE = 'data-prts-scheme-transition-mode'
const TRANSITION_INTERACTIVE_ATTRIBUTE = 'data-prts-scheme-transition-interactive'
const TRANSITION_ARMED_ATTRIBUTE = 'data-prts-scheme-transition-armed'
const TRANSITION_COMPLETE_ATTRIBUTE = 'data-prts-scheme-transition-complete'
const TRANSITION_PROPERTIES = [
'--prts-scheme-origin-x',
'--prts-scheme-origin-y',
'--prts-scheme-duration',
'--prts-scheme-reveal-x',
'--prts-scheme-control-progress',
'--prts-scheme-control-meter-height',
'--prts-scheme-control-value-image',
]
const REVEAL_EDGE_OVERSCAN = 32
const REVEAL_GRID_WIDTH = 220
const REVEAL_TIMING_LIMITS = {
desktop: { minimum: 480, maximum: 560, widthFactor: .38 },
mobile: { minimum: 320, maximum: 380, widthFactor: .9 },
}
const revealValueImages = new Map()
function revealValueImageUrl(value) {
const percentage = Math.min(100, Math.max(0, Math.round(Number(value) || 0)))
if (revealValueImages.has(percentage)) return revealValueImages.get(percentage)
const label = String(percentage).padStart(3, '0')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="11" viewBox="0 0 24 11"><text x="0" y="9" fill="#ffd400" font-family="monospace" font-size="10" font-weight="700">${label}</text></svg>`
const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
revealValueImages.set(percentage, url)
return url
}
function themeIdentity(value) {
if (typeof value === 'string') return value
if (!value || typeof value !== 'object') return ''
const active = value.active
if (active && typeof active === 'object') {
const resolved = active.colorScheme || active.scheme || active.appearance || active.mode || active.id || active.name
if (resolved) return resolved
}
return value.colorScheme || value.scheme || value.appearance || value.mode || value.id || value.name || value.preference || ''
}
function resolveScheme(value) {
const identity = String(themeIdentity(value)).toLowerCase()
return identity.includes('dark') || identity.includes('night') ? 'dark' : 'light'
}
function createThemeController({ document, window, cssText, service, cursorAssets, onTransitionStateChange = () => {} }) {
if (!document || !window) {
const gesture = { update() {}, finish() {}, cancel() {} }
return { apply() {}, sync() {}, refresh() {}, setTheme() {}, beginThemeTransition() { return gesture }, toggle() {}, dispose() {} }
}
const cursor = createCursorAdapter({ document, window, assets: cursorAssets })
const root = document.documentElement
let style
let disposed = false
let refreshRevision = 0
let setRevision = 0
let transitionRevision = 0
let activeTransition
let transitionStateActive = false
function setTransitionState(active) {
const next = Boolean(active)
if (transitionStateActive === next) return
transitionStateActive = next
try { onTransitionStateChange(next) } catch {}
}
function clearTransitionState() {
root.removeAttribute(TRANSITION_ATTRIBUTE)
root.removeAttribute(TRANSITION_MODE_ATTRIBUTE)
root.removeAttribute(TRANSITION_INTERACTIVE_ATTRIBUTE)
root.removeAttribute(TRANSITION_ARMED_ATTRIBUTE)
root.removeAttribute(TRANSITION_COMPLETE_ATTRIBUTE)
for (const property of TRANSITION_PROPERTIES) root.style.removeProperty(property)
}
function cancelActiveTransition({ keepPaused = false } = {}) {
const current = activeTransition
activeTransition = undefined
current?.cancel?.()
current?.viewTransition?.skipTransition?.()
clearTransitionState()
if (!keepPaused) setTransitionState(false)
}
function clearThemeState() {
for (const attribute of ROOT_ATTRIBUTES) root.removeAttribute(attribute)
for (const property of Object.keys(SESSION_FLOW_COLOR_PROPERTIES)) root.style.removeProperty(property)
clearTransitionState()
}
function removeOwnedState() {
cursor.dispose()
disposed = true
refreshRevision += 1
setRevision += 1
cancelActiveTransition()
clearThemeState()
root.removeAttribute('data-dsh-prts-settings')
style?.remove()
style = undefined
}
function ensureStyle() {
if (!style?.isConnected) {
style = document.createElement('style')
style.dataset.plugin = 'dsh-theme-prts'
style.dataset.pluginCss = 'dsh-theme-prts/prts.css'
document.head.appendChild(style)
}
if (style.textContent !== cssText) style.textContent = cssText
root.setAttribute('data-dsh-prts-settings', '')
}
function applyScheme(value) {
if (disposed) return
const next = resolveScheme(value)
root.dataset.prtsScheme = next
return next
}
function sync(value) {
if (disposed) return
const next = resolveScheme(value)
if (activeTransition) {
if (next === activeTransition.target) return root.dataset.prtsScheme
if (activeTransition.interactive && next === activeTransition.source) return root.dataset.prtsScheme
if (next !== root.dataset.prtsScheme) cancelActiveTransition()
}
return applyScheme(next)
}
function fallbackTheme() {
return root.dataset.theme || root.getAttribute('data-color-scheme') || root.style.colorScheme || 'light'
}
function refresh() {
const revision = ++refreshRevision
let value
try { value = service?.getTheme?.() } catch { value = undefined }
if (value && typeof value.then === 'function') {
return value.then(next => {
if (!disposed && revision === refreshRevision) sync(next)
return next
}).catch(() => {
if (!disposed && revision === refreshRevision) sync(fallbackTheme())
})
}
sync(value ?? fallbackTheme())
return value
}
function prefersReducedMotion() {
if (root.dataset.prtsMotion === 'reduced') return true
try { return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true } catch { return false }
}
function canAnimateScheme(options) {
const animationAvailable = typeof document.startViewTransition === 'function'
&& typeof root.animate === 'function'
return options?.animate === true
&& animationAvailable
&& !prefersReducedMotion()
}
function transitionOrigin(origin) {
const width = Math.max(Number(window.innerWidth) || 0, Number(root.clientWidth) || 0)
const height = Math.max(Number(window.innerHeight) || 0, Number(root.clientHeight) || 0)
const clamp = (value, maximum, fallback) => Math.min(maximum, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback))
const x = clamp(origin?.x, width, width / 2)
const y = clamp(origin?.y, height, height / 2)
return { x, y }
}
function revealViewport(origin) {
const geometry = transitionOrigin(origin)
const width = Math.max(1, Number(window.innerWidth) || 0, Number(root.clientWidth) || 0)
const height = Math.max(1, Number(window.innerHeight) || 0, Number(root.clientHeight) || 0)
return { ...geometry, width, height }
}
function revealDuration(width) {
const limits = width <= 720 ? REVEAL_TIMING_LIMITS.mobile : REVEAL_TIMING_LIMITS.desktop
return Math.min(limits.maximum, Math.max(limits.minimum, Math.round(width * limits.widthFactor)))
}
function revealProgress(value) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return 0
return Math.min(1, Math.max(0, numeric))
}
function removeRevealHud(session) {
const hud = session?.hud
if (!hud) return
try {
if (hud.matches?.(':popover-open')) hud.hidePopover?.()
} catch {}
hud.remove()
session.hud = undefined
session.hudGrid = undefined
session.hudEdge = undefined
session.hudMark = undefined
session.hudMeterFill = undefined
session.hudLabel = undefined
session.hudValue = undefined
}
function updateRevealHud(session) {
if (!session || session.settled) return
const percentage = Math.round(revealProgress(session.progress) * 100)
if (session.hudEdge) session.hudEdge.dataset.prtsSchemeRevealSide = 'left'
root.style.setProperty('--prts-scheme-control-progress', String(session.progress))
root.style.setProperty('--prts-scheme-control-meter-height', `${revealProgress(session.progress) * 48}px`)
root.style.setProperty('--prts-scheme-control-value-image', revealValueImageUrl(percentage))
root.toggleAttribute(TRANSITION_ARMED_ATTRIBUTE, session.interactive && session.progress >= .5)
}
function releaseRevealHud(session) {
if (!session?.hud || session.settled) return Promise.resolve()
session.hud.dataset.prtsSchemeRevealState = 'complete'
root.setAttribute(TRANSITION_COMPLETE_ATTRIBUTE, '')
return new Promise(resolve => window.setTimeout(resolve, 100))
}
function mountRevealHud(session) {
if (session.settled || session.hud || !document.body) return
const hud = document.createElement('div')
hud.dataset.prtsSchemeReveal = session.target
hud.dataset.prtsSchemeRevealMode = session.interactive ? 'interactive' : 'automatic'
hud.setAttribute('aria-hidden', 'true')
hud.setAttribute('popover', 'manual')
const grid = document.createElement('i')
grid.dataset.prtsSchemeRevealGrid = ''
const edge = document.createElement('span')
edge.dataset.prtsSchemeRevealEdge = ''
const blend = document.createElement('i')
blend.dataset.prtsSchemeRevealBlend = ''
const node = document.createElement('span')
node.dataset.prtsSchemeRevealNode = ''
const meter = document.createElement('i')
meter.dataset.prtsSchemeRevealMeter = ''
const meterFill = document.createElement('i')
meterFill.dataset.prtsSchemeRevealMeterFill = ''
const label = document.createElement('span')
label.dataset.prtsSchemeRevealLabel = ''
label.textContent = 'CTRL'
const mark = document.createElement('i')
mark.dataset.prtsSchemeRevealMark = ''
const value = document.createElement('span')
value.dataset.prtsSchemeRevealValue = ''
meter.appendChild(meterFill)
node.append(meter, label, value, mark)
edge.append(grid, blend, node)
hud.appendChild(edge)
document.body.appendChild(hud)
session.hud = hud
session.hudGrid = grid
session.hudEdge = edge
session.hudMark = mark
session.hudMeterFill = meterFill
session.hudLabel = label
session.hudValue = value
updateRevealHud(session)
try { hud.showPopover?.() } catch {}
}
function revealTargetX(session, progress) {
if (progress === 0) return -REVEAL_EDGE_OVERSCAN
if (progress === 1) return session.geometry.width + REVEAL_EDGE_OVERSCAN
return progress * session.geometry.width
}
function revealPixels(value) {
const rounded = Math.round(value * 1000) / 1000
return `${Object.is(rounded, -0) ? 0 : rounded}px`
}
function revealClipPath(session, x) {
return `inset(0 ${revealPixels(Math.max(0, session.geometry.width - x))} 0 0)`
}
function revealEdgeTransform(x) {
return `translate3d(${revealPixels(x - 1)}, 0, 0)`
}
function revealGridPosition(x) {
return `${revealPixels(REVEAL_GRID_WIDTH - x)} 0px`
}
function revealGroupTranslate(x) {
return `${revealPixels(x)} 0px`
}
function revealNamedAnimation(keyframes, options, pseudoElement) {
return root.animate(keyframes, { ...options, pseudoElement })
}
function createInteractiveScrub(session) {
if (!session.interactive || session.settled || session.scrubAnimations) return
try {
const options = {
duration: session.duration,
easing: 'linear',
fill: 'both',
}
const clip = revealNamedAnimation([
{ clipPath: revealClipPath(session, 0) },
{ clipPath: revealClipPath(session, session.geometry.width) },
], options, '::view-transition-new(root)')
const edge = revealNamedAnimation([
{ translate: revealGroupTranslate(0) },
{ translate: revealGroupTranslate(session.geometry.width) },
], options, '::view-transition-group(prts-scheme-edge)')
const node = revealNamedAnimation([
{ translate: revealGroupTranslate(0) },
{ translate: revealGroupTranslate(session.geometry.width) },
], options, '::view-transition-group(prts-scheme-node)')
const grid = revealNamedAnimation([
{ translate: revealGroupTranslate(0) },
{ translate: revealGroupTranslate(session.geometry.width) },
], options, '::view-transition-group(prts-scheme-grid)')
const gridPhase = revealNamedAnimation([
{ backgroundPosition: revealGridPosition(0) },
{ backgroundPosition: revealGridPosition(session.geometry.width) },
], options, '::view-transition-new(prts-scheme-grid)')
const mark = revealNamedAnimation([
{ offset: 0, translate: revealGroupTranslate(0), rotate: '45deg' },
{ offset: .49, translate: revealGroupTranslate(session.geometry.width * .49), rotate: '45deg' },
{ offset: .51, translate: revealGroupTranslate(session.geometry.width * .51), rotate: '225deg' },
{ offset: 1, translate: revealGroupTranslate(session.geometry.width), rotate: '225deg' },
], options, '::view-transition-group(prts-scheme-mark)')
session.scrubAnimations = [clip, edge, node, grid, gridPhase, mark]
for (const animation of session.scrubAnimations) {
animation.pause?.()
animation.currentTime = session.progress * session.duration
}
} catch {}
}
function setRevealProgress(session, value) {
if (!session || session.settled) return
session.progress = revealProgress(value)
session.revealX = session.progress * session.geometry.width
root.style.setProperty('--prts-scheme-reveal-x', `${session.revealX}px`)
if (session.scrubAnimations) {
try {
for (const animation of session.scrubAnimations) {
animation.pause?.()
animation.currentTime = session.progress * session.duration
}
} catch {}
}
updateRevealHud(session)
}
function cancelRevealAnimation(session) {
const animations = session?.progressAnimations || []
session.progressAnimations = undefined
for (const animation of animations) {
try { animation?.cancel?.() } catch {}
}
for (const animation of session?.completedAnimations || []) {
try { animation?.cancel?.() } catch {}
}
if (session) session.completedAnimations = undefined
for (const animation of session?.scrubAnimations || []) {
try { animation?.cancel?.() } catch {}
}
if (session) session.scrubAnimations = undefined
}
function animateRevealTo(session, value, duration, easing) {
if (!session || session.settled) return Promise.resolve(false)
cancelRevealAnimation(session)
const targetProgress = revealProgress(value)
const targetX = revealTargetX(session, targetProgress)
if (!(duration > 0)) {
setRevealProgress(session, targetProgress)
return Promise.resolve(true)
}
let animations
try {
const options = {
duration: Math.round(duration),
easing,
fill: 'forwards',
}
const clip = root.animate([
{ clipPath: revealClipPath(session, session.revealX) },
{ clipPath: revealClipPath(session, targetX) },
], {
...options,
pseudoElement: '::view-transition-new(root)',
})
const edge = revealNamedAnimation([
{ translate: revealGroupTranslate(session.revealX) },
{ translate: revealGroupTranslate(targetX) },
], options, '::view-transition-group(prts-scheme-edge)')
const node = revealNamedAnimation([
{ translate: revealGroupTranslate(session.revealX) },
{ translate: revealGroupTranslate(targetX) },
], options, '::view-transition-group(prts-scheme-node)')
const grid = revealNamedAnimation([
{ translate: revealGroupTranslate(session.revealX) },
{ translate: revealGroupTranslate(targetX) },
], options, '::view-transition-group(prts-scheme-grid)')
const gridPhase = revealNamedAnimation([
{ backgroundPosition: revealGridPosition(session.revealX) },
{ backgroundPosition: revealGridPosition(targetX) },
], options, '::view-transition-new(prts-scheme-grid)')
const nodeProgress = revealNamedAnimation([
{ backgroundSize: `2px ${session.progress * 48}px` },
{ backgroundSize: `2px ${targetProgress * 48}px` },
], options, '::view-transition-new(prts-scheme-node)')
const mark = revealNamedAnimation([
{ translate: revealGroupTranslate(session.revealX), rotate: session.progress >= .5 ? '225deg' : '45deg' },
{ translate: revealGroupTranslate(targetX), rotate: targetProgress >= .5 ? '225deg' : '45deg' },
], options, '::view-transition-group(prts-scheme-mark)')
animations = [clip, edge, node, grid, gridPhase, nodeProgress, mark]
} catch {
setRevealProgress(session, targetProgress)
return Promise.resolve(true)
}
session.progressAnimations = animations
return Promise.all(animations.map(animation => Promise.resolve(animation?.finished).then(() => true, () => false))).then(results => {
const completed = results.every(Boolean)
if (!completed || session.settled || session.progressAnimations !== animations) return false
session.progressAnimations = undefined
session.completedAnimations = animations
session.progress = targetProgress
session.revealX = targetX
root.style.setProperty('--prts-scheme-reveal-x', `${session.revealX}px`)
updateRevealHud(session)
return true
})
}
function requestHostScheme(value) {
try {
return Promise.resolve(service?.setTheme?.(value)).then(() => true, () => false)
} catch {
return Promise.resolve(false)
}
}
function restoreRevealSource(session) {
if (!session) return Promise.resolve(false)
session.restoreRequested = true
if (session.restorePromise) return session.restorePromise
session.restorePromise = Promise.resolve(session.hostRequest).then(async accepted => {
if (accepted && !(await requestHostScheme(session.source))) return false
applyScheme(session.source)
return true
})
return session.restorePromise
}
function finishRevealSession(session, { commit }) {
if (!session || session.settled) return
session.committed = commit
session.settled = true
cancelRevealAnimation(session)
if (!commit) applyScheme(session.source)
try { session.viewTransition?.skipTransition?.() } catch {}
removeRevealHud(session)
if (activeTransition?.token === session.token) activeTransition = undefined
clearTransitionState()
setTransitionState(false)
}
function createRevealSession(target, options = {}) {
cancelActiveTransition({ keepPaused: true })
setTransitionState(true)
const source = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
const geometry = revealViewport(options.origin)
const interactive = options.interactive === true
const initialProgress = interactive ? revealProgress(options.progress) : 0
const duration = revealDuration(geometry.width)
const token = ++transitionRevision
let resolveUpdateReady
const session = {
token,
target,
source,
geometry,
interactive,
progress: initialProgress,
revealX: interactive ? initialProgress * geometry.width : -REVEAL_EDGE_OVERSCAN,
duration,
settled: false,
committed: false,
updateReady: new Promise(resolve => { resolveUpdateReady = resolve }),
}
root.style.setProperty('--prts-scheme-origin-x', `${geometry.x}px`)
root.style.setProperty('--prts-scheme-origin-y', `${geometry.y}px`)
root.style.setProperty('--prts-scheme-duration', `${interactive ? 3600000 : duration}ms`)
root.style.setProperty('--prts-scheme-reveal-x', `${session.revealX}px`)
root.style.setProperty('--prts-scheme-control-progress', String(initialProgress))
root.style.setProperty('--prts-scheme-control-meter-height', `${initialProgress * 48}px`)
root.style.setProperty('--prts-scheme-control-value-image', revealValueImageUrl(initialProgress * 100))
root.setAttribute(TRANSITION_ATTRIBUTE, target)
root.setAttribute(TRANSITION_MODE_ATTRIBUTE, 'view')
root.toggleAttribute(TRANSITION_INTERACTIVE_ATTRIBUTE, interactive)
session.cancel = () => {
if (session.settled) return
session.settled = true
cancelRevealAnimation(session)
if (session.interactive && !session.committed) void restoreRevealSource(session)
removeRevealHud(session)
}
activeTransition = session
let viewTransition
try {
viewTransition = document.startViewTransition(() => {
session.hostRequest = requestHostScheme(target).then(accepted => {
if (!accepted && activeTransition?.token === token && !session.settled) {
finishRevealSession(session, { commit: false })
}
return accepted
})
applyScheme(target)
mountRevealHud(session)
resolveUpdateReady(true)
})
} catch {
resolveUpdateReady(false)
if (activeTransition?.token === token) activeTransition = undefined
removeRevealHud(session)
clearTransitionState()
applyScheme(source)
setTransitionState(false)
return undefined
}
session.viewTransition = viewTransition
session.ready = Promise.all([
Promise.resolve(viewTransition?.ready).then(() => true, () => false),
session.updateReady,
]).then(([viewReady, updateReady]) => {
const ready = viewReady && updateReady
if (ready && activeTransition?.token === token && !session.settled) {
createInteractiveScrub(session)
}
return ready
})
return session
}
async function commitRevealScheme(target, origin) {
const session = createRevealSession(target, { origin })
if (!session) return root.dataset.prtsScheme
const ready = await session.ready
if (!ready) {
if (!session.settled) finishRevealSession(session, { commit: false })
return session.source
}
if (activeTransition?.token !== session.token || session.settled) return root.dataset.prtsScheme
await animateRevealTo(session, 1, session.duration, 'cubic-bezier(.4, 0, .2, 1)')
if (!(await session.hostRequest)) {
if (!session.settled) finishRevealSession(session, { commit: false })
return session.source
}
if (activeTransition?.token !== session.token || session.settled) return root.dataset.prtsScheme
await releaseRevealHud(session)
if (activeTransition?.token === session.token && !session.settled) finishRevealSession(session, { commit: true })
return target
}
function fallbackGesture(target, source) {
let progress = 0
let settled = false
return {
update(value) { if (!settled) progress = revealProgress(value) },
finish(commit = progress >= .5) {
if (settled) return root.dataset.prtsScheme
settled = true
return commit ? setTheme(target, { animate: false }) : source
},
cancel() {
if (settled) return source
settled = true
return source
},
}
}
function beginThemeTransition(id, options = {}) {
const target = id === 'dark' ? 'dark' : 'light'
const source = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
if (disposed || target === source || !canAnimateScheme({ ...options, animate: true })) return fallbackGesture(target, source)
const session = createRevealSession(target, { ...options, interactive: true })
if (!session) return fallbackGesture(target, source)
let finishPromise
const finish = commit => {
if (finishPromise) return finishPromise
if (session.settled || activeTransition?.token !== session.token) return Promise.resolve(root.dataset.prtsScheme)
root.removeAttribute(TRANSITION_INTERACTIVE_ATTRIBUTE)
root.toggleAttribute(TRANSITION_ARMED_ATTRIBUTE, commit)
if (session.hud) session.hud.dataset.prtsSchemeRevealMode = 'settling'
const visualDuration = commit
? Math.max(90, Math.round(session.duration * (1 - session.progress)))
: Math.max(90, Math.round(session.duration * session.progress * .72))
const visual = session.ready.then(ready => {
if (!ready || session.settled) return false
return animateRevealTo(
session,
commit ? 1 : 0,
visualDuration,
commit ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.4, 0, .2, 1)',
)
})
if (!commit) {
finishPromise = visual.then(async () => {
await releaseRevealHud(session)
await restoreRevealSource(session)
if (!session.settled) finishRevealSession(session, { commit: false })
return session.source
})
return finishPromise
}
finishPromise = visual.then(async () => {
if (!(await session.hostRequest)) {
if (!session.settled) finishRevealSession(session, { commit: false })
refresh()
return root.dataset.prtsScheme
}
await releaseRevealHud(session)
if (!session.settled) finishRevealSession(session, { commit: true })
return target
})
return finishPromise
}
return {
update(progress) {
if (session.settled || activeTransition?.token !== session.token) return
setRevealProgress(session, progress)
},
finish,
cancel() { return finish(false) },
}
}
function commitAnimatedScheme(target, origin) {
return commitRevealScheme(target, origin)
}
function setTheme(id, options = {}) {
const target = id === 'dark' ? 'dark' : 'light'
const revision = ++setRevision
const animate = canAnimateScheme(options) && target !== root.dataset.prtsScheme
if (animate) return commitAnimatedScheme(target, options.origin)
const commit = () => {
if (disposed || revision !== setRevision) return root.dataset.prtsScheme
return applyScheme(target)
}
const fail = () => {
if (disposed || revision !== setRevision) return root.dataset.prtsScheme
const result = refresh()
if (result && typeof result.then === 'function') {
return result.then(() => root.dataset.prtsScheme)
}
return root.dataset.prtsScheme
}
try {
const result = service?.setTheme?.(target)
if (result && typeof result.then === 'function') return result.then(commit).catch(fail)
return commit()
} catch {
return fail()
}
}
function toggle() {
return setTheme(root.dataset.prtsScheme === 'dark' ? 'light' : 'dark')
}
return {
apply(value) {
disposed = false
const preferences = normalizePreferences(value)
ensureStyle()
cursor.update(preferences)
if (!preferences.enabled) {
cancelActiveTransition()
clearThemeState()
return
}
root.setAttribute('data-dsh-prts', '')
root.dataset.prtsTexture = preferences.texture
root.dataset.prtsGlass = preferences.glass
root.dataset.prtsMotion = preferences.motion
root.dataset.prtsCursor = preferences.cursor
root.dataset.prtsParticlePattern = 'orthogonal'
root.dataset.prtsSessionFlow = preferences.sessionFlow ? 'on' : 'off'
root.dataset.prtsSessionGlow = preferences.sessionGlow ? 'on' : 'off'
root.dataset.prtsSessionFlowPalette = preferences.sessionFlowPalette
root.dataset.prtsSessionFlowSpeed = String(preferences.sessionFlowSpeed)
for (const [property, key] of Object.entries(SESSION_FLOW_COLOR_PROPERTIES)) root.style.setProperty(property, preferences[key])
root.dataset.prtsConversationStyle = preferences.conversationStyle
refresh()
},
sync,
refresh,
setTheme,
beginThemeTransition,
toggle,
dispose: removeOwnedState,
}
}

const EMPTY_STATUS = Object.freeze({
connection: 'unknown',
connectionLabel: '未知',
})
const CONNECTION_LABELS = Object.freeze({
connected: '已连接',
connecting: '连接中',
disconnected: '已断开',
unknown: '未知',
})
function snapshotOf(source) {
try {
return source?.getSnapshot?.()
} catch {
return undefined
}
}
function subscribeTo(source, listener) {
try {
return typeof source?.subscribe === 'function' ? source.subscribe(listener) : () => {}
} catch {
return () => {}
}
}
function connectionState(connection) {
if (!connection) return 'unknown'
const stateSource = connection.state ?? connection.status
const state = snapshotOf(stateSource)
if (state === 'connected') return 'connected'
if (state === 'connecting' || state === 'reconnecting') return 'connecting'
if (state === 'disconnected') return 'disconnected'
if (connection.hostDescription?.getSnapshot) {
return snapshotOf(connection.hostDescription) ? 'connected' : 'connecting'
}
return 'unknown'
}
function projectHarnessStatus({ connection } = {}) {
const connectionValue = connectionState(connection)
return {
connection: connectionValue,
connectionLabel: CONNECTION_LABELS[connectionValue],
}
}
function equalStatus(previous, next) {
return previous?.connection === next.connection
&& previous?.connectionLabel === next.connectionLabel
}
function createHarnessStatusSource({ connection, onChange }) {
let disposed = false
let lastStatus
const stops = []
function publish() {
if (disposed) return
const nextStatus = projectHarnessStatus({ connection })
if (equalStatus(lastStatus, nextStatus)) return
lastStatus = nextStatus
onChange(nextStatus)
}
stops.push(subscribeTo(connection?.hostDescription, publish))
stops.push(subscribeTo(connection?.state ?? connection?.status, publish))
publish()
return {
refresh: publish,
dispose() {
disposed = true
for (const stop of stops.splice(0).reverse()) stop()
},
}
}

function createPrtsUiStore(defineStore, initial = {}) {
const initialPreferences = initial.preferences ?? DEFAULT_PREFERENCES
const initialStatus = initial.status ?? EMPTY_STATUS
const initialRevision = initial.revision ?? -1
return defineStore({
init: () => ({
preferences: { ...initialPreferences },
status: { ...initialStatus },
revision: initialRevision,
}),
actions: {
sync(draft, preferences, status, revision) {
if (revision <= draft.revision) return
draft.preferences = { ...preferences }
draft.status = { ...status }
draft.revision = revision
},
},
})
}

const PRTS_STARTUP_TIMINGS = Object.freeze({
enter: 20,
minimum: 1350,
intro: 560,
approach: 2400,
finish: 260,
copyFade: 90,
readyHold: 280,
exitLead: 120,
exit: 470,
completePadding: 40,
reducedExit: 160,
timeout: 20000,
timeoutHold: 700,
watchdog: 22000,
})
const STARTUP_STAGES = Object.freeze({
linking: Object.freeze({ label: 'LINKING', detail: '神经链路接入' }),
authenticating: Object.freeze({ label: 'AUTHENTICATING', detail: '博士身份校验' }),
visualOnline: Object.freeze({ label: 'VISUAL LAYER ONLINE', detail: '视觉层已上线' }),
ready: Object.freeze({ label: 'P.R.T.S. READY', detail: '终端接管完成' }),
})
function startupMarkup(prtsEmblem = '', rhodesEmblem = '') {
const ticks = Array.from({ length: 21 }, (_, index) => `<i${index % 5 === 0 ? ' data-major' : ''}></i>`).join('')
return `<section data-prts-startup data-stage="boot" popover="manual" role="status" aria-live="assertive" aria-label="P.R.T.S. 启动序列">
<div data-prts-startup-grid aria-hidden="true"></div>
<div data-prts-startup-scan aria-hidden="true"></div>
<div data-prts-startup-cut="left" aria-hidden="true"></div>
<div data-prts-startup-cut="right" aria-hidden="true"></div>
<header data-prts-startup-header aria-hidden="true">
<span>P.R.T.S. // RHODES ISLAND</span>
<small>NEURAL TERMINAL CONNECTION</small>
</header>
<aside data-prts-startup-telemetry aria-hidden="true">
<span>ORIGIN // RI-001</span>
<span>PROTOCOL // TACTICAL</span>
<span>LINK // ENCRYPTED</span>
</aside>
<main data-prts-startup-core>
<div data-prts-startup-frame aria-hidden="true">
<span data-prts-startup-frame-outer></span>
<span data-prts-startup-frame-inner></span>
<span data-prts-startup-reticle></span>
<img data-prts-startup-emblem src="${prtsEmblem}" alt="">
</div>
<div data-prts-startup-signature aria-hidden="true">
<span>${rhodesEmblem}</span>
<small>RHODES ISLAND<br>RI-001</small>
</div>
<div data-prts-startup-state>
<strong data-prts-startup-label>INITIALIZING</strong>
<span data-prts-startup-detail>启动序列初始化</span>
</div>
</main>
<footer data-prts-startup-progress>
<output aria-hidden="true">BOOT SEQUENCE // <span data-prts-startup-percent>000%</span></output>
<div data-prts-startup-track aria-hidden="true">
<b data-prts-startup-fill></b>
<span data-prts-startup-ticks>${ticks}</span>
</div>
</footer>
<div data-prts-startup-coordinate aria-hidden="true">X 061.38&nbsp;&nbsp;Y 109.42</div>
</section>`
}
function clamp01(value) {
return Math.max(0, Math.min(1, value))
}
function easeOutCubic(value) {
return 1 - Math.pow(1 - clamp01(value), 3)
}
function approachProgressAt(elapsed, duration) {
if (!(duration > 0)) return 90
return 90 * easeOutCubic(elapsed / duration)
}
function approachVelocityAt(elapsed, duration) {
if (!(duration > 0)) return 0
const remaining = 1 - clamp01(elapsed / duration)
return 270 * remaining * remaining / duration
}
function finishProgressAt(startProgress, startVelocity, elapsed, duration) {
if (!(duration > 0)) return 100
const progressDelta = Math.max(0, 100 - startProgress)
if (progressDelta === 0) return 100
const time = clamp01(elapsed / duration)
const timeSquared = time * time
const timeCubed = timeSquared * time
const startWeight = 2 * timeCubed - 3 * timeSquared + 1
const velocityWeight = timeCubed - 2 * timeSquared + time
const endWeight = -2 * timeCubed + 3 * timeSquared
const startTangent = Math.min(progressDelta * 3, Math.max(0, startVelocity) * duration)
const progress = startWeight * startProgress
+ velocityWeight * startTangent
+ endWeight * 100
return Math.max(startProgress, Math.min(100, progress))
}
function findNativeHarnessLoader(document) {
return document?.querySelector?.('[data-dsh-boot]') ?? null
}
function matchesOpenTopLayer(node) {
for (const selector of [':modal', ':popover-open']) {
try {
if (node?.matches?.(selector)) return true
} catch {}
}
return false
}
function hostHasOpenTopLayer(document, overlay) {
const candidates = [...(document?.querySelectorAll?.('dialog[open], [popover]') ?? [])]
return candidates.some(node => node !== overlay && matchesOpenTopLayer(node))
}
function createPrtsStartupSequence({
document,
window,
prtsEmblem = '',
rhodesEmblem = '',
timings = PRTS_STARTUP_TIMINGS,
onActiveChange = () => {},
onReady = () => {},
} = {}) {
const schedule = { ...PRTS_STARTUP_TIMINGS, ...timings }
let overlay
let frame
let inertRecords = []
let previousFocus
let startedAt
let waitForReady = false
let readyWhen
let hostReady = false
let finishStartedAt
let finishStartedProgress = 0
let finishStartedVelocity = 0
let readyStartedAt
let exitStartedAt
let timeoutStartedAt
let currentStage = 'boot'
let pendingStage
let copyTransitionStartedAt
let lastProgress = -1
let lastRoundedProgress = -1
let useReducedMotion = false
let progressFill
let progressPercent
let activeReported = false
let readyReported = false
const now = () => window?.performance?.now?.() ?? Date.now()
const requestFrame = callback => window?.requestAnimationFrame?.(callback)
?? window?.setTimeout?.(() => callback(now()), 16)
const cancelFrame = id => {
if (id === undefined) return
if (window?.cancelAnimationFrame) window.cancelAnimationFrame(id)
else window?.clearTimeout?.(id)
}
function notify(callback, value) {
try {
callback(value)
} catch {
}
}
function reportActive(active) {
const next = Boolean(active)
if (activeReported === next) return
activeReported = next
notify(onActiveChange, next)
}
function restoreInteractivity() {
for (const record of inertRecords) {
if (!record.node?.isConnected) continue
record.node.inert = record.inert
if (record.hadAttribute) record.node.setAttribute('inert', '')
else record.node.removeAttribute('inert')
}
inertRecords = []
}
function cleanup({ restoreFocus = true } = {}) {
cancelFrame(frame)
frame = undefined
document?.removeEventListener?.('visibilitychange', onVisibilityChange)
document?.documentElement?.removeAttribute?.('data-prts-startup-active')
try {
overlay?.hidePopover?.()
} catch {
}
overlay?.remove?.()
overlay = undefined
progressFill = undefined
progressPercent = undefined
restoreInteractivity()
if (restoreFocus && previousFocus?.isConnected) previousFocus.focus?.()
previousFocus = undefined
reportActive(false)
}
function updateProgress(progress) {
if (!overlay) return
const safeProgress = Math.max(0, Math.min(100, progress))
if (Math.abs(safeProgress - lastProgress) < .01) return
lastProgress = safeProgress
if (progressFill) progressFill.style.transform = `scaleX(${(safeProgress / 100).toFixed(4)})`
const roundedProgress = Math.round(safeProgress)
if (progressPercent && roundedProgress !== lastRoundedProgress) {
lastRoundedProgress = roundedProgress
progressPercent.textContent = `${String(roundedProgress).padStart(3, '0')}%`
}
}
function applyStage(name) {
if (!overlay) return
const stage = STARTUP_STAGES[name]
if (!stage) return
currentStage = name
overlay.dataset.stage = name
const label = overlay.querySelector('[data-prts-startup-label]')
const detail = overlay.querySelector('[data-prts-startup-detail]')
if (label) label.textContent = stage.label
if (detail) detail.textContent = stage.detail
overlay.setAttribute('aria-label', `P.R.T.S. 启动序列：${stage.detail}`)
if (name === 'ready' && !readyReported) {
readyReported = true
notify(onReady)
}
}
function requestStage(name, elapsed) {
if (!overlay || name === currentStage && !pendingStage) return
if (!pendingStage) {
copyTransitionStartedAt = elapsed
overlay.setAttribute('data-copy-transition', '')
}
pendingStage = name
}
function advanceStageTransition(elapsed) {
if (!pendingStage || copyTransitionStartedAt === undefined) return
if (elapsed - copyTransitionStartedAt < schedule.copyFade) return
const next = pendingStage
pendingStage = undefined
copyTransitionStartedAt = undefined
applyStage(next)
overlay?.removeAttribute('data-copy-transition')
if (next === 'ready') readyStartedAt = elapsed
}
function stageForProgress(progress) {
if (progress >= 68) return 'visualOnline'
if (progress >= 32) return 'authenticating'
return 'linking'
}
function beginExit(elapsed, { failOpen = false } = {}) {
if (!overlay || exitStartedAt !== undefined) return
exitStartedAt = elapsed
overlay.toggleAttribute('data-fail-open', failOpen)
overlay.setAttribute('data-exit-content', '')
if (useReducedMotion) overlay.setAttribute('data-exiting', '')
}
function onVisibilityChange() {
if (document?.visibilityState === 'hidden') cleanup({ restoreFocus: false })
}
function reducedMotionRequested(forceReduced) {
if (typeof forceReduced === 'boolean') return forceReduced
return document?.documentElement?.dataset?.prtsMotion === 'reduced'
|| window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
}
function lockSiblings() {
inertRecords = [...(document?.body?.children ?? [])]
.filter(node => node !== overlay)
.map(node => ({ node, hadAttribute: node.hasAttribute('inert'), inert: Boolean(node.inert) }))
for (const record of inertRecords) {
record.node.inert = true
record.node.setAttribute('inert', '')
}
}
function promoteToTopLayer() {
if (!hostHasOpenTopLayer(document, overlay)) {
overlay?.removeAttribute('popover')
return
}
if (typeof overlay?.showPopover !== 'function') {
overlay?.removeAttribute('popover')
return
}
try {
overlay.showPopover()
} catch {
overlay.removeAttribute('popover')
}
}
function checkHostReady() {
if (hostReady) return true
if (!waitForReady) return (hostReady = true)
try {
if (readyWhen?.() === true) hostReady = true
} catch {
}
return hostReady
}
function tick(timestamp) {
if (!overlay) return
const time = Number.isFinite(timestamp) ? timestamp : now()
startedAt ??= time
const elapsed = Math.max(0, time - startedAt)
checkHostReady()
if (!overlay.hasAttribute('data-visible') && elapsed >= schedule.enter) {
overlay.setAttribute('data-visible', '')
}
if (useReducedMotion) {
if (!hostReady && timeoutStartedAt === undefined && elapsed >= schedule.timeout) {
timeoutStartedAt = elapsed
}
if (timeoutStartedAt !== undefined && elapsed - timeoutStartedAt >= schedule.timeoutHold) {
beginExit(elapsed, { failOpen: true })
} else if (hostReady) {
beginExit(elapsed)
}
if (exitStartedAt !== undefined && elapsed - exitStartedAt >= schedule.reducedExit + schedule.completePadding) {
cleanup()
return
}
} else if (timeoutStartedAt !== undefined) {
updateProgress(90)
if (elapsed - timeoutStartedAt >= schedule.timeoutHold) beginExit(elapsed, { failOpen: true })
} else {
const approachProgress = approachProgressAt(elapsed, schedule.approach)
let progress = Math.min(90, approachProgress)
if (!hostReady && elapsed >= schedule.timeout) {
timeoutStartedAt = elapsed
} else if (hostReady && elapsed >= schedule.intro) {
if (finishStartedAt === undefined) {
finishStartedAt = elapsed
finishStartedProgress = progress
finishStartedVelocity = approachVelocityAt(elapsed, schedule.approach)
}
progress = finishProgressAt(
finishStartedProgress,
finishStartedVelocity,
elapsed - finishStartedAt,
schedule.finish,
)
if (elapsed - finishStartedAt >= schedule.finish) {
progress = 100
requestStage('ready', elapsed)
} else {
requestStage(stageForProgress(progress), elapsed)
}
} else {
requestStage(stageForProgress(progress), elapsed)
}
updateProgress(progress)
if (readyStartedAt !== undefined) {
const earliestExit = Math.max(
readyStartedAt + schedule.readyHold,
schedule.minimum - schedule.exit - schedule.completePadding,
)
if (elapsed >= earliestExit) beginExit(elapsed)
}
}
advanceStageTransition(elapsed)
if (exitStartedAt !== undefined) {
if (!useReducedMotion && elapsed - exitStartedAt >= schedule.exitLead) {
overlay?.setAttribute('data-exiting', '')
}
const exitDuration = useReducedMotion ? schedule.reducedExit : schedule.exit
if (elapsed - exitStartedAt >= exitDuration + schedule.completePadding) {
cleanup()
return
}
}
if (elapsed >= schedule.watchdog) {
cleanup()
return
}
frame = requestFrame(tick)
}
function play({ reduced, waitForReady: shouldWait = false, readyWhen: isReady } = {}) {
if (overlay?.isConnected || !document?.body) return false
const template = document.createElement('template')
template.innerHTML = startupMarkup(prtsEmblem, rhodesEmblem).trim()
overlay = template.content.firstElementChild
if (!overlay) return false
startedAt = undefined
waitForReady = Boolean(shouldWait)
readyWhen = typeof isReady === 'function' ? isReady : undefined
hostReady = !waitForReady
finishStartedAt = undefined
readyStartedAt = undefined
exitStartedAt = undefined
timeoutStartedAt = undefined
finishStartedVelocity = 0
currentStage = 'boot'
pendingStage = undefined
copyTransitionStartedAt = undefined
lastProgress = -1
activeReported = false
readyReported = false
useReducedMotion = reducedMotionRequested(reduced)
previousFocus = document.activeElement
lastRoundedProgress = -1
document.body.appendChild(overlay)
progressFill = overlay.querySelector('[data-prts-startup-fill]')
progressPercent = overlay.querySelector('[data-prts-startup-percent]')
promoteToTopLayer()
document.documentElement.setAttribute('data-prts-startup-active', '')
lockSiblings()
reportActive(true)
document.addEventListener('visibilitychange', onVisibilityChange)
if (useReducedMotion) {
overlay.setAttribute('data-reduced-motion', '')
overlay.setAttribute('data-visible', '')
applyStage('visualOnline')
updateProgress(90)
}
frame = requestFrame(tick)
return true
}
return {
play,
ready() { hostReady = true },
stop: cleanup,
dispose: cleanup,
isActive: () => Boolean(overlay?.isConnected),
}
}

function createSettingsPage(React, meta = {}) {
const h = React.createElement
return function PrtsPluginSettingsPage({ useStore, updatePreference }) {
const { preferences } = useStore(state => ({ preferences: state.preferences }))
const safeMode = Boolean(meta.safeMode)
const enabled = Boolean(preferences.enabled) && !safeMode
const bootAnimation = preferences.bootAnimation !== false
const settingRow = ({ key, title, description, checked, disabled = false, onChange }) => h('div', {
className: 'prts-plugin-settings__row',
key,
'data-prts-plugin-setting': key,
},
h('span', { className: 'prts-plugin-settings__copy' },
h('strong', null, title),
h('small', null, description),
),
h('button', {
type: 'button',
role: 'switch',
className: checked ? 'is-active' : '',
'aria-label': title,
'aria-checked': String(checked),
disabled,
onClick: onChange,
}, h('span', { 'aria-hidden': true })),
)
return h('section', {
className: 'prts-plugin-settings',
'data-prts-plugin-settings': '',
'data-prts-settings-enabled': String(enabled),
'aria-label': 'P.R.T.S. 插件设置',
},
h('header', { className: 'prts-plugin-settings__header' },
h('h3', null, 'P.R.T.S.'),
h('p', null, '完整外观设置位于主界面左上角的罗德岛徽记。'),
),
safeMode && h('p', { className: 'prts-plugin-settings__safe', role: 'status' },
'安全模式已暂停主题。移除地址中的 ?prts-safe=1 后即可恢复。',
),
h('div', { className: 'prts-plugin-settings__list' },
settingRow({
key: 'enabled',
title: '启用 P.R.T.S. 主题',
description: safeMode ? '安全模式下无法启用主题' : '控制 P.R.T.S. 外观是否加载',
checked: enabled,
disabled: safeMode,
onChange: () => { if (!safeMode) updatePreference('enabled', !preferences.enabled) },
}),
settingRow({
key: 'bootAnimation',
title: '播放启动动画',
description: '刷新或启用主题时显示 P.R.T.S. 启动动画',
checked: bootAnimation,
onChange: () => updatePreference('bootAnimation', !bootAnimation),
}),
),
)
}
}

const SETTINGS_FOCUSABLE = [
'button:not([disabled])',
'input:not([disabled])',
'summary',
'[href]',
'[tabindex]:not([tabindex="-1"])',
].join(',')
const PRESET_OPTIONS = [
['standard-tactical', '标准战术', '完整底纹 / 标准玻璃 / 系统动效'],
['clear-glass', '清晰玻璃', '克制底纹 / 清晰玻璃 / 系统动效'],
['quiet-reading', '静谧阅读', '克制底纹 / 柔和玻璃 / 减少动效'],
]
const COMMON_CONTROLS = [
['cursor', '鼠标样式', [['system', '系统'], ['prts', 'PRTS 手形']]],
['railDefaultHidden', '默认隐藏导航栏', [['false', '关闭'], ['true', '开启']]],
['texture', '环境底纹', [['off', '关闭'], ['restrained', '克制'], ['full', '完整']]],
['glass', '玻璃材质', [['off', '关闭'], ['soft', '柔和'], ['standard', '标准'], ['clear', '清晰']]],
['motion', '动态效果', [['system', '跟随系统'], ['reduced', '减少']]],
['sessionFlow', '当前会话流线', [['false', '关闭'], ['true', '开启']]],
['sessionGlow', '流线光效', [['false', '关闭'], ['true', '开启']]],
['sessionFlowPalette', '流线色调', [['triad', '三色'], ['rhodes', '青蓝'], ['amber', '金黄'], ['alert', '赤红'], ['custom', '自定义']]],
]
const SESSION_FLOW_COLOR_CONTROLS = [
['sessionFlowColorBack', '后层'],
['sessionFlowColorCore', '中层'],
['sessionFlowColorFront', '前层'],
]
const PARTICLE_OPTIONS = [
['compact', '精简', 7],
['standard', '标准', 12],
['precise', '精细', 18],
]
function settingButtons(key, label, options) {
const note = key === 'glass'
? '<small data-prts-setting-note data-prts-transparency-status hidden>系统当前要求降低透明度</small>'
: key === 'motion'
? '<small data-prts-setting-note data-prts-effective-motion hidden>系统当前要求减少动态</small>'
: key === 'railDefaultHidden'
? '<small data-prts-setting-note>在任意窗口宽度下默认收起 P.R.T.S. 导航，可从左侧按钮临时展开</small>'
: key === 'conversationStyle'
? '<small data-prts-setting-note>立即切换会话背景、头像与消息气泡</small>'
: key === 'sessionFlow'
? '<small data-prts-setting-note>仅控制当前会话卡片的三色流线</small>'
: key === 'sessionGlow'
? '<small data-prts-setting-note>为流线添加柔和的同色辉光</small>'
: key === 'sessionFlowPalette'
? '<small data-prts-setting-note>同时适配日间与夜间模式</small>'
: ''
const sample = value => key === 'texture' || key === 'glass' || key === 'sessionFlowPalette'
? `<i data-prts-option-sample="${key}" data-prts-option-sample-value="${value}" aria-hidden="true"></i>`
: ''
return `<div data-prts-setting-row="${key}">
<span><strong>${label}</strong>${note}</span>
<div role="group" aria-label="${label}">${options.map(([value, text]) => `<button type="button" data-prts-setting-key="${key}" data-prts-setting-value="${value}">${sample(value)}<span>${text}</span></button>`).join('')}</div>
</div>`
}
function presetMarkup() {
return PRESET_OPTIONS.map(([value, title, description]) => `<button type="button" data-prts-setting-key="preset" data-prts-setting-value="${value}" data-prts-preset-card>
<strong>${title}</strong><span>${description}</span>
</button>`).join('')
}
function particleMarkup() {
return PARTICLE_OPTIONS.map(([value, label, count]) => `<button type="button" role="radio" data-prts-setting-key="particleDetail" data-prts-setting-value="${value}">
<i data-prts-particle-detail-preview aria-hidden="true">${Array.from({ length: count }, () => '<b></b>').join('')}</i><span>${label}</span>
</button>`).join('')
}
function sessionFlowPreviewMarkup() {
const filaments = [
['back', 'M 3 29 C 34 8 66 36 101 17 C 126 5 151 27 177 13'],
['core', 'M 3 24 C 30 35 61 7 94 23 C 124 37 148 7 177 20'],
['front', 'M 3 18 C 34 4 66 30 96 12 C 125 -1 148 30 177 24'],
]
return `<svg data-prts-session-flow-preview viewBox="0 0 180 42" aria-label="三色流线预览" role="img">
${filaments.map(([strand, path]) => `<g data-prts-session-flow-preview-filament="${strand}">
<path data-prts-session-flow-preview-layer="halo" d="${path}"></path>
<path data-prts-session-flow-preview-layer="body" d="${path}"></path>
<path data-prts-session-flow-preview-layer="core" d="${path}"></path>
</g>`).join('')}
</svg>`
}
function sessionFlowColorMarkup() {
return `<div data-prts-setting-row="sessionFlowColors" data-prts-session-flow-colors>
<span><strong>三色调色盘</strong><small data-prts-setting-note>任意修改后切换为自定义，日夜模式均保持原色</small></span>
<div data-prts-session-flow-color-workbench>
${sessionFlowPreviewMarkup()}
<div data-prts-session-flow-color-inputs role="group" aria-label="三色流线调色盘">
${SESSION_FLOW_COLOR_CONTROLS.map(([key, label]) => `<label><span>${label}</span><input type="color" value="#ffffff" data-prts-setting-color data-prts-setting-key="${key}" aria-label="${label}流线颜色"><output data-prts-setting-color-output="${key}">#ffffff</output></label>`).join('')}
</div>
</div>
</div>`
}
function themeSettingsMarkup() {
return `<div data-prts-settings-backdrop hidden aria-hidden="true"></div>
<dialog id="prts-theme-settings" data-prts-theme-settings aria-label="P.R.T.S. 主题设置" aria-hidden="true">
<div data-prts-settings-frame>
<header data-prts-theme-settings-header>
<span><small>P.R.T.S. / 外观</small><strong>主题设置</strong></span>
<div data-prts-settings-summary aria-live="polite">
<span data-prts-settings-preset-status>标准战术</span>
<span data-prts-persistence-status hidden></span>
</div>
<button type="button" data-prts-theme-settings-close aria-label="关闭主题设置">×</button>
</header>
<div data-prts-theme-settings-scroll>
<section data-prts-settings-presets>
<header><span><small>快速配置</small><strong>视觉预设</strong></span></header>
<div>${presetMarkup()}</div>
</section>
<section data-prts-settings-common>
<header><span><small>常用设置</small><strong>主题表现</strong></span></header>
<div data-prts-settings-common-grid>${COMMON_CONTROLS.map(([key, label, options]) => settingButtons(key, label, options)).join('')}
${sessionFlowColorMarkup()}
<label data-prts-setting-row="sessionFlowSpeed" data-prts-setting-range-row data-prts-session-flow-speed>
<span><strong>流线速度</strong><small data-prts-setting-note>控制当前会话流线的形变速度</small></span>
<div><input type="range" min="0.25" max="2" step="0.25" value="1" data-prts-setting-range data-prts-setting-key="sessionFlowSpeed" aria-label="当前会话流线速度"><output data-prts-session-flow-speed-output>1× · 标准</output></div>
</label>
${settingButtons('conversationStyle', '会话主题', [['native', '原有'], ['deck-chat', '通讯链路']])}
</div>
</section>
<details data-prts-settings-advanced>
<summary><span><small>精细调整</small><strong>粒子效果</strong></span><output data-prts-advanced-summary>标准 / 1×</output></summary>
<div data-prts-settings-advanced-content>
<section data-prts-particle-detail>
<header><strong>粒子精度</strong><span>同时调整会话与新会话徽记</span></header>
<div role="radiogroup" aria-label="粒子精度">${particleMarkup()}</div>
<label data-prts-setting-row="particleTraversalSpeed" data-prts-setting-range-row data-prts-particle-traversal>
<span><strong>跟随移动速度</strong><small>控制普通会话徽记移动及破碎重组的滚动距离</small></span>
<div><input type="range" min="0" max="2" step="0.25" value="1" data-prts-setting-range data-prts-setting-key="particleTraversalSpeed" aria-label="粒子徽记跟随移动速度"><output data-prts-particle-traversal-output>1× · 每 1 个视口重组</output></div>
</label>
<span data-prts-particle-error role="alert" hidden>粒子资源加载异常，主题已使用静态后备效果</span>
</section>
</div>
</details>
<footer data-prts-settings-actions>
<div data-prts-persistence-error hidden role="alert">
<span><strong>仅本次会话生效</strong><small>无法写入本地设置，当前视觉效果仍会保留。</small></span>
<button type="button" data-prts-retry-save>重试保存</button>
</div>
<div data-prts-reset-zone>
<span><strong>恢复主题默认</strong><small>保留主题开关和启动动画设置</small></span>
<button type="button" data-prts-reset-visual>恢复默认</button>
<div data-prts-reset-confirm hidden role="group" aria-label="确认恢复主题默认">
<span>确认恢复全部主题参数？</span>
<button type="button" data-prts-reset-confirm-action>确认恢复</button>
<button type="button" data-prts-reset-cancel>取消</button>
</div>
</div>
</footer>
</div>
</div>
</dialog>`
}
function createThemeSettingsOverlay({
document,
trigger,
panel,
backdrop,
onOpen = () => {},
onPreferenceChange = () => {},
onPreferencePreview = () => {},
onResetVisual = () => {},
onRetrySave = () => {},
}) {
const window = document?.defaultView
const transparencyMedia = window?.matchMedia?.('(prefers-reduced-transparency: reduce)')
const motionMedia = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
const nativeModal = typeof panel?.showModal === 'function' && typeof panel?.close === 'function'
let isOpen = false
let previousFocus
let currentPreferences
let currentStatus
let currentPersistence = { phase: 'idle', revision: 0 }
let particleTraversalSpeedDraft
let particleTraversalSpeedDirty = false
let sessionFlowSpeedDraft
let sessionFlowSpeedDirty = false
let sessionFlowColorDrafts = {}
const sessionFlowColorDirty = new Set()
let savedTimer
let feedbackTimer
let feedbackTarget
let renderedPersistenceRevision = -1
function focusable() {
return [...(panel?.querySelectorAll?.(SETTINGS_FOCUSABLE) ?? [])].filter(node => !node.hidden && !node.disabled && node.closest('[hidden]') === null)
}
function reducedMotion() {
return document?.documentElement?.dataset?.prtsMotion === 'reduced' || motionMedia?.matches
}
function showPanel() {
if (nativeModal) {
if (!panel.open) panel.showModal()
backdrop.hidden = true
return
}
panel.setAttribute('open', '')
panel.setAttribute('data-prts-dialog-fallback', '')
backdrop.hidden = false
backdrop.setAttribute('data-prts-settings-visible', '')
}
function hidePanel() {
if (nativeModal) {
if (panel.open) panel.close()
} else {
panel.removeAttribute('open')
panel.removeAttribute('data-prts-dialog-fallback')
backdrop.removeAttribute('data-prts-settings-visible')
backdrop.hidden = true
}
}
function setResetConfirmation(visible) {
const confirmation = panel?.querySelector?.('[data-prts-reset-confirm]')
const reset = panel?.querySelector?.('[data-prts-reset-visual]')
if (confirmation) confirmation.hidden = !visible
if (reset) reset.hidden = visible
}
function setOpen(next, restoreFocus = true) {
if (!panel || !backdrop || !trigger) return false
const value = Boolean(next)
if (value === isOpen) return isOpen
if (!value) {
commitParticleTraversalSpeed()
commitSessionFlowSpeed()
commitSessionFlowColors()
}
isOpen = value
trigger.setAttribute('aria-expanded', String(isOpen))
document.documentElement.toggleAttribute('data-prts-settings-open', isOpen)
panel.setAttribute('aria-hidden', String(!isOpen))
if (isOpen) {
previousFocus = document.activeElement
onOpen()
showPanel()
panel.setAttribute('data-prts-settings-visible', '')
;(panel.querySelector('[data-prts-theme-settings-close]') ?? focusable()[0] ?? panel).focus?.()
} else {
panel.removeAttribute('data-prts-settings-visible')
hidePanel()
setResetConfirmation(false)
if (restoreFocus) (trigger.isConnected ? trigger : previousFocus)?.focus?.()
}
return isOpen
}
function normalizeParticleTraversalSpeed(value) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return PARTICLE_TRAVERSAL_SPEED_DEFAULT
const clamped = Math.min(PARTICLE_TRAVERSAL_SPEED_MAX, Math.max(PARTICLE_TRAVERSAL_SPEED_MIN, numeric))
return Math.round(clamped / PARTICLE_TRAVERSAL_SPEED_STEP) * PARTICLE_TRAVERSAL_SPEED_STEP
}
function currentParticleTraversalSpeed() {
return normalizeParticleTraversalSpeed(
particleTraversalSpeedDirty ? particleTraversalSpeedDraft : currentPreferences?.particleTraversalSpeed,
)
}
function normalizeSessionFlowSpeed(value) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return SESSION_FLOW_SPEED_DEFAULT
const clamped = Math.min(SESSION_FLOW_SPEED_MAX, Math.max(SESSION_FLOW_SPEED_MIN, numeric))
return Math.round(clamped / SESSION_FLOW_SPEED_STEP) * SESSION_FLOW_SPEED_STEP
}
function currentSessionFlowSpeed() {
return normalizeSessionFlowSpeed(
sessionFlowSpeedDirty ? sessionFlowSpeedDraft : currentPreferences?.sessionFlowSpeed,
)
}
function normalizeSessionFlowColor(value, fallback = '#ffffff') {
return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : fallback
}
function currentSessionFlowColor(key) {
return normalizeSessionFlowColor(
sessionFlowColorDirty.has(key) ? sessionFlowColorDrafts[key] : currentPreferences?.[key],
'#ffffff',
)
}
function activeSessionFlowPalette() {
return sessionFlowColorDirty.size > 0 ? 'custom' : currentPreferences?.sessionFlowPalette
}
function conciseNumber(value) {
return String(Number(Number(value).toFixed(2)))
}
function particleTraversalLabel(value) {
const speed = normalizeParticleTraversalSpeed(value)
if (speed === 0) return '0× · 静止 / 不重组'
return `${conciseNumber(speed)}× · 每 ${conciseNumber(1 / speed)} 个视口重组`
}
function renderParticleTraversal() {
if (!panel || !currentPreferences) return
const value = currentParticleTraversalSpeed()
const range = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="particleTraversalSpeed"]')
if (range && range.value !== String(value)) range.value = String(value)
setText(panel.querySelector('[data-prts-particle-traversal-output]'), particleTraversalLabel(value))
}
function sessionFlowSpeedLabel(value) {
const speed = normalizeSessionFlowSpeed(value)
const description = speed < 1 ? '缓慢' : speed === 1 ? '标准' : speed <= 1.5 ? '快速' : '高速'
return `${conciseNumber(speed)}× · ${description}`
}
function renderSessionFlowSpeed() {
if (!panel || !currentPreferences) return
const value = currentSessionFlowSpeed()
const range = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="sessionFlowSpeed"]')
if (range && range.value !== String(value)) range.value = String(value)
setText(panel.querySelector('[data-prts-session-flow-speed-output]'), sessionFlowSpeedLabel(value))
}
function renderSessionFlowColors() {
if (!panel || !currentPreferences) return
for (const [key] of SESSION_FLOW_COLOR_CONTROLS) {
const value = currentSessionFlowColor(key)
const input = panel.querySelector(`input[data-prts-setting-color][data-prts-setting-key="${key}"]`)
if (input && input.value !== value) input.value = value
setText(panel.querySelector(`[data-prts-setting-color-output="${key}"]`), value)
}
const preview = panel.querySelector('[data-prts-session-flow-preview]')
if (preview) {
preview.dataset.prtsSessionFlowPreviewPalette = activeSessionFlowPalette() || 'triad'
preview.style.setProperty('--prts-session-flow-back', currentSessionFlowColor('sessionFlowColorBack'))
preview.style.setProperty('--prts-session-flow-core', currentSessionFlowColor('sessionFlowColorCore'))
preview.style.setProperty('--prts-session-flow-front', currentSessionFlowColor('sessionFlowColorFront'))
}
for (const button of panel.querySelectorAll('button[data-prts-setting-key="sessionFlowPalette"]')) {
const selected = button.dataset.prtsSettingValue === activeSessionFlowPalette()
button.classList.toggle('is-selected', selected)
button.setAttribute('aria-pressed', String(selected))
}
}
function setText(node, value) {
if (node && node.textContent !== value) node.textContent = value
}
function commitParticleTraversalSpeed() {
if (!particleTraversalSpeedDirty || !currentPreferences) return false
const value = currentParticleTraversalSpeed()
particleTraversalSpeedDirty = false
particleTraversalSpeedDraft = value
if (value !== normalizeParticleTraversalSpeed(currentPreferences.particleTraversalSpeed)) {
onPreferenceChange('particleTraversalSpeed', value)
} else {
renderParticleTraversal()
}
return true
}
function commitSessionFlowSpeed() {
if (!sessionFlowSpeedDirty || !currentPreferences) return false
const value = currentSessionFlowSpeed()
sessionFlowSpeedDirty = false
sessionFlowSpeedDraft = value
if (value !== normalizeSessionFlowSpeed(currentPreferences.sessionFlowSpeed)) {
onPreferenceChange('sessionFlowSpeed', value)
} else {
renderSessionFlowSpeed()
}
return true
}
function commitSessionFlowColor(key) {
if (!sessionFlowColorDirty.has(key) || !currentPreferences) return false
const value = currentSessionFlowColor(key)
sessionFlowColorDirty.delete(key)
sessionFlowColorDrafts[key] = value
if (value !== normalizeSessionFlowColor(currentPreferences[key]) || currentPreferences.sessionFlowPalette !== 'custom') {
onPreferenceChange(key, value)
} else {
renderSessionFlowColors()
}
return true
}
function commitSessionFlowColors() {
let committed = false
for (const key of [...sessionFlowColorDirty]) committed = commitSessionFlowColor(key) || committed
return committed
}
function renderPersistence() {
const status = panel?.querySelector?.('[data-prts-persistence-status]')
const error = panel?.querySelector?.('[data-prts-persistence-error]')
if (!status || !error) return
const phase = currentPersistence?.phase || 'idle'
const revision = Number(currentPersistence?.revision) || 0
const failed = phase === 'error'
error.hidden = !failed
if (phase === 'saved' && revision === renderedPersistenceRevision) return
if (savedTimer !== undefined) window?.clearTimeout?.(savedTimer)
savedTimer = undefined
status.hidden = phase !== 'saved'
status.textContent = phase === 'saved' ? '已保存' : ''
if (phase === 'saved') {
renderedPersistenceRevision = revision
savedTimer = window?.setTimeout?.(() => { status.hidden = true; savedTimer = undefined }, reducedMotion() ? 500 : 1200)
}
}
function renderState() {
if (!panel || !currentPreferences) return
const particleDetail = resolveParticleDetail(currentPreferences)
for (const button of panel.querySelectorAll('button[data-prts-setting-key]')) {
const key = button.dataset.prtsSettingKey
const actual = key === 'particleDetail'
? particleDetail
: key === 'sessionFlowPalette'
? activeSessionFlowPalette()
: key === 'sessionFlow' || key === 'sessionGlow'
? currentPreferences[key] !== false
: currentPreferences[key]
const selected = String(actual) === button.dataset.prtsSettingValue
button.classList.toggle('is-selected', selected)
button.setAttribute('aria-pressed', String(selected))
if (button.getAttribute('role') === 'radio') button.setAttribute('aria-checked', String(selected))
}
const presetLabels = { 'standard-tactical': '标准战术', 'clear-glass': '清晰玻璃', 'quiet-reading': '静谧阅读', custom: '自定义' }
const preset = presetLabels[currentPreferences.preset] || '自定义'
const presetStatus = panel.querySelector('[data-prts-settings-preset-status]')
if (presetStatus) presetStatus.textContent = preset
const motionStatus = panel.querySelector('[data-prts-effective-motion]')
if (motionStatus) motionStatus.hidden = !(currentPreferences.motion === 'system' && motionMedia?.matches)
const transparency = panel.querySelector('[data-prts-transparency-status]')
if (transparency) transparency.hidden = !(currentPreferences.glass !== 'off' && transparencyMedia?.matches)
const particleError = panel.querySelector('[data-prts-particle-error]')
if (particleError) particleError.hidden = currentStatus?.particle?.phase !== 'error'
if (!particleTraversalSpeedDirty) particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(currentPreferences.particleTraversalSpeed)
if (!sessionFlowSpeedDirty) sessionFlowSpeedDraft = normalizeSessionFlowSpeed(currentPreferences.sessionFlowSpeed)
for (const [key] of SESSION_FLOW_COLOR_CONTROLS) {
if (!sessionFlowColorDirty.has(key)) sessionFlowColorDrafts[key] = normalizeSessionFlowColor(currentPreferences[key])
}
renderParticleTraversal()
renderSessionFlowSpeed()
renderSessionFlowColors()
renderPersistence()
}
function markFeedback(target) {
if (!target) return
if (feedbackTimer !== undefined) window?.clearTimeout?.(feedbackTimer)
feedbackTarget?.removeAttribute?.('data-prts-setting-feedback')
feedbackTarget = target
target.setAttribute('data-prts-setting-feedback', '')
feedbackTimer = window?.setTimeout?.(() => {
target.removeAttribute('data-prts-setting-feedback')
if (feedbackTarget === target) feedbackTarget = undefined
feedbackTimer = undefined
}, 300)
}
function onPanelClick(event) {
if (event.target === panel) { setOpen(false); return }
const target = event.target?.closest?.('button')
if (!target) return
if (target.hasAttribute('data-prts-theme-settings-close')) { setOpen(false); return }
if (target.hasAttribute('data-prts-setting-key')) {
const raw = target.dataset.prtsSettingValue
if (target.dataset.prtsSettingKey === 'sessionFlowPalette') {
sessionFlowColorDirty.clear()
sessionFlowColorDrafts = {}
}
markFeedback(target)
onPreferenceChange(target.dataset.prtsSettingKey, raw === 'true' ? true : raw === 'false' ? false : raw)
return
}
if (target.hasAttribute('data-prts-retry-save')) { onRetrySave(); return }
if (target.hasAttribute('data-prts-reset-visual')) { setResetConfirmation(true); return }
if (target.hasAttribute('data-prts-reset-cancel')) { setResetConfirmation(false); return }
if (target.hasAttribute('data-prts-reset-confirm-action')) {
particleTraversalSpeedDirty = false
particleTraversalSpeedDraft = undefined
sessionFlowSpeedDirty = false
sessionFlowSpeedDraft = undefined
sessionFlowColorDirty.clear()
sessionFlowColorDrafts = {}
setResetConfirmation(false)
onResetVisual()
}
}
function onPanelInput(event) {
const target = event.target
if (target?.matches?.('input[data-prts-setting-color]')) {
const key = target.dataset.prtsSettingKey
const value = normalizeSessionFlowColor(target.value, currentSessionFlowColor(key))
sessionFlowColorDrafts[key] = value
sessionFlowColorDirty.add(key)
renderSessionFlowColors()
onPreferencePreview(key, value)
return
}
if (!target?.matches?.('input[data-prts-setting-range]')) return
const value = Number(target.value)
if (!Number.isFinite(value)) return
if (target.dataset.prtsSettingKey === 'particleTraversalSpeed') {
particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(value)
particleTraversalSpeedDirty = true
renderParticleTraversal()
onPreferencePreview('particleTraversalSpeed', particleTraversalSpeedDraft)
return
} else if (target.dataset.prtsSettingKey === 'sessionFlowSpeed') {
sessionFlowSpeedDraft = normalizeSessionFlowSpeed(value)
sessionFlowSpeedDirty = true
renderSessionFlowSpeed()
onPreferencePreview('sessionFlowSpeed', sessionFlowSpeedDraft)
return
} else {
return
}
}
function onKeydown(event) {
if (!isOpen) return
if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
if (nativeModal || event.key !== 'Tab') return
const nodes = focusable()
if (!nodes.length) return
const first = nodes[0]
const last = nodes.at(-1)
if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
function onCancel(event) { event.preventDefault(); setOpen(false) }
const toggle = () => setOpen(!isOpen)
const closeFromBackdrop = () => setOpen(false)
const renderMediaState = () => renderState()
const commitFromControl = event => {
const target = event.target
if (target?.matches?.('input[data-prts-setting-color]')) {
if (event.type === 'change' || event.type === 'focusout') commitSessionFlowColor(target.dataset.prtsSettingKey)
return
}
if (!target?.matches?.('input[data-prts-setting-range]')) return
if (target.dataset.prtsSettingKey === 'particleTraversalSpeed') commitParticleTraversalSpeed()
if (target.dataset.prtsSettingKey === 'sessionFlowSpeed') commitSessionFlowSpeed()
}
trigger?.addEventListener('click', toggle)
panel?.addEventListener('click', onPanelClick)
panel?.addEventListener('cancel', onCancel)
panel?.addEventListener('input', onPanelInput)
panel?.addEventListener('change', commitFromControl)
panel?.addEventListener('pointerup', commitFromControl)
panel?.addEventListener('focusout', commitFromControl)
backdrop?.addEventListener('click', closeFromBackdrop)
document.addEventListener('keydown', onKeydown)
transparencyMedia?.addEventListener?.('change', renderMediaState)
motionMedia?.addEventListener?.('change', renderMediaState)
return {
update(preferences, status, persistenceState = currentPersistence) {
currentPreferences = preferences
currentStatus = status
currentPersistence = persistenceState ?? { phase: 'idle', revision: 0 }
if (!particleTraversalSpeedDirty) particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(preferences?.particleTraversalSpeed)
if (!sessionFlowSpeedDirty) sessionFlowSpeedDraft = normalizeSessionFlowSpeed(preferences?.sessionFlowSpeed)
for (const [key] of SESSION_FLOW_COLOR_CONTROLS) {
if (!sessionFlowColorDirty.has(key)) sessionFlowColorDrafts[key] = normalizeSessionFlowColor(preferences?.[key])
}
renderState()
},
open: () => setOpen(true),
close: () => setOpen(false),
toggle,
dispose() {
isOpen = false
hidePanel()
if (savedTimer !== undefined) window?.clearTimeout?.(savedTimer)
if (feedbackTimer !== undefined) window?.clearTimeout?.(feedbackTimer)
feedbackTarget?.removeAttribute?.('data-prts-setting-feedback')
trigger?.setAttribute('aria-expanded', 'false')
trigger?.removeEventListener('click', toggle)
panel?.removeEventListener('click', onPanelClick)
panel?.removeEventListener('cancel', onCancel)
panel?.removeEventListener('input', onPanelInput)
panel?.removeEventListener('change', commitFromControl)
panel?.removeEventListener('pointerup', commitFromControl)
panel?.removeEventListener('focusout', commitFromControl)
backdrop?.removeEventListener('click', closeFromBackdrop)
document.removeEventListener('keydown', onKeydown)
transparencyMedia?.removeEventListener?.('change', renderMediaState)
motionMedia?.removeEventListener?.('change', renderMediaState)
document.documentElement.removeAttribute('data-prts-settings-open')
},
}
}

const RESIZE_SHIELD_ATTRIBUTE = 'data-prts-resize-shield'
const DEFAULT_SETTLE_DELAY = 180
function createResizeShieldAdapter({
window,
settleDelay = DEFAULT_SETTLE_DELAY,
} = {}) {
let targets = []
let settleTimer
let started = false
function setActive(active) {
for (const node of targets) {
if (!node || node.hasAttribute?.(RESIZE_SHIELD_ATTRIBUTE) === active) continue
node.toggleAttribute?.(RESIZE_SHIELD_ATTRIBUTE, active)
}
}
function clearTimer() {
if (settleTimer === undefined) return
window?.clearTimeout?.(settleTimer)
settleTimer = undefined
}
function settle() {
settleTimer = undefined
setActive(false)
}
function onResize() {
if (!started) return
if (Number(window?.innerWidth) <= 640) {
clearTimer()
setActive(false)
return
}
setActive(true)
clearTimer()
settleTimer = window?.setTimeout?.(settle, settleDelay)
}
function dispose() {
clearTimer()
window?.removeEventListener?.('resize', onResize)
setActive(false)
targets = []
started = false
}
return {
start(nextTargets = []) {
const resolved = [...new Set(nextTargets)].filter(Boolean)
if (!window || !resolved.length) {
dispose()
return false
}
if (started) {
clearTimer()
setActive(false)
window.removeEventListener?.('resize', onResize)
}
targets = resolved
started = true
window.addEventListener?.('resize', onResize, { passive: true })
return true
},
dispose,
}
}

const PHONE_RAIL_BREAKPOINT = 640
const RAIL_HOLD_DELAY_MS = 350
const RAIL_HOLD_MOVE_TOLERANCE = 8
const RAIL_SWIPE_THRESHOLD = 32
const RAIL_SWIPE_AXIS_RATIO = 1.25
function setText(root, selector, value) {
const node = root?.querySelector(selector)
const next = String(value ?? '')
if (node && node.textContent !== next) node.textContent = next
}
function markup(emblem) {
return `<div data-prts-shell data-plugin="dsh-theme-prts">
<button type="button" data-prts-rail-launcher aria-label="打开 P.R.T.S. 导航" aria-controls="prts-nav-rail" aria-expanded="false"><span aria-hidden="true">P.R.T.S.</span><i data-prts-rail-gesture-cue aria-hidden="true">⌄<br>⌄</i></button>
<nav id="prts-nav-rail" data-prts-nav-rail aria-label="P.R.T.S. 导航">
<button type="button" data-prts-rail-brand aria-label="P.R.T.S. 终端设置" aria-controls="prts-theme-settings" aria-expanded="false">${emblem || ''}<span>P.R.T.S.</span></button>
<div data-prts-nav-bottom>
<div data-prts-connection-indicator data-state="unknown" tabindex="0" role="status" aria-label="Harness 主机连接状态：未知">
<i aria-hidden="true"></i><span data-prts-connection-label>未知</span>
</div>
<button type="button" data-prts-scheme-toggle aria-label="切换明暗模式">
<svg data-prts-scheme-icon="light" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path></svg>
<svg data-prts-scheme-icon="dark" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.4A8.4 8.4 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"></path></svg>
<small>明暗</small>
</button>
<button type="button" data-prts-theme-disable aria-label="退出 P.R.T.S.，返回 Harness 原生界面">
<svg data-prts-theme-disable-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8"></path><path d="M7.1 6.8a7 7 0 1 0 9.8 0"></path></svg>
<small>退出 P.R.T.S.</small>
</button>
</div>
</nav>
${themeSettingsMarkup()}
</div>`
}
function createOperationsShell({
document,
window,
assets = {},
adapter,
hostGeometry,
onSchemeToggle = () => {},
onSchemeDragStart = () => undefined,
onThemeDisable = () => {},
onPreferenceChange = () => {},
onPreferencePreview = () => {},
onVisualReset = () => {},
onRetrySave = () => {},
}) {
const root = document.documentElement
const resizeShield = createResizeShieldAdapter({ window })
let shell
let navRail
let railLauncher
let railMode
let railViewport
let railDefaultHidden = false
let railViewportQuery
let railPointerQuery
let railHoverQuery
let railPointer
let railHoldTimer
let settingsOverlay
let schemeToggle
let schemeIntent
let schemePressRevision = 0
let schemePressAnimation
let schemePointer
let suppressSchemeClick = false
let suppressSchemeClickTimer
let themeDisable
let connectionIndicator
let conversationObserver
let schemeObserver
let operationRegion
const schemePressDelays = new Set()
function reducedMotion() {
if (root.dataset.prtsMotion === 'reduced') return true
try { return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true } catch { return false }
}
function phoneRailGesture() {
if (railMode !== 'overlay' || Number(window.innerWidth) > PHONE_RAIL_BREAKPOINT) return false
return railPointerQuery?.matches === true
|| railHoverQuery?.matches === true
|| Number(window.navigator?.maxTouchPoints) > 0
}
function clearRailGesture({ release = true } = {}) {
if (railHoldTimer !== undefined) window.clearTimeout(railHoldTimer)
railHoldTimer = undefined
const pointer = railPointer
railPointer = undefined
if (release && pointer) {
try { railLauncher?.releasePointerCapture?.(pointer.pointerId) } catch {}
}
railLauncher?.removeAttribute('data-prts-rail-gesture-active')
railLauncher?.removeAttribute('data-prts-rail-gesture-ready')
railLauncher?.style?.removeProperty('--prts-rail-gesture-progress')
}
function armRailGesture() {
railHoldTimer = undefined
if (!railPointer || !phoneRailGesture()) return
railPointer.armed = true
railLauncher?.setAttribute('data-prts-rail-gesture-active', '')
}
function onRailPointerDown(event) {
if (!phoneRailGesture() || railPointer || (event.button ?? 0) !== 0) return
const pointerId = event.pointerId ?? 1
railPointer = {
pointerId,
startX: Number(event.clientX) || 0,
startY: Number(event.clientY) || 0,
armed: false,
ready: false,
}
try { railLauncher?.setPointerCapture?.(pointerId) } catch {}
railHoldTimer = window.setTimeout(armRailGesture, RAIL_HOLD_DELAY_MS)
}
function onRailPointerMove(event) {
const pointer = railPointer
if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
const deltaX = (Number(event.clientX) || 0) - pointer.startX
const deltaY = (Number(event.clientY) || 0) - pointer.startY
if (!pointer.armed) {
if (Math.hypot(deltaX, deltaY) > RAIL_HOLD_MOVE_TOLERANCE) clearRailGesture()
return
}
event.preventDefault?.()
if (Math.abs(deltaX) > Math.max(RAIL_HOLD_MOVE_TOLERANCE, Math.max(0, deltaY) / RAIL_SWIPE_AXIS_RATIO)) {
clearRailGesture()
return
}
const progress = Math.min(1, Math.max(0, deltaY) / RAIL_SWIPE_THRESHOLD)
pointer.ready = deltaY >= RAIL_SWIPE_THRESHOLD
&& deltaY >= Math.abs(deltaX) * RAIL_SWIPE_AXIS_RATIO
railLauncher?.style?.setProperty('--prts-rail-gesture-progress', Math.round(progress * 12) + 'px')
railLauncher?.toggleAttribute('data-prts-rail-gesture-ready', pointer.ready)
}
function onRailPointerUp(event) {
const pointer = railPointer
if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
const shouldOpen = pointer.armed && pointer.ready
clearRailGesture()
if (shouldOpen) openRail()
}
function onRailLostPointerCapture(event) {
if (!railPointer || (event.pointerId ?? 1) !== railPointer.pointerId) return
clearRailGesture({ release: false })
}
function onRailClick(event) {
if (phoneRailGesture() && Number(event?.detail) > 0) {
event.preventDefault?.()
return
}
toggleRail()
}
function playSchemePress() {
if (!schemeToggle || reducedMotion()) return
const revision = ++schemePressRevision
schemePressAnimation?.cancel?.()
schemePressAnimation = undefined
schemeToggle.removeAttribute('data-prts-scheme-press')
if (typeof schemeToggle.animate === 'function') {
const animation = schemeToggle.animate([
{ transform: 'translateY(0) scale(1)' },
{ transform: 'translateY(0) scale(.96)', offset: 0.5 },
{ transform: 'translateY(0) scale(1)' },
], { duration: 100, easing: 'cubic-bezier(.22, 1, .36, 1)' })
schemePressAnimation = animation
Promise.resolve(animation.finished).catch(() => {}).finally(() => {
if (revision === schemePressRevision && schemePressAnimation === animation) schemePressAnimation = undefined
})
return
}
schemeToggle.setAttribute('data-prts-scheme-press', '')
const entry = { timer: undefined }
entry.timer = window.setTimeout(() => {
schemePressDelays.delete(entry)
if (revision === schemePressRevision) schemeToggle?.removeAttribute('data-prts-scheme-press')
}, 100)
schemePressDelays.add(entry)
}
function clearSchemePressDelays() {
schemePressRevision += 1
schemePressAnimation?.cancel?.()
schemePressAnimation = undefined
schemeToggle?.removeAttribute('data-prts-scheme-press')
for (const entry of schemePressDelays) {
window.clearTimeout(entry.timer)
}
schemePressDelays.clear()
}
function schemeTarget() {
const current = schemeIntent ?? (root.dataset.prtsScheme === 'dark' ? 'dark' : 'light')
return current === 'dark' ? 'light' : 'dark'
}
function schemeOrigin() {
const rect = schemeToggle?.getBoundingClientRect?.()
return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined
}
function syncConversationState() {
if (!operationRegion) return
const candidate = operationRegion.querySelector(
'[data-chat-flow-kind]:not([hidden]):not([aria-hidden="true"]), [data-message-role]:not([hidden]):not([aria-hidden="true"])',
)
const active = Boolean(candidate)
root.dataset.prtsConversationState = active ? 'active' : 'idle'
}
function toggleScheme(event) {
if (suppressSchemeClick && Number(event?.detail) > 0) {
event?.preventDefault?.()
clearSchemeClickSuppression()
return
}
clearSchemeClickSuppression()
const next = schemeTarget()
schemeIntent = next
playSchemePress()
let request
try { request = onSchemeToggle(next, { origin: schemeOrigin() }) } catch { request = undefined }
Promise.resolve(request).catch(() => {}).finally(() => {
if (schemeIntent === next) schemeIntent = undefined
})
}
function schemePointerProgress(event) {
const width = Math.max(1, Number(window.innerWidth) || Number(root.clientWidth) || 1)
return Math.min(1, Math.max(0, Number(event?.clientX) / width || 0))
}
function clearSchemeClickSuppression() {
if (suppressSchemeClickTimer !== undefined) window.clearTimeout(suppressSchemeClickTimer)
suppressSchemeClickTimer = undefined
suppressSchemeClick = false
}
function suppressNextSchemeClick() {
clearSchemeClickSuppression()
suppressSchemeClick = true
suppressSchemeClickTimer = window.setTimeout(() => {
suppressSchemeClickTimer = undefined
suppressSchemeClick = false
}, 1000)
}
function settleSchemePointer({ commit = false } = {}) {
const pointer = schemePointer
if (!pointer) return
schemePointer = undefined
try { schemeToggle?.releasePointerCapture?.(pointer.pointerId) } catch {}
if (!pointer.dragging) return
suppressNextSchemeClick()
let result
try { result = pointer.gesture?.finish?.(commit) } catch { result = undefined }
Promise.resolve(result).catch(() => {}).finally(() => {
if (schemeIntent === pointer.target) schemeIntent = undefined
})
}
function onSchemePointerDown(event) {
if ((event.button ?? 0) !== 0 || schemePointer) return
clearSchemeClickSuppression()
const pointerId = event.pointerId ?? 1
schemePointer = {
pointerId,
startX: Number(event.clientX) || 0,
startY: Number(event.clientY) || 0,
target: schemeTarget(),
origin: schemeOrigin(),
dragging: false,
gesture: undefined,
}
try { schemeToggle?.setPointerCapture?.(pointerId) } catch {}
}
function onSchemePointerMove(event) {
const pointer = schemePointer
if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
const deltaX = (Number(event.clientX) || 0) - pointer.startX
if (!pointer.dragging) {
if (deltaX < 8) return
pointer.dragging = true
schemeIntent = pointer.target
playSchemePress()
const progress = schemePointerProgress(event)
try {
pointer.gesture = onSchemeDragStart(pointer.target, {
origin: pointer.origin,
progress,
clientX: Number(event.clientX) || 0,
})
} catch {
pointer.gesture = undefined
}
}
event.preventDefault?.()
pointer.gesture?.update?.(schemePointerProgress(event))
}
function onSchemePointerUp(event) {
const pointer = schemePointer
if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
const commit = pointer.dragging && schemePointerProgress(event) >= .5
settleSchemePointer({ commit })
}
function cancelSchemePointer() {
const pointer = schemePointer
if (!pointer) return
if (pointer.dragging) {
try { pointer.gesture?.cancel?.() } catch {}
}
schemePointer = undefined
try { schemeToggle?.releasePointerCapture?.(pointer.pointerId) } catch {}
if (pointer.dragging) suppressNextSchemeClick()
if (schemeIntent === pointer.target) schemeIntent = undefined
}
function onSchemeLostPointerCapture(event) {
if (!schemePointer || (event.pointerId ?? 1) !== schemePointer.pointerId) return
cancelSchemePointer()
}
function syncSchemeToggle() {
if (!schemeToggle) return
const current = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
if (schemeIntent === current) schemeIntent = undefined
schemeToggle.dataset.prtsSchemeCurrent = current
schemeToggle.setAttribute('aria-label', current === 'dark' ? '切换到日间模式' : '切换到夜间模式')
}
function syncRailState() {
if (!navRail || !railLauncher) return
const overlay = railMode === 'overlay'
const open = overlay && root.hasAttribute('data-prts-rail-open')
railLauncher.setAttribute('aria-expanded', String(open))
const closedLabel = phoneRailGesture() ? '长按并向下滑动打开 P.R.T.S. 导航' : '打开 P.R.T.S. 导航'
railLauncher.setAttribute('aria-label', open ? '关闭 P.R.T.S. 导航' : closedLabel)
if (overlay && !open) {
navRail.setAttribute('aria-hidden', 'true')
navRail.setAttribute('inert', '')
} else {
navRail.removeAttribute('aria-hidden')
navRail.removeAttribute('inert')
}
}
function closeRail({ returnFocus = false } = {}) {
if (railMode !== 'overlay') return
const wasOpen = root.hasAttribute('data-prts-rail-open')
root.removeAttribute('data-prts-rail-open')
syncRailState()
if (returnFocus && wasOpen) railLauncher?.focus?.()
}
function openRail() {
if (railMode !== 'overlay') return
root.setAttribute('data-prts-rail-open', '')
syncRailState()
const focusFirst = () => {
if (root.hasAttribute('data-prts-rail-open')) navRail?.querySelector('button')?.focus?.()
}
if (window?.requestAnimationFrame) window.requestAnimationFrame(focusFirst)
else window?.setTimeout?.(focusFirst, 0)
}
function setRailViewport(width = window.innerWidth, { forceClose = false } = {}) {
const nextViewport = Number(width) >= 1180 ? 'wide' : 'narrow'
const viewportChanged = nextViewport !== railViewport
const nextMode = railDefaultHidden || nextViewport === 'narrow' ? 'overlay' : 'docked'
const modeChanged = nextMode !== railMode
if (!viewportChanged && !modeChanged && !forceClose) return railMode
railViewport = nextViewport
railMode = nextMode
clearRailGesture()
root.dataset.prtsRailMode = nextMode
root.removeAttribute('data-prts-rail-open')
syncRailState()
return nextMode
}
function toggleRail() {
if (root.hasAttribute('data-prts-rail-open')) closeRail()
else openRail()
}
function onRailKeydown(event) {
if (event.key !== 'Escape' || railMode !== 'overlay' || !root.hasAttribute('data-prts-rail-open')) return
event.preventDefault()
closeRail({ returnFocus: true })
}
function onDocumentClick(event) {
if (railMode !== 'overlay' || !root.hasAttribute('data-prts-rail-open')) return
const settingsPanel = shell?.querySelector?.('[data-prts-theme-settings]')
const insideSettingsContent = settingsPanel?.contains?.(event.target) && event.target !== settingsPanel
if (navRail?.contains?.(event.target) || railLauncher?.contains?.(event.target) || insideSettingsContent) return
closeRail()
}
function onResponsiveChange() {
clearRailGesture()
setRailViewport(window.innerWidth)
syncRailState()
}
function bindResponsiveQueries() {
railViewportQuery = window.matchMedia?.('(min-width: 1180px)')
railPointerQuery = window.matchMedia?.('(pointer: coarse)')
railHoverQuery = window.matchMedia?.('(hover: none)')
railViewportQuery?.addEventListener?.('change', onResponsiveChange)
railPointerQuery?.addEventListener?.('change', onResponsiveChange)
railHoverQuery?.addEventListener?.('change', onResponsiveChange)
}
function disableTheme() { onThemeDisable() }
function mount() {
if (shell?.isConnected) return true
const regions = adapter.mount()
if (!regions) return false
const template = document.createElement('template')
template.innerHTML = markup(assets.emblem).trim()
shell = template.content.firstElementChild
document.body.appendChild(shell)
bindResponsiveQueries()
navRail = shell.querySelector('[data-prts-nav-rail]')
railLauncher = shell.querySelector('[data-prts-rail-launcher]')
setRailViewport(window.innerWidth)
schemeToggle = shell.querySelector('[data-prts-scheme-toggle]')
themeDisable = shell.querySelector('[data-prts-theme-disable]')
connectionIndicator = shell.querySelector('[data-prts-connection-indicator]')
hostGeometry?.start?.(regions.frame)
operationRegion = regions.center
settingsOverlay = createThemeSettingsOverlay({
document,
trigger: shell.querySelector('[data-prts-rail-brand]'),
panel: shell.querySelector('[data-prts-theme-settings]'),
backdrop: shell.querySelector('[data-prts-settings-backdrop]'),
onPreferenceChange,
onPreferencePreview,
onResetVisual: onVisualReset,
onRetrySave,
})
resizeShield.start([
operationRegion,
shell.querySelector('[data-prts-theme-settings]'),
shell.querySelector('[data-prts-settings-backdrop]'),
])
conversationObserver = new window.MutationObserver(syncConversationState)
conversationObserver.observe(operationRegion, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-chat-flow-kind', 'data-message-role'] })
schemeObserver = new window.MutationObserver(syncSchemeToggle)
schemeObserver.observe(root, { attributes: true, attributeFilter: ['data-prts-scheme'] })
railLauncher.addEventListener('click', onRailClick)
railLauncher.addEventListener('pointerdown', onRailPointerDown)
railLauncher.addEventListener('pointermove', onRailPointerMove)
railLauncher.addEventListener('pointerup', onRailPointerUp)
railLauncher.addEventListener('pointercancel', clearRailGesture)
railLauncher.addEventListener('lostpointercapture', onRailLostPointerCapture)
document.addEventListener('keydown', onRailKeydown)
document.addEventListener('click', onDocumentClick)
schemeToggle.addEventListener('click', toggleScheme)
schemeToggle.addEventListener('pointerdown', onSchemePointerDown)
schemeToggle.addEventListener('pointermove', onSchemePointerMove)
schemeToggle.addEventListener('pointerup', onSchemePointerUp)
schemeToggle.addEventListener('pointercancel', cancelSchemePointer)
schemeToggle.addEventListener('lostpointercapture', onSchemeLostPointerCapture)
window.addEventListener?.('blur', cancelSchemePointer)
themeDisable.addEventListener('click', disableTheme)
syncConversationState()
syncSchemeToggle()
return true
}
function dispose() {
clearRailGesture()
cancelSchemePointer()
clearSchemeClickSuppression()
clearSchemePressDelays()
railLauncher?.removeEventListener('click', onRailClick)
railLauncher?.removeEventListener('pointerdown', onRailPointerDown)
railLauncher?.removeEventListener('pointermove', onRailPointerMove)
railLauncher?.removeEventListener('pointerup', onRailPointerUp)
railLauncher?.removeEventListener('pointercancel', clearRailGesture)
railLauncher?.removeEventListener('lostpointercapture', onRailLostPointerCapture)
document.removeEventListener('keydown', onRailKeydown)
document.removeEventListener('click', onDocumentClick)
schemeToggle?.removeEventListener('click', toggleScheme)
schemeToggle?.removeEventListener('pointerdown', onSchemePointerDown)
schemeToggle?.removeEventListener('pointermove', onSchemePointerMove)
schemeToggle?.removeEventListener('pointerup', onSchemePointerUp)
schemeToggle?.removeEventListener('pointercancel', cancelSchemePointer)
schemeToggle?.removeEventListener('lostpointercapture', onSchemeLostPointerCapture)
window.removeEventListener?.('blur', cancelSchemePointer)
themeDisable?.removeEventListener('click', disableTheme)
railViewportQuery?.removeEventListener?.('change', onResponsiveChange)
railPointerQuery?.removeEventListener?.('change', onResponsiveChange)
railHoverQuery?.removeEventListener?.('change', onResponsiveChange)
railViewportQuery = undefined
railPointerQuery = undefined
railHoverQuery = undefined
resizeShield.dispose()
settingsOverlay?.dispose()
conversationObserver?.disconnect()
schemeObserver?.disconnect()
shell?.remove()
root.removeAttribute('data-prts-conversation-state')
root.removeAttribute('data-prts-rail-mode')
root.removeAttribute('data-prts-rail-open')
root.removeAttribute('data-prts-rail-default-hidden')
navRail = railLauncher = railMode = railViewport = undefined
railDefaultHidden = false
schemeIntent = undefined
shell = settingsOverlay = schemeToggle = themeDisable = connectionIndicator = undefined
conversationObserver = schemeObserver = undefined
operationRegion = undefined
hostGeometry?.dispose?.()
adapter.dispose()
}
return {
update(preferences, status, persistenceState) {
if (!preferences?.enabled) {
dispose()
return false
}
const nextRailDefaultHidden = Boolean(preferences.railDefaultHidden)
const railPreferenceChanged = nextRailDefaultHidden !== railDefaultHidden
railDefaultHidden = nextRailDefaultHidden
if (!mount()) return false
root.toggleAttribute('data-prts-rail-default-hidden', railDefaultHidden)
setRailViewport(window.innerWidth, { forceClose: railPreferenceChanged })
const connection = status?.connection || 'unknown'
const connectionLabel = status?.connectionLabel || '未知'
connectionIndicator.dataset.state = connection
connectionIndicator.setAttribute('aria-label', `Harness 主机连接状态：${connectionLabel}`)
setText(connectionIndicator, '[data-prts-connection-label]', connectionLabel)
settingsOverlay.update(preferences, status, persistenceState)
syncConversationState()
syncSchemeToggle()
return true
},
dispose,
}
}

const inject = ['slots', 'theme']
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
function applyPrtsPlugin(ctx, environment) {
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
sessions: contextService(ctx, 'sessions'),
workspaces: contextService(ctx, 'workspaces'),
getSessionStatus: () => contextService(ctx, 'uiSession')?.sessionStatus,
getUiWorkspace: () => contextService(ctx, 'uiWorkspace'),
})
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
if (preferences.conversationStyle === 'deck-chat') assistantGlass.start()
else assistantGlass.dispose()
toBottom.start()
conversationControls.start()
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
const shouldPlayStartup = !safeMode && !wasEnabled && preferences.enabled && preferences.bootAnimation
if (shouldPlayStartup) particleField.setStartupActive(true)
applyVisualState()
sync()
if (shouldPlayStartup && !startup.play()) particleField.setStartupActive(false)
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
function apply(ctx) {
const React = require('react')
const { defineStore } = require('@deepseek-ai/dsh-client-store')
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

    exports.cssText = PRTS_CSS;
    exports.assets = PRTS_ASSETS;
    exports.inject = inject;
    exports.apply = apply;
    exports.applyPrtsPlugin = applyPrtsPlugin;
    return module.exports;
  }
});
