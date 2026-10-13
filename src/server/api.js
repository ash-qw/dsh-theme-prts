import { API, draftView, fault } from './emblems.js'

// Avoid repeated groups: multi-megabyte images can exhaust V8's regexp stack.
export function isBase64(value){return typeof value==='string'&&value.length%4===0&&/^[A-Za-z0-9+/]*={0,2}$/.test(value)}

export async function body(req) {
  const chunks=[];let size=0
  for await(const chunk of req){size+=chunk.length;if(size>16*1024*1024)throw fault(413,'请求过大');chunks.push(chunk)}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw fault(400,'请求数据无效')}
}
export function json(res,status,value){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
export function registerEmblemApi(ctx,service) {
  const connection=ctx.connection
  let disposed=false
  const streams=new Set()
  const dispose=ctx.webServer.register({kind:'prefix',path:API,handler:async(req,res)=>{
    try {
      if(disposed){json(res,503,{error:'主题服务正在重新加载，请稍后重试'});return}
      const admission=connection.admit(req)
      if('rejection' in admission){json(res,401,{error:'请先登录 DSH'});return}
      const path=new URL(req.url,'http://localhost').pathname.slice(API.length)
      if(req.method==='GET'&&path==='/events') {
        res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','x-accel-buffering':'no'})
        streams.add(res)
        const send=revision=>res.write(`data: ${JSON.stringify({revision})}\n\n`)
        const unsubscribe=service.subscribe(send)
        send(service.snapshot().revision)
        const heartbeat=setInterval(()=>res.write(': heartbeat\n\n'),25000)
        res.on('close',()=>{clearInterval(heartbeat);unsubscribe();streams.delete(res)})
        return
      }
      if(req.method==='GET'&&path==='/configuration'){json(res,200,service.snapshot());return}
      const exported=path.match(/^\/draft\/([a-zA-Z0-9-]+)\/export$/)
      if(req.method==='GET'&&exported){json(res,200,await service.exportAsset(exported[1]));return}
      const match=path.match(/^\/draft\/([a-zA-Z0-9-]+)(?:\/(preview\.png|source))?$/)
      if(req.method==='GET'&&match){
        if(!match[2]){const d=await service.draft(match[1]);json(res,200,{...draftView(d),value:d.value,previewPoints:d.previewPoints});return}
        const bytes=await service.image(match[1],match[2]==='source')
        res.writeHead(200,{'content-type':match[2]==='source'?'application/octet-stream':'image/png','cache-control':'private, max-age=3600','x-content-type-options':'nosniff'});res.end(bytes);return
      }
      if(req.method!=='POST')throw fault(404,'接口不存在')
      if(req.headers['x-prts-request']!=='1')throw fault(403,'缺少请求标识')
      const controller=new AbortController()
      res.on('close',()=>{if(!res.writableEnded)controller.abort(new Error('请求已取消'))})
      const data=await body(req)
      if(path==='/configuration'){json(res,200,await service.save(data.configuration,data.revision,controller.signal));return}
      if(path==='/import'){
        const d=await service.importAsset(data,controller.signal)
        json(res,200,{...draftView(d),value:d.value,previewPoints:d.previewPoints});return
      }
      if(path==='/preview'){
        if(data.image && !isBase64(data.image))throw fault(400,'图片编码无效')
        const d=await service.preview({bytes:data.image?Buffer.from(data.image,'base64'):undefined,baseId:data.draftId,params:data.params,label:data.label},controller.signal)
        json(res,200,{...draftView(d),value:d.value,previewPoints:d.previewPoints});return
      }
      throw fault(404,'接口不存在')
    }catch(error){if(!res.headersSent)json(res,error.status||500,{error:error.message});else res.end()}
  }})
  return()=>{disposed=true;dispose();for(const res of streams)res.end();streams.clear()}
}
