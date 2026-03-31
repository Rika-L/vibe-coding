# 工作流程

## Git 提交

### 提交时机
- 每完成一个独立功能后**必须提交**
- 修复 bug 后立即提交
- 重构完成后提交

### 提交格式
```
<type>: <description>

[optional body]
```

### Type 类型
| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户登录功能` |
| `fix` | 修复 bug | `fix: 修复登录验证失败问题` |
| `refactor` | 重构 | `refactor: 重构用户模块` |
| `docs` | 文档 | `docs: 更新 README` |
| `style` | 样式 | `style: 调整按钮间距` |
| `test` | 测试 | `test: 添加登录测试用例` |
| `chore` | 其他 | `chore: 更新依赖版本` |

## 新增依赖

### 流程
1. 安装依赖：`npm install <package>`
2. 更新 `AGENTS.md` 中的技术栈列表
3. 记录用途和版本

### 示例
```
### 数据验证
- zod - 运行时类型验证，v3.22.0
```

## 问题处理

### 遇到问题时的处理流程

1. **UI/UX 问题** → 使用 `ui-ux-pro-max` skill
2. **调试问题** → 使用 `superpowers:systematic-debugging` skill
3. **创建新功能** → 使用 `superpowers:brainstorming` skill
4. **代码审查** → 使用 `superpowers:requesting-code-review` skill

### 不确定时
- 先询问用户，不要猜测
- 提供多个方案让用户选择
