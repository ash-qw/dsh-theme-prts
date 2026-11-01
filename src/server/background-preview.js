import sharp from 'sharp'
import { sessionImages } from './tools.js'
import { fault } from './emblems.js'
import { prepareBackgroundImage } from './backgrounds.js'
import { backgroundPlacement, validBackgroundRegion } from '../shared/background-region.js'

// Keep these paired with the root light/dark canvas tokens in prts.css.
export const BACKGROUND_CANVAS={dark:'#080a0c',light:'#eef1f3'}
export async function readBackgroundAttachment(attachments,images,id,exec){
  const ref=images.find(image=>image.attachmentId===id),limit=10*1024*1024
  if(!ref)throw fault(404,'当前会话没有这张图片，请先上传或 read_image 读取生成/下载的图片，再 inspect')
  if(ref.bytes>limit)throw fault(400,'图片超过 10 MB')
  const {attachmentKind,origin,toolName,lastSeenOrder,lastSeenAt,latestForName,...attachment}=ref
  let bytes
  if(attachmentKind==='file'){
    const chunks=[];let size=0
    for await(const chunk of attachments.readFileStream(attachment,exec.signal)){
      exec.signal?.throwIfAborted()
      size+=chunk.length;if(size>limit)throw fault(400,'图片超过 10 MB');chunks.push(chunk)
    }
    bytes=Buffer.concat(chunks)
  }else bytes=(await attachments.readImage(attachment,exec.signal)).data
  exec.signal?.throwIfAborted()
  if(bytes.length>limit)throw fault(400,'图片超过 10 MB')
  return Buffer.from(bytes)
}
export async function renderBackgroundPreview(bytes,{width,height,scheme,dim,region}){
  const metadata=await sharp(bytes).metadata(),sw=metadata.width,sh=metadata.height
  const placement=backgroundPlacement(sw,sh,width,height,region)
  const scale=placement.width/sw
  // Crop before resizing to bound memory even for extremely wide/tall images.
  const left=Math.max(0,Math.min(sw-1,Math.round(-placement.x/scale)))
  const top=Math.max(0,Math.min(sh-1,Math.round(-placement.y/scale)))
  const crop={left,top,width:Math.max(1,Math.min(sw-left,Math.round(width/scale))),height:Math.max(1,Math.min(sh-top,Math.round(height/scale)))}
  const canvas=BACKGROUND_CANVAS[scheme]
  const image=await sharp(bytes).extract(crop).resize(width,height,{fit:'fill'}).flatten({background:canvas}).toColourspace('srgb').png().toBuffer()
  // Match CSS color-mix(in srgb); do not blend in linear-light space.
  const rgb={r:parseInt(canvas.slice(1,3),16),g:parseInt(canvas.slice(3,5),16),b:parseInt(canvas.slice(5,7),16),alpha:dim}
  const overlay=await sharp({create:{width,height,channels:4,background:rgb}}).png().toBuffer()
  return {data:await sharp(image).composite([{input:overlay,blend:'over'}]).png().toBuffer(),clipped:placement.clipped,crop,canvas}
}
export function backgroundPreviewTool(service,attachments,readSettings){
  return {
    name:'prts_background_preview',
    description:'预览 PRTS 背景的裁剪与遮罩合成，不应用、不修改主题。指定 slot 预览已保存背景，或 attachmentId 预览会话候选图片（二选一）；候选图先按实际保存规则转正、缩放并转 WebP。dim 默认使用当前背景遮罩，可临时覆盖；scheme 默认为 both，同时生成日间/夜间图，因为服务端不能判断用户页面当前日夜模式。可指定预览宽高和归一化保护区域，默认使用已保存图片的保护区域。返回预览附件、尺寸、底色、遮罩、裁剪信息；这是背景层预览，不含消息泡、文字、侧栏毛玻璃等界面材质，不是实际页面截图。必须查看预览才能评价视觉效果；预览图不能再作为原始背景素材。修改 dim 后可再次预览。',
    parameters:{type:'object',additionalProperties:false,properties:{
      slot:{type:'string',enum:['full','sidebar','conversation']},attachmentId:{type:'string'},
      dim:{type:'number',minimum:0,maximum:.9},scheme:{type:'string',enum:['dark','light','both']},
      width:{type:'integer',minimum:64,maximum:1920},height:{type:'integer',minimum:64,maximum:1920},
      region:{anyOf:[{type:'null'},{type:'object',additionalProperties:false,properties:{
        x:{type:'number',minimum:0,maximum:1},y:{type:'number',minimum:0,maximum:1},
        width:{type:'number',exclusiveMinimum:0,maximum:1},height:{type:'number',exclusiveMinimum:0,maximum:1},
      },required:['x','y','width','height']}]},
    }},
    output:{schema:{type:'object'},render:(_args,value)=>[
      {type:'text',text:JSON.stringify(value)},
      ...value.previews.flatMap(p=>[{type:'file',attachment:p.file},...(value.imageForModel?[{type:'image',attachment:p.image}]:[])]),
    ]},
    isConcurrencySafe:()=>false,
    async execute(args,exec){
      exec.signal?.throwIfAborted()
      const images=sessionImages(exec.agent)
      if(Boolean(args.slot)===Boolean(args.attachmentId))throw fault(400,'请选择已保存背景 slot 或候选 attachmentId，二选一')
      if(args.slot && !['full','sidebar','conversation'].includes(args.slot))throw fault(400,'背景区域无效')
      const configuration=service.snapshot(),settings=readSettings()
      const scheme=args.scheme ?? 'both',dim=args.dim ?? settings.dim
      const width=args.width ?? (args.slot==='sidebar'?360:1280),height=args.height ?? (args.slot==='sidebar'?900:720)
      if(!['dark','light','both'].includes(scheme)||!Number.isFinite(dim)||dim<0||dim>.9)throw fault(400,'请指定有效日夜模式和 0..0.9 遮罩；设置不可读时须显式指定 dim')
      if(![width,height].every(v=>Number.isInteger(v)&&v>=64&&v<=1920))throw fault(400,'预览宽高须为 64..1920 的整数')
      const region=Object.hasOwn(args,'region')?args.region:args.slot?configuration[args.slot]?.region ?? null:null
      if(!validBackgroundRegion(region))throw fault(400,'背景保护区域无效')
      let bytes
      if(args.slot){
        const entry=configuration[args.slot]
        if(!entry)throw fault(400,'此区域尚未设置图片')
        bytes=await service.image(entry.id)
      }else bytes=(await prepareBackgroundImage(await readBackgroundAttachment(attachments,images,args.attachmentId,exec))).data
      let imageForModel=false
      const llm=exec.agent.ctx?.get?.('llm'),routed=exec.agent.session.requestHeader?.()?.config
      const provider=routed?.provider ?? exec.agent.options?.provider,model=routed?.model ?? exec.agent.options?.model
      if(llm && provider && model)imageForModel=(await llm.resolveModelInfo(provider,model,exec.signal)).inputModalities?.includes('image')===true
      const previews=[]
      for(const mode of scheme==='both'?['dark','light']:[scheme]){
        exec.signal?.throwIfAborted()
        const {data,...details}=await renderBackgroundPreview(bytes,{width,height,scheme:mode,dim,region})
        exec.signal?.throwIfAborted()
        const name=`prts-background-preview-${mode}.png`,file=await attachments.saveFile({data,name})
        const image=imageForModel?await attachments.saveImage({data,mediaType:'image/png',name}):undefined
        const hostPath=attachments.fileHostPath?.(file),fs=exec.agent.ctx?.get?.('fs')
        const previewPath=hostPath?fs?.processPathFromHostPath(hostPath):undefined
        previews.push({scheme:mode,width,height,dim,region,...details,file,...(image?{image}:{}),
          ...(previewPath?{previewPath,previewMarkdown:`![${mode==='dark'?'夜间':'日间'}背景预览](<${previewPath}>)`}:{})})
      }
      exec.signal?.throwIfAborted()
      if(args.slot && service.snapshot().revision!==configuration.revision || args.dim===undefined && readSettings().revision!==settings.revision)throw fault(409,'背景或遮罩已变化，请重新预览')
      return {applied:false,imageForModel,revision:configuration.revision,settingsRevision:settings.revision,
        note:'仅模拟背景铺满裁剪、保护区域和遮罩；裁剪按源图像素取整，不包含正文、气泡、毛玻璃。',previews}
    },
  }
}
