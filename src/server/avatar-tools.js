import sharp from 'sharp'
import { sessionImages } from './tools.js'
import { fault } from './emblems.js'

const limit=5*1024*1024
const cropSchema={type:'object',additionalProperties:false,properties:{
  zoom:{type:'number',minimum:1,maximum:4},x:{type:'number',minimum:0,maximum:1},y:{type:'number',minimum:0,maximum:1},
},required:['zoom','x','y']}
const view=state=>({revision:state.revision,user:{custom:Boolean(state.user)},assistant:{custom:Boolean(state.assistant)}})
export function avatarTools(service,attachments){
  const output={schema:{type:'object'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]}
  return [{
    name:'prts_avatar_inspect',
    description:'查看 PRTS 主题 Baker 会话头像的配置版本、用户和 AI 头像的原图尺寸与裁剪参数，以及当前会话上传或工具返回的图片。头像在同一 DSH 实例的所有会话中共享，仅在 Baker 样式下显示；此工具不修改设置。AI 生成或编辑的本地图片先用 read_image 读取，再调用本工具获取 attachmentId。',
    parameters:{type:'object',properties:{},additionalProperties:false},output,isConcurrencySafe:()=>true,
    async execute(_args,exec){
      const images=sessionImages(exec.agent),state=service.snapshot(),result=view(state)
      // Capture both sources before awaiting so metadata and revision describe one snapshot.
      const originals=['user','assistant'].map(role=>[role,service.edit(role)])
      for(const [role,source] of originals){
        if(!source.image)continue
        const meta=await sharp(Buffer.from(source.image,'base64'),{limitInputPixels:25000000,animated:false}).metadata()
        const swapped=[5,6,7,8].includes(meta.orientation)
        result[role]={custom:true,width:swapped?meta.height:meta.width,height:swapped?meta.width:meta.height,crop:source.crop}
      }
      return {...result,images}
    },
  },{
    name:'prts_avatar_apply',
    description:'按用户要求修改 Baker 头像。role=user 为用户头像，assistant 为 AI 头像。action=replace 使用当前会话的 attachmentId 替换图片；recrop 使用服务器当前原图重新裁剪；reset 恢复默认并删除自定义原图。crop 的 x/y 是相对于按 EXIF 转正后原图宽高的裁剪中心（0..1），zoom=1..4，默认居中且 zoom=1；圆形裁剪直径为原图短边除以 zoom，越界会被限制。先 inspect 获取 revision，冲突时重新检查，勿盲目覆盖。修改立即影响同一实例所有会话；保存替换后旧原图不保留。单图最大 5 MB、2500 万像素。工具不会切换用户本机的会话主题。',
    parameters:{type:'object',additionalProperties:false,properties:{
      role:{type:'string',enum:['user','assistant']},action:{type:'string',enum:['replace','recrop','reset']},
      attachmentId:{type:'string'},crop:cropSchema,revision:{type:'integer',minimum:0},
    },required:['role','action','revision']},output,isConcurrencySafe:()=>false,
    async execute(args,exec){
      const images=sessionImages(exec.agent)
      if(!['user','assistant'].includes(args.role)||!['replace','recrop','reset'].includes(args.action))throw fault(400,'头像类型或操作无效')
      if(args.revision!==service.snapshot().revision)throw fault(409,'头像已更新，请重新检查配置')
      if(args.action!=='replace'&&args.attachmentId)throw fault(400,'仅替换头像时可以指定图片')
      if(args.action==='reset'&&args.crop)throw fault(400,'恢复默认时不需要裁剪参数')
      let image=null
      if(args.action==='replace'){
        const ref=images.find(image=>image.attachmentId===args.attachmentId)
        if(!ref)throw fault(404,'当前会话没有这张图片，请先上传或用 read_image 读取图片，再 inspect')
        if(ref.bytes>limit)throw fault(400,'图片超过 5 MB')
        const {attachmentKind,origin,toolName,...attachment}=ref
        let bytes
        if(attachmentKind==='file'){
          const chunks=[];let size=0
          for await(const chunk of attachments.readFileStream(attachment,exec.signal)){
            size+=chunk.length;if(size>limit)throw fault(400,'图片超过 5 MB');chunks.push(chunk)
          }
          bytes=Buffer.concat(chunks)
        }else bytes=(await attachments.readImage(attachment,exec.signal)).data
        if(bytes.length>limit)throw fault(400,'图片超过 5 MB')
        image=Buffer.from(bytes).toString('base64')
      }else if(args.action==='recrop'){
        image=service.edit(args.role).image
        if(!image)throw fault(400,'尚未设置自定义头像，请先替换图片')
        if(!args.crop)throw fault(400,'请提供新的裁剪参数')
      }
      exec.signal?.throwIfAborted()
      const state=await service.save({role:args.role,image,crop:args.crop,revision:args.revision})
      return {applied:true,...view(state)}
    },
  }]
}
