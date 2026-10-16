import MarkdownIt from 'markdown-it'

let previewMarkdownParser
export function renderPreviewMarkdown(text) {
  if (!previewMarkdownParser) {
    previewMarkdownParser = new MarkdownIt({html:false,linkify:false,typographer:false})
    // Previews never fetch remote images or render model-supplied HTML.
    previewMarkdownParser.renderer.rules.image = (tokens,index) =>
      previewMarkdownParser.utils.escapeHtml(tokens[index].content || '图片')
    const link = previewMarkdownParser.renderer.rules.link_open
    previewMarkdownParser.renderer.rules.link_open = (tokens,index,options,env,self) => {
      tokens[index].attrSet('target','_blank')
      tokens[index].attrSet('rel','noopener noreferrer')
      return link ? link(tokens,index,options,env,self) : self.renderToken(tokens,index,options)
    }
  }
  return previewMarkdownParser.render(text)
}

// Bounded per retained session; oversized replies are rendered without caching.
export function createPreviewContentCache(document, render = renderPreviewMarkdown) {
  const entries = new Map()
  let size = 0
  return text => {
    const hit = entries.get(text)
    if (hit) { entries.delete(text); entries.set(text, hit); return hit }
    const html = render(text)
    const plain = document.createElement('div')
    plain.innerHTML = html
    const summary = plain.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)
    const cost = text.length + html.length + summary.length
    const value = {html, summary, cost}
    if (cost <= 262144) {
      while (entries.size && (entries.size >= 32 || size + cost > 262144)) {
        const key = entries.keys().next().value
        size -= entries.get(key).cost
        entries.delete(key)
      }
      entries.set(text, value)
      size += cost
    }
    return value
  }
}
