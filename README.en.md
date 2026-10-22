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

The Baker conversation theme is inspired by the messenger in Arknights: Endfield. Select Baker under Appearance, then click either avatar to upload, crop, or restore its default. Original images and crop positions are stored on the server and shared within the same DSH instance, allowing later re-cropping. Drag to reposition and use the slider, mouse wheel, or trackpad to zoom. Changes apply after confirmation. Animated images use the first frame; each upload is limited to 5 MB.

## Compatibility

- Supports DeepSeek Harness `0.2.1-rc.2` on Web and the official desktop client. Web was verified on a live local container; the desktop client received a real-device check with no basic functionality issues found. The earlier `0.2.0-rc.2`, `0.1.7`, `0.1.5`, and `0.1.2` release lines are outside the current compatibility declaration.
- The theme has been checked on a live Web `0.2.1-rc.2` page for mounting, workspaces and session cards, long-title hover behavior, the native conversation width drag control, and narrow-window layout. Browser regression tests cover session status and pending interaction indicators.
- `engines.dsh` in `package.json` uses the same exact version for plugin market compatibility checks. Other DSH versions require separate verification.
- For DSH `0.2.0-rc.2`, pin the previous public theme release `@ash-qw/dsh-theme-prts@1.4.2`. For DSH `0.1.7-rc.2`, pin `1.0.2`. For DSH `0.1.2` or `0.1.5`, pin `0.1.102`.

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

The appearance panel has four pages: Appearance, Interaction, Session Flow, and Particle Effects. Switching pages preserves each page’s scroll position. On narrow screens, tabs appear above the content; arrow keys also switch pages.

Under Particle Effects → Emblem Management, configure the new-session emblem independently from the conversation rotation list. Mix built-in and uploaded images in the list, preview or replace individual entries, add or remove entries (1–12). Long-press anywhere on an emblem card to drag it into a new position; release to save or press Escape to cancel. Keyboard users can press Space on the thumbnail, use arrow keys to reorder, and press Enter to save. Adding or editing an emblem opens a separate modal with a side-by-side desktop layout and a stacked narrow-screen layout. Drag the pattern within the preview frame to position the crop; translation changes only particle positions and visibility, preserving the dot pattern. Arrow keys provide fine adjustments, Center resets the position, and the zoom slider controls scale. Closing prompts before discarding unapplied edits and returns to the original list position. Each area can be restored independently. If it contains custom emblems, restoration first lists the affected assets with individual export buttons and requires explicit confirmation. Export and save the files before restoring; otherwise those assets cannot be recovered from that area of the settings. Upload a PNG, WebP, or JPEG and adjust extraction, threshold, scale, and crop position before applying. The Line Art mode extracts image edges and samples them separately at each particle density; higher thresholds retain fewer details. Choose color-image contours or existing ink strokes; output strokes are thinned on each density grid. A separate cleanup control removes isolated short strokes; set it to 0 to retain small facial details. Simplifying backgrounds and textures first improves complex portraits. Conversation emblems retain scroll-driven rotation, interaction, and reassembly. Images are uploaded to the current DSH host and processed in a separate worker thread. Sources, parameters, drafts, and applied settings are stored under `$DSH_HOME/plugins/dsh-theme-prts/emblems`, shared across workspaces, sessions, and browsers connected to that instance. Saved emblems remain editable and pages synchronize automatically. The theme does not send images to third-party image services. Images are limited to 8 MB and 16 megapixels; transparent logos or monochrome silhouettes work best.

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

### Set Baker avatars from a DSH conversation

Upload an image and ask the AI to set it as your Baker avatar, or have it generate/edit an image first. `prts_avatar_inspect` reads current configuration and conversation images; `prts_avatar_apply` replaces user/AI avatars, re-crops the current original, or restores defaults. Changes are shared within the DSH instance. Replacing an avatar discards its previous original. Avatars appear in Baker mode; tools do not change the device-local conversation theme.

Theme preferences now use DSH native profile configuration. Connected pages share updates; browser storage is only a startup cache. Existing local preferences are migrated only when the Host has no saved theme configuration. Failed or conflicting writes require an explicit retry and never automatically overwrite Host values. Older DSH hosts may expose memory-only settings for remote access; these cannot be reported as durable saves. Reload the server-side plugin after upgrading to register its configuration schema. Avatar and emblem assets keep their existing server storage.

### Custom conversation backgrounds

Under Appearance → Conversation background, choose the default surface, separate sidebar/content images, or a single full background. Images use centered cover sizing with an adjustable readability mask. Switching modes retains images; removal deletes the selected asset. PNG, JPEG, WebP and AVIF uploads are limited to 10 MB and 40 million pixels, converted to WebP within 3840×2160, and stored in `$DSH_HOME/plugins/dsh-theme-prts/backgrounds`. Replacements delete obsolete files. Mode and mask settings use native DSH configuration; assets are shared within the instance.

With custom backgrounds, material transparency is independently adjustable for the session sidebar, settings rail, Baker bubbles, and Classic user messages (defaults: 94%, 70%, 50%, 50%; higher values are more transparent). Dials support mouse/touch dragging, arrow keys and exact percentage entry. Dragging previews locally; release saves, while Escape or pointer cancellation restores the saved value. When the matching image is active, a slider also adjusts blur from 0–32px (defaults: 8, 12, 8, and 8px), previews changes immediately, and saves on release. Transparency and blur each have their own reset; blur controls stay hidden with solid backgrounds. Rail glass appears and takes effect only in full-background mode; message glass requires a conversation or full background and its matching conversation theme.

Conversation theme and background use separate settings pages. Enhanced composer glass lives on the background page: optional with the default background and always active in split/full modes, preserving the previous default-mode choice. Baker's optional loading animation (off by default) replaces each streaming response body with three pulsing square dots until it settles or is interrupted. Classic messages, reasoning and tool cards remain unaffected.

Each background can have its own protected region. Open the modal editor from the image preview and drag the default box to move it, or drag its edges and corners to resize; percentage rulers are shown along the image edges. Sidebar previews compare narrow and wide tracks at the current sidebar height; conversation and full backgrounds use side-by-side landscape and portrait previews to show the crop; a notice appears only in settings when the entire region cannot fit. After saving, cover sizing stays centered unless a minimal shift is needed to keep the region visible. Oversized regions prioritize their horizontal center and vertical top, with offsets clamped to avoid empty edges. Clearing the region restores centered cropping; replacing the image clears the old region. Regions sync with images across the instance and are included in full theme exports and imports.

### Theme import and export

Click **导入与导出** beside Restore defaults at the bottom of theme settings to open the transfer dialog to download a `.prts-theme.json` file. **包含自定义素材** is checked by default and includes all theme preferences, configured backgrounds, user/AI avatars, and the hero/conversation emblem selection and order. Avatars retain original images and crop parameters; emblems retain original images and editing parameters. Backgrounds use their stored WebP images. Historical assets and temporary drafts are excluded. Uncheck the option to export preferences only.

Import displays a summary before confirmation. Preferences-only files preserve destination assets; complete files replace assets and emblem order, with empty slots restoring defaults. Settings absent from older files retain their current values. Unsupported versions are rejected. The maximum file size is 160 MB. Chat data, accounts and connection credentials are not included.

A backup download starts before each import. Keep that file for recovery after a refresh, or use **恢复导入前配置** in the current page to restore the state before the latest import. Failed imports attempt to roll back confirmed asset writes. Connection loss or concurrent edits can prevent full recovery; the UI reports failures so the saved backup can be imported after checking the current state.
