import {test,expect} from '@playwright/test'

test('summary hover scrolls long titles and streams replies without opening the session',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message))
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'full'})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.sessionList.getSnapshot()
    r.sessionList.set({...old,byId:{...old.byId,'fixture-session':{...old.byId['fixture-session'],displayTitle:'这是一个非常长的会话标题，用于验证工作区状态预览悬停时自动滚动并完整展示标题内容'}}})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  const item=page.locator('[data-prts-session-summary-item="fixture-session"]')
  await item.hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(reply).toContainText('当前进度正常')
  const listBox=await page.locator('[data-prts-summary-list]:visible').boundingBox()
  const replyBox=await reply.boundingBox()
  expect(replyBox.x).toBeGreaterThan(listBox.x+listBox.width)
  expect(replyBox.height).toBeLessThan(150)
  await expect.poll(()=>item.locator('[data-prts-summary-title] > span').evaluate(el=>el.getAnimations().length)).toBe(1)
  await page.waitForTimeout(1100)
  expect(await item.locator('[data-prts-summary-title] > span').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none')
  await page.evaluate(()=>{
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['reply'],nodes:new Map([['reply',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'最新检查结果：已经完成。'}]}}]])})
  })
  await expect(reply).toContainText('已经完成')
  await reply.hover()
  await expect(reply).toBeVisible()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
  await page.screenshot({path:'/tmp/prts-summary-preview-fixture.png'})
  await page.mouse.move(1000,800)
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(0)
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').focus()
  await item.focus()
  await expect(reply).toContainText('已经完成')
  await item.click()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  expect(errors).toEqual([])
})

test('pending choice preview shows current questions rather than previous prose',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{
      running:true,pendingInteraction:{kind:'question',questions:[{question:'接下来使用哪种部署方式？',options:[{label:'本地运行'},{label:'Docker 部署'}]}]}
    }]]))
  })
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(reply).toContainText('等待你的选择')
  await expect(reply.locator('[data-prts-preview-choices] > span')).toHaveText(['本地运行','Docker 部署'])
  await page.waitForTimeout(400)
  await expect(reply).not.toContainText('当前进度正常')
  await reply.screenshot({path:'/tmp/prts-preview-choices.png'})
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
})

for (const multiSelect of [false,true]) {
  test('answer panel survives crossing the gap and submits '+(multiSelect?'multiple choices':'one choice'),async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
    await page.goto('/tests/fixtures/rc7-harness.html')
    await page.evaluate(multiSelect=>{
      const r=window.__PRTS_FIXTURE_RUNTIME__
      r.answers=[]
      r.sessionStatus.set(new Map([['fixture-session',{running:true,pendingInteraction:{
        kind:'question',questions:[{id:'deploy',question:'选择部署方式',multiSelect,options:[{label:'本地'},{label:'容器'}]}],
        answer:async value=>{r.answers.push(value)}
      }}]]))
    },multiSelect)
    await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
    await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
    await expect(page.getByRole('button',{name:'直接回答',exact:true})).toHaveCount(0)
    const dialog=page.locator('[data-prts-preview-editing]')
    const bounds=await dialog.boundingBox()
    await page.mouse.move(bounds.x-5,bounds.y+12)
    await page.waitForTimeout(100)
    await dialog.hover()
    await page.waitForTimeout(450)
    await expect(dialog).toBeVisible()
    await expect(page.locator('[data-prts-session-summary-popover="warning"]')).toBeVisible()
    await expect(page.locator('[data-prts-session-summary-item="fixture-session"]')).toBeVisible()
    await expect(dialog.getByRole('button',{name:'提交回答',exact:true})).toBeDisabled()
    await dialog.getByRole('button',{name:'本地',exact:true}).click()
    await dialog.getByRole('button',{name:'容器',exact:true}).click()
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.answers)).toEqual([])
    await dialog.getByRole('button',{name:'提交回答',exact:true}).click()
    await expect(dialog).toHaveCount(0)
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.answers)).toEqual([{answers:[{id:'deploy',selected:multiSelect?['本地','容器']:['容器']}]}])
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
  })
}
test('direct answer rejects a question withdrawn while editing',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    r.answers=[]
    r.sessionStatus.set(new Map([['fixture-session',{running:true,pendingInteraction:{
      kind:'question',questions:[{id:'q',question:'继续吗',options:[{label:'继续'}]}],
      answer:async value=>{r.answers.push(value)}
    }}]]))
  })
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  await expect(page.getByRole('button',{name:'直接回答',exact:true})).toHaveCount(0)
  const dialog=page.locator('[data-prts-preview-editing]')
  await dialog.getByRole('button',{name:'继续',exact:true}).click()
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map()))
  await expect(dialog).toContainText('问题已更新或结束')
  await expect(dialog.getByRole('button',{name:'提交回答',exact:true})).toBeDisabled()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.answers)).toEqual([])
  await dialog.getByRole('button',{name:'取消',exact:true}).click()
  await expect(dialog).toHaveCount(0)
})

test('direct answer prevents duplicate submission and allows retry after failure',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    r.attempts=0
    r.sessionStatus.set(new Map([['fixture-session',{running:true,pendingInteraction:{
      kind:'question',questions:[{id:'q',question:'选择部署方式',options:[{label:'本地运行',description:'直接在当前设备启动服务。'}]}],
      answer:()=>{r.attempts++;return new Promise((resolve,reject)=>{r.finishAnswer=resolve;r.failAnswer=reject})}
    }}]]))
  })
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  await expect(page.getByRole('button',{name:'直接回答',exact:true})).toHaveCount(0)
  const dialog=page.locator('[data-prts-preview-editing]')
  await dialog.locator('[data-prts-preview-choices] button').click()
  await expect(dialog.locator('[data-prts-preview-choices] button')).toHaveAttribute('aria-pressed','true')
  await dialog.screenshot({path:'/tmp/prts-direct-answer.png'})
  await dialog.getByRole('button',{name:'提交回答',exact:true}).click()
  await expect(dialog.getByRole('button',{name:'正在提交…',exact:true})).toBeDisabled()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.attempts)).toBe(1)
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.failAnswer(Error('offline')))
  await expect(dialog).toContainText('提交失败')
  await dialog.getByRole('button',{name:'提交回答',exact:true}).click()
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.finishAnswer())
  await expect(dialog).toHaveCount(0)
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(1)
  await expect(page.getByRole('button',{name:'关闭预览',exact:true})).toBeVisible()
  await page.mouse.move(1100,850)
  await page.waitForTimeout(700)
  await expect(page.getByRole('button',{name:'关闭预览',exact:true})).toBeVisible()
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{running:false,completionUnread:true}]])))
  await expect(page.locator('[data-prts-preview-state="done"]')).toBeVisible()
  await page.getByRole('button',{name:'关闭预览',exact:true}).click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(0)
})

test('clicking the preview session still opens the session and closes its answer panel',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    r.sessionStatus.set(new Map([['fixture-session',{pendingInteraction:{
      kind:'question',questions:[{id:'q',question:'继续吗',options:[{label:'继续'}]}],answer:async()=>{}
    }}]]))
  })
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  const item=page.locator('[data-prts-session-summary-item="fixture-session"]')
  await item.hover()
  await expect(page.locator('[data-prts-preview-editing]')).toBeVisible()
  await page.locator('[data-prts-preview-editing]').hover()
  await page.mouse.move(1100,850)
  await expect(page.locator('[data-prts-preview-editing]')).toHaveCount(0)
  await expect(page.locator('[data-prts-session-summary-popover="warning"]')).toBeHidden()
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await item.hover()
  await expect(page.locator('[data-prts-preview-editing]')).toBeVisible()
  await item.click()
  await expect(page.locator('[data-prts-preview-editing]')).toHaveCount(0)
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
})

for (const [label,outcome] of [['仅允许本次','allowed-once'],['拒绝','rejected']]) {
  test('approval preview submits '+outcome+' without opening a session',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
    await page.goto('/tests/fixtures/rc7-harness.html')
    await page.evaluate(()=>{
      const r=window.__PRTS_FIXTURE_RUNTIME__
      r.decisions=[]
      r.approval={kind:'approval',answerable:true,toolName:'终端',reason:'执行测试命令',
        answer:async decision=>{r.decisions.push(decision);r.approval.answerable=false}}
      r.sessionStatus.set(new Map([['fixture-session',{pendingInteraction:r.approval}]]))
    })
    await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
    await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
    const dialog=page.locator('[data-prts-preview-editing]')
    await dialog.hover()
    await expect(dialog).toContainText('终端：执行测试命令')
    await expect(dialog.getByRole('button',{name:'提交审批',exact:true})).toBeDisabled()
    await dialog.getByRole('button',{name:label,exact:true}).click()
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.decisions)).toEqual([])
    await dialog.getByRole('button',{name:'提交审批',exact:true}).click()
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.decisions)).toEqual([outcome])
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
    await expect(dialog).toHaveCount(0)
  })
}

test('withdrawn approval cannot be submitted from its preview',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    r.decisions=[]
    r.approval={kind:'approval',answerable:true,toolName:'终端',reason:'执行测试命令',
      answer:async decision=>r.decisions.push(decision)}
    r.sessionStatus.set(new Map([['fixture-session',{pendingInteraction:r.approval}]]))
  })
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const dialog=page.locator('[data-prts-preview-editing]')
  await dialog.getByRole('button',{name:'仅允许本次',exact:true}).click()
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.approval.answerable=false)
  await dialog.getByRole('button',{name:'提交审批',exact:true}).click()
  await expect(dialog).toContainText('问题状态已变化')
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.decisions)).toEqual([])
})

test('new user input clears previous reply until the current turn produces prose',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(reply).toContainText('当前进度正常')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    const old=r.previewChat.getSnapshot()
    r.previewChat.set({...old,order:[...old.order,'new-input'],nodes:new Map([...old.nodes,['new-input',{kind:'user'}]])})
  })
  await expect(reply).toContainText('正在处理，等待本轮正文输出完成')
  await expect(reply).not.toContainText('当前进度正常')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.previewChat.getSnapshot()
    r.previewChat.set({...old,order:[...old.order,'new-output'],nodes:new Map([...old.nodes,['new-output',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'本轮已开始检查'}]}}]])})
  })
  await expect(reply).toContainText('本轮已开始检查')
})

test('reply entry opens a scrollable detail starting at the beginning',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['reply'],nodes:new Map([['reply',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'这是开头\n'+'详细进度说明\n'.repeat(80)+'这是结尾'}]}}]])})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await reply.locator('[data-prts-reply-entry]').hover()
  const detail=page.locator('[data-prts-reply-detail]:visible')
  const body=detail.locator('[data-prts-preview-body]')
  await expect(body).toContainText('这是开头')
  expect(await body.evaluate(el=>el.scrollTop)).toBe(0)
  await body.hover()
  await page.mouse.wheel(0,20000)
  await expect.poll(()=>body.evaluate(el=>el.scrollTop>0)).toBe(true)
  await expect(reply).toBeVisible()
  await expect(page.locator('[data-prts-session-summary-item="fixture-session"]')).toBeVisible()
  await expect(body).toContainText('这是结尾')
})

test('double clicking noninteractive preview content opens its session once',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(reply).toContainText('当前进度正常')
  await reply.locator(':scope > strong').dblclick()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  await expect(reply).toHaveCount(0)
})
test('double clicking an answer option does not open the session',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{pendingInteraction:{
      kind:'question',questions:[{id:'q',question:'继续吗',options:[{label:'继续',description:'执行后续任务'}]}],answer:async()=>{}
    }}]]))
  })
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-preview-editing]')
  await reply.locator('[data-prts-preview-choices] small').dblclick()
  await expect(reply).toBeVisible()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
  await reply.locator(':scope > strong').dblclick()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
})

for (const [state,key] of [['ongoing','previewOngoing'],['warning','previewWarning'],['done','previewDone']]) {
  test('disabled '+state+' preview retains the clickable session list',async({page})=>{
    await page.addInitScript(key=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,[key]:false})),key)
    await page.goto('/tests/fixtures/rc7-harness.html')
    await page.evaluate(state=>{
      const r=window.__PRTS_FIXTURE_RUNTIME__
      if(state==='done') for(const el of document.querySelectorAll('[data-state="ongoing"]')) el.setAttribute('data-state','done')
      r.sessionStatus.set(new Map([['fixture-session',state==='ongoing'?{running:true}:state==='done'?{running:false,completionUnread:true}:{pendingInteraction:{kind:'question',questions:[]}}]]))
    },state)
    await page.locator('[data-prts-session-summary-trigger="'+state+'"]').hover()
    const item=page.locator('[data-prts-session-summary-item="fixture-session"]')
    await item.hover()
    await page.waitForTimeout(200)
    await expect(page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')).toHaveCount(0)
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(0)
    await item.click()
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  })
}
test('double click navigation can be disabled while keeping the preview',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,previewDoubleClick:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(reply).toContainText('当前进度正常')
  await reply.locator(':scope > strong').dblclick()
  await expect(reply).toBeVisible()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
})
test('preview switches persist independently in assistance settings',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="assistance"]').click()
  for(const key of ['previewOngoing','previewWarning','previewDone','previewDoubleClick']){
    const control=page.locator('[data-prts-setting-switch="'+key+'"]')
    await expect(control).toHaveAttribute('aria-checked','true')
    await control.click()
    await expect(control).toHaveAttribute('aria-checked','false')
    expect(await page.evaluate(key=>JSON.parse(localStorage.getItem('dsh.ui.prts.v1'))[key],key)).toBe(false)
  }
})

test('master preview switch removes the whole feature and hides details without resetting choices',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,previewDone:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await expect(page.locator('[data-prts-session-summary-trigger="ongoing"]')).toBeVisible()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="assistance"]').click()
  await page.locator('[data-prts-settings-section="assistance"]').screenshot({path:'/tmp/prts-preview-settings-hierarchy.png'})
  const master=page.locator('[data-prts-setting-switch="sessionPreview"]')
  await master.click()
  await expect(master).toHaveAttribute('aria-checked','false')
  await expect(page.locator('[data-prts-preview-options]')).toBeHidden()
  await expect(page.locator('[data-prts-owned-session-summary]')).toHaveCount(0)
  await expect(page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')).toHaveCount(0)
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(0)
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).sessionPreview)).toBe(false)
  await master.click()
  await expect(page.locator('[data-prts-preview-options]')).toBeVisible()
  await expect(page.locator('[data-prts-setting-switch="previewDone"]')).toHaveAttribute('aria-checked','false')
  await expect(page.locator('[data-prts-session-summary-trigger="ongoing"]')).toHaveCount(1)
})

test('running preview appends completed replies without showing streamed fragments or moving scroll',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    r.previewChat.set({order:['first','second'],nodes:new Map([
      ['first',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'第一条完成。\n\n'+'详细结果。\n\n'.repeat(40)}]}}],
      ['second',{kind:'assistant-step',data:{status:'running',blocks:[{kind:'text',text:'第二条未完成'}]}}]
    ])})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const reply=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  const body=reply.locator(':scope > [data-prts-preview-body]')
  await expect(reply.locator('article')).toHaveCount(1)
  await expect(reply).not.toContainText('第二条未完成')
  await reply.hover()
  await body.evaluate(el=>el.scrollTop=70)
  const top=await body.evaluate(el=>el.scrollTop)
  await reply.locator('[data-prts-reply-entry]').first().hover()
  const detail=page.locator('[data-prts-reply-detail]:visible')
  await expect(detail).toContainText('第一条完成')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.previewChat.getSnapshot()
    r.previewChat.set({...old,nodes:new Map([...old.nodes,['second',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'第二条已完成'}]}}]])})
  })
  await expect(reply.locator('article')).toHaveCount(2)
  expect((await reply.locator('[data-prts-reply-entry]').first().boundingBox()).height).toBeLessThanOrEqual(56)
  await expect(reply.locator('[data-prts-reply-entry]').first()).toContainText('第二条已完成')
  await expect(reply).toContainText('第二条已完成')
  expect(await body.evaluate(el=>el.scrollTop)).toBe(top)
  await expect(detail).toContainText('第一条完成')
  await expect(detail).not.toContainText('第二条已完成')
  await reply.locator('[data-prts-reply-entry]').first().hover()
  await expect(detail).toContainText('第二条已完成')
  await detail.hover()
  await page.waitForTimeout(400)
  await expect(reply).toBeVisible()
  await expect(page.locator('[data-prts-session-summary-item="fixture-session"]')).toBeVisible()
  await page.mouse.move(1200,850)
  await expect(detail).toHaveCount(0)
})

for(const next of ['done','question','approval']){
  test('open running preview transitions in place to '+next,async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
    await page.goto('/tests/fixtures/rc7-harness.html')
    await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
    await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
    const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
    await expect(panel).toContainText('当前进度正常')
    await panel.locator('[data-prts-reply-entry]').first().hover()
    await page.locator('[data-prts-reply-detail]:visible').hover()
    await panel.evaluate(el=>el.dataset.transitionIdentity='original')
    await page.evaluate(next=>{
      const r=window.__PRTS_FIXTURE_RUNTIME__
      for(const el of document.querySelectorAll('[data-state="ongoing"]')) el.removeAttribute('data-state')
      const pendingInteraction=next==='question'?{
        kind:'question',questions:[{id:'next',question:'下一步如何处理？',options:[{label:'继续'}]}],answer:async()=>{}
      }:next==='approval'?{
        kind:'approval',answerable:true,toolName:'终端',reason:'执行下一步命令',answer:async()=>{}
      }:undefined
      r.sessionStatus.set(new Map([['fixture-session',{running:next!=='done',completionUnread:next==='done',pendingInteraction}]]))
    },next)
    await expect(panel).toHaveAttribute('data-transition-identity','original')
    await expect(panel).toContainText(next==='done'?'已完成 · 最后回复':next==='question'?'下一步如何处理':'执行下一步命令')
    await page.waitForTimeout(450)
    await expect(panel).toBeVisible()
    expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(1)
    if(next!=='done') await expect(panel.getByRole('button',{name:next==='question'?'继续':'仅允许本次',exact:true})).toBeVisible()
    await page.mouse.move(1200,850)
    await page.waitForTimeout(700)
    await expect(panel).toBeVisible()
    await page.mouse.click(1200,850)
    await expect(panel).toHaveCount(0)
  })
}
