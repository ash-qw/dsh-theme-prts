# 移动端状态栏与安全区域

## 当前状态：暂停排查（2026-11-23）

- 按用户要求暂停，不继续修改或要求真机对比。保存分支：`codex/mobile-status-bar-investigation`，基于 `main` 的 `a1c9ccb`；没有作为修复合并到 main，也不发布版本。
- **问题未解决，具体根因未确认。** 普通 Safari 的正常 DSH 界面，时间／电量周围仍黑；主屏幕启动的最终表现也未完成验收。元数据、网页像素与自动化引擎通过，不能当作 iPhone 系统栏修复证据。
- 可重复的真机成功条件：完整重置 HTML／body 后为蓝色；在同样条件下恢复 `#root` 应用仍蓝；直接加载这一蓝色配置、不点按钮也蓝。此时壁纸关闭，其余 body 绘制层隐藏，不能据此认定应用本身、某个插件或加载顺序是原因。
- 最近失败的完整候选同时恢复了灰色、壁纸和外置层，仍黑，因此不能单独归因于其中某项。最后仅替换蓝色为实际壁纸顶部灰色 `#5b5d5f` 的对比已部署，**尚未收到真机结果**，没有将其记作成功或失败。
- 当前源码保留安全区布局、壁纸裁切／取色、可恢复元数据、服务端初始声明、URL 限定的 replay／只读采样及相应测试。失败的固定色带和完整 layout 候选已撤回；历史条件与撤回过程见下文。
- 暂停归档前重新验证：构建、71 项相关检查通过（移动元数据、只读采样、启动声明、打包、输入框生命周期及 CSS 约束）；Chromium／WebKit 的蓝／灰对比、恢复与普通入口检查通过。最近一次全量检查为 696／697，通过后另有侧栏时序失败单独复核通过，不能记作全量全绿。下文早期“最终”仅指当轮结果。
- 暂停时本地 DSH 保留上一轮安装快照，不进行新的部署或回滚。客户端 SHA-256：`625e3d35db039c2bacb018ab25ceb1768eafb6966cb78c6b672ab19f9fa76da0`。用户原始备份 `src/styles/refinement.css.orig` 保持原样，不纳入本次源码提交。
- 归档前检查日志：`/tmp/prts-mobile-pause-build.log`、`/tmp/prts-mobile-pause-unit.log`；本次没有复跑全量单元测试或要求设备对比。
- 恢复排查时先从此分支继续。最后灰色对比的查询参数为 `?prts-mobile-inspect=replay&prts-chrome-probe=1&prts-chrome-start=app&prts-chrome-tint=gray`；移除最后一项得到已成功的蓝色对照。不要再次同时恢复壁纸与外置层；需要分别验证。部分临时脚本和历史源码只保存在 `/tmp`，并非仓库可复现资产；当前对比实现和已加入仓库的测试一同保存在本分支。

> 这是逐轮排查记录，早期方案部分已被后续方案替代。用户设备为 iOS 27.3，普通 Safari 的普通／无痕模式均有黑边。第八轮核对实际访问日志后发现最初 A／B／C／D 链接被追加到首页查询参数中，用户没有进入这四个对比页，因此第六、七轮根据变体反馈作出的因果判断作废。第九、十轮用户通过正确入口重新确认：蓝色基准及 A／B／C／D 的系统栏均为蓝色。已撤回第七轮额外根滚动余量与取消启动声明的改动，实际 DSH 页面黑边原因仍待查。元数据、像素和模拟安全区检查不能证明 iOS 系统栏已经修复。

## 修改范围

- 宿主原有 viewport 未声明 `viewport-fit=cover`，也没有 iOS 独立窗口状态栏样式。主题现在保留原 viewport 指令并启用安全区域扩展，深色使用 `black-translucent`，浅色使用 `default` 保留系统深色状态文字；浏览器栏颜色跟随主题画布。
- 不覆盖宿主的 theme-color 节点；主题维护前置的自有节点，停用或卸载时删除。已存在的 viewport、Apple 状态栏元数据按原值恢复，第三方后续修改的值不回写旧快照。
- 页面背景延伸到安全区域，内容、侧栏及导航入口避开顶部、底部和横屏两侧。背景关闭时使用主题底色；全屏背景覆盖整个 body；触屏分区模式使用 body 上的一张会话背景，避免顶部背景被框架边界截断。分区图片的保护区域同时按整张视口计算。
- 没有修改版本号、依赖、DSH 支持范围或用户持久化设置。

## 验证

- 最终 `npm run check`：构建及 685 项单元测试全部通过，0 失败、0 跳过。
- 最终浏览器回归 15 项通过：深浅色 × 竖屏／横屏／桌面，三种背景模式，既有背景保护、侧栏伸缩、右侧文件区透底，以及完整主题切换回归。
- 浏览器没有 iPhone 的真实安全区域；测试在 CSS `env()` 对应变量处模拟竖屏顶部 59px／底部 34px、横屏左右 47px／底部 21px。没有将这些结果写作 iOS 真机验收。
- 新增 3 项生命周期测试覆盖深浅色同步、停用／重启、已有元数据的保留和外部修改；更新既有 CSS 尺寸约束，并为新增移动端代码增加 4 KiB 构建配额。客户端比原构建增加 2,829 字节，最终为 1,436,669 字节。
- 初次回归发现旧 CSS 字符串约束及构建配额需同步更新；既有输入框替换测试的 24ms 固定等待也在负载下失效，改为等待渲染帧后，最终完整检查通过。
- 日志：`/tmp/prts-mobile-check-passed.log`、`/tmp/prts-mobile-browser-final.log`。

## 本地部署

- 部署前备份：容器 `/data/backups/prts-before-mobile-viewport-1795280499.tgz`，同名 JSON 记录新增文件，支持恢复。
- 通过宿主机绑定目录原子替换客户端构建、三个客户端源文件和两份样式文件，保留原权限和所有权；六个安装文件均与当前工作区逐字节一致。
- 客户端 SHA-256：`e87676c92a9ecb982891eda5cbf84e6bdd23cfeec19c9ea891d009554a5c9b28`。
- 服务重启后为 `running healthy`，重启计数为 0。
- 直接加载已安装客户端的深浅色两项宿主回归通过，确认浏览器收到完整当前构建，实际分区背景衔接及模拟横竖屏安全区域正常，页面异常为 0。没有注入候选构建；配置描述仅在测试浏览器中覆盖并设为只读，阻止设置、模型请求、命令及宿主启动时的草稿会话创建，没有持久化写入。日志：`/tmp/prts-mobile-installed-final.log`。首次宿主用例将已经拦截的自动草稿创建也计为意外写入，修正统计口径、保留请求拦截后，两项完整重跑通过。

## iOS 验证边界

- 独立窗口状态栏样式由 iOS 在启动阶段决定，已有主屏幕窗口可能需要完全退出后重开；不同 iOS 版本对运行时元数据变化的处理仍需真机确认。
- 当前环境只能验证页面元数据、背景衔接和安全区域布局，无法渲染或验收 iOS 系统状态栏；浅色保留原生状态栏策略，不强制使用白色状态文字。

## 第二轮：主屏幕启动声明

用户确认通过「添加到主屏幕」图标打开。上一轮缺少 `apple-mobile-web-app-capable=yes`，也没有在初始 HTML 中声明状态栏模式。[Apple 文档](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html) 明确说明，没有 Apple 全屏声明时，`apple-mobile-web-app-status-bar-style` 不起作用。

- 使用宿主公开的 `webServer.tapIndex()` 修改返回的启动 HTML，保留原 viewport 指令并加入 `viewport-fit=cover`，同时直接声明 Apple 全屏与 `black-translucent` 状态栏。没有修改宿主文件、拦截根路由或绕过认证。
- 每次请求读取主题的实时启用状态，停用时不转换 HTML，卸载时移除钩子。忽略脚本、样式和注释中的示例 meta 标记。
- 客户端接管服务端声明的所有权，停用或安全模式首次启动时可恢复原 viewport 与状态栏元数据，并删除主题新增声明。
- 深浅色保持同一种启动布局，不再运行后切换 Apple 状态栏模式。透明状态栏文字为白色，浅色只为顶部安全区域增加透明暗色渐变，不在桌面或零安全区域绘制遮罩。此项替代第一轮的浅色 `default` 策略。
- 本轮构建与完整单元测试 689 项通过；后补的安全模式恢复与生命周期等 8 项专项全部通过。浏览器回归 15 项通过。
- 安装后直接验证 3 项宿主用例通过：深浅色实际客户端，以及完全禁用 JavaScript 的启动页。后者确认 viewport、Apple 全屏和透明状态栏声明在脚本执行前已经存在，没有将这项检查写作 iOS 真机验收。日志：`/tmp/prts-mobile-boot-check.log`、`/tmp/prts-mobile-boot-lifecycle.log`、`/tmp/prts-mobile-boot-browser.log`、`/tmp/prts-mobile-boot-installed.log`。
- 部署前备份：容器 `/data/backups/prts-before-mobile-startup-1795281449.tgz`。更新入口、启动 HTML 转换、客户端及相关样式，共 8 个文件；客户端 1,437,581 字节，SHA-256 为 `9eab6061dc66f376405b51f4f170dab75116b011c2e9443395a7893cf46828c2`。原 4 KiB 移动端配额仍满足。
- 重启后服务为 `running healthy`，重启计数 0。主屏幕旧入口可能保留安装时的启动设置，必要时需由用户通过 Safari 重新添加；当前环境无法代替用户执行 iPhone 的系统操作。

## 第三轮：普通 Safari 的壁纸颜色

用户补充普通 Safari 也有黑边。这暴露出前两轮检查只验证了主题底色和启动声明：代码始终给 `theme-color` 和 HTML 根背景使用 `#080a0c`，与截图中灰色的壁纸顶部不同。Apple 全屏声明仅针对独立窗口，不能解决普通 Safari 的浏览器配色。

- 浏览器颜色改为当前 body 壁纸顶部的平均颜色，并合成用户配置的主题淡化遮罩。HTML 根背景使用相同颜色，覆盖浏览器根据页面背景自动选色的路径。
- 按实际 `cover` 裁切、背景位置及保护区域计算顶部图片内容；横竖屏、壁纸替换、模式和淡化变化时同步更新。桌面分区没有把壁纸画在 body 上时仍使用主题底色。
- 只在输入变化时读取 32×1 的小像素缓冲区，图片复用浏览器缓存。监听仅限根节点，过滤光标和过渡变量，颜色回写不触发重复取样。图片读取失败回退主题底色；停用时移除监听、取消等待任务并清理颜色。
- 增加深浅色壁纸裁切、保护位置、淡化、模式切换和加载失败回归，以及图片延迟加载后不得恢复已停用主题的生命周期检查。安装回归增加实际截图顶部像素与声明颜色的对比。
- 保留第二轮独立窗口启动和安全区处理。普通 Safari 和主屏幕窗口仍使用不同的系统栏机制；本次修正没有将网页回归写作 iPhone 系统栏真机验收。
- 公网 `https://dsh.ashair.cn:2439/` 在当前自动化访问中返回前置访问网关登录页，不能用本地 DSH 的登录状态直接验证公网登录后的页面；部署及构建一致性检查针对本地 DSH。
- 最终 `npm run check`：构建及 691 项单元测试通过，0 失败、0 跳过。初次完整检查发现无动画帧接口的宿主兼容问题，补上定时器回退后，生命周期与设置专项 26 项通过；初次检查中的侧栏时序失败在最终完整重跑中未复现，没有修改该侧栏测试或生产逻辑。
- 最终浏览器及安装回归 20 项通过，包括 3 项实际宿主检查和 17 项背景、移动端及主题切换检查。深色实际页面的顶部 4px 截图平均像素与声明的浏览器颜色比较，每通道误差小于 3；确认声明匹配实际壁纸，而非只断言存在一个固定深色值。日志：`/tmp/prts-mobile-color-check-final.log`、`/tmp/prts-mobile-color-lifecycle.log`、`/tmp/prts-mobile-color-installed.log`。
- 部署前备份：容器 `/data/backups/prts-before-mobile-chrome-1795282347.tgz`。8 个安装文件与工作区逐字节一致，浏览器收到完整当前构建；客户端 1,441,059 字节，SHA-256 为 `284c72f448cbd2ea664bd3c01c467d293b4073707afde1671370a219b13ef6cf`。移动端构建配额从 4 KiB 调整为 6 KiB，以容纳顶部取色和监听清理逻辑。
- 服务重启后 `running healthy`，重启计数 0。没有提交、推送或发布版本；保留用户的 `src/styles/refinement.css.orig` 备份。

## 第四轮：先验证真机系统栏是否采用颜色

- 用户确认 iOS 27.3，普通 Safari 的普通／无痕模式均未改善。没有把上一轮绿色测试当作修复成功。
- 只读检查 Nginx 与访问网关代码，确认公网域名经 3081 网关转到同一 DSH；网关没有给应用增加 iframe 或重写 HTML。访问日志能看到该 iPhone 的页面和插件请求。
- 安装 WebKit 测试引擎及其运行依赖后检查已部署页面，稳定阶段实际读到 `theme-color` 和 HTML 背景 `rgb(91, 93, 95)`，而 body 的 `background-color` 为透明，宿主原有第二条 theme-color 仍是旧深色值。没有据此断言 Safari 系统 UI 采用了同一种颜色。
- WebKit 原有移动端回归 11 项中 5 项通过、6 项失败；包含异步加载超时、亚像素精度及模拟安全区布局差异，尚未把这组结果写作 Safari 验收。日志：`/tmp/prts-mobile-webkit-before.log`；独立页面探查：`/tmp/prts-webkit-probe.log`。通过代理只读核对 WebKit 的 `Document::determineActiveThemeColorMetaElement()` 源码，确认它按顺序选择有效且媒体匹配的节点，暂不盲目改动重复节点。
- 新增 `/prts-theme-api/mobile-check` 同域对比页：蓝色初始声明、灰色初始声明、灰色自动取色三种模式。HTML／body 使用同色背景，初始声明直接存在于响应中，无应用脚本，也不修改设置。沿用现有 API 的 `connection.admit()`，前置访问网关照常认证；本地回环是否需要会话由宿主策略决定。
- 16 项启动声明、对比页、认证分支及打包检查通过；安装后的 WebKit 对比页检查通过，三种模式的 HTML／body 颜色、元数据和无脚本条件均成立。
- 部署前备份：容器 `/data/backups/prts-before-mobile-check-1795284573.tgz`。9 个安装文件与工作区一致，客户端构建未改变；服务 `running healthy`，重启计数 0。等待用户在实际 Safari 中观察对比页系统栏，再确定下一步修复。


## 第五轮：与成功对比页对齐 body 实色背景

- 用户确认蓝色对比页的时间、电量区域会跟着变蓝，证明该设备和域名可以让 Safari 系统栏采用页面颜色；问题收敛到真实应用与静态页的差异，没有再次将其归因为无痕模式或设备不支持。
- 已安装 DSH 在稳定状态下，HTML 与主题自有 theme-color 为壁纸灰色，但 body 的 background-color 仍透明。壁纸规则中的 background 简写清除了 body 原有底色；此前只修正 HTML 根背景，未覆盖这个差异。
- body 现在同样使用壁纸顶部取样颜色，并在全屏与触屏分区壁纸的 background 简写中保留该实色。图片下方增加独立的主题画布层，避免透明 PNG 因 Safari 底色变化而改变合成结果；取样时使用壁纸所在第二层的位置，忽略新增底层的位置。
- 没有修改根页面滚动模型、持久化设置、版本或支持范围；也没有基于重复 theme-color 尚未证实的推测更改宿主节点。
- Chromium 与 WebKit 的移动端检查各 8 项通过，覆盖深浅色、横竖屏、壁纸裁切、淡化、模式切换及加载失败。新增 body 与 HTML／theme-color 同色检查，以及透明 PNG 在真实安全区截图中的像素检查。WebKit 的 Canvas 透明合成会产生 1 级通道取整差异，测试按该精度比较；几何断言允许 0.05px 亚像素差异。日志：`/tmp/prts-mobile-body-chromium.log`、`/tmp/prts-mobile-body-webkit-final.log`。
- 构建通过。完整单元测试首次 693 项中 689 项通过、4 项因上一轮增加对比页后旧接口数量仍为 3 而失败；修正为包含对比页的 4 个接口，并补充对比页的 Cordis 生命周期检查后，相关 10 项全部通过。对比页在注册时捕获 connection，停用后的旧处理器返回 503，不再读取失活上下文。没有将首次完整检查记为通过。日志：`/tmp/prts-mobile-body-check.log`、`/tmp/prts-mobile-body-lifecycle.log`。
- 壁纸及主题切换的 9 项既有浏览器回归通过；保护区域编辑的 3 项在并行负载下触及 30 秒用例上限，另以独立输出目录和 60 秒上限复核，3 项全部通过（全屏 24.3 秒、侧栏 19.0 秒、会话 20.5 秒）。首次并行运行还暴露 Playwright 共用产物目录会丢失跟踪文件，后续运行已隔离输出目录，没有修改产品逻辑规避这些问题。
- 客户端比上一轮增加 343 字节至 1,441,402 字节，移动端构建配额从 6 KiB 调整为 6.5 KiB，容纳额外背景层和 body 实色声明。SHA-256：`2145da220263ca7bce3d0726b4949760f7493c623db8437c5ebab54d8783a54d`。

- 第一遍安装检查：Chromium 4 项通过（含完整客户端匹配、深浅色、初始 HTML 和对比页）；WebKit 的初始 HTML 和对比页通过，深色安全区布局及浅色 ResizeObserver 提示导致其余 2 项未通过，没有忽略页面错误。安全区注入顶部 59px 时测量值尚为 0，会令框架底部变为 869px，而不是 810px。
- CSS 增加独立兜底：框架高度、固定导航顶部使用宿主测量与 `--prts-safe-top` 两者较大值，避免安全区域先于异步测量生效时出现内容超高。新增同步清空宿主测量值后的布局检查。Chromium／WebKit 横竖屏与桌面各 6 项通过；更新后 28 项 CSS 契约通过，其他打包及接口生命周期专项 19 项通过。
- 两次本地部署前备份分别为容器 `/data/backups/prts-before-mobile-body-1795285624.tgz`、`/data/backups/prts-before-mobile-body-1795285791.tgz`。最终 9 个安装文件与工作区逐字节一致。启动阶段宿主曾发生 `socket hang up / ECONNRESET` 自动重启一次，需以最终健康检查为准，不将手动重启命令成功当作服务已经就绪。

- 安全区兜底最终安装检查：Chromium 深浅色 2 项通过；WebKit 浅色通过，深色截图时启动遮罩尚未退出而读到黑色。跟踪截图明确为启动动画，补充等待 `[data-prts-startup]` 退出后，WebKit 深色专项通过（21.9 秒）。日志：`/tmp/prts-mobile-safe-live-chromium.log`、`/tmp/prts-mobile-safe-live-webkit.log`、`/tmp/prts-mobile-safe-live-webkit-dark.log`。最终服务 healthy，重启计数 1，稳定阶段未再增加。
- **真机结果：用户仍反馈顶部黑色。body 实色修正没有解决用户问题。** 自动化的样式、像素和布局检查不能取代 Safari 系统栏验证，不将本轮记为问题已解决。

## 第六轮：保持蓝色不变，分别隔离应用条件

- 停止继续猜测修改真实页面。沿用用户已经确认顶部可以变蓝的同域页面，新增独立 `variant` 参数：`locked` 仅将 HTML／body 设为 100dvh 且禁止整页滚动；`apple` 仅增加 capable=yes 与 black-translucent 声明；`dark` 仅将 color-scheme 改为 dark；`runtime` 初始为黑色，500ms 后同步 HTML、body 与 theme-color 为蓝色。
- 各变体互不组合，保持同一蓝色、内容及认证策略。只有 runtime 变体含一个固定脚本，其余变体仍无脚本、无持久化写入。未知参数不回显到 HTML。
- 11 项接口和生命周期专项通过。仅部署服务端对比页文件，备份为容器 `/data/backups/prts-before-mobile-variants-1795286061.tgz`；客户端构建不变。安装后的 WebKit 2 项检查通过，覆盖基准三种颜色和四个独立变体，确认布局、元数据与动态变色实际生效。日志：`/tmp/prts-mobile-variant-live.log`。最终服务 running healthy，重启计数 1，9 个安装文件与工作区一致。已请用户对比固定布局／Apple 声明两页的真实顶部颜色，等待观察结果。

## 第七轮：解除普通 Safari 的滚动锁定与 Apple 全屏声明

- 用户确认 A（`variant=locked`）、B（`variant=apple`）顶部均为黑色，而基准蓝色页顶部会变蓝。这支持分别排除这两项条件，尚不能据此证明真实 DSH 页面已修复。
- 服务端启动 HTML 只补充 `viewport-fit=cover`，不再注入 Apple 全屏／黑色状态栏声明；保留宿主原有的 Apple 元数据。客户端仅在已处于独立窗口时设置 Apple 声明，普通 Safari 会移除旧构建中由主题创建的声明。此项运行时设置不能保证主屏幕入口安装时的系统行为，主屏幕场景仍待确认。
- 触屏设备的 HTML／body 恢复可滚动，最小高度为 `100dvh + 1px`，应用框架仍按视口与安全区布局。仅保留 1px 根页面滚动余量；桌面规则不变。浅色顶部暗色渐变仅用于独立窗口。
- Chromium、WebKit 移动端各 8 项通过，覆盖安全区、横竖屏、1px 根滚动余量及壁纸合成；既有壁纸和主题切换 9 项回归通过。WebKit 测试引擎为 26.0，不含用户 iOS 27.3 的系统界面。
- 初次 48 项专项中 46 项通过，2 项仅因新增代码超出旧构建预算失败；CSS 总预算调整为 324,000 字节，移动端增量预算由 6.5 KiB 调整为 7 KiB，随后执行完整检查。日志：`/tmp/prts-mobile-unlock-check.log`、`/tmp/prts-mobile-unlock-chromium.log`、`/tmp/prts-mobile-unlock-webkit.log`、`/tmp/prts-mobile-unlock-regression.log`。
- 最终 `npm run check` 构建及 697 项单元测试全部通过，0 失败、0 跳过。客户端为 1,441,884 字节，SHA-256 为 `f67ccb682d8979a2c024edf14e577879ee692ba59f1ad188c64c47a20130c76f`。
- 本地部署前备份为容器 `/data/backups/prts-before-mobile-unlock-1795286713.tgz`；9 个安装文件与当前工作区逐字节一致。部署后第一次健康检查为 running healthy，重启计数 0；此前部署曾发生启动连接重置，仍需以本轮后续稳定检查为准。
- 首次安装检查的两种引擎均在 Apple 元数据数量断言处失败：选择器误包含宿主原有 `apple-mobile-web-app-title=DSH`。读取实际初始响应确认仅保留名称声明，并没有 capable／status-bar-style；收窄检查为这两个控制声明后重新验证，未修改产品以删除宿主标题。
- 修正后的 Chromium 安装检查 3 项全部通过；WebKit 初始 HTML、浅色 2 项通过，深色的布局／壁纸／构建检查完成后，最终页面错误断言捕获一次 `ResizeObserver loop completed with undelivered notifications.` 而失败，未过滤这条错误。日志：`/tmp/prts-mobile-unlock-live-chromium-final.log`、`/tmp/prts-mobile-unlock-live-webkit-final.log`。
- **真机结果：用户确认本轮普通 Safari 仍然黑色，问题未解决。** 已请求继续比较现有 `dark`、`runtime` 两个独立蓝色变体，分别验证深色声明和运行时换色，不追加未经对比支持的绘制补丁。
- WebKit 深色单独复核通过（21.1 秒），未再出现 ResizeObserver 提示；该提示在首次运行确实发生，保留失败记录，不据单次复核判断其根因。日志：`/tmp/prts-mobile-unlock-live-webkit-dark-recheck.log`。最终稳定检查为 running healthy，重启计数 0。未提交、推送或发布版本。

## 第八轮：核对实际路径，纠正无效的变体对比

- 用户反馈 C、D 顶部都黑后，只读核对实际 HTTP 访问日志。02:17:43 的蓝色基准请求确实命中 `/prts-theme-api/mobile-check?mode=blue`，返回 200；02:38:35、02:39:03、02:52:25、02:52:42 的 A／B／C／D 访问实际路径均为 `/`，后续完整 HTTPS 链接被逐次拼接在原有首页查询参数后，分别包含 1、2、4、5 个内嵌链接。没有直接命中相应变体路径。
- 因此 A／B／C／D 的黑色反馈只描述真实应用首页，不能用来推断滚动锁定、Apple 声明、深色模式或动态换色各自的作用。先前没有及时校验实际路径，排查判断有误；第七轮改动在真实首页仍未解决黑边。
- 本地已安装基准及四变体 HTML 与工作区生成结果逐字节相同，均为 200、`cache-control: no-store`；服务 running healthy，重启计数 0。没有把服务响应正常等同于用户进入了该页面。
- 对比页加入「蓝色基准」及 A／B／C／D 同页导航按钮，用户从单个基准入口点击即可切换；保留显式「对比条件」说明。浏览器回归改为点击这些链接并核对最终路径及 variant，避免只验证直接导航。
- 已请求用户在普通 Safari 新建标签重开蓝色基准，核对页面显示「可滚动基准页」和实际顶部颜色；变体真机证据待重新取得。当前不再依据此前无效对比追加真实页面补丁。
- 16 项对比页、启动转换、接口生命周期检查全部通过。仅部署对比页服务端文件，备份为容器 `/data/backups/prts-before-mobile-navigation-1795287298.tgz`；9 个安装文件与工作区一致，客户端仍为 `f67ccb682d8979a2c024edf14e577879ee692ba59f1ad188c64c47a20130c76f`。启动中自动重启一次，最终 running healthy、重启计数 1。日志：`/tmp/prts-mobile-navigation-unit.log`。
- 安装后的 Chromium／WebKit 对比页各 2 项通过，实际点击四个同页按钮后均进入正确的对比路径与独立变体，基准三种颜色及各变体的 DOM／布局条件保持正常。日志：`/tmp/prts-mobile-navigation-chromium.log`、`/tmp/prts-mobile-navigation-webkit.log`。这不包含 iPhone 系统栏验收；真机结果仍待用户重新观察。

## 第九轮：有效复核基准、深色声明与动态变色

- 用户明确更正此前测试，确认蓝色可滚动基准、C（仅深色 color-scheme 声明）、D（黑色启动后动态变蓝）三者的顶部均为蓝色。
- 访问日志确认 02:55:32／02:55:50 命中基准，02:56:02 命中 runtime，02:56:15 命中 dark，均为实际 `/prts-theme-api/mobile-check` 路径、200 响应，无内嵌链接。此轮观察可以作为对应条件的真机证据；不能据此概括所有深色 CSS 或所有动态取色实现。
- 已请求用户直接通过页内按钮复核 A（固定视口）、B（主屏幕声明），取得有效结果后再决定是否保留第七轮基于无效对比引入的滚动和元数据调整。未追加客户端修补或重新部署。

## 第十轮：A／B 也变蓝，撤回无效调整并隔离颜色声明

- 用户重新确认 A、B 的系统栏均为蓝色。至此五个正确访问的页面都可以采用蓝色；不能将根滚动锁定、Apple 声明、深色声明或运行时换色本身视作已证实的黑边原因。
- 恢复原有应用滚动布局，删除触屏 HTML／body 的 `100dvh + 1px` 与 overflow 覆盖。服务端及客户端重新提供主屏幕 capable／black-translucent 启动声明，避免因无效对比损失原主屏幕支持。保留独立窗口专用的浅色顶部遮罩条件，保留统一元数据恢复函数。CSS／客户端预算分别退回 323,500 字节、移动端增量 6.5 KiB。
- WebKit 稳定页面读到主题首条 `theme-color=rgb(90, 92, 95)`，宿主第二条仍为 `rgb(8, 10, 12)`。HTML／body 均为前者，body 实际绘制壁纸。没有将两条声明并存直接认定为原因。
- 新增 E「双重颜色声明」：以已经成功的 D 为基准，仅在 100ms 时追加一条宿主黑色 theme-color，500ms 时仍将首条与 HTML／body 改蓝。保留全部旧变体；已请求用户比较现有灰色基准与 E，分别排查灰色本身和两条声明的影响。
- 构建通过；移动端、服务端、接口、样式及打包专项 59 项通过，恢复旧预算后样式／打包 37 项复核通过。Chromium／WebKit 移动端各 8 项通过。日志：`/tmp/prts-mobile-revert-build.log`、`/tmp/prts-mobile-revert-unit.log`、`/tmp/prts-mobile-revert-budget.log`、`/tmp/prts-mobile-revert-chromium.log`、`/tmp/prts-mobile-revert-webkit.log`。
- 部署前备份为容器 `/data/backups/prts-before-mobile-probe-1795287818.tgz`，9 个安装文件与工作区逐字节一致。客户端 1,441,545 字节，SHA-256 `99be859b2bfe72d9f311ef5e3a141dc0792d17cb9a312fa73dc2a9776d7e28d6`。首次健康检查为 running healthy、重启计数 0，等待安装检查及后续稳定检查。
- 安装后 Chromium／WebKit 各 5 项通过，包含现有对比页、E 的实际双声明、实际深浅色安全区及禁用 JavaScript 的启动声明。日志：`/tmp/prts-mobile-probe-live-chromium.log`、`/tmp/prts-mobile-probe-live-webkit.log`。
- **有效真机反馈：灰色基准顶部灰色，E 顶部蓝色。** 因此灰色本身及这种双重颜色声明并存均不足以复现黑边，未为此改写宿主颜色元数据。

## 第十一轮：在真实 DSH 页面做临时 DOM 对比

- 新增临时 `?prts-chrome-probe=1` 面板，只有明确携带该参数且主题启用时才创建。「蓝色声明」保持壁纸和应用界面，改写主题自己的颜色；「蓝色背景」再移除 body 壁纸并改为纯蓝底；「蓝底无界面」在此基础上隐藏其余 body 子节点；「原页面」恢复原绘制规则，退出链接返回普通首页。
- 比较在真实 DSH 中运行，不再以静态页代替应用上下文。面板不调用设置或其他写入 API；不修改宿主 theme-color 节点。停用主题时移除面板、所有诊断样式及主题自有颜色。隐藏应用时面板保留可操作，方便恢复。
- 临时客户端模块单独放在 `src/client/mobile-chrome-probe.js`，构建增量另加 3 KiB 配额，诊断结束后应移除这项临时代码及配额。普通地址没有面板或诊断样式。
- 构建通过，移动端元数据／对比页／打包 19 项通过，新增生命周期检查确认隐藏页面后停用主题能清理全部样式。Chromium／WebKit 各 1 项对比浏览器回归通过，覆盖三种模式、恢复原壁纸／应用、localStorage 不变和普通入口无面板。日志：`/tmp/prts-mobile-panel-build.log`、`/tmp/prts-mobile-panel-unit.log`、`/tmp/prts-mobile-panel-chromium.log`、`/tmp/prts-mobile-panel-webkit.log`。
- 部署前备份为容器 `/data/backups/prts-before-mobile-panel-1795288252.tgz`。10 个安装文件与当前工作区逐字节一致；客户端 1,444,439 字节，SHA-256 `6d9919d5db4760e11ed926c47850cfd51317ccf6e49f2e844c7b336d01b18947`。首次健康检查 running healthy，重启计数 0。
- 已请用户在实际 iPhone 上依次观察三种模式的顶部颜色。当前没有把任何自动化检查作为系统栏已修复的证据，黑边仍未解决。
- 已安装真实 DSH 的 Chromium、WebKit 各 1 次三模式切换检查通过，均恢复到原 `rgb(90, 92, 95)` 壁纸取色，非预期设置／命令写入 0，页面错误 0。仅在自动化浏览器内将设置表单设为只读、禁止启动动画，并拦截宿主的自动草稿创建；没有注入候选构建或持久化修改设置。截图确认四个按钮和退出链接可见、可操作。日志：`/tmp/prts-mobile-panel-installed-chromium.log`、`/tmp/prts-mobile-panel-installed-webkit.log`。最终服务 running healthy，重启计数 0；没有提交、推送或发布。

## 第十二轮：复核真实页面结果，提前声明主题颜色节点

- 用户确认真实 DSH 临时面板的三个按钮均改变了页面背景／内容，但时间、电量周围始终黑色。访问日志确认 03:14:18 命中 `/?prts-chrome-probe=1`，200 响应。这轮不是静态对比页观察；纯蓝 HTML／body 和隐藏界面均不足以解决问题。
- 只读检查实际首页响应，发现它没有初始 theme-color；主题客户端在启动后创建该节点。成功的 D／E 动态对比则从 HTML 解析阶段就存在首条颜色节点。两者尚未覆盖的差异是「更新解析时存在的节点」与「动态创建节点」，而不是颜色是否动态变化。这个差异目前是候选原因，尚未得到真机证实。
- 服务端 HTML 转换现在在应用脚本之前提供主题自有 `meta[data-prts-browser-chrome]`，初始色与成功的 D 页一致为 `#080a0c`；客户端复用该节点更新壁纸颜色。宿主自己的颜色声明保持原样，重复转换不增加节点，停用主题及安全模式均清理主题节点。临时对比面板暂留，以便候选失败时继续隔离。
- 构建及 25 项启动元数据／清理／对比页／打包检查通过。新增检查覆盖解析节点在深浅色切换中保持同一 DOM 身份、宿主声明保持原值、禁用后主题节点清理和 HTML 转换幂等性。
- 部署前备份：容器 `/data/backups/prts-before-mobile-parsed-meta-1795288729.tgz`。10 个安装文件与工作区逐字节一致，客户端 1,444,503 字节，SHA-256 `559c09128df477ab45b4a37e1c55d7949ecfb2e06a382b27081e24366c9652fa`；首次检查 running healthy、重启计数 0。已请用户通过单个真实首页链接观察候选结果，尚未宣称修复成功。
- Chromium 已安装应用深浅色及禁用脚本的启动响应 3 项通过；WebKit 浅色及启动响应通过，深色在横屏几何检查期间触及 30 秒测试总上限（不是元数据断言失败），首次结果 2 通过／1 超时。日志：`/tmp/prts-mobile-parsed-meta-chromium.log`、`/tmp/prts-mobile-parsed-meta-webkit.log`。
- **真机反馈：提前颜色声明后仍然黑色。** 候选没有解决问题，已撤回服务端新增 theme-color 及客户端复用逻辑，保留本节实验记录，不将其作为最终修复。

## 第十三轮：同步宿主声明与重置根绘制的真实页面对比

- 临时面板改为三个按钮：「原页面」「同步全部声明」「重置根布局」。第一项对比延续上轮纯蓝、隐藏界面条件，额外把当前全部 theme-color 同步为蓝色；第二项在此基础上把 HTML／body 的标准 CSS 属性恢复初始值，设为浅色、可滚动的蓝色块，并彻底隐藏应用节点及根伪元素。
- 这两步用于区分浏览器对宿主声明的选择与真实应用的根绘制／合成条件。没有改动全局主题行为，不写入设置；返回原页面或停用主题时恢复本面板实际改写的宿主颜色（宿主在此期间已另行更新时保留其更新），移除所有诊断样式。
- 新面板先通过 Chromium／WebKit 的两步切换及恢复检查；增加宿主颜色恢复与根布局重置断言。首次打包预算因面板增加恢复逻辑而失败，已删减临时面板装饰与冗余选择器，维持原 3 KiB 临时配额；最终构建及元数据／打包 16 项复核通过，没有提高预算。样式选择器精简后 Chromium／WebKit 各 1 项复核通过，随后仅删除面板装饰与提示节点，实际安装检查再覆盖最终构建。
- 部署前备份：容器 `/data/backups/prts-before-mobile-reset-probe-1795289081.tgz`。客户端 1,444,641 字节，SHA-256 `b53adf1ce6946f3b25838dd0ba3b66f59f89427f20f964ad5717067342862a07`；已安装 10 个文件与工作区一致。普通入口无临时面板，初始颜色候选已撤回。
- 最终实际安装检查 Chromium／WebKit 各 1 次通过：两种对比、宿主颜色恢复、壁纸恢复、应用可见性均正常，恢复颜色 `rgb(90, 92, 95)`；非预期写入 0、页面错误 0。截图确认三个按钮均可见。日志：`/tmp/prts-mobile-reset-probe-installed-chromium.log`、`/tmp/prts-mobile-reset-probe-installed-webkit.log`。最终服务 running healthy、重启计数 0，10 文件再次核对一致。
- 已请用户打开携带 `check=root-reset` 的单一真实首页链接，依次观察两种对比的系统栏。黑边仍未解决；自动化结果仅证明诊断条件与恢复功能成立，不是 iPhone 系统栏验收。未提交、推送或发布，用户样式备份未修改。

## 第十四轮：真机对比生效，正式同步宿主颜色声明

- **有效真机反馈：同步全部声明、重置根布局均为蓝色，切回原页面后为灰色。** 用户设备已经出现所需的壁纸灰色系统栏；这支持将同步宿主颜色声明作为正式修复路径，不需要保留根布局重置。与前一轮相比，同步模式额外改写了宿主 theme-color；尚不把单一 WebKit 内部机制视为已证明。
- 正式逻辑保留主题自有颜色节点，并同步 HEAD 内全部 theme-color（保留各节点的 media）。仅监听 HEAD 中元数据的新增、移除与 content/name 变化；宿主启动后才追加节点或更新颜色时也会与当前壁纸取色一致。自身更新只在值不同时写入，不重复读取壁纸或扫描应用正文。
- 停用主题时移除自有节点并恢复宿主颜色；在主题运行期间收到宿主新的颜色值时，保存并恢复该最新值。宿主已移除／改名的节点会释放并恢复，不会重新创建。监听器随主题停用清理。
- 移除 URL 临时面板、独立颜色对比接口、相关服务端注册与诊断测试。保留本记录；用户的 `src/styles/refinement.css.orig` 不变。临时 3 KiB 配额移除，正式移动端配额从 6.5 KiB 调整为 8 KiB，容纳宿主同步与恢复逻辑；客户端较上一安装构建缩小 1,711 字节。
- 初次 30 项专项有 29 项通过、1 项因 JSDOM 不提供 HTMLMetaElement.media 反射属性而失败；测试改用真实 media 属性读取，产品逻辑没有为此改动。Chromium／WebKit 的 9 项移动端回归分别全部通过，元数据专项在将测试节点改为显式 setAttribute('media') 后各 1 项再次通过。日志：`/tmp/prts-mobile-host-colors-unit.log`、`/tmp/prts-mobile-host-colors-chromium.log`、`/tmp/prts-mobile-host-colors-webkit.log`、`/tmp/prts-mobile-host-colors-host-final-{chromium,webkit}.log`。
- 最终构建通过，完整 `npm test` 696 项全部通过，0 失败／跳过。日志：`/tmp/prts-mobile-host-colors-full-test.log`。`git diff --check` 通过；没有改动版本和 DSH 支持范围。
- 部署前备份：容器 `/data/backups/prts-before-mobile-host-colors-1795328823.tgz`。8 个正式安装文件与工作区逐字节一致，两个临时诊断模块已从安装目录移除。客户端 1,442,930 字节，SHA-256 `9a063939e82bb85b1d84e01d891406534209117551a950ab9ac0307ee4b34776`。首次部署后检查 running healthy、重启计数 0。
- 已请求在未使用任何对比按钮的正式首页及主屏幕入口分别验证真机结果；不会把此前对比按钮生效直接算作这两个入口都已完成验收。
- 实际安装检查 Chromium 3 项通过（深浅色、启动声明、全体颜色声明与壁纸一致、普通入口无面板、完整客户端匹配）；WebKit 浅色及启动声明 2 项通过，深色全部颜色／壁纸／几何断言完成后，在页面错误汇总处检测到一次 `ResizeObserver loop completed with undelivered notifications.` 而失败。保留首次失败，未过滤该提示；该提示此前几轮已在横竖屏测试中出现，正在低负载单独复核。日志：`/tmp/prts-mobile-host-colors-live-{chromium,webkit}.log`。
- WebKit 深色低负载单独复核通过（21.7 秒），页面错误断言保留且未出现提示；首次运行确实出现的 ResizeObserver 提示仍保留在上一条记录，不据一次复核断定其根因。日志：`/tmp/prts-mobile-host-colors-live-webkit-dark.log`。最终服务 running healthy、重启计数 0，用户备份 SHA-256 仍为 `faf472f95e3109bce71864968e3ddca985f5572f296447747ce5343ffb9ea439`。
- 正式版本已完成代码与安装检查，等待不使用诊断按钮的普通 Safari／主屏幕入口真机确认。未提交、推送或公开发布。

## 第十五轮：正式入口仍黑，先收集设备实际状态

- **真机反馈：正式首页普通 Safari 仍为黑色。** 同步全部宿主声明本身还不能算作修复成功；第十三轮成功还包含蓝色实底、隐藏界面与按钮交互，正式入口没有完整复现这些条件。
- 只读访问日志确认 15:03:02／15:03:43／15:03:46 命中真实 `/?prts-mobile=final-20261122`，200 响应，无内嵌链接；15:03:02 请求的主题客户端批次 rev=`1e051324deed` 与当前首页声明一致，不能将失败归为打开旧链接或未下载构建。
- 新增仅 `?prts-mobile-inspect=1` 启用的临时设备只读采样：在 1／4／9 秒记录主题标记、系统栏颜色声明、HTML／body 的有限 CSS 属性、壁纸是否存在及视口几何。通过同源 favicon 的 GET 查询发送，由现有访问日志记录；不新增 API，不修改页面、设置或任何会话，不读取文本、图片地址、存储或认证内容。停用主题清理未执行的定时器，普通入口不创建采样器。
- 临时采样模块单独计入 2 KiB 配额，诊断后需删除。此轮目的为取得真实设备 DOM 与样式证据，尚未追加未经验证的蓝色闪烁或重置布局补丁。
- 构建及 19 项设备采样／移动元数据／打包检查通过，包含 URL 开关、只读同源资源请求、定时器清理、输出不含页面文字或图片地址的检查。实际安装 Chromium／WebKit 各 1 次自动采样通过，均收到 3 条记录，稳定阶段 HEAD 两条颜色和 HTML／body 都为 `rgb(90, 92, 95)`；非预期写入 0、页面错误 0。这些仍是自动化引擎结果，iPhone 记录尚待取得。日志：`/tmp/prts-mobile-device-readout-unit.log`、`/tmp/prts-mobile-device-readout-live-{chromium,webkit}.log`。
- 部署前备份：容器 `/data/backups/prts-before-mobile-device-readout-1795331325.tgz`。9 个安装文件与工作区一致，客户端 1,444,661 字节，SHA-256 `e6ccd8f121e6c7db8d6c1b7e5d07e7a8fe151035f4434e847e495b8fc4874ffd`，服务 running healthy、重启计数 0。已请用户在普通 Safari 打开单个只读采样链接并停留 10 秒，等待真实设备记录。没有提交、推送或发布。

- **实际 iPhone 回传：用户看到仍为黑色。** 15:10:19／15:10:22／15:10:27 三份记录均为 `device-20261122-1`，主题启用，HEAD 两条 theme-color、HTML 和 body 背景均为 `rgb(91, 93, 95)`。HTML／body color-scheme 均为 dark；HTML overflow-y 为 visible，body 为 hidden；二者高度 695px，顶部 padding 为 0。壁纸存在，viewport 包含 viewport-fit=cover；视口 393×695、visualViewport 高度 695、offsetTop=0，coarse=true、standalone=false。
- 这排除了「真实设备没有应用当前颜色」的解释；没有证明 Safari 系统栏使用这些颜色。第十三轮组合对比生效的条件仍需拆分，不能将单独同步声明当作已解决。

## 第十六轮：拆分真实应用中的声明、壁纸及界面条件

- 保留被动采样入口；新增仅 `?prts-mobile-inspect=steps` 出现的临时分步面板。第一步只把全部 theme-color 改蓝，保留根背景／壁纸及界面；第二步在蓝色声明基础上使 HTML／body 纯蓝、移除壁纸，界面保留；第三步再以 opacity:0 隐藏其余 body 子节点。恢复按钮撤回全部临时绘制规则，重新采样原壁纸并同步声明。
- 每次点击 2 秒后自动发送同一有限 CSS／元数据读数，并包含步骤编号；新步骤取消旧读数定时器，以免将延迟报告误认作上一条件。没有设置、会话或认证数据写入；普通首页无面板，停用主题时清理面板、样式、定时器和声明覆盖。
- 此轮为定位对比，尚未修改正式入口的绘制策略，也未宣称问题已解决。临时诊断配额从 2 KiB 改为 5 KiB；诊断结束后应删除整项。

- 构建及 19 项设备采样／元数据／打包检查通过。Chromium／WebKit 的独立夹具各 1 次通过，覆盖分步条件、恢复、localStorage 不变、卸载清理与普通入口无面板；首次脚本在验证卸载时调用了夹具不存在的 theme.apply，已改为夹具既有 beforeunload 清理机制并完整复跑，两种引擎均通过，产品逻辑未为此改动。
- 备份：容器 `/data/backups/prts-before-mobile-isolated-1795331819.tgz`。9 个安装文件与工作区逐字节一致；客户端 1,446,771 字节，SHA-256 `7503da3bf2f10cf410b6f3d14f3a7b931fa5911b34d43b50ee8c247bf349cdf9`，服务 running healthy、重启计数 0。
- 实际安装 Chromium／WebKit 各 1 次分步检查通过：第一步两条声明蓝色，而 HTML／body 保留 `rgb(91, 93, 95)` 及原壁纸；第二步声明、HTML／body 蓝色且壁纸移除，应用 opacity 保持 1；第三步才隐藏应用。恢复后原灰色声明／壁纸／界面恢复，非预期写入与页面错误均为 0。日志：`/tmp/prts-mobile-isolated-unit.log`、`/tmp/prts-mobile-isolated-fixture-{chromium,webkit}.log`、`/tmp/prts-mobile-isolated-installed-{chromium,webkit}.log`。
- 已请用户通过单个 steps 链接依次记录三个步骤及恢复后的实际系统栏颜色；尚待真机结果，问题仍未解决。未提交、推送或发布，用户备份未修改。

- **第十六轮真机结果：三个步骤及恢复后，时间／电量周围始终为黑色。** 15:32:01／15:32:09／15:32:16／15:32:21 四条 iPhone 记录确认模式 1／2／3／0 已分别执行。模式 1 两条 meta 为蓝色、根背景仍灰且壁纸存在；模式 2／3 两条 meta 和根背景均为蓝色，壁纸已移除；恢复后声明及背景灰色、壁纸恢复。因此不是对比按钮未执行，也不能把纯蓝背景或同步声明当作成功条件。

## 第十七轮：按备份完整重放第十三轮对比

- 逐行比较第十三轮成功版和当前实现，服务端启动 HTML、主样式及壁纸样式没有差异；移动元数据控制器存在差异：旧版在点击事件内同步更新颜色，并使底层颜色变量也为蓝色；新分步版只覆盖 meta、随后在动画帧更新，移除壁纸后底层变量为主题黑色。此外旧版初始阶段不覆盖宿主 meta，没有 HEAD 元数据观察器。
- 这些是尚未隔离的差异，不是已经证明的根因。新增 `?prts-mobile-inspect=replay&prts-chrome-probe=1`，直接使用本地备份中的完整旧 viewport／probe 实现，保留原三个按钮和写入顺序。只在明确 replay 参数下替换控制器，普通入口保持当前行为；没有全局回滚或持久化修改。
- 新模块的薄包装只监听已完成的按钮点击，在 2 秒后记录同一有限元数据／CSS，并补充 app 的绘制状态；不干预旧按钮行为。临时诊断总配额为 14 KiB，包含完整旧实现，诊断结束后应一并移除。

- 已核对新模块中旧 viewport／probe 的完整函数正文与备份一致，仅调整了模块导入、导出和 viewport 函数名以接入包装；没有手工重建近似实现。构建及 19 项设备采样／元数据／打包检查通过。Chromium／WebKit 夹具各 1 次通过，覆盖原两种模式、恢复、卸载清理和普通入口无旧面板。
- 部署前备份：容器 `/data/backups/prts-before-mobile-replay-1795333016.tgz`。10 个安装文件与当前构建逐字节一致；客户端 1,456,773 字节，SHA-256 `b945e03d29cac7e09266f40d6ed1110062a72e68a35c50731e768b710cb5f5c9`，服务 running healthy、重启计数 0。
- 实际安装 Chromium／WebKit 各 1 次完整重放通过：初始自有声明灰色、宿主声明保留原黑色；两种蓝色模式均使根变量、HTML／body、所有声明为蓝色，第一模式 app opacity 为 0，第二模式另将 app display 设为 none、根色彩方案为 light、body overflow 为 visible。恢复后自有灰色、原壁纸、宿主原声明及界面均恢复；非预期写入、页面错误均为 0。日志：`/tmp/prts-mobile-replay-unit.log`、`/tmp/prts-mobile-replay-fixture-{chromium,webkit}.log`、`/tmp/prts-mobile-replay-installed-{chromium,webkit}.log`。
- 下一次需要真实 Safari 的完整截图（含系统时间、电量和地址栏），对照纯蓝重置后的网页与系统栏边界；不将自动化的蓝色 DOM 当作系统栏验证。尚未解决，未提交、推送或发布，用户备份不变。

- **第十七轮有效真机结果：同步全部声明仍黑，重置根布局成功变蓝。** 这比第十三轮「均蓝」更明确，后续以本轮结果为准，不再将同步声明作为成功路径。15:40:59／15:41:07 两份 iPhone 读数确认全部 meta、根底色变量和 HTML／body 在两步均为同一种蓝色，前一模式仍黑；成功重置后 color-scheme 从 dark 变为 light、HTML／body 高度及 min-height 变为 882px、body overflow 从 hidden 变为 visible，app display 从 block 变为 none。同步模式仅 opacity:0，重置模式另 display:none。

## 第十八轮：拆分已确认有效的根样式重置

- 对真实已安装页面的 WebKit 引擎逐个比较标准 CSS 属性（不是仅列出手选采样属性）。除尺寸、色彩和字体派生值外，明确差异还包括 html view-transition-name 从 root 变为 none；没有发现 transform、filter、contain、position 等根合成属性差异。日志：`/tmp/prts-mobile-root-css-diff.log`。该完整比较来自自动化 WebKit，实际 iPhone 已记录上述有限关键属性，未冒充 iOS 全量结果。
- 保留现有完整重放入口；新增仅 `?prts-mobile-inspect=roots` 出现的根条件对比。全部基于已确认仍黑的蓝色同步模式，各项互不叠加：A 仅 height:auto、min-height:120vh、overflow:visible；B 仅 color-scheme:light；C 仅 app display:none 和禁用根伪元素；D 仅 html view-transition-name:none。另保留原完整重置作为成功基准及原页面恢复按钮。
- 操作提示为按 A→B→C→D，第一次变蓝就停止，避免成功后的浏览器状态影响后续归因；若都黑再复核完整重置。尚不将其中任一项直接应用到正式界面，需要先确定有效子集及保留界面条件下的表现。没有全局重置或正式布局变更。

- 构建通过；首次 19 项专项有 18 项通过，1 项仅因临时诊断增加 934 字节后超过配额而失败。临时诊断配额从 14 KiB 调整为 15 KiB（正式移动端仍为 8 KiB），随后 19 项完整复核通过。Chromium／WebKit 的夹具和实际安装各 1 次四组对比通过：每个条件独立生效且切换时撤回上一条件，完整重置及恢复也通过，非预期写入与页面错误均为 0。没有把这些 CSS 检查当作系统栏结果。
- 部署前备份：容器 `/data/backups/prts-before-mobile-roots-1795333584.tgz`。10 个安装文件与当前构建逐字节一致；客户端 1,457,707 字节，SHA-256 `432cbe67d9065e85b0dfabfec17ab7eb2c5544c93c760b34ac3a4491416c1496`，服务 running healthy、重启计数 0。用户备份哈希不变。
- 日志：`/tmp/prts-mobile-roots-unit-final.log`、`/tmp/prts-mobile-roots-fixture-{chromium,webkit}.log`、`/tmp/prts-mobile-roots-installed-{chromium,webkit}.log`。已请用户打开单个 roots 链接，按顺序在第一项系统栏变蓝时停止并回报字母；如果四项仍黑，复核完整重置。完整 npm test 另在运行，结果稍后记录；尚未宣称正式入口修复。

- 完整 `npm test` 697 项中 696 项通过、1 项失败：`sidebar-vector-adapter.test.mjs:84` 在移除侧栏行后等待 8ms，ResizeObserver 观察集合尚未清理。该测试直接导入既有侧栏适配器，不导入本轮移动端模块。未改动测试或侧栏产品逻辑；原样单独复核 1 项通过，保留首次失败，不能把本次全量检查记为全绿。日志：`/tmp/prts-mobile-roots-full-test.log`、`/tmp/prts-mobile-roots-sidebar-rerun.log`。


- **第十八轮真机反馈：A／B 仍黑，点击 C 后首次变蓝。** 15:49:14／15:49:20／15:49:28 的 iPhone 读数确认模式 1／2／3 已执行，三者全部 meta、根底色变量及 HTML／body 均为蓝色。C 保留原 dark 色彩方案、body overflow:hidden、695px 根高度及 html view-transition-name:root，只额外移除根伪元素并对其余 body 子节点应用 display:none。这支持继续拆分内容绘制条件；不能将 C 表述为仅隐藏 app，也不能直接用于正式界面。

## 第十九轮：拆分 C 的绘制层条件

- 对真实已安装 WebKit DOM 只读检查：普通深色页面 HTML／body 四个伪元素均为 content:none；body 除 #root 外还有全屏 `[data-prts-cursor-feedback]`、主题 shell、已隐藏的目标框及零尺寸 SVG／脚本。光标特效层在触屏／减少动态效果时也会创建，即使没有涟漪仍 display:block、position:fixed、inset:0、contain:strict、isolation:isolate。目前只作为候选，没有真机证据证明其导致黑边。检查日志 `/tmp/prts-mobile-render-tree.log`。
- 新增仅 `?prts-mobile-inspect=paint` 启用的独立对比：1 仅 display:none 光标特效层；2 仅移除 HTML／body 伪元素；3 仅隐藏 #root 之外的 body 子节点；4 仅隐藏 #root；C 重现已成功的组合。每种非零模式都以原先仍黑的纯蓝底、全部蓝色声明和 opacity:0 为共同基准，各种移除条件互不叠加；没有改动正式入口。
- 读数修订为 device-20261122-5，paint 模式增加光标／shell 的 display 和四个根伪元素是否存在的布尔值，不读取内容。面板可恢复原页面，卸载清理规则、元数据和定时器；没有设置或会话写入。
- 构建通过，首次专项 24 项有 23 项通过、1 项因新增 1,386 字节临时代码超过原诊断预算而失败。只将临时诊断预算从 15 KiB 调为 17 KiB，正式移动端仍为 8 KiB；随后专项 24 项全部通过。Chromium／WebKit 夹具各一次通过，确认独立移除目标、其余层状态、C 对照、恢复／卸载清理和普通入口无面板；非预期写入及页面错误均为 0。未重复全量测试；上一轮 696／697 及单独侧栏复核结果仍如实保留。

- 备份：容器 `/data/backups/prts-before-mobile-paint-1795334121.tgz`。已安装 10 文件与工作区逐字节一致；客户端 1,459,093 字节，SHA-256 `4b55e1706b892d1b7628899bd6a7a9ea28ea3f415ac7182da2332b33178ad1a5`。最终服务 running healthy、重启计数 0，用户备份哈希不变。
- 已安装应用 Chromium／WebKit 各一次全部五种条件切换与恢复检查通过，原灰色壁纸及声明恢复，非预期写入与页面错误均为 0。日志 `/tmp/prts-mobile-paint-{unit-final,fixture-chromium,fixture-webkit,installed-chromium,installed-webkit}.log`；构建与部署日志同前缀 build／deploy。`git diff --check` 通过。
- 等待实际 iPhone 回报首次变蓝的编号；正式黑边仍未解决，尚未修改光标适配器。未提交、推送或公开发布。


- **第十九轮真机结果：1／2／3 仍黑，4「应用主体」变蓝。** iPhone 15:58:55／15:58:59／15:59:04／15:59:10 依次回传模式 1–4，修订 device-20261122-5；四个根伪元素始终不存在，前三项 #root display:block、opacity:0，第四项仅 #root 改为 display:none 即生效，光标与 shell 均保留 display:block。这排除了单独光标层、根伪元素、应用外置层作为这次黑边的充分原因；没有修改光标适配器。

## 第二十轮：检查应用内部的绘制层与主体底色

- 真实已安装 WebKit 只读渲染树检查发现：#root 及 frame／operation 背景均透明；侧栏遮罩在关闭时仍 display:block，使用黑色半透明背景但 opacity:0；粒子 canvas 仍覆盖 operation；另一个插件的挂件 SVG 为 fixed、100vw×100dvh。它们均在 #root 内，符合上一轮尚未排除的范围，但目前仍不能把任何一个当作确定原因。日志 `/tmp/prts-mobile-app-tree.log`。
- 在已有 paint 入口内替换已排除的条件，不继续增加入口或临时预算。修订 device-20261122-6：1 仅隐藏挂件节点（包括其 SVG／canvas）；2 仅隐藏侧栏遮罩；3 仅隐藏粒子画布；4 仅将 #root／frame 背景改为实蓝；5 重现已成功的仅隐藏 #root。共同基准仍为全部蓝色声明、HTML／body 纯蓝和其余 body 子节点 opacity:0，各项独立撤回前一规则，没有修改其他插件代码或设置。
- 读数改为挂件／遮罩／粒子的 display 及 frame 的有限样式。正式入口没有新增绘制规则。本轮目的为在保留应用结构的条件下继续定位，尚未宣称修复。
- 构建通过；24 项专项检查全部通过，临时预算仍为 17 KiB，客户端比上一轮减少 150 字节。首次两种引擎夹具检查由于临时脚本错误地把无壁纸夹具的 frame 原色预期为透明而失败；改为检查运行前实际底色及恢复值，不改产品逻辑，随后复核。

- Chromium／WebKit 夹具修正预期后各一次完整复核通过。部署前备份为容器 `/data/backups/prts-before-mobile-app-1795334668.tgz`；10 个安装文件与工作区逐字节一致，客户端 1,458,943 字节，SHA-256 `1356c3610dd90822ce3e0457bb764e994357fb778573eb99fbb6d21febba4377`。服务 running healthy、重启计数 0；用户样式备份哈希未变。
- 实际安装 Chromium／WebKit 各一次五项对比及恢复通过，确认只有目标绘制层退出或主体底色变蓝，第 5 项才隐藏 #root；恢复后壁纸及灰色取色正常，非预期写入、页面错误均为 0。日志 `/tmp/prts-mobile-app-{unit,fixture-chromium-final,fixture-webkit-final,installed-chromium,installed-webkit}.log`，构建／部署日志同前缀 build／deploy。`git diff --check` 通过，没有重复全量测试。
- 已请用户确认新版「挂件绘制层」标签后回报首次变蓝编号；本轮暂未修改正式界面。未提交、推送或发布。


- **第二十轮真机反馈：全部无效，包括第 5 项。** iPhone 16:05:25／34／38／41／45 以及 16:06:04／09／12／15／20 两轮读数确认模式 1–5 均执行，全部 meta、HTML／body 均蓝，第 4 项 #root／frame 的实际底色蓝，第 5 项 #root 确实 display:none。由此可见，上一轮仅隐藏 #root 的成功条件没有稳定复现，不能继续把「原因只在应用内部」当作已确定结论。此前粒子画布存在与否也不同，但本轮第 5 项已排除整个 app，不能直接据此归因。

## 第二十一轮：固定顶部色带候选

- 通过既有 use-github-proxy 工作流只读核对 WebKit main 的 `PageColorSampler.cpp/.h`、`Page.cpp`、`RenderLayerCompositor.cpp`、`LocalFrameView.cpp` 和 `WKWebView.mm`。公开源码表明：普通顶部取色会排除命中点下的图片、背景图片、动画、已绘制 canvas，且忽略 pointer-events；另有固定／粘性绘制层的 predominantColor 通道和 iPhone 顶部 scroll pocket 的颜色更新。Page 的普通顶部样本会缓存，直到显式失效。不能据此证明用户 iOS 27.3 的具体实现和黑边原因。
- 不再追加应用内部拆分按钮。正式 CSS 增加仅 coarse 指针设备启用的 html::before 固定实色色带，背景复用现有壁纸边缘取色变量，pointer-events:none，宽度覆盖视口，无布局占位；停用主题后选择器不匹配，桌面精细指针不创建。先试 2px，进一步核对 `fixedContainerSampleRectMargin=4` 后改为 6px，覆盖向内偏移的 2px 采样带。保留主屏幕浅色模式原 body::before 渐变及原有安全区布局。
- 新增浏览器回归检查实际顶部像素均匀且匹配颜色、顶部按钮可穿透点击、应用边界不变、停用清理及桌面没有色带。初次 Chromium 像素／点击断言通过，但新桌面上下文未初始化主题导致测试失败；补齐与移动上下文相同的偏好初始化。初次 WebKit 使用逐像素单独 expect，设备倍率导致同步断言循环过慢，已主动中止；改为逐像素计算最大误差后只断言一次。
- 首次及压缩样式后两次 52 项专项均有 51 项通过，唯一失败为原 CSS 323.5 kB 体积上限。最终保留可读样式，将该配额增加 500 字节至 324 kB，52 项全部通过；正式客户端和临时诊断配额均未提高。没有为了体积限制删除其他功能或缩减行为断言。
- Chromium／WebKit 完整移动端各 10 项通过；6px 最终值另做两种引擎单项像素与交互复核。源码和 DOM 检查只支持候选实现，尚不作为 iPhone 系统栏已修复的证据。暂时保留 URL 诊断模块供失败时恢复基准，尚未删除其预算。

- 6px 最终值 Chromium／WebKit 的像素、顶部点击、布局、停用及桌面检查各 1 项通过。部署备份 `/data/backups/prts-before-mobile-edge-1795335390.tgz`；10 个安装文件与工作区逐字节一致，客户端 1,459,166 字节，SHA-256 `f46904f1522f77eeb29458eaaeea99ec153765b02cf0a096708c8c196c630116`。服务 running healthy、重启计数 0，用户备份哈希不变。
- 已安装 Chromium 3 项全部通过，包含深浅色正常页面顶部 6px 全宽真实像素、横竖屏安全区及初始独立窗口声明；WebKit 深色像素／几何／构建断言完成后，最终错误列表出现既有 `ResizeObserver loop completed with undelivered notifications.`，该项失败。尚未把实际安装 WebKit 写作全绿，正在等待浅色与初始声明结果并低负载复核深色。
- 主要日志：`/tmp/prts-mobile-edge-unit-pass.log`、`/tmp/prts-mobile-edge-chromium-all-final.log`、`/tmp/prts-mobile-edge-webkit-final.log`、`/tmp/prts-mobile-edge-six-{chromium,webkit}.log`、`/tmp/prts-mobile-edge-live-{chromium,webkit}.log`。没有重复运行完整 npm test。已请用户直接打开正常完整界面，无需点击诊断按钮，只确认时间／电量周围灰或黑；系统栏效果尚待真机回报。未提交、推送或发布。

- 已安装 WebKit 浅色及初始启动声明 2 项通过；深色低负载单独复核 1 项通过（22 秒），保留页面错误断言，未再出现 ResizeObserver 提示。首次 1 失败／2 通过仍保留，不据复核通过断定提示根因。日志 `/tmp/prts-mobile-edge-live-webkit-dark.log`。最终服务 running healthy、重启计数 0，`git diff --check` 通过；当前候选等待正常 Safari 的实际系统栏反馈。

- **第二十一轮真机反馈：正常完整界面仍黑。** 撤回失败的 6px 固定色带及其专用像素测试，CSS 配额恢复 323.5 kB。先前界面内取色与点击检查通过不等于系统栏成功；不再保留该候选。隐藏应用在不同轮次得到相反结果，后续需先恢复可重复的真机对照，不能继续把该条件作为已定位原因。

## 第二十二轮：撤回失败候选，恢复真机对照

- 撤回顶部固定色带、对应夹具测试和已安装页 6px 像素断言，恢复 CSS 323.5 kB 配额；客户端精确恢复到第二十轮构建（1,458,943 字节，SHA-256 `1356c3610dd90822ce3e0457bb764e994357fb778573eb99fbb6d21febba4377`）。未新增另一个推测性正式补丁。
- 继续只读核对 WebKit main 的固定容器选择逻辑：普通顶部样本、固定容器颜色及旧固定颜色保留是不同路径，部分更新受交互和滚动状态限制；这些公开源码不足以证明用户 iOS 的实际路径。第十九轮仅隐藏应用成功、第二十轮同条件失败的矛盾仍未解释，不能继续以该条件认定具体插件或绘制层导致黑边。
- 构建、52 项专项检查通过；Chromium／WebKit 夹具各 9 项通过；已安装 Chromium 深色移动页 1 项通过，保留页面错误、非预期写入及实际加载构建一致性断言。没有复跑全量测试，也没有将引擎结果当作真机系统栏结果。日志 `/tmp/prts-mobile-edge-retract-{build,unit,chromium,webkit,live}.log`。
- 部署备份 `/data/backups/prts-before-mobile-edge-retract-1795336613.tgz`，10 个安装文件与工作区一致；最终服务 running healthy、重启计数 0。初次健康查询处于 starting，随后转为 healthy；未认证首页返回 401，认证后的浏览器正常加载并完成上述检查。用户样式备份哈希未变。
- 下一步请求原页面及单次「重置根布局」后的完整 Safari 截图（包含系统时间、电量和地址栏），并用已有 replay 入口同步记录条件。需要先确认之前成功的完整重置现在是否稳定生效，不再要求逐项尝试新的按钮组。仍未解决；未提交、推送或发布。

## 第二十三轮：从有截图的成功重置恢复应用

- 用户提供同一 Safari 的完整前后截图：16:40 原页面系统时间／电量周围及底部区域为黑色，点击「重置根布局」后顶部和底部均为蓝色；对比面板清楚显示当前模式。iPhone 同源只读记录确认 mode=2、HEAD 两条声明蓝色、HTML／body light、overflow visible、min-height 882px、view-transition-name none、#root display:none。成功的完整重置再次成立，单独隐藏 #root 的充分性仍未确定。
- 在现有 replay 面板增加「重置后显示应用」：复用完整重置的全部根规则及其余 body 子节点隐藏条件，只显示 #root 和内部绘制。#root 高度固定为实际视口，恢复可见性、点击、主题字体／文字色和原深浅色方案，以便保留可检查的应用界面。暂不恢复壁纸和外置绘制层，不把蓝色对比当成正式修复。此项从成功条件恢复内容，用于补充先前从失败条件逐项移除的实验。
- 只读修订 device-20261122-7；paint 旧按钮标签移除「已成功」字样，避免与第二十轮结果冲突。无新增诊断入口，无设置、会话或其他插件代码变更，正常入口不启用该对比。临时预算仍 17 KiB。
- 构建及 24 项专项通过；Chromium／WebKit 夹具各 1 次、实际安装各 1 次完整检查通过。对「重置」与「显示应用」比较 HTML／body 的全部计算样式及其余 body 子节点 display／opacity，保持一致；只有 app 恢复 display:block、opacity:1、pointer-events:auto 和 695px 高度；全部声明保留蓝色。还验证原页面恢复、localStorage 不变、普通入口无面板、夹具卸载清理；非预期写入、页面错误均为 0。这些不是实际 iPhone 系统栏结果。
- 日志 `/tmp/prts-mobile-restore-{build,unit,fixture-chromium,fixture-webkit,live-chromium,live-webkit}.log`。备份 `/data/backups/prts-before-mobile-restore-1795337035.tgz`；10 个安装文件与工作区一致，客户端 1,459,292 字节，SHA-256 `1863bee15c47257c05304030e93f97fdfd6e7a8aa24f6dad3fff2db4e62853e5`；服务 running healthy、重启计数 0。用户样式备份哈希未变，git diff --check 通过。未提交、推送或公开发布；正式黑边仍未解决，需用户确认恢复应用后系统栏是否再次变黑。

## 第二十四轮：恢复壁纸及外置层，直接加载完整界面候选

- 用户反馈「保持蓝色」并提供完整截图：16:46、「重置后显示应用」标签可见，聊天、挂件、顶部系统栏和底部 Safari 区域同处蓝底。这证明在该成功重置之后，恢复 #root 及内部绘制并不必然使系统栏变黑；没有证明普通首次加载已解决，也没有证明外置层或壁纸条件无影响。
- 新增仅 `?prts-mobile-inspect=layout` 启用的完整界面候选，不创建操作面板、无需先进入空白蓝页。沿用已成功的 HTML／body all:initial、light、min-height:120vh 根条件，保留实际壁纸取色作为纯色根底；应用固定为一个动态视口并承载安全区及原主题色彩方案，将原壁纸、遮罩和裁切位置绘制到 #root。所有其他 body 子节点保留原显示状态；不再通过 display:none／opacity:0 移除光标或其他插件。主题停用／页面卸载后移除专用样式，不写设置。120vh 条件和根全面重置仍仅用于诊断，没有作为正式移动布局提交。
- 移动元数据控制器从诊断提供的实际绘制节点取样：该候选为 #root，普通入口仍为 body。被动读数修订 device-20261122-8，image 布尔值对 layout 检查实际壁纸节点，不发送图片地址。保留已成功的 replay 对比。淘汰先前结果不稳定的 roots／paint 按钮组及其读数字段；删除前源码归档 `/tmp/prts-mobile-{replay,inspect}-before-layout.js`，上轮完整安装也在部署备份中。未改动光标适配器或其他插件。
- 初次 24 项专项中仅打包体积失败；通过淘汰上述过时诊断而非增加预算解决，仍保留 17 KiB 临时配额，随后 24 项通过。客户端比上轮减少 421 字节。构建及 git diff --check 通过，用户原始 CSS 备份哈希未变。
- Chromium 完整夹具通过：直接入口无面板、外置按钮可点击、根与应用色彩方案独立、深浅色切换、横竖屏图像 cover 取色、保护位置、遮罩、安全区边界、存储不变、卸载清理及普通入口恢复。WebKit 首次仅因 1/64px 尺寸舍入而失败，几何比较改为允许 0.05px 后功能断言通过；最终错误列表在注入安全区阶段出现 ResizeObserver loop。单独复核仍出现；普通入口同脚本对照在相同步骤也出现该提示。保留这两份失败与对照记录，不声称 WebKit 完整矩阵全绿，也不据此认定根因。
- 独立 WebKit 直接加载／交互／清理检查（不人为连续切换安全区）通过，页面错误与非预期写入 0。实际安装的 Chromium／WebKit 相同直接加载检查各 1 次通过，均保留错误断言及实际响应包含当前 lib/client.js 的一致性检查；完整应用及壁纸可见，外置节点可交互，退出专用链接后普通入口恢复。上述引擎结果不代表 iPhone 系统栏效果。
- 日志 `/tmp/prts-mobile-layout-{build,unit,unit-final,fixture-chromium,fixture-webkit,fixture-webkit-final,fixture-webkit-isolated,control-webkit,cold-fixture-webkit,live-chromium,live-webkit}.log`；复现脚本 `/tmp/prts-mobile-layout-{check,control,cold}.mjs`。备份 `/data/backups/prts-before-mobile-layout-1795337731.tgz`；10 个安装文件与工作区一致，客户端 1,458,871 字节，SHA-256 `f8fd175475ecb709164d6ec34c14e582cfc95513ab6d00523cf097d20d2a953a`；服务 running healthy、重启计数 0。未提交、推送或公开发布，正常入口尚未宣布修复。
- 下一步仅请用户在普通 Safari 新建标签直接打开 layout 专用链接，无需点击对比按钮，确认壁纸出现后系统时间／电量周围为灰色还是黑色，以检查成功状态是否依赖此前的重置操作。

## 第二十五轮：撤回完整候选，隔离直接加载与手动重置

- 用户反馈 layout 候选「还是黑色」。真实 iPhone 的 device-20261122-8 在 1／4／9 秒均确认：HEAD 两条声明和 HTML／body 背景为 rgb(91, 93, 95)，HTML／body light、overflow visible、min-height 882px、view-transition-name none；应用可见且高 695px，壁纸存在。根重置与灰色均已实际生效，不能用未加载补丁或未取到色解释。本轮尚不能直接归因为加载顺序，因为上一候选还同时恢复了灰色、壁纸、外置层。
- 撤回 layout 模式及其全面根样式重置、壁纸迁移和临时取样节点接口；正式移动控制器重新只从 body 取样。撤回前源码保存在 `/tmp/prts-mobile-{inspect,viewport}-failed-layout.js`，安装前版本也已进入部署备份。保留普通入口既有行为及已确认有效的 replay 面板。
- 最小新增条件：replay 的 `prts-chrome-start=app` 使现有「重置后显示应用」模式 3 从初始 sync 直接生效，不先切换到空白模式、不自动重放点击，也不改变该模式原 CSS。初始读数明确记录 mode=3，修订 device-20261122-9。比较与手动 2→3 路径时，仍是相同纯蓝根底、应用可见、壁纸关闭和其余 body 绘制层隐藏，用于先单独检查加载／重置顺序。没有在正式页面增加未经确认的自动隐藏／恢复补丁。
- 构建及 24 项专项通过。Chromium／WebKit 夹具各 1 次直接加载、手动重置及恢复比较通过；最终 Chromium 夹具在清理兼容修正后再复核 1 次通过。比较 HTML／body／app 的全部标准计算 CSS 属性（不比较自定义变量）及其余 body 子节点 display／opacity，直接加载和手动重置一致。还验证初始无需点击、蓝色声明、应用可见性、原页面恢复、localStorage 不变、卸载清理及普通入口无面板。
- 实际安装两种引擎首次仅因宿主将蓝色声明序列化为 rgb(40, 120, 200)、测试要求字面量 #2878c8 而失败。改为比较浏览器归一化后的颜色，未忽略颜色条件；诊断清理也接受这两个实际出现的等价表示，以免退出时遗留蓝色声明。随后 24 项专项复核通过，实际安装 Chromium／WebKit 各 1 次完整复核通过；直接加载与手动路径样式一致，初始读数两条声明均为同一蓝色，页面错误和非预期写入 0。没有把引擎结果当作系统栏验证。
- 日志 `/tmp/prts-mobile-cold-blue-{build,unit,unit-final,fixture-chromium,fixture-webkit,fixture-chromium-final,live-chromium,live-webkit,live-chromium-final,live-webkit-final}.log`，比较脚本 `/tmp/prts-mobile-cold-blue-check.mjs`。最终备份 `/data/backups/prts-before-mobile-cold-blue-1795341255.tgz`；10 个安装文件与工作区一致，客户端 1,457,346 字节，SHA-256 `3ce1d2ac83a8f4359e1c114c477f22c5084b7347d38955823e7a95fe63ddf7f3`；服务 running healthy、重启计数 0，原始 CSS 备份哈希未变，git diff --check 通过。未提交、推送或公开发布。
- 下一步请用户新建 Safari 标签直接打开蓝底 app 入口，先观察不点击时的系统栏；若仍黑，再点一次「重置根布局」核对是否变蓝。这能在恢复灰色／壁纸／外置层之前，确认直接加载这个单独差异的表现。正式黑边仍未解决。


## 第二十六轮：在成功的直接加载条件下只替换颜色

- 用户反馈直接打开 cold-blue 页面「不点按钮，也是蓝色」。iPhone 的 device-20261122-9 读数确认 mode=3、两条 HEAD 声明均为等价蓝色、HTML／body light、min-height 882px、应用可见且高 695px、壁纸关闭。这说明该蓝色配置不需要先手动重置；并未证明恢复壁纸或其他绘制层后也有效。
- 现有 replay 入口增加严格枚举 `prts-chrome-tint=gray`，把蓝色替换为上轮真实壁纸采样的 `#5b5d5f`（rgb(91, 93, 95)）。只改根／body 纯色、全部主题色声明及根颜色变量，保留成功蓝色页的全部布局、应用显示、根重置、壁纸关闭和外置层隐藏条件。默认蓝色对照保留，不接受任意 CSS 颜色输入；退出与卸载也识别宿主写回的等价 rgb 灰色，恢复原声明。读数修订 device-20261122-10。
- 构建与 24 项专项检查通过。Chromium／WebKit 夹具分别验证蓝色、灰色直接加载及手动重置等价、恢复原页面、卸载清理、普通入口无诊断面板、localStorage 不变，页面错误与非预期写入均为 0。对两色分别采集 HTML／body／app 全部标准计算样式和其余 body 子节点 display／opacity：唯一差异为 HTML 和 body 的 background-color；应用及外置层状态相同。不把这些浏览器内检查当作实际系统栏结果。
- 部署备份 `/data/backups/prts-before-mobile-cold-gray-1795342368.tgz`，10 个安装文件与当前构建逐字节一致。客户端 1,457,494 字节，SHA-256 `625e3d35db039c2bacb018ab25ceb1768eafb6966cb78c6b672ab19f9fa76da0`；服务 running healthy、重启计数 0，原始 CSS 备份哈希未变。尚未提交、推送或公开发布。
- 实际安装的 Chromium／WebKit 各完成蓝、灰两次检查，直接加载与手动重置样式一致，两色之间仅根／body background-color 不同；两条 HEAD 声明归一化后颜色正确，壁纸仍关闭、应用可见、恢复正常入口通过，页面错误与非预期写入均为 0。日志 `/tmp/prts-mobile-cold-gray-{build,unit,fixture-chromium-blue,fixture-chromium-gray,fixture-webkit-blue,fixture-webkit-gray,live-chromium-blue,live-chromium-gray,live-webkit-blue,live-webkit-gray,deploy}.log`；比较脚本 `/tmp/prts-mobile-cold-gray-check.mjs`。git diff --check 通过。
- 下一步请用户用普通 Safari 直接打开灰色 cold app 入口，无需点击按钮，只确认时间／电量周围是灰色还是黑色。正式入口仍未宣布修复；灰色通过后再分别恢复壁纸与外置层，避免重复上轮一次改变多个条件。
