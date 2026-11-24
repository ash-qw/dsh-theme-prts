# 工程记录：基建制造日志本地试用

日期：2026-11-23。按已确认的 B.01 视觉方向实现文件变更摘要，初次试用时未提交、推送或公开发布。此方案作为历史备选保留，当前实现与后续提交记录见 `docs/engineering-record-2026-11-24.md`。

## 设计与实现

- 提取明日方舟基建制造界面的阶梯轮廓、青色错位底板、浅色信息梁和小型编号，组成工程记录面板。多文件显示现有罗德岛徽记，单文件保留宿主文件类型图标。
- 新增 `src/styles/engineering-record.css`，构建时接入并内嵌现有徽记的 40px 衍生图，不增加运行时脚本、观察器、设置、依赖或新下载素材。
- 入口限定真实宿主 `data-changed-files` 及标题结构。经典与 Baker 共用样式；随深浅色、四档玻璃调整，窄栏使用容器查询。仅裁切装饰平面，保留内容与焦点；完整路径自然换行。
- 保留原生汇总、增删行数、二进制／过大提示、多文件展开收起、悬停预览、单文件审阅与键盘操作。浅色行内增删数字单独使用深绿／深红，实测计算颜色以防选择器优先级回归。
- 关闭主题恢复宿主样式；强制颜色模式恢复系统边框与原生图标。清透档实际透底，关闭玻璃档不透底。

## 验证方式与边界

- 浏览器测试挂载本地 DSH `0.2.2-rc.5` 的真实 `ui-deliverables` 组件，使用隔离注册和样例数据，不调用模型、不新建会话、不修改业务数据或设置。
- 专项覆盖深浅色 × 经典／Baker × 1440／390px，以及长路径、单文件、异常计数、主题退出、四档玻璃、760px 视口内的窄容器、强制颜色和键盘操作。透底用黑白衬底截图像素差验证。
- 全量检查的三个失败已用干净 `HEAD` 复现：`styles the host frame without taking ownership of the shared details column`（既有 CSS 体积预算）、`keeps the spine left edge fixed and moves the facility face to the right on expansion`、`keeps each expanded workspace spine open without promoting projection or actions`。本轮不改写这些断言或无关样式。
- 相邻卡片浏览器检查的三个固定失败也在干净 `HEAD` 复现；另一个按钮时序用例单独重跑通过。不宣称全仓库检查全部通过。
- 本轮仅对本地 Web `rc.5` 实机验收；版本仍为 `4.3.0`，支持声明仍为 `0.2.2-rc.2 || 0.2.2-rc.3 || 0.2.2-rc.5`。

## 本地部署

- 安装端已有未合入当前仓库构建的其他适配。本轮以已安装客户端为基线，仅替换内嵌 `PRTS_CSS` 的工程记录段，验证逆向替换后与基线逐字一致，保留已有适配。因此安装客户端与仓库常规构建的整体哈希不同；核对以暂存的部署构建为准。
- 部署同时同步工程记录源样式和两份 README，不改版本、依赖和锁文件。原有未跟踪文档 `docs/dsh-update-channels-research-2026-11-23.md` 保留原样。
- 暂存构建、清单、HTTP 验证和真实组件截图位于 `/root/dsh-theme-prts-designs/engineering-record/`。截图来自实际安装组件与隔离样例数据，不是概念重绘。

## 最终检查记录

- 最终 `npm run check`：构建成功，688 项单元测试中 685 项通过、3 项既有失败，失败名称及基线复现情况见上文。独立包检查 9 项全部通过；脚本语法与 `git diff --check` 通过。
- 修正浅色计数后的候选浏览器专项 12 项全部通过。
- 最终已安装版未注入候选样式，12 项浏览器专项全部通过，0 失败、0 跳过；包含实际行内增删数字颜色、原生审阅与展开、悬停预览、窄栏、四档玻璃和强制颜色验收。
- 最新部署备份：`/vol1/1000/docker/deepseek-harness/data/backups/prts-before-engineering-record-1795436044.tgz`；首轮安装前备份：`/vol1/1000/docker/deepseek-harness/data/backups/prts-before-engineering-record-1795435053.tgz`。
- 部署构建与已安装客户端 SHA-256 均为 `666fc3ee009dcae938740095b97b2a20bad412140435d548c6590e6c24924632`；仓库常规构建为 `c8b063a04a1c44c2b56ba1c597c6edb173c3aacb37599170bd0807dc1b06a92f`。
- 重启后服务为 `running healthy`；认证浏览器页面与插件响应均为 HTTP 200，插件响应包含完整暂存部署构建，页面异常为 0。
