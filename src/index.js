import { createBackgroundService, registerBackgroundApi } from './server/backgrounds.js'
import Schema from '@deepseek-ai/schemastery'
import { DEFAULT_PREFERENCES } from './client/preferences.js'
import { createAvatarService, registerAvatarApi } from './server/avatars.js'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createEmblemService } from './server/emblems.js'
import { themeToolStatus, THEME_TOOL_POLICY, ENABLE_THEME_TOOLS } from './server/theme-tool-status.js'
import { transferTools } from './server/transfer-tools.js'
import { readFile } from 'node:fs/promises'
import { backgroundTools } from './server/background-tools.js'
import { avatarTools } from './server/avatar-tools.js'
import { emblemTools } from './server/tools.js'
import { registerEmblemApi } from './server/api.js'
export const PACKAGE_ID = '@ash-qw/dsh-theme-prts'
export const THEME_PLUGIN_ID = 'dsh-theme-prts'
export const inject = ['tools', 'attachments', 'connection', 'webServer']

// Leave new palette fields absent until normalization can inherit the legacy color.
export const Config = Schema.object(Object.fromEntries([
  ...Object.entries(DEFAULT_PREFERENCES).map(([key, value]) => [key,
    (typeof value === 'boolean' ? Schema.boolean() : typeof value === 'number' ? Schema.number() : Schema.string()).default(['cornerColorLight', 'cornerCustomColorLight', 'cornerColorSource'].includes(key) ? undefined : value).volatile(),
  ]),
  ['preferencesInitialized', Schema.boolean().default(false).volatile()],
]))

export async function apply(ctx, config = {}) {
  ctx.inject(['settings'], settingsCtx => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
  })
  const directory=join(process.env.DSH_HOME?.trim() || join(homedir(),'.dsh'),'plugins','dsh-theme-prts','emblems')
  const service=await createEmblemService(directory)
  const backgrounds=await createBackgroundService(join(directory,'..','backgrounds'))
  const avatars=await createAvatarService(join(directory,'..','avatars'))
  const themeVersion=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version
  const definitions=[...emblemTools(service,ctx.attachments),...avatarTools(avatars,ctx.attachments),...backgroundTools(backgrounds,ctx.attachments,ctx),...transferTools({backgrounds,avatars,emblems:service,attachments:ctx.attachments,host:ctx,themeVersion})]
  const toolsEnabled=()=>(config.aiToolsEnabled?.get?.() ?? config.aiToolsEnabled) !== false
  const disposeStatus=ctx.tools.register(themeToolStatus(toolsEnabled))
  ctx.inject(['systemPrompt'], promptCtx=>{
    if(typeof promptCtx.systemPrompt?.context!=='function')return
    promptCtx.effect(()=>promptCtx.systemPrompt.context({
      name:'prts-theme-tools:'+ (ctx.fiber?.entry?.id ?? THEME_PLUGIN_ID),
      order:1500,required:true,interpolate:false,
      text:()=> 'PRTS AI 定制工具当前'+(toolsEnabled()?'已开启。':'已关闭。'+ENABLE_THEME_TOOLS)+' '+THEME_TOOL_POLICY,
    }))
  })
  let toolDisposers=[]
  const syncTools=()=>{
    const enabled=toolsEnabled()
    if(enabled && !toolDisposers.length) {
      for(const tool of definitions)toolDisposers.push(ctx.tools.register({...tool,
        description:tool.description+' '+THEME_TOOL_POLICY,
        execute:(args,exec)=>{
          if(!toolsEnabled())throw Error('PRTS AI 定制工具已关闭。'+ENABLE_THEME_TOOLS+' '+THEME_TOOL_POLICY)
          return tool.execute(args,exec)
        },
      }))
    } else if(!enabled) {
      for(const dispose of toolDisposers.splice(0).reverse())dispose()
    }
  }
  syncTools()
  // Host volatile fields are updated before this notification; they expose get(), not subscribe().
  const stopConfig=ctx.on('app-boot/config-reload',syncTools)
  const disposers=[registerEmblemApi(ctx,service),registerAvatarApi(ctx,avatars),registerBackgroundApi(ctx,backgrounds)]
  ctx.effect(()=>async()=>{
    stopConfig();disposeStatus()
    for(const dispose of toolDisposers.splice(0).reverse())dispose()
    for(const dispose of disposers.reverse())dispose()
    await service.dispose();await backgrounds.dispose()
  })
}
