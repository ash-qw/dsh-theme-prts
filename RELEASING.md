# 发布流程

本文档供维护者使用。普通用户应按照 README 的说明直接从 npm 安装。

提交信息统一遵循 [AGENTS.md](AGENTS.md)：保留英文类型前缀，描述使用中文，并提供概述修改内容的正文。

## 可信发布者（Trusted Publisher）

本 npm 包使用 Trusted Publishing，不需要长期有效的 npm Token。npm Trusted Publisher 配置必须与以下内容完全一致：

- 组织或用户：`ash-qw`
- 仓库：`dsh-theme-prts`
- 工作流文件名：`publish-package.yml`
- Environment：留空

发布工作流位于公开 GitHub 仓库的 `.github/workflows/publish-package.yml`。只有向 `ash-qw/dsh-theme-prts` 推送 `v*` 标签时才会触发发布；工作流会校验标签是否与 `package.json` 一致，并通过 GitHub Actions OIDC 请求 npm 来源证明。

## 准备发布

1. 确定上一公开版本标签，逐项核对该标签与拟发布提交的代码、文档差异。查阅上一版的 README 和 CHANGELOG，确认“新增”功能并非旧版已有；兼容性与验证范围只写实际核实的结果。将 `CHANGELOG.md` 中的“未发布”替换为发布日期，记录相对上一公开版本的变化。
2. 同步更新 `package.json` 和 `package-lock.json` 的版本号，不要自动创建标签。
3. 运行发布检查：

   ```bash
   npm ci
   npm run check
   npm publish --dry-run
   ```

4. 审阅预演文件清单，确认所需运行时文件、两份 README、`CHANGELOG.md`、`LICENSE` 和 `THIRD_PARTY_NOTICES.md` 均已包含，同时维护者专用文件和秘密信息没有进入发行包。
5. 使用 `node scripts/release-notes.mjs vX.Y.Z /tmp/release-notes.md` 提取将由发布工作流使用的 GitHub Release 正文，并准备标签注释。向用户展示拟发布版本号、上一公开版本标签、完整 Release 正文、完整标签注释、当前支持的 DSH 版本及旧版对应关系，以及检查结果。等待用户对这些具体内容明确确认；若审核后修改了发布信息，重新展示并确认。
6. 审核通过后，将对应内容提交到干净历史的公开分支，并把该提交推送至公开仓库的默认分支。推送前再次确认提交中的 `CHANGELOG.md` 与获批正文一致。审核前不得推送发布标签、手工执行 `npm publish` 或以其他方式触发发布工作流。

## 正式发布

在用户已确认发布信息且准确的发布提交进入公开默认分支后，创建带注释的版本标签。标签注释须使用获批版本，写明当前支持的 DSH 版本、相对上一公开版本的变化，以及旧版 DSH 用户应选用的主题版本。推送标签会立即触发 npm 发布；推送前核对标签指向、注释和 `CHANGELOG.md`，然后只将该标签推送到公开远端：

```bash
git tag -a -F /tmp/release-tag-message.txt vX.Y.Z <public-release-commit>
git push origin vX.Y.Z
```

不要给只存在于私有仓库的提交打标签，也不要使用持久保存的 npm Token 手工发布。持续查看 `Publish public npm package` GitHub Actions 工作流，直至运行完成。

工作流成功后，以匿名方式验证 npm 公开注册表：

```bash
npm view @ash-qw/dsh-theme-prts@X.Y.Z version --registry=https://registry.npmjs.org
npm view @ash-qw/dsh-theme-prts dist-tags --json --registry=https://registry.npmjs.org
npm view @ash-qw/dsh-theme-prts@X.Y.Z dist.attestations --json --registry=https://registry.npmjs.org
```

工作流会在发布 npm 前校验 `CHANGELOG.md` 存在对应的 `## X.Y.Z - 日期` 非空章节；npm 发布成功后，独立的 `release` 任务从该章节提取中文说明并创建 GitHub Release，保留历史 Release。正式版的 Latest 由 GitHub 自动判定，带预发布后缀的标签标记为预发布且不设为 Latest。已存在的 Release 不会被覆盖。

如果 npm 已成功而 `release` 任务失败，在 Actions 中仅重跑失败的任务，避免重复发布同一 npm 版本。发布后还应验证对应的 GitHub Release，以及 `/repos/ash-qw/dsh-theme-prts/releases/latest` 返回的最新正式版本。

补建历史 Release 时，使用已有远端标签并显式指定 `--latest=false`，不重新发布 npm：

```bash
node scripts/release-notes.mjs vX.Y.Z /tmp/release-notes.md
gh release create vX.Y.Z --verify-tag --latest=false --title vX.Y.Z --notes-file /tmp/release-notes.md
```
