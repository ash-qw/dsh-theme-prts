import { createFacilityPath } from './facility-geometry.js'
import { configureSessionLifeline } from './session-lifeline.js'

const SVG_NS = 'http://www.w3.org/2000/svg'
const SILHOUETTE_TRACK_WIDTH = 512
const SESSION_PICKUP_HEIGHTS = Object.freeze([5, 11, 7, 17, 11, 20, 13, 7, 15, 9, 5])

const SILHOUETTE_PATHS = Object.freeze({
  far: [
    'M0 38V26H14V22H30V25H43V18H60V22H73V15H84V11H89V6H93V2H97V6H101V11H106V20H121V16H138V22H151V13H158V9H163V4H168V9H173V13H180V21H196V17H211V12H226V20H241V23H253V15H270V19H285V11H293V7H297V3H301V7H305V11H313V18H329V21H342V14H360V19H374V22H388V16H401V12H405V8H409V12H413V16H422V20H438V13H454V18H470V24H484V20H499V23H512V26H512V38Z',
    'M326 19V7H329V19ZM317 7H346V9H317ZM340 9L350 16H347L337 9Z',
    'M218 12V7H220V12ZM214 7H224V9H214Z',
  ].join(' '),
  near: [
    'M0 38V32H16V29H31V33H48V26H61V31H78V28H94V34H112V30H126V32H141V25H156V29H174V33H191V27H206V31H223V34H240V29H256V26H270V32H289V30H305V34H324V27H340V31H357V29H374V34H392V30H410V26H425V31H443V33H460V28H477V31H494V27H512V32H512V38Z',
    'M94 28V20H97V28ZM90 20H102V22H90Z',
    'M203 27V23H219V25H205V27Z',
    'M267 26V18H270V26ZM263 18H274V20H263Z',
    'M418 26V21H421V26ZM414 21H425V23H414Z',
  ].join(' '),
})

let silhouetteId = 0

export const FACILITY_TEXTURES = Object.freeze(['none', 'grid', 'scanline', 'silhouette', 'pickup'])

function svgNode(document, name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
  return node
}

function appendPattern(document, defs, { id, width, height, path }) {
  const pattern = svgNode(document, 'pattern', {
    id: `prts-facility-${id}-pattern`,
    patternUnits: 'userSpaceOnUse',
    width,
    height,
  })
  pattern.append(svgNode(document, 'path', {
    d: path,
    fill: 'none',
    stroke: '#fff',
    'stroke-width': '1',
    opacity: '.72',
  }))
  defs.append(pattern)

  const mask = svgNode(document, 'mask', {
    id: `prts-facility-${id}-mask`,
    maskUnits: 'userSpaceOnUse',
    x: '0',
    y: '0',
    width: '4096',
    height: '4096',
  })
  mask.append(svgNode(document, 'rect', {
    x: '0',
    y: '0',
    width: '4096',
    height: '4096',
    fill: `url(#prts-facility-${id}-pattern)`,
  }))
  defs.append(mask)
}

export function ensureFacilityTextureDefs(document) {
  let root = document?.querySelector?.('svg[data-prts-facility-defs]')
  if (root) return root
  if (!document?.body) return null

  root = svgNode(document, 'svg', {
    'data-prts-facility-defs': '',
    'data-prts-owned-facility-defs': '',
    'aria-hidden': 'true',
    focusable: 'false',
    width: '0',
    height: '0',
  })
  const defs = svgNode(document, 'defs')
  appendPattern(document, defs, { id: 'grid', width: '8', height: '8', path: 'M 0 .5 H 8 M .5 0 V 8' })
  appendPattern(document, defs, { id: 'scanline', width: '4', height: '4', path: 'M 0 .5 H 4' })
  root.append(defs)
  document.body.append(root)
  return root
}

function appendSilhouetteScene(document, graphic) {
  const clipId = `prts-facility-silhouette-clip-${++silhouetteId}`
  const defs = svgNode(document, 'defs')
  const clip = svgNode(document, 'clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' })
  clip.append(svgNode(document, 'path', { 'data-prts-facility-clip': '' }))
  defs.append(clip)

  const scene = svgNode(document, 'g', {
    'data-prts-facility-silhouette': '',
    'clip-path': `url(#${clipId})`,
  })
  for (const layer of ['far', 'near']) {
    const track = svgNode(document, 'g', { 'data-prts-silhouette-layer': layer })
    for (const offset of [0, SILHOUETTE_TRACK_WIDTH]) {
      track.append(svgNode(document, 'path', {
        d: SILHOUETTE_PATHS[layer],
        transform: `translate(${offset} 0)`,
      }))
    }
    scene.append(track)
  }

  graphic.insertBefore(defs, graphic.firstChild)
  graphic.insertBefore(scene, graphic.querySelector('[data-prts-facility-layer="outline"]'))
}

function appendSessionPickup(document, graphic) {
  const clipId = `prts-facility-pickup-clip-${++silhouetteId}`
  const defs = svgNode(document, 'defs')
  const clip = svgNode(document, 'clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' })
  clip.append(svgNode(document, 'path', { 'data-prts-facility-clip': '' }))
  defs.append(clip)

  const lifeline = svgNode(document, 'g', {
    'data-prts-session-lifeline': '',
    'clip-path': `url(#${clipId})`,
  })
  for (const strand of ['back', 'core', 'front']) {
    lifeline.append(svgNode(document, 'path', {
      'data-prts-session-lifeline-filament': strand,
    }))
  }

  const pickup = svgNode(document, 'g', {
    'data-prts-session-pickup': '',
    'clip-path': `url(#${clipId})`,
  })
  pickup.append(svgNode(document, 'line', {
    'data-prts-session-pickup-baseline': '',
    x1: '60%',
    x2: '98%',
    y1: '19',
    y2: '19',
  }))
  pickup.append(svgNode(document, 'circle', {
    'data-prts-session-pickup-indicator': '',
    cx: '56%',
    cy: '19',
    r: '2.5',
  }))
  SESSION_PICKUP_HEIGHTS.forEach((height, index) => {
    pickup.append(svgNode(document, 'rect', {
      'data-prts-session-pickup-bar': '',
      x: `${76 + index * 2.15}%`,
      y: String((38 - height) / 2),
      width: '1.7',
      height: String(height),
      rx: '.4',
    }))
  })

  graphic.insertBefore(defs, graphic.firstChild)
  graphic.insertBefore(lifeline, graphic.querySelector('[data-prts-facility-layer="outline"]'))
  graphic.insertBefore(pickup, graphic.querySelector('[data-prts-facility-layer="outline"]'))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function sessionLifelineGeometry(width, height) {
  const start = clamp(width * .04, 8, 12)
  const end = Math.max(start + 1, width - 8)
  const baseline = height * .56
  const lift = clamp(height * .35, 10, 14)
  return { start, end, baseline, lift }
}

export function ensureFacilityGraphic(document, owner, { kind, topNotch = false, texture = 'none' } = {}) {
  if (!owner) return null
  let graphic = owner.querySelector?.(':scope > svg[data-prts-facility-svg]')
  if (!graphic) {
    graphic = svgNode(document, 'svg', {
      'data-prts-facility-svg': kind,
      'data-prts-owned-facility-vector': '',
      'aria-hidden': 'true',
      focusable: 'false',
      preserveAspectRatio: 'none',
    })
    for (const layer of ['surface', 'texture', 'outline']) {
      const path = svgNode(document, 'path', { 'data-prts-facility-layer': layer })
      if (layer === 'outline') {
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke-width', '1')
        path.setAttribute('stroke-linejoin', 'miter')
        path.setAttribute('stroke-miterlimit', '2')
        path.setAttribute('vector-effect', 'non-scaling-stroke')
        path.setAttribute('shape-rendering', 'geometricPrecision')
      }
      graphic.append(path)
    }
    owner.insertBefore(graphic, owner.firstChild)
  }
  if (texture === 'silhouette' && !graphic.querySelector('[data-prts-facility-silhouette]')) appendSilhouetteScene(document, graphic)
  if (texture === 'pickup' && !graphic.querySelector('[data-prts-session-pickup]')) appendSessionPickup(document, graphic)
  graphic.setAttribute('data-prts-facility-svg', kind)
  graphic.toggleAttribute('data-prts-top-notch', Boolean(topNotch))
  if (!owner.hasAttribute('data-prts-facility-texture')) owner.setAttribute('data-prts-facility-texture', texture)
  return graphic
}

function setReady(owner, ready) {
  owner.toggleAttribute('data-prts-facility-vector', ready)
  if (owner.hasAttribute('data-prts-facility-spine')) {
    owner.parentElement?.toggleAttribute('data-prts-spine-vector', ready)
  }
}

export function renderFacilityGraphic(owner, { width, height } = {}) {
  const graphic = owner?.querySelector?.(':scope > svg[data-prts-facility-svg]')
  const topNotch = graphic?.hasAttribute('data-prts-top-notch')
  const path = createFacilityPath({ width, height, topNotch })
  if (!graphic || !path) {
    owner?.removeAttribute?.('data-prts-facility-size')
    setReady(owner, false)
    return false
  }

  const size = `${Number(width.toFixed(3))}x${Number(height.toFixed(3))}`
  const lifeline = graphic.querySelector('[data-prts-session-lifeline]')
  const lifelineGeometry = lifeline ? sessionLifelineGeometry(width, height) : undefined
  if (owner.getAttribute('data-prts-facility-size') !== size) {
    graphic.setAttribute('viewBox', `0 0 ${Number(width.toFixed(3))} ${Number(height.toFixed(3))}`)
    for (const layer of graphic.querySelectorAll('[data-prts-facility-layer], [data-prts-facility-clip]')) layer.setAttribute('d', path)
    const silhouette = graphic.querySelector('[data-prts-facility-silhouette]')
    if (silhouette) {
      const availableHeight = Math.max(1, height - 2)
      silhouette.setAttribute('transform', `translate(0 1) scale(1 ${Number((availableHeight / 38).toFixed(5))})`)
    }
    const pickup = graphic.querySelector('[data-prts-session-pickup]')
    if (pickup) {
      const center = Number((height / 2).toFixed(3))
      for (const baseline of pickup.querySelectorAll('[data-prts-session-pickup-baseline]')) {
        baseline.setAttribute('y1', String(center))
        baseline.setAttribute('y2', String(center))
      }
      for (const indicator of pickup.querySelectorAll('[data-prts-session-pickup-indicator]')) {
        indicator.setAttribute('cy', String(center))
      }
      for (const bar of pickup.querySelectorAll('[data-prts-session-pickup-bar]')) {
        const barHeight = Number(bar.getAttribute('height')) || 0
        bar.setAttribute('y', String(Number((center - barHeight / 2).toFixed(3))))
      }
    }
    if (lifeline) {
      configureSessionLifeline(lifeline, lifelineGeometry)
    }
    owner.setAttribute('data-prts-facility-size', size)
  }
  setReady(owner, true)
  return true
}
