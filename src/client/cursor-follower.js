import MouseFollower from 'mouse-follower'
import { gsap } from 'gsap'
import { createCursorSemantics } from './cursor-semantics.js'
import { createCursorAdapter as createNativeCursorAdapter } from './cursor-adapter.js'

// Mouse Follower owns the isolated DOM renderer. Use our Pointer Events lifecycle
// instead of its mouse/tween listeners: no easing, axis-dependent ticker or idle loop.
class DirectFollower extends MouseFollower {
  bind() {}
}
MouseFollower.registerGSAP(gsap)

export function createCursorAdapter({document, window, assets}) {
  const native = createNativeCursorAdapter({document, window, assets})
  const root = document.documentElement
  let follower, img, point, moveFrame, timer, family, resting, pressed = false, phase
  let semantics, captureTarget, layerContext, stateObserver, watchedTarget, nativePicker
  let textContext, renderedX, renderedY, nativeScrollbar=false
  let eventTarget, semanticTarget, semanticValue, pose, poseKind, dirty = true, hitDirty = true
  let suspended = false, visible = false, currentUrl, ready = false
  const staticPose=(rest,hotspot)=>({rest,hotspot})
  const vectorPose=path=>staticPose('data:image/svg+xml,'+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="'+path+'" fill="none" stroke="#101820" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="'+path+'" fill="none" stroke="#eee8dc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'),[16,16])

  const poses={
    move:vectorPose('M16 3V29M3 16H29M12 7L16 3L20 7M12 25L16 29L20 25M7 12L3 16L7 20M25 12L29 16L25 20'),
    crosshair:vectorPose('M16 4V12M16 20V28M4 16H12M20 16H28M16 15V17'),
    text:staticPose(assets?.text,assets?.textHotspot),grab:staticPose(assets?.grab,[22,19]),
    grabbing:staticPose(assets?.grabbing,[22,19]),unavailable:staticPose(assets?.unavailable,[7,7]),
    ...Object.fromEntries(Object.entries(assets?.resize || {}).map(([key,url])=>[key,staticPose(url,[16,16])])),
  }
  const resizeKinds={'n-resize':'ns','s-resize':'ns','ns-resize':'ns','row-resize':'ns',
    'e-resize':'ew','w-resize':'ew','ew-resize':'ew','col-resize':'ew',
    'ne-resize':'nesw','sw-resize':'nesw','nesw-resize':'nesw',
    'nw-resize':'nwse','se-resize':'nwse','nwse-resize':'nwse'}
  const reduced = () => root.dataset.prtsMotion === 'reduced' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  function stop() {
    if (timer !== undefined) window.clearTimeout(timer)
    timer = undefined
    pressed = false
    phase = undefined
  }
  function hide() {
    stop()
    if (follower) {
      if(follower.el.matches(':popover-open'))follower.el.hidePopover()
      follower.el.hidden = true
    }
    root.removeAttribute('data-prts-follower-visible')
    semantics?.release()
    layerContext=undefined
    stateObserver?.disconnect();watchedTarget=undefined
    visible = false
    semanticTarget=pose=poseKind=textContext=renderedX=renderedY=undefined;dirty=true
  }
  function draw(url) {
    if (!img || !url || currentUrl === url) return
    currentUrl = url
    img.src = url
  }
  function play(frames, done) {
    if(timer !== undefined) window.clearTimeout(timer)
    const started = window.performance.now()
    const tick = () => {
      timer = undefined
      if (!visible) return
      const elapsed = window.performance.now()-started
      let index=0, deadline=frames[0].duration
      while(index<frames.length-1 && elapsed>=deadline) deadline+=frames[++index].duration
      if(index===frames.length-1){done();return}
      draw(frames[index].url)
      timer=window.setTimeout(tick, Math.max(1,deadline-(window.performance.now()-started)))
    }
    tick()
  }
  function release() {
    phase='release'
    play(family.release,()=>{stop();sync()})
  }
  function sync() {
    if (!follower || !ready || !point || nativePicker || nativeScrollbar || suspended || document.hidden || document.pointerLockElement) return hide()
    const hit=hitDirty || !eventTarget?.isConnected ? document.elementFromPoint(point.x,point.y) : eventTarget
    eventTarget=hit;hitDirty=false
    if(!hit || hit.closest('iframe'))return hide()
    const target=captureTarget?.isConnected?captureTarget:hit
    if(target!==watchedTarget){
      stateObserver.disconnect();watchedTarget=target
      for(let el=target;el;el=el.parentElement)stateObserver.observe(el,{attributes:true,
        attributeFilter:['style','class','disabled','aria-disabled','open','data-dragging','data-prts-emblem-sort-active','data-markdown','data-slot','data-phase','data-chat-flow-kind','data-message-role','data-submission-echo','data-pending-steering']})
    }
    if(dirty || target!==semanticTarget){
      semanticValue=semantics.read(target)
      textContext=undefined
      semanticTarget=target;dirty=false
    }
    const raw=semanticValue
    const kind=raw.split(',').at(-1).trim()
    let nextFamily=assets
    if(kind==='none'){
      stop();follower.el.hidden=true
      root.setAttribute('data-prts-follower-visible','');visible=true
      return
    }
    if(kind==='pointer')nextFamily=assets.link
    else if(['text','vertical-text'].includes(kind))nextFamily=poses.text
    else if(resizeKinds[kind])nextFamily=poses[resizeKinds[kind]]
    else if(['grab','grabbing','move','crosshair','cell'].includes(kind))nextFamily=poses[kind==='cell'?'crosshair':kind]
    else if(kind==='not-allowed'||kind==='no-drop')nextFamily=poses.unavailable
    else {
      textContext ||= native.prepareTextHit(target)
      if(native.textHit({target,clientX:point.x,clientY:point.y,pointerType:'mouse'},textContext))nextFamily=poses.text
    }
    if(family!==nextFamily && (!phase || !family?.press || !nextFamily.press)){stop();family=nextFamily}
    resting=family.rest
    const [x,y]=family.hotspot
    if(pose!==family || poseKind!==kind){
      img.style.left=-x+'px';img.style.top=-y+'px'
      img.style.transform=kind==='vertical-text'?'rotate(90deg)':''
      pose=family;poseKind=kind
    }
    if(!phase)draw(resting)
    if(renderedX!==point.x || renderedY!==point.y){
      follower.pos.x=point.x;follower.pos.y=point.y
      follower.render(true)
      renderedX=point.x;renderedY=point.y
    }
    follower.el.hidden=false
    // A manual popover is non-interactive and stays above modal/top-layer UI.
    const context=hit.closest('dialog,[popover]') || document.fullscreenElement
    if(follower.el.showPopover && (!visible || context!==layerContext)){
      if(context!==layerContext && follower.el.matches(':popover-open'))follower.el.hidePopover()
      if(!follower.el.matches(':popover-open'))follower.el.showPopover()
    }
    layerContext=context
    if(!visible)root.setAttribute('data-prts-follower-visible','')
    visible=true
  }
  function flush() { moveFrame=undefined;sync() }
  function move(event) {
    if(event.pointerType!=='mouse')return
    if(nativeScrollbar){if(event.buttons)return;nativeScrollbar=false}
    resumePicker(event)
    if(suspended && !event.buttons)suspended=false
    const unchanged=point?.x===event.clientX && point?.y===event.clientY && eventTarget===event.target
    eventTarget=event.target;hitDirty=false
    point={x:event.clientX,y:event.clientY}
    if(pressed && !(event.buttons&1)){stop();draw(resting)}
    if(!unchanged || dirty)if(moveFrame===undefined)moveFrame=window.requestAnimationFrame(flush)
  }
  // Native scrollbar drags stop delivering mouse coordinates to the page.
  // Measure only on press; never add geometry reads to ordinary movement.
  function onScrollbar(event){
    const el=event.target
    if(!(el instanceof window.HTMLElement))return false
    if(el===root || el===document.body){
      if(event.clientX>=root.clientWidth && window.innerWidth>root.clientWidth)return true
      if(event.clientY>=root.clientHeight && window.innerHeight>root.clientHeight)return true
    }
    if(el.offsetWidth<=el.clientWidth && el.offsetHeight<=el.clientHeight)return false
    const style=window.getComputedStyle(el),rect=el.getBoundingClientRect()
    if(!el.offsetWidth || !el.offsetHeight)return false
    const x=(event.clientX-rect.left)*el.offsetWidth/rect.width
    const y=(event.clientY-rect.top)*el.offsetHeight/rect.height
    const left=parseFloat(style.borderLeftWidth)||0,right=parseFloat(style.borderRightWidth)||0
    const top=parseFloat(style.borderTopWidth)||0,bottom=parseFloat(style.borderBottomWidth)||0
    const inside=x>=left && x<el.offsetWidth-right && y>=top && y<el.offsetHeight-bottom
    if(!inside)return false
    const vertical=el.scrollHeight>el.clientHeight && /^(auto|scroll)$/.test(style.overflowY)
      && el.offsetWidth-el.clientWidth-left-right>0 && (x<el.clientLeft || x>=el.clientLeft+el.clientWidth)
    const horizontal=el.scrollWidth>el.clientWidth && /^(auto|scroll)$/.test(style.overflowX)
      && el.offsetHeight-el.clientHeight-top-bottom>0 && y>=el.clientTop+el.clientHeight
    return vertical || horizontal
  }
  function down(event) {
    if(event.pointerType!=='mouse'){reset();return}
    if(event.button!==0||event.isPrimary===false)return
    if(onScrollbar(event)){reset();nativeScrollbar=true;return}
    const picker=event.target.closest?.('select,input[type="file"],input[type="color"]')
    if(picker){nativePicker=picker;reset();return}
    nativePicker=undefined
    stop();dirty=true;eventTarget=event.target;hitDirty=false;point={x:event.clientX,y:event.clientY};sync()
    if(!visible || follower.el.hidden)return
    if(!family?.press)return
    stop();pressed=true
    if(reduced()){phase='hold';draw(family.hold);return}
    phase='press'
    play(family.press,()=>{
      phase='hold';draw(family.hold)
      if(!pressed)timer=window.setTimeout(release,48)
    })
  }
  // Boundary updates only change the shared renderer's image; the browser
  // cursor stays hidden throughout. Ordinary movement remains coalesced.
  // Native pickers do not expose a reliable close event (including Escape).
  // Resume only on pointer activity outside their owning control; refreshes
  // and pointer activity on the select must never resurrect the overlay.
  function resumePicker(event){
    if(nativePicker && !nativePicker.contains(event.target))nativePicker=undefined
  }
  function keydown(event){
    const picker=event.target.closest?.('select,input[type="file"],input[type="color"]')
    if(picker && [' ','Enter','ArrowDown','ArrowUp','F4'].includes(event.key)){nativePicker=picker;reset()}
  }
  function over(event) {
    if(event.pointerType!=='mouse')return
    if(nativeScrollbar){if(event.buttons)return;nativeScrollbar=false}
    resumePicker(event)
    if(moveFrame!==undefined)window.cancelAnimationFrame(moveFrame)
    moveFrame=undefined
    dirty=true;eventTarget=event.target;hitDirty=false
    point={x:event.clientX,y:event.clientY}
    sync()
  }
  function up(event) {
    if(nativeScrollbar && event.pointerType==='mouse' && event.button===0){nativeScrollbar=false;move(event);return}
    if(event.pointerType!=='mouse'||event.button!==0||!pressed)return
    pressed=false;dirty=true
    if(reduced()){stop();draw(resting);return}
    if(phase!=='press')release()
  }
  function reset() {
    if(moveFrame!==undefined)window.cancelAnimationFrame(moveFrame)
    moveFrame=undefined;point=undefined;eventTarget=undefined;hitDirty=true;captureTarget=undefined;nativeScrollbar=false;hide()
  }
  function blur(event){if(event.target===window)reset()}
  function leave(event){if(!event.relatedTarget || event.relatedTarget.closest?.('iframe'))reset()}
  function drag(){suspended=true;reset()}
  function visibility(){if(document.hidden)reset()}
  // Passive changes can also move elements beneath a stationary pointer.
  // Re-hit then; ordinary pointer events already carry the browser's result.
  function refresh(){
    dirty=true;hitDirty=true
    if(point && moveFrame===undefined)moveFrame=window.requestAnimationFrame(flush)
  }
  function capture(event){captureTarget=event.target;refresh()}
  function uncapture(event){captureTarget=undefined;refresh(event)}
  const events=[['pointermove',move],['pointerover',over],['pointerdown',down],['pointerup',up],
    ['pointercancel',reset],['pointerout',leave],['blur',blur],['dragstart',drag],
    ['scroll',refresh],['resize',refresh],['focusin',refresh],['click',refresh],
    ['gotpointercapture',capture],['lostpointercapture',uncapture],['contextmenu',drag],['keydown',keydown]]
  function disposeFollower(){
    reset()
    for(const [name,fn]of events)window.removeEventListener(name,fn,true)
    document.removeEventListener('visibilitychange',visibility)
    document.removeEventListener('fullscreenchange',reset)
    document.removeEventListener('pointerlockchange',reset)
    if(follower){
      window.clearTimeout(follower.visibleInt)
      gsap.killTweensOf(follower.pos)
      follower.destroy()
    }
    semantics?.dispose();semantics=undefined
    stateObserver?.disconnect();stateObserver=watchedTarget=undefined
    follower=img=family=currentUrl=undefined
    ready=false
    suspended=false
    nativePicker=undefined
  }
  return {
    update(preferences){
      const experimental=preferences.enabled && preferences.cursor==='prts-follower'
      native.update({...preferences,enabled:preferences.enabled && !experimental})
      if(!experimental){disposeFollower();return}
      if(follower)return
      follower=new DirectFollower({container:document.body,eventsTarget:document.documentElement,
        className:'prts-cursor-follower',innerClassName:'prts-cursor-follower-inner',
        speed:0,ease:'none',skewing:0,stateDetection:{},dataAttr:null,
        visible:false,hideOnLeave:false,showTimeout:0,hideTimeout:0})
      gsap.ticker.remove(follower.ticker)
      stateObserver=new window.MutationObserver(refresh)
      semantics=createCursorSemantics({document,window,onChange:refresh})
      follower.el.setAttribute('popover','manual')
      follower.el.hidden=true
      follower.el.setAttribute('aria-hidden','true')
      // Keep the native cursor until decoding finishes; setting src alone
      // does not guarantee the first displayed frame is ready to paint.
      const instance=follower, decoded=[]
      for(const group of [assets,assets.link])for(const url of [group.rest,group.hold,...group.press.map(f=>f.url),...group.release.map(f=>f.url)]){
        const image=new window.Image();image.src=url
        decoded.push(image.decode())
      }
      for(const url of [...Object.values(assets.resize || {}),assets.text,assets.grab,assets.grabbing,assets.unavailable,poses.move.rest,poses.crosshair.rest]){
        const image=new window.Image();image.src=url;decoded.push(image.decode())
      }
      img=document.createElement('img');img.alt='';img.draggable=false
      follower.inner.append(img)
      for(const [name,fn]of events)window.addEventListener(name,fn,true)
      document.addEventListener('visibilitychange',visibility)
      document.addEventListener('fullscreenchange',reset)
      document.addEventListener('pointerlockchange',reset)
      Promise.all(decoded).then(()=>{
        if(follower!==instance)return
        ready=true
        sync()
      }).catch(()=>{if(follower===instance)hide()})
    },
    dispose(){disposeFollower();native.dispose()},
  }
}
