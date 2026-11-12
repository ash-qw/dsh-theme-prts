# DeepSeek Harness 0.2.2-rc.2 主题适配记录

日期：2026-11-12。主题基线：公开 `v3.2.1`，提交 `a45f69b`。适配阶段使用 `3.2.1` 本地开发构建；随后按用户要求准备 `4.0.0` 发布候选。发布信息审核通过前不创建发布标签或发布 npm。

## 1. 比较边界

- 上一个支持版本：`dsh-v0.2.2-rc.1`，提交 `66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db`。
- 本地运行版本：`dsh-v0.2.2-rc.2`，提交 `ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c`。
- 对照发布标签源码，不把仅存在于后续开发分支的代码当作已发布行为，也不据此声称该版本是所有渠道的最新版本。
- 当前源码的 `engines.dsh` 精确限定为 `0.2.2-rc.2`；已发布的主题 `3.2.1` 仍面向 `0.2.2-rc.1`。其余候选版与旧版宿主不属于当前维护范围。

## 2. 已确认的加载阻断

升级后的原安装包仍声明 `engines.dsh: 0.2.2-rc.1`。宿主启动日志明确跳过该包；实际页面的启动清单没有主题，徽记、背景、头像配置 API 均为 404。服务健康并不意味着主题已激活。

执行本地适配时还发现，主题不在配置的 `dsh.profile.bundles` 中，且其 `cordis.patch.yml` 行被禁用。因此只覆盖包文件或只修改引擎声明仍不能恢复加载。本次仅恢复主题包的启动列表成员及该行的启用状态，不为其他第三方插件放行不兼容版本。

用户明确选择用当前仓库覆盖原安装包。本地原有同版本扩展源码不合并回仓库；设置、自定义头像、背景和徽记数据不随安装包替换。安装前保留了包、配置和锁文件备份。

## 3. 上游变化与主题处理

| 上游变化 | 对主题的判断与处理 |
| --- | --- |
| `Menu.getAnchorRect` 改为 `anchorRef` / `anchorPoint`，移除 `useAnchoredPosition`，菜单使用 CSS 锚点 | 主题没有导入被移除的值或调用该旧 prop。保留宿主定位，不通过主题覆盖 `position-anchor`；增加真实工作区菜单的锚点、可见范围、键盘与焦点返回回归。 |
| 菜单行提取为 `MenuRow`，工作区和会话按钮接入共享 `contextMenu.button` | `data-context-menu-trigger` 和菜单的 ARIA 标记仍在，现有语义选择器继续使用。保留原生按钮和事件，不复制菜单。 |
| macOS 交互控件不再在任意位置自动声明 `no-drag` | 实际 Web 页面切换到宿主 Darwin 样式后，主题外壳为 `no-drag`，主题设置对话框却为 `none`。外壳只拥有导航宽度，不能把它当作所有固定定位弹层的区域所有者。为所有主题自有对话框及设置遮罩补上 `data-window-drag-exclude`，仅由宿主的 Darwin CSS 生效。 |
| `BundleInfo.updatable` 改为 `update`，增加安装错误码 | 主题未读取该结构或穷尽处理这些错误码，无需迁移调用。 |
| `ProcessActivity` 新增 `context` | 主题未导入该类型或维护其穷尽映射；继续使用宿主过程区与正文语义标记，不强制展开过程。 |
| 附件错误保留错误码 | 主题调用的附件读写签名未变化，不将错误码变化误判为所有附件 API 均不可用。 |
| 插槽增加 HOC 组合能力、主题初始配色保持宿主启动值 | 当前主题的设置列表插槽和工具预览键控插槽并非新增的 HOC 插槽；不为此重写注册。实际设置保存、重载和明暗切换仍需宿主回归。 |

### 固定版本证据

- [CSS 锚定菜单升级说明](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/docs/upgrade-guide/v0.2.2-alpha.2/css-anchored-menus/guide.zh.md)
- [macOS 窗口区域升级说明](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/docs/upgrade-guide/v0.2.2-rc.1/window-drag-regions/guide.zh.md)
- [宿主窗口区域 CSS](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/packages/client/web/src/base.css)
- [共享菜单按钮实现](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/packages/client/ui-context-menu/src/client/Button.tsx)
- [插件更新方法升级说明](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/docs/upgrade-guide/v0.2.2-rc.1/plugin-update-method/guide.zh.md)
- [过程活动升级说明](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/docs/upgrade-guide/v0.2.2-alpha.3/chat-process-activity-context/guide.zh.md)
- [附件错误升级说明](https://github.com/deepseek-ai/deepseek-harness/blob/ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c/docs/upgrade-guide/v0.2.2-rc.1/attachment-error-codes/guide.zh.md)

## 4. 验证边界

- Node.js 24.19.0 下构建及 611 项单元测试通过；新增区域声明测试先在未修复代码上失败，再在修复后通过。
- 最终真实宿主回归 16 项通过，1 项推理会话检查因未指定测试会话而跳过，未把跳过视为通过。覆盖主面板、移动端抽屉、设置保存和重载恢复、深浅模式下的工作区与会话菜单、固定会话、长标题、输入区玻璃材质，以及新增的完整客户端、资源 API、CSS 锚点、焦点返回和平台窗口区域检查。
- 最终扩展夹具 68 项中 67 项通过，1 项旧头像用例失败。该用例用浏览器原生 `dialog` 事件尝试确认重置，但基线早已使用自定义 HTML 确认框，未点击确认就继续操作头像。用 `git show HEAD:lib/client.js` 在隔离夹具中对照，原版与本次构建均表现为原生事件不触发、HTML 确认框保持打开；分别点击真正的确认按钮后，两版均成功恢复默认头像。保留该既有测试失败，不借本次适配改写无关用例，也不把它记为通过。
- 通过的夹具范围包括主面板与抽屉、引用移除、第三方浮层边界、模型搜索、菜单材质、流线显示、重命名焦点，以及相关头像裁剪、背景区域和主题文件交互。头像旧用例的失败限制如上。
- 真实宿主验证不发送新的模型生成请求；涉及设置持久化时恢复原值，不将夹具中的上传、裁剪和导入导出等同于对真实实例执行同样的写操作。
- 本机地址被宿主配置为可信地址，因此无 Cookie 的本机请求可以被允许；新增鉴权回归使用非可信 `Host`，避免把可信地址策略误判成主题认证漏洞。
- Darwin 检查在 Chromium 内切换宿主平台属性，核对宿主 CSS 与主题标记；不是 macOS Electron 窗口命中测试或官方桌面实机验收。未进行全量性能基准、Safari 或 Edge 实机验收。

## 5. 适配阶段本地部署

- 已将当前仓库打包覆盖安装到本地 `0.2.2-rc.2`，移除原安装包中仓库没有的本地扩展文件；未合并这些扩展，不删除独立的设置和素材数据目录。
- 仅替换主题的本地 tarball 依赖、锁文件中主题对应的包记录，并恢复主题的启动列表及启用标记。部署脚本逐项断言无关依赖锁定图不变，包安装继续使用冻结锁文件和供应链策略检查；没有增加兼容性豁免。
- 最终包为 `/workspace/prts-rc0222-43f4284edd0a.tgz`，部署前备份为 `/data/backups/prts-before-prts-rc0222-43f4284edd0a-1794453010060`。更早覆盖前的原本地包另有备份，未因后续部署被移除。
- 重启后服务为 `running healthy`。工作区与已安装的 `lib/client.js` SHA-256 均为 `004e2671858a2c220cb51830807296dff39460ffa7d3a48e37d51744949c018a`；新增真实宿主测试还确认浏览器收到完整当前构建，而不只是比较磁盘文件。
- 适配阶段未提交、推送、创建版本标签或公开发布；当时版本号为 `3.2.1` 的本地开发构建，不应把它与 npm 上同版本的既有兼容声明混淆。后续发布准备将候选版本调整为 `4.0.0`，不改变该阶段的部署记录。

## 6. 发送故障补充排查

用户随后报告无法发送消息。前述主题回归没有发起模型生成，也没有检查后台会话激活错误，因此不能据此认定发送链路正常。

- 在主题模式和 `?prts-safe=1` 原生界面均捕获到 `api-session/error`：恢复会话时找不到 `@deepseek-ai/node-addon-system-linux-x64/package.json`，调用栈指向 `/opt/dsh-rc2/node_modules/@deepseek-ai/node-addon-system/lib/flock.js`。独立调用 `tryLockExclusive()` 同样报 `MODULE_NOT_FOUND`。
- 根因是本机 rc.2 源码镜像在 `/opt/dsh-rc2` 安装时使用 `npm install --omit=optional`，遗漏会话写锁所需的原生平台包。旧全局安装中有该包，但不在新版模块的解析路径上；不是主题按钮或样式拦截发送，也不是凭据报错。
- 修复本地 `rc2-source-image/Dockerfile`，将基底镜像已有的 Linux x64 平台包复制到新版依赖目录；构建时校验平台包版本与包装包要求一致，并实际获取文件锁，避免仅用 `dsh --version` 作为启动验收。
- 修复镜像另外通过非 root 用户下的锁获取、互斥冲突、释放后重新获取检查，随后重新创建本地容器。保留修复前镜像标签 `deepseek-harness:0.2.2-rc.2-before-native-lockfix-20261112` 和原 Dockerfile 备份，不只在运行中容器里临时补文件。
- 部署后，原有会话恢复为 `agentAvailable: true`，不再产生上述激活错误。主题开启状态下，在 `test_workspace` 新建诊断会话，发送“只回复 OK、不调用工具、不修改文件”的测试消息，默认 MiniMax-M3 约 2 秒返回 `OK`，`turn/end` 原因为 `completed`，浏览器及会话错误集合为空。诊断会话保留供核对，未向用户已有对话添加消息。
- 真实宿主回归的错误收集补充监听 `api-session/error`，避免只看页面异常与资源 HTTP 状态而遗漏会话恢复失败。此次无需更改主题客户端或模型/凭据配置。

## 7. 4.0.0 发布准备

- 对照公开 `v3.2.1` 核实本次变化，因 `engines.dsh` 不再接受 `0.2.2-rc.1` 而拟发布主版本 `4.0.0`，并同步中英文安装文档和旧宿主版本对应关系。未把本机镜像依赖补齐描述成主题 npm 包新增的修复。
- Node.js 24.19.0 下重新执行 `npm ci`，依赖审计为 0 项漏洞；`npm run check` 的 611 项测试通过；`npm publish --dry-run` 成功，生命周期再次执行的 611 项检查也全部通过，没有实际发布。
- 预演包共 225 个文件，约 1.1 MB；客户端、宿主入口、源码、补丁、两份 README、CHANGELOG、许可证及两份第三方声明齐全，不包含测试、维护文档或本地审核文件。
- 候选包 `/workspace/prts-rc0222-776eb167502d.tgz` 已本地安装，包版本为 `4.0.0`，主题锁记录的版本与引擎声明同步更新；断言无关依赖图保持不变。部署前备份为 `/data/backups/prts-before-prts-rc0222-776eb167502d-1794463922878`。
- 当前及已安装客户端 SHA-256 为 `05d4eabde740299872e5430f6c81f6040899fa1e749260ab4a6c9d6f29972a20`；重启后服务健康。候选版本号不表示公开发布已完成，须先审核完整 Release 正文与标签注释，再提交推送及触发标签发布。
- 候选部署后的两组真实宿主回归重新执行，16 项通过、1 项未指定推理会话的用例跳过；包括完整浏览器客户端匹配、设置写入后恢复、桌面与窄屏菜单和窗口区域契约验证。
