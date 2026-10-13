import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { CONVERSATION_CONTROL_ATTRIBUTE, createConversationControlAdapter } from '../src/client/conversation-control-adapter.js'

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 24))
}

test('classifies only stable conversation controls without depending on localized text', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation">
      <header><button class="nL4_yW_sessionLogButton"><span>任意语言</span></button></header>
      <div class="Md3f7G_older"><button>任意语言</button></div>
      <div data-produced-files-row><button>report.md</button></div>
      <button class="P4kPIW_showFolder">任意语言</button>
      <article data-chat-flow-kind="assistant-step">
        <button class="o3BgMG_inspectButton">任意语言</button>
        <button aria-label="copy"><svg></svg></button>
        <div data-presented-file><button class="host_cardPreview" aria-label="Preview file"></button></div>
      </article>
      <section data-approval-key="approval-1">
        <button class="fixture_reject">任意语言</button>
        <button>任意语言</button>
      </section>
      <a href="/file">普通链接</a>
    </main>
    <button class="outside_sessionLogButton">外部</button>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createConversationControlAdapter({ document, window: dom.window })
  adapter.start()

  const kinds = [...document.querySelectorAll(`[${CONVERSATION_CONTROL_ATTRIBUTE}]`)]
    .map(node => node.getAttribute(CONVERSATION_CONTROL_ATTRIBUTE))
    .sort()
  assert.deepEqual(kinds, ['cta', 'danger', 'file', 'header', 'inspect', 'micro', 'utility', 'utility'])
  assert.equal(document.querySelector('.host_cardPreview').hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)
  assert.equal(document.querySelector('a').hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)
  assert.equal(document.querySelector('.outside_sessionLogButton').hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)

  const oldHeader = document.querySelector('.nL4_yW_sessionLogButton')
  oldHeader.remove()
  const replacement = document.createElement('button')
  replacement.className = 'future_sessionLogButton'
  document.querySelector('[data-prts-region="operation"] header').append(replacement)
  await flush(dom.window)
  assert.equal(oldHeader.hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)
  assert.equal(replacement.getAttribute(CONVERSATION_CONTROL_ATTRIBUTE), 'header')

  adapter.dispose()
  assert.equal(document.querySelectorAll(`[${CONVERSATION_CONTROL_ATTRIBUTE}]`).length, 0)
})

test('preserves process disclosures across states without excluding neighboring actions', async () => {
  const dom = new JSDOM(`<main data-prts-region="operation"><article data-chat-flow-kind="turn-process">
    <button data-turn-process="1" aria-expanded="false">已完成</button>
    <button data-turn-process="2" disabled>Stopped</button>
    <button aria-label="copy">Copy</button>
  </article></main>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createConversationControlAdapter({ document, window: dom.window })
  adapter.start()
  for (const button of document.querySelectorAll('[data-turn-process]')) {
    assert.equal(button.hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)
  }
  const action = document.querySelector('[aria-label="copy"]')
  assert.equal(action.getAttribute(CONVERSATION_CONTROL_ATTRIBUTE), 'micro')
  action.setAttribute('data-turn-process', '3')
  await flush(dom.window)
  assert.equal(action.hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)
  action.setAttribute('aria-expanded', 'true')
  action.textContent = '失败'
  await flush(dom.window)
  assert.equal(action.hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE), false)
  action.removeAttribute('data-turn-process')
  await flush(dom.window)
  assert.equal(action.getAttribute(CONVERSATION_CONTROL_ATTRIBUTE), 'micro')
  adapter.dispose()
  dom.window.close()
})


test('groups change cards and both file-link class formats without styling transparent hit targets',()=>{
  const dom=new JSDOM(`<main data-prts-region="operation"><article data-chat-flow-kind="assistant-step">
    <button class="future_header"><span class="future_tile"></span><span class="future_titles">文件</span></button>
    <button class="future_fileLink">文件</button><button class="_fileMention_hash_1 _fileLink_hash_2">文件</button>
    <button class="other_header">其它操作</button>
    <div data-presented-file><button class="future_cardPreview"></button></div>
  </article></main>`,{pretendToBeVisual:true})
  const {document}=dom.window,adapter=createConversationControlAdapter({document,window:dom.window})
  adapter.start()
  assert.equal(document.querySelectorAll('[data-prts-conversation-control="file"]').length,3)
  assert.equal(document.querySelector('.other_header').getAttribute(CONVERSATION_CONTROL_ATTRIBUTE),'micro')
  assert.equal(document.querySelector('.future_cardPreview').hasAttribute(CONVERSATION_CONTROL_ATTRIBUTE),false)
  adapter.dispose();assert.equal(document.querySelectorAll('[data-prts-conversation-control]').length,0)
  dom.window.close()
})
