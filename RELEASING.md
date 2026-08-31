# 发布流程

本文档供维护者使用。普通用户应按照 README 的说明直接从 npm 安装。

## 可信发布者（Trusted Publisher）

本 npm 包使用 Trusted Publishing，不需要长期有效的 npm Token。npm Trusted Publisher 配置必须与以下内容完全一致：

- 组织或用户：`ash-qw`
- 仓库：`dsh-theme-prts`
- 工作流文件名：`publish-package.yml`
- Environment：留空

发布工作流位于公开 GitHub 仓库的 `.github/workflows/publish-package.yml`。只有向 `ash-qw/dsh-theme-prts` 推送 `v*` 标签时才会触发发布；工作流会校验标签是否与 `package.json` 一致，并通过 GitHub Actions OIDC 请求 npm 来源证明。

## 准备发布

1. 将 `CHANGELOG.md` 中的“未发布”替换为发布日期，并确认所有面向用户的变化都已记录。
2. 同步更新 `package.json` 和 `package-lock.json` 的版本号，不要自动创建标签。
3. 运行发布检查：

   ```bash
   npm ci
   npm run check
   npm publish --dry-run
   ```

4. 审阅预演文件清单，确认所需运行时文件、两份 README、`CHANGELOG.md`、`LICENSE` 和 `THIRD_PARTY_NOTICES.md` 均已包含，同时维护者专用文件和秘密信息没有进入发行包。
5. 将准备好的版本提交到干净历史的公开分支，并把该提交推送至公开仓库的默认分支。

## 正式发布

在准确的公开发布提交上创建版本标签，然后只将该标签推送到公开远端：

```bash
git tag vX.Y.Z <public-release-commit>
git push public vX.Y.Z
```

不要给只存在于私有仓库的提交打标签，也不要使用持久保存的 npm Token 手工发布。持续查看 `Publish public npm package` GitHub Actions 工作流，直至运行完成。

工作流成功后，以匿名方式验证 npm 公开注册表：

```bash
npm view @ash-qw/dsh-theme-prts@X.Y.Z version --registry=https://registry.npmjs.org
npm view @ash-qw/dsh-theme-prts dist-tags --json --registry=https://registry.npmjs.org
npm view @ash-qw/dsh-theme-prts@X.Y.Z dist.attestations --json --registry=https://registry.npmjs.org
```
