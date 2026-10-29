import test from 'node:test'
import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {createSessionSummaryPreview,latestAssistantReply,scrollSummaryTitle,pendingQuestionPreview,completedPreviewReplies} from '../src/client/session-summary-preview.js'

const chat = texts => ({order:texts.map((_,i)=>String(i)),nodes:new Map(texts.map((text,i)=>[String(i),{kind:'assistant-step',data:{blocks:[{kind:'text',text}]}}]))})
const wait = (window,ms=250) => new Promise(resolve=>window.setTimeout(resolve,ms))
function fixture() {
  const dom=new JSDOM('<section><strong></strong><p></p></section>',{pretendToBeVisual:true})
  const panel=dom.window.document.querySelector('section')
  return {dom,panel}
}
test('latest preview uses final visible prose, skips reasoning and retains the full text',()=>{
  const value=chat(['earlier','final'])
  value.order.push('tool')
  value.nodes.set('tool',{kind:'assistant-step',data:{blocks:[{kind:'reasoning',text:'private reasoning'},{kind:'tool-call'}]}})
  assert.equal(latestAssistantReply(value),'final')
  assert.equal(latestAssistantReply(chat(['x'.repeat(1400)])).length,1400)
  assert.equal(latestAssistantReply(chat(['earlier '.repeat(100) + '最新进度'])).endsWith('最新进度'),true)
  assert.equal(latestAssistantReply(chat(['## **检查完成**\n- 查看 [结果](https://example.com)\n> 使用 `npm test`'])),'## **检查完成**\n- 查看 [结果](https://example.com)\n> 使用 `npm test`')
  assert.ok(latestAssistantReply(chat(['开头\n' + '中'.repeat(5000) + '\n结尾'])).startsWith('开头'))
  assert.equal(latestAssistantReply(undefined),'')
})
test('hover acquires only one session and releases the stream on exit',async()=>{
  const {dom,panel}=fixture();let retained=0,released=0,listener,snapshot=chat(['hello'])
  const source={getSnapshot:()=>snapshot,subscribe:fn=>{listener=fn;return()=>{listener=undefined}}}
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    getSessions:()=>({retain:(id)=>{assert.equal(id,'test');retained++;return{ready:Promise.resolve({sessionId:id}),release:()=>released++}}}),
    getUiConversation:()=>({binding:()=>({target:name=>{assert.equal(name,'chat');return source}})})})
  preview.show('test',panel,'test')
  preview.stop();await wait(dom.window)
  assert.equal(retained,0)
  preview.show('test',panel,'test');await wait(dom.window)
  assert.equal(retained,1);assert.equal(panel.querySelector('[data-prts-preview-body]').textContent.trim(),'hello')
  snapshot=chat(['hello','streaming reply']);listener();listener();await wait(dom.window,150)
  assert.equal(panel.querySelector('[data-prts-preview-body]').textContent.trim(),'streaming reply')
  preview.stop();assert.equal(released,1);assert.equal(listener,undefined);assert.equal(panel.hidden,true)
  dom.window.close()
})
test('late history completion cannot overwrite a newer hovered session',async()=>{
  const {dom,panel}=fixture();let finish,released=0
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:id=>({ready:id==='old'?new Promise(r=>finish=r):Promise.resolve({sessionId:id}),release:()=>released++})},
    getUiConversation:()=>({binding:b=>({target:()=>({getSnapshot:()=>chat([b.sessionId]),subscribe:()=>()=>{}})})})})
  preview.show('old',panel,'old');await wait(dom.window)
  preview.show('new',panel,'new');await wait(dom.window)
  finish({sessionId:'old'});await wait(dom.window,0)
  assert.equal(panel.querySelector('[data-prts-preview-body]').textContent.trim(),'new');assert.equal(released,1)
  preview.stop();assert.equal(released,2);dom.window.close()
})
test('failed history reads release ownership and show a recoverable message',async()=>{
  const {dom,panel}=fixture();let released=0
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:()=>({ready:Promise.reject(Error('offline')),release:()=>released++})},
    getUiConversation:()=>({binding:()=>{throw Error('must not bind')}})})
  preview.show('a',panel,'a');await wait(dom.window)
  assert.match(panel.textContent,/暂时无法读取/);assert.equal(released,1)
  preview.stop();assert.equal(released,1);dom.window.close()
})
test('long title animation measures overflow and cancels on pointer exit',()=>{
  const {dom}=fixture();const d=dom.window.document,button=d.createElement('button'),viewport=d.createElement('span'),text=d.createElement('span')
  button.append(viewport);viewport.append(text);d.body.append(button)
  Object.defineProperty(viewport,'clientWidth',{value:100});Object.defineProperty(text,'scrollWidth',{value:180})
  let cancelled=0,frames,options
  text.animate=(f,o)=>{frames=f;options=o;return{cancel:()=>cancelled++}}
  const stop=scrollSummaryTitle(button,viewport,text,dom.window)
  button.dispatchEvent(new dom.window.Event('pointerenter'))
  assert.equal(options.duration,80/30*1000)
  assert.equal(options.fill,'forwards')
  assert.equal(options.iterations,undefined)
  assert.ok(frames.some(f=>f.transform==='translateX(-80px)'))
  button.dispatchEvent(new dom.window.Event('pointerleave'));assert.equal(cancelled,1)
  dom.window.matchMedia=()=>({matches:true});frames=undefined
  button.dispatchEvent(new dom.window.Event('pointerenter'));assert.equal(options.duration,0)
  stop();dom.window.close()
})

test('pending questions take precedence over old prose and revert when answered',async()=>{
  const {dom,panel}=fixture();let statusListener,pending={kind:'question',questions:[{question:'选择部署方式',options:[{label:'本地'},{label:'容器'}]}]}
  assert.equal(pendingQuestionPreview(pending),'选择部署方式：本地 / 容器')
  const status={getSnapshot:()=>new Map([['test',{pendingInteraction:pending}]]),subscribe:fn=>{statusListener=fn;return()=>{statusListener=undefined}}}
  const preview=createSessionSummaryPreview({window:dom.window,getSessionStatus:()=>status,getPreviewPreferences:()=>({previewFollowWarning:true}),
    sessions:{retain:()=>({ready:Promise.resolve({}),release(){}})},
    getUiConversation:()=>({binding:()=>({target:()=>({getSnapshot:()=>chat(['旧回复']),subscribe:()=>()=>{}})})})})
  preview.show('test',panel,'test');await wait(dom.window)
  assert.match(panel.textContent,/等待你的选择/)
  assert.deepEqual([...panel.querySelectorAll('[data-prts-preview-choices] > span')].map(el=>el.textContent),['本地','容器'])
  assert.ok(!panel.textContent.includes('旧回复'))
  pending=undefined;statusListener()
  assert.match(panel.textContent,/最新 AI 回复旧回复/)
  preview.stop();assert.equal(statusListener,undefined);dom.window.close()
})

test('new input and new turn boundaries prevent showing previous-turn prose',()=>{
  const snapshot=chat(['previous reply'])
  snapshot.order.push('input')
  snapshot.nodes.set('input',{kind:'user'})
  assert.equal(latestAssistantReply(snapshot),'')
  snapshot.order.push('thinking')
  snapshot.nodes.set('thinking',{kind:'assistant-step',data:{blocks:[{kind:'reasoning',text:'thinking'}]}})
  assert.equal(latestAssistantReply(snapshot),'')
  snapshot.nodes.get('thinking').data.blocks.push({kind:'text',text:'new reply'})
  assert.equal(latestAssistantReply(snapshot),'new reply')
  const turnOnly=chat(['old reply'])
  turnOnly.nodes.get('0').location={kind:'step',turn:{turn:1}}
  turnOnly.timeline={turnOrder:[1,2]}
  assert.equal(latestAssistantReply(turnOnly),'')
  turnOnly.nodes.get('0').location.turn.turn=2
  assert.equal(latestAssistantReply(turnOnly),'old reply')
})

test('running history includes only completed prose of the current turn in order',()=>{
  const snapshot=chat(['old','finished','still streaming','interrupted'])
  snapshot.nodes.get('0').data.status='settled'
  snapshot.nodes.get('1').data.status='settled'
  snapshot.nodes.get('2').data.status='running'
  snapshot.nodes.get('3').data.status='interrupted'
  snapshot.nodes.set('input',{kind:'user'})
  snapshot.order.splice(1,0,'input')
  assert.deepEqual(completedPreviewReplies(snapshot),[{key:'1',text:'finished'}])
  snapshot.nodes.get('2').data.status='settled'
  assert.deepEqual(completedPreviewReplies(snapshot).map(reply=>reply.text),['finished','still streaming'])
  snapshot.order.push('next-input')
  snapshot.nodes.set('next-input',{kind:'user'})
  assert.deepEqual(completedPreviewReplies(snapshot),[])
})

test('reply selector skips streaming prose, bounds the latest replies and detects replacements', async () => {
  const {createPreviewReplySelector} = await import('../src/client/session-summary-preview.js')
  const select = createPreviewReplySelector()
  const snapshot = chat(Array.from({length:12},(_,i)=>'正文 '+i))
  for (const node of snapshot.nodes.values()) node.data.status='settled'
  let reads=0
  snapshot.order.push('stream')
  snapshot.nodes.set('stream',{kind:'assistant-step',data:{status:'running',get blocks(){reads++;throw Error('stream text must not be read')}}})
  const first=select(snapshot,5)
  assert.deepEqual(first.map(r=>r.ordinal),[8,9,10,11,12])
  assert.equal(select(snapshot,5),first)
  assert.equal(reads,0)
  assert.equal(select(snapshot,0).length,12)
  snapshot.nodes.get('11').data.blocks[0].text='已修订'
  assert.equal(select(snapshot,5).at(-1).text,'已修订')
  snapshot.nodes.get('11').visibility='hidden'
  assert.equal(select(snapshot,5).at(-1).key,'10')
  snapshot.order.push('user')
  snapshot.nodes.set('user',{kind:'user'})
  assert.deepEqual(select(snapshot,5),[])
})

test('unrelated status notifications and streaming updates do not rewrite the preview',async()=>{
  const {dom,panel}=fixture();let notifyChat,notifyStatus
  const snapshot=chat(['完成'])
  snapshot.nodes.get('0').data.status='settled'
  snapshot.order.push('stream')
  snapshot.nodes.set('stream',{kind:'assistant-step',data:{status:'running',blocks:[{kind:'text',text:'生成中'}]}})
  const status={running:true}
  const statuses=new Map([['test',status]])
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:()=>({ready:Promise.resolve({}),release(){}})},
    getSessionStatus:()=>({getSnapshot:()=>statuses,subscribe:fn=>{notifyStatus=fn;return()=>{}}}),
    getUiConversation:()=>({binding:()=>({target:()=>({getSnapshot:()=>snapshot,subscribe:fn=>{notifyChat=fn;return()=>{}}})})})})
  preview.show('test',panel,'test');await wait(dom.window)
  let mutations=0
  const observer=new dom.window.MutationObserver(records=>mutations+=records.length)
  observer.observe(panel,{subtree:true,childList:true,attributes:true,characterData:true})
  statuses.set('other',{running:false});notifyStatus()
  snapshot.nodes.get('stream').data.blocks[0].text+='更多';notifyChat()
  await wait(dom.window,160)
  assert.equal(mutations,0)
  snapshot.nodes.get('stream').data.status='settled';notifyChat()
  await wait(dom.window,160)
  assert.equal(panel.querySelectorAll('[data-prts-reply-entry]').length,2)
  status.running=false;notifyStatus()
  assert.equal(panel.getAttribute('data-prts-preview-state'),'done')
  observer.disconnect();preview.stop();dom.window.close()
})

test('brief hover gaps reuse one live binding and expiry releases it',async()=>{
  const {dom,panel}=fixture();let retained=0,released=0,expiry,snapshot=chat(['之前'])
  const originalTimer=dom.window.setTimeout.bind(dom.window)
  dom.window.setTimeout=(fn,ms)=>{if(ms===30000){expiry=fn;return originalTimer(()=>{},30000)}return originalTimer(fn,ms)}
  const source={getSnapshot:()=>snapshot,subscribe:()=>()=>{}}
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:()=>{retained++;return{ready:Promise.resolve({}),release:()=>released++}}},
    getUiConversation:()=>({binding:()=>({target:()=>source})})})
  preview.show('a',panel,'a');await wait(dom.window,100)
  preview.leave();await wait(dom.window,350)
  assert.equal(released,0)
  preview.stop(false) // Rebuilding the status list must not flush idle cache.
  snapshot=chat(['间隔期间更新'])
  preview.show('a',panel,'a')
  assert.match(panel.textContent,/间隔期间更新/)
  await wait(dom.window,20)
  assert.equal(retained,1)
  preview.leave();await wait(dom.window,350)
  expiry();assert.equal(released,1)
  preview.show('a',panel,'a');await wait(dom.window,100)
  assert.equal(retained,2)
  preview.stop();assert.equal(released,2)
  dom.window.close()
})

test('five shared cache slots evict least recently viewed sessions and keep active ownership',async()=>{
  const {dom,panel}=fixture();const live=new Set(),reads=new Map(),timers=new Map()
  let subscriptions=0,peak=0,status={running:true}
  const originalTimer=dom.window.setTimeout.bind(dom.window)
  dom.window.setTimeout=(fn,ms)=>{const token=originalTimer(ms===30000?()=>{}:fn,ms);if(ms===30000)timers.set(token,fn);return token}
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:id=>{assert.ok(!live.has(id));live.add(id);peak=Math.max(peak,live.size);reads.set(id,(reads.get(id)||0)+1);return{ready:Promise.resolve({id}),release:()=>live.delete(id)}}},
    getSessionStatus:()=>({getSnapshot:()=>new Map([...live].map(id=>[id,status])),subscribe:()=>()=>{}}),
    getUiConversation:()=>({binding:binding=>({target:()=>({getSnapshot:()=>chat([binding.id]),subscribe:()=>{subscriptions++;return()=>subscriptions--}})})})})
  for(const id of ['a','b','c','d','e']) {preview.show(id,panel,id);await wait(dom.window,100)}
  assert.equal(live.size,5);assert.equal(subscriptions,1)
  // Revisiting in a different status uses the same session cache slot.
  status={running:false,completionUnread:true}
  preview.show('a',panel,'a');await wait(dom.window,20)
  assert.equal(reads.get('a'),1)
  preview.show('f',panel,'f');await wait(dom.window,100)
  assert.equal(peak,5);assert.equal(live.has('b'),false);assert.equal(live.has('a'),true)
  // Even a queued expiry callback from before reuse cannot evict active data.
  for(const expire of timers.values()) expire()
  assert.deepEqual([...live],['f']);assert.equal(subscriptions,1)
  preview.stop();assert.equal(live.size,0);assert.equal(subscriptions,0)
  dom.window.close()
})

test('hovering another session replaces a sticky transition preview without carrying its sticky state',async()=>{
  const {dom,panel}=fixture();let notifyStatus
  const statuses=new Map([['a',{running:true}],['b',{running:true}]])
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:id=>({ready:Promise.resolve({id}),release(){}})},
    getSessionStatus:()=>({getSnapshot:()=>statuses,subscribe:fn=>{notifyStatus=fn;return()=>{}}}),
    getUiConversation:()=>({binding:binding=>({target:()=>({getSnapshot:()=>chat([binding.id]),subscribe:()=>()=>{}})})})})
  preview.show('a',panel,'a');await wait(dom.window,100)
  statuses.set('a',{running:false,completionUnread:true});notifyStatus()
  preview.leave();await wait(dom.window,350)
  assert.equal(panel.hidden,false)
  preview.show('b',panel,'b');await wait(dom.window,100)
  assert.match(panel.getAttribute('aria-label'),/^b：/)
  assert.equal(panel.getAttribute('data-prts-preview-state'),'ongoing')
  preview.leave();await wait(dom.window,350)
  assert.equal(panel.hidden,true)
  preview.stop();dom.window.close()
})

 test('entering a different status dismisses a sticky preview but retains its cached data',async()=>{
  const {dom,panel}=fixture();let notify,status={running:true},released=0
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:()=>({ready:Promise.resolve({}),release:()=>released++})},
    getSessionStatus:()=>({getSnapshot:()=>new Map([['a',status]]),subscribe:fn=>{notify=fn;return()=>{}}}),
    getUiConversation:()=>({binding:()=>({target:()=>({getSnapshot:()=>chat(['完成']),subscribe:()=>()=>{}})})})})
  preview.show('a',panel,'a');await wait(dom.window,100)
  status={running:false,completionUnread:true};notify()
  preview.enterState('done');assert.equal(panel.hidden,false)
  preview.enterState('warning');assert.equal(panel.hidden,true)
  assert.equal(released,0)
  preview.stop();assert.equal(released,1);dom.window.close()
})

for (const [running,waiting] of [[true,false],[false,true]]) test(`follow switches use the departing state: running=${running}, waiting=${waiting}`,async()=>{
  const {dom,panel}=fixture();let notify,status={running:true}
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    getPreviewPreferences:()=>({previewFollowOngoing:running,previewFollowWarning:waiting}),
    getSessionStatus:()=>({getSnapshot:()=>new Map([['a',status]]),subscribe:fn=>{notify=fn;return()=>{}}})})
  preview.show('a',panel,'a')
  status={pendingInteraction:{kind:'approval',answerable:false,reason:'审批'}};notify()
  assert.equal(panel.getAttribute('data-prts-preview-state'),running?'warning':'ongoing')
  status={running:false,completionUnread:true};notify()
  assert.equal(panel.getAttribute('data-prts-preview-state'),running?'warning':'ongoing')
  preview.stop();dom.window.close()
})

test('running preview updates tool calls without prose and preserves completed replies', async()=>{
  const {dom,panel}=fixture(); let listener
  const snapshot=chat(['已完成的说明'])
  snapshot.nodes.get('0').data.status='settled'
  snapshot.order.push('tool')
  const root={callId:'call',name:'exec_command',phase:'start',argsRaw:'{"command":"<script>echo hello</script>"}'}
  snapshot.nodes.set('tool',{kind:'tool-call',data:{root}})
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    getSessionStatus:()=>({getSnapshot:()=>new Map([['test',{running:true}]]),subscribe:()=>()=>{}}),
    sessions:{retain:()=>({ready:Promise.resolve({}),release(){}})},
    getUiConversation:()=>({binding:()=>({target:()=>({getSnapshot:()=>snapshot,subscribe:fn=>{listener=fn;return()=>{}}})})})})
  preview.show('test',panel,'test');await wait(dom.window)
  const tool=panel.querySelector('[data-prts-preview-tool]')
  assert.match(tool.textContent,/exec_command/)
  assert.match(tool.textContent,/执行中/)
  assert.ok(!tool.textContent.includes('echo hello'))
  tool.querySelector('button').focus()
  const detail=panel.querySelector('[data-prts-reply-detail]')
  assert.match(detail.textContent,/<script>echo hello<\/script>/)
  assert.equal(detail.querySelector('script'),null)
  const reply=panel.querySelector('[data-prts-preview-message]')
  root.kind='tool-result';root.isError=true;root.call={argsRaw:root.argsRaw};delete root.argsRaw
  listener();await wait(dom.window,150)
  assert.match(tool.textContent,/失败/)
  assert.match(detail.textContent,/失败/)
  assert.equal(panel.querySelector('[data-prts-preview-message]'),reply)
  snapshot.order.push('input');snapshot.nodes.set('input',{kind:'user'})
  listener();await wait(dom.window,150)
  assert.equal(tool.hidden,true)
  assert.equal(panel.querySelector('[data-prts-preview-body]').textContent,'正在处理…')
  assert.equal(panel.querySelector('[data-prts-preview-message]'),null)
  snapshot.order.push('next');snapshot.nodes.set('next',{kind:'tool-call',data:{root:{name:'read_file',phase:'preparing'}}})
  listener();await wait(dom.window,150)
  assert.equal(tool.hidden,false)
  assert.match(tool.textContent,/准备中/)
  assert.equal(panel.hasAttribute('data-prts-preview-empty'),false)
  assert.equal(panel.querySelector('[data-prts-preview-body]').textContent,'')
  preview.stop();dom.window.close()
})

test('latest tool respects turn and visibility and includes nested dispatches', async()=>{
  const {latestToolCall}=await import('../src/client/session-summary-preview.js')
  const snapshot={timeline:{turnOrder:[2]},order:['old','current','hidden'],nodes:new Map([
    ['old',{kind:'tool-call',location:{turn:{turn:1}},data:{root:{name:'old',time:99}}}],
    ['current',{kind:'tool-call',location:{turn:{turn:2}},data:{root:{name:'parent',time:1,subCalls:[{name:'child',time:2,phase:'start',argsRaw:'partial'}]}}}],
    ['hidden',{kind:'tool-call',visibility:'hidden',location:{turn:{turn:2}},data:{root:{name:'hidden',time:100}}}],
  ])}
  assert.equal(latestToolCall(snapshot).name,'child')
  assert.equal(latestToolCall(snapshot).summary,'暂无操作摘要')
  assert.equal(latestToolCall(undefined),undefined)
})

test('removing the summary anchor closes sticky previews and releases ownership',async()=>{
  const {dom,panel}=fixture();let notify,released=0,unsubscribed=0
  let status={running:true}
  const snapshot=chat(['完成。'.repeat(60)]);snapshot.nodes.get('0').data.status='settled'
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:()=>({ready:Promise.resolve({}),release:()=>released++})},
    getSessionStatus:()=>({getSnapshot:()=>new Map([['a',status]]),subscribe:fn=>{notify=fn;return()=>unsubscribed++}}),
    getUiConversation:()=>({binding:()=>({target:()=>({getSnapshot:()=>snapshot,subscribe:()=>()=>unsubscribed++})})})})
  preview.show('a',panel,'a');await wait(dom.window,100)
  panel.querySelector('[data-prts-reply-entry]').focus()
  assert.ok(panel.querySelector('[data-prts-reply-detail]'))
  status={running:false,completionUnread:false};notify()
  const root=dom.window.document.createElement('div')
  root.innerHTML='<button data-prts-session-summary-item="other"></button>'
  preview.reanchor(root)
  assert.equal(preview.isOpen(),false)
  assert.equal(panel.hidden,true)
  assert.equal(panel.querySelector('[data-prts-reply-detail]'),null)
  assert.equal(released,1)
  assert.equal(unsubscribed,2)
  preview.stop();assert.equal(released,1)
  dom.window.close()
})

test('tool history collects calls after settled prose and summarizes only key arguments',async()=>{
  const {previewToolCalls}=await import('../src/client/session-summary-preview.js')
  const snapshot=chat(['正文'])
  snapshot.nodes.get('0').data.status='settled'
  snapshot.order.unshift('old')
  snapshot.nodes.set('old',{kind:'tool-call',data:{root:{name:'old',callId:'old',phase:'start'}}})
  snapshot.order.push('first','second','stream')
  snapshot.nodes.set('first',{kind:'tool-call',data:{root:{callId:'first',name:'exec',kind:'tool-result',time:30,callTime:1,isError:false,call:{argsRaw:'{"command":"npm test","extra":"omit-me"}'}}}})
  snapshot.nodes.set('second',{kind:'tool-call',data:{root:{callId:'second',name:'read',phase:'start',time:2,argsRaw:JSON.stringify({path:'/workspace/file',content:'omit-content'}),subCalls:[{callId:'child',name:'search',phase:'start',time:3,argsRaw:JSON.stringify({query:'x'.repeat(300)})}]}}})
  snapshot.nodes.set('stream',{kind:'assistant-step',data:{status:'running',blocks:[{kind:'text',text:'正在输出'}]}})
  let records=previewToolCalls(snapshot)
  assert.deepEqual(records.map(row=>row.key),['child','second','first'])
  assert.equal(records[0].summary.length,161)
  assert.equal(records[1].summary,'/workspace/file')
  assert.equal(records[2].summary,'npm test')
  assert.equal(records[2].status,'已完成')
  assert.ok(!JSON.stringify(records).includes('omit-'))
  snapshot.nodes.get('stream').data.status='settled'
  assert.deepEqual(previewToolCalls(snapshot),[])
})

test('preview acquires and coalesces updates on the next frame without fixed timer delays',async()=>{
  const {dom,panel}=fixture();const frames=new Map();let frameId=0,retained=0,notify,released=0
  dom.window.requestAnimationFrame=fn=>{frames.set(++frameId,fn);return frameId}
  dom.window.cancelAnimationFrame=id=>frames.delete(id)
  const flush=async()=>{const batch=[...frames.values()];frames.clear();for(const fn of batch)fn();await Promise.resolve()}
  const snapshot=chat(['first']);snapshot.nodes.get('0').data.status='settled'
  const preview=createSessionSummaryPreview({document:dom.window.document,window:dom.window,
    sessions:{retain:()=>{retained++;return {ready:Promise.resolve({}),release:()=>released++}}},
    getSessionStatus:()=>({getSnapshot:()=>new Map([['a',{running:true}]]),subscribe:()=>()=>{}}),
    getUiConversation:()=>({binding:()=>({target:()=>({getSnapshot:()=>snapshot,subscribe:fn=>{notify=fn;return()=>{}}})})})})
  preview.show('a',panel,'a');assert.equal(retained,0)
  await flush();assert.equal(retained,1);assert.match(panel.textContent,/first/)
  await flush()
  snapshot.nodes.get('0').data.blocks[0].text='second'
  notify();notify();notify()
  assert.equal(frames.size,1)
  assert.ok(!panel.textContent.includes('second'))
  await flush();assert.match(panel.textContent,/second/)
  notify();preview.stop();await flush()
  assert.equal(released,1);assert.equal(panel.hidden,true)
  preview.show('a',panel,'a');preview.stop();await flush()
  assert.equal(retained,1)
  dom.window.close()
})

test('tool summary cache follows mutable argument changes',async()=>{
  const {previewToolCalls}=await import('../src/client/session-summary-preview.js')
  const root={name:'exec',phase:'start',argsRaw:'{"command":"first"}'}
  const snapshot={order:['tool'],nodes:new Map([['tool',{kind:'tool-call',data:{root}}]])}
  assert.equal(previewToolCalls(snapshot)[0].summary,'first')
  root.argsRaw='{"command":"second"}'
  assert.equal(previewToolCalls(snapshot)[0].summary,'second')
  root.kind='tool-result';root.call={argsRaw:root.argsRaw};delete root.argsRaw;root.isError=true
  assert.equal(previewToolCalls(snapshot)[0].status,'失败')
  assert.equal(previewToolCalls(snapshot)[0].summary,'second')
})
