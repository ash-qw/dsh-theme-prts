import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createMissionDispatchAdapter } from '../src/client/mission-dispatch-adapter.js'

const header = '<button aria-expanded="false" aria-controls="notice-body"><span><svg><use href="#request" /></svg></span><span>Execution requested</span><time datetime="2026-11-20T09:12:00Z">17:12</time><svg></svg></button>'
const flush = window => new Promise(resolve => window.setTimeout(resolve, 0))

test('mission decoration preserves native controls, text and handlers and fully cleans up', async () => {
  const dom = new JSDOM(`<main data-prts-region="operation"><section data-turn-trigger>${header}</section></main>`)
  const { document } = dom.window
  const card = document.querySelector('section')
  const before = card.outerHTML
  const button = card.firstElementChild
  let clicks = 0
  button.addEventListener('click', () => clicks++)
  const adapter = createMissionDispatchAdapter({ document, window: dom.window, emblemImage: 'data:image/png;base64,AA==' })
  adapter.start()
  adapter.start()
  await flush(dom.window)
  assert.equal(card.querySelector('button'), button)
  assert.equal(card.querySelectorAll(':scope > button > [data-prts-mission-decoration]').length, 3)
  assert.equal(card.querySelector('[data-prts-mission-part="title"]').textContent, 'Execution requested')
  assert.equal(card.querySelector('time').dateTime, '2026-11-20T09:12:00Z')
  for (const decoration of card.querySelectorAll('[data-prts-mission-decoration]')) {
    assert.equal(decoration.getAttribute('aria-hidden'), 'true')
  }
  button.click()
  assert.equal(clicks, 1)
  adapter.dispose()
  assert.equal(card.outerHTML, before)
  adapter.start()
  await flush(dom.window)
  assert.equal(card.querySelectorAll(':scope > button > [data-prts-mission-decoration]').length, 3)
  adapter.dispose()
  dom.window.close()
})

test('handles streamed cards, replaced header children, unmount and operation replacement', async () => {
  const dom = new JSDOM('<main data-prts-region="operation"></main>')
  const { document } = dom.window
  const adapter = createMissionDispatchAdapter({ document, window: dom.window })
  adapter.start()
  const card = document.createElement('section')
  card.setAttribute('data-turn-trigger', '')
  document.querySelector('main').append(card)
  card.innerHTML = header
  await flush(dom.window)
  assert.equal(card.hasAttribute('data-prts-mission'), true)
  const oldTitle = card.querySelector('[data-prts-mission-part="title"]')
  const button = card.firstElementChild
  button.innerHTML = header.slice(header.indexOf('>') + 1, header.lastIndexOf('</button>'))
  await flush(dom.window)
  assert.equal(oldTitle.hasAttribute('data-prts-mission-part'), false)
  assert.equal(button.querySelectorAll(':scope > [data-prts-mission-decoration]').length, 3)
  const newOperation = document.createElement('main')
  newOperation.setAttribute('data-prts-region', 'operation')
  newOperation.innerHTML = `<section data-turn-trigger>${header}</section>`
  document.querySelector('main').replaceWith(newOperation)
  adapter.start()
  await flush(dom.window)
  assert.equal(card.hasAttribute('data-prts-mission'), false)
  assert.equal(newOperation.querySelector('section').hasAttribute('data-prts-mission'), true)
  const removed = newOperation.firstElementChild
  removed.remove()
  await flush(dom.window)
  assert.equal(removed.hasAttribute('data-prts-mission'), false)
  adapter.dispose()
  dom.window.close()
})

test('leaves unknown host structures, continuations and triggers outside the conversation alone', () => {
  const dom = new JSDOM(`<section data-turn-trigger>${header}</section><main data-prts-region="operation"><div data-generation-continuation>Continue</div><section data-turn-trigger><button>Unknown structure</button></section></main>`)
  const { document } = dom.window
  const before = document.body.innerHTML
  const adapter = createMissionDispatchAdapter({ document, window: dom.window })
  adapter.start()
  assert.equal(document.body.innerHTML, before)
  adapter.dispose()
  dom.window.close()
})

test('disposal cancels disclosure motion and removes inaccessible closing copies', async () => {
  const dom = new JSDOM(`<main data-prts-region="operation"><section data-turn-trigger>${header}</section></main>`)
  const { document } = dom.window
  const animations = []
  dom.window.Element.prototype.animate = () => {
    const animation = { cancelled: false, cancel() { this.cancelled = true } }
    animations.push(animation)
    return animation
  }
  const card = document.querySelector('section')
  const before = card.outerHTML
  const button = card.firstElementChild
  button.onclick = () => {
    const open = button.getAttribute('aria-expanded') === 'true'
    button.setAttribute('aria-expanded', String(!open))
    if (open) card.querySelector(':scope > div').remove()
    else {
      const body = document.createElement('div')
      body.id = 'notice-body'
      body.innerHTML = '<p id="notice-text">Request details</p>'
      body.getBoundingClientRect = () => ({ height: 120 })
      card.append(body)
    }
  }
  const adapter = createMissionDispatchAdapter({ document, window: dom.window })
  adapter.start()
  button.click()
  await flush(dom.window)
  assert.equal(animations.length, 1)
  button.click()
  await flush(dom.window)
  assert.equal(animations[0].cancelled, true)
  const ghost = card.querySelector('[data-prts-mission-exit]')
  assert.equal(ghost.getAttribute('aria-hidden'), 'true')
  assert.equal(ghost.hasAttribute('inert'), true)
  assert.equal(ghost.querySelectorAll('[id]').length, 0)
  assert.equal(document.getElementById('notice-body'), null)
  adapter.dispose()
  assert.equal(animations[1].cancelled, true)
  assert.equal(card.outerHTML, before)
  dom.window.close()
})
