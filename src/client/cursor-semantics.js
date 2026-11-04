// Preserve the host's cursor cascade as metadata while the experimental
// renderer suppresses the browser cursor. No hide/read/show cycle per move.
export function createCursorSemantics({document, window, onChange = () => {}}) {
  const property='--prts-source-cursor'
  const sheet=document.createElement('style')
  sheet.dataset.prtsCursorSemantics=''
  const inline=new Map()
  let pending, disposed=false
  function serialize(rules) {
    let result=''
    for(const rule of rules){
      if(rule.selectorText?.includes('data-prts-follower-visible'))continue
      const value=rule.style?.getPropertyValue('cursor')
      const own=value?`${property}:${value}${rule.style.getPropertyPriority('cursor')?' !important':''};`:''
      const children=rule.cssRules?serialize(rule.cssRules):''
      if(!own&&!children)continue
      if(rule.selectorText)result+=`${rule.selectorText}{${own}${children}}`
      else if(rule.conditionText || /^@(media|supports|layer|container|scope)\b/.test(rule.cssText))result+=`${rule.cssText.slice(0,rule.cssText.indexOf('{'))}{${children}}`
    }
    return result
  }
  function rebuild(){
    pending=undefined
    if(disposed)return
    let text=''
    for(const source of document.styleSheets){
      if(source.ownerNode===sheet || source.disabled)continue
      try{
        const rules=serialize(source.cssRules)
        const media=source.media?.mediaText
        text+=media?`@media ${media}{${rules}}`:rules
      }catch{ /* Cross-origin sheets are not readable; semantic fallbacks remain. */ }
    }
    if(sheet.textContent!==text){sheet.textContent=text;onChange()}
  }
  function schedule(){if(!disposed && pending===undefined)pending=window.requestAnimationFrame(rebuild)}
  function loaded(event){if(event.target?.matches?.('link[rel~="stylesheet"]'))schedule()}
  const observer=new window.MutationObserver(records=>{
    if(records.some(r=>r.target!==sheet && !sheet.contains(r.target)))schedule()
  })
  document.head.append(sheet)
  rebuild()
  observer.observe(document.head,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','media','href']})
  document.addEventListener('load',loaded,true)
  function restore(el,record){
    if(el.style.getPropertyValue(property)===record.applied){
      if(record.original)el.style.setProperty(property,record.original,record.priority)
      else el.style.removeProperty(property)
    }
    if(record.masked && el.style.cursor==='none' && el.style.getPropertyPriority('cursor')==='important')el.style.setProperty('cursor',record.source,'important')
  }
  function read(target){
    // Inline cursor updates (e.g. a body-wide resize gesture) outrank stylesheet
    // rules. Mirror only the hit ancestry, without scanning the subtree.
    const ancestry=new Set()
    for(let el=target;el;el=el.parentElement){
      ancestry.add(el)
      let value=el.style.getPropertyValue('cursor'),priority=el.style.getPropertyPriority('cursor')
      const old=inline.get(el)
      if(old?.masked && value==='none' && priority==='important')value=old.source
      if(!value){if(old){restore(el,old);inline.delete(el)}continue}
      if(old && old.source===value && old.sourcePriority===priority)continue
      if(old)restore(el,old)
      const record={original:el.style.getPropertyValue(property),priority:el.style.getPropertyPriority(property),source:value,sourcePriority:priority,applied:value,masked:priority==='important'}
      el.style.setProperty(property,value,priority)
      if(record.masked)el.style.setProperty('cursor','none','important')
      inline.set(el,record)
    }
    for(const [el,record]of inline)if(!ancestry.has(el)){restore(el,record);inline.delete(el)}
    return window.getComputedStyle(target).getPropertyValue(property).trim()
  }
  function release(){for(const [el,record]of inline)restore(el,record);inline.clear()}
  return {read,release,dispose(){disposed=true;observer.disconnect();document.removeEventListener('load',loaded,true);if(pending!==undefined)window.cancelAnimationFrame(pending);release();sheet.remove()}}
}
