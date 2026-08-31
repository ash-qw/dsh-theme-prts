import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { promisify } from 'node:util'

import { normalizePreferences } from '../src/client/preferences.js'
import { createSettingsPage } from '../src/client/settings-page.js'

const execFileAsync = promisify(execFile)

test('drops legacy contour controls while preserving the selected ambient texture mode', () => {
  const migrated = normalizePreferences({
    version: 1,
    enabled: true,
    texture: 'restrained',
    contourLight: '#abcdef',
    contourDark: '#fedcba',
    contourOpacity: 0.5,
  })
  assert.equal(migrated.texture, 'restrained')
  assert.equal(Object.hasOwn(migrated, 'contourLight'), false)
  assert.equal(Object.hasOwn(migrated, 'contourDark'), false)
  assert.equal(Object.hasOwn(migrated, 'contourOpacity'), false)
})

test('plugin settings remain a minimal host surface without removed contour controls', () => {
  const React = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }) }
  const Page = createSettingsPage(React)
  const preferences = normalizePreferences({ enabled: true })
  const tree = Page({
    useStore: select => select({ preferences }),
    updatePreference() {},
    resetPreferenceGroup() {},
    resetPreferences() {},
  })
  const text = []
  const visit = node => {
    if (typeof node === 'string') text.push(node)
    else if (node && typeof node === 'object') for (const child of node.children ?? []) visit(child)
  }
  visit(tree)
  assert.ok(text.includes('完整外观设置位于主界面左上角的罗德岛徽记。'))
  assert.ok(text.includes('启用 P.R.T.S. 主题'))
  assert.ok(text.includes('播放启动动画'))
  for (const removed of ['仿等高线', '等高线颜色', '日间颜色', '夜间颜色', '等高线强度']) {
    assert.equal(text.includes(removed), false)
  }
})

test('CSS and browser bundle ship particle and ambient layers without topographic assets', async () => {
  await execFileAsync(process.execPath, ['scripts/build.mjs'], { cwd: new URL('..', import.meta.url) })
  const [css, client] = await Promise.all([
    readFile(new URL('../src/styles/prts.css', import.meta.url), 'utf8'),
    readFile(new URL('../lib/client.js', import.meta.url), 'utf8'),
  ])
  for (const source of [css, client]) {
    assert.match(source, /data-prts-ambient-layer/)
    assert.match(source, /data-prts-particle-layer/)
    assert.doesNotMatch(source, /data-prts-terrain-layer|topographic-map\.svg|topographic-tech\.svg/)
  }
  assert.match(client, /function createParticleFieldAdapter\(/)
  for (const key of ['rhodes-island', 'lungmen', 'penguin-logistics', 'rhine-lab', 'reunion']) {
    assert.match(client, new RegExp(`"key":"${key}"`))
  }
  assert.match(client, /emblems: \[/)
  assert.match(client, /emblem: "<svg/)
  assert.doesNotMatch(client, /aria-hidden="true">△/)
})
