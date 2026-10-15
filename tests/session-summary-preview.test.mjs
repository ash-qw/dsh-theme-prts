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
  const preview=createSessionSummaryPreview({window:dom.window,getSessionStatus:()=>status,
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
