# Third-Party and Franchise Material Notices

This file records provenance and licensing boundaries only. It does not establish or imply permission to include, publish, or redistribute any third-party material listed below.

## Code

The JavaScript, CSS, build scripts, tests, and original DSH-specific vector interface work in this package are licensed under the MIT License in `LICENSE`.

### Adaptive conversation jump reference

The conversation-scale sticky-bottom release, distance-aware scrolling, and landing-verification strategy was independently adapted with reference to [`Wine-Red/dsh-codex-timeline`](https://github.com/Wine-Red/dsh-codex-timeline) at commit [`eb078c58a7662db231c5b8dd5d867f80b0b256af`](https://github.com/Wine-Red/dsh-codex-timeline/tree/eb078c58a7662db231c5b8dd5d867f80b0b256af).

That project is distributed under the MIT License:

- Copyright (c) 2026 DeepSeek
- Copyright (c) 2026 dsh-codex-timeline contributors
- License: [`MIT`](https://github.com/Wine-Red/dsh-codex-timeline/blob/eb078c58a7662db231c5b8dd5d867f80b0b256af/LICENSE)

The implementation in this package remains theme-local and does not load or depend on the referenced plugin at runtime.

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
