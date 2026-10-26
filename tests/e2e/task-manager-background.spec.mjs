import {test,expect} from '@playwright/test'

for(const scheme of ['dark','light'])test(`task manager background follows active wallpaper: ${scheme}`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts','')
  await page.evaluate(scheme=>{
    document.documentElement.setAttribute('data-prts-scheme',scheme)
    const style=document.createElement('style');style.textContent='.host_page,.host_detail,.host_detailNotice{background:rgb(8,10,12)}';document.head.append(style)
    const panel=document.createElement('section');panel.className='host_page';panel.setAttribute('data-testid','task-manager-page');panel.innerHTML='<div class="host_detail"><p class="host_detailNotice">说明</p><button>新建</button></div>';document.querySelector('[data-prts-region="operation"]').append(panel)
  },scheme)
  const surfaces=page.locator('[data-testid="task-manager-page"],.host_detail,.host_detailNotice')
  for(const mode of ['full','split']){
    await page.evaluate(mode=>{const h=document.documentElement;h.setAttribute('data-prts-background-mode',mode);h.setAttribute(mode==='full'?'data-prts-background-full':'data-prts-background-conversation','')},mode)
    for(const surface of await surfaces.all())await expect(surface).toHaveCSS('background-color','rgba(0, 0, 0, 0)')
  }
  await page.evaluate(()=>document.documentElement.setAttribute('data-prts-background-mode','off'))
  for(const surface of await surfaces.all())await expect(surface).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)')
  await page.evaluate(()=>document.documentElement.removeAttribute('data-dsh-prts'))
  for(const surface of await surfaces.all())await expect(surface).toHaveCSS('background-color','rgb(8, 10, 12)')
})
