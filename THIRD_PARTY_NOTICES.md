# Third-Party and Franchise Material Notices

English | [简体中文](THIRD_PARTY_NOTICES.zh-CN.md)

This file records provenance and licensing boundaries only. It does not establish or imply permission to include, publish, or redistribute any third-party material listed below.

## Code

The JavaScript, CSS, build scripts, tests, and original DSH-specific vector interface work in this package are licensed under the MIT License in `LICENSE`.

## Arknights-identifying third-party material

“Arknights”, Rhodes Island, P.R.T.S., RIIC, and related names, characters, symbols, and visual identities are associated with their respective rights holders, including Hypergryph and the game's regional publishers.

The following packaged material is expressly excluded from the MIT License:

- `src/assets/faction-emblems/*.png` — unmodified transparent faction marks obtained from Hypergryph's public Arknights official page (`https://ak.hypergryph.com/`) for Rhodes Island, Lungmen, Penguin Logistics, Rhine Lab, and Reunion. Public accessibility of the source files does not itself grant reuse or redistribution rights;
- `src/assets/rhodes-dsh.svg` — a derivative redraw based on the recognizable Rhodes Island emblem and used by the P.R.T.S. top bar;
- `src/assets/prts-original-avatar.png` — the original 180×180 P.R.T.S. avatar obtained from the referenced Arknights Wiki page at `https://arknights.wiki.gg/wiki/File:PRTS.png`. The wiki page's fair-use designation is specific to that page and does not grant this package or its users permission to reuse or redistribute the image;
- franchise-identifying labels and UI motifs used to create the fan-theme presentation.

The P.R.T.S. avatar, faction marks, and derivative emblem are included only in the personal, non-commercial fan-theme build and are not relicensed. Free or non-commercial use does not itself establish permission from a rights holder.

No license to copy, modify, redistribute, sublicense, or commercially use the excluded material is granted by this project. Any permission required for that material must come from the applicable rights holder. This notice does not itself make inclusion or public distribution of the packaged material authorized.

## Affiliation and ownership

This project is unofficial and does not claim endorsement, affiliation, authorization, or ownership of the underlying franchise. All underlying character, artwork, symbol, trademark, and franchise rights remain with their respective rights holders, including Hypergryph and the game's regional publishers.

## Policy references

For reference, the Arknights global website publishes [Terms and Conditions of Re-creation](https://www.arknights.global/fankit/guidelines) and separate [Fan Kit Terms and Conditions of Use](https://www.arknights.global/fankit/precautions). Those terms may change, may be region- or material-specific, and do not constitute project-specific permission for this package.

## Rights-holder requests

An applicable rights holder or authorized representative may submit a removal or attribution request through the repository's issue tracker. To help identify and review the request, it should identify the requester, the affected files or material, the relevant rights, and a means of follow-up contact.

After receiving a verifiable request, the project maintainer will review it promptly and may suspend public distribution of an affected release, remove or replace the relevant material, or update attribution and provenance records. This process does not imply that the material was previously authorized and does not limit or waive any rights or remedies of a rights holder.

## PRTS hand, text and resize cursors

- Files: `src/assets/cursors/prts-hand*.png`, `prts-link*.png`, `prts-text*.png`, `prts-resize-*.png`, `prts-grab.png`, `prts-grabbing.png`, `prts-not-allowed.png` and `animation.json`.
- Source: embedded `PRTS-Replica-v8-96x-normal.cur`, `normal_hold.cur`, `normal_press.ani`, `normal_release.ani`, `beam.cur`, `beam_click.ani`, `link.cur`, `link_hold.cur`, `link_press.ani`, `link_release.ani` and `sel_1_static.cur` through `sel_4_static.cur` resources in `程序文件/PRTS-Setup.exe` from [crowninggg/prts-cursor v1.1.4, PRTS-Windows-1.1.4.zip](https://github.com/crowninggg/prts-cursor/releases/tag/v1.1.4), retrieved 2026-10-09. Resources were read without executing the installer.
- Adaptation: each 96×96 hand frame is cropped to (18, 10, 82, 84) and resized to 42×48. Source hotspot (28, 20) maps to (7, 6). ANI frame durations are preserved in the manifest; terminal 60-second hold frames are represented by static held/resting states at runtime. Text frames retain the full 96×96 canvas, resized to 48×48 with hotspot (24, 24). Link frames are cropped to (18, 10, 96, 96), resized to 51×56 with hotspot (7, 7), retaining the arrow. The four static resize cursors retain the full canvas, resized to 32×32 with hotspot (16, 16). Text click frames remain in the source archive but are no longer bundled or played. Continuous text-loop variants are not included.
- Upstream Credits.txt describes an unofficial personal derivative tool and attributes Arknights character/interface assets to their original rights holders. No explicit redistribution license for this artwork was found in the inspected package. This artwork is excluded from this project's MIT license; inclusion does not grant rights to the underlying artwork.

- Grab and unavailable assets added on 2026-10-12 from the same release: `grab_enter_0011.cur` and `grab_loop_0000.cur` provide static grab/grabbing states, cropped to (18, 40, 86, 96) and resized to 45×37 with a web hotspot at the hand center (22, 19). `unavail1_static.cur` provides the unavailable state, cropped to (18, 10, 96, 96) and resized to 51×56 with hotspot (7, 7). The installer was not executed; loop animations are not played.

## Markdown preview rendering

Session hover previews use [markdown-it](https://github.com/markdown-it/markdown-it) 14.3.2 (MIT).
The browser build includes entities, linkify-it, mdurl, punycode.js, and uc.micro.
Their copyright and license notices are retained in the generated lib/client.js.
This is a build-time dependency; DSH does not need to install it separately at runtime.
Raw HTML and remote image loading are disabled in previews.
