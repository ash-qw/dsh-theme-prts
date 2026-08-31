# dsh-theme-prts

A personal, non-commercial Arknights / P.R.T.S. fan UI plugin for DeepSeek Harness Web. It keeps Harness behavior and data flow intact while presenting workspaces, sessions, and conversations as a Rhodes Island facility terminal.

> [!IMPORTANT]
> This is an unofficial, personal Arknights fan theme. It is not affiliated with, sponsored by, authorized by, or endorsed by Shanghai Hypergryph Network Technology Co., Ltd. or any regional publisher.
>
> The MIT License covers only original code created for this project. Certain recognizable Arknights names, character images, emblems, and derivative material included in the package are outside the MIT grant. This project grants users no right to copy, modify, redistribute, sublicense, or commercially use that third-party material.
>
> Public availability of source material does not itself grant permission to reuse or redistribute it, and free or non-commercial use is not automatically authorized. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for provenance and licensing boundaries.
>
> This project and its release packages may be suspended, restricted, or have relevant material removed at any time in response to a rights-holder request, platform policy, or maintainer decision. Continued availability is not guaranteed.

Target: `deepseek-harness:0.1.1-rc.2`. The theme is disabled by default.

## Current feature set

- Facility-style P.R.T.S. surfaces with complete SVG contours, distinct workspace/session spines, and compact right-edge actions;
- layered city silhouettes moving like a view through a train window on workspace hover, plus a mixed-tempo recording waveform on session hover;
- a Codex-like conversation scale with Q/A previews, local wheel scrolling, and click-to-message navigation;
- day/night switching synchronized with the native Harness theme state;
- off, soft, standard, and clear material levels for composers, menus, previews, and overlays;
- Rhodes Island, Lungmen, Penguin Logistics, Rhine Lab, and Reunion particle marks with structure-complete orthogonal layouts and independent five-level conversation/hero density;
- a staged P.R.T.S. startup sequence on manual theme enable and activated-theme refresh, using the original P.R.T.S. mark, progress telemetry, a compact phone treatment, and a reduced-motion completion state;
- desktop, tablet, phone, reduced-motion, and reduced-transparency accommodations;
- no runtime network requests, analytics, or telemetry.

## Settings architecture

The Rhodes Island emblem at the upper left opens the complete appearance panel. It provides three presets and manual groups for environment texture, particle marks, interface material, accessibility, and conversation navigation. Conversation navigation configures the scale rail’s maximum distance from the left sidebar and keeps a spatial cross-section visible for the selected distance, automatic centering, or a specific hidden reason. Range input updates this preview while dragging and saves the preference when the interaction completes. Manual edits display `CUSTOM`; presets do not change the scale distance.

“Settings → Plugins → P.R.T.S.” contains only the theme and startup-animation switches in the standard host layout. The animation preference remains editable while the theme is disabled or safe mode is active; the Rhodes Island emblem continues to own the complete appearance controls.

Preferences still use the `dsh.ui.prts.v1` browser key, now with a v6 payload. Existing v1/v2/v3/v4/v5 values migrate automatically, including the old split glass flags, `liquid`, `full` motion, and retired organic/hex particle settings.

## Floating surface compatibility

The theme owns only P.R.T.S. UI and Harness surfaces that are stably linked to recognized host controls through `aria-controls`, `aria-describedby`, or `aria-owns`. Unknown Body Portals and menus, tooltips, toasts, dialogs, or drawers created by other plugins keep their original DOM and styling.

A third-party plugin may explicitly opt in by setting `data-prts-surface="menu|listbox|popover|dialog"` on the surface or its Portal root. Adding, changing, and removing the attribute is supported at runtime. `menu`, `listbox`, and `popover` may use the selected glass level; `dialog` always uses an opaque panel without live backdrop blur to avoid jank on large right-side surfaces. `data-prts-preserve-popup-style` remains available as an explicit opt-out for one compatibility cycle.

## Build

Node.js 18 or newer is required:

```bash
npm ci
npm run check
npm run pack:plugin
```

The package is emitted as `ash-qw-dsh-theme-prts-0.1.92.tgz`. Its npm distribution name is `@ash-qw/dsh-theme-prts`; both `cordis.patch.yml` and the client ModuleLoader ID use that package name while the internal runtime plugin ID remains `dsh-theme-prts`.

## Public npm package

The installable tarball can be downloaded directly from npmjs.org without a GitHub login or access token:

```bash
npm pack @ash-qw/dsh-theme-prts@0.1.92
```

When a maintainer pushes a tag matching `package.json` to the public repository, GitHub Actions publishes through npm Trusted Publishing (OIDC) with provenance. The workflow does not publish from the private mirror. For example:

```bash
git tag v0.1.92
git push public v0.1.92
```

Version `0.1.35` came from an outdated code branch and shipped an incorrect package name in `cordis.patch.yml`. Version `0.1.66` fixed the Host patch but not the client ModuleLoader ID, `0.1.67` aligned all three package names, `0.1.68` kept the base theme active while Operations Shell mounting was deferred, and `0.1.69` stopped occupying the host's shared details sidebar. Version `0.1.70` added workspace city silhouettes, the session recording waveform, refresh startup takeover, and structure-complete orthogonal particle emblems. Version `0.1.73` retains general floating-surface takeover and composer overflow, applies startup-animation theme styles immediately, and defers non-startup work such as particle fields and interface adapters until native boot completes.

## Docker install

```bash
docker cp ash-qw-dsh-theme-prts-0.1.92.tgz deepseek-harness:/workspace/
docker exec deepseek-harness dsh plugin --profile web add /workspace/ash-qw-dsh-theme-prts-0.1.92.tgz
docker restart deepseek-harness
```

Enable the theme from “Settings → Plugins → P.R.T.S.,” then use the upper-left Rhodes Island emblem for the complete appearance controls. The plugin persists under `/data/profiles/web`.

## Read-only live acceptance

```bash
PRTS_LIVE_TARGET=<NAS-IP>:3080 npm run test:e2e:live
```

The suite temporarily proxies trusted `127.0.0.1:3080` to the target without changing Docker networking, reverse proxy, or DNS. Without `PRTS_LIVE_WRITE`, it creates no session and performs no model call.

## Recovery and removal

Append `?prts-safe=1` to block all visual mounts while retaining the basic switches and recovery note under “Settings → Plugins → P.R.T.S.” Deleting `dsh.ui.prts.v1` returns the next load to the default disabled state.

```bash
docker exec deepseek-harness dsh plugin --profile web remove dsh-theme-prts
docker restart deepseek-harness
```

Other installed skins are not modified. Avoid enabling multiple full-page themes at once because their CSS may conflict.

## Rights

Original code is provided under the MIT License. Third-party names, character images, emblems, and derivative material are outside the MIT grant, and this project grants no downstream rights in that material. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
