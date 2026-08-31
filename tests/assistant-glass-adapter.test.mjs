import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import {
  ASSISTANT_STATE_ATTRIBUTE,
  ASSISTANT_SURFACE_ATTRIBUTE,
  createAssistantGlassAdapter,
  resolveAssistantSurface,
} from '../src/client/assistant-glass-adapter.js'

function domWith(body) {
  return new JSDOM(`<!doctype html><html><body><main data-prts-region="operation">${body}</main></body></html>`, {
    pretendToBeVisual: true,
  })
}

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 24))
}

test('crosses the rc.7 display-contents slot and marks the real assistant body', () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <div data-slot="conversation.chat.node" style="display: contents">
        <div class="Sxvs8a_root"><div class="Sxvs8a_body"><p>真实回复</p></div></div>
      </div>
    </div>
  `)
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const slot = step.querySelector('[data-slot="conversation.chat.node"]')
  const body = step.querySelector('.Sxvs8a_body')

  assert.equal(resolveAssistantSurface(step), body)

  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()

  assert.equal(body.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  assert.equal(step.getAttribute(ASSISTANT_STATE_ATTRIBUTE), 'body')
  assert.equal(slot.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)
  assert.equal(step.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)
  adapter.dispose()
})

test('marks a streamed assistant body added after startup', async () => {
  const dom = domWith('<div data-chat-flow-kind="assistant-step"></div>')
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()

  assert.equal(step.getAttribute(ASSISTANT_STATE_ATTRIBUTE), 'unresolved')

  const root = document.createElement('div')
  root.className = 'Sxvs8a_root'
  root.innerHTML = '<div class="Sxvs8a_body"><p>流式回复</p></div>'
  step.append(root)
  await flush(dom.window)

  const body = root.firstElementChild
  assert.equal(body.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  assert.equal(step.getAttribute(ASSISTANT_STATE_ATTRIBUTE), 'body')
  adapter.dispose()
})

test('keeps a resolved body stable while streamed content grows inside it', async () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <div class="Sxvs8a_root"><div class="Sxvs8a_body"><div data-markdown>开始</div></div></div>
    </div>
  `)
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const body = step.querySelector('.Sxvs8a_body')
  const elementPrototype = dom.window.Element.prototype
  const nativeQuerySelectorAll = elementPrototype.querySelectorAll
  let fullStepScans = 0
  elementPrototype.querySelectorAll = function (selector) {
    if (this === step) fullStepScans += 1
    return nativeQuerySelectorAll.call(this, selector)
  }
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()
  fullStepScans = 0

  for (let index = 0; index < 40; index += 1) {
    body.firstElementChild.append(document.createElement('span'))
  }
  await flush(dom.window)

  assert.equal(body.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  assert.equal(fullStepScans, 0, 'streamed descendants must not invalidate an already resolved body')
  adapter.dispose()
  elementPrototype.querySelectorAll = nativeQuerySelectorAll
})

test('uses the first content root as a safe fallback and never marks the full row', () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <section class="future_runtime_content"><p>未来版本回复</p></section>
    </div>
  `)
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const root = step.firstElementChild
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()

  assert.equal(root.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'root')
  assert.equal(step.getAttribute(ASSISTANT_STATE_ATTRIBUTE), 'root')
  assert.equal(step.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)
  adapter.dispose()
})

test('moves a stale marker when the runtime replaces an assistant body', async () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <div class="Sxvs8a_root"><div class="Sxvs8a_body">第一版</div></div>
    </div>
  `)
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()
  const oldBody = step.querySelector('[class$="_body"]')

  oldBody.replaceWith(Object.assign(document.createElement('div'), {
    className: 'Sxvs8a_body',
    textContent: '第二版',
  }))
  await flush(dom.window)

  assert.equal(oldBody.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)
  assert.equal(step.querySelector('[class$="_body"]').getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  adapter.dispose()
})

test('reclassifies a stable surface when its own identity attributes change', async () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <div class="Sxvs8a_root"><div class="Sxvs8a_body"><div data-markdown>回复</div></div></div>
    </div>
  `)
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const body = step.querySelector('.Sxvs8a_body')
  const markdown = body.firstElementChild
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()

  body.className = 'future_runtime_wrapper'
  await flush(dom.window)

  assert.equal(body.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)
  assert.equal(markdown.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  assert.equal(step.getAttribute(ASSISTANT_STATE_ATTRIBUTE), 'body')
  adapter.dispose()
})

test('dispose removes every owned assistant marker', () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <div class="Sxvs8a_root"><div class="Sxvs8a_body">回复</div></div>
    </div>
  `)
  const { document } = dom.window
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()
  adapter.dispose()

  assert.equal(document.querySelector(`[${ASSISTANT_SURFACE_ATTRIBUTE}]`), null)
  assert.equal(document.querySelector(`[${ASSISTANT_STATE_ATTRIBUTE}]`), null)
})

test('ignores a leading scroll sentinel and completion toolbar around a multi-class body', () => {
  const dom = domWith(`
    <div data-chat-flow-kind="assistant-step">
      <span data-slot="conversation.scroll.sentinel"></span>
      <div data-slot="conversation.chat.node" style="display: contents">
        <div class="Sxvs8a_root">
          <div class="Sxvs8a_body completed hydrated"><div data-markdown><p>联网结果</p></div></div>
          <div class="Sxvs8a_toolbar" role="toolbar"><button>复制</button></div>
        </div>
      </div>
    </div>
  `)
  const { document } = dom.window
  const step = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  const body = step.querySelector('.Sxvs8a_body')
  const toolbar = step.querySelector('[role="toolbar"]')
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()

  assert.equal(resolveAssistantSurface(step), body)
  assert.equal(body.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  assert.equal(toolbar.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)
  adapter.dispose()
})

test('restores the same glass surface after a virtualized final reply is removed and reinserted', async () => {
  const dom = domWith(`
    <div id="flow">
      <div data-chat-flow-kind="assistant-step">
        <div class="Sxvs8a_root">
          <div class="Sxvs8a_body hydrated"><div data-markdown>最后一条回复</div></div>
          <div data-slot="conversation.actions"></div>
        </div>
      </div>
    </div>
  `)
  const { document } = dom.window
  const flow = document.querySelector('#flow')
  const step = flow.firstElementChild
  const body = step.querySelector('.Sxvs8a_body')
  const adapter = createAssistantGlassAdapter({ document, window: dom.window })
  adapter.start()
  assert.equal(body.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')

  step.remove()
  await flush(dom.window)
  assert.equal(body.hasAttribute(ASSISTANT_SURFACE_ATTRIBUTE), false)

  flow.append(step)
  body.classList.add('completed')
  step.prepend(Object.assign(document.createElement('span'), { className: 'viewport_sentinel' }))
  await flush(dom.window)

  assert.equal(body.getAttribute(ASSISTANT_SURFACE_ATTRIBUTE), 'body')
  assert.equal(step.getAttribute(ASSISTANT_STATE_ATTRIBUTE), 'body')
  adapter.dispose()
})
