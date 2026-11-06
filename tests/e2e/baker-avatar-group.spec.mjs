import {test,expect} from '@playwright/test'

test('Baker assigns one avatar to the unfolded response without moving bubble alignment',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,conversationStyle:'deck-chat'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>{
    const sample=document.createElement('section');sample.id='avatar-sample'
    const reply=(id,text)=>`<div id="${id}" data-chat-flow-kind="assistant-step" data-chat-turn="900" ${id!=='avatar-final'?'data-turn-process-member="true"':''}><div class="sample_body"><div data-markdown><p>${text}</p></div></div></div>`
    sample.innerHTML=`<div data-chat-flow-kind="user">测试轮次</div><section id="avatar-process">${reply('avatar-first','第一段回复')}${reply('avatar-second','继续处理')}</section>${reply('avatar-final','最终总结')}`
    document.querySelector('[data-conversation-scroll]').prepend(sample)
  })
  const first=page.locator('#avatar-first'),second=page.locator('#avatar-second'),final=page.locator('#avatar-final')
  await expect(second).toHaveAttribute('data-prts-avatar-hidden','')
  const content=e=>e.evaluate(n=>getComputedStyle(n,'::before').content)
  expect(await content(first)).not.toBe('none')
  expect(await content(second)).toBe('none')
  expect(await content(final)).toBe('none')
  const left=()=>final.locator('.sample_body').evaluate(e=>e.getBoundingClientRect().left)
  const initialLeft=await left()
  await page.locator('#avatar-process').evaluate(e=>e.setAttribute('hidden','until-found'))
  await expect(final).not.toHaveAttribute('data-prts-avatar-hidden')
  expect(await content(final)).not.toBe('none')
  expect(await left()).toBe(initialLeft)
  await page.locator('#avatar-process').evaluate(e=>e.removeAttribute('hidden'))
  await expect(final).toHaveAttribute('data-prts-avatar-hidden','')
  await expect(first).not.toHaveAttribute('data-prts-avatar-hidden')
  expect(await left()).toBe(initialLeft)
  await page.locator('#avatar-sample').screenshot({path:'/tmp/prts-baker-avatar-group.png'})
})


test('Baker grouping switch persists and restores individual avatars immediately',async({page})=>{
  await page.addInitScript(()=>{if(!localStorage.getItem('prtsFixtureNativeConfig'))localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({value:{enabled:true,bootAnimation:false,conversationStyle:'deck-chat'}}))})
  await page.goto('/tests/fixtures/rc2-harness.html?native-forms')
  await page.evaluate(()=>{
    const section=document.createElement('section')
    section.innerHTML=[1,2].map(i=>`<div id="option-reply-${i}" data-chat-flow-kind="assistant-step" data-chat-turn="901" data-turn-process-member="true"><div class="sample_body"><p>过程回复 ${i}</p></div></div>`).join('')
    document.querySelector('[data-conversation-scroll]').append(section)
  })
  const second=page.locator('#option-reply-2')
  await expect(second).toHaveAttribute('data-prts-avatar-hidden','')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="appearance"]').click()
  const toggle=page.getByRole('switch',{name:'合并过程回复头像',exact:true})
  await expect(toggle).toHaveAttribute('aria-checked','true')
  expect(await page.locator('[data-prts-avatars]').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('[data-prts-baker-options]')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
  await expect(page.locator('[data-prts-particle-layer]')).toBeHidden()
  await toggle.click()
  await expect(second).not.toHaveAttribute('data-prts-avatar-hidden')
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('prtsFixtureNativeConfig')).value.bakerGroupAvatars)).toBe(false)
  await page.reload()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="appearance"]').click()
  await expect(toggle).toHaveAttribute('aria-checked','false')
  await toggle.press('Space')
  await expect(toggle).toHaveAttribute('aria-checked','true')
  await page.locator('[data-prts-setting-key="conversationStyle"][data-prts-setting-value="native"]').click()
  await expect(toggle).toBeHidden()
  await expect(page.locator('[data-prts-particle-layer]')).toBeVisible()
})

test('Classic body emblem switch persists and stays independent of Baker',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,conversationStyle:'native'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="appearance"]').click()
  const toggle=page.getByRole('switch',{name:'正文徽记',exact:true})
  const canvas=page.locator('[data-prts-particle-layer]')
  await expect(toggle).toHaveAttribute('aria-checked','true')
  await expect(canvas).toBeVisible()
  await toggle.click()
  await expect(canvas).toBeHidden()
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationEmblem)).toBe(false)
  await page.locator('[data-prts-setting-key="conversationStyle"][data-prts-setting-value="deck-chat"]').click()
  await expect(toggle).toBeHidden()
  await expect(canvas).toBeHidden()
  await page.locator('[data-prts-setting-key="conversationStyle"][data-prts-setting-value="native"]').click()
  await expect(toggle).toHaveAttribute('aria-checked','false')
  await expect(canvas).toBeHidden()
  await toggle.click()
  await expect(canvas).toBeVisible()
})

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) for (const foldedReplies of ['all', 'final']) {
  test(`Baker keeps one visible avatar per reply turn (${scheme}, ${width}, ${foldedReplies})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version:12, enabled:true, bootAnimation:false, conversationStyle:'deck-chat', scheme, motion:'reduced',
    })), scheme)
    await page.goto('/tests/fixtures/rc2-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', 'deck-chat')
    await page.evaluate(({ scheme, foldedReplies }) => {
      document.documentElement.setAttribute('data-prts-scheme', scheme)
      const sample = document.createElement('section')
      sample.id = 'issue6-turn'
      const reply = (index, content) => `<div id="issue6-reply-${index}" data-chat-flow-kind="assistant-step" ${foldedReplies === 'final' && index < 4 ? 'data-turn-process-member="true"' : ''}><div class="issue6_body"><div data-markdown><p>${content}</p></div></div></div>`
      sample.innerHTML = `<div data-chat-flow-kind="user">本轮输入</div><div id="issue6-reasoning" data-chat-flow-kind="assistant-step" data-chat-group-part="reasoning"><div class="issue6_body">思考</div></div><div data-chat-flow-kind="turn-process">工作步骤</div><section id="issue6-process">${[0,1,2,3].map(index => reply(index, index === 0 ? '' : '中间正文')).join('')}</section>${reply(4,'最终回答')}`
      document.querySelector('[data-conversation-scroll]').prepend(sample)
    }, { scheme, foldedReplies })
    const rows = page.locator('#issue6-turn [id^="issue6-reply-"]')
    const shownIds = () => rows.evaluateAll(elements => elements.filter(element => getComputedStyle(element, '::before').content !== 'none').map(element => element.id))
    await expect.poll(shownIds).toEqual(['issue6-reply-1'])
    await page.locator('#issue6-reply-0 p').evaluate(element => { element.textContent = '第一条正文到达' })
    await expect.poll(shownIds).toEqual(['issue6-reply-0'])
    const final = page.locator('#issue6-reply-4')
    const originalLeft = await final.locator('.issue6_body').evaluate(element => element.getBoundingClientRect().left)
    await page.locator(foldedReplies === 'final' ? '#issue6-process' : '#issue6-reasoning').evaluate(element => element.setAttribute('data-turn-process-hidden', 'true'))
    await expect.poll(shownIds).toEqual([foldedReplies === 'final' ? 'issue6-reply-4' : 'issue6-reply-0'])
    await page.locator(foldedReplies === 'final' ? '#issue6-process' : '#issue6-reasoning').evaluate(element => element.removeAttribute('data-turn-process-hidden'))
    await expect.poll(shownIds).toEqual(['issue6-reply-0'])
    expect(await final.locator('.issue6_body').evaluate(element => element.getBoundingClientRect().left)).toBe(originalLeft)
    await page.locator('#issue6-reply-0').evaluate(element => { window.issue6First = element; element.remove() })
    await expect.poll(shownIds).toEqual(['issue6-reply-1'])
    await page.locator('#issue6-process').evaluate(element => element.prepend(window.issue6First))
    await expect.poll(shownIds).toEqual(['issue6-reply-0'])
    await page.locator('#issue6-turn').evaluate(element => element.insertAdjacentHTML('beforeend', '<div data-chat-flow-kind="steering">补充要求</div><div id="issue6-reply-next" data-chat-flow-kind="assistant-step"><div class="issue6_body"><p>下一轮</p></div></div>'))
    await expect.poll(shownIds).toEqual(['issue6-reply-0', 'issue6-reply-next'])
    expect(await page.locator('#issue6-turn [data-chat-flow-kind="turn-process"]').evaluate(element => getComputedStyle(element, '::before').content)).toBe('none')
  })
}

test('Baker legacy avatar aliases and simultaneous scopes do not create duplicate portraits', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({version:12, enabled:true, bootAnimation:false, conversationStyle:'deck-chat'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', 'deck-chat')
  await page.evaluate(() => {
    const fixture = document.createElement('section')
    fixture.id = 'issue6-legacy'
    fixture.innerHTML = '<div data-conversation-scroll><div data-message-role="user"></div><div id="legacy-browser-first" data-message-role="assistant"><div class="legacy_body">旧消息正文</div></div><div id="legacy-browser-final" data-chat-flow-kind="assistant-step"><div class="legacy_body">最终正文</div></div><div data-message-role="user"></div><div id="legacy-browser-owner" data-message-role="assistant"><div id="legacy-browser-alias" data-chat-flow-kind="assistant-step"><div class="legacy_body">同一条消息</div></div></div></div><div data-conversation-scroll><div id="legacy-browser-right" data-chat-flow-kind="assistant-step"><div class="legacy_body">另一会话</div></div><div id="legacy-browser-right-final" data-message-role="assistant"><div class="legacy_body">另一会话后续正文</div></div></div>'
    document.querySelector('[data-prts-region="operation"]').append(fixture)
  })
  const shown = () => page.locator('#issue6-legacy :is([data-message-role="assistant"], [data-chat-flow-kind="assistant-step"])').evaluateAll(elements => elements.filter(element => getComputedStyle(element, '::before').content !== 'none').map(element => element.id))
  await expect.poll(shown).toEqual(['legacy-browser-first', 'legacy-browser-owner', 'legacy-browser-right'])
  await page.locator('#legacy-browser-first').evaluate(element => element.setAttribute('hidden', ''))
  await expect.poll(shown).toEqual(['legacy-browser-final', 'legacy-browser-owner', 'legacy-browser-right'])
})

for (const foldedReplies of ['all', 'final']) {
  test(`Baker avoids avatar rescans for tool-only folds (${foldedReplies})`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version:12, enabled:true, bootAnimation:false, conversationStyle:'deck-chat', motion:'reduced',
    })))
    await page.goto('/tests/fixtures/rc2-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', 'deck-chat')
    await page.evaluate(foldedReplies => {
      const sample = document.createElement('section')
      sample.id = 'avatar-opt-turn'
      const reply = id => `<div id="${id}" data-chat-flow-kind="assistant-step"><div class="sample_body"><p>${id}</p></div></div>`
      const process = `<section id="avatar-opt-process"><div data-chat-flow-kind="tool-call"><span id="avatar-opt-tool">工具结果</span></div><div data-chat-flow-kind="assistant-step" data-chat-group-part="reasoning"><div class="sample_body">推理内容</div></div>${foldedReplies === 'final' ? reply('avatar-opt-first') : ''}</section>`
      sample.innerHTML = `<div data-chat-flow-kind="user">新轮次</div><button id="avatar-opt-toggle" aria-expanded="true">展开 / 收起</button>${foldedReplies === 'all' ? reply('avatar-opt-first') : ''}${process}${reply('avatar-opt-final')}`
      sample.querySelector('button').addEventListener('click', event => {
        const folded = event.currentTarget.getAttribute('aria-expanded') === 'true'
        event.currentTarget.setAttribute('aria-expanded', String(!folded))
        const process = sample.querySelector('#avatar-opt-process')
        process.toggleAttribute('hidden', folded)
        process.setAttribute('data-turn-process-hidden', String(folded))
        process.classList.toggle('collapsing', folded)
        sample.querySelector('#avatar-opt-tool').textContent = folded ? '折叠工具结果' : '展开工具结果'
      })
      document.querySelector('[data-conversation-scroll]').append(sample)
    }, foldedReplies)
    const first = page.locator('#avatar-opt-first')
    const final = page.locator('#avatar-opt-final')
    await expect(final).toHaveAttribute('data-prts-avatar-hidden', '')
    await page.evaluate(async () => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const operation = document.querySelector('[data-prts-region="operation"]')
      const original = operation.querySelectorAll
      window.avatarOptScans = 0
      operation.querySelectorAll = function (selector) {
        if (selector.includes('[data-chat-flow-kind="user"]') && selector.includes('[data-chat-flow-kind="assistant-step"]')) window.avatarOptScans += 1
        return original.call(this, selector)
      }
    })
    for (let index = 0; index < 4; index += 1) {
      await page.locator('#avatar-opt-toggle').click()
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      expect(await page.evaluate(() => window.avatarOptScans)).toBe(foldedReplies === 'all' ? 0 : index + 1)
      if (foldedReplies === 'final' && index % 2 === 0) {
        await expect(first).toBeHidden()
        await expect(final).not.toHaveAttribute('data-prts-avatar-hidden')
        expect(await final.evaluate(node => getComputedStyle(node, '::before').content)).not.toBe('none')
      } else {
        await expect(first).toBeVisible()
        await expect(first).not.toHaveAttribute('data-prts-avatar-hidden')
        await expect(final).toHaveAttribute('data-prts-avatar-hidden', '')
      }
    }
  })
}
