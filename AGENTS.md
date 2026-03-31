<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AI 工作指南

## 快速导航

遇到问题？查找对应指南：

| 问题类型 | 指南文件 |
|---------|---------|
| 🧩 组件开发 | [agents/components.md](agents/components.md) |
| 🎨 样式问题 | [agents/styling.md](agents/styling.md) |
| 📝 代码规范 | [agents/code-standards.md](agents/code-standards.md) |
| 🔄 工作流程 | [agents/workflow.md](agents/workflow.md) |
| 📦 技术栈 | [agents/tech-stack.md](agents/tech-stack.md) |

## 目录结构

```
├── app/              # Next.js App Router 页面
├── components/       # React 组件
│   └── ui/           # shadcn/ui 组件
├── lib/              # 工具函数
├── types/            # TypeScript 类型定义
├── agents/           # AI 指南文档
├── public/           # 静态资源
└── prisma/           # 数据库 schema
```

## 核心原则

1. **不要**随意删除现有代码
2. **不要**提交敏感信息
3. **不要**在 `node_modules` 中修改文件
4. 不确定时，先询问用户

## 新需求处理流程

当用户提出全新需求时，**必须**先执行以下步骤：

1. **生成文档 Checklist**：在开始任何实现之前，生成一份 checklist 文档给用户确认
2. **用户确认**：等待用户确认或修改 checklist
3. **开始实现**：用户确认后，按照 checklist 逐步实现

### Checklist 模板

```markdown
## 需求：[需求名称]

### 📋 实现计划

- [ ] **步骤 1**: [描述]
- [ ] **步骤 2**: [描述]
- [ ] **步骤 3**: [描述]

### 📁 涉及文件

- `[文件路径]` - [修改说明]

### ⚠️ 注意事项

- [潜在风险或注意事项]

---
请确认以上计划是否正确，或提出修改意见。
```
