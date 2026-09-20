import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createExactEmblemMask, createRhodesHeroMask } from './png-alpha.mjs'
import { PARTICLE_DENSITY_PROFILES, findOrthogonalLayout } from '../src/client/particle-field-adapter.js'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lib = resolve(root, 'lib')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const packageName = packageJson.name
const version = packageJson.version
const factionEmblemDefinitions = [
  { key: 'rhodes-island', label: '罗德岛', file: 'rhodes-island.png', opticalScale: 0.86 },
  { key: 'lungmen', label: '龙门', file: 'lungmen.png', opticalScale: 0.84 },
  { key: 'penguin-logistics', label: '企鹅物流', file: 'penguin-logistics.png', opticalScale: 0.87 },
  { key: 'rhine-lab', label: '莱茵生命', file: 'rhine-lab.png', opticalScale: 0.87 },
  { key: 'reunion', label: '整合运动', file: 'reunion.png', opticalScale: 0.85 },
]

function encodeBinaryAlphaMask(alpha, threshold = 40) {
  if (!alpha?.length) return ''
  const bytes = [alpha[0] > threshold ? 1 : 0]
  let state = alpha[0] > threshold
  let runLength = 1
  const pushRun = length => {
    let value = length
    while (value >= 0x80) {
      bytes.push((value & 0x7f) | 0x80)
      value >>>= 7
    }
    bytes.push(value)
  }
  for (let index = 1; index < alpha.length; index += 1) {
    const next = alpha[index] > threshold
    if (next === state) {
      runLength += 1
      continue
    }
    pushRun(runLength)
    state = next
    runLength = 1
  }
  pushRun(runLength)
  return Buffer.from(bytes).toString('base64')
}

const [rawCssText, stabilizationCss, refinementCss, themeSettingsWorkbenchCss, facilityVectorCss, startupSequenceCss, emblem, prtsEmblemBytes, factionEmblemBytes] = await Promise.all([
  readFile(resolve(root, 'src/styles/prts.css'), 'utf8'),
  readFile(resolve(root, 'src/styles/stabilization.css'), 'utf8'),
  readFile(resolve(root, 'src/styles/refinement.css'), 'utf8'),
  readFile(resolve(root, 'src/styles/theme-settings-workbench.css'), 'utf8'),
  readFile(resolve(root, 'src/styles/facility-vector.css'), 'utf8'),
  readFile(resolve(root, 'src/styles/startup-sequence.css'), 'utf8'),
  readFile(resolve(root, 'src/assets/rhodes-dsh.svg'), 'utf8'),
  readFile(resolve(root, 'src/assets/prts-original-avatar.png')),
  Promise.all(factionEmblemDefinitions.map(({ file }) =>
    readFile(resolve(root, 'src/assets/faction-emblems', file)),
  )),
])
function compactCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s*([{}])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s*,\s*/g, ',')
}

const cssText = compactCss(`${rawCssText}\n${stabilizationCss}\n${refinementCss}\n${themeSettingsWorkbenchCss}\n${facilityVectorCss}\n${startupSequenceCss}`)
const prtsEmblem = `data:image/png;base64,${prtsEmblemBytes.toString('base64')}`
const factionEmblems = factionEmblemDefinitions.map(definition => ({
  key: definition.key,
  label: definition.label,
}))
function buildMaskRecord(key, input, opticalScale, createMask = createExactEmblemMask) {
  const mask = createMask(input, { opticalScale })
  const latticeHints = Object.fromEntries(Object.keys(PARTICLE_DENSITY_PROFILES).map(density => {
    const layout = findOrthogonalLayout(mask, density)
    return [density, {
      pitch: layout.pitch,
      offsetX: layout.offsetX,
      offsetY: layout.offsetY,
    }]
  }))
  return {
    key,
    width: mask.width,
    height: mask.height,
    alpha: encodeBinaryAlphaMask(mask.alpha),
    encoding: 'binary-rle-v1',
    opticalScale: mask.opticalScale,
    latticeHints,
  }
}

const factionEmblemMasks = factionEmblemDefinitions.map((definition, index) => {
  return buildMaskRecord(definition.key, factionEmblemBytes[index], definition.opticalScale)
})
const heroEmblemMask = buildMaskRecord('rhodes-island-hero', factionEmblemBytes[0], 0.94, createRhodesHeroMask)


const clientModulePaths = [
  'src/client/preferences.js',
  'src/client/host-geometry-adapter.js',
  'src/client/composer-glass-adapter.js',
  'src/client/floating-glass-adapter.js',
  'src/client/assistant-glass-adapter.js',
  'src/client/particle-field-adapter.js',
  'src/client/to-bottom-adapter.js',
  'src/client/conversation-control-adapter.js',
  'src/client/layout-stability-diagnostics.js',
  'src/client/facility-geometry.js',
  'src/client/session-lifeline.js',
  'src/client/facility-vector.js',
  'src/client/sidebar-control-adapter.js',
  'src/client/rc7-adapter.js',
  'src/client/theme-controller-v2.js',
  'src/client/status-projection.js',
  'src/client/ui-store.js',
  'src/client/startup-sequence.js',
  'src/client/settings-page.js',
  'src/client/theme-settings-workbench.js',
  'src/client/resize-shield-adapter.js',
  'src/client/operations-shell-v2.js',
  'src/client/index.js',
]
const moduleSources = await Promise.all(clientModulePaths.map(path =>
  readFile(resolve(root, path), 'utf8'),
))

function bundleModule(source) {
  return source
    .replace(/^\s*\/\/.*\n/gm, "")
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+(async\s+)?(const|function)\s+/gm, '$1$2 ')
    .replace(/^[ \t]+/gm, '')
    .replace(/^[ \t]*\r?\n/gm, '')
}

const bundledSource = moduleSources.map(bundleModule).join('\n')

const host = `export const PACKAGE_ID = ${JSON.stringify(packageName)}\nexport const THEME_PLUGIN_ID = 'dsh-theme-prts'\nexport function apply() {}\n`
const client = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(packageName)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const PRTS_VERSION = ${JSON.stringify(version)};
    const PRTS_CSS = ${JSON.stringify(cssText)};
    const PRTS_ASSETS = Object.freeze({
      emblem: ${JSON.stringify(emblem)},
      prtsEmblem: ${JSON.stringify(prtsEmblem)},
      emblems: ${JSON.stringify(factionEmblems)},
      emblemMasks: ${JSON.stringify(factionEmblemMasks)},
      heroEmblemMask: ${JSON.stringify(heroEmblemMask)}
    });
    ${bundledSource}
    exports.cssText = PRTS_CSS;
    exports.assets = PRTS_ASSETS;
    exports.inject = inject;
    exports.apply = apply;
    exports.applyPrtsPlugin = applyPrtsPlugin;
    return module.exports;
  }
});
`

async function atomicWrite(path, content) {
  const temp = `${path}.tmp`
  await writeFile(temp, content)
  await rename(temp, path)
}

await mkdir(lib, { recursive: true })
await atomicWrite(resolve(lib, 'index.js'), host)
await atomicWrite(resolve(lib, 'client.js'), client)
