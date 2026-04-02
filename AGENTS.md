# AI 工作指南

## 项目概述

睡眠数据分析平台 - 用户上传睡眠数据，查看可视化报告，获取 AI 分析建议。

## 核心原则

1. **不要**随意删除现有代码
2. **不要**提交敏感信息
3. 不确定时先询问
4. 完成大功能后更新 `agents/` 文档

## 工作流程

### 新需求开发

```
创建 Worktree → 开发实现 → 新 agent 审查 → 合并 → 清理
```

- 使用 `superpowers:using-git-worktrees` 创建隔离环境
- 使用 `superpowers:brainstorming` 设计方案
- 使用 `superpowers:requesting-code-review` 审查（新 agent 会话）

### Bug 修复

```
创建 Worktree → 系统调试 → 修复 → 新 agent 审查 → 合并 → 清理
```

- 使用 `superpowers:systematic-debugging` 先找根因再修复
- 禁止猜测性修复

## 问题处理

| 问题类型 | 处理方式 |
|---------|---------|
| UI/UX 设计 | `ui-ux-pro-max` skill |
| 调试问题 | `superpowers:systematic-debugging` skill |
| 新功能设计 | `superpowers:brainstorming` skill |
| 代码审查 | `superpowers:requesting-code-review` skill |

## 文档索引

| 文件 | 用途 |
|------|------|
| [architecture.md](agents/architecture.md) | 目录结构、数据模型 |
| [tech-stack.md](agents/tech-stack.md) | 技术栈 |
| [api-routes.md](agents/api-routes.md) | API 路由列表 |
| [components.md](agents/components.md) | 组件目录 |
| [testing.md](agents/testing.md) | 测试命令 |

## 常用命令

```bash
npm run dev           # 启动开发服务器
npm run build         # 构建生产版本
npx prisma studio     # 数据库管理界面
```
