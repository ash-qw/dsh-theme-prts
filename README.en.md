# dsh-theme-prts

A personal, non-commercial Arknights / P.R.T.S. fan UI plugin for DeepSeek Harness Web and the official desktop client. It keeps Harness behavior and data flow intact while presenting workspaces, sessions, and conversations as a Rhodes Island facility terminal.

> [!IMPORTANT]
> This is an unofficial, personal Arknights fan theme. It is not affiliated with, sponsored by, authorized by, or endorsed by Shanghai Hypergryph Network Technology Co., Ltd. or any regional publisher.
>
> The MIT License covers only original code created for this project. Certain recognizable Arknights names, character images, emblems, and derivative material included in the package are outside the MIT grant. This project grants users no right to copy, modify, redistribute, sublicense, or commercially use that third-party material.
>
> Public availability of source material does not itself grant permission to reuse or redistribute it, and free or non-commercial use is not automatically authorized. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for provenance and licensing boundaries.
>
> This project and its release packages may be suspended, restricted, or have relevant material removed at any time in response to a rights-holder request, platform policy, or maintainer decision. Continued availability is not guaranteed.

The theme is disabled by default.

## Compatibility

- Supports DeepSeek Harness `0.2.0-rc.2` on Web and the official desktop client. The Web version has been verified locally, and the official desktop client has been verified through actual use. The earlier `0.1.7`, `0.1.5`, and `0.1.2` release lines are no longer in the compatibility declaration.
- The theme has been checked on a live `0.2.0-rc.2` page for mounting, workspaces, session cards, and the composer. Browser regression tests cover the native conversation width control, session status, and pending interaction indicators.
- `engines.dsh` in `package.json` uses the same exact version for plugin market compatibility checks. Other DSH versions require separate verification.
- For DSH `0.1.7-rc.2`, pin theme `@ash-qw/dsh-theme-prts@1.0.2`. For DSH `0.1.2` or `0.1.5`, pin theme `@ash-qw/dsh-theme-prts@0.1.102`.

## Install and update

Web and the official desktop client use the same theme package, `@ash-qw/dsh-theme-prts`; no separate desktop edition is needed.

For Web command-line installation, run the following in an environment where DSH Web already runs normally:

```bash
npx @deepseek-ai/dsh plugin --profile web add @ash-qw/dsh-theme-prts
```

Restarting your DSH Web service or official desktop client after installation or update is recommended to ensure the theme is fully loaded. Then enable it under “Settings → Plugins → P.R.T.S.” The Rhodes Island emblem at the upper left of the main interface opens the complete appearance controls.

The theme is published publicly on npm and requires no GitHub login or access token. Run the install command again to update to `latest`; to pin a release, use `@ash-qw/dsh-theme-prts@<version>`. If the command reports `pnpm not found`, install pnpm first.

## Current feature set

- Facility-style P.R.T.S. / Rhodes Island / RIIC workspaces, sessions, and conversations;
- day/night modes synchronized with Harness, three appearance presets, and four material levels;
- city silhouettes, faction particle marks, session waveforms, and a P.R.T.S. startup sequence;
- computer, tablet, and phone screen layouts, with reduced-motion and reduced-transparency accommodations;
- PRTS hand cursors with press, hold, and release feedback (large background containers stay static to avoid long-conversation stalls), link hand cursors for clickable elements, four static resize directions, and a static I-beam cursor over text fields and conversation text; turn off “PRTS 光标” in theme settings to use system cursors;
- no runtime network requests, analytics, or telemetry.

Cursor artwork comes from [crowninggg/prts-cursor v1.1.4](https://github.com/crowninggg/prts-cursor/releases/tag/v1.1.4), extracted and adapted for web cursors. See [third-party notices](THIRD_PARTY_NOTICES.md#prts-hand-and-text-cursors) for provenance, adaptations, and licensing boundaries.

## Usage and settings

“Settings → Plugins → P.R.T.S.” provides the theme and startup-animation switches. The Rhodes Island emblem at the upper left of the main interface provides presets, environment texture, particle marks, interface material, navigation, and accessibility controls.

The appearance panel has four pages: Appearance, Interaction, Session Flow, and Particle Effects. Switching pages preserves each page’s scroll position and unfinished emblem edits. On narrow screens, tabs appear above the content; arrow keys also switch pages.

Under Particle Effects → Emblem Management, configure the new-session emblem independently from the conversation rotation list. Mix built-in and uploaded images in the list, preview or replace individual entries, add or remove entries (1–12). Long-press anywhere on an emblem card to drag it into a new position; release to save or press Escape to cancel. Keyboard users can press Space on the thumbnail, use arrow keys to reorder, and press Enter to save. Each area can be restored independently. Upload a PNG, WebP, or JPEG and adjust extraction, threshold, scale, and crop position before applying. The Line Art mode extracts image edges and samples them separately at each particle density; higher thresholds retain fewer details. Choose color-image contours or existing ink strokes; output strokes are thinned on each density grid. A separate cleanup control removes isolated short strokes; set it to 0 to retain small facial details. Simplifying backgrounds and textures first improves complex portraits. Conversation emblems retain scroll-driven rotation, interaction, and reassembly. Images are uploaded to the current DSH host and processed in a separate worker thread. Sources, parameters, drafts, and applied settings are stored under `$DSH_HOME/plugins/dsh-theme-prts/emblems`, shared across workspaces, sessions, and browsers connected to that instance. Saved emblems remain editable and pages synchronize automatically. The theme does not send images to third-party image services. Images are limited to 8 MB and 16 megapixels; transparent logos or monochrome silhouettes work best.

Click Export Asset on a custom emblem to download a single `.prts-emblem.json` package containing its source image and editing parameters. In another DSH instance, choose Add Emblem or Preview / Replace, then import the package and review it before applying. Imported emblems remain editable; importing does not automatically overwrite the hero or rotation list. Packages are limited to 12 MB; particles are rebuilt from the original parameters on import.

In any DSH session where the tools are allowed, upload an image and ask the AI to preview it as a PRTS particle emblem. `prts_emblem_inspect`, `prts_emblem_preview`, and `prts_emblem_apply` let the AI adjust extraction, threshold, scale, and crop, then apply a draft to the new-session emblem or conversation rotation list. Images generated or edited by AI can also be used: read the workspace image with `read_image`, then call inspect to obtain its attachment ID, without asking the user to reupload it. Only images uploaded or returned by tools in the current session are accepted; particle previews returned by the emblem tool are excluded as sources. Use `mode: lineart` for outline dot art, `lineSource: edges` for color-image contours or `lineSource: ink` for existing ink strokes, and `cleanup: 0..12` for isolated-stroke filtering. Previews do not change applied settings; conflicting writes require a fresh read. Previews appear in native chat tool cards; image-capable models also receive the preview as image input. Redrawing still requires an image-editing tool in that session. Around 200 recent drafts are retained, while editing sources for applied emblems are protected. Server-side processing requires Node.js 20.9 or later.

The theme does not proactively restyle menus, dialogs, or overlays created by third-party plugins.

## Recovery and removal

Append `?prts-safe=1` to block all visual mounts while retaining the basic switches and recovery note under “Settings → Plugins → P.R.T.S.” Deleting `dsh.ui.prts.v1` returns the next load to the default disabled state.

```bash
npx @deepseek-ai/dsh plugin --profile web remove @ash-qw/dsh-theme-prts
```

Restarting DSH Web after removal is recommended. Browser theme preferences are retained. Avoid enabling multiple full-page themes at once because their CSS may conflict.

## Development

Node.js 20.9 or newer is required (Node.js 24 is recommended, matching DSH):

```bash
npm ci
npm run check
```

See [CHANGELOG.md](CHANGELOG.md) for release history and [RELEASING.md](RELEASING.md) for maintainer release instructions.
