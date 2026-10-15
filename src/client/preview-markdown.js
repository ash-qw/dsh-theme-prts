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
