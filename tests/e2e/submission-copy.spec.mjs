import {test,expect} from '@playwright/test'

for(const style of ['native','deck-chat'])test(`submission copy keeps its appearance when confirmed: ${style}`,async({page})=>{
  await page.addInitScript(style=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,conversationStyle:style})),style)
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>{
    const node=document.createElement('div')
    node.id='submission-copy-probe'
    node.className='host_userRow'
    node.setAttribute('data-submission-echo','')
    node.innerHTML='<div class="host_bubble">测试消息</div><div><button aria-label="复制">复制</button></div>'
    document.querySelector('[data-prts-region="operation"]').append(node)
  })
  const button=page.locator('#submission-copy-probe button')
  await expect(button).toHaveAttribute('data-prts-conversation-control','micro')
  const appearance=()=>button.evaluate(node=>{
    const css=getComputedStyle(node)
    return Object.fromEntries(['backgroundColor','color','border','borderRadius','clipPath','transform','position'].map(key=>[key,css[key]]))
  })
  const before=await appearance()
  await page.evaluate(()=>{
    const echo=document.querySelector('#submission-copy-probe')
    const durable=echo.cloneNode(true)
    durable.removeAttribute('data-submission-echo')
    durable.setAttribute('data-chat-flow-kind','user')
    durable.querySelector('button').removeAttribute('data-prts-conversation-control')
    echo.replaceWith(durable)
  })
  await expect(button).toHaveAttribute('data-prts-conversation-control','micro')
  expect(await appearance()).toEqual(before)
})
