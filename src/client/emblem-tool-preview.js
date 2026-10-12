// The native tool seat keeps previews available even for sessions with a remote filesystem.
export function registerEmblemToolPreview(ctx, React) {
  if (!ctx.slots?.inject || !React?.createElement) return () => {}
  return ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name:'tool.call.toolview',key:'prts_emblem_preview',
  }, ({block}) => {
    const h=React.createElement
    let result
    for(const part of block?.content ?? [])if(part.type==='text'){
      try {const value=JSON.parse(part.text);if(value.draftId)result=value}catch{}
    }
    if(!result || !/^[a-zA-Z0-9-]{1,80}$/.test(result.draftId))return h('div',null,block?.isError?'徽记预览失败':'正在生成徽记预览…')
    return h('figure',{'data-prts-tool-preview':'',style:{margin:'8px 0'}},
      h('img',{src:`/prts-theme-api/emblems/draft/${result.draftId}/preview.png`,alt:'粒子徽记预览',width:384,height:384,style:{maxWidth:'100%',height:'auto',display:'block',borderRadius:8}}),
      h('figcaption',null,`${result.label || '自定义徽记'} · 标准密度 ${result.particles?.standard ?? ''} 个粒子 · 未应用`))
  }))
}
