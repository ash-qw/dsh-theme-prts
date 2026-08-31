import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

async function readText(path) {
  try {
    return await readFile(new URL(path, import.meta.url), 'utf8')
  } catch {
    return null
  }
}

async function readBytes(path) {
  try {
    return await readFile(new URL(path, import.meta.url))
  } catch {
    return null
  }
}

test('declares the rc.2 DSH client bundle contract', async () => {
  const source = await readText('../package.json')
  assert.ok(source, 'package.json should exist')
  const pkg = JSON.parse(source)
  assert.equal(pkg.name, '@ash-qw/dsh-theme-prts')
  const lock = JSON.parse(await readText('../package-lock.json'))
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/)
  assert.equal(lock.version, pkg.version)
  assert.equal(lock.packages[''].version, pkg.version)
  assert.equal(pkg.private, false)
  assert.deepEqual(pkg.publishConfig, { registry: 'https://npm.pkg.github.com' })
  assert.equal(pkg.repository.url, 'git+https://github.com/ash-qw/dsh-theme-prts.git')
  assert.deepEqual(pkg.dsh.client, { platform: 'web', immediately: true })
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.exports['./client'].default, './lib/client.js')

  const patch = await readText('../cordis.patch.yml')
  assert.ok(patch, 'cordis.patch.yml should exist')
  assert.match(patch, /id: theme-prts/)
  const patchPackageName = patch.match(/\bname:\s*['"]([^'"]+)['"]/)?.[1]
  assert.equal(patchPackageName, pkg.name, 'bundle patch package name must match package.json')
})

test('build writes Host and browser module-loader entries', async () => {
  await execFileAsync(process.execPath, ['scripts/build.mjs'], {
    cwd: new URL('..', import.meta.url),
  })
  const host = await readText('../lib/index.js')
  const client = await readText('../lib/client.js')
  const pkg = JSON.parse(await readText('../package.json'))
  const packageId = host.match(/export const PACKAGE_ID = ['"]([^'"]+)['"]/)?.[1]
  assert.equal(packageId, pkg.name, 'Host PACKAGE_ID must match package.json')
  assert.match(host, /export function apply\(\) \{\}/)
  assert.match(client, /window\.__ModuleLoader__\.load/)
  const moduleLoaderId = client.match(/window\.__ModuleLoader__\.load\(\{\s*id:\s*"([^"]+)"/)?.[1]
  assert.equal(moduleLoaderId, pkg.name, 'client ModuleLoader ID must match package.json')
})

test('Host entry imports under the package ESM contract used by rc.2', async () => {
  await execFileAsync(process.execPath, ['scripts/build.mjs'], {
    cwd: new URL('..', import.meta.url),
  })
  const host = await import(`../lib/index.js?host-contract=${Date.now()}`)
  const pkg = JSON.parse(await readText('../package.json'))
  assert.equal(host.PACKAGE_ID, pkg.name)
  assert.equal(host.THEME_PLUGIN_ID, 'dsh-theme-prts')
  assert.notEqual(host.PACKAGE_ID, host.THEME_PLUGIN_ID)
  assert.equal(typeof host.apply, 'function')
  assert.equal(host.apply(), undefined)
})

test('ships the exact P.R.T.S. original avatar used by the startup sequence', async () => {
  const bytes = await readBytes('../src/assets/prts-original-avatar.png')
  assert.ok(bytes, 'P.R.T.S. original avatar should exist')
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(bytes.readUInt32BE(16), 180)
  assert.equal(bytes.readUInt32BE(20), 180)
  assert.equal(bytes[25], 6, 'P.R.T.S. avatar must retain its RGBA transparency')
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b6102ebf0517423d8ab36702ee3c0d12cc8f3c256366753d93aeae6236182322')
})


test('ships the five unmodified faction emblems published by the official Arknights page', async () => {
  const expected = {
    'rhodes-island.png': 'f6faa9b6dedc3cf091f686d1278e9b6738c4981da27c63f1bcd39e05114eed75',
    'lungmen.png': 'f1109e139cbc50b97cbdd032b1e73d5c351c71a3fc5a3f35211d74de63197c73',
    'penguin-logistics.png': 'c155ab4290c779a42bf57415009b49e76eddf14e1f03ebdcdcd5e8ae1c852650',
    'rhine-lab.png': '36df1ae2cbbef733b016511afdb255945febea599f9edf14f826c583b4c09c3a',
    'reunion.png': '464908dcb35e8aaa569b69eda2f944d286bfe38b7c41c5a81eb9ddfae7313e31',
  }
  for (const [file, hash] of Object.entries(expected)) {
    const bytes = await readBytes(`../src/assets/faction-emblems/${file}`)
    assert.ok(bytes, `official faction emblem should exist: ${file}`)
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash)
  }
})

test('build embeds local CSS, emblems, and particle-field assets', async () => {
  await execFileAsync(process.execPath, ['scripts/build.mjs'], {
    cwd: new URL('..', import.meta.url),
  })
  await execFileAsync(process.execPath, ['--check', 'lib/client.js'], {
    cwd: new URL('..', import.meta.url),
  })
  const client = await readText('../lib/client.js')
  assert.match(client, /html\[data-dsh-prts\]/)
  assert.match(client, /emblem: "<svg/)
  assert.match(client, /data-prts-rail-brand/)
  assert.doesNotMatch(client, /aria-hidden="true">△/)
  for (const key of ['rhodes-island', 'lungmen', 'penguin-logistics', 'rhine-lab', 'reunion']) {
    assert.match(client, new RegExp(`"key":"${key}"`))
  }
  assert.match(client, /data:image\/png;base64,/)
  assert.match(client, /data-prts-ambient-layer/)
  assert.match(client, /data-prts-particle-layer/)
  assert.match(client, /function createParticleFieldAdapter\(/)
  assert.match(client, /function createHostGeometryAdapter\(/)
  assert.match(client, /function createLayoutStabilityDiagnostics\(/)
  assert.match(client, /emblemMasks:/)
  assert.match(client, /heroEmblemMask:/)
  assert.match(client, /"key":"rhodes-island-hero"/)
  assert.match(client, /"opticalScale":0\.94/)
  assert.match(client, /binary-rle-v1/)
  assert.match(client, /latticeHints/)
  assert.match(client, /function findOrthogonalLayout\(/)
  assert.doesNotMatch(client, /createBlueNoiseTargets|createLatticeTargets/)
  assert.equal((client.match(/data:image\/png;base64,/g) || []).length, 1, 'only the approved P.R.T.S. avatar PNG should be embedded')
  assert.ok(Buffer.byteLength(client) < 1.08 * 1024 * 1024, 'browser bundle should remain below 1.08 mebibytes with history navigation, focus contrast, and opt-in layout diagnostics')
  assert.doesNotMatch(client, /createRhodesFallbackTargets/)
  assert.doesNotMatch(client, /topographic-map\.svg|topographic-tech\.svg|data-prts-terrain-layer/)
  assert.doesNotMatch(client, /Amiya|阿米娅|dossier|data-prts-details-toggle/i)
})

test('build bundles the real browser plugin and settings modules', async () => {
  await execFileAsync(process.execPath, ['scripts/build.mjs'], {
    cwd: new URL('..', import.meta.url),
  })
  const client = await readText('../lib/client.js')
  assert.match(client, /const inject = \['slots', 'theme'\]/)
  assert.match(client, /function applyPrtsPlugin\(ctx, environment\)/)
  assert.match(client, /function resolveRc7Regions\(document, report = \(\) => \{\}\)/)
  assert.match(client, /function projectHarnessStatus\(\{/)
  assert.match(client, /function createHarnessStatusSource\(/)
  assert.match(client, /function createComposerGlassAdapter\(/)
  assert.match(client, /function createAssistantGlassAdapter\(/)
  assert.match(client, /function createConversationControlAdapter\(/)
  assert.match(client, /function createSidebarControlAdapter\(/)
  assert.match(client, /function createPrtsUiStore\(/)
  assert.match(client, /function createSettingsPage\(React, meta/)
  assert.match(client, /function createOperationsShell\(/)
  assert.match(client, /function createPrtsStartupSequence\(/)
  assert.match(client, /data-prts-startup-progress/)
  assert.doesNotMatch(client, /function createDetailsPanel\(React/)
  assert.doesNotMatch(client, /function createDrawerController\(/)
  assert.doesNotMatch(client, /function createTacticalShell\(/)
  assert.match(client, /function createParticleFieldAdapter\(/)
  assert.doesNotMatch(client, /settings\.general\.item/)
  assert.doesNotMatch(client, /^import /m)
  assert.doesNotMatch(client, /watchHarnessStatus|data-prts-source/)
  assert.doesNotMatch(client, /^export /m)
})

test('package manifest exposes only the installable plugin and rights documentation', async () => {
  const pkg = JSON.parse(await readText('../package.json'))
  assert.deepEqual(pkg.files, [
    'lib',
    'src',
    'cordis.patch.yml',
    'README.md',
    'README.en.md',
    'LICENSE',
    'THIRD_PARTY_NOTICES.md',
  ])
  for (const required of [
    '../lib/client.js',
    '../lib/index.js',
    '../cordis.patch.yml',
    '../src/client/operations-shell-v2.js',
    '../src/client/assistant-glass-adapter.js',
    '../src/client/host-geometry-adapter.js',
    '../src/styles/prts.css',
    '../src/assets/rhodes-dsh.svg',
    '../src/client/startup-sequence.js',
    '../src/styles/startup-sequence.css',
    '../src/assets/prts-original-avatar.png',
    '../README.md',
    '../README.en.md',
    '../LICENSE',
    '../THIRD_PARTY_NOTICES.md',
  ]) assert.ok(await readBytes(required), `package file missing ${required}`)
  for (const retired of [
    '../src/client/operations-shell.js',
    '../src/client/details-panel.js',
    '../src/client/drawer-controller.js',
    '../src/client/theme-settings-overlay.js',
    '../src/assets/amiya-operator-portrait.png',
    '../src/assets/class-icons.svg',
  ]) assert.equal(await readBytes(retired), null, `retired file still present: ${retired}`)
})
