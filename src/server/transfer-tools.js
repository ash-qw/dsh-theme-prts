import { randomUUID, createHash } from 'node:crypto'
import { createThemeTransfer, validateThemePackage, ignoredThemePackageFields, describeThemePackage, mergeThemePreferences, THEME_PACKAGE_LIMIT } from '../client/theme-transfer.js'
import { normalizePreferences } from '../client/preferences.js'
import { draftView, fault } from './emblems.js'

function sessionFiles(agent){
  if(!agent?.session)throw fault(400,'请在 DSH 会话中调用此工具')
  const refs=new Map()
  for(const event of agent.session.snapshotEvents()){
    const message=event.type==='user/message'?event.data:event.type==='tool/result'?event.data.message:null
    if(!message || message.isError)continue
    for(const part of message.content ?? []){
      if(part.type==='file' && typeof part.attachment?.attachmentId==='string')refs.set(part.attachment.attachmentId,part.attachment)
    }
  }
  return [...refs.values()]
}
export function transferTools({backgrounds,avatars,emblems,attachments,host,themeVersion}){
  const services={backgrounds,avatars,emblems},previews=new Map()
  let busy=false
  const settings=()=>{
    const service=host.get?.('settings'),ns=host.fiber?.entry?.options?.id
    const descriptor=service?.describe({redactSecrets:true}).find(value=>value.ns===ns)
    if(!descriptor)throw fault(400,'当前宿主无法读取主题配置')
    return {service,ns,...descriptor}
  }
  const revisions=assets=>({settings:settings().revision,...(assets?Object.fromEntries(Object.entries(services).map(([key,value])=>[key,value.snapshot().revision])):{})})
  const verify=expected=>{
    const current=revisions(Object.hasOwn(expected,'backgrounds'))
    if(Object.keys(expected).some(key=>current[key]!==expected[key]))throw fault(409,'主题或素材已变化，请重新预检导入文件')
  }
  const saveFile=async(value,label,signal)=>{
    signal?.throwIfAborted()
    const data=Buffer.from(JSON.stringify(value))
    if(data.length>THEME_PACKAGE_LIMIT)throw fault(400,'主题文件超过 160 MB')
    const name=`prts-${label}-${new Date().toISOString().replace(/[:.]/g,'-')}.prts-theme.json`
    const file=await attachments.saveFile({data,name})
    return file
  }
  const read=async(ref,signal)=>{
    if(ref.bytes>THEME_PACKAGE_LIMIT)throw fault(400,'主题文件超过 160 MB')
    let size=0;const chunks=[]
    for await(const chunk of attachments.readFileStream(ref,signal)){
      signal?.throwIfAborted();size+=chunk.length
      if(size>THEME_PACKAGE_LIMIT)throw fault(400,'主题文件超过 160 MB')
      chunks.push(chunk)
    }
    signal?.throwIfAborted()
    const data=Buffer.concat(chunks)
    let value
    try{value=JSON.parse(data.toString('utf8').replace(/^\uFEFF/,''))}catch{throw fault(400,'无法解析主题 JSON 文件')}
    validateThemePackage(value)
    return {value,hash:createHash('sha256').update(data).digest('hex')}
  }
  const bridge=(expected,onDownload)=>{
    const request=async(path,options={})=>{
      options.signal?.throwIfAborted()
      const route=path.replace('/prts-theme-api/','')
      const [kind,...parts]=route.split('/'),service=services[kind],tail=parts.join('/')
      if(!service)throw Error('未知素材服务')
      const data=options.body===undefined?undefined:JSON.parse(options.body)
      let value
      if(tail==='configuration'){
        if(data===undefined){
          value=service.snapshot()
          if(expected && expected[kind]!==undefined && expected[kind]!==value.revision)throw fault(409,'素材已变化，请重新预检')
        }else value=kind==='emblems'?await service.save(data.configuration,data.revision):await service.save(data)
      }else if(kind==='backgrounds' && tail.startsWith('image/')){
        return new Response(await backgrounds.image(parts[1]),{headers:{'content-type':'image/webp'}})
      }else if(kind==='avatars' && tail.startsWith('edit/'))value=avatars.edit(parts[1])
      else if(kind==='emblems' && tail==='import')value=draftView(await emblems.importAsset(data,options.signal))
      else if(kind==='emblems' && parts[0]==='draft' && parts[2]==='export')value=await emblems.exportAsset(decodeURIComponent(parts[1]))
      else throw Error('未知素材操作')
      return {ok:true,json:async()=>value}
    }
    return createThemeTransfer({
      window:{fetch:request,setTimeout,Blob},themeVersion,onDownload,
      readImage:async(blob,signal)=>{signal?.throwIfAborted();return Buffer.from(await blob.arrayBuffer()).toString('base64')},
      getPreferences:()=>normalizePreferences(settings().value),
      checkExport:()=>settings().revision,
      checkWritable:()=>{
        const state=settings()
        if(!state.service.writable)throw fault(400,'当前宿主无法持久化主题配置')
        if(expected)verify(expected)
        return state.revision
      },
      savePreferences:async(value,revision)=>{
        const state=settings()
        await state.service.update(state.ns,{...value,preferencesInitialized:true},revision)
      },
      backupNotice:'导入前备份已保存为附件，可重新导入恢复。',
    })
  }
  const exclusive=async fn=>{
    if(busy)throw fault(409,'正在处理主题文件，请稍候')
    busy=true
    try{return await fn()}finally{busy=false}
  }
  const prune=()=>{for(const [id,preview] of previews)if(preview.expires<Date.now())previews.delete(id)}
  const output={schema:{type:'object'},render:(_args,value)=>[
    {type:'text',text:JSON.stringify(value)},
    ...[value.file,value.backup].filter(ref=>ref && typeof ref==='object' && typeof ref.attachmentId==='string' && typeof ref.name==='string' && Number.isFinite(ref.bytes)).map(attachment=>({type:'file',attachment})),
  ]}
  return [{
    name:'prts_theme_export',
    description:'按用户要求导出当前 PRTS 主题为可下载的 .prts-theme.json 文件附件，和设置界面导出格式一致。includeAssets 默认为 true，含背景、保护区域、用户/AI 头像原图与裁剪、徽记原图及排列；false 仅导出设置。不会修改主题。不包含会话或凭据。最大 160 MB，素材或配置在导出期间变化会拒绝不一致结果。',
    parameters:{type:'object',additionalProperties:false,properties:{includeAssets:{type:'boolean'}}},output,isConcurrencySafe:()=>false,
    execute:(args,exec)=>exclusive(async()=>{
      sessionFiles(exec.agent)
      if(args.includeAssets!==undefined && typeof args.includeAssets!=='boolean')throw fault(400,'includeAssets 必须是布尔值')
      const value=await bridge().export(args.includeAssets!==false,undefined,exec.signal)
      const file=await saveFile(value,'theme',exec.signal)
      return {exported:true,summary:describeThemePackage(value),file}
    }),
  },{
    name:'prts_theme_import_preview',
    description:'只预检 PRTS 主题文件，不修改主题。未传 attachmentId 时列出当前会话上传或工具返回的 JSON 文件；指定后验证文件并返回 previewId、摘要、将忽略的字段和设置变化。支持本工具导出的文件，也支持上传或由会话文件工具返回的文件附件；不接受任意路径/URL。请向用户说明覆盖范围及 ignoredFields；得到导入授权后才调用 import。预检有效期 15 分钟，仅限当前会话，配置或素材变化后需重新预检。',
    parameters:{type:'object',additionalProperties:false,properties:{attachmentId:{type:'string'}}},output,isConcurrencySafe:()=>false,
    execute:(args,exec)=>exclusive(async()=>{
      const files=sessionFiles(exec.agent);exec.signal?.throwIfAborted();prune()
      if(!args.attachmentId)return {files:files.filter(ref=>/\.json$/i.test(ref.name || '') || /json/.test(ref.mediaType || ''))}
      const ref=files.find(file=>file.attachmentId===args.attachmentId)
      if(!ref)throw fault(404,'当前会话没有此文件，请先上传或通过会话工具返回文件附件')
      const {value,hash}=await read(ref,exec.signal),expected=revisions(Boolean(value.assets))
      const current=normalizePreferences(settings().value),next=mergeThemePreferences(current,value.preferences)
      const previewId=randomUUID(),expires=Date.now()+15*60*1000
      while(previews.size>=20)previews.delete(previews.keys().next().value)
      previews.set(previewId,{ref,hash,expected,session:exec.agent.session,expires})
      return {previewId,expiresAt:new Date(expires).toISOString(),summary:describeThemePackage(value),
        ignoredFields:ignoredThemePackageFields(value),
        changes:Object.entries(next).filter(([key,val])=>val!==current[key]).map(([key,after])=>({key,before:current[key],after})),
        scope:'设置影响当前 profile；完整文件中的素材替换影响同一 DSH 实例。仅配置文件保留现有素材。',
        backupNotice:'导入前会先保存备份附件；失败时尝试回退已确认写入的素材。',
        effects:value.assets?[
          '替换或移除背景会删除旧 WebP 文件；备份附件保留恢复所需数据。',
          '替换或移除头像不保留旧原图；备份附件包含原图和裁剪参数。',
          '每个自定义徽记会生成新的草稿和预览；相同原图按内容哈希复用。',
          '草稿达到约 200 份时，按创建时间清理较旧且未受保护的草稿；正在应用的徽记受保护。反复完整导入会增加草稿。',
        ]:['仅修改设置，保留当前素材。'],
      }
    }),
  },{
    name:'prts_theme_import',
    description:'用户授权后，使用当前会话的 previewId 导入已预检的主题文件。完整文件替换背景、头像、徽记及排列，空素材恢复默认；仅设置文件保留现有素材。替换/移除背景会删除旧 WebP，头像旧原图也不会保留。每个自定义徽记会新增草稿和预览，相同原图按内容哈希复用；草稿达到约 200 份时清理较旧且未受保护的草稿，正在应用的徽记受保护。导入前先保存备份附件，失败或取消时尝试回退素材。配置/素材版本变化、预检过期、文件内容变化会拒绝执行，需要重新预检。返回 applied=false 时必须报告错误和备份，不能宣称成功；部分回退失败时应核对实际状态。导入可能关闭 AI 工具或主题总开关，预检时应告知相应变化。',
    parameters:{type:'object',additionalProperties:false,properties:{previewId:{type:'string'}},required:['previewId']},output,isConcurrencySafe:()=>false,
    execute:(args,exec)=>exclusive(async()=>{
      sessionFiles(exec.agent);exec.signal?.throwIfAborted();prune()
      const preview=previews.get(args.previewId)
      if(!preview || preview.session!==exec.agent.session)throw fault(404,'预检不存在或已过期，请在当前会话重新预检')
      verify(preview.expected)
      const {value,hash}=await read(preview.ref,exec.signal)
      if(hash!==preview.hash)throw fault(409,'文件内容已变化，请重新预检')
      verify(preview.expected)
      previews.delete(args.previewId)
      let backup
      const transfer=bridge(preview.expected,async data=>{backup=await saveFile(data,'before-import',exec.signal)})
      try{
        await transfer.import(value,undefined,exec.signal)
        return {applied:true,summary:describeThemePackage(value),backup}
      }catch(error){
        if(!backup)throw error
        return {applied:false,error:error.message,backup}
      }
    }),
  }]
}
