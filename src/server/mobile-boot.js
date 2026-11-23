const NAME = /\sname\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
const CONTENT = /\scontent\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i
const HEAD_TOKENS = /<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi

function attributeValue(source) {
  return /^["']/.test(source) ? source.slice(1, -1) : source
}

function viewportContent(value) {
  return [...value.split(',').map(part => part.trim()).filter(part => part && !/^viewport-fit\s*=/i.test(part)), 'viewport-fit=cover'].join(', ')
}

// These declarations must be in the served HTML, before the standalone window starts.
export function renderMobileBoot(html) {
  return html.replace(/(<head(?:\s[^>]*)?>)([\s\S]*?)(<\/head\s*>)/i, (_, open, head, close) => {
    const missing = new Map([
      ['viewport', 'width=device-width, initial-scale=1, viewport-fit=cover'],
      ['apple-mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
    ])
    const transformed = head.replace(HEAD_TOKENS, tag => {
      if (!/^<meta\b/i.test(tag)) return tag
      const match = NAME.exec(tag)
      const name = (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').toLowerCase()
      if (!missing.has(name)) return tag
      const content = CONTENT.exec(tag)
      const previous = content ? attributeValue(content[1]) : ''
      const next = name === 'viewport' ? viewportContent(previous) : missing.get(name)
      missing.delete(name)
      let output = content
        ? tag.replace(CONTENT, () => ` content="${next.replaceAll('"', '&quot;')}"`)
        : tag.replace(/\s*\/?>$/, ` content="${next}" />`)
      if (!/\bdata-prts-mobile-(?:original|created|content-absent)\b/.test(tag)) {
        const original = content
          ? `data-prts-mobile-original="${previous.replaceAll('"', '&quot;')}"`
          : 'data-prts-mobile-content-absent'
        output = output.replace(/\s*\/?>$/, () => ` ${original} />`)
      }
      return output
    })
    const added = [...missing].map(([name, content]) => `<meta name="${name}" content="${content}" data-prts-mobile-created />`).join('')
    return `${open}${added}${transformed}${close}`
  })
}

export function registerMobileBoot(webServer, config) {
  if (typeof webServer?.tapIndex !== 'function') return () => {}
  return webServer.tapIndex(html => {
    const enabled = config.enabled?.get?.() ?? config.enabled
    return enabled === true ? renderMobileBoot(html) : html
  })
}
