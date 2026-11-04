// Keep the existing form values/events as the model; render interactive UI in
// the page so native popup windows never take ownership of the cursor.
export function mountPageControls({panel,window}){
  // Keep native controls usable in hosts without the popover API.
  if(!panel || !window || typeof window.HTMLElement.prototype.showPopover!=='function')return {dispose(){}}
  const document=panel.ownerDocument, cleanups=[]
  let active, tooltip, tipTarget, originalDescription, restoringFocus=false, sequence=0
  const hideTip=()=>{
    if(!tooltip)return
    tooltip.hidePopover();tooltip.remove();tooltip=undefined
    if(originalDescription===null)tipTarget.removeAttribute('aria-describedby')
    else tipTarget.setAttribute('aria-describedby',originalDescription)
    tipTarget=undefined
  }
  const showTip=(target,text,anchor=target)=>{
    hideTip()
    if(!text)return
    tooltip=document.createElement('div');tooltip.className='prts-page-tooltip'
    tooltip.setAttribute('popover','manual');tooltip.setAttribute('role','tooltip')
    tooltip.id='prts-control-tip-'+(++sequence);tooltip.textContent=text
    tipTarget=target;originalDescription=target.getAttribute('aria-describedby')
    target.setAttribute('aria-describedby',tooltip.id)
    const container=target.closest('dialog') || panel;container.append(tooltip);tooltip.showPopover()
    const rect=anchor.getBoundingClientRect(),size=tooltip.getBoundingClientRect()
    const right=anchor!==target && rect.right+size.width+8<=window.innerWidth-8
    tooltip.style.left=Math.max(8,Math.min(right?rect.right+8:rect.left,window.innerWidth-size.width-8))+'px'
    const top=right?rect.top:rect.bottom+size.height+14<=window.innerHeight?rect.bottom+6:rect.top-size.height-6
    tooltip.style.top=Math.max(8,Math.min(top,window.innerHeight-size.height-8))+'px'
  }
  const close=(focus=false)=>{
    hideTip()
    if(!active)return
    const {popup,button}=active;active=undefined
    popup.hidePopover();popup.remove();button.setAttribute('aria-expanded','false');button.removeAttribute('aria-controls')
    if(focus){
      restoringFocus=true
      try{button.focus({preventScroll:true})}finally{restoringFocus=false}
    }
  }
  const open=(button,role)=>{
    close()
    const popup=document.createElement('div')
    popup.className='prts-page-popup';popup.setAttribute('popover','manual')
    popup.setAttribute('role',role);popup.id='prts-page-popup-'+(++sequence)
    popup.setAttribute('aria-label',button.getAttribute('aria-label'))
    const container=button.closest('dialog') || panel
    container.append(popup)
    button.setAttribute('aria-controls',popup.id);button.setAttribute('aria-expanded','true')
    active={popup,button}
    popup.addEventListener('keydown',e=>{
      e.stopPropagation()
      if(e.key==='Escape'){e.preventDefault();close(true)}
      if(e.key==='Tab' && role==='listbox')close(true)
    })
    return popup
  }
  const present=(popup,button)=>{
    popup.showPopover()
    const rect=button.getBoundingClientRect()
    popup.style.minWidth=Math.min(260,Math.max(160,rect.width))+'px'
    const size=popup.getBoundingClientRect()
    popup.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-size.width-8))+'px'
    popup.style.top=Math.max(8,rect.bottom+size.height+6>window.innerHeight?rect.top-size.height-6:rect.bottom+6)+'px'
  }
  for(const control of panel.querySelectorAll('select,input[type="color"][data-prts-setting-color]')){
    // A label forwards both hover and activation to its first button, making
    // the entire settings row look clickable. These controls name themselves.
    const label=control.parentElement
    if(label.tagName==='LABEL'){
      const row=document.createElement('div')
      for(const {name,value} of label.attributes)row.setAttribute(name,value)
      row.setAttribute('data-prts-page-control-row','')
      row.append(...label.childNodes);label.replaceWith(row)
      cleanups.push(()=>{label.append(...row.childNodes);row.replaceWith(label)})
    }
    const isSelect=control.tagName==='SELECT'
    const button=document.createElement('button')
    button.type='button';button.className='prts-page-control'
    button.setAttribute('role',isSelect?'combobox':'button')
    button.setAttribute('aria-label',control.getAttribute('aria-label') || control.parentElement.firstChild?.textContent?.trim() || '选择')
    button.setAttribute('aria-haspopup',isSelect?'listbox':'dialog')
    button.setAttribute('aria-expanded','false')
    if(control.hasAttribute('aria-describedby'))button.setAttribute('aria-describedby',control.getAttribute('aria-describedby'))
    const caption=document.createElement('span');caption.className='prts-page-caption';button.append(caption)
    if(!isSelect && control.closest('[data-prts-session-flow-color-inputs]')){
      const row=control.parentElement, name=row.querySelector('span'), value=row.querySelector('output')
      const meta=document.createElement('span');meta.className='prts-page-color-meta'
      if(name)meta.append(name)
      if(value)meta.append(value)
      button.append(meta)
      cleanups.push(()=>{if(name)control.parentElement.prepend(name);if(value)control.parentElement.append(value)})
    }
    if(isSelect && Array.from(control.options).some(o=>o.dataset.description)){
      const describe=()=>{if(!restoringFocus && active?.button!==button)showTip(button,control.selectedOptions[0]?.dataset.description)}
      button.addEventListener('pointerenter',describe);button.addEventListener('focus',describe)
      button.addEventListener('pointerleave',hideTip);button.addEventListener('blur',hideTip)
      button.addEventListener('pointerdown',hideTip)
    }
    control.before(button)
    control.setAttribute('data-prts-native-model','');control.tabIndex=-1
    control.setAttribute('aria-hidden','true')
    const sync=()=>{
      button.disabled=control.disabled
      const text=isSelect?(control.selectedOptions[0]?.textContent || ''):''
      if(caption.textContent!==text){caption.textContent=text;if(tipTarget===button)showTip(button,control.selectedOptions[0]?.dataset.description)}
      if(!isSelect){button.classList.add('prts-page-color');button.style.setProperty('--sample',control.value);button.title=control.value.toUpperCase()}
    }
    // Host updates use .value assignments, which do not emit change events.
    const descriptor=Object.getOwnPropertyDescriptor(isSelect?window.HTMLSelectElement.prototype:window.HTMLInputElement.prototype,'value')
    Object.defineProperty(control,'value',{configurable:true,get(){return descriptor.get.call(this)},set(value){descriptor.set.call(this,value);sync()}})
    const observer=new window.MutationObserver(()=>{sync();if(control.disabled && active?.button===button)close()})
    observer.observe(control,{attributes:true,childList:true,subtree:true})
    control.addEventListener('change',sync)
    const commit=value=>{
      control.value=value
      control.dispatchEvent(new window.Event('input',{bubbles:true}))
      control.dispatchEvent(new window.Event('change',{bubbles:true}))
    }
    const show=()=>{
      if(active?.button===button){close(true);return}
      const popup=open(button,isSelect?'listbox':'dialog')
      if(isSelect){
        const options=Array.from(control.options)
        const choose=option=>{close(true);commit(option.value)}
        for(const option of options){
          const row=document.createElement('button');row.type='button';row.role='option'
          row.textContent=option.textContent;row.setAttribute('aria-label',option.textContent);row.disabled=option.disabled
          row.setAttribute('aria-selected',String(option.selected))
          if(option.dataset.description){
            const describe=()=>showTip(row,option.dataset.description,popup)
            row.addEventListener('pointerenter',describe);row.addEventListener('focus',describe)
            row.addEventListener('pointerleave',hideTip);row.addEventListener('blur',hideTip)
          }
          row.addEventListener('click',()=>choose(option));popup.append(row)
        }
        popup.addEventListener('keydown',e=>{
          const rows=Array.from(popup.querySelectorAll('button:not(:disabled)'))
          let index=rows.indexOf(document.activeElement)
          if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
            e.preventDefault()
            index=e.key==='Home'?0:e.key==='End'?rows.length-1:(index+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length
            rows[index]?.focus({preventScroll:true})
          }
        })
        present(popup,button)
        popup.querySelector('[aria-selected="true"]:not(:disabled)')?.focus({preventScroll:true})
      }else{
        popup.classList.add('prts-page-color-editor')
        popup.innerHTML='<strong>自定义颜色</strong><i class="prts-page-sample"></i><label>HEX<input aria-label="HEX 颜色" maxlength="7" spellcheck="false"></label>'+['R','G','B'].map((name,i)=>'<label>'+name+'<input type="range" min="0" max="255" aria-label="'+name+' 通道" data-channel="'+i+'"><output></output></label>').join('')+'<footer><button type="button" data-cancel>取消</button><button type="button" data-apply>应用颜色</button></footer>'
        let draft=control.value
        const hex=popup.querySelector('input:not([type])'),ranges=Array.from(popup.querySelectorAll('[type=range]'))
        const render=()=>{
          hex.value=draft.toUpperCase();hex.removeAttribute('aria-invalid')
          popup.querySelector('[data-apply]').disabled=false
          popup.querySelector('i').style.background=draft
          ranges.forEach((range,i)=>{range.value=parseInt(draft.slice(1+i*2,3+i*2),16);range.nextElementSibling.textContent=range.value})
        }
        hex.addEventListener('input',()=>{
          const valid=/^#?[0-9a-f]{6}$/i.test(hex.value)
          hex.setAttribute('aria-invalid',String(!valid));popup.querySelector('[data-apply]').disabled=!valid
          if(valid){draft='#'+hex.value.replace('#','');render()}
        })
        ranges.forEach(range=>range.addEventListener('input',()=>{draft='#'+ranges.map(r=>Number(r.value).toString(16).padStart(2,'0')).join('');render()}))
        popup.querySelector('[data-cancel]').onclick=()=>close(true)
        popup.querySelector('[data-apply]').onclick=()=>{close(true);commit(draft)}
        render();present(popup,button);hex.focus({preventScroll:true})
      }
    }
    button.addEventListener('click',e=>{e.preventDefault();show()})
    button.addEventListener('keydown',e=>{
      if(isSelect && ['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();if(active?.button!==button)show()}
    })
    sync()
    cleanups.push(()=>{observer.disconnect();control.removeEventListener('change',sync);delete control.value;button.remove();control.removeAttribute('data-prts-native-model');control.removeAttribute('aria-hidden');control.removeAttribute('tabindex')})
  }
  const outside=e=>{if(active&&!active.popup.contains(e.target)&&!active.button.contains(e.target))close()}
  const scroll=e=>{if(active && (e.target===document || e.target.contains?.(active.button)) && !active.popup.contains(e.target))close()}
  document.addEventListener('pointerdown',outside,true)
  document.addEventListener('focusin',outside,true)
  const dismiss=()=>close()
  window.addEventListener('resize',dismiss)
  document.addEventListener('scroll',scroll,true)
  panel.addEventListener('close',dismiss,true)
  return {dispose(){close();cleanups.forEach(fn=>fn());document.removeEventListener('pointerdown',outside,true);document.removeEventListener('focusin',outside,true);window.removeEventListener('resize',dismiss);document.removeEventListener('scroll',scroll,true);panel.removeEventListener('close',dismiss,true)}}
}
