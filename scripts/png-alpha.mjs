import { inflateSync } from 'node:zlib'

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft
  const leftDistance = Math.abs(estimate - left)
  const upDistance = Math.abs(estimate - up)
  const upperLeftDistance = Math.abs(estimate - upperLeft)
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left
  return upDistance <= upperLeftDistance ? up : upperLeft
}

export function decodePngAlpha(input) {
  const bytes = Buffer.from(input)
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Unsupported emblem image: invalid PNG signature')
  }

  let offset = 8
  let width
  let height
  let bitDepth
  let colorType
  let interlace
  const idat = []

  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.toString('ascii', offset + 4, offset + 8)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    if (dataEnd + 4 > bytes.length) throw new Error('Unsupported emblem image: truncated PNG chunk')
    const data = bytes.subarray(dataStart, dataEnd)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    offset = dataEnd + 4
  }

  if (!width || !height || bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error('Unsupported emblem image: expected non-interlaced 8-bit RGBA PNG')
  }
  if (!idat.length) throw new Error('Unsupported emblem image: missing PNG data')

  const channels = 4
  const rowBytes = width * channels
  const inflated = inflateSync(Buffer.concat(idat))
  const expected = height * (rowBytes + 1)
  if (inflated.length !== expected) throw new Error('Unsupported emblem image: unexpected decoded size')

  const previous = Buffer.alloc(rowBytes)
  const current = Buffer.alloc(rowBytes)
  const alpha = Buffer.alloc(width * height)
  const rgba = Buffer.alloc(width * height * channels)
  let cursor = 0

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[cursor]
    cursor += 1
    for (let x = 0; x < rowBytes; x += 1) {
      const raw = inflated[cursor + x]
      const left = x >= channels ? current[x - channels] : 0
      const up = previous[x]
      const upperLeft = x >= channels ? previous[x - channels] : 0
      let value
      if (filter === 0) value = raw
      else if (filter === 1) value = raw + left
      else if (filter === 2) value = raw + up
      else if (filter === 3) value = raw + Math.floor((left + up) / 2)
      else if (filter === 4) value = raw + paeth(left, up, upperLeft)
      else throw new Error('Unsupported emblem image: unknown PNG filter')
      current[x] = value & 255
    }
    current.copy(rgba, y * rowBytes)
    for (let x = 0; x < width; x += 1) alpha[y * width + x] = current[x * channels + 3]
    current.copy(previous)
    cursor += rowBytes
  }

  return { width, height, alpha, rgba }
}

export function findAlphaBounds(alpha, width, height, threshold = 16) {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if ((alpha[y * width + x] ?? 0) <= threshold) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < left || bottom < top) return null
  return { left, top, right, bottom, width: right - left + 1, height: bottom - top + 1 }
}

function sampleBilinear(alpha, width, height, x, y) {
  const left = Math.max(0, Math.min(width - 1, Math.floor(x)))
  const top = Math.max(0, Math.min(height - 1, Math.floor(y)))
  const right = Math.min(width - 1, left + 1)
  const bottom = Math.min(height - 1, top + 1)
  const horizontal = x - left
  const vertical = y - top
  const topValue = alpha[top * width + left] * (1 - horizontal) + alpha[top * width + right] * horizontal
  const bottomValue = alpha[bottom * width + left] * (1 - horizontal) + alpha[bottom * width + right] * horizontal
  return Math.round(topValue * (1 - vertical) + bottomValue * vertical)
}

function normalizeAlphaMask(source, { size = 320, opticalScale = 0.86 } = {}) {
  const bounds = findAlphaBounds(source.alpha, source.width, source.height)
  if (!bounds) throw new Error('Unsupported emblem image: transparent PNG')
  const stage = size * opticalScale
  const scale = Math.min(stage / bounds.width, stage / bounds.height)
  const drawWidth = bounds.width * scale
  const drawHeight = bounds.height * scale
  const drawLeft = (size - drawWidth) / 2
  const drawTop = (size - drawHeight) / 2
  const alpha = Buffer.alloc(size * size)

  for (let y = Math.max(0, Math.floor(drawTop)); y < Math.min(size, Math.ceil(drawTop + drawHeight)); y += 1) {
    for (let x = Math.max(0, Math.floor(drawLeft)); x < Math.min(size, Math.ceil(drawLeft + drawWidth)); x += 1) {
      const sourceX = bounds.left + (x + 0.5 - drawLeft) / scale - 0.5
      const sourceY = bounds.top + (y + 0.5 - drawTop) / scale - 0.5
      alpha[y * size + x] = sampleBilinear(source.alpha, source.width, source.height, sourceX, sourceY)
    }
  }

  return {
    width: size,
    height: size,
    alpha,
    bounds,
    opticalScale,
  }
}

export function createExactEmblemMask(input, options = {}) {
  return normalizeAlphaMask(decodePngAlpha(input), options)
}

export function createRhodesHeroMask(input, { size = 320, opticalScale = 0.94 } = {}) {
  const source = decodePngAlpha(input)
  const inside = new Uint8Array(source.width * source.height)
  for (let y = 0; y < source.height; y += 1) {
    let left = source.width
    let right = -1
    for (let x = 0; x < source.width; x += 1) {
      if (source.alpha[y * source.width + x] <= 16) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
    }
    for (let x = left; x <= right; x += 1) inside[y * source.width + x] = 1
  }

  const alpha = Buffer.alloc(source.width * source.height)
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const index = y * source.width + x
      if (!inside[index]) continue
      const rgbaIndex = index * 4
      const luminance = source.rgba[rgbaIndex] * 0.2126
        + source.rgba[rgbaIndex + 1] * 0.7152
        + source.rgba[rgbaIndex + 2] * 0.0722
      const ink = source.alpha[index] < 220 || luminance < 180
      let edge = false
      for (let dy = -1; dy <= 1 && !edge; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nextX = x + dx
          const nextY = y + dy
          if (nextX < 0 || nextY < 0 || nextX >= source.width || nextY >= source.height
            || !inside[nextY * source.width + nextX]) {
            edge = true
            break
          }
        }
      }
      if (ink || edge) alpha[index] = 255
    }
  }
  return normalizeAlphaMask({ width: source.width, height: source.height, alpha }, { size, opticalScale })
}
