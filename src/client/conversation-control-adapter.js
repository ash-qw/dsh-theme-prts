export const CONVERSATION_CONTROL_ATTRIBUTE = 'data-prts-conversation-control'

function hasClassSuffix(node, suffix) {
  return [...(node?.classList ?? [])].some(token => token.endsWith(suffix))
}

function closestWithClassSuffix(node, suffix) {
  for (let current = node; current?.nodeType === 1; current = current.parentElement) {
    if (hasClassSuffix(current, suffix)) return current
  }
  return null
}

function isPendingInteractionAction(button) {
  if (!button || button.tagName !== 'BUTTON') return false
  if (button.closest('[data-approval-key]')) return true
  if (button.closest('[data-question-key]')) {
    return hasClassSuffix(button, '_waitButton') || Boolean(closestWithClassSuffix(button, '_footerActions'))
  }
  return Boolean(button.closest('[data-plan-review-key]') && closestWithClassSuffix(button, '_actions'))
}

function classify(button, operation) {
  // The host's process disclosure owns its transparent, full-width hit area.
  if (button.hasAttribute('data-turn-process')) return null
  if (button.querySelector('[data-compaction-disclosure]')) return null
  // Notification headers belong to the card surface, not standalone buttons.
  if (button.parentElement?.matches('[data-turn-trigger]')) return null
  // Changed-file cards own one outer surface; their header and rows stay native.
  if (button.closest('[data-changed-files]')) return null
  // File previews are transparent hit targets; the enclosing card owns its material and outline.
  if (button.closest('[data-presented-file]') && hasClassSuffix(button, '_cardPreview')) return null
  if (button.tagName !== 'BUTTON' || !operation.contains(button)) return null
  if (hasClassSuffix(button, '_sessionLogButton')) return 'header'
  const tokens=[...(button.classList ?? [])]
  const fileMention=tokens.some(token=>/(?:^|_)fileMention(?:_|$)/.test(token))
  const fileLink=tokens.some(token=>/(?:^|_)fileLink(?:_|$)/.test(token))
  // Tool summaries own a compact, single-line link; card padding/wrapping clips it.
  if (fileLink && !fileMention) return null
  const fileChange=hasClassSuffix(button,'_header')
    && [...button.children].some(node=>hasClassSuffix(node,'_tile'))
    && [...button.children].some(node=>hasClassSuffix(node,'_titles'))
  if (fileMention || fileChange || button.closest('[data-produced-files-row]')) return 'file'
  if (hasClassSuffix(button, '_showFolder')) return 'utility'
  if (closestWithClassSuffix(button, '_older')) return 'utility'
  if (hasClassSuffix(button, '_inspectButton')) return 'inspect'

  const approval = button.closest('[data-approval-key]')
  if (approval) return hasClassSuffix(button, '_reject') ? 'danger' : 'cta'
  if (hasClassSuffix(button, '_modalAction') || button.closest('[role="dialog"]')) return 'cta'

  const userRow = closestWithClassSuffix(button, '_userRow')
  if (userRow?.matches('[data-submission-echo], [data-pending-steering]')) return 'micro'
  if (button.closest('[data-chat-flow-kind], [data-message-role]')) return 'micro'
  return null
}

export function createConversationControlAdapter({ document, window }) {
  let observer
  let disposeFrame
  let operation
  const owned = new Set()
  const pending = new Set()

  function collectButtons(node) {
    if (node?.nodeType !== 1) return
    if (node.tagName === 'BUTTON') pending.add(node)
    for (const button of node.querySelectorAll?.('button') ?? []) pending.add(button)
    const closest = node.closest?.('button')
    if (closest) pending.add(closest)
  }

  function process(button) {
    const kind = button?.isConnected ? classify(button, operation) : null
    if (!kind) {
      button?.removeAttribute?.(CONVERSATION_CONTROL_ATTRIBUTE)
      owned.delete(button)
      return
    }
    button.setAttribute(CONVERSATION_CONTROL_ATTRIBUTE, kind)
    owned.add(button)
  }

  function scan() {
    for (const button of pending) process(button)
    pending.clear()
    for (const button of [...owned]) {
      if (!button.isConnected) process(button)
    }
  }

  function queueScan() {
    scan()
  }

  function onMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') collectButtons(mutation.target)
      for (const node of mutation.addedNodes ?? []) collectButtons(node)
      for (const node of mutation.removedNodes ?? []) {
        if (node?.nodeType !== 1) continue
        for (const button of owned) {
          if (button === node || node.contains?.(button)) pending.add(button)
        }
      }
    }
    if (pending.size) queueScan()
  }

  function clear() {
    for (const button of owned) button.removeAttribute?.(CONVERSATION_CONTROL_ATTRIBUTE)
    owned.clear()
    pending.clear()
  }

  return {
    start() {
      if (!document) return
      const nextOperation = document.querySelector('[data-prts-region="operation"]')
      if(operation && operation!==nextOperation){
        disposeFrame?.();disposeFrame=undefined;observer?.disconnect();observer=undefined;clear()
      }
      operation = nextOperation
      if (!operation) return
      disposeFrame ||= mountBodyTargetFrame(document, window, operation)
      collectButtons(operation)
      scan()
      if (observer || !window?.MutationObserver) return
      observer = new window.MutationObserver(onMutations)
      observer.observe(operation, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'data-approval-key', 'data-turn-process', 'data-submission-echo', 'data-pending-steering', 'data-chat-flow-kind', 'data-message-role'],
      })
    },
    dispose() {
      disposeFrame?.();disposeFrame=undefined
      observer?.disconnect()
      observer = undefined
      clear()
      operation = undefined
    },
  }
}

// One shared frame follows body targets, including transitions between neighboring controls.
function mountBodyTargetFrame(document, window, operation) {
  // Nonvisual hosts can still mount the theme without an animation clock.
  if (!window?.requestAnimationFrame || !window?.cancelAnimationFrame) return () => {}
  const composerButton=':is([data-composer-card],[data-prts-composer-fallback]) button:not([data-slot="conversation.input.attachments"] *,[data-prts-glass-menu] *,[data-prts-floating-glass] *,[role="menu"] *,[role="listbox"] *)'
  const selector='[data-prts-to-bottom],[data-prts-conversation-control],[data-presented-file],[data-changed-files],[data-produced-files-row] > button,[data-prts-glass-control],[data-prts-footer-action],[data-prts-transfer] button,'+composerButton
  const frame=document.createElement('div')
  frame.setAttribute('data-prts-body-target-frame','');frame.setAttribute('aria-hidden','true')
  const corners=Array.from({length:4},()=>frame.appendChild(document.createElement('i')))
  document.body.append(frame)
  if(frame.showPopover)frame.setAttribute('popover','manual')
  let layer=null, imageRetiring=false
  const hideFrame=()=>{
    if(frame.hidePopover && frame.matches(':popover-open'))frame.hidePopover()
  }
  const showFrame=()=>{
    if(!frame.showPopover)return
    const modal=target?.closest('dialog[open]')
    if(modal!==layer)hideFrame()
    if(!frame.matches(':popover-open'))frame.showPopover()
    layer=modal
  }
  let target=null, hovered=null, focused=null, raf=0, pressed=false, releasePending=false, disposed=false
  let pointer={x:0,y:0}, state=null, settled=false, tween=null, bounds=null, boundsDirty=false, hitDirty=false, exitGoal=null, motionDuration=240, targetArm=7, retiringBounds=null, targetRetires=false
  const resizeObserver=window.ResizeObserver?new window.ResizeObserver(()=>{boundsDirty=true;wake()}):null
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const fine=window.matchMedia?.('(hover:hover) and (pointer:fine)')
  let activeModal=null
  const find=node=>{
    if(activeModal && !activeModal.contains(node))return null
    if (!node?.closest || node.closest('[data-prts-workspace-actions],[data-prts-session-actions]')) return null
    const card=node.closest('[data-presented-file],[data-changed-files]')
    const button=node.closest('button')
    const pendingAction=operation.contains(button) && isPendingInteractionAction(button) ? button : null
    const candidate=card || pendingAction || node.closest(selector)
    return candidate && !candidate.matches(':disabled,[aria-disabled="true"]') && !candidate.closest('[inert]') ? candidate : null
  }
  const measure=()=>{bounds=target.getBoundingClientRect();targetArm=7+Math.max(0,Math.min(1,(Math.min(bounds.width,bounds.height)-36)/36))*5;boundsDirty=false}
  const wake=()=>{if(!raf && !disposed)raf=window.requestAnimationFrame(draw)}
  const choose=()=>{
    const next=(hovered?.isConnected?hovered:null) || (focused?.isConnected?focused:null)
    if(next!==target){
      const retire=!next && target && !target.isConnected && targetRetires && releasePending && bounds && !reduced?.matches
      imageRetiring=false
      retiringBounds=retire?{left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height}:null
      target?.removeAttribute('data-prts-corner-target')
      if(retire){hovered=focused=target=null;boundsDirty=false;resizeObserver?.disconnect();wake();return}
      pressed=false;releasePending=false;settled=false;tween=null;exitGoal=null;motionDuration=240;target=next;boundsDirty=true
      resizeObserver?.disconnect()
      if(target)resizeObserver?.observe(target)
      if(target){
        targetRetires=hasClassSuffix(target,'_toBottom') || isPendingInteractionAction(target)
        target.setAttribute('data-prts-corner-target','');showFrame()
        measure();const box=bounds
        if(!state || state.alpha<.01)state={x:(hovered?pointer.x:box.left+box.width/2)-10,y:(hovered?pointer.y:box.top+box.height/2)-10,w:20,h:20,alpha:0,arm:7}
        const style=window.getComputedStyle(target)
        frame.style.color=target.getAttribute('data-prts-conversation-control')==='danger'?style.getPropertyValue('--prts-red'):'var(--prts-corner-color, var(--prts-yellow))'
      }
    }
    if(!settled || !target && state?.alpha>0)wake()
  }
  function draw(time) {
    raf=0
    if(target && !target.isConnected)choose()
    if(hitDirty){hitDirty=false;hovered=find(document.elementFromPoint(pointer.x,pointer.y));choose()}
    if(target && !target.isConnected){target.removeAttribute('data-prts-corner-target');target=hovered=focused=null;pressed=false;releasePending=false;settled=false;exitGoal=null}
    if(!state)return
    if(target && boundsDirty){
      measure()
      if(!bounds.width && !bounds.height){target.removeAttribute('data-prts-corner-target');target=hovered=focused=null;pressed=false;releasePending=false;settled=false;exitGoal=null;resizeObserver?.disconnect()}
    }
    const box=target?bounds:retiringBounds,gap=pressed?(imageRetiring?0:3):5
    // Freeze the exit destination: subsequent pointer motion must not restart the fade.
    const goal=box?{x:box.left-gap,y:box.top-gap,w:box.width+gap*2,h:box.height+gap*2,alpha:1,arm:targetArm}:
      (exitGoal ||= {x:pointer.x-10,y:pointer.y-10,w:20,h:20,alpha:0,arm:7})
    // Align endpoints once; rounding each animation frame turns a 3px release into visible steps.
    const ratio=window.devicePixelRatio || 1,pixel=value=>Math.round(value*ratio)/ratio
    const edgeRight=pixel(goal.x+goal.w),edgeBottom=pixel(goal.y+goal.h)
    goal.x=pixel(goal.x);goal.y=pixel(goal.y);goal.w=edgeRight-goal.x;goal.h=edgeBottom-goal.y
    const keys=['x','y','w','h','alpha','arm']
    if(!tween || keys.some(key=>tween.to[key]!==goal[key])){
      const remaining=tween && tween.pressed===pressed?Math.max(0,tween.start+tween.duration-time):motionDuration
      tween={from:{...state},to:{...goal},start:time,duration:remaining,pressed}
    }
    // All channels share one endpoint; no separate thresholds or late position snap.
    const progress=reduced?.matches || settled || !tween.duration?1:Math.min(1,(time-tween.start)/tween.duration)
    const ease=1-(1-progress)**3
    for(const key of keys)state[key]=tween.from[key]+(goal[key]-tween.from[key])*ease
    const moving=progress<1
    const x=state.x,y=state.y
    const right=state.x+state.w-7,bottom=state.y+state.h-7
    const positions=[[x,y],[right,y],[x,bottom],[right,bottom]]
    corners.forEach((corner,index)=>{
      const transform=`translate3d(${positions[index][0]}px,${positions[index][1]}px,0)`
      if(corner.style.transform!==transform)corner.style.transform=transform
    })
    const armScale=String(state.arm/7)
    if(frame.style.getPropertyValue('--prts-arm-scale')!==armScale)frame.style.setProperty('--prts-arm-scale',armScale)
    const opacity=String(state.alpha)
    if(frame.style.opacity!==opacity)frame.style.opacity=opacity
    settled=!moving
    frame.toggleAttribute('data-pressed',pressed)
    if(releasePending && pressed && !moving){
      if(retiringBounds){exitGoal={...state,alpha:0};retiringBounds=null}
      releasePending=false;pressed=false;motionDuration=imageRetiring?120:140;settled=false;wake()
    }
    else if(moving)wake()
    else {tween=null;if(!state.alpha)hideFrame()}
  }
  const move=event=>{
    if(document.hidden || event.pointerType==='touch' || !fine?.matches)return
    pointer={x:event.clientX,y:event.clientY}
    const next=find(event.target)
    if(next===hovered && (next || !state?.alpha))return
    hovered=next;choose()
  }
  const leave=()=>{hovered=null;choose()}
  const focus=event=>{focused=event.target.matches?.(':focus-visible')?find(event.target):null;choose()}
  const blur=()=>{focused=null;choose()}
  const down=event=>{
    pointer={x:event.clientX,y:event.clientY}
    if(event.pointerType==='touch')hovered=find(event.target)
    choose()
    if(target && find(event.target)===target){pressed=true;releasePending=false;motionDuration=100;settled=false;wake()}
  }
  const release=()=>{
    // A tap can release before the first paint. Finish one contraction, then
    // expand; one flag keeps repeated taps interruptible without a timer queue.
    if(pressed && !settled && !reduced?.matches){releasePending=true;settled=false;wake()}
    else {pressed=false;releasePending=false;motionDuration=140;settled=false;wake()}
  }
  const up=event=>{release();if(event.pointerType==='touch')hovered=null;choose()}
  const reset=()=>{
    target?.removeAttribute('data-prts-corner-target');hideFrame()
    hovered=focused=target=null;state=tween=bounds=exitGoal=retiringBounds=null
    imageRetiring=false
    pressed=false;releasePending=false;settled=true;boundsDirty=hitDirty=false
    resizeObserver?.disconnect();window.cancelAnimationFrame(raf);raf=0
    frame.style.opacity='0';frame.removeAttribute('data-pressed')
  }
  const syncModal=()=>{
    const modals=[...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')]
    const previousModal=activeModal
    activeModal=modals.filter(node=>!node.hidden && node.getAttribute('aria-hidden')!=='true').at(-1) ?? null
    if(activeModal===previousModal)return
    if(activeModal && target && !activeModal.contains(target) && target.querySelector('img') && activeModal.querySelector('img') && releasePending && bounds && !reduced?.matches){
      // The preview is opaque: show a bounded click acknowledgment above it,
      // then fade at the thumbnail position instead of retaining a hover target.
      imageRetiring=true;motionDuration=120;tween=null
      retiringBounds={left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height}
      target.removeAttribute('data-prts-corner-target');hovered=focused=target=null
      boundsDirty=hitDirty=false;resizeObserver?.disconnect();settled=false;wake()
    }else if(imageRetiring || activeModal && (!target || !activeModal.contains(target)))reset()
  }
  // Native image previews mount a body portal without moving the pointer.
  // Watch portal changes only, not the streaming conversation subtree.
  const modalObserver=window.MutationObserver?new window.MutationObserver(syncModal):null
  modalObserver?.observe(document.body,{childList:true})
  const modalToggle=event=>{if(event.target?.matches?.('dialog'))syncModal()}
  document.addEventListener('toggle',modalToggle,true)
  syncModal()
  const visibility=()=>{if(document.hidden)reset()}
  const scroll=()=>{if(!target && !state?.alpha)return;boundsDirty=true;hitDirty=!!hovered;wake()}
  document.addEventListener('scroll',scroll,true)
  window.addEventListener('resize',reset)
  const key=event=>{if(target && (event.key===' ' || event.key==='Enter')){if(event.type==='keyup')release();else {pressed=true;releasePending=false;motionDuration=100;settled=false;wake()}}}
  const listeners=[
    [document,'pointermove',move],[document,'pointerleave',leave],
    [document,'focusin',focus],[document,'focusout',blur],
    [document,'pointerdown',down],[document,'pointerup',up],[document,'pointercancel',reset],
    [document,'keydown',key],[document,'keyup',key],[window,'blur',reset],
    [window,'pagehide',reset],[document,'visibilitychange',visibility]
  ]
  for(const [node,event,handler] of listeners)node.addEventListener(event,handler)
  return ()=>{
    modalObserver?.disconnect();document.removeEventListener('toggle',modalToggle,true)
    disposed=true;target?.removeAttribute('data-prts-corner-target');hideFrame();window.cancelAnimationFrame(raf);resizeObserver?.disconnect()
    document.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',reset)
    for(const [node,event,handler] of listeners)node.removeEventListener(event,handler)
    frame.remove()
  }
}
