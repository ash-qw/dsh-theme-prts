import { backgroundPlacement } from '../shared/background-region.js'

export function createBackgroundLayout({window,document}) {
  const root=document.documentElement
  const raf=window.requestAnimationFrame?.bind(window) ?? (fn=>window.setTimeout(fn,16))
  const caf=window.cancelAnimationFrame?.bind(window) ?? window.clearTimeout.bind(window)
  let state={}, frame, disposed=false, enabled=false, observing=false, operation, sessions
  const set=(name,value)=>{if(root.style.getPropertyValue(name)!==value) root.style.setProperty(name,value)}
  const update=()=>{
    frame=undefined
    if(disposed||!observing)return
    const nextOperation=document.querySelector('[data-prts-region="operation"]')
    const nextSessions=document.querySelector('[data-prts-region="sessions"]')
    if(operation!==nextOperation || sessions!==nextSessions){
      resize?.disconnect(); operation=nextOperation;sessions=nextSessions
      for(const node of [operation,sessions])if(node)resize?.observe(node)
    }
    const railWidth=parseFloat(window.getComputedStyle(root).getPropertyValue('--prts-nav-width'))||0
    for(const slot of ['full','conversation','sidebar']){
      const entry=state[slot]
      const node=slot==='sidebar'?sessions:operation
      const width=slot==='full'?window.innerWidth:(node?.clientWidth||0)+(slot==='sidebar'?railWidth:0)
      const height=slot==='full'?window.innerHeight:node?.clientHeight||0
      const active=entry?.region && width>0 && height>0
      if(active){
        const p=backgroundPlacement(entry.width,entry.height,width,height,entry.region)
        set(`--prts-protected-${slot}-x`,`${p.x}px`)
        set(`--prts-protected-${slot}-y`,`${p.y}px`)
        if(slot==='sidebar')set('--prts-protected-sidebar-width',`${p.width}px`)
      }else{
        root.style.removeProperty(`--prts-protected-${slot}-x`)
        root.style.removeProperty(`--prts-protected-${slot}-y`)
        if(slot==='sidebar')root.style.removeProperty('--prts-protected-sidebar-width')
      }
    }
  }
  function schedule(){if(!disposed && observing && frame===undefined)frame=raf(update)}
  // ResizeObserver runs after layout, before paint. Deferring again to rAF
  // paints the new container with the previous image bounds for one frame.
  const resize=window.ResizeObserver?new window.ResizeObserver(()=>{
    if(frame!==undefined)caf(frame)
    update()
  }):null
  const mutations=new window.MutationObserver(()=>{
    if(!operation?.isConnected || !sessions?.isConnected)schedule()
  })
  const attributes=new window.MutationObserver(schedule)
  function clear(){
    caf(frame);frame=undefined;resize?.disconnect();mutations.disconnect();attributes.disconnect();window.removeEventListener('resize',schedule)
    operation=undefined;sessions=undefined;observing=false
    for(const slot of ['full','conversation','sidebar'])for(const axis of ['x','y','width'])root.style.removeProperty(`--prts-protected-${slot}-${axis}`)
  }
  function reconcile(){
    if(disposed || !enabled || !['full','conversation','sidebar'].some(slot=>state[slot]?.region)){clear();return}
    if(!observing){
      observing=true
      mutations.observe(document.body||root,{childList:true,subtree:true})
      attributes.observe(root,{attributes:true,attributeFilter:['data-prts-background-mode','data-prts-rail-mode']})
      window.addEventListener('resize',schedule)
    }
    schedule()
  }
  return {update(value){state=value;reconcile()},setEnabled(value){enabled=value;reconcile()},dispose(){disposed=true;clear()}}
}
