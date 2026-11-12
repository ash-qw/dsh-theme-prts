export function createChatHistoryRecords({ turns = 72, steps = 3 } = {}) {
  const records = []
  const add = (type, data, surface = false) => {
    const seq = records.length
    records.push({ type: 'event', event: {
      type, seq, time: 1_794_400_000_000 + seq * 10, data,
      ...(surface ? { surfaceOp: 'append' } : {}),
    } })
  }
  for (let turn = 1; turn <= turns; turn += 1) {
    add('turn/start', { turn })
    for (let step = 1; step <= steps; step += 1) {
      add('step/start', { turn, step })
      if (step === 1) add('user/message', {
        role: 'user', id: `history-user-${turn}`, source: { kind: 'user' },
        content: [{ type: 'text', text: `历史回放第 ${turn} 轮：检查分页和阅读位置。` }],
      }, true)
      add('assistant/message', { turn, step, stream: [], message: {
        role: 'assistant', id: `history-assistant-${turn}-${step}`,
        source: { kind: 'model', provider: 'fixture', model: 'history-replay' },
        content: [{ type: 'text', text: `历史回放第 ${turn} 轮第 ${step} 段。\n\n${'这是一段用于检查分页前插、头像分组和阅读位置的历史正文。'.repeat(4)}${turn % 10 === 0 && step === steps ? '\n\n```diff\n-旧的演示行\n+新的演示行\n```' : ''}` }],
      } }, true)
      add('step/end', { turn, step })
    }
    add('turn/end', { turn, reason: { kind: 'completed' } })
  }
  return records
}
