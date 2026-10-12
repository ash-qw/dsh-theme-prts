import { parentPort, workerData } from 'node:worker_threads'
import sharp from 'sharp'
import { processCustomEmblemPixels } from '../client/custom-emblem.js'

try {
  const { bytes, params } = workerData
  const image = sharp(Buffer.from(bytes), { limitInputPixels: 16000000, failOn: 'error' }).rotate()
  const metadata = await image.metadata()
  if (!['png','jpeg','webp'].includes(metadata.format)) throw new Error('仅支持 PNG、JPEG、WebP 图片')
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let mode = params.mode
  if (mode === 'auto') {
    mode = 'dark'
    for (let i = 3; i < data.length; i += 4) if (data[i] < 128) { mode = 'alpha'; break }
  }
  const scale = 320 / Math.max(info.width, info.height) * params.zoom
  const width = Math.max(1, Math.round(info.width * scale)), height = Math.max(1, Math.round(info.height * scale))
  const resized = await sharp(data, { raw: info }).resize(width, height).raw().toBuffer()
  const rgba = new Uint8ClampedArray(320 * 320 * 4)
  const left = Math.round((320-width)/2 + params.x*320), top = Math.round((320-height)/2 + params.y*320)
  for (let y = Math.max(0,top); y < Math.min(320,top+height); y++) {
    const x = Math.max(0,left), end = Math.min(320,left+width)
    if (end > x) rgba.set(resized.subarray(((y-top)*width+x-left)*4,((y-top)*width+end-left)*4),(y*320+x)*4)
  }
  const value = processCustomEmblemPixels(rgba,320,mode,params.threshold)
  const dots = value.targets.standard.map(p => {
    const r = p.kind === 'skeleton' ? 1.2 : .9
    return `<circle cx="${192+p.x*350}" cy="${192+p.y*350}" r="${r}"/>`
  }).join('')
  const preview = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384"><rect width="384" height="384" fill="#0d1114"/><g fill="#edf1f2">${dots}</g></svg>`)).png().toBuffer()
  parentPort.postMessage({ value, preview })
} catch (error) { parentPort.postMessage({ error: error.message }) }
