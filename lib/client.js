window.__ModuleLoader__.load({
  id: "@ash-qw/dsh-theme-prts",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const PRTS_VERSION = "0.1.93";
    const PRTS_CSS = "html[data-dsh-prts]{--prts-canvas: #080a0c; --prts-canvas-elevated: #0d1114; --prts-rail: #060809; --prts-panel: #11161a; --prts-panel-raised: #171d21; --prts-panel-muted: #20272c; --prts-ink: #edf1f2; --prts-muted: #98a3a9; --prts-dim: #68747a; --prts-line: #38434a; --prts-line-strong: #5e6a70; --prts-yellow: #f0c800; --prts-yellow-ink: #161300; --prts-cyan: #5ccddb; --prts-red: #ee625a; --prts-green: #8fcf79; --prts-host-top-inset: 0px; --prts-rail-width: 52px; --prts-nav-width: 52px; --prts-sessions-width: 286px; --prts-sessions-compact: 54px; --prts-workspace-height: 38px; --prts-session-height: 36px; --prts-facility-gap: 7px; --prts-facility-height: var(--prts-workspace-height); --prts-spine-width: 8px; --prts-spine-rest: .25; --prts-spine-travel: 6px; --prts-chamfer: 3px; --prts-radius-control: 3px; --prts-radius-card: 3px; --prts-radius-overlay: 4px; --prts-body: 'Noto Sans SC','Microsoft YaHei UI','Segoe UI',sans-serif; --prts-display: 'Arial Narrow','Noto Sans SC',sans-serif; --prts-mono: 'Roboto Mono','Noto Sans Mono CJK SC',Consolas,monospace; --prts-ease-spring: cubic-bezier(.2,.86,.28,1.16); --prts-ease-snap: cubic-bezier(.22,1,.36,1); --prts-shadow-glass-overlay: 0 18px 48px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.06); --prts-glass-border: rgba(119,140,150,.52); --prts-glass-soft-surface: rgba(15,21,25,.82); --prts-glass-standard-surface: rgba(15,21,25,.9); --prts-glass-clear-surface: rgba(15,21,25,.72); --prts-glass-dense: rgba(7,10,12,.94); --prts-active-glass: var(--prts-glass-standard-surface); --prts-active-glass-filter: blur(18px) saturate(145%); color-scheme: dark; accent-color: var(--prts-yellow)}html[data-dsh-prts][data-prts-scheme=\"dark\"]{color-scheme: dark}html[data-dsh-prts][data-prts-scheme=\"light\"]{--prts-canvas: #eef1f3; --prts-canvas-elevated: #e5eaed; --prts-rail: #111518; --prts-panel: #f7f9fa; --prts-panel-raised: #e5eaed; --prts-panel-muted: #d5dde1; --prts-ink: #15191c; --prts-muted: #4f5c63; --prts-dim: #738087; --prts-line: #9eabb1; --prts-line-strong: #65727a; --prts-glass-border: rgba(62,82,92,.48); --prts-glass-soft-surface: rgba(247,250,251,.9); --prts-glass-standard-surface: rgba(244,249,251,.94); --prts-glass-clear-surface: rgba(244,249,251,.78); --prts-glass-dense: rgba(249,251,252,.97); --prts-shadow-glass-overlay: 0 18px 44px rgba(48,63,70,.18),inset 0 1px rgba(255,255,255,.86); color-scheme: light}html[data-dsh-prts][data-prts-glass=\"soft\"]{--prts-active-glass: var(--prts-glass-soft-surface); --prts-active-glass-filter: blur(18px) saturate(145%)}html[data-dsh-prts][data-prts-glass=\"standard\"]{--prts-active-glass: var(--prts-glass-standard-surface); --prts-active-glass-filter: blur(22px) saturate(155%)}html[data-dsh-prts][data-prts-glass=\"clear\"]{--prts-active-glass: var(--prts-glass-clear-surface); --prts-active-glass-filter: blur(28px) saturate(180%)}html[data-dsh-prts][data-prts-glass=\"off\"]{--prts-active-glass: var(--prts-panel); --prts-active-glass-filter: none}html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-conversation-scale],[data-prts-conversation-scale] *,[data-prts-conversation-preview],[data-prts-conversation-preview] *,[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] ),html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-conversation-scale],[data-prts-conversation-scale] *,[data-prts-conversation-preview],[data-prts-conversation-preview] *,[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::before,html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-conversation-scale],[data-prts-conversation-scale] *,[data-prts-conversation-preview],[data-prts-conversation-preview] *,[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::after{box-sizing: border-box}html[data-dsh-prts] body{--dsw-alias-bg-base: var(--prts-canvas); --dsw-alias-bg-layer-1: var(--prts-panel); --dsw-alias-bg-layer-2: var(--prts-panel-raised); --dsw-alias-bg-layer-3: var(--prts-panel-muted); --dsw-alias-label-primary: var(--prts-ink); --dsw-alias-label-secondary: var(--prts-muted); --dsw-alias-border-l2: var(--prts-line); min-height: 100dvh; margin: 0; overflow: hidden; background: var(--prts-canvas); color: var(--prts-ink); font-family: var(--prts-body)}html[data-dsh-prts] ::selection{background: var(--prts-yellow); color: var(--prts-yellow-ink)}html[data-dsh-prts] a{color: var(--prts-cyan); text-underline-offset: 3px}html[data-dsh-prts] [data-prts-shell] :is(button,input,textarea,select),html[data-dsh-prts] [data-prts-theme-settings] :is(button,input,textarea,select){font: inherit}html[data-dsh-prts] button:not([data-slot=\"sidebar.settings\"] button){color: inherit}html[data-dsh-prts] :focus-visible{outline: 2px solid var(--prts-yellow) !important; outline-offset: 2px !important}html[data-dsh-prts] [hidden]{display: none !important}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"]{--prts-nav-width: 0px}html[data-dsh-prts] [data-prts-shell]{position: fixed; z-index: 124; inset: var(--prts-host-top-inset) auto 0 0; width: var(--prts-nav-width); pointer-events: none; font-family: var(--prts-mono)}html[data-dsh-prts] [data-prts-shell] button,html[data-dsh-prts] [data-prts-nav-rail]{pointer-events: auto}html[data-dsh-prts] [data-prts-topbar]{display: none}html[data-dsh-prts] [data-prts-nav-rail]{position: fixed; z-index: 120; inset: var(--prts-host-top-inset) auto 0 0; width: var(--prts-rail-width); display: flex; flex-direction: column; align-items: stretch; border-right: 1px solid #30383d; background: var(--prts-rail); color: #e8edef; box-shadow: 4px 0 18px rgba(0,0,0,.18)}html[data-dsh-prts] [data-prts-rail-launcher]{display: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-nav-rail]{opacity: 0; visibility: hidden; transform: translate3d(-100%,0,0); transition: transform 180ms var(--prts-ease-snap),opacity 120ms ease,visibility 0s linear 180ms; pointer-events: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"][data-prts-rail-open] [data-prts-nav-rail]{opacity: 1; visibility: visible; transform: translate3d(0,0,0); transition-delay: 0s; pointer-events: auto}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"][data-prts-rail-open] [data-prts-rail-launcher]{opacity: 0; visibility: hidden; pointer-events: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]{position: fixed; z-index: 121; top: 50%; left: 0; width: 12px; height: 96px; display: grid; place-items: center; padding: 0; overflow: hidden; border: 1px solid color-mix(in srgb,var(--prts-yellow) 40%,transparent); border-left: 0; border-radius: 0 3px 3px 0; opacity: .34; background: color-mix(in srgb,var(--prts-rail) 86%,transparent); color: var(--prts-yellow); font: 700 8px/1 var(--prts-mono); letter-spacing: .08em; transform: translateY(-50%); transition: width 140ms var(--prts-ease-snap),opacity 120ms ease,background-color 120ms ease; cursor: pointer}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher] > span{opacity: 0; writing-mode: vertical-rl; transition: opacity 100ms ease}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]:is(:hover,:focus-visible){width: 40px; opacity: 1; background: var(--prts-rail)}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]:is(:hover,:focus-visible) > span{opacity: 1}@media (hover: none),(pointer: coarse){html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher]{top: calc(var(--prts-host-top-inset) + 12px); width: 40px; height: 40px; opacity: .92; transform: none}html[data-dsh-prts][data-prts-rail-mode=\"overlay\"] [data-prts-rail-launcher] > span{opacity: 1}}html[data-dsh-prts] [data-prts-rail-brand]{height: 64px; display: grid; place-items: center; padding: 8px 5px; border-bottom: 1px solid #30383d; overflow: hidden}html[data-dsh-prts] [data-prts-rail-brand] svg{width: 38px; height: 38px; color: #edf1f2}html[data-dsh-prts] [data-prts-rail-brand] > span{position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)}html[data-dsh-prts] [data-prts-nav-rail] > button{position: relative; width: 100%; min-height: 52px; display: grid; place-items: center; gap: 2px; padding: 7px 2px 6px; border: 0; border-bottom: 1px solid #242b2f; background: transparent; color: #9fa9ae; cursor: pointer; clip-path: polygon(0 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%)}html[data-dsh-prts] [data-prts-nav-rail] > button::after{content: \"\"; position: absolute; inset: 8px auto 8px 0; width: 2px; background: transparent}html[data-dsh-prts] [data-prts-nav-rail] > button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-nav-rail] > button[aria-expanded=\"true\"]{background: #151a1d; color: #f0f3f4}html[data-dsh-prts] [data-prts-nav-rail] > button[aria-expanded=\"true\"]::after{background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-nav-rail] > button:active{transform: translateY(1px) scale(.98)}html[data-dsh-prts] [data-prts-nav-rail] b{font-size: 15px; line-height: 1}html[data-dsh-prts] [data-prts-nav-rail] small{font-size: 8px; letter-spacing: .04em}html[data-dsh-prts] [data-prts-nav-bottom]{display: grid; margin-top: auto; border-top: 1px solid #30383d}html[data-dsh-prts] [data-prts-connection-indicator]{min-height: 40px; display: grid; place-items: center; gap: 3px; padding: 6px 2px; color: #8c969b; font-size: 7px; text-align: center}html[data-dsh-prts] [data-prts-connection-indicator] i{width: 6px; height: 6px; border: 1px solid currentColor; background: currentColor; transform: rotate(45deg)}html[data-dsh-prts] [data-prts-connection-indicator][data-state=\"connected\"]{color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-connection-indicator][data-state=\"disconnected\"]{color: var(--prts-red)}html[data-dsh-prts] [data-prts-scheme-toggle] svg{width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.7}html[data-dsh-prts] [data-prts-scheme-current=\"dark\"] [data-prts-scheme-icon=\"light\"],html[data-dsh-prts] [data-prts-scheme-current=\"light\"] [data-prts-scheme-icon=\"dark\"]{display: none}html[data-dsh-prts] [data-prts-region=\"frame\"]{width: calc(100vw - var(--prts-nav-width)); height: calc(100dvh - var(--prts-host-top-inset)); min-height: 0; margin-left: var(--prts-nav-width); display: grid !important; background: var(--prts-canvas)}html[data-dsh-prts] [data-prts-region=\"sessions\"],html[data-dsh-prts] [data-prts-region=\"operation\"]{min-width: 0; min-height: 0}html[data-dsh-prts] [data-prts-region=\"sessions\"]{box-sizing: border-box; position: relative; z-index: 4; overflow: hidden; border-right: 1px solid var(--prts-line); background: var(--prts-panel); transition: opacity 180ms ease}html[data-dsh-prts] [data-prts-region=\"operation\"]{position: relative; z-index: 1; overflow: hidden; background: var(--prts-canvas); color: var(--prts-ink)}html[data-dsh-prts][data-prts-sessions-collapsed] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.workspaces\"],html[data-dsh-prts][data-prts-sessions-collapsed] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.settings\"]{opacity: 0; pointer-events: none}html[data-dsh-prts] [data-prts-region=\"sessions\"] > *,html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar\"]{height: 100%}html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-rc7-sidebar-root]{box-sizing: border-box; width: 100% !important; min-width: var(--prts-sessions-width); padding: 14px 10px; overflow-y: auto; background: transparent !important; color: var(--prts-ink)}html[data-dsh-prts] [data-prts-region=\"sessions\"] > * > [data-slot=\"sidebar\"] > :first-child > button[aria-label*=\"new session\" i]{display: none !important}html[data-dsh-prts] [data-prts-workspace-row],html[data-dsh-prts] [data-prts-session-row]{--prts-row-shift: 0px; --prts-row-end-reserve: 29px; --prts-facility-height: var(--prts-workspace-height); position: relative; width: calc(100% - 20px); height: var(--prts-facility-height) !important; min-height: var(--prts-facility-height); display: flex; align-items: center; gap: 0 !important; margin: 0 0 var(--prts-facility-gap) 0; padding: 0 !important; overflow: visible; border: 0 !important; background: transparent !important; color: var(--prts-ink); isolation: isolate}html[data-dsh-prts] [data-prts-session-row]{--prts-facility-height: var(--prts-session-height); margin-left: 8px}@media (max-height: 820px) and (hover: hover) and (pointer: fine){html[data-dsh-prts]{--prts-workspace-height: 34px; --prts-session-height: 32px; --prts-facility-gap: 5px}}html[data-dsh-prts] [data-prts-workspace-row]::before{background: var(--prts-cyan) !important}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"],html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]),html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open]){--prts-row-shift: var(--prts-spine-travel)}html[data-dsh-prts] [data-prts-workspace-row]::before,html[data-dsh-prts] [data-prts-session-row]::before{content: \"\"; position: absolute; z-index: 2; inset: 0 auto 0 0; width: var(--prts-spine-width); background: var(--prts-line-strong); clip-path: polygon( 3px 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px ); transform: scaleX(var(--prts-spine-rest)); transform-origin: left center; transition: transform 220ms var(--prts-ease-spring),background-color 160ms ease}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"]::before,html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open])::before,html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open])::before{transform: scaleX(1)}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"]::before{background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-facility-face]{position: absolute; z-index: -1; inset: 0 0 0 5px; border: 1px solid var(--prts-line); background: var(--prts-panel-raised); clip-path: polygon( 3px 0,calc(50% - 25px) 0,calc(50% - 20px) 3.333px,calc(50% + 20px) 3.333px,calc(50% + 25px) 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px ); transform: translate3d(var(--prts-row-shift),0,0); transition: transform 220ms var(--prts-ease-spring),border-color 160ms ease,background-color 160ms ease; pointer-events: none}html[data-dsh-prts] :is([data-prts-workspace-row],[data-prts-session-row]) [data-prts-facility-face]{right: var(--prts-row-end-reserve)}html[data-dsh-prts] [data-prts-row-title],html[data-dsh-prts] [data-prts-session-row] > span:not([data-prts-facility-face]):not([data-prts-row-projection]):not([data-prts-session-actions]),html[data-dsh-prts] [data-prts-workspace-row] > span:not([data-prts-facility-face]):not([data-prts-row-projection]):not([data-prts-workspace-actions]){position: relative; z-index: 3; min-width: 0; transform: translate3d(var(--prts-row-shift),0,0); transition: transform 220ms var(--prts-ease-spring),color 160ms ease}html[data-dsh-prts] [data-prts-row-title]{flex: 1; overflow: hidden; padding: 0 10px 0 13px; font-size: 12px; font-weight: 650; line-height: var(--prts-facility-height); text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-session-row] [data-prts-row-title]::before{content: attr(data-prts-session-index); margin-right: 8px; color: var(--prts-dim); font-family: var(--prts-mono); font-size: 9px; letter-spacing: .08em}html[data-dsh-prts] [data-prts-workspace-actions],html[data-dsh-prts] [data-prts-session-actions]{position: absolute; z-index: 5; inset: 0 0 auto auto; height: var(--prts-facility-height) !important; align-items: stretch !important; gap: 1px !important; margin: 0 !important; transform: translate3d(var(--prts-row-shift),0,0)}html[data-dsh-prts] [data-prts-workspace-actions]{width: 57px}html[data-dsh-prts] [data-prts-session-actions]{width: 28px}html[data-dsh-prts] [data-prts-workspace-actions] > *,html[data-dsh-prts] [data-prts-session-actions] > *{height: 100% !important}html[data-dsh-prts] [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-actions] button{width: 28px !important; min-width: 28px !important; height: var(--prts-facility-height) !important; min-height: var(--prts-facility-height) !important; display: grid !important; place-items: center; padding: 0 !important; border: 1px solid var(--prts-line) !important; border-radius: 0 !important; background: var(--prts-panel-raised) !important; color: var(--prts-muted) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px); cursor: pointer}html[data-dsh-prts] [data-prts-workspace-actions] button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-session-actions] button:is(:hover,:focus-visible){border-color: var(--prts-yellow) !important; color: var(--prts-yellow) !important}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-session-actions] button{animation: prts-facility-button-dock 520ms both}html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-workspace-actions] > :nth-child(1) button{animation-delay: 55ms}html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) [data-prts-workspace-actions] > :nth-child(2){animation-delay: 125ms}}@keyframes prts-facility-button-dock{0%{opacity: 0; transform: translate3d(34px,0,0) scaleX(.94)}52%{opacity: 1; transform: translate3d(-4px,0,0) scaleX(.96)}72%{transform: translate3d(3px,0,0) scaleX(1.035)}88%{transform: translate3d(-1px,0,0) scaleX(.99)}100%{opacity: 1; transform: translate3d(0,0,0) scaleX(1)}}html[data-dsh-prts] [data-slot=\"conversation\"]{min-width: 0; height: 100%; background: transparent}html[data-dsh-prts] [data-slot=\"conversation.session.header\"]{border-bottom: 1px solid var(--prts-line); background: color-mix(in srgb,var(--prts-canvas-elevated) 92%,transparent); font-family: var(--prts-mono)}html[data-dsh-prts] [data-session-code]{color: var(--prts-yellow); font-size: 11px; letter-spacing: .12em}html[data-dsh-prts] [data-prts-conversation-control=\"header\"]{margin-left: auto}html[data-dsh-prts] [data-conversation-scroll]{position: relative; z-index: 2}html[data-dsh-prts] [data-conversation-scroll]::before{content: \"\"; position: absolute; z-index: -1; top: 28px; bottom: 140px; left: clamp(30px,3.6vw,52px); width: 1px; background: linear-gradient(var(--prts-line-strong),var(--prts-line),transparent)}html[data-dsh-prts] [data-message-role=\"user\"],html[data-dsh-prts] [data-chat-flow-kind=\"user\"]{position: relative; color: var(--prts-ink)}html[data-dsh-prts] [data-message-role=\"user\"]::before,html[data-dsh-prts] [data-chat-flow-kind=\"user\"]::before{content: \"\"; position: absolute; top: 8px; left: calc(clamp(-66px,-4vw,-42px)); width: 11px; height: 11px; border: 2px solid var(--prts-canvas); background: var(--prts-yellow); box-shadow: 0 0 0 1px var(--prts-yellow); transform: rotate(45deg)}html[data-dsh-prts] [data-message-role=\"user\"],html[data-dsh-prts] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"]{border: 1px solid var(--prts-line-strong) !important; border-left: 4px solid var(--prts-yellow) !important; border-radius: var(--prts-radius-card) !important; background: var(--prts-panel-raised) !important; color: var(--prts-ink) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px); box-shadow: none !important}html[data-dsh-prts] [data-message-role=\"user\"] :is([data-markdown],[class*=\"markdown\" i]),html[data-dsh-prts] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] :is([data-markdown],[class*=\"markdown\" i]){background: transparent !important}html[data-dsh-prts] [data-message-role=\"user\"] :is(pre,table,blockquote),html[data-dsh-prts] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] :is(pre,table,blockquote){border: 1px solid var(--prts-line); background: var(--prts-glass-dense)}html[data-dsh-prts] [data-message-role=\"user\"] :is(pre,code),html[data-dsh-prts] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] :is(pre,code){font-family: var(--prts-mono) !important}html[data-dsh-prts] [data-message-role=\"user\"] pre,html[data-dsh-prts] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"] pre{max-width: 100%; overflow: auto; padding: 14px; border-left: 3px solid var(--prts-cyan) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [aria-invalid=\"true\"],html[data-dsh-prts] [data-status=\"error\"],html[data-dsh-prts] [data-status=\"denied\"]{border-color: var(--prts-red) !important; color: var(--prts-red) !important}html[data-dsh-prts] [data-prts-ambient-layer]{position: absolute; z-index: 0; inset: 0; overflow: hidden; opacity: .86; background: radial-gradient(circle at 48% 35%,color-mix(in srgb,var(--prts-cyan) 7%,transparent),transparent 32%),linear-gradient(115deg,transparent 0 42%,color-mix(in srgb,var(--prts-line) 18%,transparent) 42.2% 42.5%,transparent 42.7%),repeating-linear-gradient(0deg,transparent 0 27px,color-mix(in srgb,var(--prts-line) 12%,transparent) 27px 28px); pointer-events: none}html[data-dsh-prts][data-prts-texture=\"restrained\"] [data-prts-ambient-layer]{opacity: .56}html[data-dsh-prts][data-prts-texture=\"off\"] [data-prts-ambient-layer]{display: none}html[data-dsh-prts] [data-prts-particle-layer]{position: absolute; z-index: 1; inset: 0; width: 100%; height: 100%; pointer-events: none}html[data-dsh-prts] [data-prts-particle-layer]{opacity: 1; transition: opacity 120ms ease-out}html[data-dsh-prts] [data-prts-resize-shield]{content-visibility: hidden !important; contain-intrinsic-size: auto 800px}html[data-dsh-prts] [data-prts-particle-layer][data-prts-resizing]{opacity: .78; transition: none}html[data-dsh-prts] [data-prts-particle-layer][data-prts-resize-restoring]{opacity: 1; transition: opacity 120ms ease-out}html[data-dsh-prts] [data-prts-ambient-layer][data-prts-resizing]{opacity: .42; background: color-mix(in srgb,var(--prts-panel) 92%,var(--prts-canvas)); transition: none}html[data-dsh-prts] [data-prts-ambient-layer][data-prts-resizing] :is( [data-prts-ambient-glow],[data-prts-session-pickup] ){animation-play-state: paused !important}html[data-dsh-prts] :is( [data-prts-conversation-preview][data-prts-resizing],[data-prts-conversation-history-hint][data-prts-resizing],[data-prts-conversation-history-status][data-prts-resizing],[data-prts-theme-settings][data-prts-resizing],[data-prts-settings-backdrop][data-prts-resizing] ),html[data-dsh-prts] [data-prts-resizing] > [data-composer-card]{backdrop-filter: none !important; -webkit-backdrop-filter: none !important; transition: none !important}html[data-dsh-prts] [data-prts-hero-active]::before{content: \"\"; position: absolute; inset: 0; pointer-events: none}html[data-dsh-prts]{--prts-hero-mark-base: clamp(380px,46%,720px); --prts-hero-mark-size: min(var(--prts-hero-mark-base),42dvh)}html[data-dsh-prts] [data-prts-hero-active] [data-composer-seat],html[data-dsh-prts] [data-prts-hero-active] [data-slot=\"conversation.composer\"]{position: relative; z-index: 5}html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-composer-fallback]{position: relative; border: 1px solid var(--prts-line-strong) !important; border-bottom: 3px solid var(--prts-yellow) !important; border-radius: var(--prts-radius-card) !important; background: var(--prts-active-glass) !important; clip-path: polygon(3px 0,calc(50% - 42px) 0,calc(50% - 37px) 5px,calc(50% + 37px) 5px,calc(50% + 42px) 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px); box-shadow: 0 14px 34px rgba(0,0,0,.18); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-composer-card] textarea,html[data-dsh-prts] [data-prts-composer-fallback] textarea{border: 0 !important; background: transparent !important; color: var(--prts-ink) !important; caret-color: var(--prts-yellow)}html[data-dsh-prts] [data-composer-card] button,html[data-dsh-prts] [data-prts-conversation-control]{border: 1px solid var(--prts-line) !important; border-radius: var(--prts-radius-control) !important; background: var(--prts-panel-raised) !important; color: var(--prts-ink) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px)}html[data-dsh-prts] [data-composer-card] button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-conversation-control]:is(:hover,:focus-visible){border-color: var(--prts-yellow) !important}html[data-dsh-prts] [data-composer-card] button[aria-label*=\"send\" i],html[data-dsh-prts] [data-composer-card] button[type=\"submit\"]{background: var(--prts-yellow) !important; color: var(--prts-yellow-ink) !important}html[data-dsh-prts] [data-composer-card] button:active,html[data-dsh-prts] [data-prts-conversation-control]:active{transform: translateY(1px) scale(.98)}html[data-dsh-prts] [data-produced-files-row] > button[type=\"button\"],html[data-dsh-prts] [data-prts-to-bottom]{min-height: 36px; border: 1px solid var(--prts-line) !important; background: var(--prts-active-glass) !important; color: var(--prts-ink) !important; clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px)}html[data-dsh-prts] [data-prts-glass-control=\"model\"],html[data-dsh-prts] [data-prts-glass-control=\"permission\"],html[data-dsh-prts] [data-prts-glass-control=\"preset\"]{border: 1px solid var(--prts-line) !important; border-radius: var(--prts-radius-control) !important; background: var(--prts-active-glass) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-glass-menu],html[data-dsh-prts] [data-prts-floating-glass=\"menu\"],html[data-dsh-prts] [data-prts-floating-glass=\"listbox\"],html[data-dsh-prts] [data-prts-floating-glass=\"popover\"]{border: 1px solid var(--prts-glass-border) !important; border-radius: var(--prts-radius-overlay) !important; background: var(--prts-active-glass) !important; color: var(--prts-ink) !important; box-shadow: var(--prts-shadow-glass-overlay) !important; backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-prts-floating-glass=\"dialog\"]{border: 1px solid var(--prts-glass-border) !important; border-radius: var(--prts-radius-overlay) !important; background: var(--prts-panel) !important; color: var(--prts-ink) !important; box-shadow: var(--prts-shadow-glass-overlay) !important; backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-prts-floating-item]{min-height: 38px; border-radius: var(--prts-radius-control) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-floating-item]:is(:hover,[data-highlighted]){background: var(--prts-panel-muted) !important}html[data-dsh-prts] [data-prts-floating-input]{min-height: 44px; border: 1px solid var(--prts-line) !important; background: var(--prts-panel) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-floating-danger]{color: var(--prts-red) !important}html[data-dsh-prts] [data-prts-floating-scrim]{background: rgba(3,5,6,.62) !important}html[data-dsh-prts-settings] .prts-plugin-settings{width: 100%; display: grid; gap: 16px; color: inherit; font: inherit}html[data-dsh-prts-settings] .prts-plugin-settings__header{display: grid; gap: 5px; padding-bottom: 14px; border-bottom: 1px solid color-mix(in srgb,currentColor 18%,transparent)}html[data-dsh-prts-settings] .prts-plugin-settings__header h3,html[data-dsh-prts-settings] .prts-plugin-settings__header p{margin: 0}html[data-dsh-prts-settings] .prts-plugin-settings__header h3{font-size: 18px; font-weight: 650}html[data-dsh-prts-settings] .prts-plugin-settings__header p,html[data-dsh-prts-settings] .prts-plugin-settings__copy small{color: color-mix(in srgb,currentColor 62%,transparent); font-size: 12px; line-height: 1.5}html[data-dsh-prts-settings] .prts-plugin-settings__safe{margin: 0; padding: 10px 12px; border: 1px solid color-mix(in srgb,#df5750 42%,transparent); border-radius: 8px; background: color-mix(in srgb,#df5750 8%,transparent); color: inherit; font-size: 12px}html[data-dsh-prts-settings] .prts-plugin-settings__list{overflow: hidden; border: 1px solid color-mix(in srgb,currentColor 16%,transparent); border-radius: 10px}html[data-dsh-prts-settings] .prts-plugin-settings__row{min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 14px}html[data-dsh-prts-settings] .prts-plugin-settings__row + .prts-plugin-settings__row{border-top: 1px solid color-mix(in srgb,currentColor 12%,transparent)}html[data-dsh-prts-settings] .prts-plugin-settings__copy{min-width: 0; display: grid; gap: 3px}html[data-dsh-prts-settings] .prts-plugin-settings__copy strong{font-size: 13px; font-weight: 600}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch']{position: relative; width: 42px; height: 24px; flex: 0 0 auto; padding: 0; border: 0; border-radius: 999px; background: color-mix(in srgb,currentColor 18%,transparent); color: inherit; cursor: pointer}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'] > span{position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: currentColor; transition: transform 120ms ease}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'].is-active{background: var(--color-primary,#d9b800); color: #111}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'].is-active > span{transform: translateX(18px)}html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch']:disabled{cursor: not-allowed; opacity: .45}@media (prefers-reduced-motion: reduce){html[data-dsh-prts-settings] .prts-plugin-settings button[role='switch'] > span{transition: none}}@media (max-width: 640px){html[data-dsh-prts]{--prts-nav-width: 52px}html[data-dsh-prts] [data-conversation-scroll]::before{left: 18px}html[data-dsh-prts] [data-message-role]::before,html[data-dsh-prts] [data-chat-flow-kind]::before{left: -25px}html[data-dsh-prts] [data-slot=\"conversation.session.header\"]{padding-inline: 12px}html[data-dsh-prts-settings] .prts-settings{padding: 12px}}@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))){html[data-dsh-prts] [data-prts-floating-glass],html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-glass-menu]{background: var(--prts-panel) !important}}@media (hover: hover) and (pointer: fine){html[data-dsh-prts] [data-prts-nav-rail] > button:hover b{transform: translateY(-1px)}}@media (prefers-reduced-transparency: reduce){html[data-dsh-prts]{--prts-active-glass: var(--prts-panel); --prts-active-glass-filter: none}}@media (prefers-contrast: more){html[data-dsh-prts]{--prts-line: currentColor; --prts-line-strong: currentColor}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-conversation-scale],[data-prts-conversation-scale] *,[data-prts-conversation-preview],[data-prts-conversation-preview] *,[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] ),html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-conversation-scale],[data-prts-conversation-scale] *,[data-prts-conversation-preview],[data-prts-conversation-preview] *,[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::before,html[data-dsh-prts] :is( [data-prts-shell],[data-prts-shell] *,[data-prts-particle-layer],[data-prts-ambient-layer],[data-prts-conversation-scale],[data-prts-conversation-scale] *,[data-prts-conversation-preview],[data-prts-conversation-preview] *,[data-prts-facility-face],[data-composer-card],[data-prts-composer-fallback],[data-prts-conversation-control],[data-prts-to-bottom] )::after{scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important}}html[data-dsh-prts]{--prts-hero-mark-base: clamp(300px,38%,520px); --prts-hero-mark-size: min(var(--prts-hero-mark-base),32dvh)}html[data-dsh-prts] [data-prts-region=\"sessions\"] > * > [data-slot=\"sidebar\"] > :first-child > button[aria-label*=\"new session\" i]{min-height: 40px; display: grid !important; place-items: center; margin: 0 0 14px; border: 1px solid var(--prts-line) !important; border-radius: var(--prts-radius-card) !important; background: var(--prts-panel-raised) !important; color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-rail-brand],html[data-dsh-prts] [data-prts-nav-rail] > button,html[data-dsh-prts] [data-prts-nav-bottom] > button{position: relative; width: 100%; min-width: 0; min-height: 48px; display: grid; place-items: center; padding: 0; border: 0; border-bottom: 1px solid #242b2f; border-radius: 0; background: transparent; color: #aeb8bd !important; cursor: pointer; clip-path: none}html[data-dsh-prts] [data-prts-rail-brand]{height: 64px; border-bottom-color: #30383d}html[data-dsh-prts] [data-prts-rail-brand]:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-rail-brand][aria-expanded=\"true\"],html[data-dsh-prts] [data-prts-nav-rail] > button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-nav-bottom] > button:is(:hover,:focus-visible){background: #151a1d; color: #f3f6f7 !important}html[data-dsh-prts] [data-prts-rail-brand][aria-expanded=\"true\"]::after{content: \"\"; position: absolute; inset: 7px auto 7px 0; width: 2px; background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-nav-rail] small,html[data-dsh-prts] [data-prts-connection-label]{position: absolute; z-index: 180; top: 50%; left: calc(100% + 9px); width: max-content; max-width: 180px; padding: 6px 8px; border: 1px solid #3d474d; border-radius: 3px; opacity: 0; background: #0e1215; color: #eef2f3; font: 700 9px/1.2 var(--prts-mono); letter-spacing: .04em; text-align: left; transform: translate3d(-5px,-50%,0); transition: opacity 130ms ease,transform 160ms var(--prts-ease-snap); pointer-events: none; white-space: nowrap}html[data-dsh-prts] [data-prts-nav-rail] button:is(:hover,:focus-visible) small,html[data-dsh-prts] [data-prts-connection-indicator]:is(:hover,:focus-visible) [data-prts-connection-label]{opacity: 1; transform: translate3d(0,-50%,0)}html[data-dsh-prts] [data-prts-connection-indicator]{position: relative; min-height: 38px; padding: 0; color: #9da8ad}html[data-dsh-prts] [data-prts-nav-bottom] svg,html[data-dsh-prts] [data-prts-nav-bottom] b{display: block; color: currentColor}html[data-dsh-prts] [data-message-role=\"user\"],html[data-dsh-prts] [data-chat-flow-kind=\"user\"] [class$=\"_bubble\"],html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-composer-fallback],html[data-dsh-prts] [data-composer-card] button,html[data-dsh-prts] [data-prts-conversation-control],html[data-dsh-prts] [data-produced-files-row] > button[type=\"button\"],html[data-dsh-prts] [data-prts-to-bottom]{border-radius: 3px !important; clip-path: none !important}html[data-dsh-prts] [data-prts-facility-face]{right: 0 !important; border: 0 !important; background: var(--prts-line-strong)}html[data-dsh-prts] [data-prts-facility-face]::after{content: \"\"; position: absolute; inset: 1px; background: var(--prts-panel-raised); clip-path: polygon( 3px 0,calc(50% - 25px) 0,calc(50% - 20px) 3.333px,calc(50% + 20px) 3.333px,calc(50% + 25px) 0,calc(100% - 3px) 0,100% 3px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 3px )}html[data-dsh-prts] [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-actions] button{border: 1px solid var(--prts-line-strong) !important; border-radius: 3px !important; clip-path: none !important}html[data-dsh-prts] [data-prts-hero-active]{display: grid; grid-template-rows: minmax(220px,1fr) auto; align-content: center; gap: clamp(28px,5dvh,54px); padding-top: 24px; padding-bottom: 34px}html[data-dsh-prts] [data-prts-hero-active] [data-phase=\"hero\"]{min-height: min(36dvh,390px); align-self: end}html[data-dsh-prts] [data-prts-hero-active] [data-composer-seat]{align-self: start; justify-self: center}html[data-dsh-prts]{--prts-hero-mark-base: clamp(320px,42%,580px); --prts-hero-mark-size: min(var(--prts-hero-mark-base),42dvh)}html[data-dsh-prts] [data-prts-region=\"frame\"]{position: relative}html[data-dsh-prts] [data-prts-region=\"frame\"] > [data-shell-overlay]{position: absolute !important; z-index: 120; inset: 0; min-width: 0; min-height: 0; pointer-events: none}html[data-dsh-prts] [data-prts-region=\"frame\"] > [data-shell-overlay] > *{pointer-events: auto}html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.settings\"]{opacity: 1; visibility: visible; pointer-events: auto}html[data-dsh-prts] [data-prts-region=\"sessions\"] [data-slot=\"sidebar.settings\"] > button{color: var(--prts-ink) !important}html[data-dsh-prts] [data-prts-workspace-icon]{display: none !important}html[data-dsh-prts] [data-prts-workspace-disclosure]{position: relative; z-index: 4; width: 14px; flex: 0 0 14px; display: grid; place-items: center; margin-left: calc(var(--prts-spine-width) + 4px); color: var(--prts-muted); transform: translate3d(var(--prts-row-shift),0,0); transition: transform 220ms var(--prts-ease-spring),color 160ms ease}html[data-dsh-prts] [data-prts-workspace-row]::before,html[data-dsh-prts] [data-prts-session-row]::before{clip-path: polygon( 1px 0,calc(100% - 1px) 0,100% 1px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 1px),calc(100% - 1px) 100%,1px 100%,0 calc(100% - 1px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 1px ) !important}html[data-dsh-prts] :is([data-prts-workspace-row],[data-prts-session-row]) [data-prts-facility-face]{right: var(--prts-row-end-reserve) !important}html[data-dsh-prts] [data-prts-facility-face]{border: 0 !important; background: var(--prts-line-strong) !important; clip-path: polygon( 1px 0,calc(50% - 25px) 0,calc(50% - 20px) 3.333px,calc(50% + 20px) 3.333px,calc(50% + 25px) 0,calc(100% - 1px) 0,100% 1px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 1px),calc(100% - 1px) 100%,1px 100%,0 calc(100% - 1px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 1px ) !important}html[data-dsh-prts] [data-prts-facility-face]::after{content: \"\"; position: absolute; inset: 1px; background: var(--prts-panel-raised); clip-path: polygon( 0 0,calc(50% - 24px) 0,calc(50% - 19px) 3.333px,calc(50% + 19px) 3.333px,calc(50% + 24px) 0,100% 0,100% calc(50% - 4px),calc(100% - 2px) calc(50% - 2px),calc(100% - 2px) calc(50% + 2px),100% calc(50% + 4px),100% 100%,0 100%,0 calc(50% + 4px),2px calc(50% + 2px),2px calc(50% - 2px),0 calc(50% - 4px) )}html[data-dsh-prts] [data-prts-workspace-actions]{width: 57px !important}html[data-dsh-prts] [data-prts-session-actions]{width: 28px !important}html[data-dsh-prts] [data-prts-workspace-actions] button,html[data-dsh-prts] [data-prts-session-actions] button{width: 28px !important; min-width: 28px !important; position: relative; isolation: isolate; overflow: hidden; border: 0 !important; border-radius: 0 !important; background: var(--prts-line) !important; clip-path: polygon( 1px 0,calc(100% - 1px) 0,100% 1px,100% calc(50% - 5px),calc(100% - 2px) calc(50% - 3px),calc(100% - 2px) calc(50% + 3px),100% calc(50% + 5px),100% calc(100% - 1px),calc(100% - 1px) 100%,1px 100%,0 calc(100% - 1px),0 calc(50% + 5px),2px calc(50% + 3px),2px calc(50% - 3px),0 calc(50% - 5px),0 1px ) !important}html[data-dsh-prts] [data-prts-workspace-actions] button::before,html[data-dsh-prts] [data-prts-session-actions] button::before{content: \"\"; position: absolute; z-index: -1; inset: 1px; background: var(--prts-panel-raised); clip-path: polygon( 0 0,100% 0,100% calc(50% - 4px),calc(100% - 2px) calc(50% - 2px),calc(100% - 2px) calc(50% + 2px),100% calc(50% + 4px),100% 100%,0 100%,0 calc(50% + 4px),2px calc(50% + 2px),2px calc(50% - 2px),0 calc(50% - 4px) ); pointer-events: none}html[data-dsh-prts] [data-prts-workspace-actions] button:is(:hover,:focus-visible),html[data-dsh-prts] [data-prts-session-actions] button:is(:hover,:focus-visible){background: var(--prts-yellow) !important}html[data-dsh-prts] [data-prts-session-time]{position: relative; z-index: 3; flex: 0 0 auto; margin-right: 39px; padding-left: 8px; transform: translate3d(var(--prts-row-shift),0,0); transition: opacity 120ms ease,transform 220ms var(--prts-ease-spring)}html[data-dsh-prts] [data-prts-session-row]:hover [data-prts-session-time]{opacity: 0}html[data-dsh-prts] [data-composer-card],html[data-dsh-prts] [data-prts-composer-fallback]{position: relative; isolation: isolate; overflow: visible; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; clip-path: none !important; backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-composer-card]::before,html[data-dsh-prts] [data-prts-composer-fallback]::before{content: \"\"; position: absolute; z-index: 0; inset: 0; background: var(--prts-line-strong); clip-path: polygon( 3px 0,calc(50% - 42px) 0,calc(50% - 37px) 5px,calc(50% + 37px) 5px,calc(50% + 42px) 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px ); box-shadow: 0 14px 34px rgba(0,0,0,.18); pointer-events: none}html[data-dsh-prts] [data-composer-card]::after,html[data-dsh-prts] [data-prts-composer-fallback]::after{content: \"\"; position: absolute; z-index: 1; inset: 1px 1px 3px; background: var(--prts-composer-surface,var(--prts-active-glass)); clip-path: polygon( 2px 0,calc(50% - 41px) 0,calc(50% - 36px) 5px,calc(50% + 36px) 5px,calc(50% + 41px) 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px ); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter); pointer-events: none}html[data-dsh-prts] [data-composer-card] > :not([data-prts-composer-signal]),html[data-dsh-prts] [data-prts-composer-fallback] > :not([data-prts-composer-signal]){position: relative; z-index: 2}html[data-dsh-prts] [data-prts-composer-signal]{position: absolute; z-index: 3; inset: 0; overflow: visible; pointer-events: none}html[data-dsh-prts] [data-prts-composer-signal]::before{content: \"\"; position: absolute; left: 50%; background: var(--prts-yellow); opacity: .82; pointer-events: none; transition: transform 160ms var(--prts-ease-snap),opacity 160ms ease}html[data-dsh-prts] [data-prts-composer-signal]::before{bottom: 0; width: calc(100% - 6px); height: 3px; transform: translateX(-50%) scaleX(.16)}html[data-dsh-prts] [data-composer-card]:focus-within,html[data-dsh-prts] [data-prts-composer-fallback]:focus-within{--prts-composer-surface: color-mix(in srgb,var(--prts-active-glass) 94%,var(--prts-ink) 6%)}html[data-dsh-prts] :is([data-composer-card],[data-prts-composer-fallback]):focus-within [data-prts-composer-signal]::before{opacity: 1; transform: translateX(-50%) scaleX(1)}html[data-dsh-prts] [data-composer-card] textarea:focus-visible,html[data-dsh-prts] [data-prts-composer-fallback] textarea:focus-visible{outline: none !important}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-composer-signal]::before{transition: none}}html[data-dsh-prts] [data-prts-theme-settings] :is(input,textarea,select):focus-visible,html[data-dsh-prts] [data-prts-floating-input]:focus-visible{outline: none !important; border-color: var(--prts-yellow) !important; box-shadow: 0 0 0 1px var(--prts-yellow) !important}html[data-dsh-prts] [data-prts-conversation-control=\"header\"]{height: 36px; min-height: 36px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px}html[data-dsh-prts] [data-prts-conversation-control=\"header\"] svg{width: 16px; height: 16px; flex: 0 0 16px}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] button[aria-label*=\"send\" i],html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] button[type=\"submit\"]{min-width: 40px !important; padding: 0 !important; font-size: 11px}html[data-dsh-prts] [data-prts-hero-active] [data-prts-glass-control=\"action\"]{width: 36px !important; min-width: 36px !important; padding: 0 !important; flex: 0 0 36px}html[data-dsh-prts] :is( [data-composer-card] button:not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-composer-fallback] button:not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-glass-control],[data-prts-conversation-control]:not([data-prts-conversation-control=\"micro\"]),[data-produced-files-row] > button[type=\"button\"] ){--prts-control-outline: var(--prts-line); --prts-control-surface: var(--prts-panel-raised); position: relative; isolation: isolate; overflow: hidden; border: 0 !important; border-radius: 0 !important; background: var(--prts-control-outline) !important; color: var(--prts-ink) !important; clip-path: polygon( 3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px ) !important}html[data-dsh-prts] :is( [data-composer-card] button:not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-composer-fallback] button:not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-glass-control],[data-prts-conversation-control]:not([data-prts-conversation-control=\"micro\"]),[data-produced-files-row] > button[type=\"button\"] )::before{content: \"\"; position: absolute; z-index: -1; inset: 1px; background: var(--prts-control-surface); clip-path: polygon( 2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px ); pointer-events: none}html[data-dsh-prts] :is( [data-composer-card] button:not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-composer-fallback] button:not([data-prts-glass-menu] *):not([data-prts-floating-glass] *):not([role=\"menu\"] *):not([role=\"listbox\"] *),[data-prts-glass-control],[data-prts-conversation-control]:not([data-prts-conversation-control=\"micro\"]),[data-produced-files-row] > button[type=\"button\"] ):is(:hover,:focus-visible){--prts-control-outline: var(--prts-yellow)}html[data-dsh-prts] :is( [data-prts-glass-control=\"model\"],[data-prts-glass-control=\"permission\"],[data-prts-glass-control=\"preset\"],[data-prts-conversation-control=\"utility\"],[data-produced-files-row] > button[type=\"button\"] ){--prts-control-surface: var(--prts-active-glass) !important}html[data-dsh-prts] [data-composer-card] button[aria-label*=\"send\" i],html[data-dsh-prts] [data-composer-card] button[type=\"submit\"],html[data-dsh-prts] [data-prts-conversation-control=\"cta\"]{font-size: 11px; --prts-control-outline: var(--prts-yellow) !important; --prts-control-surface: var(--prts-yellow) !important; color: var(--prts-yellow-ink) !important}html[data-dsh-prts] [data-prts-conversation-control=\"danger\"]{--prts-control-outline: var(--prts-red) !important; --prts-control-surface: color-mix(in srgb,var(--prts-red) 14%,var(--prts-panel-raised)) !important; color: var(--prts-red) !important}html[data-dsh-prts] [data-prts-hero-active]{--prts-hero-narrow-spacer: clamp(24px,8dvh,72px); --prts-hero-wide-spacer: clamp(96px,22dvh,340px); min-height: 100%; height: calc(100% - 48px) !important; overflow-y: auto; display: grid; grid-template-columns: minmax(0,1fr); grid-template-rows: minmax(0,1fr) auto min( var(--prts-hero-wide-spacer),max(var(--prts-hero-narrow-spacer),calc(var(--prts-hero-narrow-spacer) + 63vw - 403.2px)) ); align-content: stretch; gap: clamp(24px,calc(5vw - 8px),40px); padding: clamp(18px,calc(1.875vw + 6px),24px) clamp(12px,3vw,42px) 0 clamp(18px,3vw,42px)}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card],html[data-dsh-prts] [data-prts-hero-active] [data-prts-composer-fallback]{width: 100%; margin-inline: auto; padding: 10px 12px}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] textarea,html[data-dsh-prts] [data-prts-hero-active] [data-prts-composer-fallback] textarea{min-height: 64px; line-height: 1.55; resize: vertical}html[data-dsh-prts] [data-prts-hero-active] [data-composer-card] button,html[data-dsh-prts] [data-prts-hero-active] [data-prts-glass-control]{min-height: 36px}html[data-dsh-prts] [data-prts-hero-active]::before{margin-top: calc(var(--prts-hero-mark-size) + 44px)}html[data-dsh-prts] [data-prts-hero-active] [data-phase=\"hero\"]{grid-row: 1; min-height: 0; align-self: stretch}html[data-dsh-prts] [data-prts-hero-active] [data-composer-seat]{grid-row: 2; width: min(calc(780px + 32px),100%); min-width: 0 !important; align-self: end; justify-self: center}html[data-dsh-prts] [data-prts-theme-settings]{--prts-settings-text: .875rem; --prts-settings-small: .75rem; --prts-settings-heading: .875rem; position: fixed; z-index: 10000; inset: 50% auto auto 50%; width: min(clamp(50rem,55vw,65rem),calc(100vw - 2rem)); height: auto; max-width: none; max-height: min(60rem,calc(100dvh - 2rem)); container: prts-settings / inline-size; margin: 0; padding: 0; overflow: visible; border: 0; border-radius: 0; background: transparent; color: var(--prts-ink); box-shadow: 0 28px 90px rgba(0,0,0,.46); clip-path: none; opacity: 0; transform: translate(-50%,calc(-50% + 8px)) scale(.992); pointer-events: none; transition: opacity 150ms ease,transform 220ms var(--prts-ease-spring)}html[data-dsh-prts] [data-prts-theme-settings][open]{display: block}html[data-dsh-prts] [data-prts-theme-settings][data-prts-settings-visible]{opacity: 1; transform: translate(-50%,-50%) scale(1); pointer-events: auto}html[data-dsh-prts] [data-prts-theme-settings][data-prts-resizing]{transition: none}html[data-dsh-prts] [data-prts-theme-settings][data-prts-resizing]::backdrop,html[data-dsh-prts] [data-prts-settings-backdrop][data-prts-resizing]{backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-prts-theme-settings][data-prts-resizing] [data-prts-option-sample=\"glass\"]::after{backdrop-filter: none; -webkit-backdrop-filter: none; transition: none}html[data-dsh-prts] [data-prts-theme-settings]::before{content: none}html[data-dsh-prts] [data-prts-theme-settings]::backdrop{background: color-mix(in srgb,var(--prts-canvas) 72%,transparent); backdrop-filter: blur(5px) saturate(.82); -webkit-backdrop-filter: blur(5px) saturate(.82)}html[data-dsh-prts] [data-prts-settings-backdrop]{z-index: 9999; inset: 0; background: color-mix(in srgb,var(--prts-canvas) 72%,transparent); backdrop-filter: blur(5px) saturate(.82); -webkit-backdrop-filter: blur(5px) saturate(.82)}html[data-dsh-prts] [data-prts-settings-frame]{position: relative; height: auto; max-height: inherit; display: grid; grid-template-rows: auto minmax(0,1fr); overflow: hidden; isolation: isolate; border: 1px solid var(--prts-line-strong); background: linear-gradient(125deg,color-mix(in srgb,var(--prts-cyan) 4%,transparent),transparent 34%),var(--prts-panel); clip-path: polygon(4px 0,calc(100% - 38px) 0,100% 38px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px)}html[data-dsh-prts] [data-prts-settings-frame]::before{content: \"\"; position: absolute; z-index: 3; top: 0; right: 37px; width: 118px; height: 2px; background: var(--prts-cyan); pointer-events: none}html[data-dsh-prts] [data-prts-theme-settings-header]{display: grid; align-items: center; min-height: 68px; grid-template-columns: minmax(180px,auto) minmax(0,1fr); gap: 14px; padding: 13px 48px 12px 16px; border-bottom: 1px solid var(--prts-line-strong); background: color-mix(in srgb,var(--prts-canvas-elevated) 92%,transparent)}html[data-dsh-prts] [data-prts-theme-settings-header] > span{display: grid; gap: 4px}html[data-dsh-prts] [data-prts-theme-settings-header] small,html[data-dsh-prts] [data-prts-theme-settings] section > header small,html[data-dsh-prts] [data-prts-theme-settings] summary small,html[data-dsh-prts] [data-prts-settings-actions] small{color: var(--prts-muted); font: 700 8px/1.3 var(--prts-mono); letter-spacing: .08em}html[data-dsh-prts] [data-prts-theme-settings-header] strong{font: 800 19px/1 var(--prts-display); letter-spacing: .07em}html[data-dsh-prts] [data-prts-settings-summary]{display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px}html[data-dsh-prts] [data-prts-settings-summary] span{min-height: 22px; padding: 4px 7px; box-shadow: inset 0 0 0 1px var(--prts-line); background: color-mix(in srgb,var(--prts-panel-raised) 86%,transparent); color: var(--prts-cyan); font: 700 8px/1 var(--prts-mono); clip-path: polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}html[data-dsh-prts] [data-prts-theme-settings-close]{position: absolute; z-index: 5; top: 13px; right: 13px; width: 36px; height: 36px; color: var(--prts-ink)}html[data-dsh-prts] [data-prts-theme-settings-scroll]{min-height: 0; overflow-y: auto; padding: 12px; scrollbar-gutter: stable}html[data-dsh-prts] [data-prts-settings-presets],html[data-dsh-prts] [data-prts-settings-common],html[data-dsh-prts] [data-prts-settings-advanced],html[data-dsh-prts] [data-prts-settings-actions]{position: relative; margin: 0; overflow: hidden; border: 0; border-bottom: 1px solid var(--prts-line-strong); background: color-mix(in srgb,var(--prts-canvas-elevated) 82%,transparent); clip-path: none}html[data-dsh-prts] [data-prts-settings-presets] > header,html[data-dsh-prts] [data-prts-settings-common] > header{min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 11px; border-bottom: 1px solid color-mix(in srgb,var(--prts-line) 72%,transparent)}html[data-dsh-prts] [data-prts-settings-presets] > header span,html[data-dsh-prts] [data-prts-settings-common] > header span,html[data-dsh-prts] [data-prts-settings-advanced] summary > span{display: flex; align-items: baseline; gap: 9px}html[data-dsh-prts] [data-prts-settings-presets] > header strong,html[data-dsh-prts] [data-prts-settings-common] > header strong,html[data-dsh-prts] [data-prts-settings-advanced] summary strong{font: 800 13px/1 var(--prts-display); letter-spacing: .05em}html[data-dsh-prts] [data-prts-advanced-summary]{pointer-events: none; color: var(--prts-cyan); font: 800 8px/1 var(--prts-mono); letter-spacing: .06em}html[data-dsh-prts] [data-prts-settings-presets],html[data-dsh-prts] [data-prts-settings-common],html[data-dsh-prts] [data-prts-settings-advanced],html[data-dsh-prts] [data-prts-settings-actions]{border-inline: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-settings-presets]{border-top: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-settings-presets] > div{display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 0; padding: 0}html[data-dsh-prts] [data-prts-preset-card]{display: grid; text-align: left; min-height: 66px; align-content: center; gap: 6px; padding: 11px 12px !important; border-right: 1px solid var(--prts-line) !important; position: relative; overflow: hidden; box-shadow: none; background: transparent !important; clip-path: none}html[data-dsh-prts] [data-prts-preset-card]:last-child{border-right: 0 !important}html[data-dsh-prts] [data-prts-preset-card] strong{font-size: 12px}html[data-dsh-prts] [data-prts-preset-card] span{overflow: hidden; font-size: 8px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-preset-card].is-selected{box-shadow: inset 0 -2px 0 var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 9%,transparent) !important}html[data-dsh-prts] [data-prts-settings-common-grid]{display: grid; grid-template-columns: repeat(2,minmax(0,1fr))}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{min-height: 50px; grid-template-columns: 94px minmax(0,1fr); align-items: center; gap: 8px; padding: 7px 10px; border-right: 1px solid var(--prts-line); border-bottom: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:nth-child(2n){border-right: 0}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:nth-last-child(-n + 2){border-bottom: 0}html[data-dsh-prts] [data-prts-setting-row] > div{min-width: 0; display: flex; gap: 4px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row] > span{min-width: 0; display: grid; gap: 3px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row] > span > strong{font: 700 9px/1.1 var(--prts-display)}html[data-dsh-prts] [data-prts-setting-note]{color: var(--prts-yellow); font: 700 7px/1.25 var(--prts-mono); letter-spacing: 0}html[data-dsh-prts] [data-prts-settings-common] button[data-prts-setting-key]{min-width: 0; flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; gap: 5px}html[data-dsh-prts] [data-prts-option-sample]{position: relative; width: 22px; height: 14px; flex: 0 0 22px; overflow: hidden; border: 1px solid color-mix(in srgb,currentColor 45%,var(--prts-line)); background: var(--prts-canvas)}html[data-dsh-prts] [data-prts-option-sample=\"texture\"][data-prts-option-sample-value=\"off\"]{background: linear-gradient(var(--prts-line),var(--prts-line)) 50% 50% / 12px 1px no-repeat,var(--prts-canvas)}html[data-dsh-prts] [data-prts-option-sample=\"texture\"][data-prts-option-sample-value=\"restrained\"]{background: repeating-linear-gradient(115deg,var(--prts-canvas) 0 6px,color-mix(in srgb,var(--prts-cyan) 38%,var(--prts-canvas)) 6px 7px)}html[data-dsh-prts] [data-prts-option-sample=\"texture\"][data-prts-option-sample-value=\"full\"]{background: repeating-linear-gradient(115deg,transparent 0 4px,color-mix(in srgb,var(--prts-cyan) 62%,transparent) 4px 5px),repeating-linear-gradient(25deg,var(--prts-canvas) 0 7px,color-mix(in srgb,var(--prts-line-strong) 72%,var(--prts-canvas)) 7px 8px)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"]{background: linear-gradient(135deg,color-mix(in srgb,var(--prts-cyan) 54%,transparent) 25%,transparent 25%) 0 0 / 8px 8px,linear-gradient(315deg,color-mix(in srgb,var(--prts-yellow) 38%,transparent) 25%,transparent 25%) 4px 4px / 8px 8px,var(--prts-canvas)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"]::after{content: \"\"; position: absolute; inset: 0; background: color-mix(in srgb,var(--prts-panel-raised) 64%,transparent); backdrop-filter: blur(2px) saturate(1.15); -webkit-backdrop-filter: blur(2px) saturate(1.15)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"off\"]::after{background: var(--prts-panel-raised); backdrop-filter: none; -webkit-backdrop-filter: none}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"soft\"]::after{background: color-mix(in srgb,var(--prts-panel-raised) 82%,transparent); backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"standard\"]::after{background: color-mix(in srgb,var(--prts-panel-raised) 62%,transparent)}html[data-dsh-prts] [data-prts-option-sample=\"glass\"][data-prts-option-sample-value=\"clear\"]::after{background: color-mix(in srgb,var(--prts-panel-raised) 34%,transparent); backdrop-filter: blur(4px) saturate(1.35); -webkit-backdrop-filter: blur(4px) saturate(1.35)}html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key],html[data-dsh-prts] [data-prts-retry-save],html[data-dsh-prts] [data-prts-reset-visual],html[data-dsh-prts] [data-prts-reset-confirm-action],html[data-dsh-prts] [data-prts-reset-cancel]{position: relative; overflow: hidden; min-height: 30px; padding: 6px 8px; border: 0 !important; box-shadow: inset 0 0 0 1px var(--prts-line); background: var(--prts-panel-raised); color: var(--prts-muted); font: 700 8px/1 var(--prts-mono); white-space: nowrap; clip-path: polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key].is-selected{box-shadow: inset 0 0 0 1px var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 12%,var(--prts-panel-raised)); color: var(--prts-ink); html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key]::after{content: \"\"; position: absolute; z-index: 3; inset: 0; opacity: 0; box-shadow: inset 0 0 0 1px var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 18%,transparent); pointer-events: none}html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key][data-prts-setting-feedback]::after{opacity: 1}}html[data-dsh-prts] [data-prts-theme-settings] button:focus-visible,html[data-dsh-prts] [data-prts-theme-settings] summary:focus-visible,html[data-dsh-prts] [data-prts-theme-settings] input:focus-visible{outline: 2px solid var(--prts-cyan); outline-offset: 2px}html[data-dsh-prts] [data-prts-settings-advanced] summary{min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px; cursor: pointer; list-style: none}html[data-dsh-prts] [data-prts-settings-advanced] summary::-webkit-details-marker{display: none}html[data-dsh-prts] [data-prts-settings-advanced] summary::after{content: \"+\"; width: 24px; height: 24px; display: grid; place-items: center; margin-left: 2px; border: 1px solid var(--prts-line); color: var(--prts-cyan); font: 800 13px/1 var(--prts-mono)}html[data-dsh-prts] [data-prts-settings-advanced][open] summary::after{content: \"−\"}html[data-dsh-prts] [data-prts-settings-advanced-content]{display: grid; grid-template-columns: minmax(0,.8fr) minmax(0,1.2fr); border-top: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-settings-advanced-content] > section{padding: 11px}html[data-dsh-prts] [data-prts-settings-advanced-content] > section + section{border-left: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-advanced-content] section > header{min-height: 30px; display: grid; gap: 4px}html[data-dsh-prts] [data-prts-settings-advanced-content] section > header strong{font-size: 10px}html[data-dsh-prts] [data-prts-settings-advanced-content] section > header span{color: var(--prts-muted); font-size: 8px}html[data-dsh-prts] [data-prts-particle-detail] > div{display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 5px; margin-top: 8px}html[data-dsh-prts] [data-prts-particle-detail] button[role=\"radio\"]{min-width: 0; display: grid; gap: 5px}html[data-dsh-prts] [data-prts-particle-detail-preview]{height: 32px; display: grid; grid-template-columns: repeat(6,1fr); place-items: center; overflow: hidden; border: 1px solid color-mix(in srgb,currentColor 44%,transparent)}html[data-dsh-prts] [data-prts-particle-detail-preview] b{width: 2px; height: 2px; background: currentColor}html[data-dsh-prts] [data-prts-particle-error]{margin: 8px 0 0; color: var(--prts-yellow); font: 700 8px/1.4 var(--prts-mono)}html[data-dsh-prts] [data-prts-scale-calibration]{--prts-calibration-distance: 96px; margin: 8px 0 0; padding: 8px; overflow: hidden; border: 1px solid var(--prts-line); background: color-mix(in srgb,var(--prts-panel-raised) 84%,transparent)}html[data-dsh-prts] [data-prts-scale-calibration-viewport]{position: relative; width: 100%; height: 94px; overflow: hidden}html[data-dsh-prts] [data-prts-scale-calibration-canvas]{position: absolute; top: 0; left: 0; width: 360px; height: 94px; transform-origin: top left}html[data-dsh-prts] [data-prts-scale-calibration-sidebar]{position: absolute; inset: 8px auto 8px 0; width: 4px; background: var(--prts-line-strong); box-shadow: 8px 0 0 color-mix(in srgb,var(--prts-line) 45%,transparent)}html[data-dsh-prts] [data-prts-scale-calibration-measure]{position: absolute; top: 6px; left: 0; width: var(--prts-calibration-distance); height: 18px; border-top: 1px solid var(--prts-cyan); color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-scale-calibration-measure]::before,html[data-dsh-prts] [data-prts-scale-calibration-measure]::after{content: \"\"; position: absolute; top: -4px; width: 1px; height: 7px; background: currentColor}html[data-dsh-prts] [data-prts-scale-calibration-measure]::before{left: 0}html[data-dsh-prts] [data-prts-scale-calibration-measure]::after{right: 0}html[data-dsh-prts] [data-prts-scale-calibration-value]{position: absolute; top: 4px; right: 3px; padding-left: 4px; background: var(--prts-panel-raised); color: currentColor; font: 800 8px/1 var(--prts-mono)}html[data-dsh-prts] [data-prts-scale-calibration-rail]{position: absolute; top: 29px; left: var(--prts-calibration-distance); width: 32px; height: 58px; border: 1px solid var(--prts-line-strong); background: color-mix(in srgb,var(--prts-canvas) 62%,transparent)}html[data-dsh-prts] [data-prts-scale-calibration-rail] i{position: absolute; top: calc(5px + var(--prts-calibration-tick) * 6px); left: 2px; width: 9px; height: 1px; background: var(--prts-muted)}html[data-dsh-prts] [data-prts-scale-calibration-rail] i:nth-child(4n + 1){width: 24px}html[data-dsh-prts] [data-prts-scale-calibration-rail] i:nth-child(4n + 2){width: 18px}html[data-dsh-prts] [data-prts-scale-calibration-rail] i:last-child{width: 24px; background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-scale-calibration-gap]{position: absolute; top: 29px; left: calc(var(--prts-calibration-distance) + 32px); width: 12px; height: 58px; background: repeating-linear-gradient(135deg,transparent 0 3px,color-mix(in srgb,var(--prts-line) 42%,transparent) 3px 4px)}html[data-dsh-prts] [data-prts-scale-calibration-content]{position: absolute; inset: 29px 0 7px calc(var(--prts-calibration-distance) + 44px); min-width: 16px; overflow: hidden; border-left: 1px solid var(--prts-cyan); background: color-mix(in srgb,var(--prts-panel) 84%,transparent)}html[data-dsh-prts] [data-prts-scale-calibration-content] i{display: block; width: min(78%,138px); height: 1px; margin: 18px 10px 9px; background: var(--prts-line-strong); box-shadow: 0 8px 0 var(--prts-line)}html[data-dsh-prts] [data-prts-scale-calibration-content] small{margin-left: 10px; color: var(--prts-dim); font: 700 7px/1 var(--prts-mono); white-space: nowrap}html[data-dsh-prts] [data-prts-scale-calibration-meta]{min-height: 20px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; padding-top: 7px; border-top: 1px solid var(--prts-line); font: 700 8px/1.3 var(--prts-mono)}html[data-dsh-prts] [data-prts-scale-calibration-status]{margin-left: auto; color: var(--prts-muted); text-align: right}html[data-dsh-prts] [data-prts-scale-calibration][data-prts-calibration-mode=\"configured\"] [data-prts-scale-calibration-status],html[data-dsh-prts] [data-prts-scale-calibration][data-prts-calibration-mode=\"simulated\"] [data-prts-scale-calibration-status]{color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-scale-calibration][data-prts-calibration-mode=\"centered\"] [data-prts-scale-calibration-status],html[data-dsh-prts] [data-prts-scale-calibration-scale]{color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-setting-range-row]{display: grid; gap: 7px; padding: 8px 0 0; border: 0}html[data-dsh-prts] [data-prts-setting-range-row] > div{display: flex; align-items: center; gap: 8px}html[data-dsh-prts] [data-prts-setting-range-row] input[type=\"range\"]{min-width: 0; flex: 1}html[data-dsh-prts] [data-prts-setting-range]{accent-color: var(--prts-cyan)}html[data-dsh-prts] :is([data-prts-scale-distance-output],[data-prts-scale-focus-output]){min-width: 42px; color: var(--prts-cyan); font: 800 8px/1 var(--prts-mono); text-align: right}html[data-dsh-prts] [data-prts-scale-focus-preview]{width: 34px; min-width: 34px; height: 30px; display: grid; align-content: center; gap: 4px}html[data-dsh-prts] [data-prts-scale-focus-preview] i{display: block; height: 1px; max-width: 30px; background: var(--prts-yellow); transition: width 100ms ease}html[data-dsh-prts] [data-prts-settings-actions]{min-height: 58px; display: block; padding: 0; border-bottom: 1px solid var(--prts-line-strong)}html[data-dsh-prts] [data-prts-persistence-error],html[data-dsh-prts] [data-prts-reset-zone]{min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 11px}html[data-dsh-prts] [data-prts-persistence-error]{border-bottom: 1px solid var(--prts-yellow); background: color-mix(in srgb,var(--prts-yellow) 7%,transparent)}html[data-dsh-prts] [data-prts-persistence-error] > span,html[data-dsh-prts] [data-prts-reset-zone] > span{display: grid; gap: 4px}html[data-dsh-prts] [data-prts-persistence-error] strong{color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-reset-visual],html[data-dsh-prts] [data-prts-reset-confirm-action]{color: var(--prts-yellow); box-shadow: inset 0 0 0 1px var(--prts-yellow)}html[data-dsh-prts] [data-prts-reset-confirm]{display: flex; align-items: center; justify-content: flex-end; gap: 5px; color: var(--prts-yellow); font: 700 8px/1.3 var(--prts-mono)}html[data-dsh-prts] [hidden]{display: none !important}html[data-dsh-prts] :is( [data-prts-theme-settings-header] small,[data-prts-theme-settings] section > header small,[data-prts-theme-settings] summary small,[data-prts-settings-actions] small,[data-prts-settings-summary] span,[data-prts-advanced-summary],[data-prts-preset-card] span,[data-prts-setting-note],[data-prts-settings-advanced-content] section > header span,[data-prts-particle-error],[data-prts-scale-calibration-value],[data-prts-scale-calibration-content] small,[data-prts-scale-calibration-meta],[data-prts-scale-distance-output],[data-prts-reset-confirm] ){font-size: var(--prts-settings-small); line-height: 1.4}html[data-dsh-prts] :is( [data-prts-settings-presets] > header strong,[data-prts-settings-common] > header strong,[data-prts-settings-advanced] summary strong,[data-prts-preset-card] strong,[data-prts-settings-common] [data-prts-setting-row] > span > strong,[data-prts-settings-advanced-content] section > header strong,[data-prts-theme-settings] button[data-prts-setting-key],[data-prts-retry-save],[data-prts-reset-visual],[data-prts-reset-confirm-action],[data-prts-reset-cancel] ){font-size: var(--prts-settings-text); line-height: 1.25}html[data-dsh-prts] [data-prts-theme-settings-header] strong{font-size: 1.375rem; line-height: 1.1}html[data-dsh-prts] [data-prts-settings-summary] span{min-height: 28px; padding: 6px 9px}html[data-dsh-prts] [data-prts-preset-card]{min-height: 84px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{min-height: 72px; grid-template-columns: minmax(7.5rem,auto) minmax(0,1fr)}html[data-dsh-prts] :is( [data-prts-theme-settings] button[data-prts-setting-key],[data-prts-retry-save],[data-prts-reset-visual],[data-prts-reset-confirm-action],[data-prts-reset-cancel] ){min-height: 40px; padding: 8px 10px}@container prts-settings (max-width: 52rem){html[data-dsh-prts] [data-prts-settings-common-grid],html[data-dsh-prts] [data-prts-settings-advanced-content]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{border-right: 0}html[data-dsh-prts] [data-prts-settings-advanced-content] > section + section{border-left: 0; border-top: 1px solid var(--prts-line)}}@media (max-height: 820px) and (min-width: 721px){html[data-dsh-prts] [data-prts-theme-settings-header]{min-height: 60px; padding-block: 10px}html[data-dsh-prts] [data-prts-theme-settings-close]{top: 10px}}@media (max-width: 720px){html[data-dsh-prts] [data-prts-theme-settings]{inset: 0; width: 100vw; height: 100dvh; max-height: none; margin: 0; transform: translateY(10px)}html[data-dsh-prts] [data-prts-theme-settings][data-prts-settings-visible]{transform: translateY(0)}html[data-dsh-prts] [data-prts-settings-frame]{height: 100%; max-height: none; clip-path: none; border: 0}html[data-dsh-prts] [data-prts-settings-frame]::before{right: 0}html[data-dsh-prts] [data-prts-theme-settings-header]{grid-template-columns: minmax(0,1fr); padding: 12px 48px 11px 13px}html[data-dsh-prts] [data-prts-settings-summary]{display: none}html[data-dsh-prts] [data-prts-theme-settings-scroll]{padding: 8px; scrollbar-gutter: auto}html[data-dsh-prts] [data-prts-settings-presets] > div{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-preset-card]{min-height: 54px; border-right: 0 !important; border-bottom: 1px solid var(--prts-line) !important}html[data-dsh-prts] [data-prts-preset-card]:last-child{border-bottom: 0 !important}html[data-dsh-prts] [data-prts-settings-common-grid]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{min-height: 62px}html[data-dsh-prts] [data-prts-settings-common] button[data-prts-setting-key]{min-height: 40px}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]{border-right: 0; border-bottom: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:nth-last-child(2){border-bottom: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-settings-common] [data-prts-setting-row]:last-child{border-bottom: 0}html[data-dsh-prts] [data-prts-settings-advanced-content]{grid-template-columns: minmax(0,1fr)}html[data-dsh-prts] [data-prts-settings-advanced-content] > section + section{border-left: 0; border-top: 1px solid var(--prts-line)}html[data-dsh-prts] [data-prts-reset-zone]{align-items: flex-start; flex-direction: column}html[data-dsh-prts] [data-prts-reset-confirm]{width: 100%; flex-wrap: wrap; justify-content: flex-start}}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts] [data-prts-theme-settings] button[data-prts-setting-key][data-prts-setting-feedback]::after{animation: prts-setting-feedback 300ms ease-out both}}@keyframes prts-setting-feedback{0%{opacity: .82}100%{opacity: 0}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-theme-settings]{transition-duration: 1ms}}@media (prefers-reduced-transparency: reduce){html[data-dsh-prts] [data-prts-theme-settings]::backdrop,html[data-dsh-prts] [data-prts-settings-backdrop]{background: color-mix(in srgb,var(--prts-canvas) 94%,transparent); backdrop-filter: none; -webkit-backdrop-filter: none}}html[data-dsh-prts] [data-prts-facility-defs]{position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none}html[data-dsh-prts] [data-prts-facility-svg]{position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none}html[data-dsh-prts] [data-prts-facility-layer=\"surface\"]{fill: var(--prts-facility-surface,var(--prts-panel-raised))}html[data-dsh-prts] [data-prts-facility-layer=\"texture\"]{fill: none; opacity: 0; pointer-events: none; transition: opacity 160ms ease}html[data-dsh-prts] [data-prts-facility-layer=\"outline\"]{fill: none; stroke: var(--prts-facility-outline,var(--prts-line-strong)); stroke-width: 1; stroke-linejoin: miter; stroke-miterlimit: 2; vector-effect: non-scaling-stroke; shape-rendering: geometricPrecision; pointer-events: none}html[data-dsh-prts] [data-prts-facility-vector][data-prts-facility-texture=\"grid\"] [data-prts-facility-layer=\"texture\"]{fill: var(--prts-facility-texture-color,var(--prts-cyan)); opacity: var(--prts-facility-texture-opacity,.12); mask: url(\"#prts-facility-grid-mask\")}html[data-dsh-prts] [data-prts-facility-vector][data-prts-facility-texture=\"scanline\"] [data-prts-facility-layer=\"texture\"]{fill: var(--prts-facility-texture-color,var(--prts-cyan)); opacity: var(--prts-facility-texture-opacity,.1); mask: url(\"#prts-facility-scanline-mask\")}html[data-dsh-prts] [data-prts-workspace-row]{--prts-facility-texture-color: var(--prts-cyan); --prts-silhouette-fill: #f3f6f7; --prts-silhouette-far-opacity: .06; --prts-silhouette-near-opacity: .12}html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-workspace-row]{--prts-silhouette-fill: #3f4d56; --prts-silhouette-far-opacity: .13; --prts-silhouette-near-opacity: .26}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"],html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]){--prts-silhouette-far-opacity: .24; --prts-silhouette-near-opacity: .52}html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-workspace-row][aria-expanded=\"true\"],html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]){--prts-silhouette-far-opacity: .25; --prts-silhouette-near-opacity: .5}html[data-dsh-prts] [data-prts-facility-texture=\"silhouette\"] [data-prts-facility-layer=\"texture\"]{opacity: 0}html[data-dsh-prts] [data-prts-facility-silhouette]{fill: var(--prts-silhouette-fill); opacity: 0; pointer-events: none}html[data-dsh-prts] [data-prts-facility-texture=\"silhouette\"] [data-prts-facility-silhouette]{opacity: 1}html[data-dsh-prts] [data-prts-silhouette-layer]{transform-box: fill-box; transform-origin: left center; animation-timing-function: linear; animation-iteration-count: infinite; animation-play-state: paused; will-change: transform; transition: opacity 180ms ease}html[data-dsh-prts] [data-prts-silhouette-layer=\"far\"]{opacity: var(--prts-silhouette-far-opacity); animation-name: prts-silhouette-far-drift; animation-duration: 22.4s}html[data-dsh-prts] [data-prts-silhouette-layer=\"near\"]{opacity: var(--prts-silhouette-near-opacity); animation-name: prts-silhouette-near-drift; animation-duration: 6.4s}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts]:not([data-prts-motion=\"reduced\"]) [data-prts-workspace-row]:hover [data-prts-silhouette-layer]{animation-play-state: running}}@keyframes prts-silhouette-far-drift{to{transform: translate3d(-512px,0,0)}}@keyframes prts-silhouette-near-drift{to{transform: translate3d(-512px,0,0)}}html[data-dsh-prts] [data-prts-facility-texture=\"pickup\"] [data-prts-facility-layer=\"texture\"]{opacity: 0}html[data-dsh-prts] [data-prts-session-pickup]{color: var(--prts-session-pickup-fill); fill: currentColor; opacity: 0; transform: translate3d(5px,0,0); transform-box: view-box; transform-origin: center; transition: opacity 150ms ease,transform 240ms cubic-bezier(.22,1,.36,1); pointer-events: none}html[data-dsh-prts] [data-prts-session-row]:hover [data-prts-facility-texture=\"pickup\"] [data-prts-session-pickup]{opacity: .58; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-session-pickup-baseline]{fill: none; stroke: currentColor; stroke-width: 1; opacity: .2; vector-effect: non-scaling-stroke}html[data-dsh-prts] [data-prts-session-pickup-indicator]{fill: var(--prts-yellow)}html[data-dsh-prts] [data-prts-session-pickup-bar]{transform-box: fill-box; transform-origin: center}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(1){--prts-pickup-duration: 520ms; --prts-pickup-delay: -.12s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(2){--prts-pickup-duration: 1180ms; --prts-pickup-delay: -.28s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(3){--prts-pickup-duration: 760ms; --prts-pickup-delay: -.44s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(4){--prts-pickup-duration: 1420ms; --prts-pickup-delay: -.18s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(5){--prts-pickup-duration: 640ms; --prts-pickup-delay: -.36s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(6){--prts-pickup-duration: 980ms; --prts-pickup-delay: -.52s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(7){--prts-pickup-duration: 480ms; --prts-pickup-delay: -.22s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(8){--prts-pickup-duration: 1260ms; --prts-pickup-delay: -.46s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(9){--prts-pickup-duration: 720ms; --prts-pickup-delay: -.14s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(10){--prts-pickup-duration: 1520ms; --prts-pickup-delay: -.4s}html[data-dsh-prts] [data-prts-session-pickup-bar]:nth-of-type(11){--prts-pickup-duration: 560ms; --prts-pickup-delay: -.3s}@media (prefers-reduced-motion: no-preference){html[data-dsh-prts]:not([data-prts-motion=\"reduced\"]) [data-prts-session-row]:hover [data-prts-session-pickup-indicator]{animation: prts-session-record-indicator 1.1s ease-in-out infinite}html[data-dsh-prts]:not([data-prts-motion=\"reduced\"]) [data-prts-session-row]:hover [data-prts-session-pickup-bar]{animation: prts-session-pickup-sample var(--prts-pickup-duration) ease-in-out var(--prts-pickup-delay) infinite}}@keyframes prts-session-record-indicator{0%,100%{opacity: .45}50%{opacity: 1}}@keyframes prts-session-pickup-sample{0%,100%{transform: scaleY(.28)}34%{transform: scaleY(1.08)}57%{transform: scaleY(.46)}78%{transform: scaleY(.86)}}html[data-dsh-prts] [data-prts-session-row]{--prts-facility-texture-color: var(--prts-muted); --prts-session-pickup-fill: #f3f6f7}html[data-dsh-prts][data-prts-scheme=\"light\"] [data-prts-session-row]{--prts-session-pickup-fill: #3f4d56}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"]{--prts-facility-texture-color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-workspace-row] > [data-prts-facility-spine],html[data-dsh-prts] [data-prts-session-row] > [data-prts-facility-spine]{--prts-facility-surface: var(--prts-line-strong); position: absolute !important; z-index: 2 !important; inset: 0 auto 0 0; height: 100% !important; isolation: isolate; width: var(--prts-spine-width); min-width: 0; transform: scaleX(var(--prts-spine-rest)) !important; transform-origin: left center; transition: transform 220ms var(--prts-ease-spring); pointer-events: none}html[data-dsh-prts] [data-prts-workspace-row] > [data-prts-facility-spine]{--prts-facility-surface: var(--prts-cyan)}html[data-dsh-prts] [data-prts-session-row][aria-selected=\"true\"] > [data-prts-facility-spine]{--prts-facility-surface: var(--prts-yellow)}html[data-dsh-prts] [data-prts-facility-spine] [data-prts-facility-layer=\"outline\"]{display: none}html[data-dsh-prts] [data-prts-workspace-row][aria-expanded=\"true\"] > [data-prts-facility-spine],html[data-dsh-prts] [data-prts-workspace-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) > [data-prts-facility-spine],html[data-dsh-prts] [data-prts-session-row]:is(:hover,:focus-within,[data-prts-row-menu-open]) > [data-prts-facility-spine]{transform: scaleX(1) !important}html[data-dsh-prts] [data-prts-workspace-row][data-prts-spine-vector]::before,html[data-dsh-prts] [data-prts-session-row][data-prts-spine-vector]::before{content: none !important; display: none !important}html[data-dsh-prts] [data-prts-facility-face][data-prts-facility-vector]{border: 0 !important; background: transparent !important; clip-path: none !important}html[data-dsh-prts] [data-prts-facility-face][data-prts-facility-vector]::after{content: none !important; display: none !important}html[data-dsh-prts] :is( [data-prts-workspace-actions],[data-prts-session-actions] ) button[data-prts-facility-vector]{--prts-facility-outline: var(--prts-line); --prts-facility-surface: var(--prts-panel-raised); overflow: visible; border: 0 !important; background: transparent !important; clip-path: none !important}html[data-dsh-prts] :is( [data-prts-workspace-actions],[data-prts-session-actions] ) button[data-prts-facility-vector]::before{content: none !important; display: none !important}html[data-dsh-prts] :is( [data-prts-workspace-actions],[data-prts-session-actions] ) button[data-prts-facility-vector]:is(:hover,:focus-visible){--prts-facility-outline: var(--prts-yellow); background: transparent !important}html[data-dsh-prts] [data-message-role]::before,html[data-dsh-prts] [data-chat-flow-kind]::before{content: none !important; display: none !important}html[data-dsh-prts] [data-conversation-scroll]:not([data-prts-hero-active])[data-prts-conversation-scale-ready]::before,html[data-dsh-prts] [data-conversation-scroll]:not([data-prts-hero-active])[data-prts-conversation-scale-empty]::before{content: none !important; display: none !important}html[data-dsh-prts] [data-prts-conversation-scale]{position: absolute; z-index: 8; width: 32px; min-height: 84px; margin: 0; padding: 0; overflow: hidden; opacity: .54; visibility: visible; transition: opacity 100ms ease,filter 150ms ease,visibility 0s linear; pointer-events: auto; touch-action: none; cursor: pointer; isolation: isolate}html[data-dsh-prts] [data-prts-conversation-scale][data-prts-resizing]{opacity: .38; filter: none; transition: none}html[data-dsh-prts] [data-prts-conversation-scale][data-prts-resizing] :is( [data-prts-conversation-scale-accent],[data-prts-conversation-scale-history] ){filter: none; transition: none}html[data-dsh-prts] [data-prts-conversation-scale]:is( [data-prts-conversation-scale-obstructed],[data-prts-conversation-scale-space-obstructed] ){opacity: 0; visibility: hidden; transition-delay: 0s,0s,100ms; pointer-events: none}html[data-dsh-prts] [data-prts-conversation-scale][data-prts-conversation-scale-blocked]{opacity: 0; visibility: hidden; transition: none; pointer-events: none}html[data-dsh-prts] [data-prts-conversation-scale]:focus{outline: none}html[data-dsh-prts] [data-prts-conversation-scale]:focus-visible{filter: drop-shadow(0 0 7px color-mix(in srgb,var(--prts-cyan) 34%,transparent))}html[data-dsh-prts] [data-prts-conversation-scale-svg]{position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: hidden; shape-rendering: geometricPrecision}html[data-dsh-prts] [data-prts-conversation-scale-marks]{pointer-events: none}html[data-dsh-prts] :is( [data-prts-conversation-scale-gray],[data-prts-conversation-scale-accent],[data-prts-conversation-scale-history] ){fill: none; stroke-width: 1; stroke-linecap: square; vector-effect: non-scaling-stroke; pointer-events: none}html[data-dsh-prts] [data-prts-conversation-scale-gray]{stroke: color-mix(in srgb,var(--prts-muted) 76%,var(--prts-line-strong))}html[data-dsh-prts] [data-prts-conversation-scale-accent]{stroke: var(--prts-yellow); filter: drop-shadow(0 0 4px color-mix(in srgb,var(--prts-yellow) 42%,transparent))}html[data-dsh-prts] [data-prts-conversation-scale-history]{stroke: var(--prts-cyan); stroke-width: 1.5; filter: drop-shadow(0 0 4px color-mix(in srgb,var(--prts-cyan) 38%,transparent))}html[data-dsh-prts] [data-prts-conversation-scale-history]{transition: stroke-width 100ms ease,filter 120ms ease}html[data-dsh-prts] [data-prts-conversation-scale][data-prts-conversation-history-selected] [data-prts-conversation-scale-history]{stroke-width: 2.5; filter: drop-shadow(0 0 3px color-mix(in srgb,var(--prts-cyan) 78%,transparent)) drop-shadow(0 0 8px color-mix(in srgb,var(--prts-cyan) 48%,transparent))}html[data-dsh-prts] [data-prts-conversation-history-hint],html[data-dsh-prts] [data-prts-conversation-history-hint] *{box-sizing: border-box}html[data-dsh-prts] [data-prts-conversation-history-hint]{position: absolute; z-index: 13; height: 8px; transform: translateY(-50%); pointer-events: auto}html[data-dsh-prts] [data-prts-conversation-history-hint][hidden],html[data-dsh-prts] [data-prts-conversation-history-tooltip][hidden]{display: none}html[data-dsh-prts] [data-prts-conversation-history-trigger]{width: 30px; min-width: 30px; height: 8px; min-height: 8px; max-height: 8px; padding: 0; display: block; border: 0; border-radius: 0; opacity: 0; background: transparent; cursor: pointer}html[data-dsh-prts] [data-prts-conversation-history-tooltip]{position: absolute; top: var(--prts-history-tooltip-top,50%); left: calc(100% + 10px); width: 360px; height: 128px; margin: 0; padding: 1px; overflow: visible; border: 0; background: var(--prts-line-strong); color: var(--prts-ink); clip-path: polygon( 3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px ); opacity: .98; transform: translate3d(0,0,0); pointer-events: none; isolation: isolate; animation: prts-conversation-history-tooltip-in 120ms var(--prts-ease-snap)}html[data-dsh-prts] [data-prts-conversation-history-tooltip]::before{content: \"\"; position: absolute; z-index: 0; inset: 1px; background: var(--prts-active-glass); clip-path: polygon( 2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px ); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-prts-conversation-history-tooltip] [data-prts-conversation-preview-row=\"question\"] b{color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-conversation-history-tooltip-label]{overflow: hidden; color: var(--prts-ink); text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-conversation-history-tooltip-content]{min-width: 0; display: grid; gap: 3px}html[data-dsh-prts] [data-prts-conversation-history-tooltip-content] strong{color: var(--prts-ink); font-size: 15px; font-weight: 750}html[data-dsh-prts] [data-prts-conversation-history-tooltip-content] span{overflow: hidden; color: var(--prts-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-conversation-history-tooltip-connector]{position: absolute; z-index: 2; top: var(--prts-history-tooltip-anchor-y,50%); right: 100%; width: 14px; height: 1px; background: linear-gradient(90deg,var(--prts-cyan),var(--prts-line-strong)); transform: translateY(-.5px); pointer-events: none}html[data-dsh-prts] [data-prts-conversation-history-tooltip-connector]::before{content: \"\"; position: absolute; top: -1px; left: 0; width: 3px; height: 3px; background: var(--prts-cyan)}@keyframes prts-conversation-history-tooltip-in{from{opacity: 0; transform: translate3d(-4px,0,0)}to{opacity: .98; transform: translate3d(0,0,0)}}html[data-dsh-prts] [data-prts-conversation-scale-hit]{pointer-events: all}html[data-dsh-prts] [data-prts-conversation-history-status],html[data-dsh-prts] [data-prts-conversation-history-status] *{box-sizing: border-box}html[data-dsh-prts] [data-prts-conversation-history-status]{position: absolute; z-index: 13; min-height: 34px; max-width: min(320px,calc(100% - 72px)); display: flex; align-items: center; gap: 10px; padding: 5px 6px 5px 10px; border: 1px solid var(--prts-line-strong); background: var(--prts-active-glass); color: var(--prts-ink); box-shadow: 0 8px 22px color-mix(in srgb,var(--prts-canvas) 22%,transparent); clip-path: polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px); font: 700 12px/1.35 var(--prts-mono); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-prts-conversation-history-status][hidden]{display: none}html[data-dsh-prts] [data-prts-conversation-history-text]{min-width: 0}html[data-dsh-prts] [data-prts-conversation-history-action]{min-width: 44px; min-height: 24px; padding: 3px 8px; border: 1px solid var(--prts-cyan); border-radius: 0; background: transparent; color: var(--prts-cyan); font: inherit; cursor: pointer}html[data-dsh-prts] [data-prts-conversation-history-status][data-prts-history-phase=\"error\"]{border-color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-conversation-history-status][data-prts-history-phase=\"loading\"]{color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-conversation-preview]{--prts-preview-anchor-y: 46px; position: absolute; z-index: 12; width: 360px; max-width: calc(100% - 64px); height: 128px; margin: 0; padding: 1px; overflow: visible; border: 0; background: var(--prts-line-strong); color: var(--prts-ink); clip-path: polygon( 3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px ); opacity: 0; visibility: hidden; transform: translate3d(-4px,0,0); transition: opacity 100ms ease,transform 120ms var(--prts-ease-snap),visibility 0s linear 120ms; pointer-events: none; isolation: isolate}html[data-dsh-prts] [data-prts-conversation-preview]::before{content: \"\"; position: absolute; z-index: 0; inset: 1px; background: var(--prts-active-glass); clip-path: polygon( 2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px ); backdrop-filter: var(--prts-active-glass-filter); -webkit-backdrop-filter: var(--prts-active-glass-filter)}html[data-dsh-prts] [data-prts-conversation-preview][data-prts-conversation-preview-visible]{opacity: .98; visibility: visible; transform: translate3d(0,0,0); transition-delay: 0s}html[data-dsh-prts] [data-prts-conversation-preview-connector]{position: absolute; z-index: 2; top: var(--prts-preview-anchor-y); right: 100%; width: 14px; height: 1px; background: linear-gradient(90deg,var(--prts-yellow),var(--prts-line-strong)); transform: translateY(-.5px); pointer-events: none}html[data-dsh-prts] [data-prts-conversation-preview-connector]::before{content: \"\"; position: absolute; top: -1px; left: 0; width: 3px; height: 3px; background: var(--prts-yellow)}html[data-dsh-prts] [data-prts-conversation-preview-body]{position: relative; z-index: 1; height: 100%; display: grid; grid-template-rows: 32px minmax(0,1fr); padding: 10px 14px 12px; font-family: var(--prts-mono)}html[data-dsh-prts] [data-prts-conversation-preview-row]{min-width: 0; display: grid; grid-template-columns: 24px minmax(0,1fr); column-gap: 8px; align-items: start; font-size: 15px; line-height: 1.45}html[data-dsh-prts] [data-prts-conversation-preview-row] b{font-size: 14px; font-weight: 750; line-height: 1.55; letter-spacing: .08em}html[data-dsh-prts] [data-prts-conversation-preview-row=\"question\"]{border-bottom: 1px solid color-mix(in srgb,var(--prts-line) 72%,transparent); color: var(--prts-ink)}html[data-dsh-prts] [data-prts-conversation-preview-row=\"question\"] b{color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-conversation-preview-row=\"answer\"]{padding-top: 6px; color: var(--prts-muted)}html[data-dsh-prts] [data-prts-conversation-preview-row=\"answer\"] b{color: var(--prts-cyan)}html[data-dsh-prts] [data-prts-conversation-preview-question]{display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}html[data-dsh-prts] [data-prts-conversation-preview-answer]{display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3}html[data-dsh-prts] [data-prts-conversation-preview][data-prts-preview-state=\"streaming\"] [data-prts-conversation-preview-answer]{color: var(--prts-yellow)}html[data-dsh-prts] [data-prts-conversation-scale][data-prts-conversation-scale-empty]{display: none}@media (max-width: 640px){html[data-dsh-prts] :is( [data-prts-conversation-scale],[data-prts-conversation-preview],[data-prts-conversation-history-hint],[data-prts-conversation-history-status] ){display: none !important}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-conversation-scale],html[data-dsh-prts] [data-prts-conversation-preview],html[data-dsh-prts] [data-prts-conversation-history-hint],html[data-dsh-prts] [data-prts-conversation-history-tooltip],html[data-dsh-prts] :is( [data-prts-conversation-scale-gray],[data-prts-conversation-scale-accent],[data-prts-conversation-scale-history] ){animation: none !important; transition: none !important}}html[data-dsh-prts] [data-prts-startup]{--prts-startup-bg: #07090b; --prts-startup-ink: #e8edef; --prts-startup-muted: #7d898f; --prts-startup-line: #394349; --prts-startup-accent: #f0c800; --prts-startup-progress: 0; position: fixed; z-index: 2147480000; inset: 0; width: 100vw; max-width: none; height: 100dvh; max-height: none; min-height: 100dvh; margin: 0; padding: 0; border: 0; overflow: hidden; isolation: isolate; box-sizing: border-box; background: transparent; color: var(--prts-startup-ink); font-family: var(--prts-body,sans-serif); opacity: 0; outline: 0; pointer-events: auto; transition: opacity 120ms ease}html[data-dsh-prts] [data-prts-startup]::before,html[data-dsh-prts] [data-prts-startup]::after{content: \"\"; position: absolute; z-index: -3; top: 0; bottom: 0; width: calc(50% + 2px); background: var(--prts-startup-bg); transition: transform 350ms cubic-bezier(.76,0,.24,1)}html[data-dsh-prts] [data-prts-startup]::before{left: 0}html[data-dsh-prts] [data-prts-startup]::after{right: 0}html[data-dsh-prts] [data-prts-startup][data-visible]{opacity: 1}html[data-dsh-prts] [data-prts-startup][data-exiting]::before{transform: translate3d(-101%,0,0)}html[data-dsh-prts] [data-prts-startup][data-exiting]::after{transform: translate3d(101%,0,0)}html[data-dsh-prts] [data-prts-startup-grid]{position: absolute; z-index: -2; inset: 0; opacity: 0; background: linear-gradient(90deg,transparent calc(50% - .5px),rgba(232,237,239,.17) 50%,transparent calc(50% + .5px)),linear-gradient(0deg,transparent calc(50% - .5px),rgba(232,237,239,.09) 50%,transparent calc(50% + .5px)),repeating-linear-gradient(90deg,rgba(232,237,239,.045) 0 1px,transparent 1px 80px),repeating-linear-gradient(0deg,rgba(232,237,239,.035) 0 1px,transparent 1px 80px); transform: scale3d(1.04,1.04,1); transition: opacity 220ms linear,transform 520ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-grid]{opacity: 1; transform: scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup-scan]{position: absolute; z-index: 4; top: -18%; right: 0; left: 0; height: 18%; opacity: 0; background: linear-gradient(180deg,transparent,rgba(240,200,0,.035) 68%,rgba(240,200,0,.24)); border-bottom: 1px solid rgba(240,200,0,.62); pointer-events: none}html[data-dsh-prts] [data-prts-startup][data-visible]:not([data-reduced-motion]) [data-prts-startup-scan]{opacity: 1; animation: prts-startup-scan 1100ms linear 120ms 2 both}html[data-dsh-prts] [data-prts-startup-cut]{position: absolute; z-index: 6; top: -15%; width: 8px; height: 130%; opacity: 0; background: var(--prts-startup-accent); transform: skewX(-13deg) translate3d(0,0,0); pointer-events: none}html[data-dsh-prts] [data-prts-startup-cut=\"left\"]{left: calc(50% - 4px)}html[data-dsh-prts] [data-prts-startup-cut=\"right\"]{right: calc(50% - 4px)}html[data-dsh-prts] [data-prts-startup][data-exiting] [data-prts-startup-cut=\"left\"]{animation: prts-startup-cut-left 350ms cubic-bezier(.76,0,.24,1) both}html[data-dsh-prts] [data-prts-startup][data-exiting] [data-prts-startup-cut=\"right\"]{animation: prts-startup-cut-right 350ms cubic-bezier(.76,0,.24,1) both}html[data-dsh-prts] [data-prts-startup-header]{position: absolute; z-index: 2; top: clamp(22px,4.5dvh,52px); right: clamp(22px,4vw,68px); left: clamp(22px,4vw,68px); display: flex; align-items: baseline; justify-content: space-between; gap: 24px; padding-bottom: 10px; border-bottom: 1px solid var(--prts-startup-line); opacity: 0; transform: translate3d(0,-9px,0); transition: opacity 180ms linear 60ms,transform 320ms cubic-bezier(.16,1,.3,1) 60ms}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-header]{opacity: 1; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-startup-header] span{font: 800 clamp(10px,1vw,13px)/1 var(--prts-display,sans-serif); letter-spacing: .18em}html[data-dsh-prts] [data-prts-startup-header] small,html[data-dsh-prts] [data-prts-startup-telemetry],html[data-dsh-prts] [data-prts-startup-coordinate]{color: var(--prts-startup-muted); font: 700 8px/1.35 var(--prts-mono,monospace); letter-spacing: .12em}html[data-dsh-prts] [data-prts-startup-telemetry]{position: absolute; z-index: 2; top: 50%; left: clamp(22px,4vw,68px); display: grid; gap: 12px; padding-left: 12px; border-left: 2px solid var(--prts-startup-accent); opacity: 0; transform: translate3d(-9px,-50%,0); transition: opacity 200ms linear 100ms,transform 360ms cubic-bezier(.16,1,.3,1) 100ms}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-telemetry]{opacity: 1; transform: translate3d(0,-50%,0)}html[data-dsh-prts] [data-prts-startup-core]{position: absolute; z-index: 3; top: 49%; left: 50%; width: min(76vw,560px); display: grid; justify-items: center; gap: clamp(15px,2.4dvh,26px); transform: translate3d(-50%,-50%,0)}html[data-dsh-prts] [data-prts-startup-frame]{position: relative; width: clamp(220px,27vw,320px); aspect-ratio: 1; display: grid; place-items: center}html[data-dsh-prts] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup-frame-inner]{position: absolute; inset: 15%; border: 1px solid var(--prts-startup-line); opacity: 0; transform: rotate(45deg) scale3d(.72,.72,1); transition: opacity 160ms linear,transform 420ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup-frame-inner]{inset: 23%; border-color: rgba(240,200,0,.76); transform: rotate(-45deg) scale3d(.68,.68,1); transition-delay: 80ms}html[data-dsh-prts] [data-prts-startup-reticle]{position: absolute; inset: 7%; opacity: 0; background: linear-gradient(var(--prts-startup-accent),var(--prts-startup-accent)) 50% 0 / 1px 15% no-repeat,linear-gradient(var(--prts-startup-accent),var(--prts-startup-accent)) 50% 100% / 1px 15% no-repeat,linear-gradient(90deg,var(--prts-startup-accent),var(--prts-startup-accent)) 0 50% / 15% 1px no-repeat,linear-gradient(90deg,var(--prts-startup-accent),var(--prts-startup-accent)) 100% 50% / 15% 1px no-repeat; transform: scale3d(.8,.8,1); transition: opacity 160ms linear,transform 400ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup-emblem]{position: relative; z-index: 2; width: 180px; max-width: 62%; height: auto; display: block; opacity: 0; clip-path: inset(48% 0 48% 0); transform: scale3d(.96,.96,1); transition: opacity 160ms linear,clip-path 380ms cubic-bezier(.16,1,.3,1),transform 420ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"linking\"] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-stage=\"authenticating\"] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-frame-outer]{opacity: .92; transform: rotate(45deg) scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"authenticating\"] :is([data-prts-startup-frame-inner],[data-prts-startup-reticle]),html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] :is([data-prts-startup-frame-inner],[data-prts-startup-reticle]),html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] :is([data-prts-startup-frame-inner],[data-prts-startup-reticle]){opacity: 1; transform: rotate(-45deg) scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"authenticating\"] [data-prts-startup-reticle],html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] [data-prts-startup-reticle],html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-reticle]{transform: scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup][data-stage=\"visualOnline\"] [data-prts-startup-emblem],html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-emblem]{opacity: 1; clip-path: inset(0 0 0 0); transform: scale3d(1,1,1)}html[data-dsh-prts] [data-prts-startup-signature]{min-height: 44px; display: flex; align-items: center; gap: 10px; opacity: 0; transform: translate3d(0,8px,0); transition: opacity 180ms linear,transform 230ms cubic-bezier(.16,1,.3,1)}html[data-dsh-prts] [data-prts-startup-signature] > span,html[data-dsh-prts] [data-prts-startup-signature] svg{width: 42px; height: 42px; display: block}html[data-dsh-prts] [data-prts-startup-signature] small{color: var(--prts-startup-muted); font: 800 8px/1.3 var(--prts-mono,monospace); letter-spacing: .1em}html[data-dsh-prts] [data-prts-startup][data-stage=\"ready\"] [data-prts-startup-signature]{opacity: 1; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-startup-state]{display: grid; justify-items: center; gap: 6px; text-align: center; opacity: 1; transform: translate3d(0,0,0); transition: opacity 90ms linear,transform 90ms cubic-bezier(.4,0,1,1)}html[data-dsh-prts] [data-prts-startup][data-copy-transition] [data-prts-startup-state]{opacity: 0; transform: translate3d(0,-4px,0)}html[data-dsh-prts] [data-prts-startup-state] strong{font: 900 clamp(18px,2.4vw,30px)/1 var(--prts-display,sans-serif); letter-spacing: .16em}html[data-dsh-prts] [data-prts-startup-state] span{color: var(--prts-startup-muted); font: 700 10px/1.2 var(--prts-mono,monospace); letter-spacing: .12em}html[data-dsh-prts] [data-prts-startup-progress]{position: absolute; z-index: 3; right: clamp(22px,7vw,120px); bottom: clamp(28px,6dvh,70px); left: clamp(22px,7vw,120px); display: grid; gap: 10px; opacity: 0; transform: translate3d(0,10px,0); transition: opacity 220ms linear 100ms,transform 480ms cubic-bezier(.16,1,.3,1) 100ms}html[data-dsh-prts] [data-prts-startup][data-visible] [data-prts-startup-progress]{opacity: 1; transform: translate3d(0,0,0)}html[data-dsh-prts] [data-prts-startup-progress] output{justify-self: start; color: var(--prts-startup-muted); font: 800 9px/1 var(--prts-mono,monospace); letter-spacing: .12em}html[data-dsh-prts] [data-prts-startup-percent]{color: var(--prts-startup-ink)}html[data-dsh-prts] [data-prts-startup-track]{position: relative; height: 18px; border-top: 1px solid var(--prts-startup-line)}html[data-dsh-prts] [data-prts-startup-fill]{position: absolute; top: -2px; right: 0; left: 0; height: 3px; background: var(--prts-startup-accent); transform: scaleX(var(--prts-startup-progress)); transform-origin: left center; will-change: transform}html[data-dsh-prts] [data-prts-startup-ticks]{position: absolute; inset: 4px 0 0; display: grid; grid-template-columns: repeat(21,minmax(0,1fr))}html[data-dsh-prts] [data-prts-startup-ticks] i{width: 1px; height: 4px; background: var(--prts-startup-line)}html[data-dsh-prts] [data-prts-startup-ticks] i[data-major]{height: 9px; background: var(--prts-startup-muted)}html[data-dsh-prts] [data-prts-startup-coordinate]{position: absolute; right: clamp(22px,4vw,68px); top: 50%; writing-mode: vertical-rl; transform: translateY(-50%)}html[data-dsh-prts] [data-prts-startup][data-exit-content] > :not([data-prts-startup-cut]){opacity: 0; transition: opacity 120ms linear}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-grid],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-header],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-telemetry],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-coordinate],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-state],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-outer],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-inner],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-reticle],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-emblem],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-signature],html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-progress]{opacity: 1; clip-path: none; transform: none; animation: none; transition: none}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-outer]{transform: rotate(45deg)}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-frame-inner]{transform: rotate(-45deg)}html[data-dsh-prts] [data-prts-startup][data-reduced-motion]{transition: opacity 160ms ease}html[data-dsh-prts] [data-prts-startup][data-reduced-motion][data-exiting]{opacity: 0}html[data-dsh-prts] [data-prts-startup][data-reduced-motion][data-exiting] > :not([data-prts-startup-cut]){opacity: 1}html[data-dsh-prts] [data-prts-startup][data-reduced-motion]::before,html[data-dsh-prts] [data-prts-startup][data-reduced-motion]::after{transform: none; transition: none}html[data-dsh-prts] [data-prts-startup][data-reduced-motion] [data-prts-startup-cut]{display: none}@keyframes prts-startup-scan{from{transform: translate3d(0,0,0)}to{transform: translate3d(0,660%,0)}}@keyframes prts-startup-cut-left{0%{opacity: 0; transform: skewX(-13deg) translate3d(0,0,0)}18%{opacity: 1}100%{opacity: 0; transform: skewX(-13deg) translate3d(-50vw,0,0)}}@keyframes prts-startup-cut-right{0%{opacity: 0; transform: skewX(-13deg) translate3d(0,0,0)}18%{opacity: .72}100%{opacity: 0; transform: skewX(-13deg) translate3d(50vw,0,0)}}@media (max-width: 640px){html[data-dsh-prts] [data-prts-startup-header]{right: 18px; left: 18px}html[data-dsh-prts] [data-prts-startup-header] small,html[data-dsh-prts] [data-prts-startup-telemetry],html[data-dsh-prts] [data-prts-startup-coordinate]{display: none}html[data-dsh-prts] [data-prts-startup-core]{top: 47%; width: calc(100vw - 32px)}html[data-dsh-prts] [data-prts-startup-frame]{width: min(66vw,240px)}html[data-dsh-prts] [data-prts-startup-signature] > span,html[data-dsh-prts] [data-prts-startup-signature] svg{width: 34px; height: 34px}html[data-dsh-prts] [data-prts-startup-state] strong{max-width: 94vw; font-size: clamp(15px,5vw,22px); letter-spacing: .1em}html[data-dsh-prts] [data-prts-startup-progress]{right: 20px; bottom: max(28px,env(safe-area-inset-bottom)); left: 20px}}@media (prefers-reduced-motion: reduce){html[data-dsh-prts] [data-prts-startup] *,html[data-dsh-prts] [data-prts-startup]::before,html[data-dsh-prts] [data-prts-startup]::after{animation: none !important}}";
    const PRTS_ASSETS = Object.freeze({
      emblem: "<svg id=\"prts-rhodes-emblem\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 510 510\" aria-hidden=\"true\">\n  <title>Rhodes Island</title>\n  <!-- Fan-made vector redraw traced and size-corrected from the classic Rhodes Island emblem. -->\n  <path data-emblem-ink d=\"M 265 71 C 265.589 72.100, 266.295 73, 266.570 73 C 266.845 73, 266.589 72.100, 266 71 C 265.411 69.900, 264.705 69, 264.430 69 C 264.155 69, 264.411 69.900, 265 71 M 243 76 C 242.411 77.100, 242.155 78, 242.430 78 C 242.705 78, 243.411 77.100, 244 76 C 244.589 74.900, 244.845 74, 244.570 74 C 244.295 74, 243.589 74.900, 243 76 M 268 76 C 268.589 77.100, 269.295 78, 269.570 78 C 269.845 78, 269.589 77.100, 269 76 C 268.411 74.900, 267.705 74, 267.430 74 C 267.155 74, 267.411 74.900, 268 76 M 252.585 90.626 C 251.163 93.170, 250 95.645, 250 96.126 C 250 96.607, 252.700 97, 256 97 C 259.602 97, 262 96.572, 262 95.928 C 262 94.348, 256.947 86, 255.990 86 C 255.540 86, 254.008 88.082, 252.585 90.626 M 227 103 C 226.411 104.100, 226.155 105, 226.430 105 C 226.705 105, 227.411 104.100, 228 103 C 228.589 101.900, 228.845 101, 228.570 101 C 228.295 101, 227.589 101.900, 227 103 M 284 103 C 284.589 104.100, 285.295 105, 285.570 105 C 285.845 105, 285.589 104.100, 285 103 C 284.411 101.900, 283.705 101, 283.430 101 C 283.155 101, 283.411 101.900, 284 103 M 220 115 C 219.411 116.100, 219.155 117, 219.430 117 C 219.705 117, 220.411 116.100, 221 115 C 221.589 113.900, 221.845 113, 221.570 113 C 221.295 113, 220.589 113.900, 220 115 M 245.813 113.683 C 246.534 113.972, 247.397 113.936, 247.729 113.604 C 248.061 113.272, 247.471 113.036, 246.417 113.079 C 245.252 113.127, 245.015 113.364, 245.813 113.683 M 291 115 C 291.589 116.100, 292.295 117, 292.570 117 C 292.845 117, 292.589 116.100, 292 115 C 291.411 113.900, 290.705 113, 290.430 113 C 290.155 113, 290.411 113.900, 291 115 M 285.813 143.683 C 286.534 143.972, 287.397 143.936, 287.729 143.604 C 288.061 143.272, 287.471 143.036, 286.417 143.079 C 285.252 143.127, 285.015 143.364, 285.813 143.683 M 224.813 145.683 C 225.534 145.972, 226.397 145.936, 226.729 145.604 C 227.061 145.272, 226.471 145.036, 225.417 145.079 C 224.252 145.127, 224.015 145.364, 224.813 145.683 M 218.813 150.683 C 219.534 150.972, 220.397 150.936, 220.729 150.604 C 221.061 150.272, 220.471 150.036, 219.417 150.079 C 218.252 150.127, 218.015 150.364, 218.813 150.683 M 288.813 152.683 C 289.534 152.972, 290.397 152.936, 290.729 152.604 C 291.061 152.272, 290.471 152.036, 289.417 152.079 C 288.252 152.127, 288.015 152.364, 288.813 152.683 M 218.813 153.683 C 219.534 153.972, 220.397 153.936, 220.729 153.604 C 221.061 153.272, 220.471 153.036, 219.417 153.079 C 218.252 153.127, 218.015 153.364, 218.813 153.683 M 293.813 154.683 C 294.534 154.972, 295.397 154.936, 295.729 154.604 C 296.061 154.272, 295.471 154.036, 294.417 154.079 C 293.252 154.127, 293.015 154.364, 293.813 154.683 M 191 164 C 190.411 165.100, 190.155 166, 190.430 166 C 190.705 166, 191.411 165.100, 192 164 C 192.589 162.900, 192.845 162, 192.570 162 C 192.295 162, 191.589 162.900, 191 164 M 244.979 167.215 C 244.640 171.758, 242.104 192.216, 241.853 192.434 C 241.659 192.602, 238.304 193.044, 234.397 193.416 L 227.295 194.092 226.750 181.482 C 226.451 174.547, 225.952 168.618, 225.641 168.308 C 224.968 167.635, 209.797 169.889, 208.150 170.907 C 206.946 171.652, 206.004 176.004, 203.477 192.500 C 202.635 198, 201.012 208.575, 199.872 216 C 198.731 223.425, 197.568 232.537, 197.286 236.250 L 196.774 243 200.387 243 C 203.522 243, 204 243.314, 204 245.371 C 204 247.479, 204.583 247.817, 209.250 248.419 C 212.137 248.791, 216.188 249.357, 218.250 249.676 C 221.285 250.145, 222 249.945, 222 248.628 C 222 247.548, 222.862 247, 224.559 247 C 226.017 247, 226.851 246.568, 226.498 245.996 C 226.157 245.444, 224.829 245.256, 223.548 245.577 C 222.267 245.899, 220.918 245.676, 220.550 245.081 C 219.856 243.958, 221.562 243.657, 228.235 243.724 C 230.290 243.744, 231.772 243.440, 231.529 243.047 C 231.005 242.199, 230.032 242.282, 247.500 241.672 C 255.200 241.403, 260.600 241.525, 259.501 241.942 C 258.401 242.359, 254.590 242.795, 251.031 242.910 C 247.473 243.026, 241.523 243.759, 237.810 244.540 C 234.097 245.321, 230.297 245.668, 229.366 245.310 C 228.272 244.890, 227.912 245.049, 228.350 245.758 C 228.739 246.386, 228.061 247.148, 226.765 247.540 C 224.150 248.329, 220 252.687, 220 254.643 C 220 256.030, 197.333 347.969, 196.377 350.460 C 195.900 351.703, 191.807 352.905, 179.274 355.485 C 176.645 356.026, 174.648 358.032, 168.486 366.324 C 155.420 383.909, 156.745 382.630, 150.825 383.376 C 140.257 384.708, 119.119 388.548, 118.401 389.266 C 117.997 389.670, 179.054 389.959, 254.083 389.910 C 332.364 389.858, 389.222 389.452, 387.500 388.957 C 384.541 388.106, 364.079 384.326, 356.712 383.270 C 353.216 382.768, 352.155 381.704, 342.914 369.434 L 332.903 356.142 322.983 353.848 L 313.062 351.555 310.975 342.527 C 309.827 337.562, 307.366 327.200, 305.507 319.500 C 303.647 311.800, 300.474 298.300, 298.456 289.500 C 296.437 280.700, 293.709 269.143, 292.393 263.819 C 291.077 258.494, 290 253.242, 290 252.148 C 290 249.990, 291.302 249.559, 301.250 248.425 C 306.408 247.837, 307 247.531, 307 245.451 C 307 243.665, 307.632 243.060, 309.750 242.816 C 312.382 242.514, 312.499 242.264, 312.475 237 C 312.462 233.975, 311.636 225.875, 310.641 219 C 309.646 212.125, 307.710 198.628, 306.338 189.006 C 304.967 179.384, 303.721 171.388, 303.569 171.236 C 302.800 170.467, 285.388 168.391, 284.709 168.988 C 284.273 169.370, 283.641 175.188, 283.302 181.917 C 282.709 193.711, 282.612 194.131, 280.594 193.589 C 279.442 193.280, 275.978 193.021, 272.895 193.014 L 267.290 193 266.395 180.250 L 265.500 167.500 255.250 167.215 C 249.613 167.058, 244.990 167.058, 244.979 167.215 M 336 191 C 336.589 192.100, 337.295 193, 337.570 193 C 337.845 193, 337.589 192.100, 337 191 C 336.411 189.900, 335.705 189, 335.430 189 C 335.155 189, 335.411 189.900, 336 191 M 168 203 C 167.411 204.100, 167.155 205, 167.430 205 C 167.705 205, 168.411 204.100, 169 203 C 169.589 201.900, 169.845 201, 169.570 201 C 169.295 201, 168.589 201.900, 168 203 M 241 201.965 C 238.525 202.259, 237.175 202.742, 238 203.039 C 239.869 203.710, 247.871 202.699, 246.500 201.965 C 245.950 201.670, 243.475 201.670, 241 201.965 M 274 201.378 C 274 201.585, 274.788 202.373, 275.750 203.128 C 277.336 204.371, 277.371 204.336, 276.128 202.750 C 274.821 201.084, 274 200.555, 274 201.378 M 278 201.378 C 278 201.585, 278.788 202.373, 279.750 203.128 C 281.336 204.371, 281.371 204.336, 280.128 202.750 C 278.821 201.084, 278 200.555, 278 201.378 M 343 203 C 343.589 204.100, 344.295 205, 344.570 205 C 344.845 205, 344.589 204.100, 344 203 C 343.411 201.900, 342.705 201, 342.430 201 C 342.155 201, 342.411 201.900, 343 203 M 233.733 203.124 C 234.412 203.808, 235.219 204.115, 235.526 203.807 C 235.834 203.499, 235.279 202.940, 234.293 202.564 C 232.868 202.022, 232.753 202.136, 233.733 203.124 M 270 202.393 C 270 202.609, 270.698 203.054, 271.552 203.382 C 272.442 203.723, 272.843 203.555, 272.493 202.989 C 271.906 202.038, 270 201.583, 270 202.393 M 227.250 203.689 C 228.213 203.941, 229.787 203.941, 230.750 203.689 C 231.713 203.438, 230.925 203.232, 229 203.232 C 227.075 203.232, 226.287 203.438, 227.250 203.689 M 258.250 235.732 C 253.176 236.189, 252.530 238, 257.441 238 C 259.334 238, 261.190 238.498, 261.566 239.107 C 262.048 239.886, 262.486 239.831, 263.049 238.921 C 263.695 237.875, 264.196 237.897, 265.674 239.034 C 266.678 239.807, 266.409 239.216, 265.076 237.720 C 263.742 236.224, 262.617 235.079, 262.576 235.175 C 262.534 235.271, 260.587 235.522, 258.250 235.732 M 340.504 236.373 C 338.696 237.696, 338.710 237.773, 340.888 238.465 C 342.133 238.860, 343.417 238.917, 343.742 238.591 C 344.067 238.266, 343.528 238, 342.544 238 C 341.067 238, 340.972 237.738, 342 236.500 C 343.552 234.629, 342.958 234.579, 340.504 236.373 M 238.335 236.668 C 239.263 237.596, 252.001 237.673, 252 236.750 C 252 236.338, 248.775 236, 244.833 236 C 240.892 236, 237.967 236.301, 238.335 236.668 M 220.815 240.864 C 222.032 241.636, 227 241.250, 227 240.383 C 227 240.173, 225.313 240.007, 223.250 240.015 C 220.860 240.025, 219.977 240.333, 220.815 240.864 M 343.507 241.989 C 343.157 242.555, 343.558 242.723, 344.448 242.382 C 346.180 241.717, 346.497 241, 345.059 241 C 344.541 241, 343.843 241.445, 343.507 241.989 M 168.813 242.683 C 169.534 242.972, 170.397 242.936, 170.729 242.604 C 171.061 242.272, 170.471 242.036, 169.417 242.079 C 168.252 242.127, 168.015 242.364, 168.813 242.683 M 164.083 243.365 C 164.313 243.565, 165.625 244.265, 167 244.920 C 169.357 246.042, 169.389 246.022, 167.559 244.555 C 165.966 243.279, 162.711 242.164, 164.083 243.365 M 163.269 247.693 C 164.242 247.947, 165.592 247.930, 166.269 247.656 C 166.946 247.382, 166.150 247.175, 164.500 247.195 C 162.850 247.215, 162.296 247.439, 163.269 247.693 M 234.269 247.693 C 235.242 247.947, 236.592 247.930, 237.269 247.656 C 237.946 247.382, 237.150 247.175, 235.500 247.195 C 233.850 247.215, 233.296 247.439, 234.269 247.693 M 230 248.703 C 230 249.857, 232.838 252.523, 233.395 251.893 C 233.586 251.677, 232.900 250.634, 231.871 249.575 C 230.842 248.516, 230 248.124, 230 248.703 M 348.441 250.555 C 346.611 252.022, 346.643 252.042, 349 250.920 C 352.061 249.462, 352.628 249, 351.358 249 C 350.821 249, 349.509 249.700, 348.441 250.555 M 372 252 C 372.589 253.100, 373.295 254, 373.570 254 C 373.845 254, 373.589 253.100, 373 252 C 372.411 250.900, 371.705 250, 371.430 250 C 371.155 250, 371.411 250.900, 372 252 M 351.507 254.989 C 351.157 255.555, 351.558 255.723, 352.448 255.382 C 354.180 254.717, 354.497 254, 353.059 254 C 352.541 254, 351.843 254.445, 351.507 254.989 M 156.083 255.356 C 156.313 255.552, 158.075 256.002, 160 256.355 C 162.462 256.807, 163.055 256.706, 162 256.014 C 160.644 255.125, 155.092 254.508, 156.083 255.356 M 352.500 259 C 351.718 260.266, 353.042 260.266, 355 259 C 356.293 258.165, 356.266 258.029, 354.809 258.015 C 353.879 258.007, 352.840 258.450, 352.500 259 M 154.250 262.689 C 155.213 262.941, 156.787 262.941, 157.750 262.689 C 158.713 262.438, 157.925 262.232, 156 262.232 C 154.075 262.232, 153.287 262.438, 154.250 262.689 M 357.441 266.555 C 355.611 268.022, 355.643 268.042, 358 266.920 C 361.061 265.462, 361.628 265, 360.358 265 C 359.821 265, 358.509 265.700, 357.441 266.555 M 149 269.393 C 149 269.609, 149.698 270.054, 150.552 270.382 C 151.442 270.723, 151.843 270.555, 151.493 269.989 C 150.906 269.038, 149 268.583, 149 269.393 M 360.507 269.989 C 360.157 270.555, 360.558 270.723, 361.448 270.382 C 363.180 269.717, 363.497 269, 362.059 269 C 361.541 269, 360.843 269.445, 360.507 269.989 M 362 275 C 361.099 275.582, 360.975 275.975, 361.691 275.985 C 362.346 275.993, 363.160 275.550, 363.500 275 C 364.267 273.758, 363.921 273.758, 362 275 M 143 277.449 C 143 277.724, 144.350 278.647, 146 279.500 C 147.650 280.353, 149 280.826, 149 280.551 C 149 280.276, 147.650 279.353, 146 278.500 C 144.350 277.647, 143 277.174, 143 277.449 M 364.500 279 C 362.870 279.701, 362.812 279.872, 364.191 279.930 C 365.121 279.968, 366.160 279.550, 366.500 279 C 367.211 277.850, 367.176 277.850, 364.500 279 M 141 281.350 C 141 281.581, 142.180 282.543, 143.623 283.489 C 145.066 284.434, 145.941 284.713, 145.567 284.109 C 144.854 282.955, 141 280.626, 141 281.350 M 367 284 C 366.099 284.582, 365.975 284.975, 366.691 284.985 C 367.346 284.993, 368.160 284.550, 368.500 284 C 369.267 282.758, 368.921 282.758, 367 284 M 116 291 C 115.411 292.100, 115.155 293, 115.430 293 C 115.705 293, 116.411 292.100, 117 291 C 117.589 289.900, 117.845 289, 117.570 289 C 117.295 289, 116.589 289.900, 116 291 M 370 290 C 369.099 290.582, 368.975 290.975, 369.691 290.985 C 370.346 290.993, 371.160 290.550, 371.500 290 C 372.267 288.758, 371.921 288.758, 370 290 M 395 291 C 395.589 292.100, 396.295 293, 396.570 293 C 396.845 293, 396.589 292.100, 396 291 C 395.411 289.900, 394.705 289, 394.430 289 C 394.155 289, 394.411 289.900, 395 291 M 139.813 290.683 C 140.534 290.972, 141.397 290.936, 141.729 290.604 C 142.061 290.272, 141.471 290.036, 140.417 290.079 C 139.252 290.127, 139.015 290.364, 139.813 290.683 M 136.500 293 C 137.600 293.473, 139.175 293.859, 140 293.859 C 140.945 293.859, 140.761 293.542, 139.500 293 C 138.400 292.527, 136.825 292.141, 136 292.141 C 135.055 292.141, 135.239 292.458, 136.500 293 M 113 296 C 112.411 297.100, 112.155 298, 112.430 298 C 112.705 298, 113.411 297.100, 114 296 C 114.589 294.900, 114.845 294, 114.570 294 C 114.295 294, 113.589 294.900, 113 296 M 398 296 C 398.589 297.100, 399.295 298, 399.570 298 C 399.845 298, 399.589 297.100, 399 296 C 398.411 294.900, 397.705 294, 397.430 294 C 397.155 294, 397.411 294.900, 398 296 M 135.813 298.683 C 136.534 298.972, 137.397 298.936, 137.729 298.604 C 138.061 298.272, 137.471 298.036, 136.417 298.079 C 135.252 298.127, 135.015 298.364, 135.813 298.683 M 132.083 299.283 C 132.313 299.439, 133.400 300.226, 134.500 301.033 C 136.350 302.390, 136.397 302.369, 135.128 300.750 C 134.373 299.788, 133.285 299, 132.711 299 C 132.137 299, 131.854 299.127, 132.083 299.283 M 377 301 C 376.099 301.582, 375.975 301.975, 376.691 301.985 C 377.346 301.993, 378.160 301.550, 378.500 301 C 379.267 299.758, 378.921 299.758, 377 301 M 128 303.393 C 128 303.609, 128.698 304.054, 129.552 304.382 C 130.442 304.723, 130.843 304.555, 130.493 303.989 C 129.906 303.038, 128 302.583, 128 303.393 M 381.507 303.989 C 381.157 304.555, 381.558 304.723, 382.448 304.382 C 384.180 303.717, 384.497 303, 383.059 303 C 382.541 303, 381.843 303.445, 381.507 303.989 M 103 313 C 102.411 314.100, 102.155 315, 102.430 315 C 102.705 315, 103.411 314.100, 104 313 C 104.589 311.900, 104.845 311, 104.570 311 C 104.295 311, 103.589 311.900, 103 313 M 408 313 C 408.589 314.100, 409.295 315, 409.570 315 C 409.845 315, 409.589 314.100, 409 313 C 408.411 311.900, 407.705 311, 407.430 311 C 407.155 311, 407.411 311.900, 408 313 M 241.702 312.631 C 241.355 312.979, 238.805 313.212, 236.035 313.149 C 231.923 313.057, 230.979 313.354, 230.885 314.768 C 230.821 315.721, 230.686 316.950, 230.585 317.500 C 229.465 323.573, 228.408 326.065, 225.979 328.358 C 224.404 329.844, 222.855 331.882, 222.536 332.887 C 222.217 333.892, 220.953 335.194, 219.728 335.781 C 217.803 336.703, 218.006 336.792, 221.220 336.434 C 223.266 336.206, 225.291 335.962, 225.720 335.892 C 227.910 335.531, 230 336.124, 230 337.107 C 230 337.718, 229.272 337.935, 228.373 337.590 C 227.479 337.246, 226.202 337.417, 225.537 337.969 C 224.872 338.522, 221.775 339.155, 218.655 339.377 C 215.536 339.599, 211.923 340.476, 210.626 341.325 C 208.793 342.526, 207.968 342.606, 206.911 341.685 C 206.164 341.033, 206.329 341.435, 207.277 342.579 C 209.301 345.020, 209.754 348.154, 207.800 346.200 C 205.694 344.094, 204.842 344.915, 206.872 347.093 C 209.099 349.484, 215 350.365, 215 348.307 C 215 347.302, 217.844 347, 227.327 347 L 239.654 347 240.860 340.457 C 241.523 336.859, 241.799 333.484, 241.474 332.957 C 241.148 332.431, 239.334 332, 237.441 332 C 235.178 332, 234 331.526, 234 330.617 C 234 329.856, 233.100 328.998, 232 328.710 C 230.900 328.423, 230 327.643, 230 326.977 C 230 326.259, 230.814 325.979, 232 326.290 C 233.100 326.577, 234 326.389, 234 325.871 C 234 325.325, 234.841 325.380, 236 326 C 237.434 326.767, 238 326.760, 238 325.976 C 238 325.374, 238.450 325.160, 239 325.500 C 239.550 325.840, 240 325.668, 240 325.118 C 240 323.588, 238.223 322.831, 237.776 324.171 C 237.559 324.822, 236.846 325.023, 236.191 324.618 C 234.473 323.556, 234.723 321.956, 236.500 322.638 C 237.325 322.955, 238 322.700, 238 322.072 C 238 321.276, 238.554 321.226, 239.824 321.906 C 241.394 322.746, 241.881 322.231, 243.329 318.191 C 244.253 315.611, 245.008 313.163, 245.005 312.750 C 244.999 311.839, 242.581 311.753, 241.702 312.631 M 388 315.059 C 388 315.641, 388.450 315.840, 389 315.500 C 389.550 315.160, 390 314.684, 390 314.441 C 390 314.198, 389.550 314, 389 314 C 388.450 314, 388 314.477, 388 315.059 M 389.441 318.555 C 387.577 320.049, 387.589 320.067, 389.750 319.020 C 390.988 318.420, 392 317.720, 392 317.465 C 392 316.700, 391.481 316.921, 389.441 318.555 M 119.589 318.856 C 119.298 319.326, 120.172 319.499, 121.530 319.239 C 122.889 318.979, 124 318.594, 124 318.383 C 124 317.610, 120.101 318.027, 119.589 318.856 M 96.500 324 C 95.647 325.650, 95.174 327, 95.449 327 C 95.724 327, 96.647 325.650, 97.500 324 C 98.353 322.350, 98.826 321, 98.551 321 C 98.276 321, 97.353 322.350, 96.500 324 M 414.500 324 C 415.353 325.650, 416.276 327, 416.551 327 C 416.826 327, 416.353 325.650, 415.500 324 C 414.647 322.350, 413.724 321, 413.449 321 C 413.174 321, 413.647 322.350, 414.500 324 M 117.750 323.662 C 118.438 323.940, 119.563 323.940, 120.250 323.662 C 120.938 323.385, 120.375 323.158, 119 323.158 C 117.625 323.158, 117.063 323.385, 117.750 323.662 M 249 326.893 C 249 327.384, 249.739 328.069, 250.641 328.416 C 252.014 328.943, 252.076 328.796, 251.019 327.523 C 249.579 325.788, 249 325.607, 249 326.893 M 289 328.929 C 289 329.518, 288.298 330, 287.441 330 C 286.584 330, 286.174 330.472, 286.530 331.049 C 286.974 331.766, 287.568 331.774, 288.413 331.072 C 289.266 330.365, 290.012 330.412, 290.824 331.224 C 291.471 331.871, 292 332.053, 292 331.629 C 292 331.204, 291.325 330.182, 290.500 329.357 C 289.675 328.532, 289 328.339, 289 328.929 M 90 335 C 89.411 336.100, 89.155 337, 89.430 337 C 89.705 337, 90.411 336.100, 91 335 C 91.589 333.900, 91.845 333, 91.570 333 C 91.295 333, 90.589 333.900, 90 335 M 421 335 C 421.589 336.100, 422.295 337, 422.570 337 C 422.845 337, 422.589 336.100, 422 335 C 421.411 333.900, 420.705 333, 420.430 333 C 420.155 333, 420.411 333.900, 421 335 M 110 334.430 C 110 334.705, 110.900 335.411, 112 336 C 113.100 336.589, 114 336.845, 114 336.570 C 114 336.295, 113.100 335.589, 112 335 C 110.900 334.411, 110 334.155, 110 334.430 M 87 340 C 86.411 341.100, 86.155 342, 86.430 342 C 86.705 342, 87.411 341.100, 88 340 C 88.589 338.900, 88.845 338, 88.570 338 C 88.295 338, 87.589 338.900, 87 340 M 424 340 C 424.589 341.100, 425.295 342, 425.570 342 C 425.845 342, 425.589 341.100, 425 340 C 424.411 338.900, 423.705 338, 423.430 338 C 423.155 338, 423.411 338.900, 424 340 M 430.500 351 C 431.353 352.650, 432.276 354, 432.551 354 C 432.826 354, 432.353 352.650, 431.500 351 C 430.647 349.350, 429.724 348, 429.449 348 C 429.174 348, 429.647 349.350, 430.500 351 M 239.856 349.990 C 238.402 350.419, 232.777 350.807, 227.356 350.851 C 213.724 350.963, 208.330 351.673, 202.378 354.140 C 198.407 355.785, 197.362 356.668, 197.728 358.067 C 198.151 359.686, 193.687 366.973, 191.744 367.835 C 191.328 368.020, 191.245 368.587, 191.559 369.095 C 191.873 369.603, 191.201 371.201, 190.065 372.645 C 188.929 374.088, 188 376.334, 188 377.635 C 188 379.972, 186.479 380.933, 185.833 379.003 C 185.650 378.454, 184.175 379.144, 182.556 380.536 C 180.937 381.927, 179.025 382.840, 178.308 382.565 C 177.590 382.289, 175.989 382.479, 174.751 382.988 C 173.253 383.603, 178.251 383.899, 189.694 383.873 C 201.878 383.846, 207.003 383.494, 207.282 382.667 C 207.567 381.820, 208.131 381.877, 209.337 382.872 C 210.768 384.054, 211 384.019, 211 382.622 C 211 381.730, 211.563 380.993, 212.250 380.985 C 213.118 380.974, 213.061 380.692, 212.064 380.061 C 211.025 379.403, 210.920 378.786, 211.683 377.826 C 212.262 377.097, 213.301 373.439, 213.991 369.698 C 215.274 362.742, 216.852 360.088, 219.821 359.886 C 225.387 359.508, 227.287 358.868, 228.966 356.807 L 230.843 354.500 233.922 357.437 C 235.615 359.052, 237 359.826, 237 359.156 C 237 358.486, 236.325 357.678, 235.500 357.362 C 233.568 356.620, 233.555 355, 235.481 355 C 236.295 355, 237.228 356.062, 237.554 357.360 C 237.977 359.046, 238.768 359.654, 240.323 359.488 C 241.520 359.360, 243.118 359.198, 243.872 359.128 C 244.921 359.030, 244.976 358.676, 244.105 357.627 C 243.478 356.871, 243.234 355.554, 243.562 354.700 C 244.008 353.536, 243.664 353.275, 242.192 353.660 C 241.110 353.943, 239.887 353.627, 239.474 352.957 C 238.990 352.175, 239.217 351.908, 240.111 352.209 C 240.875 352.467, 242.905 352.093, 244.623 351.378 C 247.581 350.148, 249 350.382, 249 352.099 C 249 352.521, 248.100 353.151, 247 353.500 C 244.293 354.359, 244.476 355.470, 247.352 355.635 C 249.290 355.746, 249.717 355.264, 249.784 352.885 C 249.829 351.298, 249.559 349.970, 249.183 349.933 C 248.807 349.895, 247.150 349.718, 245.500 349.537 C 243.850 349.357, 241.310 349.561, 239.856 349.990 M 80 352 C 79.411 353.100, 79.155 354, 79.430 354 C 79.705 354, 80.411 353.100, 81 352 C 81.589 350.900, 81.845 350, 81.570 350 C 81.295 350, 80.589 350.900, 80 352 M 70.500 368 C 69.647 369.650, 69.174 371, 69.449 371 C 69.724 371, 70.647 369.650, 71.500 368 C 72.353 366.350, 72.826 365, 72.551 365 C 72.276 365, 71.353 366.350, 70.500 368 M 440.500 368 C 441.353 369.650, 442.276 371, 442.551 371 C 442.826 371, 442.353 369.650, 441.500 368 C 440.647 366.350, 439.724 365, 439.449 365 C 439.174 365, 439.647 366.350, 440.500 368 M 62.771 381.250 C 60.583 384.623, 58.621 388.640, 59.718 387.500 C 61.120 386.043, 65.245 379, 64.697 379 C 64.440 379, 63.573 380.012, 62.771 381.250 M 450.500 385 C 451.353 386.650, 452.276 388, 452.551 388 C 452.826 388, 452.353 386.650, 451.500 385 C 450.647 383.350, 449.724 382, 449.449 382 C 449.174 382, 449.647 383.350, 450.500 385 M 54 396 C 53.411 397.100, 53.155 398, 53.430 398 C 53.705 398, 54.411 397.100, 55 396 C 55.589 394.900, 55.845 394, 55.570 394 C 55.295 394, 54.589 394.900, 54 396 M 457 396 C 457.589 397.100, 458.295 398, 458.570 398 C 458.845 398, 458.589 397.100, 458 396 C 457.411 394.900, 456.705 394, 456.430 394 C 456.155 394, 456.411 394.900, 457 396 M 289.157 396.997 C 284.674 398.054, 283.600 399.331, 283.600 403.603 C 283.600 406.653, 284.399 407.957, 288.800 412.089 C 294.065 417.033, 295.289 420.311, 292.800 422.800 C 290.577 425.023, 286.069 424.246, 284.781 421.418 C 283.606 418.840, 283.603 418.840, 282.787 421.047 C 281.591 424.280, 283.566 426, 288.476 426 C 293.949 426, 298 422.553, 298 417.897 C 298 415.333, 296.910 413.643, 292.500 409.372 C 286.734 403.787, 285.693 400.770, 288.934 399.035 C 291.715 397.547, 292.670 397.730, 294.961 400.189 L 297 402.377 297 399.689 C 297 398.210, 296.587 397, 296.082 397 C 295.577 397, 294.564 396.822, 293.832 396.604 C 293.099 396.387, 290.996 396.563, 289.157 396.997 M 338.728 396.605 C 338.328 397.006, 337.986 403.221, 337.968 410.417 C 337.930 425.990, 337.502 425.873, 330.911 408.493 C 328.514 402.172, 326.049 397, 325.433 397 C 324.817 397, 322.105 402.962, 319.407 410.250 C 314.653 423.087, 314.404 423.509, 311.415 423.801 C 306.394 424.291, 305.789 422.590, 306.165 409.044 L 306.500 396.997 303.815 396.999 L 301.130 397 301.677 405.750 C 301.977 410.563, 301.794 416.808, 301.270 419.629 L 300.317 424.757 307.832 425.240 C 317.344 425.850, 319 425.419, 319 422.334 C 319 420.996, 319.700 418.546, 320.556 416.891 C 321.862 414.367, 322.623 413.931, 325.277 414.191 C 328.079 414.465, 328.674 415.102, 330.464 419.750 L 332.486 425 338.493 424.921 C 341.797 424.878, 343.938 424.615, 343.250 424.338 C 342.375 423.985, 342 421.030, 342 414.494 L 342 405.156 352.423 415.821 C 358.156 421.687, 363.070 426.263, 363.343 425.990 C 363.617 425.717, 363.989 419.082, 364.170 411.245 L 364.500 396.997 361.820 396.999 C 359.273 397, 359.186 397.161, 360.070 400.243 C 360.581 402.027, 360.979 406.865, 360.952 410.993 L 360.905 418.500 350.181 407.188 C 344.283 400.967, 339.129 396.204, 338.728 396.605 M 120.500 410.900 L 120.500 424.998 123.500 425.001 L 126.500 425.004 126.161 419.002 C 125.704 410.896, 127.123 411.112, 134.368 420.250 C 138.068 424.917, 138.233 425, 143.817 425.002 L 149.500 425.003 149.500 417.752 L 149.500 410.500 156.500 410.500 L 163.500 410.500 163.808 414.210 C 163.977 416.251, 163.676 419.513, 163.139 421.460 L 162.161 425 166.203 425 C 169.623 425, 170.059 424.777, 169.040 423.548 C 168.199 422.535, 167.935 418.305, 168.167 409.547 L 168.500 396.997 165.741 396.999 C 163.019 397, 162.985 397.077, 163.241 402.750 L 163.500 408.500 156.250 408.794 L 149 409.088 149 403.044 C 149 397.118, 148.947 397, 146.250 396.999 L 143.500 396.997 143.829 409.999 C 144.037 418.172, 143.790 423, 143.164 423 C 141.920 423, 134 414.088, 134 412.688 C 134 412.121, 134.670 410.918, 135.488 410.013 C 138.072 407.158, 138.390 402.703, 136.203 400.002 C 134.546 397.955, 133.173 397.519, 127.370 397.190 L 120.500 396.801 120.500 410.900 M 177.841 398.524 C 173.799 400.720, 171 405.994, 171 411.418 C 171 417.617, 173.179 421.540, 177.981 423.990 C 188.943 429.582, 201.010 422.767, 200.982 411 C 200.968 405.329, 199.381 402.173, 195.088 399.280 C 191.091 396.586, 182.132 396.194, 177.841 398.524 M 203.500 410.958 L 203.500 424.916 208.657 425.562 C 216.392 426.530, 221.727 425.277, 225.811 421.534 C 228.969 418.640, 229.399 417.633, 229.791 412.211 C 230.573 401.402, 225.217 397.001, 211.282 396.999 L 203.500 396.999 203.500 410.958 M 232.500 410.884 L 232.500 424.770 237.848 425.323 C 240.790 425.627, 244.165 425.514, 245.348 425.073 C 246.532 424.631, 248.400 424.627, 249.500 425.064 C 253.138 426.511, 257.686 426.035, 260.365 423.927 C 262.417 422.313, 263 420.981, 263 417.905 C 263 414.428, 262.339 413.315, 257.483 408.612 C 252.678 403.958, 252.078 402.960, 252.841 400.884 C 254.017 397.680, 258.429 397.112, 260.193 399.938 C 261.922 402.706, 263 402.538, 263 399.500 C 263 397.182, 262.652 397, 258.223 397 C 251.989 397, 249 399.075, 249 403.403 C 249 406.046, 250.081 407.790, 254.500 412.281 C 260.269 418.143, 260.827 419.486, 258.701 422.395 C 256.870 424.899, 251.803 424.190, 250.513 421.250 C 249.463 418.856, 248 418.225, 248 420.167 C 248 420.808, 247.703 421.036, 247.340 420.673 C 246.977 420.310, 246.033 420.936, 245.243 422.063 C 244.277 423.442, 242.937 424.014, 241.153 423.807 C 238.635 423.516, 238.485 423.181, 238.202 417.250 C 237.910 411.122, 237.955 411, 240.484 411 C 241.902 411, 243.322 411.675, 243.638 412.500 C 244.605 415.018, 246 414.173, 246 411.070 C 246 408.352, 245.801 408.196, 243.250 408.916 C 238.884 410.148, 238 409.306, 238 403.917 C 238 399.161, 238.095 399, 240.893 399 C 242.709 399, 244.052 399.651, 244.500 400.750 C 245.156 402.356, 245.282 402.336, 246.037 400.500 C 247.428 397.118, 247.215 397, 239.750 396.999 L 232.500 396.999 232.500 410.884 M 273.808 410.154 C 274.042 420.168, 273.803 423.509, 272.808 424.140 C 271.991 424.658, 273.046 424.975, 275.613 424.985 L 279.727 425 278.752 419.750 C 278.216 416.863, 278.023 410.563, 278.323 405.750 L 278.870 397 276.185 396.998 L 273.500 396.996 273.808 410.154 M 369.832 408.912 C 370.033 416.150, 369.742 421.614, 369.089 422.834 C 368.077 424.724, 368.401 424.884, 374.610 425.549 C 388.082 426.991, 396 421.606, 396 411 C 396 401.518, 389.941 397.061, 377 397.021 L 369.500 396.997 369.832 408.912 M 127.243 398.850 C 126.651 399.215, 126.041 402.211, 125.886 405.507 C 125.625 411.061, 125.769 411.524, 127.857 411.827 C 131.104 412.298, 133 410.265, 133 406.312 C 133 400.871, 130.085 397.093, 127.243 398.850 M 180.277 399.973 C 177.304 401.785, 176.817 402.736, 175.540 409.225 C 174.858 412.688, 177.272 419.051, 180.203 421.517 C 184.378 425.030, 189.291 424.862, 193.077 421.077 C 195.615 418.539, 196 417.413, 196 412.527 C 196 400.657, 188.706 394.833, 180.277 399.973 M 74 400.059 C 74 400.641, 74.450 400.840, 75 400.500 C 75.550 400.160, 76 399.684, 76 399.441 C 76 399.198, 75.550 399, 75 399 C 74.450 399, 74 399.477, 74 400.059 M 208.750 399.570 C 207.651 400.688, 207.834 418.433, 208.975 421.435 C 209.820 423.658, 210.544 424, 214.399 424 C 225.450 424, 230.011 409.996, 221.549 402.046 C 219.024 399.674, 210.305 397.987, 208.750 399.570 M 374.667 399.667 C 373.442 400.892, 373.917 421.517, 375.200 422.800 C 377.125 424.725, 384.401 424.259, 387.236 422.029 C 392.912 417.564, 392.511 406.017, 386.521 401.448 C 383.423 399.086, 376.316 398.018, 374.667 399.667 M 438.079 401.583 C 438.127 402.748, 438.364 402.985, 438.683 402.188 C 438.972 401.466, 438.936 400.603, 438.604 400.271 C 438.272 399.939, 438.036 400.529, 438.079 401.583 M 84.567 406.433 C 83.705 407.845, 82.315 410.125, 81.477 411.500 L 79.954 414 86.541 414 L 93.128 414 90.848 409.943 C 87.506 403.997, 86.423 403.392, 84.567 406.433 M 421.542 408.338 C 420.144 410.724, 419 412.974, 419 413.338 C 419 413.702, 421.726 414, 425.058 414 L 431.115 414 428.308 409.001 C 426.763 406.252, 425.181 404.002, 424.792 404.001 C 424.403 404, 422.940 405.952, 421.542 408.338 M 323.613 407.407 C 323.280 408.731, 322.733 410.531, 322.397 411.407 C 321.937 412.607, 322.414 413, 324.334 413 C 327.700 413, 328.092 412.123, 326.459 408.240 C 324.830 404.365, 324.407 404.242, 323.613 407.407 M 47 408 C 46.411 409.100, 46.155 410, 46.430 410 C 46.705 410, 47.411 409.100, 48 408 C 48.589 406.900, 48.845 406, 48.570 406 C 48.295 406, 47.589 406.900, 47 408 M 464 408 C 464.589 409.100, 465.295 410, 465.570 410 C 465.845 410, 465.589 409.100, 465 408 C 464.411 406.900, 463.705 406, 463.430 406 C 463.155 406, 463.411 406.900, 464 408 M 445.813 412.683 C 446.534 412.972, 447.397 412.936, 447.729 412.604 C 448.061 412.272, 447.471 412.036, 446.417 412.079 C 445.252 412.127, 445.015 412.364, 445.813 412.683 M 471 420 C 471.589 421.100, 472.295 422, 472.570 422 C 472.845 422, 472.589 421.100, 472 420 C 471.411 418.900, 470.705 418, 470.430 418 C 470.155 418, 470.411 418.900, 471 420 M 57.216 422.184 C 56.547 422.853, 56 423.992, 56 424.716 C 56 425.778, 61.342 425.980, 83.750 425.766 C 110.745 425.507, 111.500 425.446, 111.500 423.500 C 111.500 421.557, 110.745 421.492, 84.966 421.234 C 65.167 421.036, 58.123 421.277, 57.216 422.184 M 399.380 422.452 C 399.074 423.251, 399.114 424.376, 399.470 424.952 C 400.148 426.049, 456 426.525, 456 425.434 C 456 425.123, 455.534 423.998, 454.965 422.934 C 453.981 421.095, 452.600 421, 426.933 421 C 404.255 421, 399.848 421.232, 399.380 422.452 M 34 430 C 33.411 431.100, 33.155 432, 33.430 432 C 33.705 432, 34.411 431.100, 35 430 C 35.589 428.900, 35.845 428, 35.570 428 C 35.295 428, 34.589 428.900, 34 430 M 477 430 C 477.589 431.100, 478.295 432, 478.570 432 C 478.845 432, 478.589 431.100, 478 430 C 477.411 428.900, 476.705 428, 476.430 428 C 476.155 428, 476.411 428.900, 477 430 M 144.750 442.750 C 205.937 442.892, 306.062 442.892, 367.250 442.750 C 428.437 442.608, 378.375 442.491, 256 442.491 C 133.625 442.491, 83.562 442.608, 144.750 442.750\" fill=\"#07090a\" fill-rule=\"evenodd\"/>\n  <path data-emblem-knockout d=\"M 237.383 86.769 C 227.418 103.671, 213.303 127.625, 206.016 140 C 198.728 152.375, 191.761 164.075, 190.532 166 C 189.303 167.925, 184.103 176.700, 178.976 185.500 C 173.848 194.300, 164.855 209.600, 158.991 219.500 C 145.174 242.827, 125.966 275.399, 123.018 280.500 C 121.747 282.700, 114.851 294.400, 107.693 306.500 C 100.536 318.600, 86.593 342.225, 76.709 359 C 66.825 375.775, 52.881 399.400, 45.722 411.500 C 27.127 442.931, 27.633 441.999, 29.165 442.005 C 67.412 442.163, 483.394 441.939, 483.570 441.761 C 483.711 441.617, 482.235 438.800, 480.288 435.500 C 478.341 432.200, 471.467 420.500, 465.012 409.500 C 450.955 385.544, 422.370 337.052, 404 306 C 396.679 293.625, 389.231 280.952, 387.449 277.838 C 385.666 274.724, 379.717 264.599, 374.228 255.338 C 362.449 235.466, 339.219 196.180, 323.472 169.500 C 317.304 159.050, 305.325 138.800, 296.851 124.500 C 288.377 110.200, 275.832 88.950, 268.972 77.279 C 262.112 65.607, 256.275 56.053, 256 56.047 C 255.725 56.042, 247.347 69.866, 237.383 86.769 M 252.585 90.626 C 251.163 93.170, 250 95.645, 250 96.126 C 250 96.607, 252.700 97, 256 97 C 259.602 97, 262 96.572, 262 95.928 C 262 94.348, 256.947 86, 255.990 86 C 255.540 86, 254.008 88.082, 252.585 90.626 M 245.813 113.683 C 246.534 113.972, 247.397 113.936, 247.729 113.604 C 248.061 113.272, 247.471 113.036, 246.417 113.079 C 245.252 113.127, 245.015 113.364, 245.813 113.683 M 285.813 143.683 C 286.534 143.972, 287.397 143.936, 287.729 143.604 C 288.061 143.272, 287.471 143.036, 286.417 143.079 C 285.252 143.127, 285.015 143.364, 285.813 143.683 M 224.813 145.683 C 225.534 145.972, 226.397 145.936, 226.729 145.604 C 227.061 145.272, 226.471 145.036, 225.417 145.079 C 224.252 145.127, 224.015 145.364, 224.813 145.683 M 218.813 150.683 C 219.534 150.972, 220.397 150.936, 220.729 150.604 C 221.061 150.272, 220.471 150.036, 219.417 150.079 C 218.252 150.127, 218.015 150.364, 218.813 150.683 M 288.813 152.683 C 289.534 152.972, 290.397 152.936, 290.729 152.604 C 291.061 152.272, 290.471 152.036, 289.417 152.079 C 288.252 152.127, 288.015 152.364, 288.813 152.683 M 218.813 153.683 C 219.534 153.972, 220.397 153.936, 220.729 153.604 C 221.061 153.272, 220.471 153.036, 219.417 153.079 C 218.252 153.127, 218.015 153.364, 218.813 153.683 M 293.813 154.683 C 294.534 154.972, 295.397 154.936, 295.729 154.604 C 296.061 154.272, 295.471 154.036, 294.417 154.079 C 293.252 154.127, 293.015 154.364, 293.813 154.683 M 244.979 167.215 C 244.640 171.758, 242.104 192.216, 241.853 192.434 C 241.659 192.602, 238.304 193.044, 234.397 193.416 L 227.295 194.092 226.750 181.482 C 226.451 174.547, 225.952 168.618, 225.641 168.308 C 224.968 167.635, 209.797 169.889, 208.150 170.907 C 206.946 171.652, 206.004 176.004, 203.477 192.500 C 202.635 198, 201.012 208.575, 199.872 216 C 198.731 223.425, 197.568 232.537, 197.286 236.250 L 196.774 243 200.387 243 C 203.522 243, 204 243.314, 204 245.371 C 204 247.479, 204.583 247.817, 209.250 248.419 C 212.137 248.791, 216.188 249.357, 218.250 249.676 C 221.285 250.145, 222 249.945, 222 248.628 C 222 247.548, 222.862 247, 224.559 247 C 226.017 247, 226.851 246.568, 226.498 245.996 C 226.157 245.444, 224.829 245.256, 223.548 245.577 C 222.267 245.899, 220.918 245.676, 220.550 245.081 C 219.856 243.958, 221.562 243.657, 228.235 243.724 C 230.290 243.744, 231.772 243.440, 231.529 243.047 C 231.005 242.199, 230.032 242.282, 247.500 241.672 C 255.200 241.403, 260.600 241.525, 259.501 241.942 C 258.401 242.359, 254.590 242.795, 251.031 242.910 C 247.473 243.026, 241.523 243.759, 237.810 244.540 C 234.097 245.321, 230.297 245.668, 229.366 245.310 C 228.272 244.890, 227.912 245.049, 228.350 245.758 C 228.739 246.386, 228.061 247.148, 226.765 247.540 C 224.150 248.329, 220 252.687, 220 254.643 C 220 256.030, 197.333 347.969, 196.377 350.460 C 195.900 351.703, 191.807 352.905, 179.274 355.485 C 176.645 356.026, 174.648 358.032, 168.486 366.324 C 155.420 383.909, 156.745 382.630, 150.825 383.376 C 140.257 384.708, 119.119 388.548, 118.401 389.266 C 117.997 389.670, 179.054 389.959, 254.083 389.910 C 332.364 389.858, 389.222 389.452, 387.500 388.957 C 384.541 388.106, 364.079 384.326, 356.712 383.270 C 353.216 382.768, 352.155 381.704, 342.914 369.434 L 332.903 356.142 322.983 353.848 L 313.062 351.555 310.975 342.527 C 309.827 337.562, 307.366 327.200, 305.507 319.500 C 303.647 311.800, 300.474 298.300, 298.456 289.500 C 296.437 280.700, 293.709 269.143, 292.393 263.819 C 291.077 258.494, 290 253.242, 290 252.148 C 290 249.990, 291.302 249.559, 301.250 248.425 C 306.408 247.837, 307 247.531, 307 245.451 C 307 243.665, 307.632 243.060, 309.750 242.816 C 312.382 242.514, 312.499 242.264, 312.475 237 C 312.462 233.975, 311.636 225.875, 310.641 219 C 309.646 212.125, 307.710 198.628, 306.338 189.006 C 304.967 179.384, 303.721 171.388, 303.569 171.236 C 302.800 170.467, 285.388 168.391, 284.709 168.988 C 284.273 169.370, 283.641 175.188, 283.302 181.917 C 282.709 193.711, 282.612 194.131, 280.594 193.589 C 279.442 193.280, 275.978 193.021, 272.895 193.014 L 267.290 193 266.395 180.250 L 265.500 167.500 255.250 167.215 C 249.613 167.058, 244.990 167.058, 244.979 167.215 M 241 201.965 C 238.525 202.259, 237.175 202.742, 238 203.039 C 239.869 203.710, 247.871 202.699, 246.500 201.965 C 245.950 201.670, 243.475 201.670, 241 201.965 M 274 201.378 C 274 201.585, 274.788 202.373, 275.750 203.128 C 277.336 204.371, 277.371 204.336, 276.128 202.750 C 274.821 201.084, 274 200.555, 274 201.378 M 278 201.378 C 278 201.585, 278.788 202.373, 279.750 203.128 C 281.336 204.371, 281.371 204.336, 280.128 202.750 C 278.821 201.084, 278 200.555, 278 201.378 M 233.733 203.124 C 234.412 203.808, 235.219 204.115, 235.526 203.807 C 235.834 203.499, 235.279 202.940, 234.293 202.564 C 232.868 202.022, 232.753 202.136, 233.733 203.124 M 270 202.393 C 270 202.609, 270.698 203.054, 271.552 203.382 C 272.442 203.723, 272.843 203.555, 272.493 202.989 C 271.906 202.038, 270 201.583, 270 202.393 M 227.250 203.689 C 228.213 203.941, 229.787 203.941, 230.750 203.689 C 231.713 203.438, 230.925 203.232, 229 203.232 C 227.075 203.232, 226.287 203.438, 227.250 203.689 M 258.250 235.732 C 253.176 236.189, 252.530 238, 257.441 238 C 259.334 238, 261.190 238.498, 261.566 239.107 C 262.048 239.886, 262.486 239.831, 263.049 238.921 C 263.695 237.875, 264.196 237.897, 265.674 239.034 C 266.678 239.807, 266.409 239.216, 265.076 237.720 C 263.742 236.224, 262.617 235.079, 262.576 235.175 C 262.534 235.271, 260.587 235.522, 258.250 235.732 M 340.504 236.373 C 338.696 237.696, 338.710 237.773, 340.888 238.465 C 342.133 238.860, 343.417 238.917, 343.742 238.591 C 344.067 238.266, 343.528 238, 342.544 238 C 341.067 238, 340.972 237.738, 342 236.500 C 343.552 234.629, 342.958 234.579, 340.504 236.373 M 238.335 236.668 C 239.263 237.596, 252.001 237.673, 252 236.750 C 252 236.338, 248.775 236, 244.833 236 C 240.892 236, 237.967 236.301, 238.335 236.668 M 220.815 240.864 C 222.032 241.636, 227 241.250, 227 240.383 C 227 240.173, 225.313 240.007, 223.250 240.015 C 220.860 240.025, 219.977 240.333, 220.815 240.864 M 343.507 241.989 C 343.157 242.555, 343.558 242.723, 344.448 242.382 C 346.180 241.717, 346.497 241, 345.059 241 C 344.541 241, 343.843 241.445, 343.507 241.989 M 168.813 242.683 C 169.534 242.972, 170.397 242.936, 170.729 242.604 C 171.061 242.272, 170.471 242.036, 169.417 242.079 C 168.252 242.127, 168.015 242.364, 168.813 242.683 M 164.083 243.365 C 164.313 243.565, 165.625 244.265, 167 244.920 C 169.357 246.042, 169.389 246.022, 167.559 244.555 C 165.966 243.279, 162.711 242.164, 164.083 243.365 M 163.269 247.693 C 164.242 247.947, 165.592 247.930, 166.269 247.656 C 166.946 247.382, 166.150 247.175, 164.500 247.195 C 162.850 247.215, 162.296 247.439, 163.269 247.693 M 234.269 247.693 C 235.242 247.947, 236.592 247.930, 237.269 247.656 C 237.946 247.382, 237.150 247.175, 235.500 247.195 C 233.850 247.215, 233.296 247.439, 234.269 247.693 M 230 248.703 C 230 249.857, 232.838 252.523, 233.395 251.893 C 233.586 251.677, 232.900 250.634, 231.871 249.575 C 230.842 248.516, 230 248.124, 230 248.703 M 348.441 250.555 C 346.611 252.022, 346.643 252.042, 349 250.920 C 352.061 249.462, 352.628 249, 351.358 249 C 350.821 249, 349.509 249.700, 348.441 250.555 M 351.507 254.989 C 351.157 255.555, 351.558 255.723, 352.448 255.382 C 354.180 254.717, 354.497 254, 353.059 254 C 352.541 254, 351.843 254.445, 351.507 254.989 M 156.083 255.356 C 156.313 255.552, 158.075 256.002, 160 256.355 C 162.462 256.807, 163.055 256.706, 162 256.014 C 160.644 255.125, 155.092 254.508, 156.083 255.356 M 352.500 259 C 351.718 260.266, 353.042 260.266, 355 259 C 356.293 258.165, 356.266 258.029, 354.809 258.015 C 353.879 258.007, 352.840 258.450, 352.500 259 M 154.250 262.689 C 155.213 262.941, 156.787 262.941, 157.750 262.689 C 158.713 262.438, 157.925 262.232, 156 262.232 C 154.075 262.232, 153.287 262.438, 154.250 262.689 M 357.441 266.555 C 355.611 268.022, 355.643 268.042, 358 266.920 C 361.061 265.462, 361.628 265, 360.358 265 C 359.821 265, 358.509 265.700, 357.441 266.555 M 149 269.393 C 149 269.609, 149.698 270.054, 150.552 270.382 C 151.442 270.723, 151.843 270.555, 151.493 269.989 C 150.906 269.038, 149 268.583, 149 269.393 M 360.507 269.989 C 360.157 270.555, 360.558 270.723, 361.448 270.382 C 363.180 269.717, 363.497 269, 362.059 269 C 361.541 269, 360.843 269.445, 360.507 269.989 M 362 275 C 361.099 275.582, 360.975 275.975, 361.691 275.985 C 362.346 275.993, 363.160 275.550, 363.500 275 C 364.267 273.758, 363.921 273.758, 362 275 M 143 277.449 C 143 277.724, 144.350 278.647, 146 279.500 C 147.650 280.353, 149 280.826, 149 280.551 C 149 280.276, 147.650 279.353, 146 278.500 C 144.350 277.647, 143 277.174, 143 277.449 M 364.500 279 C 362.870 279.701, 362.812 279.872, 364.191 279.930 C 365.121 279.968, 366.160 279.550, 366.500 279 C 367.211 277.850, 367.176 277.850, 364.500 279 M 141 281.350 C 141 281.581, 142.180 282.543, 143.623 283.489 C 145.066 284.434, 145.941 284.713, 145.567 284.109 C 144.854 282.955, 141 280.626, 141 281.350 M 367 284 C 366.099 284.582, 365.975 284.975, 366.691 284.985 C 367.346 284.993, 368.160 284.550, 368.500 284 C 369.267 282.758, 368.921 282.758, 367 284 M 370 290 C 369.099 290.582, 368.975 290.975, 369.691 290.985 C 370.346 290.993, 371.160 290.550, 371.500 290 C 372.267 288.758, 371.921 288.758, 370 290 M 139.813 290.683 C 140.534 290.972, 141.397 290.936, 141.729 290.604 C 142.061 290.272, 141.471 290.036, 140.417 290.079 C 139.252 290.127, 139.015 290.364, 139.813 290.683 M 136.500 293 C 137.600 293.473, 139.175 293.859, 140 293.859 C 140.945 293.859, 140.761 293.542, 139.500 293 C 138.400 292.527, 136.825 292.141, 136 292.141 C 135.055 292.141, 135.239 292.458, 136.500 293 M 135.813 298.683 C 136.534 298.972, 137.397 298.936, 137.729 298.604 C 138.061 298.272, 137.471 298.036, 136.417 298.079 C 135.252 298.127, 135.015 298.364, 135.813 298.683 M 132.083 299.283 C 132.313 299.439, 133.400 300.226, 134.500 301.033 C 136.350 302.390, 136.397 302.369, 135.128 300.750 C 134.373 299.788, 133.285 299, 132.711 299 C 132.137 299, 131.854 299.127, 132.083 299.283 M 377 301 C 376.099 301.582, 375.975 301.975, 376.691 301.985 C 377.346 301.993, 378.160 301.550, 378.500 301 C 379.267 299.758, 378.921 299.758, 377 301 M 128 303.393 C 128 303.609, 128.698 304.054, 129.552 304.382 C 130.442 304.723, 130.843 304.555, 130.493 303.989 C 129.906 303.038, 128 302.583, 128 303.393 M 381.507 303.989 C 381.157 304.555, 381.558 304.723, 382.448 304.382 C 384.180 303.717, 384.497 303, 383.059 303 C 382.541 303, 381.843 303.445, 381.507 303.989 M 241.702 312.631 C 241.355 312.979, 238.805 313.212, 236.035 313.149 C 231.923 313.057, 230.979 313.354, 230.885 314.768 C 230.821 315.721, 230.686 316.950, 230.585 317.500 C 229.465 323.573, 228.408 326.065, 225.979 328.358 C 224.404 329.844, 222.855 331.882, 222.536 332.887 C 222.217 333.892, 220.953 335.194, 219.728 335.781 C 217.803 336.703, 218.006 336.792, 221.220 336.434 C 223.266 336.206, 225.291 335.962, 225.720 335.892 C 227.910 335.531, 230 336.124, 230 337.107 C 230 337.718, 229.272 337.935, 228.373 337.590 C 227.479 337.246, 226.202 337.417, 225.537 337.969 C 224.872 338.522, 221.775 339.155, 218.655 339.377 C 215.536 339.599, 211.923 340.476, 210.626 341.325 C 208.793 342.526, 207.968 342.606, 206.911 341.685 C 206.164 341.033, 206.329 341.435, 207.277 342.579 C 209.301 345.020, 209.754 348.154, 207.800 346.200 C 205.694 344.094, 204.842 344.915, 206.872 347.093 C 209.099 349.484, 215 350.365, 215 348.307 C 215 347.302, 217.844 347, 227.327 347 L 239.654 347 240.860 340.457 C 241.523 336.859, 241.799 333.484, 241.474 332.957 C 241.148 332.431, 239.334 332, 237.441 332 C 235.178 332, 234 331.526, 234 330.617 C 234 329.856, 233.100 328.998, 232 328.710 C 230.900 328.423, 230 327.643, 230 326.977 C 230 326.259, 230.814 325.979, 232 326.290 C 233.100 326.577, 234 326.389, 234 325.871 C 234 325.325, 234.841 325.380, 236 326 C 237.434 326.767, 238 326.760, 238 325.976 C 238 325.374, 238.450 325.160, 239 325.500 C 239.550 325.840, 240 325.668, 240 325.118 C 240 323.588, 238.223 322.831, 237.776 324.171 C 237.559 324.822, 236.846 325.023, 236.191 324.618 C 234.473 323.556, 234.723 321.956, 236.500 322.638 C 237.325 322.955, 238 322.700, 238 322.072 C 238 321.276, 238.554 321.226, 239.824 321.906 C 241.394 322.746, 241.881 322.231, 243.329 318.191 C 244.253 315.611, 245.008 313.163, 245.005 312.750 C 244.999 311.839, 242.581 311.753, 241.702 312.631 M 388 315.059 C 388 315.641, 388.450 315.840, 389 315.500 C 389.550 315.160, 390 314.684, 390 314.441 C 390 314.198, 389.550 314, 389 314 C 388.450 314, 388 314.477, 388 315.059 M 389.441 318.555 C 387.577 320.049, 387.589 320.067, 389.750 319.020 C 390.988 318.420, 392 317.720, 392 317.465 C 392 316.700, 391.481 316.921, 389.441 318.555 M 119.589 318.856 C 119.298 319.326, 120.172 319.499, 121.530 319.239 C 122.889 318.979, 124 318.594, 124 318.383 C 124 317.610, 120.101 318.027, 119.589 318.856 M 117.750 323.662 C 118.438 323.940, 119.563 323.940, 120.250 323.662 C 120.938 323.385, 120.375 323.158, 119 323.158 C 117.625 323.158, 117.063 323.385, 117.750 323.662 M 249 326.893 C 249 327.384, 249.739 328.069, 250.641 328.416 C 252.014 328.943, 252.076 328.796, 251.019 327.523 C 249.579 325.788, 249 325.607, 249 326.893 M 289 328.929 C 289 329.518, 288.298 330, 287.441 330 C 286.584 330, 286.174 330.472, 286.530 331.049 C 286.974 331.766, 287.568 331.774, 288.413 331.072 C 289.266 330.365, 290.012 330.412, 290.824 331.224 C 291.471 331.871, 292 332.053, 292 331.629 C 292 331.204, 291.325 330.182, 290.500 329.357 C 289.675 328.532, 289 328.339, 289 328.929 M 110 334.430 C 110 334.705, 110.900 335.411, 112 336 C 113.100 336.589, 114 336.845, 114 336.570 C 114 336.295, 113.100 335.589, 112 335 C 110.900 334.411, 110 334.155, 110 334.430 M 239.856 349.990 C 238.402 350.419, 232.777 350.807, 227.356 350.851 C 213.724 350.963, 208.330 351.673, 202.378 354.140 C 198.407 355.785, 197.362 356.668, 197.728 358.067 C 198.151 359.686, 193.687 366.973, 191.744 367.835 C 191.328 368.020, 191.245 368.587, 191.559 369.095 C 191.873 369.603, 191.201 371.201, 190.065 372.645 C 188.929 374.088, 188 376.334, 188 377.635 C 188 379.972, 186.479 380.933, 185.833 379.003 C 185.650 378.454, 184.175 379.144, 182.556 380.536 C 180.937 381.927, 179.025 382.840, 178.308 382.565 C 177.590 382.289, 175.989 382.479, 174.751 382.988 C 173.253 383.603, 178.251 383.899, 189.694 383.873 C 201.878 383.846, 207.003 383.494, 207.282 382.667 C 207.567 381.820, 208.131 381.877, 209.337 382.872 C 210.768 384.054, 211 384.019, 211 382.622 C 211 381.730, 211.563 380.993, 212.250 380.985 C 213.118 380.974, 213.061 380.692, 212.064 380.061 C 211.025 379.403, 210.920 378.786, 211.683 377.826 C 212.262 377.097, 213.301 373.439, 213.991 369.698 C 215.274 362.742, 216.852 360.088, 219.821 359.886 C 225.387 359.508, 227.287 358.868, 228.966 356.807 L 230.843 354.500 233.922 357.437 C 235.615 359.052, 237 359.826, 237 359.156 C 237 358.486, 236.325 357.678, 235.500 357.362 C 233.568 356.620, 233.555 355, 235.481 355 C 236.295 355, 237.228 356.062, 237.554 357.360 C 237.977 359.046, 238.768 359.654, 240.323 359.488 C 241.520 359.360, 243.118 359.198, 243.872 359.128 C 244.921 359.030, 244.976 358.676, 244.105 357.627 C 243.478 356.871, 243.234 355.554, 243.562 354.700 C 244.008 353.536, 243.664 353.275, 242.192 353.660 C 241.110 353.943, 239.887 353.627, 239.474 352.957 C 238.990 352.175, 239.217 351.908, 240.111 352.209 C 240.875 352.467, 242.905 352.093, 244.623 351.378 C 247.581 350.148, 249 350.382, 249 352.099 C 249 352.521, 248.100 353.151, 247 353.500 C 244.293 354.359, 244.476 355.470, 247.352 355.635 C 249.290 355.746, 249.717 355.264, 249.784 352.885 C 249.829 351.298, 249.559 349.970, 249.183 349.933 C 248.807 349.895, 247.150 349.718, 245.500 349.537 C 243.850 349.357, 241.310 349.561, 239.856 349.990 M 289.157 396.997 C 284.674 398.054, 283.600 399.331, 283.600 403.603 C 283.600 406.653, 284.399 407.957, 288.800 412.089 C 294.065 417.033, 295.289 420.311, 292.800 422.800 C 290.577 425.023, 286.069 424.246, 284.781 421.418 C 283.606 418.840, 283.603 418.840, 282.787 421.047 C 281.591 424.280, 283.566 426, 288.476 426 C 293.949 426, 298 422.553, 298 417.897 C 298 415.333, 296.910 413.643, 292.500 409.372 C 286.734 403.787, 285.693 400.770, 288.934 399.035 C 291.715 397.547, 292.670 397.730, 294.961 400.189 L 297 402.377 297 399.689 C 297 398.210, 296.587 397, 296.082 397 C 295.577 397, 294.564 396.822, 293.832 396.604 C 293.099 396.387, 290.996 396.563, 289.157 396.997 M 338.728 396.605 C 338.328 397.006, 337.986 403.221, 337.968 410.417 C 337.930 425.990, 337.502 425.873, 330.911 408.493 C 328.514 402.172, 326.049 397, 325.433 397 C 324.817 397, 322.105 402.962, 319.407 410.250 C 314.653 423.087, 314.404 423.509, 311.415 423.801 C 306.394 424.291, 305.789 422.590, 306.165 409.044 L 306.500 396.997 303.815 396.999 L 301.130 397 301.677 405.750 C 301.977 410.563, 301.794 416.808, 301.270 419.629 L 300.317 424.757 307.832 425.240 C 317.344 425.850, 319 425.419, 319 422.334 C 319 420.996, 319.700 418.546, 320.556 416.891 C 321.862 414.367, 322.623 413.931, 325.277 414.191 C 328.079 414.465, 328.674 415.102, 330.464 419.750 L 332.486 425 338.493 424.921 C 341.797 424.878, 343.938 424.615, 343.250 424.338 C 342.375 423.985, 342 421.030, 342 414.494 L 342 405.156 352.423 415.821 C 358.156 421.687, 363.070 426.263, 363.343 425.990 C 363.617 425.717, 363.989 419.082, 364.170 411.245 L 364.500 396.997 361.820 396.999 C 359.273 397, 359.186 397.161, 360.070 400.243 C 360.581 402.027, 360.979 406.865, 360.952 410.993 L 360.905 418.500 350.181 407.188 C 344.283 400.967, 339.129 396.204, 338.728 396.605 M 120.500 410.900 L 120.500 424.998 123.500 425.001 L 126.500 425.004 126.161 419.002 C 125.704 410.896, 127.123 411.112, 134.368 420.250 C 138.068 424.917, 138.233 425, 143.817 425.002 L 149.500 425.003 149.500 417.752 L 149.500 410.500 156.500 410.500 L 163.500 410.500 163.808 414.210 C 163.977 416.251, 163.676 419.513, 163.139 421.460 L 162.161 425 166.203 425 C 169.623 425, 170.059 424.777, 169.040 423.548 C 168.199 422.535, 167.935 418.305, 168.167 409.547 L 168.500 396.997 165.741 396.999 C 163.019 397, 162.985 397.077, 163.241 402.750 L 163.500 408.500 156.250 408.794 L 149 409.088 149 403.044 C 149 397.118, 148.947 397, 146.250 396.999 L 143.500 396.997 143.829 409.999 C 144.037 418.172, 143.790 423, 143.164 423 C 141.920 423, 134 414.088, 134 412.688 C 134 412.121, 134.670 410.918, 135.488 410.013 C 138.072 407.158, 138.390 402.703, 136.203 400.002 C 134.546 397.955, 133.173 397.519, 127.370 397.190 L 120.500 396.801 120.500 410.900 M 177.841 398.524 C 173.799 400.720, 171 405.994, 171 411.418 C 171 417.617, 173.179 421.540, 177.981 423.990 C 188.943 429.582, 201.010 422.767, 200.982 411 C 200.968 405.329, 199.381 402.173, 195.088 399.280 C 191.091 396.586, 182.132 396.194, 177.841 398.524 M 203.500 410.958 L 203.500 424.916 208.657 425.562 C 216.392 426.530, 221.727 425.277, 225.811 421.534 C 228.969 418.640, 229.399 417.633, 229.791 412.211 C 230.573 401.402, 225.217 397.001, 211.282 396.999 L 203.500 396.999 203.500 410.958 M 232.500 410.884 L 232.500 424.770 237.848 425.323 C 240.790 425.627, 244.165 425.514, 245.348 425.073 C 246.532 424.631, 248.400 424.627, 249.500 425.064 C 253.138 426.511, 257.686 426.035, 260.365 423.927 C 262.417 422.313, 263 420.981, 263 417.905 C 263 414.428, 262.339 413.315, 257.483 408.612 C 252.678 403.958, 252.078 402.960, 252.841 400.884 C 254.017 397.680, 258.429 397.112, 260.193 399.938 C 261.922 402.706, 263 402.538, 263 399.500 C 263 397.182, 262.652 397, 258.223 397 C 251.989 397, 249 399.075, 249 403.403 C 249 406.046, 250.081 407.790, 254.500 412.281 C 260.269 418.143, 260.827 419.486, 258.701 422.395 C 256.870 424.899, 251.803 424.190, 250.513 421.250 C 249.463 418.856, 248 418.225, 248 420.167 C 248 420.808, 247.703 421.036, 247.340 420.673 C 246.977 420.310, 246.033 420.936, 245.243 422.063 C 244.277 423.442, 242.937 424.014, 241.153 423.807 C 238.635 423.516, 238.485 423.181, 238.202 417.250 C 237.910 411.122, 237.955 411, 240.484 411 C 241.902 411, 243.322 411.675, 243.638 412.500 C 244.605 415.018, 246 414.173, 246 411.070 C 246 408.352, 245.801 408.196, 243.250 408.916 C 238.884 410.148, 238 409.306, 238 403.917 C 238 399.161, 238.095 399, 240.893 399 C 242.709 399, 244.052 399.651, 244.500 400.750 C 245.156 402.356, 245.282 402.336, 246.037 400.500 C 247.428 397.118, 247.215 397, 239.750 396.999 L 232.500 396.999 232.500 410.884 M 273.808 410.154 C 274.042 420.168, 273.803 423.509, 272.808 424.140 C 271.991 424.658, 273.046 424.975, 275.613 424.985 L 279.727 425 278.752 419.750 C 278.216 416.863, 278.023 410.563, 278.323 405.750 L 278.870 397 276.185 396.998 L 273.500 396.996 273.808 410.154 M 369.832 408.912 C 370.033 416.150, 369.742 421.614, 369.089 422.834 C 368.077 424.724, 368.401 424.884, 374.610 425.549 C 388.082 426.991, 396 421.606, 396 411 C 396 401.518, 389.941 397.061, 377 397.021 L 369.500 396.997 369.832 408.912 M 127.243 398.850 C 126.651 399.215, 126.041 402.211, 125.886 405.507 C 125.625 411.061, 125.769 411.524, 127.857 411.827 C 131.104 412.298, 133 410.265, 133 406.312 C 133 400.871, 130.085 397.093, 127.243 398.850 M 180.277 399.973 C 177.304 401.785, 176.817 402.736, 175.540 409.225 C 174.858 412.688, 177.272 419.051, 180.203 421.517 C 184.378 425.030, 189.291 424.862, 193.077 421.077 C 195.615 418.539, 196 417.413, 196 412.527 C 196 400.657, 188.706 394.833, 180.277 399.973 M 74 400.059 C 74 400.641, 74.450 400.840, 75 400.500 C 75.550 400.160, 76 399.684, 76 399.441 C 76 399.198, 75.550 399, 75 399 C 74.450 399, 74 399.477, 74 400.059 M 208.750 399.570 C 207.651 400.688, 207.834 418.433, 208.975 421.435 C 209.820 423.658, 210.544 424, 214.399 424 C 225.450 424, 230.011 409.996, 221.549 402.046 C 219.024 399.674, 210.305 397.987, 208.750 399.570 M 374.667 399.667 C 373.442 400.892, 373.917 421.517, 375.200 422.800 C 377.125 424.725, 384.401 424.259, 387.236 422.029 C 392.912 417.564, 392.511 406.017, 386.521 401.448 C 383.423 399.086, 376.316 398.018, 374.667 399.667 M 438.079 401.583 C 438.127 402.748, 438.364 402.985, 438.683 402.188 C 438.972 401.466, 438.936 400.603, 438.604 400.271 C 438.272 399.939, 438.036 400.529, 438.079 401.583 M 84.567 406.433 C 83.705 407.845, 82.315 410.125, 81.477 411.500 L 79.954 414 86.541 414 L 93.128 414 90.848 409.943 C 87.506 403.997, 86.423 403.392, 84.567 406.433 M 421.542 408.338 C 420.144 410.724, 419 412.974, 419 413.338 C 419 413.702, 421.726 414, 425.058 414 L 431.115 414 428.308 409.001 C 426.763 406.252, 425.181 404.002, 424.792 404.001 C 424.403 404, 422.940 405.952, 421.542 408.338 M 323.613 407.407 C 323.280 408.731, 322.733 410.531, 322.397 411.407 C 321.937 412.607, 322.414 413, 324.334 413 C 327.700 413, 328.092 412.123, 326.459 408.240 C 324.830 404.365, 324.407 404.242, 323.613 407.407 M 445.813 412.683 C 446.534 412.972, 447.397 412.936, 447.729 412.604 C 448.061 412.272, 447.471 412.036, 446.417 412.079 C 445.252 412.127, 445.015 412.364, 445.813 412.683 M 57.216 422.184 C 56.547 422.853, 56 423.992, 56 424.716 C 56 425.778, 61.342 425.980, 83.750 425.766 C 110.745 425.507, 111.500 425.446, 111.500 423.500 C 111.500 421.557, 110.745 421.492, 84.966 421.234 C 65.167 421.036, 58.123 421.277, 57.216 422.184 M 399.380 422.452 C 399.074 423.251, 399.114 424.376, 399.470 424.952 C 400.148 426.049, 456 426.525, 456 425.434 C 456 425.123, 455.534 423.998, 454.965 422.934 C 453.981 421.095, 452.600 421, 426.933 421 C 404.255 421, 399.848 421.232, 399.380 422.452\" fill=\"currentColor\" fill-rule=\"evenodd\"/>\n</svg>\n",
      prtsEmblem: "data:image/png;base64,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",
      emblems: [{"key":"rhodes-island","label":"罗德岛"},{"key":"lungmen","label":"龙门"},{"key":"penguin-logistics","label":"企鹅物流"},{"key":"rhine-lab","label":"莱茵生命"},{"key":"reunion","label":"整合运动"}],
      emblemMasks: [{"key":"rhodes-island","width":320,"height":320,"alpha":"AJpqBAECAQS0AgMBBAEDuAIEugIItwIKtgIKtgIKtgIKtQIMswIOsQIQsAIQrwISrgISrQIUqwIWqgIWqgIWqAIapgIapQIcpAIcpAINAg2jAh6hAiCfAiKeAiKeAiKdAiSbAiaZAiiYAiiYAiiXAiqVAiyUAiyTAi6SAi6RAjCPAjKOAjKNAjSMAjSLAjaJAjiIAjiHAjqGAjqFAjyDAj6CAj6CAj6BAkD/AUL9AUT8AUT8AUT7AUb5AUj3AUr2AUr2AUr1AUzzAU7xAVDwAVDwAVDvAVLtAVTrAVbqASgGKOoBEAcOCg8HEekBEQcOCg8IEecBEQgOCg8IEuYBEAkOCg8IEuUBEQkOCg8IE+QBEQkOCg4KEuQBEQkOCg4KEuIBEwkOCg4KFOABEgsNCg4LE98BEwsNCw0LFN4BEwsNCw0LFN0BFAsNCwwMFdsBFQsMDAwMFtoBFQsMDQsMFtkBFg0HEgcOF9gBFjwW1wEXEgUNBRMX1QEYDA4GDg4Y1AEYCw8GDw0Y0wEYDQwLCg8Z0gEYDQEZAhQZ0QEZPRrPARk+G84BGT4bzgEZPhvNARo+HMwBGj4cygEcPx3IARw/HcgBHEAcxwEdQB3FAR1BHsQBHUEewwEeQR/CAR5BH8IBHkEfwAEgQSG+ASAYDhshvQEhFhAbIrwBIQsDBxYWIrwBIAoIAxsTIbsBIggKARwCBgojuQElByQSJrcBJwcaGye2ASgGGRsotgFGFDC0AT8cM7IBPhw0sQE/HDWwAT4cNrABNQYCHTauATYnN6wBNSg3qwE2KTeqATYpN6oBNio2qQE3KjenATgqOKYBOCo4pQE4KzmkATgrOaMBOCw6oQE5LDugATktOp8BOS47ngE5LjudATovO5sBOy88mgE7MDuZATwwPJgBPDA8lwE8MT2VAT0xPpQBPDI+kwE9Mj+SAT0yP5EBPTQ/jwE+NECOAT41P44BPjU/jQE/NUCLAUA2QIkBQTZBiAFBEQIjQYgBQBEFIUGHAUANCiFChQFBDAshQ4MBQgwLIUSCAUIMCyFEggFCDAsiQ4EBQg0LI0N/QwwMI0R9RAsVG0V8RAsWGkV8RAoXDQYHRXtEChgMCgVFeUUJFg8LBEZ3RQkRFQkGR3ZFCBIkR3ZFBhMlR3VGAxYlSHNHAhcmSHJHARgmSHFIARgnSHBHAhgnSG9IAhgnSW1mJEpsaCJKa2kjSmppI0ppayRJZ2snSGZqKkZmPgkhMz9lPgkYAQg1P2M+CRcFBDdAYT4JE0VBYD4JEkdAYD0JE0g/Xz0KEko/XT4KEkpAWz4KE0tAWj0LE00+WjwLFE0+WT0KFU0/Vz0LFU4/VT4KFk8/VDwGHk4+VDsHH049UzsMGFE+UTWDAThP8gFO8gFO8gFN9AFL9gFK9gFJ+AFI+AFI+AFG/AFE/AFD/gFC/gFC5AEBGUEZAsoBARo/ggI9hAI8hAI8hAI6iAIyAQWIAjICA4oCMQIDigIxAgOKAjECAY4CLwIBjgIvkgIuAQGQAi4BAZACLpQCLJQCLJQCLJQCLJQClmk=","encoding":"binary-rle-v1","opticalScale":0.86,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.135,"offsetY":1.485},"light":{"pitch":4.8,"offsetX":2.52,"offsetY":3.7199999999999998},"standard":{"pitch":4.2,"offsetX":1.9949999999999999,"offsetY":0.10500000000000001},"dense":{"pitch":3.7,"offsetX":3.2375,"offsetY":3.6075000000000004},"ultra":{"pitch":3.25,"offsetX":1.86875,"offsetY":1.05625}}},{"key":"lungmen","width":320,"height":320,"alpha":"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","encoding":"binary-rle-v1","opticalScale":0.84,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.9450000000000001,"offsetY":2.835},"light":{"pitch":4.8,"offsetX":3,"offsetY":0.8400000000000001},"standard":{"pitch":4.2,"offsetX":1.9949999999999999,"offsetY":4.095000000000001},"dense":{"pitch":3.7,"offsetX":2.8675,"offsetY":2.1275000000000004},"ultra":{"pitch":3.25,"offsetX":3.00625,"offsetY":1.86875}}},{"key":"penguin-logistics","width":320,"height":320,"alpha":"AM4zE60CBAEOsQILsgIQsAIRrgISrAIWqgIXqAIYqAIapQIcowILBwuiAgsIDKECCwkLoQIJDQmhAgkNCekBIhYJDQnoASQVCQ0J6AElFAkNCdwBOgsJDQncAToLCQ0J2wE8CgkNCdQBRQYMCgrUAUYFDggK1AFIBA8HCdEBTAQe0QFNBB7QAU4EHs4BUAQezQFRBB3NASIeEgQazAEkIREEGcwBJCMPBRjMASMoDAUWzgEcOAIFFswBHj4YzAEdPxbOARhEEs0BHEURBgbBARxGEAYIwAEYSgsLCL0BGyYEIAsJDLsBGiQKHQoJDrkBFigMHAYNDrcBFxwjEgUMEbYBFxslEgQLE7QBFh0mIBSyARYZLxwUsQEXGDEbFa8BFRsxHROvARMbOBkTrgESGzoYFK0BEB06GhOqAREdPBoSqQESG0AZE6cBEBxCGROmAQ8dQhoSpAERG0YSBAITogERG0gRBQIToQEQHEgRBQQRnwERG0oRBQQSnQESGksRBgQRnQESGksRBwUPnQERG00PCgIRmwERG04PCgESmgEPHU4RCAESmAEQHFARG5cBERtREhqXAQ8dURQYlwEOHlEUGpUBDh5TEB2UAQ4eVA4ekwEPHlQNH5EBER5UCyGQARAgVAshkAEPISUHKAojjwEPISQIKAUojwEPICQJKAUqiAEBBA8gIwooBCuIAQIDDw8DDiMKKAUqiAECAw4PBQ0kCSgGKocBAgMMEQUNJQgoChYBD4cBAgEOEQcMJQYpChYBD4cBERIHCyUFKgsVAQ+HAREUBQslBCsRDwEPhwEREgcLVBEfhwEREQgLVBEfhwERDAIDCAtUEQYDFocBEQsQCVQRBQUVhwERCxEIVBIEBReFARAMEQhUHRWFARALEghUHhWEAQ8MEghUHgUBD4QBAQEMDRIIVCABAw+EAQEBDA0SCFQkD4UBDQ0SCFQkD4QBDg0SCFQkD4QBDg0SCFQkD4QBDg0SCFQVBAsPhAEODREJVBQFCw+EAQ4NDwtUFAYKD4QBDg0PC1QCCgMMCQ+EAQ4NDwtUAQwBDggPhAEODRAKVAEMAQ4ID4QBDgwVBlQBDAEOCA+EAQ8KFwZTAQwBDwcPhAEQCRgHUQEMAQUBCQcPhAEQCBoHUAEcBw+EARAIGwhOARwHD4QBEAgcCksBHAcPhAESBhwDBARKARwHD4QBFAUbAQgCSgEbCA+EARQGGgEIBkYBGwgPhAEVBgUCEgEJCEMBGwgPhAEXBQQCEgEOBEIBGgkPhAEXCxIBDgZAARkKD4QBGAoSAQ8rGgEZCg+EARoIEgEYIxkBGQoPhAEOAQsIEgEaIhgBGQoPhAEOAQwHEgEbKw4BGQoPhAEOAQ4FEgFDAw4BGQoPhAEOAQ4FEgFEBAwBGQoPhAEOAQ8EEgFECAgBGQoPhAEOAQ8EEgFJAwgBGQoPhAEOAQ8EEQJKAwcBGQoPhAEOAQ8EDAdLBAUBGQoPhAEOAg8ECghNAgUBGAsPhAEOAhAECQhTAhgLD4QBDgcMFFEEDxQPhAEOBwwUUQQQEw+FAQ0ICxRRBBIRD4QBAQEMCQoUUQQSEQ+EAQEBDAoJFFIDEhEPhAEOCwoSVAESAQULD4QBDwsJElQBGAsPhAEQCwkRVAEZCg+EAREKCRFUARkKD4QBEQoJEVQBGQoPhAERCgkRVAEZCRCEAREKCwYHAlQBGQcShAERCgwFCAFUARkHEoQBEQoMBAkBVAEZBxGFAREKDAUIAVQBGAgRhQERCgwFCAFUARgIEIYBAgEOCg0GBgFUAQwBBQ4PhwECAQ8JDwUFAVQBDAEFDg+HAQICDwkOBQQCVAELAwQOD4cBAgMPCgwLVAEJFw+MAQ8LDApUAQkWEIwBDwsOCFQBCRQRjQEPDQwIVAEJFBGNAQ8PCwdUAQkUEI8BDhELBVQBCBUPkQENEgoFVAEHFg+SAQwYBAVUAQUXD5MBDxUEBVQCBBURkwEPFgIGVAIDFhGUAQ4fUxsRlAEOH1MbEZQBDiFQHBCVAQ4hTh4OmAEPGgIDThwQmQEPFgYCThsRmgEOFQgBThoSmgEQEQoBThkTmgERDgwBThgTnQEQDQwCTRcSoAEPCV8GAQkBBhKgAQ8HYQUEBQUEEqABDwcVAUkGBgMGBBCiAREFFQFIBw8DEKMBEQVeARUCEaUBEAZbAhUBEqYBDwoSAUIEFQESpgERCVQBK6cBEQlSAimrAQ8KEgE8BBIEEqwBEQhOAhQDFK0BEQdOAhQCFK8BEAcVAzMFDggSsgEUAxQERQMWswEVAhIHRAIXtAEUISgBEgUVtwEVDgUHQAMWuQEVCwgFQQIXuwEUCgkDDQQUBRUEFr4BFwZkwAEXBUgBG8IBFgcfBxwEGcUBFQocBxkGGcYBHQIbBRwBHsgBHAMYBhoDHMsBGwgSBhUIGc8BIgERCDXQATIJEQIh1gEeGQQOH9kBLgcx2gFl4AFb5QFb5gFa7AFO8gFO8wFM+QE/ggI9hAI8iAI2kQImmwIkngIgqSKQAa8BkgGtAZQBrAGUAawBlAGsAZQBrAEJBw8EDwEFAQ8HDwEFAQ8BDwEFAQmsAQkBBAIPARIBBQEPBw8BBQEPAQ8BBQEJrAEJAQUBDwESAQUBDwcPAQUBDwEPAQUBCawBCQEFAQ8BEgEFAQ8HDwEFAQ8BDwEFAQmXAQ0ICQEFAQ8BEgEFAQ8CFAEFAQ8BDwEFAQkIDYIBDgcJAQUBDwESAgMCDwEVAQUBDwEPAgMCCQcOggEOBwkBBQEPARIHDwEVAQUBDwEPBwkHDoIBDgcJAQUBDwESBw8BFQEFAQ8BDwcJBw6CAQ4HCQIDAg8CEQcPAhQBBQEPAQ8HCQcOggEOBwkHDwQPBw8HDwEFAQ8BDwcJBw6CAQ4HCQIUAhEHDwIDAg8BBQEPAQ8HCQcOggENCAkBFQESBw8BBQEPAQUBDwEPBwkIDZcBCQEVARIHDwEFAQ8BBQEPAQ8HCawBCQEVARIDAQMPAQUBDwEFAQ8BDwMCAgmsAQkBFQESAQUBDwEFAQ8BBQEPAQ8BBQEJrAEJARUBEgEFAQ8BBQEPAQUBDwEPAQUBCawBCQEVARIBBQEPAQUBDwEFAQ8BDwEFAQmsAQkBFQESAQUBDwEFAQ8CBAEPAQ8BBQEJrAEJARUDEAEFAQ8DAQMPAwEDDwEPAQUBCawBHwQVAQ8HDwcfAQ+sAZQBrAGUAawBlAGsAZQBrQGSAcULAg4FCgYEAgcGBAkDAwQJBwXbAQQMBwgIAgQFCAILAQUCCwUH2QEGCggICAEGBAgBDAEFAQwECdgBBgkLBQkBBgMJAgsBBQEMAwrYAQYHDgILAQYBCwIKAgUBDAEL2QEGBwYDBgEGBgYBBgkGBAUBDAEG3gEGBwUEBgEFBwYBBgoFBAUBBgEFAQbeAQYHBQQGAQUHBgEICAUEBQEGAQUCB9wBBgcFBAYBBQcGAwYIBQQFAQYDAQUG3AEGBwUEBgEFBwYEBgcFBAUBBgoG2wEGBwUEBgEFAgQBBgQIBQUEBQEGCwfZAQYHBQQGAQUBBQEGBQcFBQQFAQYMB9gBBgcFBAYBBQEFAQYHBQUFBAUBBg0G2AEGBwUEBgEFAQUBBgIDAgUFBQQFAQYCAwMEAQbYAQYHBQQGAQUBBQEGAQUBBQUFBAUBBgEFAQUBBtgBBgcFBAYBBQEFAQYBBQEFBQUEBQEGAQUBBQEG2AELAg8BCwEGAQsFBQQFAQwBC9kBDAINAwoBBgIJBgUEBQEMAgrZAQwECQcIAQYEBQgFBAUBDAQG2wEMBAkHCAEGBAUIBQQFAQwEBtsBDAQJBwgBBgQFCAUEBQEMBAbvMg==","encoding":"binary-rle-v1","opticalScale":0.87,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.135,"offsetY":0.675},"light":{"pitch":4.8,"offsetX":2.76,"offsetY":0.8400000000000001},"standard":{"pitch":4.2,"offsetX":2.415,"offsetY":0.9450000000000001},"dense":{"pitch":3.7,"offsetX":0.4625,"offsetY":3.0525},"ultra":{"pitch":3.25,"offsetX":2.03125,"offsetY":3.00625}}},{"key":"rhine-lab","width":320,"height":320,"alpha":"AIXGAR92H4sBIHUhigEhdCKBATFkMXkyYzJ5M2I0cj1YPW0+Vz9sP1VBZkhPRmJKTkdhS0xIX09ITFxRRk5bUUZPWFVCVFRXQFZTV0BXUFs8Wk5dOlxNXTpdSmE4XUljN11JYzdeRmc1YENpNGBDKhQrNCQTKUErFS0yIxQrPiwXLDEiFis9JiInMR0gJj0mIygvHCEmPSUkKS8aIyc7ICwmMRUrIjkiLCgvFCwjNyIvJy8TLSI3IDInMA8xIDcgMygYARUOMiA3HzYoEwUVDTMgNh06JxEHVh8vAgIfOycND1EgLgIBHzwoChJRHy4CAR1AJwgTUx0uAgEdHgUeKAQXUR0uAgEdHQcdKQIZUB0uAgEdHAgfJwEaUB0uAgEdGwseQVEcLgIBHBsNHUFSHC0CARocDh8/UxwsAgEaHA4gPlMdKx0cDiA+Ux0rAQEbHA4iPFMdLBwcDiM7Ux0rHRwOIztUHCsdHA4lOVYaKx0cDiY4VhsqHB0OJjhWHSgaHw4oNlYdKBoVIx41ISAVHSgaFCUdNSAiFB0oGhMmHzEiIxMdKBoSKR4vISYSHSgaESsdLyAoER0oGhAtHishKhAdKBoQLR8pIioQHSgaEC0fKSIqEB0oGhAtHykiKhAdKBoQLB8sISkQHSgaESsdLyAoER0oGhMnHy8iJBMdKBoTJh8yISMTHSgaFCUdNh8iFB0oGx4PKDdUHSgcHQ4oOVMdKB0cDiY9UR0oHRwOJj5PGysdHA4lQE0cKx0cDiNESh0rHRwOI0RKHSsCARocDiFHSR0rAgEaHA4fS0cdKwIBGhwOH0tHGy0CARwaDh0mASdFGy4CAR0aDRsoASlBHS4CAR0cChsnBSdBHS4CAR0cCBwnBydAHS4CAR8bBxsoByk+HS4CAh8bBBwnCyc+HS4CAx46Jw0nPB4uAgMeOCkNKTggLgIEHjcnESc4HjYfNScTJzYeNyAyKRMpMiA3IjAnFycyIDcjLicZJzAhOCUpKBopKiU5JCknHSgoJDwkJycfKSUkPSgeKyAsHyc+KB0qIyoeKEAnGyolKhwpQC8LMScyCzFAMAkxKTIJMEIyBjErMgcwQ2gtaEVlL2ZHYzJiSWIzYkpgNl9NXThcT1w6W1BaPVhTV0BUVVZBVFZURFFZT0hOW05KTV1LTEtiRU9HZURRRWdCU0JsO1s8bzldOnI2Xzh4LWgsfyxpLIABKmsqiwEVgAEWlgEUgQEUmQEQhAES8igGGAMDAxUKFQMGAxUJLQMfAxgGSggWBQEFFAoUBQQFEwssBB0FFghJCBYFAQUTDBMFBAUTCysGHAUWCEkKFAUBBRQKFAcCBRMLKwYaCRQKRwsTBQEFFAoUCAEFEwosBhkLEwtGBQEFEwUBBRYGFggBBRMFMQYZBQEFEwUBBUYLEwsWBhYOEwoVAxQGGQsTC0YKFAsWBhYOEwsUBBMGGQsTC0YIFgsWBhYOEwsTBRMGGQsTC0YKFAsWBhYOEwsTBRMGGQsTC0YLEwsWBhYOEwoVBBMGGQsTC0YFAQUTBQEFFgYWBQEIEwUxBhkFAQUTBQEFRgUBBRMFAQUVCBUFAQgTCiwKFQUBBRMLRgUBBRMFAQUUChQFAQgTCysLFAUBBRMLRgUBBRMFAQUTDBMFBAUTCysMEwUBBRMLRgUBBRMFAQUTDBMFBAUTCysMEwUBBRMLRgUBBRMFAQUTDBMFBAUTCysMEwUBBRML48UB","encoding":"binary-rle-v1","opticalScale":0.87,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":2.2950000000000004,"offsetY":1.215},"light":{"pitch":4.8,"offsetX":1.8,"offsetY":2.76},"standard":{"pitch":4.2,"offsetX":0.31500000000000006,"offsetY":0.9450000000000001},"dense":{"pitch":3.7,"offsetX":2.3125,"offsetY":3.6075000000000004},"ultra":{"pitch":3.25,"offsetX":1.38125,"offsetY":2.51875}}},{"key":"reunion","width":320,"height":320,"alpha":"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","encoding":"binary-rle-v1","opticalScale":0.85,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":0.675,"offsetY":0.4050000000000001},"light":{"pitch":4.8,"offsetX":0.36,"offsetY":1.0799999999999998},"standard":{"pitch":4.2,"offsetX":3.0450000000000004,"offsetY":1.365},"dense":{"pitch":3.7,"offsetX":2.6825,"offsetY":3.2375},"ultra":{"pitch":3.25,"offsetX":2.51875,"offsetY":0.56875}}}],
      heroEmblemMask: {"key":"rhodes-island-hero","width":320,"height":320,"alpha":"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","encoding":"binary-rle-v1","opticalScale":0.94,"latticeHints":{"sparse":{"pitch":5.4,"offsetX":2.2950000000000004,"offsetY":2.835},"light":{"pitch":4.8,"offsetX":3.7199999999999998,"offsetY":0.36},"standard":{"pitch":4.2,"offsetX":0.10500000000000001,"offsetY":2.205},"dense":{"pitch":3.7,"offsetX":0.6475000000000001,"offsetY":3.4225000000000003},"ultra":{"pitch":3.25,"offsetX":1.54375,"offsetY":2.35625}}}
    });
    const PRTS_STORAGE_KEY = 'dsh.ui.prts.v1'
const CONVERSATION_SCALE_DISTANCE_MIN = 16
const CONVERSATION_SCALE_DISTANCE_MAX = 240
const CONVERSATION_SCALE_DISTANCE_STEP = 8
const CONVERSATION_SCALE_DISTANCE_DEFAULT = 96
const CONVERSATION_SCALE_FOCUS_CONTRAST_MIN = 0
const CONVERSATION_SCALE_FOCUS_CONTRAST_MAX = 100
const CONVERSATION_SCALE_FOCUS_CONTRAST_STEP = 10
const CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT = 70
const DEFAULT_PREFERENCES = Object.freeze({
version: 6,
enabled: false,
preset: 'standard-tactical',
texture: 'full',
glass: 'standard',
motion: 'system',
bootAnimation: true,
conversationParticleDensity: 'sparse',
heroParticleDensity: 'light',
particlePattern: 'orthogonal',
conversationScaleMaxDistance: CONVERSATION_SCALE_DISTANCE_DEFAULT,
conversationScaleFocusContrast: CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT,
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
particles: Object.freeze(['conversationParticleDensity', 'heroParticleDensity']),
material: Object.freeze(['glass']),
accessibility: Object.freeze(['motion', 'bootAnimation']),
navigation: Object.freeze(['conversationScaleMaxDistance', 'conversationScaleFocusContrast']),
})
const TEXTURES = new Set(['off', 'restrained', 'full'])
const GLASS_STRENGTHS = new Set(['off', 'soft', 'standard', 'clear'])
const MOTIONS = new Set(['system', 'reduced'])
const PARTICLE_DENSITIES = new Set(['sparse', 'light', 'standard', 'dense', 'ultra'])
const PRESETS = new Set([...Object.keys(VISUAL_PRESETS), 'custom'])
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
function scaleDistanceOr(value, fallback) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return fallback
const clamped = Math.min(CONVERSATION_SCALE_DISTANCE_MAX, Math.max(CONVERSATION_SCALE_DISTANCE_MIN, numeric))
return Math.round(clamped / CONVERSATION_SCALE_DISTANCE_STEP) * CONVERSATION_SCALE_DISTANCE_STEP
}
function scaleFocusContrastOr(value, fallback) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return fallback
const clamped = Math.min(CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, Math.max(CONVERSATION_SCALE_FOCUS_CONTRAST_MIN, numeric))
return Math.round(clamped / CONVERSATION_SCALE_FOCUS_CONTRAST_STEP) * CONVERSATION_SCALE_FOCUS_CONTRAST_STEP
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
const normalized = {
version: 6,
enabled: booleanOr(input.enabled, DEFAULT_PREFERENCES.enabled),
preset: enumOr(migratedPreset, PRESETS, DEFAULT_PREFERENCES.preset),
texture: enumOr(input.texture, TEXTURES, DEFAULT_PREFERENCES.texture),
glass: normalizeGlass(input),
motion: input.motion === 'full' ? 'system' : enumOr(input.motion, MOTIONS, DEFAULT_PREFERENCES.motion),
bootAnimation: booleanOr(input.bootAnimation, DEFAULT_PREFERENCES.bootAnimation),
conversationParticleDensity: enumOr(legacyDensities.conversation, PARTICLE_DENSITIES, particlePreset.conversationParticleDensity),
heroParticleDensity: enumOr(legacyDensities.hero, PARTICLE_DENSITIES, particlePreset.heroParticleDensity),
particlePattern: 'orthogonal',
conversationScaleMaxDistance: scaleDistanceOr(
input.conversationScaleMaxDistance,
DEFAULT_PREFERENCES.conversationScaleMaxDistance,
),
conversationScaleFocusContrast: scaleFocusContrastOr(
input.conversationScaleFocusContrast,
DEFAULT_PREFERENCES.conversationScaleFocusContrast,
),
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
if (![1, 2, 3, 4, 5, 6].includes(parsed?.version)) return { ...DEFAULT_PREFERENCES }
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
const COMPOSER_RELEVANCE_SELECTOR = [
'[data-composer-card]',
'form textarea',
'button[aria-haspopup="menu"]',
'button[aria-haspopup="listbox"]',
'[role="menu"]',
'[role="listbox"]',
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
const selector = '[role="menu"], [role="listbox"], [class*="mufS8W_card"]'
const sibling = trigger.nextElementSibling
if (sibling?.matches(selector)) return sibling
return trigger.parentElement?.querySelector(`:scope > ${selector}`) ?? null
}
function overlayPopup(document) {
const overlay = document.querySelector('[data-slot="conversation.input.overlay"]')
if (!overlay) return null
return overlay.querySelector('[role="listbox"], [role="menu"], [class*="mufS8W_card"]')
}
function linkedMenu(document, trigger) {
return controlledPopup(document, trigger)
?? localPopup(trigger)
?? overlayPopup(document)
}
function markPopup(popup, kind) {
if (!popup) return
mark(popup, MENU_ATTRIBUTE, kind)
const card = popup.closest?.('[class*="mufS8W_card"]')
mark(card, MENU_ATTRIBUTE, kind)
for (const nested of popup.querySelectorAll?.('[role="menu"], [role="listbox"], [class*="mufS8W_card"]') ?? []) {
mark(nested, MENU_ATTRIBUTE, kind)
}
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
for (const form of [...ownedFallbacks]) {
if (!form.isConnected || form.hasAttribute('data-composer-card')) {
form.removeAttribute?.(FALLBACK_COMPOSER_ATTRIBUTE)
ownedFallbacks.delete(form)
}
}
const fallbackForms = new Set(
[...(document?.querySelectorAll?.('form textarea') ?? [])]
.map(textarea => textarea.closest('form'))
.filter(form => form && !form.querySelector('[data-composer-card]')),
)
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
const isModel = trigger.matches('[class*="_7KE1Ra_"]')
|| menu?.hasAttribute('aria-busy')
const isCommands = trigger.getAttribute('aria-haspopup') === 'listbox'
|| trigger.getAttribute('aria-label') === 'Commands'
|| trigger.matches('[class*="uV2eYG_add"]')
const kind = isModel ? 'model' : isCommands ? 'action' : 'action'
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
for (const popup of overlay.querySelectorAll('[role="menu"], [role="listbox"], [class*="mufS8W_card"]')) {
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
?? document.querySelector('[data-slot="conversation"]')
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
function createAssistantGlassAdapter({ document, window }) {
let observer
let scanFrame
const ownedSurfaces = new Set()
const ownedSteps = new Set()
const stepSurfaces = new Map()
const pendingSteps = new Set()
function collectSteps(node, includeParent = true) {
if (!isElement(node)) return
if (node.matches?.(STEP_SELECTOR)) pendingSteps.add(node)
for (const step of node.querySelectorAll?.(STEP_SELECTOR) ?? []) pendingSteps.add(step)
if (includeParent) {
const parentStep = node.closest?.(STEP_SELECTOR)
if (parentStep) pendingSteps.add(parentStep)
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
const observationRoot = document.querySelector('[data-prts-region="operation"]')
?? document.querySelector('[data-slot="conversation"]')
if (!observationRoot) return
collectSteps(observationRoot)
scan()
if (observer) return
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
function scrollProgress() {
if (!scroller) return 0
const viewport = Math.max(1, Number(scroller.clientHeight) || height)
const raw = (Number(scroller.scrollTop) || 0) / viewport
return raw - Math.floor(raw)
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
direction: targetSegment > segment ? 1 : -1,
targetSegment,
progress: 0,
}
transitionStartedAt = undefined
pointerActive = false
scheduleFrame()
}
function resetTraversal() {
side = -1
segment = 0
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
const viewport = Math.max(1, Number(scroller.clientHeight) || height)
const desiredSegment = Math.floor(((Number(scroller.scrollTop) || 0) + 1) / viewport)
if (transition) pendingSegment = desiredSegment
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

const CONVERSATION_USER_TURN_SELECTOR = [
'[data-chat-flow-kind="user"]',
'[data-chat-flow-kind="user-step"]',
'[data-message-role="user"]',
].join(',')
const CONVERSATION_SCALE_SPACING = 8
const CONVERSATION_SCALE_BASE_LENGTHS = Object.freeze([24, 18, 14, 10, 6])
const CONVERSATION_SCALE_CONTRAST_DELTAS = Object.freeze([5, -3, -4, -4, -3])
function resolveConversationScaleLengths(value = CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT) {
const numeric = Number(value)
const contrast = Number.isFinite(numeric)
? Math.min(CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, Math.max(CONVERSATION_SCALE_FOCUS_CONTRAST_MIN, numeric))
: CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT
const ratio = contrast / CONVERSATION_SCALE_FOCUS_CONTRAST_MAX
return CONVERSATION_SCALE_BASE_LENGTHS.map((length, index) =>
Math.round(length + CONVERSATION_SCALE_CONTRAST_DELTAS[index] * ratio))
}
const CONVERSATION_SCALE_LENGTHS = Object.freeze(resolveConversationScaleLengths())
const CONVERSATION_SCALE_WAVE_DURATION = 140
const CONVERSATION_JUMP_BOTTOM_THRESHOLD = 25
const CONVERSATION_JUMP_SMOOTH_VIEWPORT_LIMIT = 1.5
const CONVERSATION_JUMP_SETTLE_MAX_DISTANCE = 88
const CONVERSATION_JUMP_SETTLE_VIEWPORT_RATIO = .12
const CONVERSATION_JUMP_SETTLE_DURATION = 180
const CONVERSATION_JUMP_VERIFY_DURATION = 900
const CONVERSATION_HISTORY_PAGE_LIMIT = 10
const CONVERSATION_HISTORY_TIME_LIMIT = 8000
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
const CONVERSATION_SCALE_WIDTH = 32
const CONVERSATION_SCALE_CONTENT_GAP = 12
const CONVERSATION_SCALE_PREVIEW_WIDTH = 360
const CONVERSATION_SCALE_PREVIEW_GAP = 8
const CONVERSATION_SCALE_RIGHT_GAP = 12
const CONVERSATION_SCALE_HYSTERESIS = 16
const CONVERSATION_SCALE_DEFAULT_MAX_DISTANCE = 96
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
let scaleInstanceSeed = 0
function clamp(value, minimum, maximum) {
return Math.min(maximum, Math.max(minimum, value))
}
function resolveConversationScaleGeometry({
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
function resolveConversationScaleCalibrationState({
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
function sanitizeConversationPreviewNode(node, limit = 360) {
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
function collectConversationTurns(scroller) {
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
function findConversationOlderButton(root) {
for (const button of root?.querySelectorAll?.('button') ?? []) {
for (let current = button.parentElement; current && root.contains(current); current = current.parentElement) {
if (hasClassSuffix(current, '_older')) return button
}
}
return null
}
function resolveConversationHistorySnapshot(sessions) {
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
function getConversationTurnPreview(scroller, turns, index) {
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
function getConversationScaleLayout(count, height, requestedOffset = 0) {
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
function conversationScaleWaveLength(distance, lengths = CONVERSATION_SCALE_LENGTHS) {
const safeDistance = Math.abs(Number(distance) || 0)
const lower = Math.floor(safeDistance)
if (lower >= lengths.length - 1) return lengths.at(-1)
const progress = safeDistance - lower
const from = lengths[lower]
const to = lengths[lower + 1]
return from + (to - from) * progress
}
function visibleConversationTickRange(layout, buffer = 2) {
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
function nearestVisibleConversationTick(layout, localY) {
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
function snapConversationScaleOffset(offset, maximum) {
return clamp(
Math.round((Number(offset) || 0) / CONVERSATION_SCALE_SPACING) * CONVERSATION_SCALE_SPACING,
0,
Math.max(0, Number(maximum) || 0),
)
}
function shouldFollowConversationScaleBottom(offset, maximum) {
return Math.max(0, Number(maximum) || 0) - (Number(offset) || 0) <= 1
}
function calculateConversationJumpTop({
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
function resolveConversationJumpBehavior(distance, viewportHeight, prefersReducedMotion = false) {
if (prefersReducedMotion) return 'auto'
const height = Math.max(0, Number(viewportHeight) || 0)
const delta = Math.abs(Number(distance) || 0)
return height > 0 && delta <= height * CONVERSATION_JUMP_SMOOTH_VIEWPORT_LIMIT ? 'smooth' : 'auto'
}
function resolveConversationJumpSettle(distance, viewportHeight, prefersReducedMotion = false) {
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
async function performConversationJump({
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
function buildConversationScalePaths(layout, interactionIndex = -1, animation, lengths = CONVERSATION_SCALE_LENGTHS) {
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
function createConversationScaleAdapter({ document, window, sessions }) {
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
if (resizeActive) return
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
return true
}
function disconnectRoots() {
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
const ResizeObserver = window?.ResizeObserver
if (typeof ResizeObserver === 'function') {
resizeObserver = new ResizeObserver((entries = []) => {
geometryDirty = true
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
setScaleResizeState(true)
if (frame !== undefined) {
if (window?.cancelAnimationFrame) window.cancelAnimationFrame(frame)
else window?.clearTimeout?.(frame)
frame = undefined
}
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
schedule(true)
},
dispose() {
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
})
function number(value) {
return Number(value.toFixed(3)).toString()
}
function point(x, y) {
return `${number(x)} ${number(y)}`
}
function createFacilityPath({ width, height, topNotch = false } = {}) {
if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 2 || height <= FACILITY_GEOMETRY.sideOpening + 2) return ''
const halfStroke = FACILITY_GEOMETRY.stroke / 2
const left = halfStroke
const right = width - halfStroke
const top = halfStroke
const bottom = height - halfStroke
const centerX = width / 2
const centerY = height / 2
const points = [point(left + FACILITY_GEOMETRY.corner, top)]
if (topNotch && width >= FACILITY_GEOMETRY.topOpening + FACILITY_GEOMETRY.corner * 2 + FACILITY_GEOMETRY.stroke) {
points.push(
point(centerX - FACILITY_GEOMETRY.topOpening / 2, top),
point(centerX - FACILITY_GEOMETRY.topInner / 2, top + FACILITY_GEOMETRY.topDepth),
point(centerX + FACILITY_GEOMETRY.topInner / 2, top + FACILITY_GEOMETRY.topDepth),
point(centerX + FACILITY_GEOMETRY.topOpening / 2, top),
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
graphic.insertBefore(pickup, graphic.querySelector('[data-prts-facility-layer="outline"]'))
}
function ensureFacilityGraphic(document, owner, { kind, topNotch = false, texture = 'none' } = {}) {
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
if (texture === 'pickup' && !graphic.querySelector('[data-prts-session-pickup]')) appendSessionPickup(document, graphic)
graphic.setAttribute('data-prts-facility-svg', kind)
graphic.toggleAttribute('data-prts-top-notch', Boolean(topNotch))
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
const path = createFacilityPath({ width, height, topNotch })
if (!graphic || !path) {
owner?.removeAttribute?.('data-prts-facility-size')
setReady(owner, false)
return false
}
const size = `${Number(width.toFixed(3))}x${Number(height.toFixed(3))}`
if (owner.getAttribute('data-prts-facility-size') !== size) {
graphic.setAttribute('viewBox', `0 0 ${Number(width.toFixed(3))} ${Number(height.toFixed(3))}`)
for (const layer of graphic.querySelectorAll('[data-prts-facility-layer], [data-prts-facility-clip]')) layer.setAttribute('d', path)
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
'data-prts-session-menu-anchor',
'data-prts-session-menu',
'data-prts-session-time',
'data-prts-session-index',
'data-prts-facility-face',
'data-prts-facility-spine',
'data-prts-facility-vector',
'data-prts-facility-size',
'data-prts-facility-texture',
'data-prts-spine-vector',
]
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
return { actions, anchor, create, menu }
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
&& node.getAttribute('aria-hidden') !== 'true'
&& !node.querySelector('button')
&& node.textContent.trim()
))
return candidates.find(node => node.matches('[class*="time" i], time, [data-session-time]')) ?? candidates.at(-1)
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
function createSidebarControlAdapter({ document, window }) {
let observer
let resizeObserver
let resizeFrame
let resizeTimer
let scanFrame
let owned = new Set()
let vectorOwners = new Set()
const dirtyVectors = new Map()
const vectorSizes = new WeakMap()
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
const graphic = ensureFacilityGraphic(document, owner, options)
if (!graphic) return
next.add(graphic)
nextVectorOwners.add(owner)
if (!vectorOwners.has(owner)) resizeObserver?.observe(owner)
if (!vectorSizes.has(owner)) dirtyVectors.set(owner, undefined)
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
const root = document?.querySelector?.('[data-prts-region="sessions"] [data-slot="sidebar.workspaces"]')
const next = new Set()
const nextVectorOwners = new Set()
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
const face = ensureFacilityFace(document, row, 'session', next)
const spine = ensureFacilitySpine(document, row, 'session', next)
registerVector(face, { kind: 'face', topNotch: true, texture: 'pickup' }, next, nextVectorOwners)
registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
markSidebarNode(row, 'data-prts-session-row', next)
row.dataset.prtsSessionIndex = sessionIndex
const title = resolveRowTitle(row, 'session', controls.actions)
markSidebarNode(title, 'data-prts-row-title', next)
markSidebarNode(resolveSessionTime(row, title, controls.actions), 'data-prts-session-time', next)
if (title) title.dataset.prtsSessionIndex = sessionIndex
row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
|| row.classList.contains('menuOpen'))
markSidebarNode(controls.actions, 'data-prts-session-actions', next)
markSidebarNode(controls.anchor, 'data-prts-session-menu-anchor', next)
markSidebarNode(controls.menu, 'data-prts-session-menu', next)
registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
}
}
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
}
return {
start() {
if (!document) return
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
if (observer || !window?.MutationObserver) return
const observationRoot = document.querySelector('[data-prts-region="sessions"]')
if (!observationRoot) return
observer = new window.MutationObserver(queueScan)
observer.observe(observationRoot, {
subtree: true,
childList: true,
attributes: true,
attributeFilter: ['aria-expanded', 'aria-selected', 'class'],
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
resizeObserver?.disconnect()
resizeObserver = undefined
if (resizeFrame !== undefined) {
if (window?.cancelAnimationFrame) window.cancelAnimationFrame(resizeFrame)
else window?.clearTimeout?.(resizeFrame)
}
resizeFrame = undefined
if (resizeTimer !== undefined) window?.clearTimeout?.(resizeTimer)
resizeTimer = undefined
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
function resolveRc7Regions(document, report = () => {}) {
const root = document?.querySelector('[data-slot="root"]')
const sidebarSlot = root?.querySelector('[data-slot="sidebar"]')
const conversationSlot = root?.querySelector('[data-slot="conversation"]')
const detailsSlot = root?.querySelector('[data-slot="details"]')
if (!root || !sidebarSlot || !conversationSlot || !detailsSlot) {
report('required layout slots are unavailable', {
root: Boolean(root), sidebar: Boolean(sidebarSlot),
conversation: Boolean(conversationSlot), details: Boolean(detailsSlot),
})
return null
}
const sidebar = sidebarSlot?.parentElement
const center = conversationSlot?.parentElement
const details = detailsSlot?.parentElement
if (!sidebar || !center || !details) {
report('required layout region containers are unavailable', {
sidebar: Boolean(sidebar), conversation: Boolean(center), details: Boolean(details),
})
return null
}
const frame = closestCommonContainer(root, [sidebar, center, details])
if (!frame) {
report('common layout container is unavailable')
return null
}
return { root, frame, sidebar, center, details, sidebarSlot, conversationSlot, detailsSlot }
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
[regions.details, 'details'],
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

const ROOT_ATTRIBUTES = [
'data-dsh-prts',
'data-prts-scheme',
'data-prts-texture',
'data-prts-glass',
'data-prts-motion',
'data-prts-particle-pattern',
]
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
function createThemeController({ document, window, cssText, service }) {
if (!document || !window) return { apply() {}, sync() {}, refresh() {}, setTheme() {}, toggle() {}, dispose() {} }
const root = document.documentElement
let style
let disposed = false
let refreshRevision = 0
let setRevision = 0
function clearThemeState() {
for (const attribute of ROOT_ATTRIBUTES) root.removeAttribute(attribute)
}
function removeOwnedState() {
disposed = true
refreshRevision += 1
setRevision += 1
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
function sync(value) {
if (disposed) return
root.dataset.prtsScheme = resolveScheme(value)
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
function setTheme(id) {
const target = id === 'dark' ? 'dark' : 'light'
const revision = ++setRevision
try {
const result = service?.setTheme?.(target)
if (result && typeof result.then === 'function') {
return result.then(() => {
if (!disposed && revision === setRevision) sync(target)
return target
}).catch(() => {
if (!disposed && revision === setRevision) refresh()
return root.dataset.prtsScheme
})
}
if (!disposed && revision === setRevision) sync(target)
} catch {
if (!disposed && revision === setRevision) sync(target)
}
return target
}
function toggle() {
return setTheme(root.dataset.prtsScheme === 'dark' ? 'light' : 'dark')
}
return {
apply(value) {
disposed = false
const preferences = normalizePreferences(value)
ensureStyle()
if (!preferences.enabled) {
clearThemeState()
return
}
root.setAttribute('data-dsh-prts', '')
root.dataset.prtsTexture = preferences.texture
root.dataset.prtsGlass = preferences.glass
root.dataset.prtsMotion = preferences.motion
root.dataset.prtsParticlePattern = 'orthogonal'
refresh()
},
sync,
refresh,
setTheme,
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
return `<section data-prts-startup data-stage="boot" popover="manual" role="status" aria-live="assertive" aria-label="P.R.T.S. 启动序列" tabindex="-1">
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
function findNativeHarnessLoader(document) {
return document?.querySelector?.('[data-dsh-boot]') ?? null
}
function createPrtsStartupSequence({
document,
window,
prtsEmblem = '',
rhodesEmblem = '',
timings = PRTS_STARTUP_TIMINGS,
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
let readyStartedAt
let exitStartedAt
let timeoutStartedAt
let currentStage = 'boot'
let pendingStage
let copyTransitionStartedAt
let lastProgress = -1
let useReducedMotion = false
const now = () => window?.performance?.now?.() ?? Date.now()
const requestFrame = callback => window?.requestAnimationFrame?.(callback)
?? window?.setTimeout?.(() => callback(now()), 16)
const cancelFrame = id => {
if (id === undefined) return
if (window?.cancelAnimationFrame) window.cancelAnimationFrame(id)
else window?.clearTimeout?.(id)
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
restoreInteractivity()
if (restoreFocus && previousFocus?.isConnected) previousFocus.focus?.()
previousFocus = undefined
}
function updateProgress(progress) {
if (!overlay) return
const safeProgress = Math.max(0, Math.min(100, progress))
if (Math.abs(safeProgress - lastProgress) < .01) return
lastProgress = safeProgress
overlay.style.setProperty('--prts-startup-progress', (safeProgress / 100).toFixed(4))
const percent = overlay.querySelector('[data-prts-startup-percent]')
if (percent) percent.textContent = `${String(Math.round(safeProgress)).padStart(3, '0')}%`
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
if (typeof overlay?.showPopover !== 'function') return
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
const approachProgress = 90 * easeOutCubic(elapsed / schedule.approach)
let progress = Math.min(90, approachProgress)
if (!hostReady && elapsed >= schedule.timeout) {
timeoutStartedAt = elapsed
} else if (hostReady && elapsed >= schedule.intro) {
if (finishStartedAt === undefined) {
finishStartedAt = elapsed
finishStartedProgress = progress
}
progress = finishStartedProgress
+ (100 - finishStartedProgress) * easeOutCubic((elapsed - finishStartedAt) / schedule.finish)
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
currentStage = 'boot'
pendingStage = undefined
copyTransitionStartedAt = undefined
lastProgress = -1
useReducedMotion = reducedMotionRequested(reduced)
previousFocus = document.activeElement
document.body.appendChild(overlay)
promoteToTopLayer()
document.documentElement.setAttribute('data-prts-startup-active', '')
lockSiblings()
overlay.focus?.({ preventScroll: true })
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
['texture', '环境底纹', [['off', '关闭'], ['restrained', '克制'], ['full', '完整']]],
['glass', '玻璃材质', [['off', '关闭'], ['soft', '柔和'], ['standard', '标准'], ['clear', '清晰']]],
['motion', '动态效果', [['system', '跟随系统'], ['reduced', '减少']]],
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
: ''
const sample = value => key === 'texture' || key === 'glass'
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
function calibrationMarkup() {
return `<div data-prts-scale-calibration data-prts-calibration-mode="hidden" data-prts-calibration-reason="unmeasured">
<div data-prts-scale-calibration-viewport>
<div data-prts-scale-calibration-canvas aria-hidden="true">
<i data-prts-scale-calibration-sidebar></i>
<span data-prts-scale-calibration-measure><i></i><output data-prts-scale-calibration-value>96 px</output></span>
<span data-prts-scale-calibration-rail>${Array.from({ length: 9 }, (_, index) => `<i style="--prts-calibration-tick:${index}"></i>`).join('')}</span>
<i data-prts-scale-calibration-gap></i>
<span data-prts-scale-calibration-content><i></i><small>会话内容区</small></span>
</div>
</div>
<div data-prts-scale-calibration-meta>
<span data-prts-scale-calibration-scale hidden>缩放预览</span>
<output data-prts-scale-calibration-status aria-live="polite">当前视图：几何测量中</output>
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
<div data-prts-settings-common-grid>${COMMON_CONTROLS.map(([key, label, options]) => settingButtons(key, label, options)).join('')}</div>
</section>
<details data-prts-settings-advanced>
<summary><span><small>精细调整</small><strong>粒子与会话刻度</strong></span><output data-prts-advanced-summary>标准 / 96 px</output></summary>
<div data-prts-settings-advanced-content>
<section data-prts-particle-detail>
<header><strong>粒子精度</strong><span>同时调整会话与新会话徽记</span></header>
<div role="radiogroup" aria-label="粒子精度">${particleMarkup()}</div>
<span data-prts-particle-error role="alert" hidden>粒子资源加载异常，主题已使用静态后备效果</span>
</section>
<section data-prts-scale-adjustment>
<header><strong>会话刻度</strong><span>调整位置距离与悬停焦点的视觉区分</span></header>
${calibrationMarkup()}
<label data-prts-setting-row="conversationScaleMaxDistance" data-prts-setting-range-row>
<span>最大距离</span>
<div><input type="range" min="16" max="240" step="8" value="96" data-prts-setting-range data-prts-setting-key="conversationScaleMaxDistance" aria-label="会话刻度最大距离"><output data-prts-scale-distance-output>96 px</output></div>
</label>
<label data-prts-setting-row="conversationScaleFocusContrast" data-prts-setting-range-row>
<span>聚焦区分度</span>
<div data-prts-scale-focus-control>
<span data-prts-scale-focus-preview aria-hidden="true">${Array.from({ length: 5 }, (_, index) => `<i data-prts-scale-focus-preview-tick="${index}"></i>`).join('')}</span>
<input type="range" min="0" max="100" step="10" value="70" data-prts-setting-range data-prts-setting-key="conversationScaleFocusContrast" aria-label="会话刻度聚焦区分度">
<output data-prts-scale-focus-output>70</output>
</div>
</label>
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
onResetVisual = () => {},
onRetrySave = () => {},
getConversationScalePreview = () => ({ visible: false, reason: 'unmeasured', mode: 'hidden' }),
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
let scaleDistanceDraft
let scaleDistanceDirty = false
let scaleFocusContrastDraft
let scaleFocusContrastDirty = false
let calibrationResizeObserver
let calibrationSettleTimer
let calibrationFrame
let calibrationViewportWidth
let calibrationFactor
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
commitScaleDistance()
commitScaleFocusContrast()
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
renderScaleCalibration()
;(panel.querySelector('[data-prts-theme-settings-close]') ?? focusable()[0] ?? panel).focus?.()
} else {
panel.removeAttribute('data-prts-settings-visible')
hidePanel()
setResetConfirmation(false)
if (restoreFocus) (trigger.isConnected ? trigger : previousFocus)?.focus?.()
}
return isOpen
}
function normalizeScaleDistance(value) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return 96
return Math.min(240, Math.max(16, Math.round(numeric / 8) * 8))
}
function currentScaleDistance() {
return normalizeScaleDistance(scaleDistanceDirty ? scaleDistanceDraft : currentPreferences?.conversationScaleMaxDistance)
}
function normalizeScaleFocusContrast(value) {
const numeric = Number(value)
if (!Number.isFinite(numeric)) return CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT
const clamped = Math.min(CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, Math.max(CONVERSATION_SCALE_FOCUS_CONTRAST_MIN, numeric))
return Math.round(clamped / CONVERSATION_SCALE_FOCUS_CONTRAST_STEP) * CONVERSATION_SCALE_FOCUS_CONTRAST_STEP
}
function currentScaleFocusContrast() {
return normalizeScaleFocusContrast(scaleFocusContrastDirty ? scaleFocusContrastDraft : currentPreferences?.conversationScaleFocusContrast)
}
function calibrationStatus(state, value) {
if (state?.mode === 'configured') return `当前视图：使用配置上限 / ${Math.round(Number(state.left) || value)} px`
if (state?.simulated) return `模拟布局：使用配置上限 / ${value} px`
if (state?.mode === 'centered') return `当前视图：自动居中 / 距侧栏 ${Math.round(Number(state.left) || 0)} px`
const reasons = {
drawer: '抽屉布局', phone: '手机布局', turns: '消息不足', corridor: '会话走廊不足',
preview: '会话预览空间不足', unmeasured: '模拟布局',
}
return `当前视图：隐藏 / ${reasons[state?.reason] || '空间不足'}`
}
function setText(node, value) {
if (node && node.textContent !== value) node.textContent = value
}
function setCalibrationResizeState(active) {
for (const node of [panel, backdrop]) {
if (!node || node.hasAttribute('data-prts-resizing') === active) continue
node.toggleAttribute('data-prts-resizing', active)
}
}
function cancelCalibrationFrame() {
if (calibrationFrame === undefined) return
window?.cancelAnimationFrame?.(calibrationFrame)
window?.clearTimeout?.(calibrationFrame)
calibrationFrame = undefined
}
function measureScaleCalibration() {
calibrationFrame = undefined
if (!isOpen) return
const viewport = panel?.querySelector?.('[data-prts-scale-calibration-viewport]')
const canvas = panel?.querySelector?.('[data-prts-scale-calibration-canvas]')
const calibration = panel?.querySelector?.('[data-prts-scale-calibration]')
const scaleNote = panel?.querySelector?.('[data-prts-scale-calibration-scale]')
if (!viewport || !canvas || !calibration) return
const available = calibrationViewportWidth || viewport.clientWidth
const factor = available > 0 ? Math.min(1, available / 360) : 1
const roundedFactor = Number(factor.toFixed(4))
const value = currentScaleDistance()
let state
try { state = getConversationScalePreview(value) } catch { state = { visible: false, reason: 'unmeasured', mode: 'hidden' } }
if (roundedFactor !== calibrationFactor) {
calibrationFactor = roundedFactor
canvas.style.transform = `scale(${roundedFactor})`
viewport.style.height = `${Math.ceil(94 * roundedFactor)}px`
}
const scaled = factor < .999
if (calibration.hasAttribute('data-prts-calibration-scaled') !== scaled) calibration.toggleAttribute('data-prts-calibration-scaled', scaled)
if (scaleNote && scaleNote.hidden !== !scaled) scaleNote.hidden = !scaled
const mode = state?.simulated ? 'simulated' : state?.mode || 'hidden'
const reason = state?.reason || 'unmeasured'
if (calibration.dataset.prtsCalibrationMode !== mode) calibration.dataset.prtsCalibrationMode = mode
if (calibration.dataset.prtsCalibrationReason !== reason) calibration.dataset.prtsCalibrationReason = reason
setText(panel.querySelector('[data-prts-scale-calibration-status]'), calibrationStatus(state, value))
}
function scheduleCalibrationMeasurement() {
if (!isOpen) return
cancelCalibrationFrame()
calibrationFrame = window?.requestAnimationFrame?.(measureScaleCalibration)
?? window?.setTimeout?.(measureScaleCalibration, 16)
}
function scheduleScalePreviewRefresh(entries = []) {
const viewportEntry = entries.find?.(entry => entry.target?.matches?.('[data-prts-scale-calibration-viewport]'))
const observedWidth = Number(viewportEntry?.contentRect?.width)
if (Number.isFinite(observedWidth) && observedWidth > 0) {
calibrationViewportWidth = observedWidth
}
if (!isOpen) return
setCalibrationResizeState(true)
if (calibrationSettleTimer !== undefined) window?.clearTimeout?.(calibrationSettleTimer)
calibrationSettleTimer = window?.setTimeout?.(() => {
calibrationSettleTimer = undefined
setCalibrationResizeState(false)
renderScaleCalibration()
}, 160)
}
function renderScaleCalibration() {
if (!isOpen) return
if (!panel || !currentPreferences) return
const value = currentScaleDistance()
const contrast = currentScaleFocusContrast()
const lengths = resolveConversationScaleLengths(contrast)
const calibration = panel.querySelector('[data-prts-scale-calibration]')
const distanceRange = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="conversationScaleMaxDistance"]')
const contrastRange = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="conversationScaleFocusContrast"]')
const distanceOutput = panel.querySelector('[data-prts-scale-distance-output]')
const contrastOutput = panel.querySelector('[data-prts-scale-focus-output]')
const calibrationValue = panel.querySelector('[data-prts-scale-calibration-value]')
if (distanceRange && distanceRange.value !== String(value)) distanceRange.value = String(value)
if (contrastRange && contrastRange.value !== String(contrast)) contrastRange.value = String(contrast)
setText(distanceOutput, `${value} px`)
setText(contrastOutput, String(contrast))
setText(calibrationValue, `${value} px`)
for (const tick of panel.querySelectorAll('[data-prts-scale-focus-preview-tick]')) {
const length = lengths[Number(tick.dataset.prtsScaleFocusPreviewTick)] ?? lengths.at(-1)
const width = `${length}px`
if (tick.style.width !== width) tick.style.width = width
}
const detail = resolveParticleDetail(currentPreferences)
const detailLabels = { compact: '精简', standard: '标准', precise: '精细' }
const advanced = panel.querySelector('[data-prts-advanced-summary]')
setText(advanced, `${detailLabels[detail]} / 区分度 ${contrast} / ${value} px`)
if (!calibration) return
const distance = `${value}px`
if (calibration.style.getPropertyValue('--prts-calibration-distance') !== distance) {
calibration.style.setProperty('--prts-calibration-distance', distance)
}
scheduleCalibrationMeasurement()
}
function commitScaleDistance() {
if (!scaleDistanceDirty || !currentPreferences) return false
const value = currentScaleDistance()
scaleDistanceDirty = false
scaleDistanceDraft = value
if (value !== normalizeScaleDistance(currentPreferences.conversationScaleMaxDistance)) onPreferenceChange('conversationScaleMaxDistance', value)
else renderScaleCalibration()
return true
}
function commitScaleFocusContrast() {
if (!scaleFocusContrastDirty || !currentPreferences) return false
const value = currentScaleFocusContrast()
scaleFocusContrastDirty = false
scaleFocusContrastDraft = value
if (value !== normalizeScaleFocusContrast(currentPreferences.conversationScaleFocusContrast)) onPreferenceChange('conversationScaleFocusContrast', value)
else renderScaleCalibration()
return true
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
const actual = key === 'particleDetail' ? particleDetail : currentPreferences[key]
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
if (!scaleDistanceDirty) scaleDistanceDraft = normalizeScaleDistance(currentPreferences.conversationScaleMaxDistance)
if (!scaleFocusContrastDirty) scaleFocusContrastDraft = normalizeScaleFocusContrast(currentPreferences.conversationScaleFocusContrast)
renderScaleCalibration()
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
markFeedback(target)
onPreferenceChange(target.dataset.prtsSettingKey, raw === 'true' ? true : raw === 'false' ? false : raw)
return
}
if (target.hasAttribute('data-prts-retry-save')) { onRetrySave(); return }
if (target.hasAttribute('data-prts-reset-visual')) { setResetConfirmation(true); return }
if (target.hasAttribute('data-prts-reset-cancel')) { setResetConfirmation(false); return }
if (target.hasAttribute('data-prts-reset-confirm-action')) {
scaleDistanceDirty = false
scaleDistanceDraft = undefined
scaleFocusContrastDirty = false
scaleFocusContrastDraft = undefined
setResetConfirmation(false)
onResetVisual()
}
}
function onPanelInput(event) {
const target = event.target
if (!target?.matches?.('input[data-prts-setting-range]')) return
const value = Number(target.value)
if (!Number.isFinite(value)) return
if (target.dataset.prtsSettingKey === 'conversationScaleMaxDistance') {
scaleDistanceDraft = value
scaleDistanceDirty = true
} else if (target.dataset.prtsSettingKey === 'conversationScaleFocusContrast') {
scaleFocusContrastDraft = value
scaleFocusContrastDirty = true
} else {
return
}
renderScaleCalibration()
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
if (!target?.matches?.('input[data-prts-setting-range]')) return
if (target.dataset.prtsSettingKey === 'conversationScaleMaxDistance') commitScaleDistance()
if (target.dataset.prtsSettingKey === 'conversationScaleFocusContrast') commitScaleFocusContrast()
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
if (typeof window?.ResizeObserver === 'function') {
calibrationResizeObserver = new window.ResizeObserver(scheduleScalePreviewRefresh)
const viewport = panel?.querySelector?.('[data-prts-scale-calibration-viewport]')
if (viewport) calibrationResizeObserver.observe(viewport)
}
return {
update(preferences, status, persistenceState = currentPersistence) {
currentPreferences = preferences
currentStatus = status
currentPersistence = persistenceState ?? { phase: 'idle', revision: 0 }
if (!scaleDistanceDirty) scaleDistanceDraft = normalizeScaleDistance(preferences?.conversationScaleMaxDistance)
if (!scaleFocusContrastDirty) scaleFocusContrastDraft = normalizeScaleFocusContrast(preferences?.conversationScaleFocusContrast)
renderState()
},
refreshScalePreview: renderScaleCalibration,
scheduleScalePreviewRefresh,
open: () => setOpen(true),
close: () => setOpen(false),
toggle,
dispose() {
isOpen = false
hidePanel()
if (savedTimer !== undefined) window?.clearTimeout?.(savedTimer)
if (feedbackTimer !== undefined) window?.clearTimeout?.(feedbackTimer)
if (calibrationSettleTimer !== undefined) window?.clearTimeout?.(calibrationSettleTimer)
calibrationSettleTimer = undefined
cancelCalibrationFrame()
setCalibrationResizeState(false)
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
calibrationResizeObserver?.disconnect()
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

function setText(root, selector, value) {
const node = root?.querySelector(selector)
const next = String(value ?? '')
if (node && node.textContent !== next) node.textContent = next
}
function markup(emblem) {
return `<div data-prts-shell data-plugin="dsh-theme-prts">
<button type="button" data-prts-rail-launcher aria-label="打开 P.R.T.S. 导航" aria-controls="prts-nav-rail" aria-expanded="false"><span aria-hidden="true">P.R.T.S.</span></button>
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
<button type="button" data-prts-theme-disable aria-label="关闭 P.R.T.S. 主题"><b aria-hidden="true">×</b><small>关闭主题</small></button>
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
onThemeDisable = () => {},
onPreferenceChange = () => {},
onVisualReset = () => {},
getConversationScalePreview = () => ({ visible: false, reason: 'unmeasured', mode: 'hidden' }),
onRetrySave = () => {},
}) {
const root = document.documentElement
const resizeShield = createResizeShieldAdapter({ window })
let shell
let navRail
let railLauncher
let railMode
let railViewportQuery
let settingsOverlay
let schemeToggle
let themeDisable
let connectionIndicator
let conversationObserver
let schemeObserver
let operationRegion
function syncConversationState() {
if (!operationRegion) return
const candidate = operationRegion.querySelector(
'[data-chat-flow-kind]:not([hidden]):not([aria-hidden="true"]), [data-message-role]:not([hidden]):not([aria-hidden="true"])',
)
const active = Boolean(candidate)
root.dataset.prtsConversationState = active ? 'active' : 'idle'
settingsOverlay?.refreshScalePreview()
}
function toggleScheme() {
onSchemeToggle(root.dataset.prtsScheme === 'dark' ? 'light' : 'dark')
}
function syncSchemeToggle() {
if (!schemeToggle) return
const current = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
schemeToggle.dataset.prtsSchemeCurrent = current
schemeToggle.setAttribute('aria-label', current === 'dark' ? '切换到日间模式' : '切换到夜间模式')
}
function syncRailState() {
if (!navRail || !railLauncher) return
const overlay = railMode === 'overlay'
const open = overlay && root.hasAttribute('data-prts-rail-open')
railLauncher.setAttribute('aria-expanded', String(open))
railLauncher.setAttribute('aria-label', open ? '关闭 P.R.T.S. 导航' : '打开 P.R.T.S. 导航')
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
function setRailViewport(width = window.innerWidth) {
const nextMode = Number(width) >= 1180 ? 'docked' : 'overlay'
if (nextMode === railMode) return railMode
railMode = nextMode
root.dataset.prtsRailMode = nextMode
if (nextMode === 'docked') root.removeAttribute('data-prts-rail-open')
else root.removeAttribute('data-prts-rail-open')
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
if (navRail?.contains?.(event.target) || railLauncher?.contains?.(event.target)) return
closeRail()
}
function onRailAction(event) {
const action = event.target?.closest?.('[data-prts-rail-brand], [data-prts-scheme-toggle]')
if (action && navRail?.contains?.(action)) closeRail()
}
function onResponsiveChange() {
setRailViewport(window.innerWidth)
settingsOverlay?.scheduleScalePreviewRefresh?.()
}
function bindResponsiveQueries() {
railViewportQuery = window.matchMedia?.('(min-width: 1180px)')
railViewportQuery?.addEventListener?.('change', onResponsiveChange)
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
onResetVisual: onVisualReset,
onRetrySave,
getConversationScalePreview,
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
railLauncher.addEventListener('click', toggleRail)
navRail.addEventListener('click', onRailAction)
document.addEventListener('keydown', onRailKeydown)
document.addEventListener('click', onDocumentClick)
schemeToggle.addEventListener('click', toggleScheme)
themeDisable.addEventListener('click', disableTheme)
syncConversationState()
syncSchemeToggle()
return true
}
function dispose() {
railLauncher?.removeEventListener('click', toggleRail)
navRail?.removeEventListener('click', onRailAction)
document.removeEventListener('keydown', onRailKeydown)
document.removeEventListener('click', onDocumentClick)
schemeToggle?.removeEventListener('click', toggleScheme)
themeDisable?.removeEventListener('click', disableTheme)
railViewportQuery?.removeEventListener?.('change', onResponsiveChange)
railViewportQuery = undefined
resizeShield.dispose()
settingsOverlay?.dispose()
conversationObserver?.disconnect()
schemeObserver?.disconnect()
shell?.remove()
root.removeAttribute('data-prts-conversation-state')
root.removeAttribute('data-prts-rail-mode')
root.removeAttribute('data-prts-rail-open')
navRail = railLauncher = railMode = undefined
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
if (!mount()) return false
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
const theme = createThemeController({ document, window, cssText, service: themeService })
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
onSchemeToggle(next) {
theme.setTheme(next)
},
onThemeDisable() {
persistAndApply(updatePreferenceValue(preferences, 'enabled', false))
},
onPreferenceChange(key, value) {
persistAndApply(updatePreferenceValue(preferences, key, value))
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
function apply(ctx) {
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

    exports.cssText = PRTS_CSS;
    exports.assets = PRTS_ASSETS;
    exports.inject = inject;
    exports.apply = apply;
    exports.applyPrtsPlugin = applyPrtsPlugin;
    return module.exports;
  }
});
