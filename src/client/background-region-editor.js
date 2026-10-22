import { backgroundPlacement } from '../shared/background-region.js'

export function backgroundRegionMarkup(slot) {
  return `<dialog data-prts-region-editor="${slot}" aria-labelledby="prts-region-title-${slot}">
    <header><div><strong id="prts-region-title-${slot}">保护重要区域</strong><p>拖动框移动，拖动四边或四角缩放。横向优先保留中心，纵向优先保留顶端。</p></div><button type="button" data-prts-region-cancel aria-label="关闭保护区域设置">×</button></header>
    <div data-prts-region-workspace><section data-prts-region-original><strong>原图与保护框</strong><div data-prts-region-stage><img alt="背景原图" draggable="false"><div data-prts-region-box tabindex="0" role="group" aria-label="保护区域，方向键移动"><span>保护区域</span>${['nw','ne','sw','se','n','e','s','w'].map((corner,i)=>`<button type="button" data-prts-region-handle="${corner}" aria-label="调整${['左上角','右上角','左下角','右下角','上边','右边','下边','左边'][i]}，使用方向键"></button>`).join('')}</div><div data-prts-region-ruler="x"></div><div data-prts-region-ruler="y"></div></div><small>边缘刻度为图片坐标。可用方向键移动，Shift 加速。</small></section>
    <section data-prts-region-samples><strong>窗口裁剪预览</strong><p>${slot==='sidebar' ? '按当前侧栏高度等比例预览，包含导航栏背景。' : '白框标出保护区域，调整时同步更新。'}</p><div data-prts-region-preview-grid>${(slot==='sidebar' ? [['narrow','较窄侧栏 · 264px'],['wide','较宽侧栏 · 420px']] : [['wide','横向窗口 · 16:9'],['narrow','纵向窗口 · 9:16']]).map(([kind,label])=>`<figure><figcaption>${label}</figcaption><div data-prts-region-preview="${kind}"><i></i></div><small data-prts-region-warning hidden>此比例无法完整显示保护区域：横向保中心，纵向保顶端。</small></figure>`).join('')}</div></section></div>
    <footer><button type="button" data-prts-region-create>恢复默认框</button><button type="button" data-prts-region-clear>清除保护区域</button><span></span><button type="button" data-prts-region-cancel>取消</button><button type="button" data-prts-region-save>保存</button></footer><p data-prts-region-status role="status"></p>
  </dialog>`
}
export function mountBackgroundRegionEditor({section,window,store}) {
  let state=store.snapshot(), active, draft=null, revision, imageId, busy=false, disposed=false, drag
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v))
  const defaultRegion=()=>({x:.25,y:.2,width:.5,height:.6})
  const editor=()=>active && section.querySelector(`[data-prts-region-editor="${active}"]`)
  function draw(){
    const el=editor(),entry=state[active];if(!el||!entry)return
    const box=el.querySelector('[data-prts-region-box]')
    box.hidden=!draft
    if(draft)Object.assign(box.style,{left:`${draft.x*100}%`,top:`${draft.y*100}%`,width:`${draft.width*100}%`,height:`${draft.height*100}%`})
    for(const axis of ['x','y']){
      const ruler=el.querySelector(`[data-prts-region-ruler="${axis}"]`)
      ruler.innerHTML=[0,25,50,75,100].filter(v=>!draft||Math.abs(v-draft[axis]*100)>8).map(v=>`<span style="${axis==='x'?'left':'top'}:${v}%">${v}</span>`).join('')
      if(draft)ruler.innerHTML+=`<b style="${axis==='x'?'left':'top'}:${draft[axis]*100}%">${Math.round(draft[axis]*100)}%</b>`
    }
    const previews=[...el.querySelectorAll('[data-prts-region-preview]')]
    const sidebarHeight=section.ownerDocument.querySelector('[data-prts-region="sessions"]')?.clientHeight||window.innerHeight
    const railWidth=parseFloat(window.getComputedStyle(section.ownerDocument.documentElement).getPropertyValue('--prts-nav-width'))||0
    // DSH 0.2.1-rc.2 clamps the sidebar track to 264–420px; use the same scale for both samples.
    const sidebarScale=Math.min(240/Math.max(1,sidebarHeight),...previews.map(preview=>Math.max(1,preview.parentElement.clientWidth)/((preview.dataset.prtsRegionPreview==='narrow'?264:420)+railWidth)))
    for(const preview of previews){
      const narrow=preview.dataset.prtsRegionPreview==='narrow'
      const w=active==='sidebar'?((narrow?264:420)+railWidth)*sidebarScale:Math.max(1,Math.min(narrow?112:200,preview.parentElement.clientWidth))
      const h=active==='sidebar'?sidebarHeight*sidebarScale:w*(narrow?16/9:9/16)
      const p=backgroundPlacement(entry.width,entry.height,w,h,draft)
      Object.assign(preview.style,{width:`${w}px`,height:`${h}px`,backgroundImage:`url("/prts-theme-api/backgrounds/image/${entry.id}")`,backgroundSize:`${p.width}px ${p.height}px`,backgroundPosition:`${p.x}px ${p.y}px`})
      const mark=preview.firstElementChild;mark.hidden=!draft
      if(draft)Object.assign(mark.style,{left:`${p.x+draft.x*p.width}px`,top:`${p.y+draft.y*p.height}px`,width:`${draft.width*p.width}px`,height:`${draft.height*p.height}px`})
      preview.parentElement.querySelector('[data-prts-region-warning]').hidden=!p.clipped
    }
    for(const button of el.querySelectorAll('button'))button.disabled=busy
  }
  const resize=window.ResizeObserver ? new window.ResizeObserver(()=>{if(!disposed)draw()}) : null
  function close(){window.removeEventListener('resize',draw);resize?.disconnect();const el=editor();el?.querySelector('[data-prts-region-stage]').style.removeProperty('cursor');if(el?.open)el.close();if(active)section.querySelector(`[data-prts-background-region-open="${active}"]`)?.focus();active=undefined;drag=undefined}
  function open(slot){
    if(busy)return
    close();const entry=state[slot];if(!entry?.width||!entry?.height)return
    active=slot;revision=state.revision;imageId=entry.id;draft=entry.region?{...entry.region}:defaultRegion()
    const el=editor();el.showModal();resize?.observe(el)
    if(slot==='sidebar'){const sidebar=section.ownerDocument.querySelector('[data-prts-region="sessions"]');if(sidebar)resize?.observe(sidebar)}
    window.addEventListener('resize',draw)
    el.querySelector('[data-prts-region-stage]').style.width=`min(100%, ${Math.min(640,360*entry.width/entry.height)}px)`
    el.querySelector('img').src=`/prts-theme-api/backgrounds/image/${entry.id}`
    el.querySelector('[data-prts-region-status]').textContent=''
    draw()
  }
  async function save(){
    if(busy||!active)return
    const el=editor(),slot=active,region=draft?{...draft}:null
    busy=true;draw();el.querySelector('[data-prts-region-status]').textContent='正在保存…'
    try{await store.saveRegion(slot,region,revision);if(!disposed){close();section.querySelector('[data-prts-background-status]').textContent='保护区域已保存，并同步到其他页面。';section.querySelector(`[data-prts-background-region-open="${slot}"]`).focus()}}
    catch(error){if(!disposed)el.querySelector('[data-prts-region-status]').textContent=error.message+' 请取消后重新打开编辑。'}
    finally{busy=false;if(!disposed)draw()}
  }
  const click=event=>{
    const openButton=event.target.closest('[data-prts-background-region-open]');if(openButton){open(openButton.dataset.prtsBackgroundRegionOpen);return}
    if(!active||busy)return
    if(event.target.closest('[data-prts-region-cancel]'))close()
    else if(event.target.closest('[data-prts-region-save]'))void save()
    else if(event.target.closest('[data-prts-region-create]')){draft=defaultRegion();draw();editor().querySelector('[data-prts-region-box]').focus()}
    else if(event.target.closest('[data-prts-region-clear]')){draft=null;draw()}
  }
  const down=event=>{
    const el=editor(),stage=event.target.closest('[data-prts-region-stage]')
    if(busy||!draft||!stage||!el?.contains(stage)||!event.target.closest('[data-prts-region-box]')||event.button!==0)return
    event.preventDefault();const bounds=stage.getBoundingClientRect();if(!bounds.width||!bounds.height)return
    const x=clamp((event.clientX-bounds.left)/bounds.width,0,1),y=clamp((event.clientY-bounds.top)/bounds.height,0,1)
    drag={x,y,bounds,initial:{...draft},corner:event.target.dataset.prtsRegionHandle,id:event.pointerId}
    stage.style.cursor=window.getComputedStyle(event.target).cursor
    stage.setPointerCapture?.(event.pointerId);draw()
  }
  function adjust(initial,dx,dy,corner){
    if(!corner)return {...initial,x:clamp(initial.x+dx,0,1-initial.width),y:clamp(initial.y+dy,0,1-initial.height)}
    let left=initial.x,top=initial.y,right=left+initial.width,bottom=top+initial.height
    if(corner.includes('w'))left=clamp(left+dx,0,right-.01);else if(corner.includes('e'))right=clamp(right+dx,left+.01,1)
    if(corner.includes('n'))top=clamp(top+dy,0,bottom-.01);else if(corner.includes('s'))bottom=clamp(bottom+dy,top+.01,1)
    return {x:left,y:top,width:/[ew]/.test(corner)?right-left:initial.width,height:/[ns]/.test(corner)?bottom-top:initial.height}
  }
  const move=event=>{if(!drag||event.pointerId!==drag.id)return;draft=adjust(drag.initial,(event.clientX-drag.bounds.left)/drag.bounds.width-drag.x,(event.clientY-drag.bounds.top)/drag.bounds.height-drag.y,drag.corner);draw()}
  const up=event=>{if(drag&&event.pointerId===drag.id){if(event.type==='pointercancel')draft=drag.initial;drag=undefined;editor()?.querySelector('[data-prts-region-stage]').style.removeProperty('cursor');draw()}}
  const key=event=>{
    if(!active||busy)return
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return}
    if(!draft||!event.target.closest('[data-prts-region-box]')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return
    event.preventDefault();const step=event.shiftKey ? .05 : .01
    draft=adjust(draft,event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0,event.target.dataset.prtsRegionHandle);draw()
  }
  const cancel=event=>{if(event.target.matches('[data-prts-region-editor]')){event.preventDefault();event.stopPropagation();if(!busy)close()}}
  section.addEventListener('cancel',cancel,true)
  const handlers={click,pointerdown:down,pointermove:move,pointerup:up,pointercancel:up,keydown:key}
  for(const [name,fn] of Object.entries(handlers))section.addEventListener(name,fn)
  return {update(value,mode){state=value;if(active&&(state[active]?.id!==imageId||mode==='off'||(mode==='full')!==(active==='full')))close()},dispose(){disposed=true;close();section.removeEventListener('cancel',cancel,true);for(const [name,fn] of Object.entries(handlers))section.removeEventListener(name,fn)}}
}
