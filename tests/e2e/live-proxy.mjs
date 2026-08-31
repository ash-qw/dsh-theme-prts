import net from 'node:net'

const targetValue = process.env.PRTS_LIVE_TARGET
if (!targetValue) throw new Error('PRTS_LIVE_TARGET is required, for example 192.168.10.106:3080')

const target = new URL(targetValue.includes('://') ? targetValue : `tcp://${targetValue}`)
const targetHost = target.hostname
const targetPort = Number(target.port)
if (!targetHost || !Number.isInteger(targetPort) || targetPort < 1 || targetPort > 65535) {
  throw new Error(`Invalid PRTS_LIVE_TARGET: ${targetValue}`)
}

const listenHost = '127.0.0.1'
const listenPort = 3080
const sockets = new Set()
const server = net.createServer(client => {
  const upstream = net.connect({ host: targetHost, port: targetPort })
  sockets.add(client)
  sockets.add(upstream)
  client.setNoDelay(true)
  upstream.setNoDelay(true)
  client.pipe(upstream)
  upstream.pipe(client)
  const close = () => {
    sockets.delete(client)
    sockets.delete(upstream)
    client.destroy()
    upstream.destroy()
  }
  client.on('close', close)
  client.on('error', close)
  upstream.on('close', close)
  upstream.on('error', close)
})

server.listen(listenPort, listenHost, () => {
  process.stdout.write(`PRTS live proxy: http://${listenHost}:${listenPort} -> ${targetHost}:${targetPort}\\n`)
})

function shutdown() {
  for (const socket of sockets) socket.destroy()
  server.close(() => process.exit(0))
}
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
