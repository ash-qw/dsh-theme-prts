import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = await readFile(new URL('../src/styles/question-record.css', import.meta.url), 'utf8')
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8')

test('question archives are bundled after shared materials and remain independent of conversation roles', () => {
  assert.ok(Buffer.byteLength(css) < 8 * 1024, 'question archive source styles stay within 8 KiB')
  assert.match(build, /readFile\(resolve\(root, 'src\/styles\/question-record.css'\), 'utf8'\)/)
  assert.match(build, /\$\{menuCardCss\}\\n\$\{questionRecordCss\}/)
  assert.match(css, /\[data-question-reply\]\[data-reply-outcome\]/)
  assert.doesNotMatch(css, /conversation-style|message-role|chat-flow-kind|avatar|baker-opacity|classic-user/)
  assert.doesNotMatch(css, /MutationObserver|animation:|transition:|url\(/)
})

test('question archives decorate native definition lists without reconstructing answers', () => {
  assert.match(css, /counter-reset: prts-reply-item/)
  assert.match(css, /counter-increment: prts-reply-item/)
  assert.match(css, /counter\(prts-reply-item, decimal-leading-zero\) " \/ Q&A" \/ ""/)
  assert.match(css, /> dd[\s\S]*?white-space: pre-wrap/)
  assert.match(css, /> p[\s\S]*?white-space: pre-wrap/)
  assert.match(css, /overflow-wrap: anywhere/)
  assert.doesNotMatch(css, /line-clamp|text-overflow|display: none|content:.*[✓✔]/)
  assert.match(css, /:focus-visible \{ outline: 1px solid var\(--prts-yellow\)/)
})

test('archive decoration is noninteractive and excluded from accessible copy', () => {
  for (const decoration of css.matchAll(/^\s*content:[^;]+;/gm)) {
    if (decoration[0].trim() !== 'content: "";') assert.match(decoration[0], /\/ "";/)
  }
  assert.equal((css.match(/pointer-events: none/g) ?? []).length, 5)
  assert.match(css, /:lang\(zh\)/)
  assert.match(css, /--prts-reply-caption: "PRTS \/ 问答档案"/)
  assert.doesNotMatch(css, /INTERACTION RECORD|--prts-reply-title/)
})

test('archive frames use open positioning corners without clipping content or the folder tab', () => {
  assert.match(css, /border: 1px solid transparent/)
  assert.match(css, /border-radius: 0;/)
  assert.equal((css.match(/conic-gradient\(/g) ?? []).length, 4)
  assert.match(css, /background-size: 14px 14px/)
  assert.match(css, /background-repeat: no-repeat/)
  assert.doesNotMatch(css, /prts-reply-rail|radial-gradient|overflow: hidden/)
  assert.match(css, /forced-colors: active/)
  assert.match(css, /border-color: CanvasText/)
})

test('archive materials support day/night, all glass modes and accessibility fallbacks', () => {
  assert.match(css, /rgb\(23 30 35 \/ \.74\)/)
  assert.match(css, /rgb\(235 241 243 \/ \.76\)/)
  assert.equal((css.match(/\/ \.68\)/g) ?? []).length, 2)
  for (const mode of ['soft', 'clear', 'off']) assert.ok(css.includes(`[data-prts-glass="${mode}"]`))
  assert.match(css, /data-prts-scheme="light"/)
  assert.match(css, /prefers-reduced-transparency: reduce/)
  assert.match(css, /prefers-contrast: more/)
  assert.match(css, /--prts-reply-filter: none/)
  assert.match(css, /--prts-reply-muted: var\(--prts-ink\)/)
  assert.match(css, /@media \(max-width: 560px\)/)
  assert.equal((css.match(/backdrop-filter: var\(--prts-reply-filter\)/g) ?? []).length, 2)
})
