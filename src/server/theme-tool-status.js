export const ENABLE_THEME_TOOLS = '请用户手动打开主界面左上角罗德岛徽记 → AI 工具 →「允许 AI 定制主题」。若导航栏已隐藏，先展开 P.R.T.S. 导航。'
export const THEME_TOOL_POLICY = '涉及 PRTS 背景、头像、徽记、配置导入导出时，先检查 prts_theme_status。若工具被关闭，应先提醒用户手动开启「允许 AI 定制主题」，等待用户开启后再继续；不要自行启用开关，也不要用 shell、文件编辑、HTTP 或其他工具绕过开关修改主题配置或素材。'
export function themeToolStatus(isEnabled){
  return {
    name:'prts_theme_status',
    description:'只读查看 PRTS AI 定制工具是否开启及手动开启位置；关闭定制工具后此入口仍可用，不读取配置内容或素材。'+THEME_TOOL_POLICY,
    parameters:{type:'object',properties:{},additionalProperties:false},
    output:{schema:{type:'object'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]},
    isConcurrencySafe:()=>true,
    execute:async()=>({enabled:isEnabled(),nextAction:isEnabled()?'使用 PRTS 专用工具处理用户要求。':ENABLE_THEME_TOOLS,
      policy:THEME_TOOL_POLICY,scope:'此状态入口只报告状态，不能更改开关。'}),
  }
}
