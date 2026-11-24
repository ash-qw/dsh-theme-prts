# 本地 DSH 变更记录持久化适配

仅用于本机已核对的 DSH `0.2.2-rc.5`，不进入主题 npm 包。原生 `workspace-changes` 只在内存和临时目录保留摘要与比较，本工具生成独立插件，沿用原生记录器、路径规则、Git 快照、文件捕获、行比较和 HTTP 接口。

构建器校验上游编译模块的 SHA-256，并以有唯一性断言的替换插入持久化调用。生成模块启动时再次核对实际宿主哈希；更换宿主版本前必须重新审阅适配，不能直接沿用。上游模块不被覆盖，MIT 声明随生成插件保留。

每轮记录写入 `/data/workspace-changes/<session-id SHA-256>/<event-seq>/`。`record.json` 保留版本、原始 session ID、事件序号、来源、摘要和各 Diff 的 SHA-256；`0.json` 等保存原生 Diff，包括二进制／过大提示。文件以 0600 写入，目录为 0700。逐文件同步后，通过目录原子重命名发布完整记录；记录写入在原生 `stopping()` 返回前完成。清理临时快照前等待已排队的保存完成。

启动先加载摘要索引，按需读取并校验 Diff；服务仍使用原生接口。释放会话和重启不删除归档；没有自动淘汰策略，备份和磁盘清理需同时考虑这个目录。故障写入不会覆盖已提交记录，不完整目录不进入索引；损坏记录给出日志警告。落盘失败时原生记录仍可暂时读取，同时写入 `workspace-changes:` 警告，不能认为已完成持久化。

当前界限与宿主默认配置配套：每记录最多 500 个保留文件；摘要 JSON 最大 2 MiB，单文件比较 JSON 最大 32 MiB。归档保存原生接口返回的带上下文差异，不额外复制整份工作区。将宿主 `maxFiles` 等限制改大前需同步审核归档限制。

## 部署与回退

1. 先读取现存 session 日志中的 `workspace/changes` 索引，通过认证的原生 summary/diff API 导出当前仍可读取的数据。不能仅备份 session 日志就重启。
2. 备份 profile 的 `cordis.patch.yml`。用 `build-adapter.mjs UPSTREAM_INDEX OUTPUT_DIRECTORY` 生成插件，将产物安装到 `/data/local-plugins/dsh-workspace-changes-durable/`，由 DSH 进程用户拥有；产物目录的 `node_modules` 链接到当前 DSH 的依赖目录。
3. 对已核对的导出件或日志恢复件使用 `import-records.mjs ARCHIVE_ROOT RECORDS_JSON`，保留来源；每个输入必须含原始 session ID、事件序号、摘要和全部 Diff。不要用当前工作区猜测缺失历史内容。
4. profile 停用原记录器并插入适配记录器（patch 的 `name` 是匹配断言，不能用于替换模块）：

   ```yaml
   - id: workspace-changes
     disabled: true
   - insert:
       - id: workspace-changes-durable
         name: /data/local-plugins/dsh-workspace-changes-durable/index.mjs
         config:
           archiveRoot: /data/workspace-changes
   ```

5. 重启后核对服务健康、摘要／逐文件 Diff 的 HTTP 响应和原生卡片。再重启一次，验证同一摘要和所有 Diff 的内容哈希一致。

回退时还原 profile 备份并重启。归档目录保留；回退到原生临时服务后，已有归档暂时不会显示。宿主或插件更新后需重新核对版本，不声明其他版本或桌面端已验证。

## 检查

```bash
node --test tools/workspace-changes-durable/archive.test.mjs
DSH_DURABLE_ADAPTER=/path/to/generated/index.mjs node --test tools/workspace-changes-durable/adapter.test.mjs
```

第二项需在有对应 DSH 依赖的环境中执行，覆盖原生非 Git 捕获、完成与释放竞争、磁盘故障、Git 快照、忽略文件和删除文件。测试只操作临时目录，不请求模型或改写真实会话。
