# dsh-theme-prts

面向 DeepSeek Harness Web 的个人、非商业明日方舟 / P.R.T.S. 同人 UI 插件。主题保留 Harness 的原生交互和数据流，将工作区、会话与对话组织成罗德岛设施终端。

> [!IMPORTANT]
> 本项目是个人制作的非官方《明日方舟》同人主题，与上海鹰角网络科技有限公司及相关发行方不存在隶属、合作、授权或背书关系。
>
> MIT 许可证仅覆盖本项目原创代码。安装包中若干可识别的《明日方舟》名称、角色图像、徽记及其衍生素材不属于 MIT 授权范围，本项目不向使用者授予复制、修改、再分发、再许可或商业使用这些第三方素材的权利。
>
> 素材可从公开网页访问不代表获得再利用或再分发授权；免费、非商业使用也不当然构成授权。素材来源与许可边界详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
>
> 本项目及其发行包可能因权利人请求、平台政策或维护者决定，随时暂停发布、限制下载或移除相关素材，不保证持续提供。

已适配 DeepSeek Harness Web `0.1.1-rc.2`。主题安装后默认关闭，不会立即改变页面。

## 安装与更新

在已经可以正常运行 DSH Web 的环境中执行：

```bash
npx @deepseek-ai/dsh plugin --profile web add @ash-qw/dsh-theme-prts
```

安装或更新后建议重新启动 DSH Web，以确保主题被完整加载。然后进入“Settings → 插件 → P.R.T.S.”启用主题；完整外观设置位于主界面左上角的罗德岛徽记。

主题包已公开发布到 npm，无需 GitHub 登录或访问令牌。重新执行安装命令即可更新到 `latest`；如需锁定版本，可使用 `@ash-qw/dsh-theme-prts@<版本号>`。若命令提示 `pnpm not found`，请先安装 pnpm。

## 当前特性

- P.R.T.S. / Rhodes Island / RIIC 设施化工作区、会话与对话界面；
- 与 Harness 同步的日间 / 夜间模式、三套外观预设和四档界面材质；
- 城市剪影、阵营粒子徽记、会话声纹和 P.R.T.S. 启动序列；
- 支持问答预览与点击定位的对话刻度导航；
- 桌面、平板、手机、减少动效和降低透明度适配；
- 无运行时网络请求、分析统计或额外遥测。

## 使用与设置

“Settings → 插件 → P.R.T.S.”提供主题总开关和启动动画开关。主界面左上角的罗德岛徽记提供预设、环境底纹、粒子徽记、界面材质、导航栏、辅助功能和会话导航设置。

主题不会主动改写第三方插件的菜单、弹窗和浮层样式。

## 安全模式与恢复

若主题导致页面不可用，在 Harness 地址后添加 `?prts-safe=1`。安全模式会阻止所有主题视觉挂载，但保留“Settings → 插件 → P.R.T.S.”中的基础开关和恢复提示。也可以删除浏览器 localStorage 的 `dsh.ui.prts.v1`，下次加载会回到默认关闭状态。

## 卸载

```bash
npx @deepseek-ai/dsh plugin --profile web remove @ash-qw/dsh-theme-prts
```

卸载后建议重新启动 DSH Web。浏览器中的主题偏好不会被删除。多个全局主题可能发生 CSS 冲突，建议一次只启用一个完整 UI 主题。

## 开发

需要 Node.js 18 或更高版本：

```bash
npm ci
npm run check
```

版本变化见 [CHANGELOG.md](CHANGELOG.md)，维护者发布步骤见 [RELEASING.md](RELEASING.md)。
