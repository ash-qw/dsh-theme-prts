import {test, expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import sharp from 'sharp'

// Sample rendered pixels: geometric assertions alone miss translucent overlap seams.
for (const role of ['user', 'assistant']) test(`Baker ${role} tail joins without a dark or bright seam`, async ({page}) => {
  await page.setContent(`<html data-dsh-prts data-prts-conversation-style="deck-chat" data-prts-background-mode="full" data-prts-background-full><body><div data-message-role="${role}">Message</div></body></html>`)
  for (const file of ['prts.css','custom-background.css']) await page.addStyleTag({content: await readFile(`src/styles/${file}`, 'utf8')})
  await page.addStyleTag({content:`html,body {margin:0;background:#708090!important} [data-message-role] {position:absolute!important;left:100px!important;top:100px!important;width:240px!important;height:100px!important;margin:0!important;box-sizing:border-box!important} [data-message-role="assistant"]::before,[data-message-role="user"]::after {content:none!important}`})
  const bubble = page.locator('[data-message-role]')
  for (const scheme of ['dark','light']) for (const opacity of [.2,.5,1]) for (const blur of [0,8,32]) {
    await page.evaluate(({scheme,opacity,blur})=>{
      const root=document.documentElement
      root.dataset.prtsScheme=scheme
      root.style.setProperty('--prts-baker-opacity',String(opacity))
      root.style.setProperty('--prts-baker-blur',`${blur}px`)
    },{scheme,opacity,blur})
    const box=await bubble.boundingBox()
    const edge=role==='assistant'?box.x:box.x+box.width
    const {data,info}=await sharp(await page.screenshot({clip:{x:edge-3,y:box.y+3,width:6,height:1}})).removeAlpha().raw().toBuffer({resolveWithObject:true})
    const pixels=Array.from({length:info.width},(_,i)=>Array.from(data.subarray(i*3,i*3+3)))
    for (const color of pixels) for(let c=0;c<3;c++) expect(Math.abs(color[c]-pixels[3][c]),`${role} ${scheme} opacity=${opacity} blur=${blur}: ${JSON.stringify(pixels)}`).toBeLessThanOrEqual(1)
  }
})
