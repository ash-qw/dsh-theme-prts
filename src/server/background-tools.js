import { backgroundPreviewTool, readBackgroundAttachment } from './background-preview.js'
import { sessionImages } from './tools.js'
import { fault } from './emblems.js'
import { validBackgroundRegion } from '../shared/background-region.js'
import { normalizePreferences } from '../client/preferences.js'

const slots=['full','sidebar','conversation']
const materialTargets=['sidebar','rightSidebar','rail','baker','classicUser']
const materialSchema={type:'object',additionalProperties:false,properties:Object.fromEntries(
  [['blur',32],['opacity',1]].map(([kind,max])=>[kind,{type:'object',additionalProperties:false,
    properties:Object.fromEntries(materialTargets.map(target=>[target,{type:kind==='blur'?'integer':'number',minimum:0,maximum:max}]))}]))}
function materialView(value){
  return Object.fromEntries(['blur','opacity'].map(kind=>[kind,Object.fromEntries(
    materialTargets.map(target=>[target,value[target+(kind==='blur'?'Blur':'Opacity')]]))]))
}
function materialPatch(material){
  const patch={}
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)
  if(!object(material))throw fault(400,'material 必须是对象')
  for(const [kind,values] of Object.entries(material)){
    if(!['blur','opacity'].includes(kind)||!object(values))throw fault(400,'material 仅支持 blur 和 opacity 对象')
    for(const [target,value] of Object.entries(values)){
      if(!materialTargets.includes(target))throw fault(400,'未知材质区域：'+target)
      const max=kind==='blur'?32:1
      if(!Number.isFinite(value)||value<0||value>max||(kind==='blur'&&!Number.isInteger(value)))
        throw fault(400,kind==='blur'?'blur 必须是 0..32 的整数（px）':'opacity 必须在 0..1')
      patch[target+(kind==='blur'?'Blur':'Opacity')]=value
    }
  }
  return patch
}
const revision={type:'integer',minimum:0}
const region={anyOf:[{type:'null'},{type:'object',additionalProperties:false,properties:{
  x:{type:'number',minimum:0,maximum:1},y:{type:'number',minimum:0,maximum:1},
  width:{type:'number',exclusiveMinimum:0,maximum:1},height:{type:'number',exclusiveMinimum:0,maximum:1},
},required:['x','y','width','height']}]}
function checkRevision(value){if(!Number.isInteger(value)||value<0)throw fault(400,'请先 inspect 获取配置版本')}
export function backgroundTools(service,attachments,host){
  const readSettings=()=>{
    const settings=host?.get?.('settings'),ns=host?.fiber?.entry?.options?.id
    const descriptor=ns && settings?.describe({redactSecrets:true}).find(item=>item.ns===ns)
    if(!descriptor)return {available:false,writable:false}
    const value=normalizePreferences(descriptor.value)
    return {available:true,writable:settings.writable===true,revision:descriptor.revision,
      enabled:value.enabled,mode:value.backgroundMode,dim:value.backgroundDim,material:materialView(value),conversationStyle:value.conversationStyle}
  }
  const view=()=>{
    const state=service.snapshot(),settings=readSettings()
    return {...state,settings,activeSlots:settings.enabled
      ? settings.mode==='full'?['full'].filter(slot=>state[slot])
      :settings.mode==='split'?['sidebar','conversation'].filter(slot=>state[slot]):[]:[]}
  }
  const output={schema:{type:'object'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]}
  return [backgroundPreviewTool(service,attachments,readSettings),{
    name:'prts_background_inspect',
    description:'查看 PRTS 背景图片尺寸、保护区域、图片 revision，以及当前 profile 的模式、遮罩 dim、五个区域的 material（blur/opacity）、conversationStyle、settings.revision 和启用状态；列出当前会话上传或工具返回的图片，不修改设置。支持用户图片和 AI 生成、编辑、搜索下载的图片：若生成/搜索工具未直接返回图片附件，先用该会话已有工具保存图片到工作区，再 read_image 读取，然后 inspect 获取 attachmentId。列表按最近出现排序，lastSeenOrder 是会话出现顺序，latestForName 标记同名图片最近出现的版本，并非文件修改时间。需要评估视觉效果时调用 prts_background_preview。本工具不生成、搜索或下载图片，不接受 URL 或任意本地路径。',
    parameters:{type:'object',properties:{},additionalProperties:false},output,isConcurrencySafe:()=>true,
    async execute(_args,exec){return {...view(),images:sessionImages(exec.agent)}},
  },{
    name:'prts_background_apply',
    description:'按用户要求设置背景素材。slot=full 完整背景、sidebar 左侧边栏、conversation 会话正文。action=replace 使用 inspect 返回的当前会话 attachmentId；protect 调整已有图片的保护区域；remove 删除该区域图片。region 为按 EXIF 转正后图片的归一化矩形 x/y/width/height，范围 0..1；null 清除保护框；替换时未指定会清除旧框。保护框只指导铺满裁剪，不能保证所有窗口完整容纳。先 inspect 获取图片 revision，冲突时重新读取，勿盲目覆盖。支持上传及 AI 工具返回的图片；生成图或下载图先 read_image 再 inspect。支持 PNG/JPEG/WebP/AVIF，最大 10 MB、4000 万像素，保存为最长 3840×2160 范围内的 WebP。修改素材影响同一 DSH 实例，替换/移除不保留旧原图。本工具不切换模式；保存后检查 activeSlots，必要时用 configure 启用对应模式。主题总开关不会自动打开。',
    parameters:{type:'object',additionalProperties:false,properties:{
      slot:{type:'string',enum:slots},action:{type:'string',enum:['replace','protect','remove']},
      attachmentId:{type:'string'},region,revision,
    },required:['slot','action','revision']},output,isConcurrencySafe:()=>false,
    async execute(args,exec){
      const images=sessionImages(exec.agent)
      exec.signal?.throwIfAborted()
      checkRevision(args.revision)
      if(!slots.includes(args.slot)||!['replace','protect','remove'].includes(args.action))throw fault(400,'背景区域或操作无效')
      if(args.revision!==service.snapshot().revision)throw fault(409,'背景已更新，请重新 inspect')
      if(args.action!=='replace'&&args.attachmentId!==undefined)throw fault(400,'仅替换图片可以指定 attachmentId')
      if(Object.hasOwn(args,'region')&&!validBackgroundRegion(args.region))throw fault(400,'背景保护区域无效')
      const data={slot:args.slot,revision:args.revision}
      if(args.action==='protect'){
        if(!Object.hasOwn(args,'region'))throw fault(400,'请指定保护区域或 null')
        data.region=args.region
      }else if(args.action==='remove'){
        if(Object.hasOwn(args,'region'))throw fault(400,'移除图片不需要保护区域')
        data.image=null
      }else{
        const bytes=await readBackgroundAttachment(attachments,images,args.attachmentId,exec)
        data.image=bytes.toString('base64')
        if(Object.hasOwn(args,'region'))data.region=args.region
      }
      exec.signal?.throwIfAborted()
      await service.save(data,exec.signal)
      return {applied:true,...view(),previewHint:'可调用 prts_background_preview 查看当前遮罩下的日夜背景合成图；该预览不包含材质模糊和底色不透明度效果。'}
    },
  },{
    name:'prts_background_configure',
    description:'按用户要求修改当前 profile 的背景模式、遮罩和材质。material.blur 为 0..32 整数像素；material.opacity 为 0..1 底色不透明度，越高越不透明（与界面的透明度方向相反）。区域 sidebar=左侧边栏、rightSidebar=右侧边栏、rail=设置侧栏、baker=Baker 气泡、classicUser=经典用户消息。Baker 气泡仅在 deck-chat 风格、经典用户消息仅在 native 风格生效，且需要启用完整背景图片或分区正文图片；其它区域遵循当前背景模式的材质样式。配置可提前保存，不自动切换会话风格或启用图片。mode=off 默认背景（保留素材）、split 分区背景、full 完整背景；dim=0..0.9，越高越接近主题底色，图片越淡。先 inspect 获取 settings.revision，作为本工具 revision；不要使用图片 revision。只修改传入字段，冲突时重新读取，不能盲目重试。模式和遮罩同步到同一 profile 在线页面，素材在实例内共享。工具不修改主题总开关；enabled=false 时应告知用户需要启用主题。',
    parameters:{type:'object',additionalProperties:false,properties:{
      revision,mode:{type:'string',enum:['off','split','full']},dim:{type:'number',minimum:0,maximum:.9},material:materialSchema,
    },required:['revision']},output,isConcurrencySafe:()=>false,
    async execute(args,exec){
      sessionImages(exec.agent);exec.signal?.throwIfAborted();checkRevision(args.revision)
      const patch=args.material===undefined?{}:materialPatch(args.material)
      if(args.mode!==undefined){if(!['off','split','full'].includes(args.mode))throw fault(400,'背景模式无效');patch.backgroundMode=args.mode}
      if(args.dim!==undefined){if(!Number.isFinite(args.dim)||args.dim<0||args.dim>.9)throw fault(400,'遮罩 dim 必须在 0..0.9');patch.backgroundDim=args.dim}
      if(!Object.keys(patch).length)throw fault(400,'请指定背景模式、遮罩或至少一项材质参数')
      const current=readSettings()
      if(!current.writable)throw fault(400,'当前宿主不支持持久化主题设置，请在设置界面调整背景和材质')
      if(current.revision!==args.revision)throw fault(409,'主题设置已更新，请重新 inspect')
      await host.get('settings').update(host.fiber.entry.options.id,{...patch,preferencesInitialized:true},args.revision)
      return {applied:true,...view(),previewHint:'可调用 prts_background_preview 查看当前遮罩下的日夜背景合成图；该预览不包含材质模糊和底色不透明度效果。'}
    },
  }]
}
