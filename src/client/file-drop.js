const extensions = {
  'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'],
  'image/avif': ['.avif'], 'image/gif': ['.gif'], 'application/json': ['.json'],
}

// Feed the existing input/change flow so picker and drop share validation and saving.
export function mountFileDrop({ area, input, enabled = () => true, onError }) {
  let depth = 0
  const getInput = () => typeof input === 'function' ? input() : input
  const clear = () => { depth = 0; area.removeAttribute('data-prts-drop-active') }
  const available = () => enabled() && !getInput()?.disabled && !area.closest('[hidden], [inert]')
  const isFile = event => Array.from(event.dataTransfer?.types ?? []).includes('Files')
    || Boolean(event.dataTransfer?.files?.length)
  const enter = event => {
    if (!isFile(event)) return
    event.preventDefault(); event.stopPropagation()
    depth++
    if (available()) area.setAttribute('data-prts-drop-active', '')
  }
  const over = event => {
    if (!isFile(event)) return
    event.preventDefault(); event.stopPropagation()
    event.dataTransfer.dropEffect = available() ? 'copy' : 'none'
    if (!available()) clear()
  }
  const leave = event => {
    if (!depth) return
    event.stopPropagation()
    if (--depth <= 0) clear()
  }
  const drop = event => {
    if (!isFile(event)) return
    event.preventDefault(); event.stopPropagation(); clear()
    if (!available()) return
    const files = event.dataTransfer.files, target = getInput()
    if (files.length !== 1) { onError('一次只能添加一个文件'); return }
    const file = files[0], name = file.name.toLowerCase()
    const accepts = target.accept.toLowerCase().split(',').map(value => value.trim()).filter(Boolean)
    const matches = accepts.some(type => type.startsWith('.') ? name.endsWith(type)
      : file.type.toLowerCase() === type || (!file.type && extensions[type]?.some(ext => name.endsWith(ext))))
    if (accepts.length && !matches) { onError('文件类型不支持，请选择此处支持的图片或文件'); return }
    target.files = files
    target.dispatchEvent(new area.ownerDocument.defaultView.Event('change', { bubbles: true }))
  }
  const handlers = { dragenter: enter, dragover: over, dragleave: leave, drop, dragend: clear }
  for (const [name, handler] of Object.entries(handlers)) area.addEventListener(name, handler)
  return { dispose() { clear(); for (const [name, handler] of Object.entries(handlers)) area.removeEventListener(name, handler) } }
}
