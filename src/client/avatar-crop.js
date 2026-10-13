export function mountAvatarCrop({panel,window,load,onSave}){
  const dialog=panel.ownerDocument.createElement('dialog')
  dialog.setAttribute('data-prts-avatar-crop','')
  dialog.setAttribute('aria-labelledby','prts-avatar-crop-title')
  dialog.innerHTML=`<header><strong id="prts-avatar-crop-title">头像设置</strong><label data-prts-avatar-upload>更换图片<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-crop-file aria-label="上传新头像"></label></header>
    <p>拖动亮区选择头像范围，滚轮或触摸板调整大小。</p>
    <canvas width="320" height="320" tabindex="0" aria-label="原图与头像裁剪范围，可拖动或用方向键调整亮区"></canvas>
    <div data-crop-tools><label>缩放 <input type="range" min="1" max="4" step=".01" value="1" aria-label="头像裁剪缩放"></label><button type="button" data-crop-center>重置裁剪</button></div>
    <p role="status" data-prts-avatar-crop-status></p>
    <footer><button type="button" data-crop-reset>恢复默认</button><span></span><button type="button" data-crop-cancel>取消</button><button type="button" data-crop-save>保存头像</button></footer>`
  panel.append(dialog)
  const canvas=dialog.querySelector('canvas'),zoom=dialog.querySelector('input[type=range]'),status=dialog.querySelector('[role=status]')
  let bitmap,original,role,crop={zoom:1,x:.5,y:.5},drag,busy=false,disposed=false,generation=0,previousFocus,revision,hasCustom=false,ready=false
  const clean=()=>{bitmap?.close();bitmap=null;original=null;drag=null}
  const close=()=>{generation++;dialog.close?.();clean();previousFocus?.focus?.({preventScroll:true})}
  const draw=()=>{
    zoom.value=String(crop.zoom)
    if(!bitmap){canvas.getContext('2d').clearRect(0,0,320,320);return}
    const side=Math.min(bitmap.width,bitmap.height)/crop.zoom
    crop.x=Math.max(side/2/bitmap.width,Math.min(1-side/2/bitmap.width,crop.x))
    crop.y=Math.max(side/2/bitmap.height,Math.min(1-side/2/bitmap.height,crop.y))
    const ctx=canvas.getContext('2d')
    ctx.clearRect(0,0,320,320)
    const scale=288/Math.max(bitmap.width,bitmap.height)
    const width=bitmap.width*scale,height=bitmap.height*scale,left=(320-width)/2,top=(320-height)/2
    const x=left+crop.x*width,y=top+crop.y*height,radius=side*scale/2
    ctx.drawImage(bitmap,left,top,width,height)
    ctx.beginPath();ctx.rect(0,0,320,320);ctx.arc(x,y,radius,0,Math.PI*2,true)
    ctx.fillStyle='rgba(0,0,0,.65)';ctx.fill('evenodd')
    ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2)
    ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.5;ctx.stroke()
  }
  const controls=()=>{
    for(const el of dialog.querySelectorAll('button,input'))el.disabled=busy
    for(const el of [zoom,dialog.querySelector('[data-crop-save]'),dialog.querySelector('[data-crop-center]')])el.disabled=busy||!bitmap
    dialog.querySelector('[data-crop-file]').disabled=busy||!ready
    dialog.querySelector('[data-crop-reset]').disabled=busy||!hasCustom
  }
  const end=()=>{if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);drag=null}
  canvas.addEventListener('pointerdown',e=>{
    if(busy||!bitmap||e.button!==0||!e.isPrimary)return
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,crop:{...crop}}
    canvas.setPointerCapture(e.pointerId);e.preventDefault()
  })
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return
    const scale=Math.max(bitmap.width,bitmap.height)/288*320/canvas.getBoundingClientRect().width
    crop.x=drag.crop.x+(e.clientX-drag.x)*scale/bitmap.width
    crop.y=drag.crop.y+(e.clientY-drag.y)*scale/bitmap.height
    draw();e.preventDefault()
  })
  canvas.addEventListener('pointerup',end)
  canvas.addEventListener('pointercancel',()=>{if(drag)crop=drag.crop;end();draw()})
  canvas.addEventListener('keydown',e=>{
    if(busy||!bitmap||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return
    e.preventDefault();const step=(e.shiftKey?10:2)*Math.max(bitmap.width,bitmap.height)/288
    if(e.key==='ArrowLeft')crop.x-=step/bitmap.width
    if(e.key==='ArrowRight')crop.x+=step/bitmap.width
    if(e.key==='ArrowUp')crop.y-=step/bitmap.height
    if(e.key==='ArrowDown')crop.y+=step/bitmap.height
    draw()
  })
  canvas.addEventListener('wheel',e=>{
    e.preventDefault()
    if(busy||!bitmap)return
    end()
    const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1)
    crop.zoom=Math.max(1,Math.min(4,crop.zoom*Math.exp(-delta*(e.ctrlKey ? .01 : .002))))
    draw()
  },{passive:false})
  zoom.addEventListener('input',()=>{end();crop.zoom=Number(zoom.value);draw()})
  dialog.querySelector('[data-crop-center]').addEventListener('click',()=>{end();crop={zoom:1,x:.5,y:.5};zoom.value='1';draw()})
  dialog.querySelector('[data-crop-cancel]').addEventListener('click',close)
  dialog.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();if(!busy)close()})
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation()})
  dialog.querySelector('[data-crop-save]').addEventListener('click',async()=>{
    if(busy||!bitmap)return
    end();busy=true;controls();status.textContent='正在保存…'
    try{await onSave(role,original,{...crop},revision);if(!disposed)close()}
    catch(error){if(!disposed)status.textContent=error.message}
    finally{busy=false;if(!disposed)controls()}
  })
  const setImage=async(file,initial={zoom:1,x:.5,y:.5})=>{
    if(file.size>5*1024*1024)throw Error('请选择不超过 5 MB 的图片')
    const ticket=generation
    const next=await window.createImageBitmap(file,{imageOrientation:'from-image'})
    try{
      if(next.width*next.height>25000000)throw Error('图片不能超过 2500 万像素')
      const data=await new Promise((resolve,reject)=>{
        const reader=new window.FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1])
        reader.onerror=()=>reject(Error('无法读取图片'));reader.readAsDataURL(file)
      })
      if(disposed||ticket!==generation){next.close();return}
      clean();bitmap=next;original=data;crop={...initial};draw()
    }catch(error){next.close();throw error}
  }
  dialog.querySelector('[data-crop-file]').addEventListener('change',async e=>{
    const file=e.target.files?.[0];e.target.value=''
    if(!file||busy)return
    busy=true;controls();status.textContent='正在读取图片…'
    try{await setImage(file);status.textContent=''}
    catch{status.textContent='图片无法读取，请选择不超过 5 MB、2500 万像素的图片'}
    finally{busy=false;controls()}
  })
  dialog.querySelector('[data-crop-reset]').addEventListener('click',async()=>{
    if(busy||!hasCustom||!window.confirm('恢复默认头像将移除当前图片及裁剪设置，是否继续？'))return
    busy=true;controls()
    try{await onSave(role,null,undefined,revision);if(!disposed)close()}
    catch(error){status.textContent=error.message}
    finally{busy=false;controls()}
  })
  return{
    async open(target){
      const ticket=++generation
      clean();role=target;ready=false;hasCustom=false;crop={zoom:1,x:.5,y:.5};busy=true
      previousFocus=panel.ownerDocument.activeElement
      dialog.querySelector('strong').textContent=target==='user'?'用户头像':'AI 头像'
      draw();controls();status.textContent='正在读取头像…';dialog.showModal()
      try{
        const value=await load(target)
        if(disposed||ticket!==generation)return
        revision=value.revision;ready=true;hasCustom=Boolean(value.image)
        if(value.image){
          const bytes=Uint8Array.from(window.atob(value.image),c=>c.charCodeAt(0))
          await setImage(new window.Blob([bytes]),value.crop)
        }
        if(ticket===generation)status.textContent=hasCustom?'可直接继续调整裁剪范围':'上传图片以设置头像，支持 PNG、JPEG、WebP、GIF、AVIF，最大 5 MB。'
      }catch(error){if(ticket===generation)status.textContent=error.message}
      finally{if(ticket===generation){busy=false;controls();canvas.focus()}}
    },
    close,
    dispose(){disposed=true;close();dialog.remove()},
  }
}
