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

- **Starting with theme `3.0.0`, the current maintenance line declares support only for DeepSeek Harness `0.2.2-rc.1`.** `engines.dsh` in `package.json` is restricted to that exact version. Other versions, including later release candidates, are not covered.
- Verification targets the local `0.2.2-rc.1` Web deployment, with recorded checks for the new main panel, workspace and session cards, message styling, Baker avatars, composer, overlays, transparent backgrounds, and mobile drawers. This is not exhaustive acceptance testing. The official desktop client uses the same theme package, but that version has not received real-device desktop verification; older desktop results are not a guarantee for the new version.
- The host defaults to “Replies After Collapse → All replies”: intermediate reply bodies remain visible while tool, reasoning, and other process content can fold. “Final answer only” still folds intermediate replies. The theme handles both modes without changing the host preference.
- **For older DSH versions, keep your existing theme version or upgrade DSH before updating the theme.** For DSH `0.2.1-rc.2`, pin `@ash-qw/dsh-theme-prts@2.6.1`, the last public theme release before adaptation for DSH `0.2.2-rc.1` began, rather than recommending `2.7.2` for that host.
- For DSH `0.2.1-rc.3` and `0.2.1-rc.5`, the last public theme release declaring support remains `@ash-qw/dsh-theme-prts@2.7.2`. Those versions are no longer verification targets. Retained DOM fallbacks and regression fixtures do not constitute a compatibility guarantee.
- For DSH `0.2.0-rc.2`, pin theme `@ash-qw/dsh-theme-prts@1.4.2`. For DSH `0.1.7-rc.2`, pin `1.0.2`. For DSH `0.1.2` or `0.1.5`, pin `0.1.102`.

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
- PRTS native hand cursors retain full press, hold, and release feedback on interactive controls without descendant-count limits. Only non-interactive areas displaying the hand cursor receive fixed-position circular ripples with varying thickness, tapered arcs, and gaps instead of cursor-frame updates, with at most three simultaneous effects and automatic cleanup. Nearby waves interfere constructively and destructively in a local shared layer. Browsers supporting SVG backdrop displacement also refract the live background across a continuous wave band, remaining visible during expansion before fading out, using one local refraction layer per click without DOM screenshots or added blur; other browsers retain arc feedback. Feedback is isolated in a shadow tree; cached wave textures and idle WebGL warmup keep renderer initialization off the click path. Until warmup finishes, or when WebGL is unavailable, independent arc feedback remains available. Clickable elements use link hands; editing, dragging, and resizing retain their respective cursors. Conversation text keeps a static I-beam and normal selection. Expanding ripples are disabled when cursor animation is off or reduced motion applies; choose System cursor under Cursor mode in theme settings;
- no runtime network requests, analytics, or telemetry.

Cursor artwork comes from [crowninggg/prts-cursor v1.1.4](https://github.com/crowninggg/prts-cursor/releases/tag/v1.1.4), extracted and adapted for web cursors. See [third-party notices](THIRD_PARTY_NOTICES.md#prts-hand-and-text-cursors) for provenance, adaptations, and licensing boundaries.

## Usage and settings

Card spine colors, at the bottom of Interaction, provides independent colors for workspace, ordinary-session, and current-session cards. Presets include Trading Post Blue (`#33ccff`), Power Plant Green (`#ccff66`), and Factory Yellow (`#ffcc00`). Custom colors use an in-page HEX / RGB editor. Edit day and night palettes independently, or share the selected palette with the Day/night shared switch; turning sharing off preserves the other palette. One Restore defaults button resets both palettes: blue for workspaces, the original light/dark grays for ordinary sessions, and yellow for the current session. Settings are saved to the current DSH instance and included in theme imports and exports; status indicators, session flow, and expansion animations are unchanged.

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

Baker’s “Group process reply avatars” option is enabled by default. Only the first visible body in each reply turn shows an avatar; final answers no longer keep a separate avatar. With the default “All replies” preference, folding tools or reasoning does not rescan avatar groups. When reply visibility changes, as in “Final answer only”, the avatar follows the first remaining visible body. User input or steering starts a new group; disabling the option restores individual avatars. Host “All replies / Final answer only” preferences and bubble alignment remain unchanged.

Theme preferences now use DSH native profile configuration. Connected pages share updates; browser storage is only a startup cache. Existing local preferences are migrated only when the Host has no saved theme configuration. Failed or conflicting writes require an explicit retry and never automatically overwrite Host values. Older DSH hosts may expose memory-only settings for remote access; these cannot be reported as durable saves. Reload the server-side plugin after upgrading to register its configuration schema. Avatar and emblem assets keep their existing server storage.

### Custom conversation backgrounds

Under Appearance → Conversation background, choose the default surface, separate left sidebar/content images, or a single full background. In split mode, a content image is anchored to the stable frame, so opening the sidebar does not rescale it. Without a separate left sidebar image, translucent material reveals the content image; a configured left sidebar image still appears on its own. The right sidebar also uses translucent material over a content or full background. Images use centered cover sizing with an adjustable readability mask. Switching modes retains images; removal deletes the selected asset. PNG, JPEG, WebP and AVIF uploads are limited to 10 MB and 40 million pixels, converted to WebP within 3840×2160, and stored in `$DSH_HOME/plugins/dsh-theme-prts/backgrounds`. Replacements delete obsolete files. Mode and mask settings use native DSH configuration; assets are shared within the instance.

With custom backgrounds, material transparency is independently adjustable for the left sidebar, right sidebar, settings rail, Baker bubbles, and Classic user messages (defaults: 94%, 94%, 70%, 50%, 50%; higher values are more transparent). The left and right sidebar settings are independent; older configurations without right sidebar values initially inherit the left values. Dials support mouse/touch dragging, arrow keys and exact percentage entry. Dragging previews locally; release saves, while Escape or pointer cancellation restores the saved value. When the matching image is active, a slider also adjusts blur from 0–32px (defaults: 8, 8, 12, 8, and 8px), previews changes immediately, and saves on release. Transparency and blur each have their own reset; blur controls stay hidden with solid backgrounds. Right sidebar glass requires a conversation or full background; settings rail glass requires a left sidebar or full background; message glass requires a conversation or full background and its matching conversation theme.

Non-conversation pages (plugins, marketplaces, settings and scheduled tasks) continue to reveal the active conversation or full wallpaper. Their base background stays transparent; one transparent, noninteractive background plate adds a default 8px blur without an extra solid fill or tint. Glass off, reduced-transparency preferences or missing backdrop-filter support do not force an opaque canvas. Existing card and third-party custom materials are left unchanged, as are conversation and sidebar materials.

Conversation theme and background use separate settings pages. Enhanced composer glass lives on the background page: optional with the default background and always active in split/full modes, preserving the previous default-mode choice. Baker's optional loading animation (off by default) replaces each streaming response body with three pulsing square dots until it settles or is interrupted. Classic messages, reasoning and tool cards remain unaffected.

Each background can have its own protected region. Open the modal editor from the image preview and drag the default box to move it, or drag its edges and corners to resize; percentage rulers are shown along the image edges. Sidebar previews compare narrow and wide tracks at the current sidebar height; conversation and full backgrounds use side-by-side landscape and portrait previews to show the crop; a notice appears only in settings when the entire region cannot fit. After saving, cover sizing stays centered unless a minimal shift is needed to keep the region visible. Oversized regions prioritize their horizontal center and vertical top, with offsets clamped to avoid empty edges. Clearing the region restores centered cropping; replacing the image clears the old region. Regions sync with images across the instance and are included in full theme exports and imports.

Background, avatar and emblem images, emblem bundles, and theme files can be dropped onto their respective upload areas. Add one file at a time; each area retains its existing type and size limits. Replacing a background opens a themed confirmation dialog showing the current and replacement images before saving.

### Theme import and export

Click **导入与导出** beside Restore defaults at the bottom of theme settings to open the transfer dialog to download a `.prts-theme.json` file. **包含自定义素材** is checked by default and includes all theme preferences, configured backgrounds, user/AI avatars, and the hero/conversation emblem selection and order. Avatars retain original images and crop parameters; emblems retain original images and editing parameters. Backgrounds use their stored WebP images. Historical assets and temporary drafts are excluded. Uncheck the option to export preferences only.

Import displays a summary before confirmation. Preferences-only files preserve destination assets; complete files replace assets and emblem order, with empty slots restoring defaults. Settings absent from older files retain their current values. Before confirmation, the importer lists fields it does not recognize and cannot preserve. Unsupported versions are rejected. The maximum file size is 160 MB. Chat data, accounts and connection credentials are not included.

Reading, exporting, importing and restoring show progress by stage. Reading and exporting can be cancelled. Cancelling an import or restore waits for the current write to settle, then attempts to roll back written assets. Cancellation is unavailable during final saving and rollback. The import or export section stays highlighted while its operation is active.

A backup download starts before each import. Keep that file for recovery after a refresh, or use **恢复导入前配置** in the current page to restore the state before the latest import. Failed imports attempt to roll back confirmed asset writes. Connection loss or concurrent edits can prevent full recovery; the UI reports failures so the saved backup can be imported after checking the current state.


### Set backgrounds from a DSH conversation

Ask the AI to use an uploaded picture, generate one, or find and download one with the tools available in that conversation. For locally generated/downloaded images, use `read_image` first, then `prts_background_inspect` to obtain the attachment ID. Images returned directly by conversation tools also work; no manual re-upload is needed. These background tools do not themselves search, generate, or fetch URLs.

- `prts_background_inspect`: inspect images, dimensions, protected regions, image revision, current profile settings/revision, and available conversation attachments.
- `prts_background_apply`: replace/remove a full, sidebar, or conversation image, or change its protected region. Use the image revision. Region coordinates are normalized to the EXIF-oriented image; replacing clears the old region unless a new one is supplied.
- `prts_background_configure`: update only the specified mode (`off/split/full`) and dimming (`0..0.9`, higher means more faded), using `settings.revision`. Optional `material.blur` (integer pixels, 0..32) and `material.opacity` (0..1, higher means more opaque) support `sidebar`, `rightSidebar`, `rail` (settings rail), `baker` (Baker bubbles), and `classicUser` (classic user messages). Inspect returns these values and the conversation style. Bubble materials require the matching conversation style and a full or conversation wallpaper; saving values does not activate either. Only supplied fields change; invalid values are rejected.

Saving an image and enabling its mode are separate steps; check the returned `activeSlots`. The theme master switch is never enabled automatically. Images are instance-wide; mode and dimming sync within the profile. Existing format/size limits apply. Replacing/removing deletes the old image, whereas switching to the default background retains assets. Conflicts require a fresh inspection. All three tools follow the existing AI customization switch.


### Import and export themes from a conversation

`prts_theme_export` returns a downloadable `.prts-theme.json` attachment, including assets by default (`includeAssets: false` exports settings only). Upload a theme file or use a file attachment returned by a tool in the same conversation, then call `prts_theme_import_preview` to see the summary, settings changes, replacement scope, and ignored fields. Without an attachment ID, it lists JSON files in that conversation.

After the user authorizes importing, call `prts_theme_import` with the preview ID. Previews expire after 15 minutes, are conversation-specific, and become stale when settings or relevant assets change. A backup attachment must be saved before any changes. Failed or cancelled imports attempt to roll back confirmed asset writes and return the error and backup; concurrent edits can prevent complete recovery.

Files interoperate with the settings UI, with the same 160 MB limit. Full exports include background protected regions, avatar originals/crops, and emblem sources/order. Settings-only imports retain assets, and missing older settings retain current values. Settings affect the profile; assets affect the instance. Imported settings can disable the theme or AI tools, so review the preview. Export and backup attachments can be imported again.


### Tool status and background visual previews

`prts_theme_status` remains available when AI customization is off. It reports only the switch status and manual activation instructions. The 12 customization tools are removed while disabled; agents are instructed to ask the user to enable the switch under the Rhodes Island emblem → AI tools, rather than enable it themselves or bypass it with shell, HTTP, or file edits. Execution guards reject stale customization calls after disabling. This guides agent behavior; it does not sandbox other general-purpose tools in the conversation.

Image lists now sort by last appearance, expose `lastSeenOrder`, event-backed `lastSeenAt` when available, and `latestForName`. These describe conversation appearances, not filesystem modification times.

`prts_background_preview` previews either an attachment or a saved background without applying it. It defaults to the current dimming and both light/dark schemes, since the server cannot infer the active browser scheme. Width/height, dimming, scheme, and protected region can be overridden. Candidate images use the same orientation, resizing, and WebP pipeline as saving. Outputs simulate cover cropping and sRGB dimming, with crop coordinates rounded to source pixels; they exclude text, bubbles, and glass materials and are not live screenshots. PNG file attachments are returned, with image content also supplied to vision-capable models. Preview receipts are excluded from source image discovery.

Full imports delete replaced background WebP files and replace avatar originals; backups contain recovery data. Each custom emblem creates a new draft/preview, while identical source bytes share content-addressed storage. At roughly 200 drafts, older unprotected drafts are pruned; applied emblems remain protected. Repeated full imports grow the draft count. Import previews report these effects explicitly.

When the host exposes runtime context registration, each model request also receives the current switch state and these handling instructions proactively.

### Experimental cursor and upgrade behavior

**PRTS Follow cursor (experimental) has been removed because it performed poorly in real-device testing.** Interaction settings now offer only System cursor and PRTS Native cursor. The DOM-following implementation and its Mouse Follower / GSAP dependencies are no longer bundled. Saved or imported follow cursor preferences run as PRTS Native cursor without changing other colors or appearance settings. New installations default to PRTS Native cursor.

Upgrading the theme from `2.6.1` to `2.7.0` automatically falls back from the experimental follow cursor to PRTS Native cursor without manual configuration changes. System cursor and PRTS Native cursor are unaffected. Loading an old preference alone does not write the fallback back to the server. If the follow cursor is required, keep theme `2.6.1` paired with one of its supported DSH versions: `0.2.1-rc.2`, `0.2.1-rc.3`, or `0.2.1-rc.5`. Theme `2.6.1` does not declare support for DSH `0.2.2-rc.1`.
