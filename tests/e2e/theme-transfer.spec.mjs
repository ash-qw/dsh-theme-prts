import { dropFile } from '../helpers/file-drop.mjs'
import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'

for(const width of [1440,480])test(`theme configuration export, import and recovery at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000})
  const errors=[];page.on('pageerror',error=>errors.push(error.message))
  await page.addInitScript(()=>{
    if(!localStorage.getItem('prtsFixtureNativeConfig'))localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}}))
  })
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  if(width<640)await page.locator('[data-prts-rail-launcher]').click()
  await page.locator('[data-prts-rail-brand]').click()
  await page.getByRole('button',{name:'导入与导出',exact:true}).click()
  const section=page.locator('[data-prts-transfer]'),status=page.locator('[data-prts-transfer-status]')
  await expect(section).toBeVisible()
  await expect(page.getByRole('tab',{name:'导入与导出',exact:true})).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-prts-transfer-dialog]')).not.toBeVisible()
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
  await expect(page.locator('[data-prts-transfer-open]')).toBeFocused()
  await page.locator('[data-prts-transfer-open]').click()
  const picker=page.waitForEvent('filechooser')
  await page.locator('[data-prts-transfer-file-hint]').click()
  await (await picker).setFiles([])
  await page.locator('[data-prts-transfer-assets]').uncheck()
  const downloaded=page.waitForEvent('download')
  await page.locator('[data-prts-transfer-export]').click()
  const download=await downloaded
  const value=JSON.parse(await readFile(await download.path(),'utf8'))
  expect(value.format).toBe('prts-theme');expect(value.assets).toBeUndefined()
  value.preferences.previewTools=false
  await dropFile(page,'[data-prts-transfer-drop]',{name:'test.prts-theme.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))})
  await expect(page.locator('[data-prts-transfer-summary]')).toContainText('保留当前背景')
  await expect(page.locator('[data-prts-transfer-card=import]')).toHaveAttribute('data-prts-transfer-active','')
  const backup=page.waitForEvent('download')
  await page.getByRole('button',{name:'确认导入',exact:true}).click()
  await backup
  await expect(status).toContainText('主题已导入并保存')
  const setting=()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.previewTools)
  expect(await setting()).toBe(false)
  await page.getByRole('button',{name:'恢复导入前配置',exact:true}).click()
  await expect(status).toContainText('已恢复导入前配置')
  expect(await setting()).toBe(true)
  value.preferences.futureMotion='gentle'
  await page.locator('[data-prts-transfer-file]').setInputFiles({name:'future.prts-theme.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))})
  await expect(page.locator('[data-prts-transfer-compatibility]')).toContainText('设置.futureMotion')
  await page.locator('[data-prts-transfer-cancel]').click()
  await expect(page.locator('[data-prts-transfer-compatibility]')).toBeHidden()
  await page.locator('[data-prts-transfer-file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"prts-theme","version":999}')})
  await expect(status).toContainText('不支持')
  await expect(page.locator('[data-prts-transfer-preview]')).toBeHidden()
  expect(await section.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
  await page.screenshot({path:`/tmp/prts-theme-transfer-${width}.png`})
})

test('complete theme file includes actual assets and can be imported in a second browser profile',async({page,browser})=>{
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64
    const ctx=canvas.getContext('2d');ctx.fillStyle='#eec422';ctx.fillRect(0,0,64,64)
    const image=canvas.toDataURL().split(',')[1]
    const request=async(path,data)=>{
      const r=await fetch('/prts-theme-api/'+path,data?{method:'POST',headers:{'content-type':'application/json','x-prts-request':'1'},body:JSON.stringify(data)}:{})
      const v=await r.json();if(!r.ok)throw Error(v.error);return v
    }
    const bg=await request('backgrounds/configuration');await request('backgrounds/configuration',{slot:'sidebar',image,revision:bg.revision})
    const avatar=await request('avatars/configuration');await request('avatars/configuration',{role:'assistant',image,crop:{zoom:2,x:.5,y:.5},revision:avatar.revision})
    const draft=await request('emblems/preview',{image,label:'测试徽记',params:{mode:'alpha'}})
    const state=await request('emblems/configuration')
    await request('emblems/configuration',{configuration:{version:2,hero:{kind:'custom',key:'hero-test',label:'测试徽记',draftId:draft.draftId},conversation:state.configuration.conversation},revision:state.revision})
  })
  await page.locator('[data-prts-rail-brand]').click()
  await page.getByRole('button',{name:'导入与导出',exact:true}).click()
  const downloading=page.waitForEvent('download')
  await page.locator('[data-prts-transfer-export]').click()
  const download=await downloading,buffer=await readFile(await download.path())
  const value=JSON.parse(buffer)
  expect(value.assets.emblems.items).toHaveLength(1)
  expect(value.assets.backgrounds.sidebar).toBeTruthy()
  const context=await browser.newContext()
  try{
    const target=await context.newPage()
    await target.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}})))
    await target.goto(new URL('/tests/fixtures/rc7-harness.html?native-forms',page.url()).href)
    await target.locator('[data-prts-rail-brand]').click()
    await target.getByRole('button',{name:'导入与导出',exact:true}).click()
    await target.locator('[data-prts-transfer-file]').setInputFiles({name:'full.prts-theme.json',mimeType:'application/json',buffer})
    await expect(target.locator('[data-prts-transfer-summary]')).toContainText('1 个自定义徽记')
    await target.locator('[data-prts-transfer-apply]').click()
    await expect(target.locator('[data-prts-transfer-status]')).toContainText('主题已导入并保存')
    const state=await target.evaluate(async()=>({
      bg:await (await fetch('/prts-theme-api/backgrounds/configuration')).json(),
      avatar:await (await fetch('/prts-theme-api/avatars/edit/assistant')).json(),
      emblem:await (await fetch('/prts-theme-api/emblems/configuration')).json(),
    }))
    expect(state.bg.sidebar).toBeTruthy();expect(state.avatar.crop.zoom).toBe(2)
    expect(state.emblem.configuration.hero.label).toBe('测试徽记')
  }finally{await context.close()}
})

test('cancel a slow export and start a new export',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-transfer-open]').click()
  await page.evaluate(()=>{
    const original=window.fetch
    window.fetch=(url,options)=>{
      if(String(url).endsWith('/backgrounds/configuration') && options?.signal){
        window.__transferWaiting=true
        return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true}))
      }
      return original(url,options)
    }
  })
  const exportCard=page.locator('[data-prts-transfer-card="export"]')
  const importCard=page.locator('[data-prts-transfer-card="import"]')
  const exportButton=page.locator('[data-prts-transfer-export]')
  await page.mouse.move(0,0)
  const neutral=await exportCard.evaluate(el=>getComputedStyle(el).borderColor)
  expect(await exportButton.evaluate(el=>getComputedStyle(el).borderColor)).toBe(await page.locator('[data-prts-transfer-choose]').evaluate(el=>getComputedStyle(el).borderColor))
  await exportCard.hover()
  await expect.poll(()=>exportCard.evaluate(el=>getComputedStyle(el).borderColor)).not.toBe(neutral)
  const highlighted=await exportCard.evaluate(el=>{const probe=document.createElement('span');probe.style.color='var(--prts-line-strong)';el.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color})
  await page.locator('[data-prts-transfer-dialog]').screenshot({path:'/tmp/prts-transfer-hover.png'})
  const downloads=[];page.on('download',download=>downloads.push(download))
  await page.locator('[data-prts-transfer-export]').click()
  await expect.poll(()=>page.evaluate(()=>window.__transferWaiting)).toBe(true)
  await importCard.hover()
  await expect(exportCard).toHaveAttribute('data-prts-transfer-active','')
  await expect(exportCard).toHaveCSS('border-color',highlighted)
  await expect(importCard).toHaveCSS('border-color',neutral)
  await page.locator('[data-prts-transfer-dialog]').screenshot({path:'/tmp/prts-transfer-working.png'})
  await expect(page.locator('[data-prts-transfer-close]')).toBeDisabled()
  await page.getByRole('button',{name:'取消操作',exact:true}).click()
  await expect(page.locator('[data-prts-transfer-status]')).toContainText('操作已取消')
  await expect(page.locator('[data-prts-transfer-close]')).toBeEnabled()
  expect(downloads).toHaveLength(0)
  await page.locator('[data-prts-transfer-assets]').uncheck()
  const downloaded=page.waitForEvent('download')
  await page.locator('[data-prts-transfer-export]').click()
  await downloaded
  await expect(page.locator('[data-prts-transfer-status]')).toContainText('已发起下载')
})

test('importing split backgrounds enables composer glass after a hidden composer becomes visible',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced',backgroundMode:'off',composerGlass:false}})))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-transfer-open]').click()
  const composer=page.locator('[data-composer-card]').first()
  await composer.evaluate(el=>el.style.display='none')
  await page.locator('[data-prts-transfer-file]').setInputFiles({name:'split.prts-theme.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'prts-theme',version:1,preferences:{version:12,backgroundMode:'split',composerGlass:false}}))})
  await page.locator('[data-prts-transfer-apply]').click()
  await expect(page.locator('[data-prts-transfer-status]')).toContainText('主题已导入并保存')
  await page.locator('[data-prts-transfer-close]').click()
  await composer.evaluate(el=>el.style.removeProperty('display'))
  await expect(composer).toHaveAttribute('data-prts-composer-glass-active','')
})
