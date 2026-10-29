import {test,expect} from '@playwright/test'

test('status list stays open while the pointer crosses into its top-layer popover',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced'})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.sessionList.set({
    current:'fixture-session',ids:['fixture-session','fixture-done'],
    byId:{'fixture-session':{id:'fixture-session',displayTitle:'当前会话'},'fixture-done':{id:'fixture-done',displayTitle:'已完成会话',completed:true}},
  }))
  const trigger=page.locator('[data-prts-session-summary-trigger="done"]')
  await expect(trigger.locator('[data-prts-session-summary-count]')).toHaveText('1')
  await trigger.hover()
  const popover=page.locator('[data-prts-session-summary-popover="done"]')
  await expect(popover).toBeVisible()
  const button=await trigger.boundingBox(), panel=await popover.boundingBox()
  const x=button.x+button.width/2
  await page.mouse.move(x,button.y+button.height+2)
  await page.waitForTimeout(200)
  await page.mouse.move(x,panel.y+3)
  await page.waitForTimeout(200)
  await expect(popover).toBeVisible()
  await page.locator('[data-prts-session-summary-item="fixture-done"]').click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-done'])
})

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
  await expect(reply).toBeHidden()
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(1)
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').focus()
  await item.focus()
  await expect(reply).toContainText('已经完成')
  await item.click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
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
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,previewFollowWarning:true})))
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
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
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
  await expect(reply).toContainText('正在处理…')
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
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
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
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
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
    await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
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
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="assistance"]').click()
  for(const key of ['previewOngoing','previewWarning','previewDone','previewDoubleClick']){
    const control=page.locator('[data-prts-setting-switch="'+key+'"]')
    await expect(control).toHaveAttribute('aria-checked','true')
    await control.click()
    await expect(control).toHaveAttribute('aria-checked','false')
    await expect.poll(()=>page.evaluate(key=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value[key],key)).toBe(false)
  }
})

test('master preview switch removes the whole feature and hides details without resetting choices',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced',previewDone:false}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('[data-prts-session-summary-trigger="ongoing"]')).toBeVisible()
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(1)
  await page.mouse.move(1000,800)
  await expect(page.locator('[data-prts-summary-reply]:visible')).toHaveCount(0)
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(1)
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
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.sessionPreview)).toBe(false)
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
  await expect(detail).toHaveCount(0)
  await expect(reply.locator('[data-prts-reply-entry]').first()).toHaveAttribute('data-prts-reply-complete', '')
  await reply.locator('[data-prts-reply-entry]').last().hover()
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
    await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['reply'],nodes:new Map([['reply',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'当前进度正常。详细结果。'.repeat(25)}]}}]])}))
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

for(const limit of [5,10,0]) test(`running preview retains latest replies with limit ${limit}`,async({page})=>{
  await page.addInitScript(limit=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,previewReplyLimit:limit})),limit)
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const nodes=Array.from({length:12},(_,i)=>[String(i),{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'正文 '+(i+1)+'。详细结果'.repeat(30)}]}}])
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:nodes.map(([key])=>key),nodes:new Map(nodes)})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  const entries=panel.locator('[data-prts-reply-entry]')
  await expect(entries).toHaveCount(limit||12)
  await expect(entries.first()).toContainText('回复 12')
  await entries.first().hover()
  await expect(page.locator('[data-prts-reply-detail]:visible')).toContainText('正文 12')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,s=r.previewChat.getSnapshot()
    r.previewChat.set({...s,order:[...s.order,'new'],nodes:new Map([...s.nodes,['new',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'新增正文'}]}}]])})
  })
  await expect(entries).toHaveCount(limit||13)
  await expect(entries.first()).toContainText('回复 13')
  await expect(page.locator('[data-prts-reply-detail]:visible')).toContainText('正文 12')
})

test('reply limit setting persists and follows the running preview switch',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="assistance"]').click()
  const row=page.locator('[data-prts-setting-row="previewReplyLimit"]')
  await expect(row.locator('select')).toHaveValue('5')
  await row.locator('select').selectOption('10')
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.previewReplyLimit)).toBe(10)
  await row.locator('select').selectOption('5')
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.previewReplyLimit)).toBe(5)
  await page.locator('[data-prts-setting-switch="previewOngoing"]').click()
  await expect(row).toBeHidden()
  await page.locator('[data-prts-setting-switch="previewOngoing"]').click()
  await expect(row.locator('select')).toHaveValue('5')
})

test('new sessions inserted under a stationary pointer do not steal the active preview',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(panel).toContainText('当前进度正常')
  await panel.evaluate(el=>el.dataset.identity='original')
  await page.locator('[data-prts-session-summary-item="fixture-session"]').evaluate(el=>window.__previewOriginalRow=el)
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.sessionList.getSnapshot()
    r.sessionList.set({...old,ids:['new-session','fixture-session'],byId:{...old.byId,'new-session':{id:'new-session',displayTitle:'新加入的会话',running:true}}})
  })
  await expect(page.locator('[data-prts-session-summary-item="new-session"]')).toBeVisible()
  expect(await page.locator('[data-prts-session-summary-group="ongoing"] [data-prts-session-summary-item]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-prts-session-summary-item')))).toEqual(['fixture-session','new-session'])
  await page.waitForTimeout(700)
  await expect(panel).toHaveAttribute('data-identity','original')
  expect(await page.locator('[data-prts-session-summary-item="fixture-session"]').evaluate(el=>el===window.__previewOriginalRow)).toBe(true)
  await expect(page.locator('[data-prts-session-summary-item="fixture-session"]')).toHaveAttribute('data-prts-preview-active','')
  await page.locator('[data-prts-session-summary-item="new-session"]').hover()
  await expect(panel).toHaveAttribute('aria-label',/^新加入的会话：/)
})

test('state following can be disabled while reopening uses the latest state',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced',previewFollowOngoing:false}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(panel).toHaveAttribute('data-prts-preview-state','ongoing')
  await page.evaluate(()=>{
    for(const el of document.querySelectorAll('[data-state="ongoing"]')) el.removeAttribute('data-state')
    window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{running:false,completionUnread:true}]]))
  })
  await page.waitForTimeout(200)
  await expect(panel).toHaveAttribute('data-prts-preview-state','ongoing')
  await page.mouse.move(1200,850)
  await expect(panel).toHaveCount(0)
  await page.locator('[data-prts-session-summary-trigger="done"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  await expect(panel).toHaveAttribute('data-prts-preview-state','done')
  await page.mouse.move(1200,850)
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="assistance"]').click()
  const toggle=page.locator('[data-prts-setting-switch="previewFollowOngoing"]')
  await expect(toggle).toHaveAttribute('aria-checked','false')
  await toggle.click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.previewFollowOngoing)).toBe(true)
})

for(const next of ['ongoing','question','other']) test(`answer submission with following off does not advance to ${next}`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,previewFollowState:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(next=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    const later={kind:'question',questions:[{id:'next',question:'第二个问题',options:[{label:'下一步'}]}],answer:async()=>{}}
    if(next==='other') { const old=r.sessionList.getSnapshot();r.sessionList.set({...old,byId:{...old.byId,'other':{id:'other',displayTitle:'另一个待处理会话'}}}) }
    r.sessionStatus.set(new Map([['fixture-session',{pendingInteraction:{kind:'question',questions:[{id:'q',question:'第一个问题',options:[{label:'确认'}]}],answer:async()=>{
      r.sessionStatus.set(new Map([['fixture-session',{running:true,pendingInteraction:next==='question'?later:undefined}],...(next==='other'?[['other',{pendingInteraction:later}]]:[])]))
    }}}]]))
  },next)
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await panel.getByRole('button',{name:'确认',exact:true}).click()
  await panel.getByRole('button',{name:'提交回答',exact:true}).click()
  await expect(panel).toHaveCount(0)
  const waiting=page.locator('[data-prts-session-summary-popover="warning"]')
  if(next!=='ongoing') {
    await expect(waiting).toBeVisible()
    await page.mouse.move(1200,850)
    await expect(waiting).toBeVisible()
    await page.locator(`[data-prts-session-summary-item="${next==='other'?'other':'fixture-session'}"]`).hover()
    await expect(panel).toContainText('第二个问题')
  } else {
    await expect(waiting).toHaveCount(0)
  }
})

test('repeated multi-session list updates preserve untouched row nodes',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.sessionList.getSnapshot()
    const byId={...old.byId}
    for(let i=0;i<5;i++)byId['task-'+i]={id:'task-'+i,displayTitle:'并行任务 '+i,running:true}
    r.sessionList.set({...old,byId})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="task-0"]').hover()
  const first=page.locator('[data-prts-session-summary-item="task-0"]')
  await first.evaluate(el=>window.__stableRow=el)
  for(let i=0;i<20;i++) {
    await page.evaluate(i=>{
      const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.sessionList.getSnapshot()
      r.sessionList.set({...old,byId:{...old.byId,'task-4':{...old.byId['task-4'],displayTitle:'进度 '+i}}})
    },i)
    await expect(page.locator('[data-prts-session-summary-item="task-4"]')).toContainText('进度 '+i)
    expect(await first.evaluate(el=>el===window.__stableRow)).toBe(true)
  }
  for(let i=0;i<10;i++) {
    await page.locator(`[data-prts-session-summary-item="task-${i%5}"]`).hover()
    await page.waitForTimeout(100)
  }
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBeLessThanOrEqual(5)
  await page.mouse.click(1200,850)
})

test('approval displays correlated command and parameters even when details arrive after the editor',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{pendingInteraction:{kind:'approval',callId:'approved-call',toolName:'终端',reason:'需要运行命令',answerable:true,answer:async()=>{}}}]])))
  await page.locator('[data-prts-session-summary-trigger="warning"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-preview-editing]')
  await panel.hover()
  await expect(panel).toContainText('操作')
  await page.evaluate(()=>{
    const nodes=new Map([
      ['wrong',{kind:'tool-call',data:{root:{callId:'other',phase:'start',argsRaw:'{"command":"不得展示的其它命令"}'}}}],
      ['right',{kind:'tool-call',data:{root:{callId:'approved-call',phase:'start',argsRaw:JSON.stringify({command:'echo "<script>不执行</script>"\n'+'echo line\n'.repeat(50),cwd:'/workspace/example',timeout:30000})}}}]
    ])
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['wrong','right'],nodes})
  })
  await expect(panel).toContainText('echo "<script>不执行</script>"')
  await expect(panel).toContainText('/workspace/example')
  await expect(panel).not.toContainText('不得展示的其它命令')
  await expect(panel.locator('script')).toHaveCount(0)
  const body=panel.locator(':scope > [data-prts-preview-body]')
  expect(await body.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true)
  await body.evaluate(el=>el.scrollTop=el.scrollHeight)
  await expect(panel.getByRole('button',{name:'提交审批',exact:true})).toBeVisible()
  expect((await body.boundingBox()).height).toBeLessThanOrEqual(133)
  await page.setViewportSize({width:480,height:420})
  await expect(page.locator('[data-prts-preview-space-notice]')).toContainText('空间不足')
  await expect(panel).toBeHidden()
  await page.setViewportSize({width:1280,height:900})
  await expect(panel).toBeVisible()
  await expect(page.locator('[data-prts-preview-space-notice]')).toHaveCount(0)
})

test('crossing the gap between status triggers keeps the list visible until the next list takes over',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.sessionList.getSnapshot()
    r.sessionList.set({...old,byId:{...old.byId,'completed':{id:'completed',displayTitle:'完成任务',completed:true}}})
    r.sessionStatus.set(new Map([['fixture-session',{running:true}],['completed',{running:false,completionUnread:true}]]))
  })
  const running=page.locator('[data-prts-session-summary-trigger="ongoing"]'),done=page.locator('[data-prts-session-summary-trigger="done"]')
  await running.hover()
  const oldList=page.locator('[data-prts-session-summary-popover="ongoing"]')
  await expect(oldList).toBeVisible()
  const a=await running.boundingBox(),b=await done.boundingBox()
  await page.mouse.move((a.x+a.width+b.x)/2,a.y+a.height/2)
  await page.waitForTimeout(70)
  expect(await oldList.evaluate(el=>getComputedStyle(el).opacity)).toBe('1')
  await done.hover()
  await expect(page.locator('[data-prts-session-summary-popover="done"]')).toBeVisible()
  await expect(oldList).toBeHidden()
  await page.mouse.move(1200,850)
  await page.waitForTimeout(350)
  await expect(page.locator('[data-prts-session-summary-popover="done"]')).toBeHidden()
})

test('status session list replaces overflowing rows with a space notice',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__,old=r.sessionList.getSnapshot(),byId={...old.byId}
    for(let i=0;i<20;i++)byId['overflow-'+i]={id:'overflow-'+i,displayTitle:'运行任务 '+i,running:true}
    r.sessionList.set({...old,byId})
  })
  const trigger=page.locator('[data-prts-session-summary-trigger="ongoing"]')
  const menu=page.locator('[data-prts-session-summary-popover="ongoing"]')
  await trigger.evaluate(el=>{
    const header=el.closest('[data-prts-session-summary-header]')
    header.style.position='fixed'
    header.style.top='800px'
    header.style.width='280px'
  })
  await trigger.hover()
  await expect(menu).toHaveAttribute('data-prts-summary-above','')
  await expect(menu).not.toHaveAttribute('data-prts-summary-no-space','')
  const bounds=await menu.boundingBox()
  await page.mouse.move(bounds.x+30,bounds.y+bounds.height-5,{steps:10})
  await expect(menu).toBeVisible()
  await page.setViewportSize({width:1440,height:240})
  await trigger.evaluate(el=>el.closest('[data-prts-session-summary-header]').style.top='100px')
  await trigger.hover()
  await expect(menu).toHaveAttribute('data-prts-summary-no-space','')
  await expect(menu.locator('[data-prts-summary-space-notice]')).toBeVisible()
  await expect(menu.locator('[data-prts-summary-list]')).toBeHidden()
  expect(await menu.evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight-8)).toBe(true)
  await page.setViewportSize({width:1440,height:1000})
  await expect(menu).not.toHaveAttribute('data-prts-summary-no-space','')
  await expect(menu).not.toHaveAttribute('data-prts-summary-above','')
})

test('status trigger alone synchronously chooses list placement on every entry',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const trigger=page.locator('[data-prts-session-summary-trigger="ongoing"]')
  await expect(trigger).toBeVisible()
  const result=await trigger.evaluate(el=>{
    const header=el.closest('[data-prts-session-summary-header]')
    const menu=el.parentElement.querySelector('[data-prts-session-summary-popover]')
    header.style.position='fixed'
    header.style.width='280px'
    header.style.top='930px'
    el.dispatchEvent(new PointerEvent('pointerenter',{bubbles:false}))
    const above=menu.hasAttribute('data-prts-summary-above')
    header.style.top='100px'
    el.dispatchEvent(new PointerEvent('pointerenter',{bubbles:false}))
    return {above,below:!menu.hasAttribute('data-prts-summary-above'),fits:!menu.hasAttribute('data-prts-summary-no-space')}
  })
  expect(result).toEqual({above:true,below:true,fits:true})
})

test('reply space warning never changes status list height or direction',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const trigger=page.locator('[data-prts-session-summary-trigger="ongoing"]')
  await expect(trigger).toBeVisible()
  await trigger.evaluate(el=>{
    const header=el.closest('[data-prts-session-summary-header]')
    const menu=el.parentElement.querySelector('[data-prts-session-summary-popover]')
    header.style.position='fixed'
    header.style.width='280px'
    header.style.left=(innerWidth-300)+'px'
    header.style.top=(innerHeight-menu.offsetHeight-header.offsetHeight-22)+'px'
  })
  await trigger.hover()
  const menu=page.locator('[data-prts-session-summary-popover="ongoing"]')
  await expect(menu).not.toHaveAttribute('data-prts-summary-above','')
  const height=await menu.evaluate(el=>el.offsetHeight)
  await menu.locator('[data-prts-session-summary-item]').first().hover()
  await expect(menu.locator('[data-prts-preview-space-notice]')).toBeVisible()
  await page.waitForTimeout(300)
  await expect(menu).not.toHaveAttribute('data-prts-summary-above','')
  expect(await menu.evaluate(el=>el.offsetHeight)).toBe(height)
})

test('status list escapes clipped sidebar and stays above footer buttons',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const trigger=page.locator('[data-prts-session-summary-trigger="ongoing"]')
  await expect(trigger).toBeVisible()
  await trigger.evaluate(el=>{
    const header=el.closest('[data-prts-session-summary-header]')
    header.style.overflow='hidden'
    const rect=header.getBoundingClientRect()
    const blocker=document.createElement('button')
    blocker.textContent='模拟知识库入口'
    Object.assign(blocker.style,{position:'fixed',left:rect.left+'px',top:(rect.bottom+6)+'px',width:rect.width+'px',height:'200px',zIndex:'999999'})
    document.body.append(blocker)
  })
  await trigger.hover()
  const menu=page.locator('[data-prts-session-summary-popover="ongoing"]')
  expect(await menu.evaluate(el=>el.matches(':popover-open'))).toBe(true)
  const row=menu.locator('[data-prts-session-summary-item]').first()
  await row.hover()
  expect(await row.evaluate(el=>{
    const r=el.getBoundingClientRect()
    return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))
  })).toBe(true)
})


test('reply preview fits above a low session row when the right side has space',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const trigger=page.locator('[data-prts-session-summary-trigger="ongoing"]')
  await expect(trigger).toBeVisible()
  await trigger.evaluate(el=>{
    const header=el.closest('[data-prts-session-summary-header]')
    const menu=el.parentElement.querySelector('[data-prts-session-summary-popover]')
    Object.assign(header.style,{position:'fixed',width:'280px',top:(innerHeight-menu.offsetHeight-header.offsetHeight-22)+'px'})
  })
  await trigger.hover()
  const row=page.locator('[data-prts-session-summary-item="fixture-session"]')
  await row.hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(panel).toBeVisible()
  await expect(panel).not.toHaveAttribute('data-prts-preview-no-space','')
  await expect.poll(async()=>{
    const p=await panel.boundingBox(),r=await row.boundingBox()
    return !!p && p.y>=8 && p.y<r.y && p.y+p.height<=1000-8
  }).toBe(true)
})

test('opening a preview scrolls the corresponding session card into its list viewport',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const row=page.locator('[data-session-id="fixture-session"]')
  await expect(row).toBeVisible()
  await row.evaluate(el=>{
    const tree=el.closest('[role="tree"]')
    Object.assign(tree.style,{height:'240px',overflowY:'auto'})
    const spacer=document.createElement('div')
    spacer.style.height='700px'
    spacer.style.flexShrink='0'
    tree.insertBefore(spacer,el)
    tree.scrollTop=0
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').click()
  await expect.poll(()=>row.evaluate(el=>{
    const r=el.getBoundingClientRect(),p=el.closest('[role="tree"]').getBoundingClientRect()
    return r.top>=p.top && r.bottom<=p.bottom+1
  })).toBe(true)
})

for(const navigation of ['row','button','double-click'])test('navigation dismisses the whole preview until re-entry: '+navigation,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  if(navigation==='button')await page.evaluate(()=>{
    window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{running:true,pendingInteraction:{kind:'question',questions:[{id:'q',question:'选择方案',options:['继续']}],answerable:false}}]]))
  })
  const state=navigation==='button'?'warning':'ongoing'
  const trigger=page.locator('[data-prts-session-summary-trigger="'+state+'"]')
  const menu=page.locator('[data-prts-session-summary-popover="'+state+'"]')
  const row=page.locator('[data-prts-session-summary-item="fixture-session"]')
  await trigger.hover()
  await row.hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(panel).toBeVisible()
  if(navigation==='row')await row.click()
  else if(navigation==='button')await panel.getByRole('button',{name:'进入会话',exact:true}).click()
  else await panel.locator(':scope > strong').dblclick()
  await expect(menu).toBeHidden()
  await expect(page.locator('[data-prts-summary-reply]:visible')).toHaveCount(0)
  await page.waitForTimeout(350)
  await expect(menu).toBeHidden()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  await page.mouse.move(900,700)
  await trigger.hover()
  await expect(menu).toBeVisible()
})

test('newly expanded session cards have themed geometry before their first rendered frame',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await expect(page.locator('[data-prts-session-row]').first()).toBeVisible()
  const result=await page.evaluate(()=>new Promise(resolve=>{
    requestAnimationFrame(()=>{
      const row=document.createElement('div')
      row.setAttribute('role','treeitem')
      row.setAttribute('aria-selected','false')
      row.setAttribute('data-row-key','session:first-paint')
      row.className='sessionRow'
      row.innerHTML='<span></span><span class="title">新展开的会话</span><span class="sessionTime">刚刚</span>'
      document.querySelector('[role="tree"]').append(row)
      requestAnimationFrame(()=>{
        const path=row.querySelector('[data-prts-facility-layer="surface"]')
        resolve({marked:row.hasAttribute('data-prts-session-row'),outline:!!path?.getAttribute('d')})
      })
    })
  }))
  expect(result).toEqual({marked:true,outline:true})
})

test('collapsed workspace begins rendering before another conversation navigation runs',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await expect(page.locator('[data-prts-session-row]').first()).toBeVisible()
  await page.evaluate(()=>{
    const row=document.querySelector('[data-session-id="fixture-session"]')
    const group=document.querySelector('[data-prts-workspace-row]')
    const parent=row.parentElement
    row.remove()
    row.setAttribute('aria-selected','false')
    group.setAttribute('data-row-key','workspace:')
    group.setAttribute('aria-expanded','false')
    window.__revealOrder=[]
    group.addEventListener('click',()=>{
      window.__revealOrder.push('expand')
      group.setAttribute('aria-expanded','true')
      queueMicrotask(()=>{
        parent.append(row)
        requestAnimationFrame(()=>{
          window.__revealOrder.push('frame')
          window.__flowBeforeNavigation = row.getAttribute('data-prts-selection-target')
          window.__selectionBeforeNavigation = {
            weight: getComputedStyle(row.querySelector('[data-prts-row-title]')).fontWeight,
            spine: getComputedStyle(row.querySelector('[data-prts-facility-spine]')).getPropertyValue('--prts-facility-surface').trim(),
            yellow: getComputedStyle(row).getPropertyValue('--prts-yellow').trim(),
            native: row.getAttribute('aria-selected'),
          }
        })
      })
    })
    const opened=window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds
    opened.push=function(...ids){window.__revealOrder.push('navigate');return Array.prototype.push.apply(this,ids)}
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').click()
  await expect.poll(()=>page.evaluate(()=>window.__revealOrder)).toEqual(['expand','frame','navigate'])
  expect(await page.evaluate(()=>window.__flowBeforeNavigation)).toBe('true')
  const selection = await page.evaluate(()=>window.__selectionBeforeNavigation)
  expect(selection.weight).toBe('700')
  expect(selection.spine).toBe(selection.yellow)
  expect(selection.native).toBe('false')
  const target=page.locator('[data-session-id="fixture-session"]')
  await target.evaluate(el=>el.setAttribute('aria-selected','true'))
  await expect(target).not.toHaveAttribute('data-prts-selection-target')
  await page.mouse.move(900, 700)
  await expect(target.locator('[data-prts-session-lifeline]')).toHaveCSS('opacity','0.98')
})

test('running hover previews latest tool calls while no prose is emitted',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced'})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['tool'],nodes:new Map([
    ['tool',{kind:'tool-call',data:{root:{callId:'one',name:'exec_command',phase:'start',argsRaw:JSON.stringify({command:'npm test',cwd:'/workspace'})}}}]
  ])}))
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const tool=page.locator('[data-prts-preview-tool]:visible')
  await expect(tool).toContainText('执行中')
  expect((await tool.locator('button').boundingBox()).height).toBe(32)
  await expect(page.locator('[data-prts-summary-reply]:visible')).not.toContainText('正在处理')
  await expect(tool).not.toContainText('npm test')
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  const initialBox=await panel.boundingBox()
  await tool.locator('button').hover()
  const detail=page.locator('[data-prts-reply-detail]:visible')
  await expect(detail).toContainText('npm test')
  await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['tool'],nodes:new Map([
    ['tool',{kind:'tool-call',data:{root:{callId:'two',name:'read_file',phase:'start',argsRaw:JSON.stringify({path:'/workspace/README.md',content:'long parameter\n'.repeat(300)})}}}]
  ])}))
  await expect(tool).toContainText('read_file')
  await expect(tool).not.toContainText('npm test')
  await expect(tool).not.toContainText('/workspace/README.md')
  await expect(detail).toContainText('/workspace/README.md')
  const updatedBox=await panel.boundingBox()
  expect(updatedBox).toEqual(initialBox)
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
})

for(const unreadFirst of [false,true]) test(`current session completion removes its open previews when read: unreadFirst=${unreadFirst}`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced'})))
  await page.goto('/tests/fixtures/rc7-harness.html')
    await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['reply'],nodes:new Map([['reply',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'当前进度正常。详细结果。'.repeat(25)}]}}]])}))
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await panel.locator('[data-prts-reply-entry]').first().hover()
  await expect(page.locator('[data-prts-reply-detail]:visible')).toBeVisible()
  await page.evaluate(unreadFirst=>{
    const r=window.__PRTS_FIXTURE_RUNTIME__
    for(const el of document.querySelectorAll('[data-state="ongoing"]')) el.removeAttribute('data-state')
    r.sessionStatus.set(new Map([['fixture-session',{running:false,completionUnread:unreadFirst}]]))
  },unreadFirst)
  if(unreadFirst){
    await expect(panel).toContainText('已完成 · 最后回复')
    await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session',{running:false,completionUnread:false}]])))
  }
  await expect(page.locator('[data-prts-session-summary-item="fixture-session"]')).toHaveCount(0)
  await expect(page.locator('[data-prts-summary-reply]:visible')).toHaveCount(0)
  await expect(page.locator('[data-prts-reply-detail]')).toHaveCount(0)
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewReferences.size)).toBe(0)
})

test('tool preview setting defaults on, persists through host settings and applies immediately',async({page})=>{
  await page.addInitScript(()=>{
    if(!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}}))
  })
  const seedTool=()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['tool'],nodes:new Map([
    ['tool',{kind:'tool-call',data:{root:{callId:'one',name:'exec_command',phase:'start',argsRaw:'{"command":"npm test"}'}}}]
  ])}))
  const openSettings=async()=>{
    await page.locator('[data-prts-rail-brand]').click()
    await page.locator('[data-prts-settings-jump="assistance"]').click()
  }
  const hoverPreview=async()=>{
    await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
    await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  }
  const toggle=page.locator('[data-prts-setting-switch="previewTools"]')
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await seedTool()
  await openSettings()
  await expect(toggle).toHaveAttribute('aria-checked','true')
  await toggle.click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.previewTools)).toBe(false)
  await page.getByRole('button',{name:'关闭主题设置',exact:true}).click()
  await hoverPreview()
  await expect(page.locator('[data-prts-preview-tool]:visible')).toHaveCount(0)
  await expect(page.locator('[data-prts-summary-reply]:visible')).toContainText('正在处理…')
  await page.reload()
  await seedTool()
  await openSettings()
  await expect(toggle).toHaveAttribute('aria-checked','false')
  await toggle.click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.previewTools)).toBe(true)
  await page.getByRole('button',{name:'关闭主题设置',exact:true}).click()
  await hoverPreview()
  await expect(page.locator('[data-prts-preview-tool]:visible')).toContainText('exec_command')
})

test('tool detail lists the current segment with fixed geometry and preserves scroll',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced'})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const nodes=new Map([['reply',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'开始检查'}]}}]])
    for(let i=0;i<12;i++)nodes.set('tool'+i,{kind:'tool-call',data:{root:{callId:'call'+i,name:'exec_command',phase:'start',time:i,argsRaw:JSON.stringify({command:'echo step '+i,extra:'must-not-show'})}}})
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:[...nodes.keys()],nodes})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const entry=page.locator('[data-prts-tool-entry]:visible')
  await expect(entry).toContainText('12 次')
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  const primaryBox=await panel.boundingBox()
  await entry.hover()
  const detail=page.locator('[data-prts-tool-history]:visible')
  await expect(detail.locator('[data-prts-tool-record]')).toHaveCount(12)
  await expect(detail.locator('[data-prts-tool-record]').first()).toContainText('echo step 11')
  await expect(detail).not.toContainText('must-not-show')
  const detailBox=await detail.boundingBox()
  const body=detail.locator('[data-prts-preview-body]')
  await body.evaluate(el=>el.scrollTop=100)
  const before=await body.evaluate(el=>{const row=[...el.children].find(row=>row.getBoundingClientRect().bottom>el.getBoundingClientRect().top);return {key:row.dataset.toolKey,top:row.getBoundingClientRect().top}})
  await page.evaluate(()=>{
    const store=window.__PRTS_FIXTURE_RUNTIME__.previewChat,s=store.getSnapshot(),nodes=new Map(s.nodes)
    nodes.set('new',{kind:'tool-call',data:{root:{callId:'new',name:'read_file',phase:'start',time:99,argsRaw:'{"path":"/workspace/new"}'}}})
    store.set({...s,order:[...s.order,'new'],nodes})
  })
  await expect(entry).toContainText('13 次')
  await expect(detail.locator('[data-prts-tool-record]')).toHaveCount(13)
  expect(await panel.boundingBox()).toEqual(primaryBox)
  expect(await detail.boundingBox()).toEqual(detailBox)
  const after=await body.evaluate((el,key)=>[...el.children].find(row=>row.dataset.toolKey===key).getBoundingClientRect().top,before.key)
  expect(Math.abs(after-before.top)).toBeLessThan(1)
  await page.evaluate(()=>{
    const store=window.__PRTS_FIXTURE_RUNTIME__.previewChat,s=store.getSnapshot(),nodes=new Map(s.nodes)
    nodes.set('next-reply',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'检查完成'}]}})
    store.set({...s,order:[...s.order,'next-reply'],nodes})
  })
  await expect(page.locator('[data-prts-tool-entry]:visible')).toHaveCount(0)
  await expect(detail).toHaveCount(0)
  await expect(panel).toContainText('检查完成')
})


test('running preview only expands replies with hidden content or structure',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced'})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  await page.evaluate(()=>{
    const texts=['检查完成。','宽'.repeat(90),'x'.repeat(120),'[查看结果](https://example.com)']
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:texts.map((_,i)=>String(i)),nodes:new Map(texts.map((text,i)=>[String(i),{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text}]}}]))})
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  const short=panel.locator('[data-prts-reply-entry]').filter({hasText:'检查完成。'})
  await expect(short).toHaveAttribute('data-prts-reply-complete','')
  await expect(short).toHaveAttribute('tabindex','-1')
  await expect(short.locator('[data-prts-reply-ellipsis]')).toBeHidden()
  await short.hover()
  await short.evaluate(el=>{el.focus();el.click()})
  await expect(page.locator('[data-prts-reply-detail]:visible')).toHaveCount(0)
  for(const text of ['宽'.repeat(10),'x'.repeat(10),'查看结果']) {
    const item=panel.locator('[data-prts-reply-entry]').filter({hasText:text})
    await expect(item).not.toHaveAttribute('data-prts-reply-complete','')
    const cue=item.locator('[data-prts-reply-ellipsis]')
    if(text==='查看结果') await expect(cue).toBeHidden()
    else { await expect(cue).toBeVisible(); await expect(cue).toHaveCSS('color','rgb(240, 230, 214)') }
    await item.hover()
    await expect(page.locator('[data-prts-reply-detail]:visible')).toContainText(text)
    await short.hover()
    await expect(page.locator('[data-prts-reply-detail]:visible')).toHaveCount(0)
  }
})

for (const direction of ['below','above']) test(`growing reply preview keeps its ${direction} edge and scrolls at the viewport boundary`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced',previewReplyLimit:0})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const trigger=page.locator('[data-prts-session-summary-trigger="ongoing"]')
  await trigger.evaluate((el,direction)=>{
    const header=el.closest('[data-prts-session-summary-header]')
    Object.assign(header.style,{position:'fixed',width:'280px',top:(innerHeight-(direction==='above'?80:300))+'px'})
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:['0'],nodes:new Map([['0',{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'短回复'}]}}]])})
  },direction)
  await trigger.hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').hover()
  const panel=page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')
  await expect(panel).toHaveAttribute('data-prts-preview-direction',direction)
  await expect(panel).toContainText('短回复')
  const before=await panel.boundingBox()
  await page.mouse.move(before.x+15,direction==='above'?before.y+before.height-10:before.y+10)
  await page.evaluate(()=>{
    const nodes=Array.from({length:20},(_,i)=>[String(i),{kind:'assistant-step',data:{status:'settled',blocks:[{kind:'text',text:'完成结果 '+i+'。详细说明。'.repeat(15)}]}}])
    window.__PRTS_FIXTURE_RUNTIME__.previewChat.set({order:nodes.map(([id])=>id),nodes:new Map(nodes)})
  })
  await expect(panel.locator('[data-prts-reply-entry]')).toHaveCount(20)
  await page.waitForTimeout(450)
  await expect(panel).toBeVisible()
  const after=await panel.boundingBox()
  expect(Math.abs(direction==='above'?after.y+after.height-before.y-before.height:after.y-before.y)).toBeLessThan(1)
  expect(after.y).toBeGreaterThanOrEqual(7)
  expect(after.y+after.height).toBeLessThanOrEqual(page.viewportSize().height-7)
  expect(await panel.evaluate(el=>el.scrollHeight>el.clientHeight || [...el.querySelectorAll('[data-prts-preview-body]')].some(body=>body.scrollHeight>body.clientHeight))).toBe(true)
})
