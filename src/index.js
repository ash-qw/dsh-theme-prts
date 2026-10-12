import { join } from 'node:path'
import { homedir } from 'node:os'
import { createEmblemService } from './server/emblems.js'
import { emblemTools } from './server/tools.js'
import { registerEmblemApi } from './server/api.js'
export const PACKAGE_ID = '@ash-qw/dsh-theme-prts'
export const THEME_PLUGIN_ID = 'dsh-theme-prts'
export const inject = ['tools', 'attachments', 'connection', 'webServer']

export async function apply(ctx) {
  const directory=join(process.env.DSH_HOME?.trim() || join(homedir(),'.dsh'),'plugins','dsh-theme-prts','emblems')
  const service=await createEmblemService(directory)
  const disposers=emblemTools(service,ctx.attachments).map(tool=>ctx.tools.register(tool))
  disposers.push(registerEmblemApi(ctx,service))
  ctx.on('dispose',()=>{for(const dispose of disposers.reverse())dispose()})
}
