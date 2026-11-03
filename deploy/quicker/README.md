# Quicker 自部署版本

基于上游 `v5.1.0`，保留正式环境已有的 nb/no → nb 别名、参数错误 HTTP 400 兼容修复。

初始化修复取消循环补齐首条请求的词元；性能探测允许模型输出触及有界生成上限，仍拒绝无效输出及后端执行错误。实际翻译继续要求 EOS，避免返回截断译文。未修改模型及转换算法。

## 构建与验证

```text
bun install --frozen-lockfile --ignore-scripts
cd ui
bun install --frozen-lockfile --ignore-scripts
cd ..
bun test tests/engine-initialization.test.ts tests/backend.test.ts tests/engine-html.test.ts tests/quicker-compatibility.test.ts
bun run typecheck
bun run build:node
```

Docker 构建上下文为仓库根目录，使用 `deploy/quicker/Dockerfile`。
基底 `mtranserver:5.1.0-local.1` 是现有服务器上的本地镜像，预期 ID 为
`sha256:57b278f32cd7630a349964dc82596430de89cd72fd88b0ccf431aca73fea2cc1`。
它不在公共镜像仓库中；本 Dockerfile 用于已有 Quicker 部署环境。其他环境可使用仓库根 Dockerfile 完整构建。

## 隔离及发布条件

- 测试容器使用独立端口、独立配置与模型副本，禁止修改正式容器和模型。
- 冷启动首条“好的”“嗯”“哈哈哈哈”等必须成功；实际翻译未输出 EOS 时仍应失败。
- 验证模型可达的全部 115 个直接方向、代表性英语中转、nb/no 别名及原有 22 项接口兼容用例。
- 验证实际正式环境的 60 秒闲置回收后，首条短文本仍可翻译。
- 部署前备份容器配置、Compose 与镜像 ID；使用验证通过的同一镜像替换正式容器。
- 保留旧镜像、旧模型及旧版 8989 服务。若部署后复查失败，恢复旧 Compose/镜像并复查健康状态与翻译。

本次范围仅修复初始化探测。实际输入导致模型循环生成的处理属于后续独立问题，不能通过忽略实际翻译 EOS 检查来掩盖。
