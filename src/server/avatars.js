import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { fault } from './emblems.js'
import { body, json, isBase64 } from './api.js'

export const AVATAR_API = '/prts-theme-api/avatars'
export async function createAvatarService(directory) {
  await mkdir(directory,{recursive:true,mode:0o700})
  const path=join(directory,'avatars.json')
  let state={revision:0,user:null,assistant:null}, queue=Promise.resolve()
  try{state=JSON.parse(await readFile(path,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
  const listeners=new Set()
  const snapshot=()=>({revision:state.revision,user:state.user,assistant:state.assistant})
  return {
    snapshot,
    edit(role){
      if(!['user','assistant'].includes(role))throw fault(400,'头像类型无效')
      return structuredClone({revision:state.revision,image:state.sources?.[role]?.image||state[role]?.split(',')[1]||null,crop:state.sources?.[role]?.crop||{zoom:1,x:.5,y:.5}})
    },
    subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
    save(data){
      const next=queue.then(async()=>{
        if(!['user','assistant'].includes(data?.role))throw fault(400,'头像类型无效')
        if(data.revision!==state.revision)throw fault(409,'头像已在其他页面更新，请重试')
        let image=null
        if(data.image!==null){
          if(typeof data.image!=='string'||data.image.length>8*1024*1024||!isBase64(data.image))throw fault(400,'请上传不超过 5 MB 的图片')
          const bytes=Buffer.from(data.image,'base64')
          if(!bytes.length||bytes.length>5*1024*1024)throw fault(400,'请上传不超过 5 MB 的图片')
          try{
            const input=sharp(bytes,{limitInputPixels:25000000,animated:false})
            const meta=await input.metadata()
            if(!['png','jpeg','webp','gif','avif'].includes(meta.format))throw Error('format')
            let pipeline=input.rotate()
            if(data.crop!==undefined){
              const c=data.crop
              if(!c||!Number.isFinite(c.zoom)||c.zoom<1||c.zoom>4||!Number.isFinite(c.x)||c.x<0||c.x>1||!Number.isFinite(c.y)||c.y<0||c.y>1)throw Error('crop')
              const swapped=[5,6,7,8].includes(meta.orientation)
              const width=swapped?meta.height:meta.width,height=swapped?meta.width:meta.height
              const size=Math.max(1,Math.round(Math.min(width,height)/c.zoom))
              const left=Math.max(0,Math.min(width-size,Math.round(c.x*width-size/2)))
              const top=Math.max(0,Math.min(height-size,Math.round(c.y*height-size/2)))
              pipeline=pipeline.extract({left,top,width:size,height:size})
            }
            const result=await pipeline.resize(256,256,{fit:'cover'}).png().toBuffer()
            image='data:image/png;base64,'+result.toString('base64')
          }catch{throw fault(400,'图片无法读取，请使用 PNG、JPEG、WebP、GIF 或 AVIF 图片（不超过 2500 万像素）')}
        }
        const updated={...state,revision:state.revision+1,[data.role]:image,sources:{...state.sources,[data.role]:image?{image:data.image,crop:data.crop||{zoom:1,x:.5,y:.5}}:null}}
        const temp=path+'.'+randomUUID()+'.tmp'
        // Atomically replace the current records; no source-image history is retained.
        try{await writeFile(temp,JSON.stringify(updated),{mode:0o600});await rename(temp,path)}
        finally{await rm(temp,{force:true}).catch(()=>{})}
        state=updated
        for(const fn of listeners){try{fn(state.revision)}catch{}}
        return snapshot()
      })
      queue=next.catch(()=>{})
      return next
    },
  }
}

export function registerAvatarApi(ctx,service){
  const connection=ctx.connection
  let disposed=false
  const streams=new Set()
  const dispose=ctx.webServer.register({kind:'prefix',path:AVATAR_API,handler:async(req,res)=>{
    try{
      if(disposed){json(res,503,{error:'主题服务正在重新加载，请稍后重试'});return}
      if('rejection' in connection.admit(req)){json(res,401,{error:'请先登录 DSH'});return}
      const path=new URL(req.url,'http://localhost').pathname.slice(AVATAR_API.length)
      if(req.method==='GET'&&path==='/events'){
        res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','x-accel-buffering':'no'})
        streams.add(res)
        const send=revision=>res.write('data: '+JSON.stringify({revision})+'\n\n')
        const unsubscribe=service.subscribe(send);send(service.snapshot().revision)
        const timer=setInterval(()=>res.write(': heartbeat\n\n'),25000)
        res.on('close',()=>{clearInterval(timer);unsubscribe();streams.delete(res)})
        return
      }
      if(req.method==='GET'&&path.startsWith('/edit/')){json(res,200,service.edit(path.slice(6)));return}
      if(path!=='/configuration')throw fault(404,'接口不存在')
      if(req.method==='GET'){json(res,200,service.snapshot());return}
      if(req.method!=='POST')throw fault(404,'接口不存在')
      if(req.headers['x-prts-request']!=='1')throw fault(403,'缺少请求标识')
      json(res,200,await service.save(await body(req)))
    }catch(error){if(!res.headersSent)json(res,error.status||500,{error:error.message});else res.end()}
  }})
  return()=>{disposed=true;dispose();for(const res of streams)res.end();streams.clear()}
}
