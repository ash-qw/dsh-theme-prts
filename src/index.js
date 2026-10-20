import { createBackgroundService, registerBackgroundApi } from './server/backgrounds.js'
import Schema from '@deepseek-ai/schemastery'
import { DEFAULT_PREFERENCES } from './client/preferences.js'
import { createAvatarService, registerAvatarApi } from './server/avatars.js'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createEmblemService } from './server/emblems.js'
import { avatarTools } from './server/avatar-tools.js'
import { emblemTools } from './server/tools.js'
import { registerEmblemApi } from './server/api.js'
export const PACKAGE_ID = '@ash-qw/dsh-theme-prts'
export const THEME_PLUGIN_ID = 'dsh-theme-prts'
export const inject = ['tools', 'attachments', 'connection', 'webServer']

export const Config = Schema.object(Object.fromEntries([
  ...Object.entries(DEFAULT_PREFERENCES).map(([key, value]) => [key,
    (typeof value === 'boolean' ? Schema.boolean() : typeof value === 'number' ? Schema.number() : Schema.string()).default(value).volatile(),
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
  const definitions=[...emblemTools(service,ctx.attachments),...avatarTools(avatars,ctx.attachments)]
  let toolDisposers=[]
  const syncTools=()=>{
    const enabled=(config.aiToolsEnabled?.get?.() ?? config.aiToolsEnabled) !== false
    if(enabled && !toolDisposers.length) {
      for(const tool of definitions)toolDisposers.push(ctx.tools.register(tool))
    } else if(!enabled) {
      for(const dispose of toolDisposers.splice(0).reverse())dispose()
    }
  }
  syncTools()
  // Host volatile fields are updated before this notification; they expose get(), not subscribe().
  const stopConfig=ctx.on('app-boot/config-reload',syncTools)
  const disposers=[registerEmblemApi(ctx,service),registerAvatarApi(ctx,avatars),registerBackgroundApi(ctx,backgrounds)]
  ctx.effect(()=>async()=>{
    stopConfig()
    for(const dispose of toolDisposers.splice(0).reverse())dispose()
    for(const dispose of disposers.reverse())dispose()
    await service.dispose();await backgrounds.dispose()
  })
}
