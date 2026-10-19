import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { body, json, isBase64 } from './api.js'
import { fault } from './emblems.js'

export const BACKGROUND_API = '/prts-theme-api/backgrounds'
const BACKGROUND_SLOTS = ['full', 'sidebar', 'conversation']
export async function createBackgroundService(directory) {
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const configurationPath = join(directory, 'configuration.json')
  let state = { revision: 0, full: null, sidebar: null, conversation: null }
  try { state = JSON.parse(await readFile(configurationPath, 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  let queue = Promise.resolve()
  const listeners = new Set()
  const snapshot = () => structuredClone(state)
  return {
    snapshot,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    async image(id) {
      if (!BACKGROUND_SLOTS.some(slot => state[slot]?.id === id)) throw fault(404, '背景不存在')
      return readFile(join(directory, id + '.webp'))
    },
    save(data) {
      const task = queue.then(async () => {
        if (!BACKGROUND_SLOTS.includes(data?.slot)) throw fault(400, '背景区域无效')
        if (data.revision !== state.revision) throw fault(409, '背景已在其他页面更新，请重新操作')
        let entry = null, output
        if (data.image !== null) {
          if (!isBase64(data.image) || data.image.length > 14 * 1024 * 1024) throw fault(400, '请上传不超过 10 MB 的图片')
          const bytes = Buffer.from(data.image, 'base64')
          if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw fault(400, '请上传不超过 10 MB 的图片')
          try {
            const input = sharp(bytes, { limitInputPixels: 40000000, animated: false })
            const metadata = await input.metadata()
            if (!['png', 'jpeg', 'webp', 'avif'].includes(metadata.format)) throw Error('format')
            const result = await input.rotate().resize({ width: 3840, height: 2160, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer({ resolveWithObject: true })
            output = result.data
            entry = { id: randomUUID(), width: result.info.width, height: result.info.height }
          } catch { throw fault(400, '无法读取图片，请使用 PNG、JPEG、WebP 或 AVIF（最多 4000 万像素）') }
        }
        const next = { ...state, revision: state.revision + 1, [data.slot]: entry }
        const temporary = configurationPath + '.' + randomUUID() + '.tmp'
        try {
          if (entry) await writeFile(join(directory, entry.id + '.webp'), output, { mode: 0o600 })
          await writeFile(temporary, JSON.stringify(next), { mode: 0o600 })
          await rename(temporary, configurationPath)
        } catch (error) {
          if (entry) await rm(join(directory, entry.id + '.webp'), { force: true }).catch(() => {})
          throw error
        } finally { await rm(temporary, { force: true }).catch(() => {}) }
        const previous = state[data.slot]
        state = next
        if (previous) await rm(join(directory, previous.id + '.webp'), { force: true }).catch(() => {})
        for (const listener of listeners) { try { listener(state.revision) } catch {} }
        return snapshot()
      })
      queue = task.catch(() => {})
      return task
    },
    async dispose() { listeners.clear(); await queue },
  }
}

export function registerBackgroundApi(ctx, service) {
  const connection = ctx.connection
  let disposed = false
  const streams = new Set()
  const unregister = ctx.webServer.register({ kind: 'prefix', path: BACKGROUND_API, handler: async (req, res) => {
    try {
      if (disposed) throw fault(503, '主题服务正在重新加载')
      if ('rejection' in connection.admit(req)) throw fault(401, '请先登录 DSH')
      const path = new URL(req.url, 'http://localhost').pathname.slice(BACKGROUND_API.length)
      if (req.method === 'GET' && path === '/events') {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', 'x-accel-buffering': 'no' })
        streams.add(res)
        const send = revision => res.write('data: ' + JSON.stringify({ revision }) + '\n\n')
        const unsubscribe = service.subscribe(send)
        send(service.snapshot().revision)
        const timer = setInterval(() => res.write(': heartbeat\n\n'), 25000)
        res.on('close', () => { clearInterval(timer); unsubscribe(); streams.delete(res) })
        return
      }
      if (req.method === 'GET' && /^\/image\/[a-f0-9-]{36}$/.test(path)) {
        const bytes = await service.image(path.slice(7))
        res.writeHead(200, { 'content-type': 'image/webp', 'cache-control': 'private, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' }); res.end(bytes); return
      }
      if (path !== '/configuration') throw fault(404, '接口不存在')
      if (req.method === 'GET') { json(res, 200, service.snapshot()); return }
      if (req.method !== 'POST') throw fault(405, '请求方法不支持')
      if (req.headers['x-prts-request'] !== '1') throw fault(403, '缺少请求标识')
      json(res, 200, await service.save(await body(req)))
    } catch (error) { if (!res.headersSent) json(res, error.status || 500, { error: error.message }); else res.end() }
  } })
  return () => { disposed = true; unregister(); for (const stream of streams) stream.end(); streams.clear() }
}
