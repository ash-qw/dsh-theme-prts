// Cards own touch gestures: immediate swipes scroll, while a hold locks into sorting.
export function mountEmblemReorder({ list, window, status, canStart, onStart, onCommit }) {
  let gesture = null, holdTimer, frame, previousTime = 0, suppressClick = false
  const rows = () => [...list.children].filter(row => row.hasAttribute('data-emblem-key'))
  const scroller = list.closest('[data-prts-theme-settings-scroll]')
  const clear = () => {
    window.clearTimeout(holdTimer); window.cancelAnimationFrame(frame)
    holdTimer = frame = undefined; previousTime = 0
  }
  const finish = (commit = false) => {
    const current = gesture
    if (!current) return
    gesture = null; clear()
    current.ghost?.remove();current.row.removeAttribute('data-prts-emblem-dragging')
    list.removeAttribute('data-prts-emblem-sorting')
    scroller?.removeAttribute('data-prts-emblem-sort-active')
    current.handle.setAttribute('aria-pressed','false')
    try { if (list.hasPointerCapture?.(current.pointerId)) list.releasePointerCapture(current.pointerId) } catch {}
    const ordered = rows().map(row=>row.dataset.emblemKey)
    const changed = ordered.some((key,index)=>key!==current.original[index].dataset.emblemKey)
    if (!commit) for (const row of current.original) list.append(row)
    if (current.active) {
      status.textContent = commit ? '徽记顺序未改变' : '已取消排序，原顺序保持不变'
      if (commit && changed) void onCommit(ordered,current.row.dataset.emblemKey)
      else current.handle.focus({preventScroll:true})
    }
  }
  const place = y => {
    const current = gesture
    if (!current?.active) return
    const others = rows().filter(row=>row!==current.row)
    const next = others.find(row=>{const box=row.getBoundingClientRect();return y < box.top + box.height/2})
    if (next) {
      if (current.row.nextElementSibling !== next) list.insertBefore(current.row,next)
    } else if (others.at(-1)?.nextElementSibling !== current.row) list.insertBefore(current.row,current.ghost)
    current.position = rows().indexOf(current.row)
  }
  const tick = time => {
    if (!gesture?.active || gesture.keyboard) return
    const current = gesture
    if (!list.isConnected || !list.getClientRects().length) { finish();return }
    const delta = previousTime ? Math.min(32,time-previousTime) : 16
    previousTime=time
    if (scroller) {
      const box=scroller.getBoundingClientRect(), edge=48
      const speed=current.y < box.top+edge ? -Math.min(1,(box.top+edge-current.y)/edge)
        : current.y > box.bottom-edge ? Math.min(1,(current.y-box.bottom+edge)/edge) : 0
      if (speed) scroller.scrollTop += speed * delta * .5
    }
    place(current.y)
    current.ghost.style.transform=`translate3d(${current.x-current.startX}px,${current.y-current.startY}px,0)`
    frame=window.requestAnimationFrame(tick)
  }
  const activate = () => {
    const current=gesture
    if (!current || !canStart() || !current.row.isConnected) {finish();return}
    onStart?.()
    current.active=true
    suppressClick=true
    current.handle.setAttribute('aria-pressed','true')
    list.setAttribute('data-prts-emblem-sorting','')
    if (!current.keyboard) {
      scroller?.setAttribute('data-prts-emblem-sort-active','')
      const box=current.row.getBoundingClientRect()
      const ghost=current.row.cloneNode(true)
      ghost.removeAttribute('data-emblem-key');ghost.setAttribute('data-prts-emblem-drag-ghost','')
      ghost.setAttribute('aria-hidden','true');ghost.inert=true
      const originals=current.row.querySelectorAll('canvas')
      ghost.querySelectorAll('canvas').forEach((canvas,index)=>canvas.getContext('2d')?.drawImage(originals[index],0,0))
      Object.assign(ghost.style,{position:'fixed',left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,boxSizing:'border-box',margin:'0',pointerEvents:'none',zIndex:'10'})
      current.ghost=ghost;list.append(ghost)
      // Native dialogs can establish a fixed-position containing block. Keep the lifted row under the pointer.
      const positioned=ghost.getBoundingClientRect()
      ghost.style.left=`${2*box.left-positioned.left}px`;ghost.style.top=`${2*box.top-positioned.top}px`
      try {list.setPointerCapture(current.pointerId)}catch{finish();return}
      frame=window.requestAnimationFrame(tick)
    }
    current.row.setAttribute('data-prts-emblem-dragging','')
    status.textContent='正在调整徽记顺序，松开保存；按 Esc 取消'
  }
  const down = event => {
    if (gesture) { if (event.pointerId!==gesture.pointerId) finish();return }
    const row=event.target.closest('[data-emblem-key]')
    const handle=row?.querySelector('[data-prts-emblem-reorder]')
    suppressClick=false
    if (!handle || handle.disabled || event.button!==0 || event.isPrimary===false || !canStart() || rows().length<2) return
    gesture={handle,row,pointerType:event.pointerType,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,original:rows(),active:false}
    holdTimer=window.setTimeout(activate,400)
  }
  const move = event => {
    if (!gesture || gesture.pointerId!==event.pointerId) return
    const previousY=gesture.y
    gesture.x=event.clientX;gesture.y=event.clientY
    if (!gesture.active && !gesture.scrolling && Math.hypot(gesture.x-gesture.startX,gesture.y-gesture.startY)>8) {
      if (gesture.pointerType !== 'touch') {finish();return}
      window.clearTimeout(holdTimer)
      gesture.scrolling=true;suppressClick=true
      try {list.setPointerCapture(gesture.pointerId)}catch{finish();return}
      // Include the movement accumulated while deciding between a tap and a swipe.
      if(scroller)scroller.scrollTop += gesture.startY-previousY
    }
    if (gesture.scrolling && scroller) scroller.scrollTop += previousY-gesture.y
    if (gesture.active || gesture.scrolling) event.preventDefault()
  }
  const up = event => {
    if (gesture?.pointerId!==event.pointerId) return
    if (gesture.scrolling) {finish();return}
    const box=list.getBoundingClientRect(), viewport=(scroller || list).getBoundingClientRect()
    finish(event.clientX>=box.left && event.clientX<=box.right && event.clientY>=viewport.top && event.clientY<=viewport.bottom)
  }
  const cancelPointer = event => {if (gesture?.pointerId===event.pointerId) finish()}
  const cancel = () => finish()
  const visibility = () => {if (window.document.hidden) finish()}
  const keydown = event => {
    if (event.key==='Escape' && gesture) {event.preventDefault();event.stopPropagation();finish();return}
    const handle=event.target.closest?.('[data-prts-emblem-reorder]')
    if (!handle || handle.disabled || !canStart()) return
    if ([' ','Enter'].includes(event.key)) {
      event.preventDefault()
      if (gesture?.keyboard) {finish(true);return}
      if (gesture) return
      gesture={handle,row:handle.closest('[data-emblem-key]'),original:rows(),keyboard:true,active:false}
      activate();status.textContent='用上下方向键调整顺序，空格或回车保存；Esc 取消'
    } else if (gesture?.keyboard && ['ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
      event.preventDefault()
      const current=rows(),index=current.indexOf(gesture.row)
      const target=event.key==='Home'?0:event.key==='End'?current.length-1:Math.max(0,Math.min(current.length-1,index+(event.key==='ArrowDown'?1:-1)))
      if (target!==index)list.insertBefore(gesture.row,target<index?current[target]:current[target].nextSibling)
      gesture.handle.focus({preventScroll:true});gesture.row.scrollIntoView({block:'nearest'})
      status.textContent=`当前位置：第 ${target+1} 项，共 ${current.length} 项；空格保存`
    }
  }
  const touchmove = event => {if(gesture?.active && !gesture.keyboard)event.preventDefault()}
  const context = event => {if(event.target.closest('[data-emblem-key]')||gesture?.active)event.preventDefault()}
  const click = event => {if(suppressClick || gesture?.active || event.target.closest('[data-prts-emblem-reorder]')){event.preventDefault();event.stopPropagation()}}
  list.addEventListener('touchmove',touchmove,{passive:false})
  list.addEventListener('pointerdown',down)
  list.addEventListener('contextmenu',context)
  list.addEventListener('click',click,true)
  window.addEventListener('pointermove',move,{passive:false})
  window.addEventListener('pointerup',up)
  window.addEventListener('pointercancel',cancelPointer)
  list.addEventListener('lostpointercapture',cancelPointer)
  window.addEventListener('keydown',keydown,true)
  window.addEventListener('blur',cancel)
  window.addEventListener('resize',cancel)
  window.document.addEventListener('visibilitychange',visibility)
  return { cancel, get active(){return !!gesture?.active}, dispose() {
    finish()
    list.removeEventListener('touchmove',touchmove);list.removeEventListener('pointerdown',down);list.removeEventListener('contextmenu',context);list.removeEventListener('click',click,true)
    window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancelPointer)
    list.removeEventListener('lostpointercapture',cancelPointer);window.removeEventListener('keydown',keydown,true);window.removeEventListener('blur',cancel);window.removeEventListener('resize',cancel)
    window.document.removeEventListener('visibilitychange',visibility)
  } }
}
