import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

const [sourceCss, sourceShell, clientBundle] = await Promise.all([
  readFile(new URL('../src/styles/prts.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/client/operations-shell-v2.js', import.meta.url), 'utf8'),
  readFile(new URL('../lib/client.js', import.meta.url), 'utf8'),
])

test('macOS windowed rail brand owns the window chrome inset', () => {
  assert.match(
    sourceCss,
    /\[data-platform=darwin\]:not\(\[data-fullscreen\]\) \[data-prts-nav-rail\]\s*\{\s*padding-top:\s*0;\s*\}/,
    'rail should not reserve the top inset with padding',
  )
  assert.match(
    sourceCss,
    /\[data-platform=darwin\]:not\(\[data-fullscreen\]\) \[data-prts-rail-brand\]\s*\{\s*box-sizing:\s*border-box;\s*height:\s*96px;[\s\S]*?padding-top:\s*32px;\s*\}/,
    'settings button should own the 32px chrome inset and stay 96px tall',
  )
})

test('rail and committed client bundle declare window drag exclusion', () => {
  assert.match(sourceShell, /<nav id="prts-nav-rail" data-prts-nav-rail data-window-drag-exclude/)
  assert.match(clientBundle, /<nav id="prts-nav-rail" data-prts-nav-rail data-window-drag-exclude/)
})

test('committed client bundle carries the tall brand rules', () => {
  assert.match(clientBundle, /\[data-prts-nav-rail\]\{padding-top: 0\}/)
  assert.match(clientBundle, /\[data-prts-rail-brand\]\{box-sizing: border-box; height: 96px; padding-top: 32px\}/)
})
