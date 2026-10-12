import { draftView, stateView, fault } from './emblems.js'

export function sessionImages(agent) {
  if(!agent?.session)throw fault(400,'请在 DSH 会话中调用此工具')
  const images=new Map()
  for(const event of agent.session.snapshotEvents()) {
    if(event.type!=='user/message')continue
    for(const part of event.data.content ?? [])if(part.attachment && (part.type==='image' || part.type==='file' && /\.(png|jpe?g|webp)$/i.test(part.attachment.name || '')))images.set(part.attachment.attachmentId,{...part.attachment,attachmentKind:part.type})
  }
  return [...images.values()]
}
export function emblemTools(service,attachments) {
  const output={schema:{type:'object'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)},...(value.previewImage&&value.imageForModel?[{type:'image',attachment:value.previewImage}]:[])]}
  return [{
    name:'prts_emblem_inspect',
    description:'查看 PRTS 主题的新会话徽记、正文轮换列表、配置版本，以及当前会话已上传的图片。仅当用户要求查看或调整主题徽记时使用。徽记设置跨工作区和会话共享；工具不会修改设置。',
    parameters:{type:'object',properties:{},additionalProperties:false},output,isConcurrencySafe:()=>true,
    async execute(_args,exec){return JSON.parse(JSON.stringify({...stateView(service.snapshot()),images:sessionImages(exec.agent)}))}
  },{
    name:'prts_emblem_preview',
    description:'将当前会话上传的图片制作成 PRTS 粒子徽记草稿，或继续调整已有草稿。传 attachmentId（来自 inspect）或 draftId，二选一。调整已有正式徽记可使用 inspect 返回的 draftId。仅生成预览，不应用。优先原样使用返回的 previewMarkdown 展示给用户；没有此字段时，告知用户可展开工具卡片查看。不要将 previewUrl 当成本地图片路径。标准密度预览不是原图。用户满意后使用 apply。不要声称已看到预览，除非实际通过视觉工具查看。',
    parameters:{type:'object',additionalProperties:false,properties:{
      attachmentId:{type:'string'},draftId:{type:'string'},label:{type:'string',maxLength:100},
      params:{type:'object',additionalProperties:false,properties:{mode:{type:'string',enum:['auto','alpha','dark','light']},threshold:{type:'integer',minimum:1,maximum:254},zoom:{type:'number',minimum:.5,maximum:2},x:{type:'number',minimum:-.5,maximum:.5},y:{type:'number',minimum:-.5,maximum:.5}}},
    }},output,isConcurrencySafe:()=>false,
    async execute(args,exec){
      const images=sessionImages(exec.agent)
      if(Boolean(args.attachmentId)===Boolean(args.draftId))throw fault(400,'请选择一张会话图片或一个已有草稿')
      let bytes,label=args.label
      if(args.attachmentId) {
        const ref=images.find(e=>e.attachmentId===args.attachmentId)
        if(!ref)throw fault(404,'当前会话没有这张图片，请先上传图片或重新读取图片列表')
        if(ref.bytes>8*1024*1024)throw fault(400,'图片超过 8 MB')
        const {attachmentKind,...attachment}=ref
        if(attachmentKind==='file') {
          const chunks=[];let total=0
          for await(const chunk of attachments.readFileStream(attachment,exec.signal)) {
            total+=chunk.length;if(total>8*1024*1024)throw fault(400,'图片超过 8 MB');chunks.push(chunk)
          }
          bytes=Buffer.concat(chunks)
        } else bytes=(await attachments.readImage(attachment,exec.signal)).data
        label ||= ref.name
      }
      const d=await service.preview({bytes,baseId:args.draftId,params:args.params,label},exec.signal)
      const hostPath=service.previewPath(d.id)
      const fs=exec.agent.ctx?.get?.('fs')
      const previewPath=fs?.processPathFromHostPath(hostPath)
      let previewImage, imageForModel=false
      const llm=exec.agent.ctx?.get?.('llm')
      const routed=exec.agent.session.requestHeader?.()?.config
      const provider=routed?.provider ?? exec.agent.options?.provider, model=routed?.model ?? exec.agent.options?.model
      if(llm && provider && model) {
        const info=await llm.resolveModelInfo(provider,model,exec.signal)
        imageForModel=info.inputModalities?.includes('image') === true
      }
      if(imageForModel)previewImage=await attachments.saveImage({data:await service.image(d.id),mediaType:'image/png',name:`prts-preview-${d.id}.png`})
      return JSON.parse(JSON.stringify({...draftView(d),applied:false,revision:service.snapshot().revision,
        ...(previewPath?{previewPath,previewMarkdown:`![粒子徽记预览](<${previewPath}>)`}:{}),
        imageForModel,...(previewImage?{previewImage}:{})}))
    },
  },{
    name:'prts_emblem_apply',
    description:'按用户要求应用 PRTS 粒子徽记草稿。hero 替换新会话徽记；add 添加正文轮换徽记；replace 替换 entryKey 对应的正文徽记。先 inspect 取得 revision；版本冲突时重新读取并核对，不能盲目重试覆盖。只有用户明确要求应用时才调用，讨论或预览不等于应用。',
    parameters:{type:'object',additionalProperties:false,properties:{draftId:{type:'string'},target:{type:'string',enum:['hero','add','replace']},entryKey:{type:'string'},revision:{type:'integer',minimum:0}},required:['draftId','target','revision']},output,isConcurrencySafe:()=>false,
    async execute(args,exec){sessionImages(exec.agent);return {applied:true,...stateView(await service.apply(args,exec.signal))}},
  }]
}
