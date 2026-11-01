import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import sharp from 'sharp'
import {createBackgroundService} from '../src/server/backgrounds.js'
import {createAvatarService} from '../src/server/avatars.js'
import {createEmblemService} from '../src/server/emblems.js'
import {transferTools} from '../src/server/transfer-tools.js'
import {DEFAULT_PREFERENCES} from '../src/client/preferences.js'
import {validateThemePackage} from '../src/client/theme-transfer.js'

async function setup(t){
  const directory=await mkdtemp(join(tmpdir(),'prts-tool-transfer-'))
  const backgrounds=await createBackgroundService(join(directory,'backgrounds'))
  const avatars=await createAvatarService(join(directory,'avatars'))
  const emblems=await createEmblemService(join(directory,'emblems'))
  t.after(async()=>{await backgrounds.dispose();await emblems.dispose();await rm(directory,{recursive:true,force:true})})
  const events=[],files=new Map()
  const exec={agent:{session:{snapshotEvents:()=>events}},signal:new AbortController().signal}
  let id=0
  const attachments={
    async saveFile({data,name}){const attachmentId=String(++id);files.set(attachmentId,Buffer.from(data));return {attachmentId,name,bytes:data.length}},
    async *readFileStream(ref){yield files.get(ref.attachmentId)},
  }
  const descriptor={ns:'theme',revision:1,value:{...DEFAULT_PREFERENCES,enabled:true,cursor:'system'}}
  const settings={writable:true,describe:()=>[descriptor],update:async(ns,patch,expected)=>{
    assert.equal(ns,'theme');if(expected!==descriptor.revision)throw Error('SETTINGS_CONFLICT')
    descriptor.value={...descriptor.value,...patch};descriptor.revision++
  }}
  const host={get:()=>settings,fiber:{entry:{options:{id:'theme'}}}}
  const tools=Object.fromEntries(transferTools({backgrounds,avatars,emblems,attachments,host,themeVersion:'test'}).map(t=>[t.name,t]))
  const invoke=(name,args={})=>tools['prts_theme_'+name].execute(args,exec)
  const add=ref=>events.push({type:'tool/result',data:{message:{content:[{type:'file',attachment:ref}]}}})
  const upload=async value=>{const ref=await attachments.saveFile({data:Buffer.from(JSON.stringify(value)),name:'test.prts-theme.json'});add(ref);return ref}
  const png=await sharp({create:{width:24,height:16,channels:3,background:'#369'}}).png().toBuffer()
  return {backgrounds,avatars,emblems,exec,attachments,descriptor,settings,files,tools,invoke,add,upload,png}
}
test('full export/import roundtrip preserves backgrounds, protection, avatar sources and custom emblems',async t=>{
  const f=await setup(t),image=f.png.toString('base64'),region={x:.1,y:.1,width:.6,height:.6}
  await f.backgrounds.save({slot:'full',image,region,revision:0})
  await f.avatars.save({role:'user',image,crop:{zoom:2,x:.6,y:.4},revision:0})
  const draft=await f.emblems.preview({bytes:f.png,label:'测试徽记'})
  await f.emblems.apply({draftId:draft.id,target:'hero',revision:0})
  const exported=await f.invoke('export');f.add(exported.file)
  assert.equal(exported.exported,true)
  const pack=JSON.parse(f.files.get(exported.file.attachmentId));validateThemePackage(pack)
  assert.equal(pack.assets.avatars.user.image,image)
  assert.equal(pack.assets.emblems.items.length,1)
  assert.equal(f.tools.prts_theme_export.output.render({},exported)[1].type,'file')
  await f.backgrounds.save({slot:'full',image:null,revision:1})
  await f.avatars.save({role:'user',image:null,revision:1})
  const preview=await f.invoke('import_preview',{attachmentId:exported.file.attachmentId})
  assert.deepEqual(preview.ignoredFields,[])
  const result=await f.invoke('import',{previewId:preview.previewId})
  assert.equal(result.applied,true)
  assert.deepEqual(f.backgrounds.snapshot().full.region,region)
  assert.equal(f.avatars.edit('user').image,image)
  assert.deepEqual(f.avatars.edit('user').crop,{zoom:2,x:.6,y:.4})
  const restored=await f.emblems.exportAsset(f.emblems.snapshot().configuration.hero.draftId)
  assert.equal(restored.image,image)
  const backup=JSON.parse(f.files.get(result.backup.attachmentId))
  assert.equal(backup.assets.backgrounds.full,null);assert.equal(backup.assets.avatars.user,null)
})
test('settings-only files preserve assets, warn on ignored fields and retain missing settings',async t=>{
  const f=await setup(t)
  await f.backgrounds.save({slot:'sidebar',image:f.png.toString('base64'),revision:0})
  const before=f.backgrounds.snapshot()
  const ref=await f.upload({format:'prts-theme',version:1,preferences:{version:12,backgroundDim:.7,futureColor:'blue'}})
  assert.equal((await f.invoke('import_preview')).files.length,1)
  const preview=await f.invoke('import_preview',{attachmentId:ref.attachmentId})
  assert.deepEqual(preview.ignoredFields,['设置.futureColor'])
  assert.deepEqual(preview.changes,[{key:'backgroundDim',before:.45,after:.7}])
  const result=await f.invoke('import',{previewId:preview.previewId})
  assert.equal(result.applied,true)
  assert.equal(f.descriptor.value.cursor,'system')
  assert.deepEqual(f.backgrounds.snapshot(),before)
  const backup=JSON.parse(f.files.get(result.backup.attachmentId))
  assert.equal(backup.assets,undefined);assert.equal(backup.preferences.backgroundDim,.45)
  const exported=await f.invoke('export',{includeAssets:false})
  assert.equal(JSON.parse(f.files.get(exported.file.attachmentId)).assets,undefined)
})
test('preview refuses foreign files, malformed packages, stale revisions, changed bytes and other sessions',async t=>{
  const f=await setup(t)
  await assert.rejects(f.invoke('import_preview',{attachmentId:'foreign'}),/当前会话/)
  const invalid=await f.upload({format:'invalid'})
  await assert.rejects(f.invoke('import_preview',{attachmentId:invalid.attachmentId}),/格式/)
  const ref=await f.upload({format:'prts-theme',version:1,preferences:{version:12,backgroundDim:.6}})
  let p=await f.invoke('import_preview',{attachmentId:ref.attachmentId})
  const session=f.exec.agent.session;f.exec.agent.session={snapshotEvents:()=>[]}
  await assert.rejects(f.invoke('import',{previewId:p.previewId}),/当前会话/)
  f.exec.agent.session=session
  f.descriptor.revision++
  await assert.rejects(f.invoke('import',{previewId:p.previewId}),/已变化/)
  p=await f.invoke('import_preview',{attachmentId:ref.attachmentId})
  f.files.set(ref.attachmentId,Buffer.from('{"format":"prts-theme","version":1,"preferences":{"version":12,"backgroundDim":0.8}}'))
  await assert.rejects(f.invoke('import',{previewId:p.previewId}),/文件内容/)
  assert.equal(f.descriptor.value.backgroundDim,.45)
})
test('failed config write rolls assets back and returns an accessible backup attachment',async t=>{
  const f=await setup(t)
  await f.avatars.save({role:'assistant',image:f.png.toString('base64'),revision:0})
  const original=f.avatars.edit('assistant')
  const exported=await f.invoke('export'),pack=JSON.parse(f.files.get(exported.file.attachmentId))
  pack.assets.avatars.assistant=null
  const ref=await f.upload(pack),p=await f.invoke('import_preview',{attachmentId:ref.attachmentId})
  f.settings.update=async()=>{throw Error('配置写入失败')}
  const result=await f.invoke('import',{previewId:p.previewId})
  assert.equal(result.applied,false);assert.match(result.error,/已回退/)
  assert.equal(f.avatars.edit('assistant').image,original.image)
  assert.ok(f.files.has(result.backup.attachmentId))
  assert.equal(f.tools.prts_theme_import.output.render({},result)[1].attachment,result.backup)
})
test('backup storage failure and cancellation do not change the theme',async t=>{
  const f=await setup(t),ref=await f.upload({format:'prts-theme',version:1,preferences:{version:12,backgroundDim:.6}})
  const p=await f.invoke('import_preview',{attachmentId:ref.attachmentId})
  f.attachments.saveFile=async()=>{throw Error('磁盘已满')}
  await assert.rejects(f.invoke('import',{previewId:p.previewId}),/磁盘已满/)
  assert.equal(f.descriptor.value.backgroundDim,.45)
  const controller=new AbortController();controller.abort();f.exec.signal=controller.signal
  await assert.rejects(f.invoke('export'),{name:'AbortError'})
})
test('full preview detects material changes before import',async t=>{
  const f=await setup(t),file=(await f.invoke('export')).file
  f.add(file)
  const p=await f.invoke('import_preview',{attachmentId:file.attachmentId})
  await f.backgrounds.save({slot:'full',image:null,revision:0})
  await assert.rejects(f.invoke('import',{previewId:p.previewId}),/已变化/)
})
test('cancelling after a confirmed material write rolls it back and returns backup',async t=>{
  const f=await setup(t),file=(await f.invoke('export')).file
  f.add(file)
  const p=await f.invoke('import_preview',{attachmentId:file.attachmentId})
  const controller=new AbortController();f.exec.signal=controller.signal
  const save=f.backgrounds.save.bind(f.backgrounds);let writes=0
  f.backgrounds.save=async(...args)=>{const result=await save(...args);if(++writes===1)controller.abort();return result}
  const result=await f.invoke('import',{previewId:p.previewId})
  assert.equal(result.applied,false);assert.match(result.error,/取消/)
  assert.ok(result.backup);assert.equal(writes,2);assert.equal(f.descriptor.revision,1)
})
test('oversized files and overlapping transfer operations are rejected',async t=>{
  const f=await setup(t)
  f.add({attachmentId:'oversized',bytes:161*1024*1024,name:'large.json'})
  await assert.rejects(f.invoke('import_preview',{attachmentId:'oversized'}),/160 MB/)
  let release,entered
  const started=new Promise(resolve=>entered=resolve),gate=new Promise(resolve=>release=resolve)
  const save=f.attachments.saveFile
  f.attachments.saveFile=async args=>{entered();await gate;return save(args)}
  const exporting=f.invoke('export',{includeAssets:false});await started
  await assert.rejects(f.invoke('export'),/正在处理/)
  release();await exporting
})
test('import preview explanation never renders as a file attachment',async t=>{
  const f=await setup(t),file=(await f.invoke('export')).file
  f.add(file)
  const preview=await f.invoke('import_preview',{attachmentId:file.attachmentId})
  assert.ok(preview.backupNotice)
  assert.ok(preview.effects.some(text=>text.includes('200')))
  assert.deepEqual(f.tools.prts_theme_import_preview.output.render({},preview).map(part=>part.type),['text'])
  assert.deepEqual(f.tools.prts_theme_import_preview.output.render({},{backup:'说明文字'}).map(part=>part.type),['text'])
})
