import test from 'node:test'
import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {renderPreviewMarkdown,createPreviewContentCache} from '../src/client/preview-markdown.js'

test('preview renders Markdown structure including tables and code',()=>{
  const fence=String.fromCharCode(96).repeat(3)
  const html=renderPreviewMarkdown('# 结果\n\n**完成**\n\n- 第一项\n- 第二项\n\n| 文件 | 状态 |\n| --- | --- |\n| a.txt | 完成 |\n\n'+fence+'js\nconst x = 1\n'+fence)
  const document=new JSDOM(html).window.document
  assert.equal(document.querySelector('h1').textContent,'结果')
  assert.equal(document.querySelector('strong').textContent,'完成')
  assert.equal(document.querySelectorAll('li').length,2)
  assert.equal(document.querySelectorAll('th').length,2)
  assert.equal(document.querySelector('td').textContent,'a.txt')
  assert.match(document.querySelector('pre code').textContent,/const x = 1/)
})
test('preview never renders raw HTML, unsafe links, or remote images',()=>{
  const html=renderPreviewMarkdown('<img src=x onerror=alert(1)>\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n![说明](https://example.com/image.png)\n\n[结果](https://example.com)')
  const document=new JSDOM(html).window.document
  assert.equal(document.querySelector('img,script,iframe'),null)
  const links=[...document.querySelectorAll('a')]
  assert.equal(links.length,1)
  assert.equal(links[0].getAttribute('rel'),'noopener noreferrer')
  assert.ok(document.body.textContent.includes('说明'))
})

 test('per-session content cache reuses parsing and summaries with bounded LRU eviction',()=>{
  const dom=new JSDOM('');let parses=0
  const cache=createPreviewContentCache(dom.window.document,text=>{parses++;return '<p>'+text+'</p>'})
  const first=cache('same')
  assert.equal(cache('same'),first);assert.equal(parses,1);assert.equal(first.summary,'same')
  cache('changed');assert.equal(parses,2)
  for(let i=0;i<32;i++)cache('reply '+i)
  cache('same');assert.equal(parses,35)
  const huge='x'.repeat(262144)
  cache(huge);cache(huge);assert.equal(parses,37)
  dom.window.close()
})
