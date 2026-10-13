import { mountAvatarCrop } from './avatar-crop.js'
const API='/prts-theme-api/avatars'
const roles=['user','assistant']
export function createAvatarStore({window,document}){
  let state={revision:-1,user:null,assistant:null},disposed=false,events,refreshing
  const listeners=new Set()
  const controller=window.AbortController?new window.AbortController():null
  const apply=value=>{
    if(disposed||value.revision<state.revision)return
    state=value
    for(const role of roles){
      const image=state[role]
      const safe=typeof image==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(image)
      const property=`--prts-custom-${role}-avatar`
      if(safe)document.documentElement.style.setProperty(property,`url("${image}")`)
      else document.documentElement.style.removeProperty(property)
    }
    document.documentElement.style.setProperty('--prts-user-avatar-label',state.user?'""':'"我"')
    for(const fn of listeners)fn(state)
  }
  const request=async(data)=>{
    const response=await window.fetch(API+'/configuration',{credentials:'same-origin',signal:controller?.signal,
      ...(data===undefined?{}:{method:'POST',headers:{'content-type':'application/json','x-prts-request':'1'},body:JSON.stringify(data)})})
    const value=await response.json()
    if(!response.ok)throw Error(value.error||'头像服务暂不可用')
    apply(value);return state
  }
  const refresh=()=>refreshing??(refreshing=request().finally(()=>{refreshing=null}))
  if(window.fetch){
    void refresh().catch(()=>{}).then(()=>{
      if(disposed||!window.EventSource)return
      events=new window.EventSource(API+'/events')
      events.onmessage=event=>{
        try{
          const revision=JSON.parse(event.data).revision
          if(revision>state.revision)void refresh().then(()=>{
            if(!disposed&&revision>state.revision)return refresh()
          }).catch(()=>{})
        }catch{}
      }
    })
  }
  const focus=()=>{if(window.fetch)void refresh().catch(()=>{})}
  window.addEventListener('focus',focus)
  return{
    snapshot:()=>state,refresh,
    subscribe(fn){listeners.add(fn);fn(state);return()=>listeners.delete(fn)},
    async edit(role){
      const response=await window.fetch(API+'/edit/'+role,{credentials:'same-origin',signal:controller?.signal})
      const value=await response.json()
      if(!response.ok)throw Error(value.error||'无法读取头像')
      return value
    },
    async save(role,image,crop,revision=state.revision){
      try{return await request({role,image,crop,revision})}
      catch(error){await refresh().catch(()=>{});throw error}
    },
    dispose(){
      disposed=true;controller?.abort();events?.close();listeners.clear();window.removeEventListener('focus',focus)
      for(const role of roles)document.documentElement.style.removeProperty(`--prts-custom-${role}-avatar`)
      document.documentElement.style.removeProperty('--prts-user-avatar-label')
    },
  }
}

export function avatarMarkup(){
  return `<section data-prts-avatars hidden>
    <header><strong>Baker 头像</strong><small>点击头像调整图片与裁剪范围，所有会话共用。</small></header>
    <div data-prts-avatar-choices>${roles.map(role=>`<div data-prts-avatar-row="${role}">
      <button type="button" data-prts-avatar-preview="${role}" aria-label="设置${role==='user'?'用户':'AI'}头像"></button>
      <span><strong>${role==='user'?'用户头像':'AI 头像'}</strong><small>点击编辑</small></span>
    </div>`).join('')}</div>
    <p data-prts-avatar-status role="status">保存在当前 DSH 实例，自动同步至其他设备。</p>
  </section>`
}
export function mountAvatarSettings({panel,window,store}){
  const section=panel.querySelector('[data-prts-avatars]')
  if(!section||!store)return{dispose(){}}
  const status=section.querySelector('[data-prts-avatar-status]')
  let disposed=false
  const cropEditor=mountAvatarCrop({panel,window,load:role=>store.edit(role),onSave:async(role,image,crop,revision)=>{
    await store.save(role,image,crop,revision)
    if(!disposed)status.textContent='头像已保存，已应用到所有会话'
  }})
  const click=event=>{
    const button=event.target.closest('[data-prts-avatar-preview]')
    if(button)void cropEditor.open(button.dataset.prtsAvatarPreview)
  }
  section.addEventListener('click',click)
  return{close:()=>cropEditor.close(),dispose(){disposed=true;cropEditor.dispose();section.removeEventListener('click',click)}}
}
