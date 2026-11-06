# DeepSeek Harness 0.2.2-rc.1 源码与主题适配审计

审计日期：2026-11-06。主题基线：2.7.2，提交 `4cf7059a546f98547a83ea626682f549726708da`。

## 1. 版本边界与结论

- GitHub Releases 与 npm dist-tags 交叉核对：当前公开的最新版本为 `0.2.2-rc.1`，对应标签 `dsh-v0.2.2-rc.1`；GitHub 标记为预发布，但 npm 的 `latest`、`next` 均指向它。
- 发布时间为 2026-11-04 13:07:14 UTC，即北京时间 21:07:14。
- 源码比较范围：`dsh-v0.2.1-rc.5`（`b830ec950faba0a46dda564be3e2d854afed94f1`）→ `dsh-v0.2.2-rc.1`（`66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db`）。
- 审计时 `master` 为 `fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159`，与发布标签不同；没有将仅存在于该分支的代码当成已发布行为。
- 客户端变更路径筛选后涉及 606 个文件，已排除测试、翻译目录、README 和 package.json；这是筛选规模，不代表逐行审完所有文件。重点逐段对照布局、菜单、引用、会话分组、插件生命周期、主题服务和本插件依赖的工具入口。

**结论：主布局适配已经覆盖新版默认结构，但不能称为所有新场景都适配完整。复现了引用移除按钮、动态浮层内容、浮层停止后重启三类适配遗漏，另确认整组隐藏会话快捷动作会影响同组第三方操作。后者是用户已确定、展示方案待定前暂时保留的设计限制，不作为本次恢复显示的修复项；前三项也不等同于由新版引入的破坏性变更。**

首次审计只做源码核对和隔离验证；以下第 2～6 节保留审计基线及其局限。用户确认处理后，已完成第一阶段修复，具体变化和新增验证见第 7 节。不调整支持版本。第一阶段已提交为 `1a56f56`，未推送或公开发布；后续用户消息修复见第 8 节。

## 2. 上游源码实际变化

| 变化 | 发布源码中的实现 | 对主题的意义 |
| --- | --- | --- |
| 主栏结构与抽屉交互 | `AppFrame` 将 `main` 放入 `MainPanel`，外层仍是 `CenterColumn`；通过 `data-global-panel` 区分全局页面，保留 drawer、mask、inert 等状态 | 主题应定位整个主栏，不能把新增内层当成完整布局区域；移动端抽屉仍由宿主管理 |
| 统一右键菜单 | 新 `ui-context-menu` 服务统一注册、解析菜单，暴露 `contextMenus.active`；支持右键、键盘触发、动态贡献和子菜单 | 不能只围绕省略号按钮建立菜单状态；菜单后续内容变化也属于适配边界 |
| 聊天文本引用 | 新 `QuoteNode` 与 `QuotePreview`，使用 `data-composer-quote`、`data-quote-preview`、`data-quote-popover`；编辑态可移除，发送态无移除按钮 | 引用不是普通 blockquote，也不是普通输入框操作按钮；需要保护选区和原生事件处理 |
| 对话过程与结果展示 | `TranscriptView.setFoldedReplies` 支持折叠后展示全部回复或最终回复；`ChatGroupSeat` 根据分组状态控制展示，正文成员保持在稳定容器中 | 不能通过移动正文节点或强制显示过程区来实现主题；需补折叠策略与主题模式组合测试 |
| 文件与右侧面板 | 文件交互接入统一菜单，rightbar 扩展支持 sidebar/float 目的地与浮动面板属性 | 浮动文档或终端不是菜单，不应仅凭“浮动”就套用菜单玻璃材质 |
| 插件更新与卸载 | 支持第三方插件包更新及失败恢复；客户端 entry teardown 在 effect cleanup 后移除该插件样式 | 适配器需要可重复启动、清理完整；完整卸载重建与同实例停止再启动应分别测试 |
| 主题和图标扩展 | `ThemeDefinition.icons` 与 SVG sprite 替换能力；`theme.overrideTokens` 可叠加 token 并返回清理函数 | 可减少逐控件强覆盖；注意 token override 在 rc.5 已存在，不是此次新加 |
| 工具执行链 | `tools` 拆分执行管线，原生与 PTC executor 分离，原先部分 PTC 文件迁往新包 | 上游有 API/模块迁移，但主题使用的注册入口不能因此直接判为不兼容，见第 4 节 |

补充：富文本草稿编辑器并非本次才引入。不能把引用功能新增，误说成整个输入框从 textarea 改成富文本。

### 上游证据索引

以下链接固定到本次审计的发布提交，不跟随 master 漂移。

- [H1：主栏、主面板、抽屉及右栏](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-layout/src/client/AppFrame.tsx#L41)
- [H2：统一菜单打开、订阅与清理](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-context-menu/src/client/index.ts#L88)
- [H3：菜单子项在悬停/聚焦后挂载](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-primitives/src/Menu.tsx#L487)
- [H4：原生菜单独立材质层](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-primitives/src/MenuSurface.module.css#L22)
- [H5：原生菜单模糊 token](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-theme/src/styles/gradient-shadow-text.css#L20)
- [H6：引用组件及移除事件](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-primitives/src/QuotePreview.tsx#L44)
- [H7：引用原生尺寸与圆形透明按钮](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-primitives/src/QuotePreview.module.css#L43)
- [H8：会话行菜单状态、trailing 与快捷动作插槽](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-workspace/src/client/rows/Rows.tsx#L636)
- [H9：内置 archive/pin 插槽提供方](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-workspace/src/client/index.ts#L355)
- [H10：折叠结果设置](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-chat/src/client/transcript-view.ts#L62)
- [H11：过程区和正文容器](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-chat/src/client/chat/ChatGroupSeat.tsx#L170)
- [H12：插件 entry 样式清理](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/modules/src/client/entry-lifecycle.ts#L20)
- [H13：主题注册与 token 层](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-theme/src/client/index.ts#L348)
- [H14：工具定义注册入口](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/core/tools/src/index.ts#L128)
- [H15：系统提示上下文注册入口](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/core/system-prompt/src/index.ts#L520)

## 3. 已复现的适配遗漏与设计限制

### 3.1 输入框内的引用移除按钮被当成普通按钮

主题位置：`src/styles/prts.css:1545`、`src/styles/refinement.css:384`、`src/styles/stabilization.css:138`；四角反馈目标还包括 `src/client/conversation-control-adapter.js:153` 的泛化 composer button 选择器。

原生引用移除按钮是 16 × 16、圆形、透明背景、继承引用颜色的行内控件。主题当前匹配整个 `[data-composer-card] button`，没有隔离引用节点。

隔离浏览器中使用发布源码的 `QuotePreview.module.css` 和与该组件一致的局部 DOM，比对主题关闭/开启：

| 属性 | 关闭主题 | 开启主题 |
| --- | --- | --- |
| 尺寸 | 16 × 16 | 16 × 16 |
| 背景 | 透明 | `rgb(56, 67, 74)` |
| 圆角 | `50%` | `0px` |
| `::before` | 无 | 新增主题材质层 |

**确认的是样式误覆盖，不是控件变成 32px，也未证明移除操作失效。** 本次局部 fixture 未完整提供宿主颜色 token，因此不以关闭主题时的文字颜色作为颜色正确性的证据。

建议先将引用控件从普通 composer 按钮材质、交互变换、四角目标中隔离，再逐步改用明确的工具栏/操作控件标记，避免每增加一种编辑器节点都追加排除条件。保留原生 `pointerdown` 防止选区丢失的处理。

### 3.2 浮层只识别初始内容，漏掉动态子菜单和后续菜单项

主题位置：`src/client/floating-glass-adapter.js:96`、`src/client/floating-glass-adapter.js:171`；材质去重规则：`src/styles/prts.css:1604`。

现有 observer 仅观察 body 的直接 childList。浮层首次出现后被 WeakSet 记为已分类；其内部后续挂载的菜单项、输入控件、危险项和子菜单不会增量分类。

已复现两种变化：

- JSDOM：已分类菜单内追加 `role="menuitem"` 且 `data-danger="true"` 的按钮，新按钮未获得 item/danger 标记。
- Chromium：先加入原生结构的顶层菜单，待分类后，再按上游 Menu 的结构挂入子菜单。顶层获得 `data-prts-floating-glass="menu"`，子菜单没有获得该标记，其菜单项也没有 item 标记。

使用发布源码 `MenuSurface.module.css` 和模糊 token，实测顶层原生 material 的 `backdrop-filter` 已被去重为 `none`，动态子菜单的 material 仍为 **`blur(40px) saturate(1.5)`**。

这说明 2.7.2 的原生材质去重没有覆盖该动态子菜单路径，可能留下性能负担和风格不一致；**本次没有测量该路径在用户 Edge 真机上的帧率，不能据此断言它是所有卡顿的唯一原因。**

子菜单本身在 rc.5 已存在，并非本次才新增；新版统一菜单使该既有适配边界更值得覆盖。另外，新菜单会等待首次解析完成才显示，不能笼统声称所有首次异步贡献都会漏标；已显示期间的响应式更新仍可能触发本问题。

建议对已接管的浮层建立受限的 subtree 增量观察，只处理新增/替换子树和必要状态；顶层 popup 分类与内部控件分类分开。不要改成每次 body 变更就全页重扫，也不要给每层嵌套菜单叠加重模糊。原生菜单材质去重与保留第三方自定义材质应分别处理。

### 3.3 同一浮层适配器停止后重启，存活节点不能重新分类

主题位置：`src/client/floating-glass-adapter.js:78`、`src/client/floating-glass-adapter.js:151`；调用路径：`src/client/index.js:180` 的禁用清理及后续启用。

同一个 adapter、同一个仍留在 body 中的菜单，实测：

```text
start()       → data-prts-floating-glass = "menu"
dispose()     → data-prts-floating-glass = null
start()       → data-prts-floating-glass = null
```

`clear()` 删除 DOM 标记及 owned 集合，却未清除 classified WeakSet；第二次 scan 会直接跳过旧节点。

这是既有生命周期遗漏，前提是节点在停止期间没有被销毁。重新创建节点或完整卸载后创建新适配器，不等同于同实例重启，不能说所有插件热更新都会失败。

建议将标记与分类缓存作为同一生命周期资源清理，补启动/停止/重启幂等性测试，以及节点移除、重插与第三方样式保留测试。

### 3.4 会话快捷动作整组隐藏（保留的设计限制）

主题位置：`src/client/sidebar-control-adapter.js:109`、`src/styles/prts.css:1023`。

原生会话 rowActions 中，省略号按钮旁的 rowQuickActions 渲染公开 list 插槽 `sidebar.workspaces.session.row.action`。当前内置提供方包括 archive、pin，主题将它们整组隐藏是已有设计，不是刚发现的内置按钮消失 bug。

问题是：这也是其他插件合法注册动作的位置。主题只按“包含 button 的相邻分组”分类，然后统一 `display:none!important`，不能识别是否仅为可从菜单访问的重复内置动作。

在隔离 fixture 中为该位置加入第三方按钮，实测分组被标记为 `data-prts-session-quick-actions`，计算样式为 `display:none`，按钮无可见几何区域。

**这是构造扩展场景复现，不代表已经找到用户当前安装的某个第三方插件丢失按钮。** 它也不是新增 `sidebar.session.row.trailing` 插槽的问题，二者位置不同。

用户已明确：快捷操作因展示方案尚未确定，继续整组暂时隐藏，包括同组第三方动作。首次修复中恢复显示的改动已撤回，保留原有省略号菜单入口，但不能承诺所有第三方独有动作都在菜单里有替代入口。将来确定展示方案后，再考虑可靠的提供方身份、插槽边界、窄栏布局和键盘访问，不靠按钮文字或图标猜测。

## 4. 已支持或未证实有问题的部分

- **新版主面板包裹层**：当前区域解析覆盖默认结构；日/夜模式、1440/390 宽度的 4 项现有布局与抽屉浏览器回归通过。不能因为新增一层就继续认定主栏适配失效。
- **右键和键盘菜单的 owner 状态**：原生 row 的 `menuOpen` 来自统一菜单 active 状态；主题同时识别菜单按钮 aria-expanded 和 row 的 menuOpen class。会话按钮即使不带 aria-expanded，也有 row class 路径。没有依据说主题只支持点击省略号打开菜单。
- **工具与系统提示注册**：发布源码仍提供 `tools.register`、`ToolRunContext.agent/signal`、`systemPrompt.context`，以及会话 `snapshotEvents`/`requestHeader`。没有发现主题所用入口必须迁移的直接证据；本轮未调用真实模型验证完整 AI 素材工具链，不能把源码核对说成端到端验收。
- **富文本编辑器**：旧支持线已采用相应编辑器，不能将它整体算作新的输入框结构迁移。
- **移动端软键盘**：源码中的 visualViewport 处理重点在浮层定位；没有证据证明主题覆写了本次新增的主框架键盘高度逻辑。仍需移动设备实测，不据猜测列为已确认 bug。
- **Forge/worktree/PR 与定时任务标记**：应补 trailing、多状态、置顶、当前会话、窄栏组合回归；目前没有复现这些标记必然被主题破坏。原生 resting 区本来也有 hover/menu 状态显隐规则。

## 5. 更优的适配方式与实施顺序

### 第一阶段：修补确定的边界，不重写主题

1. 隔离引用节点，保护原生行内控件及其选区事件。
2. 修正浮层缓存清理和重启；补局部动态内容分类，使子菜单材质规则也能覆盖，但不增加多层重复滤镜。
3. 会话快捷操作继续整组暂时隐藏；展示方案确定前，不恢复内置或同组扩展按钮，不引入多按钮占位或局部滚动逻辑。

以上可以围绕现有 adapter 修复，不需要放弃已支持的旧版，也没有必要仅凭这次审计缩小 README 的兼容范围。是否继续声明支持，仍以修改后的旧版回归结果为准。

### 第二阶段：降低适配耦合，按收益逐步迁移

- **原生可观察状态优先、DOM fallback 兜底**：可选接入 `contextMenus.active`，由目标变化驱动侧栏菜单相关状态；旧版本保留 DOM 路径。不要为使用新 API 而重写所有菜单，也不要省略订阅清理。
- **token 管公共配色，主题 CSS 管独特造型**：评估使用 `theme.overrideTokens` 扩展语义色覆盖，让新原生组件自然继承合适的颜色；不要一次替换所有 token 或移除切角、侧脊等主题表现。按服务能力检测并保留旧路径；返回的 disposer 纳入禁用和卸载清理。注册独立 ThemeDefinition 或替换图标不是解决本轮问题的前提。
- **稳定 data 属性和 slot 边界优先**：现有部分权限、预设等识别仍依赖 CSS Modules 的特定 hash 前缀。hash 不一定每次构建都变，但路径和组件重构会增加耦合风险。没有稳定语义标记时应承认 fallback 边界，不能靠 aria-label 的中英文文案补齐所有新语言。
- **主栏定位按布局关系解析**：当前实现能处理新版默认包裹层，但只对有限层级作推断。可考虑先找公共 frame，再确定 slot 所属的完整列，对其他插件额外包装更稳；这是组合结构风险，不是已经复现的原生默认布局故障。
- **保留原生定位和正文结构**：不重复接管已处理 visualViewport 的菜单定位；不重挂引用/正文节点；不把浮动终端和文档预览统一当成 popup 菜单。

## 6. 首次审计验证范围与待补矩阵（修复前）

实际执行：

- `node --test tests/rc7-adapter.test.mjs tests/floating-glass-adapter.test.mjs`：9 项通过。现有通过结果没有覆盖上述新增探针发现的边界。
- `PRTS_FIXTURE_PORT=4175 npx playwright test tests/e2e/rc022-layout.spec.mjs --reporter=line`：4 项通过。
- 本地临时探针使用 JSDOM 和 Chromium，复现第 3 节三类适配问题及快捷操作隐藏边界；引用与嵌套菜单使用发布源码 CSS 加忠实局部 DOM，不是完整原生 React 集成运行。
- 探针脚本与完整结果分别位于本机临时目录 `/tmp/prts-harness-audit-probe-20261106.mjs`、`/tmp/prts-harness-audit-results-20261106.json`；它们不是仓库持久测试，后续修复应转成正式回归。

没有执行：完整 424 项检查和全部 e2e 重跑、真实模型请求、生产会话修改、Edge GPU 真机性能录制、桌面端/macOS backing 验收、移动设备软键盘验收。本轮不以旧任务的测试结果替代本次实测。

建议后续至少增加：

- 引用插入/移除、长引用预览、发送中只读、发送失败保留草稿/引用/附件，覆盖两种会话样式和日夜模式。
- 同一菜单内动态更新、悬停和键盘打开子菜单、菜单关闭/重开、主题开关、插件完整热卸载重建；分别验证原生与第三方自定义材质。
- 原生右键、Shift+F10、ContextMenu 键、子菜单焦点返回和危险操作视觉提示；验证事件未被主题拦截。
- 第三方 row.action、trailing、置顶/当前/归档/定时任务/worktree 状态与窄侧栏组合。
- 折叠后全部/最终回复、进行中/已完成/失败工具结果，以及右侧浮动终端和文档预览。
- 旧支持版本的能力降级，和用户 Edge 环境中菜单打开时的侧脊动画录制。


## 7. 第一阶段修复跟进

### 已处理

- **引用控件隔离**：输入区通用按钮样式、发送/首页按钮规则及四角标记跳过引用和引用预览内部控件。移除按钮保留原生 16×16 圆形样式、选区事件与焦点行为，不移动引用节点、不接管草稿逻辑。
- **动态浮层与生命周期**：body 仍仅观察直接子节点；只对识别的浮层/portal 建局部观察，增量分类动态子菜单、内部项目与输入控件，覆盖空 portal 后填充、隐藏后显示、危险状态变化、移除重插及同实例停用再启用。清理分类缓存、标记和局部观察器，跳过主题逐帧四角装饰，不改为全应用 subtree 扫描。
- **原生子菜单材质去重**：动态子菜单不再遗留额外的宿主背景模糊。嵌套菜单使用不透明主题面板、无背景模糊；顶层菜单玻璃设置不变。原生材质壳内的内容列表不再套第二层 popup 卡片，第三方完整自定义材质及显式 opt-out 保持原样。
- **会话快捷操作策略**：按用户已确定的设计继续整组暂时隐藏。撤回此前恢复显示、按钮计数、窄栏多按钮布局和焦点滚动改动，保留原有省略号菜单入口；同组第三方动作暂不单独恢复，等待展示方案。

保留现有侧脊 220ms 动画、输入框原生 5px 模糊及配置格式；没有新增运行依赖、改版本号或重新启用“PRTS 跟随光标（实验）”。DSH 支持范围保持 README 原声明，未增加桌面端验收声明。第二阶段的 contextMenus.active / theme.overrideTokens 架构迁移未包含在本次修复中。

### 修复后实际验证

- 快捷操作策略纠正后重新运行 `npm run check`：435 项通过，无失败或跳过。
- 相关 Chromium 浏览器回归重新执行：89 项全部通过。兼容边界用例共 14 项，包含引用 4 项、动态菜单 2 项、快捷操作继续隐藏而菜单保持可访问的 8 项；隐藏策略覆盖日夜、148/287px 侧栏、置顶/未置顶及同组扩展动作。
- 这 89 项为相关专项，不是全仓库浏览器用例或全部截图基线重跑。引用、动态菜单与扩展按钮使用忠实局部 DOM/CSS fixture，不等同于完整原生 React 富文本集成或真实第三方插件验收。
- 未执行真实模型请求、完整引用发送/失败草稿链路、生产会话归档/置顶/删除、Edge GPU 真机性能录制、官方桌面客户端或移动设备软键盘验收；第 6 节其余待补矩阵继续有效。

### 本地部署与只读复核

- 已部署纠正后的未发布构建到本地 DSH `0.2.2-rc.1`，仅更新主题依赖，无关依赖图不变，保留回滚备份。容器重启后为 `running healthy`。
- 已安装 `lib/client.js` 与工作区构建 SHA-256 一致（`9c5d5ab1340f0dc25d4a028bc8bb74d40239e88f51f271084efd815cfd75c984`），浏览器实际收到的脚本包含完整当前客户端构建，主题正常挂载、无页面错误。
- 真实会话卡片悬停及菜单按钮获得焦点时，两个原生快捷按钮所在分组均保持隐藏；省略号菜单可打开、关闭，内层材质无重复模糊，无页面错误。未执行归档、置顶、删除或模型请求。
- 真实 Web 宽屏主栏/主题设置及 390px 抽屉的 2 项只读回归重新执行并通过，不等同于官方桌面客户端或移动设备实机验收。
- `git diff --check` 通过。该阶段验证完成时未修改版本号、提交、推送或公开发布；随后按用户指令提交为 `1a56f56`。


## 8. 用户消息正文主题漏匹配修复

### 原因与改动

- 本地 DSH `0.2.2-rc.1` 的真实用户正文使用 `data-message-bubble`，气泡类名形如 `_bubble_1sgyj_1`；主题此前依赖 `[class$="_bubble"]`，无法匹配。消息本身存在，但未套用经典/Baker 用户气泡样式。这是源码审计后根据用户反馈补充确认的遗漏。
- 使用原生 `data-message-bubble` 语义标记，并保留旧版类名后缀兜底，避免绑定新的构建 hash。不改正文内容、宿主渲染器、节点位置或消息发送逻辑。
- 同步覆盖经典边框和切角、Baker 气泡/尾部/窄屏规则、代码和表格、文件引用、完整/分区正文背景下的气泡材质，以及用户正文文字光标命中识别。不恢复实验光标或会话快捷操作。

### 验证范围

- 修复前在真实页面只读确认 4 个用户气泡均不匹配旧选择器，保留原生 20px 圆角和原生底色；新增回归也先在修复前构建复现主题样式漏匹配。
- `npm run check`：436 项通过，无失败或跳过；新增 CSS 合同要求所有旧气泡类名兜底规则同时覆盖语义标记。
- 选取的相关 Chromium 浏览器回归 26 项通过：用户消息语义标记 8 项、发送回显 4 项、光标覆盖 8 项、背景区域 2 项、正文背景与右栏布局 4 项。新增 8 项覆盖经典/Baker × 日夜 × 1440/600px，比较旧结构、新 hash/附加类、完全更名类和临时回显，分别检查无背景、完整背景、分区正文背景；包含气泡形状、材质、代码/表格和文件引用，不将主题套到正文外的普通标记节点。
- 两项旧用例仍假定实验光标可启用：背景保护区光标应为 none、光标选择应有 3 项。均在本次修改前的 `1a56f56` 构建独立复现相同失败；不为使旧断言通过而重新启用实验光标，不宣称全仓库浏览器用例全部通过。
- 没有发送真实模型请求，fixture 的临时回显验证不等同于完整消息发送链路；未进行 Edge GPU、官方桌面客户端或移动设备实机验收。

### 本地部署复核

- 已将用户消息修复构建部署到本地 DSH，容器重启后健康，无关依赖图不变，保留回滚备份。已安装客户端与工作区 SHA-256 一致（`6707feeba8fa159cacf71d8ef814a7f4b785fc8ee77c9b95a58ac0414deeb12f`），浏览器收到完整当前构建，无页面错误。
- 仅打开已有会话只读检查，4 个真实新版用户气泡均恢复主题：当前为 Baker；另在页面 DOM 中临时切换样式属性验证经典 4px 边框与 Baker 18px 非对称圆角，随后还原，未保存设置、未改消息、未发模型请求。这是实际 DOM/CSS 验证，不是完整切换设置或发送链路验收。
- 兼容性修复提交为 `1a56f56`；本节用户消息修复仍为未提交改动，未推送或发布。
