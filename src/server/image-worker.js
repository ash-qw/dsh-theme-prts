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
  // Extract the entire centered image before applying the viewport translation.
  const size = Math.max(320, width, height)
  const rgba = new Uint8ClampedArray(size * size * 4)
  const left = Math.round((size-width)/2), top = Math.round((size-height)/2)
  for (let y = Math.max(0,top); y < Math.min(size,top+height); y++) {
    const x = Math.max(0,left), end = Math.min(size,left+width)
    if (end > x) rgba.set(resized.subarray(((y-top)*width+x-left)*4,((y-top)*width+end-left)*4),(y*size+x)*4)
  }
  const value = processCustomEmblemPixels(rgba,size,mode,params.threshold,undefined,params)
  let previewPoints
  for (const [density, points] of Object.entries(value.targets)) {
    const shifted = points.map(p => ({...p, x:p.x*size/320+params.x, y:p.y*size/320+params.y}))
    if (density === 'standard') previewPoints = shifted
    value.targets[density] = shifted.filter(p => Math.abs(p.x)<=.5 && Math.abs(p.y)<=.5)
  }
  if (Object.values(value.targets).some(points => points.length < 4)) throw new Error('取景框内可用轮廓太少，请调整位置或缩放')
  const dots = value.targets.standard.map(p => {
    const r = p.kind === 'skeleton' ? 1.2 : .9
    return `<circle cx="${192+p.x*350}" cy="${192+p.y*350}" r="${r}"/>`
  }).join('')
  const preview = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384"><rect width="384" height="384" fill="#0d1114"/><g fill="#edf1f2">${dots}</g></svg>`)).png().toBuffer()
  parentPort.postMessage({ value, preview, previewPoints })
} catch (error) { parentPort.postMessage({ error: error.message }) }
