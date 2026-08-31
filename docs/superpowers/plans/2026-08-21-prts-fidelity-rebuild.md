# P.R.T.S. 视觉保真重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `dsh-theme-prts` 从浮动顶栏/单右栏修复为真实适配 DeepSeek Harness Web `0.1.0-rc.7` 的五区 P.R.T.S. 界面，并提供独立设置页、中文固定文案、完整档案和文字安全验收。

**Architecture:** 使用 rc.7 已验证的稳定 slot（`settings.section`、`details`、`sidebar.*`、`conversation.*`）承载插件组件，并用集中式 `rc7-adapter` 只标记宿主三列 frame。插件 shell 提供顶栏与导航轨，原生 sidebar 作为行动会话，原生 conversation 作为主行动区，`details` slot 内渲染相互独立的战术总览和干员档案；状态投影、抽屉交互与清理各自隔离。

**Tech Stack:** JavaScript ESM、DeepSeek Harness `dsh.client` slots、React without JSX、Node.js 18 test runner、jsdom 24、Playwright 1.55、CSS/SVG/PNG、Docker CLI。

**Spec:** `docs/superpowers/specs/2026-08-21-prts-fidelity-rebuild-design.md`

## Global Constraints

- 目标仅为正在运行的 DeepSeek Harness Web `0.1.0-rc.7`。
- 继续使用 `dsh.client`/`dsh.bundle.patch`；不 fork Harness，不修改镜像内前端文件。
- 使用原生 `settings.section` 创建平级“P.R.T.S. 终端”设置页；不得注册 `settings.general.item`。
- 插件自有固定关键文案使用中文；Harness 原生国际化文本不得改写或缓存。
- 桌面建立导航轨、行动会话、主行动区、战术总览、干员档案五区；后两者必须是独立列。
- 阿米娅图像不得使用 `cover` 二次裁切；正文与组件文字不得隐藏、遮挡或低对比。
- 暗色、亮色、桌面、平板、手机和 200% 缩放必须可用。
- 主题默认关闭；`?prts-safe=1` 阻止视觉挂载，但设置/卸载恢复路径保持可达。
- 关闭或卸载必须恢复宿主属性并移除插件节点、style、listener、observer 和抽屉状态。
- 不改动其他皮肤；不增加网络请求、分析统计、遥测或独立数据 API。
- 每项生产变更先写失败测试并观察预期失败，再写最小实现。

## File Map

- `src/client/rc7-adapter.js` — 解析真实 rc.7 frame，标记宿主区域并可逆恢复。
- `src/client/status-projection.js` — 只读投影 Session、模型、权限、Goal/Plan、Agent/Tool/Output。
- `src/client/ui-store.js` — 同步 preferences 与 status 到多个 slot 组件。
- `src/client/settings-page.js` — 独立“P.R.T.S. 终端”设置页。
- `src/client/details-panel.js` — 战术总览与干员档案两个独立列。
- `src/client/operations-shell.js` — 顶栏、导航轨、响应式触发器及生命周期。
- `src/client/drawer-controller.js` — 平板/手机抽屉、遮罩、Escape 和焦点恢复。
- `src/client/index.js` — 组装 slots、store、adapter、shell、投影和清理。
- `src/styles/prts.css` — 五区布局、暗/亮组件 token、响应式与文字安全。
- `src/assets/amiya-operator-portrait.png` — 概念稿已确认的 276×398 阿米娅头像与上半身档案肖像。
- `tests/fixtures/rc7-harness.html` — 从真实 NAS DOM 精简出的 rc.7 镜像。

---

### Task 1: 锁定真实 rc.7 DOM 与可逆适配器

**Files:** Create `tests/fixtures/rc7-harness.html`, `src/client/rc7-adapter.js`, `tests/rc7-adapter.test.mjs`; modify `scripts/build.mjs`.

**Interfaces:** Produces `resolveRc7Regions(document)` and `createRc7Adapter({ document }) -> { mount(), dispose() }`; consumes stable slots `root`, `sidebar`, `conversation`, `details`, `shell.overlay` observed on NAS.

- [ ] **Step 1: Create the rc.7 mirror** containing the observed direct frame topology, native labels `New Session` and `Send message`, conversation scroll, composer card, details slot and shell overlay. Include long Chinese message/code fixtures but do not add invented Goal/Plan slots as the only test path.
- [ ] **Step 2: Write failing adapter tests:**

```js
test('marks and restores the real rc7 host columns', () => {
  const before = document.body.innerHTML
  const adapter = createRc7Adapter({ document })
  const regions = adapter.mount()
  assert.equal(regions.sidebar.dataset.prtsRegion, 'sessions')
  assert.equal(regions.center.dataset.prtsRegion, 'operation')
  assert.equal(regions.details.dataset.prtsRegion, 'details')
  adapter.dispose()
  assert.equal(document.body.innerHTML, before)
})
test('refuses a partial host without leaving markers', () => {
  assert.equal(createRc7Adapter({ document: partial }).mount(), null)
  assert.equal(partial.querySelector('[data-prts-region]'), null)
})
```

- [ ] **Step 3: Run** `node --test tests/rc7-adapter.test.mjs`; expect `ERR_MODULE_NOT_FOUND`.
- [ ] **Step 4: Implement exact slot resolution.** `mount()` records previous `data-prts-region` values before setting `frame`, `sessions`, `operation`, `details`; `dispose()` restores in reverse order. It never moves or clones native nodes.
- [ ] **Step 5: Add the module before consumers in `scripts/build.mjs`; run** `node --test tests/rc7-adapter.test.mjs && npm run build`; expect PASS and no unresolved imports.
- [ ] **Step 6: Commit:**

```bash
git add tests/fixtures/rc7-harness.html src/client/rc7-adapter.js tests/rc7-adapter.test.mjs scripts/build.mjs lib/client.js
git commit -m "test: lock PRTS theme to the rc7 host structure"
```

### Task 2: 迁移到独立 P.R.T.S. 设置页

**Files:** Create `src/client/settings-page.js`, `tests/settings-section.test.mjs`; modify `src/client/index.js`, `scripts/build.mjs`; delete `src/client/settings-row.js`, `tests/settings-slot.test.mjs`.

**Interfaces:** Produces `createSettingsPage(React)` and `settings.section` registration `{ id: 'prts-terminal', order: 46, label: () => 'P.R.T.S. 终端' }`; consumes the existing preference store/actions.

- [ ] **Step 1: Write failing slot tests:**

```js
applyPrtsPlugin(ctx, environment)
assert.ok(calls.injected.includes('settings.section'))
assert.ok(!calls.injected.includes('settings.general.item'))
const [options] = calls.registrations.find(([value]) => value.id === 'prts-terminal')
assert.equal(options.label(), 'P.R.T.S. 终端')
```

Also assert safe mode and `enabled:false` still register the independent page while mounting no visual shell.
- [ ] **Step 2: Run** `node --test tests/settings-section.test.mjs`; expect failure because current code injects General Settings.
- [ ] **Step 3: Implement `createSettingsPage(React)`** with root `[data-prts-settings-page]`, real `aria-pressed` buttons, and fixed Chinese labels: 主题状态、终端外观、干员档案、战术纹理、动态效果、信息密度、面板默认状态、重置主题设置.
- [ ] **Step 4: Register only `settings.section`.** Remove plugin zh/en dictionaries and locale text replacement; do not modify Harness language state or native setting labels.
- [ ] **Step 5: Run** `node --test tests/settings-section.test.mjs tests/preferences.test.mjs tests/package.test.mjs`; expect PASS and `grep -R "settings.general.item" src tests` to return no matches.
- [ ] **Step 6: Commit:**

```bash
git add src/client/index.js src/client/settings-page.js src/client/settings-row.js tests/settings-section.test.mjs tests/settings-slot.test.mjs scripts/build.mjs lib/client.js
git commit -m "feat: move PRTS controls to a dedicated settings page"
```

### Task 3: 建立只读状态投影与共享 store

**Files:** Create `src/client/status-projection.js`, `src/client/ui-store.js`, `tests/status-projection.test.mjs`; modify `src/client/index.js`, `scripts/build.mjs`; delete `src/client/settings-store.js`.

**Interfaces:** Produces `projectHarnessStatus(document, location)`, `watchHarnessStatus({ document, window, onChange })`, `createPrtsUiStore(defineStore)`; status shape is `{ operation, doctor, model, permission, goal, plan, agents, tools, outputs }`.

- [ ] **Step 1: Write failing projection tests:**

```js
const nativeBefore = document.querySelector('[aria-label="New session"]').textContent
const status = projectHarnessStatus(document, location)
assert.equal(status.operation, 'OP-06')
assert.equal(status.model, '未提供')
assert.equal(status.permission, '未提供')
assert.equal(document.querySelector('[aria-label="New session"]').textContent, nativeBefore)
```

Test MutationObserver refresh coalescing and disposal separately.
- [ ] **Step 2: Run** `node --test tests/status-projection.test.mjs`; expect module-not-found failure.
- [ ] **Step 3: Implement `EMPTY_STATUS`** using `待命`/`未提供`; read only stable `data-slot`, `data-testid`, `aria-label`, URL session code and explicit test seams. Never search/replace native text nodes and never invent non-null counts.
- [ ] **Step 4: Implement shared store:**

```js
init: () => ({ preferences: { ...DEFAULT_PREFERENCES }, status: { ...EMPTY_STATUS }, revision: -1 })
sync(draft, preferences, status, revision) {
  if (revision <= draft.revision) return
  draft.preferences = { ...preferences }; draft.status = { ...status }; draft.revision = revision
}
```

- [ ] **Step 5: Run** `node --test tests/status-projection.test.mjs tests/settings-section.test.mjs`; expect PASS including host language text unchanged after refresh.
- [ ] **Step 6: Commit:**

```bash
git add src/client/status-projection.js src/client/ui-store.js src/client/settings-store.js src/client/index.js tests/status-projection.test.mjs scripts/build.mjs lib/client.js
git commit -m "feat: project rc7 operation state without mutating host text"
```

### Task 4: 重建五区 shell、双右栏与完整档案

**Files:** Create `src/client/operations-shell.js`, `src/client/details-panel.js`, `tests/operations-shell.test.mjs`, `src/assets/amiya-operator-portrait.png`; modify `src/client/index.js`, `scripts/build.mjs`, `tests/package.test.mjs`; delete `src/client/tactical-shell.js`, `tests/tactical-shell.test.mjs`, `src/assets/amiya-dossier.png`.

**Interfaces:** Produces `createOperationsShell({ document, window, assets, adapter }) -> { update(preferences, status), dispose() }` and `createDetailsPanel(React)`; consumes the shared store and native `details` slot.

- [ ] **Step 1: Write failing structural tests** asserting exactly one topbar/nav rail, marked native sessions/operation regions, and sibling `[data-prts-overview]`/`[data-prts-operator]` panels. Assert fixed labels 战术总览、行动目标、执行计划、协同干员、战术工具、任务产出、干员档案、职业、分支、武器、身高、生日、履历.
- [ ] **Step 2: Restore the approved operator portrait** from the confirmed concept: Amiya head-and-upper-body composition, fixed in the dossier with no expand interaction. Add package assertions for the approved 276×398 PNG and its reviewed SHA-256.
- [ ] **Step 3: Run** `node --test tests/operations-shell.test.mjs tests/package.test.mjs`; expect failure for missing modules/asset.
- [ ] **Step 4: Implement shell topbar/nav** with explicit values for 当前行动、神经模块、权限等级、博士、连接/同步状态、日期和时间 plus P.R.T.S./RHODES ISLAND/RIIC brand anchors. Missing runtime status displays `未提供`, never truncated URL fragments; clock uses the browser locale and installs one disposable timer.
- [ ] **Step 5: Register native `details` slot** and render one grid with two sibling asides. Use `classIcons` in the dossier. Metadata is 代号“阿米娅”、编号“R001”、职业“术师”、分支“核心术师”、武器“源石技艺单元”、身高“142 cm”、生日“12月23日”, explicitly decorative rather than Harness telemetry.
- [ ] **Step 6: Build and run** `npm run build && node --test tests/operations-shell.test.mjs tests/status-projection.test.mjs tests/settings-section.test.mjs tests/package.test.mjs`; expect PASS and no old dossier/tactical-shell references.
- [ ] **Step 7: Commit:**

```bash
git add src/client src/assets scripts/build.mjs tests lib/client.js
git commit -m "feat: rebuild the PRTS five-region operation shell"
```

### Task 5: 重写五区 CSS、双主题与文字安全

**Files:** Modify `src/styles/prts.css`, `tests/css-contract.test.mjs`, `tests/theme-controller.test.mjs`.

**Interfaces:** Consumes adapter/shell hooks; produces complete dark/light rc.7 surfaces and readable geometry.

- [ ] **Step 1: Write failing CSS contracts** requiring selectors for frame/sessions/operation/details-grid/overview/operator; reject `color: transparent`, `font-size: 0` and dossier `object-fit: cover`; require dossier `object-fit: contain`.
- [ ] **Step 2: Run** `node --test tests/css-contract.test.mjs tests/theme-controller.test.mjs`; expect failure on old single-panel and crop rules.
- [ ] **Step 3: Implement desktop tokens:** topbar 72px, rail 72px, sessions `clamp(220px,17vw,280px)`, overview `clamp(220px,17vw,280px)`, dossier `clamp(238px,18vw,300px)`, operation `min-width:560px`; details grid has two explicit columns.
- [ ] **Step 4: Apply explicit dark/light tokens** to body, host columns, dialogs, menus, tooltips, toasts, Markdown, code, composer and disabled controls. Never set text-hiding properties or global descendant colors.
- [ ] **Step 5: Set decoration pseudo-elements to `pointer-events:none`; set dossier height 390–430px and image `object-fit:contain; object-position:center bottom`.
- [ ] **Step 6: Run** `npm run build && npm test && git diff --check`; expect all PASS.
- [ ] **Step 7: Commit:**

```bash
git add src/styles/prts.css tests/css-contract.test.mjs tests/theme-controller.test.mjs lib/client.js
git commit -m "feat: theme the rc7 host with readable dark and light surfaces"
```

### Task 6: 实现平板/手机抽屉与键盘交互

**Files:** Create `src/client/drawer-controller.js`, `tests/drawer-controller.test.mjs`; modify `src/client/operations-shell.js`, `src/client/preferences.js`, `src/styles/prts.css`, `scripts/build.mjs`.

**Interfaces:** Produces `createDrawerController({ document, window, onChange }) -> { setViewport(width), open(side, trigger), close(reason), dispose() }` for `sessions` and `details`.

- [ ] **Step 1: Write failing tests** proving phone defaults closed, triggers open, Escape/backdrop close, focus returns to trigger, and dispose removes listeners/backdrop/root attributes.
- [ ] **Step 2: Run** `node --test tests/drawer-controller.test.mjs`; expect module-not-found failure.
- [ ] **Step 3: Implement controller** using max-width 1024px drawer mode and max-width 640px phone defaults; only trap focus while overlay is open; all close paths share cleanup.
- [ ] **Step 4: Add responsive CSS.** Tablet retains rail/operation and uses left/right drawers; phone uses compact controls, drawers default closed, overlay maxes at `100dvh`, composer stays reachable. At 200% zoom the phone layout must avoid horizontal overflow.
- [ ] **Step 5: Run** `node --test tests/drawer-controller.test.mjs tests/operations-shell.test.mjs && npm test`; expect PASS.
- [ ] **Step 6: Commit:**

```bash
git add src/client/drawer-controller.js src/client/operations-shell.js src/client/preferences.js src/styles/prts.css scripts/build.mjs tests/drawer-controller.test.mjs lib/client.js
git commit -m "feat: add accessible PRTS session and tactical drawers"
```

### Task 7: 用 rc.7 镜像重写浏览器保真验收

**Files:** Modify `tests/e2e/theme.spec.mjs`, `tests/e2e/fixture-server.mjs`, `tests/fixtures/rc7-harness.html`; delete `tests/fixtures/harness.html`; replace four fixture screenshots.

**Interfaces:** Produces screenshot, geometry, text visibility, settings isolation and responsive acceptance.

- [ ] **Step 1: Point fixture server/tests only at `rc7-harness.html`** and delete the idealized fixture.
- [ ] **Step 2: Add failing desktop geometry assertions:** nav x < sessions x < operation x < overview x < operator x; operation width >= 560; two right panels have separate boxes.
- [ ] **Step 3: Add text assertions:** plugin labels 战术总览/行动目标/执行计划/干员档案/执行 are visible; native `New Session` stays English; relevant buttons/input/textarea/dialog/message nodes have non-zero boxes and non-hidden computed styles; dossier image computes to `object-fit: contain`.
- [ ] **Step 4: Add settings assertions:** select `P.R.T.S. 终端`, operate controls, return to General and confirm it contains no `[data-prts-settings-page]`.
- [ ] **Step 5: Add 1024, 390 and 200% zoom tests** for default drawer state, Escape/backdrop, focus restoration, composer visibility and `scrollWidth <= innerWidth`.
- [ ] **Step 6: Run** `npm run build && npx playwright test tests/e2e/theme.spec.mjs --project=chromium`; expect functional assertions PASS and old screenshots FAIL.
- [ ] **Step 7: Visually inspect then run** `npx playwright test tests/e2e/theme.spec.mjs --project=chromium --update-snapshots`; expect PASS with five regions, uncropped dossier and readable dark/light text.
- [ ] **Step 8: Commit:**

```bash
git add tests/e2e tests/fixtures
git commit -m "test: enforce PRTS fidelity against the rc7 layout"
```

### Task 8: 打包、安装和真实 NAS 验收

**Files:** Modify `package.json`, `package-lock.json`, `README.md`, `README.en.md`, `tests/e2e/theme.spec.mjs`; create live dark/light screenshots and `dsh-theme-prts-0.1.11.tgz`.

**Interfaces:** Produces version `0.1.11`, persistent Web-profile installation and verified recovery on container `deepseek-harness`.

- [ ] **Step 1: Add failing package assertions** requiring version `0.1.11`, ESM Host entry, new modules/assets, no `settings.general.item`, no old dossier filename and no unresolved imports.
- [ ] **Step 2: Run** `node --test tests/package.test.mjs`; expect version failure.
- [ ] **Step 3: Bump package/lockfile to `0.1.11`; update docs** for independent “P.R.T.S. 终端” settings, native-language boundary and `?prts-safe=1`.
- [ ] **Step 4: Run** `npm run check && npm run test:e2e && npm pack`; expect all PASS and `dsh-theme-prts-0.1.11.tgz`.
- [ ] **Step 5: Record health, copy/install/restart:**

```bash
docker inspect --format '{{.State.Status}} {{.State.Health.Status}} {{.RestartCount}}' deepseek-harness
docker cp /root/dsh-theme-prts/dsh-theme-prts-0.1.11.tgz deepseek-harness:/workspace/dsh-theme-prts-0.1.11.tgz
docker exec deepseek-harness dsh plugin --profile web add /workspace/dsh-theme-prts-0.1.11.tgz
docker restart deepseek-harness
```

- [ ] **Step 6: Run live acceptance:** `PRTS_LIVE_URL=http://192.168.10.106:3080 npx playwright test tests/e2e/theme.spec.mjs --project=chromium --grep @live --update-snapshots`; expect five-region geometry, independent settings, uncropped dossier, native text preservation, composer usability, dark/light, safe mode and zero page errors.
- [ ] **Step 7: Compare live dark/light screenshots with** `docs/assets/prts-console-concept.png`; reject if main surface stays white in dark mode, panels merge, art crops, fixed labels are not Chinese, native labels are overwritten or text is unreadable.
- [ ] **Step 8: Verify live disable and safe mode** leave no region markers/style/shell and default Harness remains usable; verify container remains `running healthy` with no unexpected restart increase.
- [ ] **Step 9: Run final evidence commands:**

```bash
npm run check
npm run test:e2e
git diff --check
git status --short
docker inspect --format '{{.State.Status}} {{.State.Health.Status}} {{.RestartCount}}' deepseek-harness
```

- [ ] **Step 10: Commit release:**

```bash
git add package.json package-lock.json README.md README.en.md tests/e2e/theme.spec.mjs tests/e2e/screenshots dsh-theme-prts-0.1.11.tgz
git commit -m "release: ship PRTS fidelity rebuild 0.1.11"
```
