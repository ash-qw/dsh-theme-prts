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

目标环境：`deepseek-harness:0.1.1-rc.2`。主题安装后默认关闭，不会立即改变页面。

## 安装与更新

包已公开发布到 npm，无需 GitHub 登录或访问令牌。若 DeepSeek Harness 运行在名为 `deepseek-harness` 的 Docker 容器中，安装或更新均使用：

```bash
docker exec deepseek-harness dsh plugin --profile web add @ash-qw/dsh-theme-prts
docker restart deepseek-harness
```

命令默认安装 npm `latest` 版本；如需锁定版本，可在包名后追加具体版本号，例如 `@ash-qw/dsh-theme-prts@<版本号>`。若 `dsh` 直接运行在宿主机上，去掉命令开头的 `docker exec deepseek-harness` 即可。

打开 `http://<NAS-IP>:3080`，进入“Settings → 插件 → P.R.T.S.”启用主题；启用后通过左上罗德岛徽记调整完整外观。Docker 环境中的插件保存在持久化的 `/data/profiles/web`，正常重建容器不会丢失。

## 当前特性

- P.R.T.S. / Rhodes Island / RIIC 设施化视觉，工作区与会话采用完整 SVG 轮廓、差异化侧脊和紧凑右侧操作按钮；
- 工作区悬停时以分层城市剪影塑造列车窗外的远近运动，会话悬停时在右侧显示急缓交错的录音声纹；
- Codex 风格的对话刻度栏，支持问答预览、刻度内滚动和点击定位；
- 日间 / 夜间切换与 Harness 原生主题状态同步；
- 输入框、菜单、预览和浮层支持关闭、柔和、标准、清晰四档玻璃材质；
- 罗德岛、龙门、企鹅物流、莱茵生命、整合运动粒子徽记，使用结构完整的正交点阵，并支持独立的新会话 / 普通会话五档密度；普通会话还可在 0×–2× 间调整滚动跟随速度，速度越快，徽记越快移动、破碎并换阵营；
- 主题手动启用及已激活主题刷新时播放 P.R.T.S. 启动序列，使用原始 P.R.T.S. 徽记、阶段进度条、移动端精简和减少动效完成态；
- 1440px 桌面、1024px 平板和 640px 以下手机布局，可设置在任意宽度下默认隐藏最左侧 P.R.T.S. 导航，并支持减少动效和降低透明度提示；
- 无运行时网络请求、分析统计或额外遥测。

## 设置架构

主界面左上角的罗德岛徽记是完整外观设置入口。展开后可选择三套预设，或分别调整环境底纹、粒子徽记、界面材质、导航栏默认隐藏、辅助功能和会话导航；粒子区的跟随速度滑杆会实时预览，显示预计多少个视口后重组，并在操作结束后保存。会话导航可配置刻度栏离左侧边栏的最大距离，并通过常驻空间剖面预览所选距离、自动居中或隐藏原因。手动修改视觉参数会显示 `CUSTOM`；导航栏默认隐藏和跟随速度均与视觉预设独立。

Harness 的“Settings → 插件 → P.R.T.S.”仅保留主题总开关和启动动画开关，并使用宿主标准设置布局。主题关闭或处于安全模式时，启动动画偏好仍可提前修改；完整外观继续由左上罗德岛徽记维护。

偏好继续存放在 `dsh.ui.prts.v1`，当前内容结构为 v8。旧 v1/v2/v3/v4/v5/v6/v7 配置会自动迁移，导航栏默认隐藏保持关闭，粒子跟随速度保持原有的 1× 行为；迁移还包含旧玻璃开关、`liquid` 玻璃、`full` 动效字段，以及已退役的有机分布与六边形点阵粒子配置。

## 浮层兼容边界

主题只接管 P.R.T.S. 自有界面，以及通过 `aria-controls`、`aria-describedby` 或 `aria-owns` 与已识别 Harness 控件稳定关联的宿主浮层。未知的 Body Portal、其它插件菜单、提示、Toast、弹窗和抽屉保持原始 DOM 与样式，不再尝试自动套用主题。

第三方插件如需主动使用 P.R.T.S. 浮层材质，可在浮层本身或其 Portal 根节点声明 `data-prts-surface="menu|listbox|popover|dialog"`；运行时支持动态添加、修改和移除该属性。`menu`、`listbox` 与 `popover` 可使用当前玻璃档位，`dialog` 始终使用不含实时模糊的实色面板，以避免大面积右侧弹窗卡顿。兼容属性 `data-prts-preserve-popup-style` 在一个版本周期内继续作为明确退出开关。

## 开发验证

需要 Node.js 18 或更高版本：

```bash
npm ci
npm run check
```

项目的 npm 分发名是 `@ash-qw/dsh-theme-prts`；`cordis.patch.yml` 包名和客户端 ModuleLoader ID 都与它保持一致，内部运行时插件 ID 仍为 `dsh-theme-prts`。维护者发布步骤见 [RELEASING.md](https://github.com/ash-qw/dsh-theme-prts/blob/main/RELEASING.md)。

## 只读真实环境验收

```bash
PRTS_LIVE_TARGET=<NAS-IP>:3080 npm run test:e2e:live
```

测试期间会把受信任的 `127.0.0.1:3080` 临时转发到目标服务，不修改 Docker 网络、反代或 DNS。不设置 `PRTS_LIVE_WRITE` 时不会创建会话或产生模型调用。

## 安全模式与恢复

若主题导致页面不可用，在 Harness 地址后添加 `?prts-safe=1`。安全模式会阻止所有主题视觉挂载，但保留“Settings → 插件 → P.R.T.S.”中的基础开关和恢复提示。也可以删除浏览器 localStorage 的 `dsh.ui.prts.v1`，下次加载会回到默认关闭状态。

## 卸载

```bash
docker exec deepseek-harness dsh plugin --profile web remove dsh-theme-prts
docker restart deepseek-harness
```

卸载不会删除浏览器偏好，也不会修改其他已安装皮肤。多个全局主题可能发生 CSS 冲突，建议一次只启用一个完整 UI 主题。

## 变更记录

版本变化见 [CHANGELOG.md](CHANGELOG.md)。

## 权利说明

原创代码以 MIT 许可证提供。第三方名称、角色图像、徽记及其衍生素材不属于 MIT 授权范围；本项目对这些素材不授予任何下游使用权。详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
