import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import {
  collectConversationTurns,
  createConversationScaleAdapter,
  getConversationTurnPreview,
  sanitizeConversationPreviewNode,
} from '../src/client/conversation-scale-adapter.js'

function flush(window, delay = 16) {
  return new Promise(resolve => window.setTimeout(resolve, delay))
}

test('sanitizes controls and multi-line code while preserving compact readable text', () => {
  const dom = new JSDOM(`<!doctype html><div id="answer">
    正文 <button>复制</button><span aria-hidden="true">装饰</span>
    <pre>const value = 1\nconsole.log(value)</pre>
  </div>`)
  const answer = dom.window.document.querySelector('#answer')
  assert.equal(sanitizeConversationPreviewNode(answer), '正文 代码：const value = 1')
})

test('pairs a question with the first formal answer and falls back when only auxiliary output exists', () => {
  const dom = new JSDOM(`<!doctype html><div data-conversation-scroll>
    <div data-message-role="user"><div class="fixture_bubble">怎样部署？<button>编辑</button></div></div>
    <div data-chat-flow-kind="assistant-step"><div data-slot="reasoning"><div data-markdown>内部推理</div></div></div>
    <div data-chat-flow-kind="assistant-step"><div data-markdown>第一段正式回答<button>复制</button></div></div>
    <div data-chat-flow-kind="assistant-step"><div data-markdown>第二段正式回答</div></div>
    <div data-message-role="user">下一轮</div>
    <div data-chat-flow-kind="assistant-step"><div data-slot="tool-output">工具摘要</div></div>
    <div data-message-role="user">第三轮</div>
    <div data-chat-flow-kind="assistant-step" aria-busy="true"></div>
  </div>`)
  const scroller = dom.window.document.querySelector('[data-conversation-scroll]')
  const turns = collectConversationTurns(scroller)
  assert.deepEqual(getConversationTurnPreview(scroller, turns, 0), {
    question: '怎样部署？',
    answer: '第一段正式回答',
    state: 'answer',
    answerSource: scroller.querySelectorAll('[data-markdown]')[1],
  })
  assert.equal(getConversationTurnPreview(scroller, turns, 1).answer, '工具摘要')
  assert.equal(getConversationTurnPreview(scroller, turns, 1).state, 'fallback')
  assert.equal(getConversationTurnPreview(scroller, turns, 2).answer, '正在生成…')
  assert.equal(getConversationTurnPreview(scroller, turns, 2).state, 'streaming')
})

test('delays mouse preview, refreshes only the active answer, uses adaptive conversation-column geometry, and toggles top fade', async () => {
  const turnsHtml = Array.from({ length: 30 }, (_, index) => `
    <div data-message-role="user" data-y="${index * 100}"><div class="fixture_bubble">问题 ${index + 1}</div></div>
    <div data-chat-flow-kind="assistant-step"><div data-markdown>回答 ${index + 1}</div></div>
  `).join('')
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation">
      <div data-conversation-scroll>${turnsHtml}<div data-composer-seat>composer</div></div>
    </main>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const operation = document.querySelector('[data-prts-region="operation"]')
  const scroller = document.querySelector('[data-conversation-scroll]')
  const composer = document.querySelector('[data-composer-seat]')

  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0)
  dom.window.cancelAnimationFrame = id => dom.window.clearTimeout(id)
  dom.window.matchMedia = () => ({ matches: true })
  dom.window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
  Object.defineProperties(scroller, {
    clientHeight: { configurable: true, value: 500 },
    scrollHeight: { configurable: true, value: 3200 },
  })
  scroller.scrollTo = options => { scroller.scrollTop = options.top }
  operation.getBoundingClientRect = () => ({ top: 0, bottom: 600, left: 100, right: 900, width: 800, height: 600 })
  scroller.getBoundingClientRect = () => ({ top: 60, bottom: 560, left: 150, right: 850, width: 700, height: 500 })
  composer.getBoundingClientRect = () => ({ top: 220, bottom: 280, left: 150, right: 850, width: 700, height: 60 })
  for (const turn of collectConversationTurns(scroller)) {
    turn.getBoundingClientRect = () => {
      const top = 60 + Number(turn.dataset.y) - scroller.scrollTop
      return { top, bottom: top + 40, left: 190, right: 790, width: 600, height: 40 }
    }
  }

  const adapter = createConversationScaleAdapter({ document, window: dom.window })
  adapter.start()
  await flush(dom.window)

  const scale = document.querySelector('[data-prts-conversation-scale]')
  const preview = document.querySelector('[data-prts-conversation-preview]')
  const marks = scale.querySelector('[data-prts-conversation-scale-marks]')
  const hit = scale.querySelector('[data-prts-conversation-scale-hit]')
  assert.equal(scale.style.left, '29px')
  assert.ok(marks.getAttribute('mask')?.startsWith('url(#prts-conversation-scale-fade-'))
  assert.equal(hit.parentElement, scale.querySelector('svg'))
  assert.notEqual(hit.parentElement, marks)

  scale.getBoundingClientRect = () => ({ top: 72, bottom: 208, left: 129, right: 161, width: 32, height: 136 })
  scale.dispatchEvent(new dom.window.MouseEvent('pointermove', { clientX: 139, clientY: 132, bubbles: true }))
  await flush(dom.window, 40)
  assert.equal(preview.hasAttribute('data-prts-conversation-preview-visible'), false)
  await flush(dom.window, 90)
  assert.equal(preview.hasAttribute('data-prts-conversation-preview-visible'), true)
  assert.equal(preview.style.left, '69px')
  assert.equal(preview.querySelector('[data-prts-conversation-preview-question]').textContent, '问题 21')
  assert.equal(preview.querySelector('[data-prts-conversation-preview-answer]').textContent, '回答 21')

  const activeAnswer = scroller.querySelectorAll('[data-markdown]')[20]
  activeAnswer.textContent = '回答 21 已更新'
  await flush(dom.window, 130)
  assert.equal(preview.querySelector('[data-prts-conversation-preview-answer]').textContent, '回答 21 已更新')

  const wheel = new dom.window.WheelEvent('wheel', { deltaY: -100000, bubbles: true, cancelable: true })
  scale.dispatchEvent(wheel)
  await flush(dom.window)
  assert.equal(scale.dataset.prtsScaleOffset, '0')
  assert.equal(marks.hasAttribute('mask'), false)
  assert.equal(preview.hasAttribute('data-prts-conversation-preview-visible'), false)

  scale.dispatchEvent(new dom.window.MouseEvent('pointerleave', { bubbles: true }))
  adapter.dispose()
  assert.equal(document.querySelector('[data-prts-conversation-scale]'), null)
  assert.equal(document.querySelector('[data-prts-conversation-preview]'), null)
})
