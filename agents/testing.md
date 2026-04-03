# 测试

## 框架

| 类型 | 工具 |
|------|------|
| 单元测试 | Vitest |
| 组件测试 | Vitest + Testing Library |
| 集成测试 | Vitest |
| E2E 测试 | Playwright |

## 命令

```bash
npm run test              # 单元测试 (watch)
npm run test:run          # 单元测试 (单次)
npm run test:coverage     # 单元测试 + 覆盖率
npm run test:components   # 组件测试
npm run test:integration  # 集成测试
npm run test:all          # 单元 + 集成
npm run test:e2e          # E2E 测试
npm run test:e2e:ui       # E2E UI 模式
npm run test:e2e:debug    # E2E 调试模式
```

## 目录

```
__test__/
├── unit/           # 单元测试
├── components/     # 组件测试
├── integration/    # 集成测试
└── e2e/            # E2E 测试
    ├── login.spec.ts
    ├── register.spec.ts
    ├── dashboard.spec.ts
    ├── chat.spec.ts
    └── settings.spec.ts
```

## 配置文件

- `vitest.config.ts` - 单元测试
- `vitest.config.components.ts` - 组件测试
- `vitest.config.integration.ts` - 集成测试
- `playwright.config.ts` - E2E 测试

## WSL2

运行 E2E 前安装依赖:

```bash
sudo npx playwright install-deps chromium
```

## 测试覆盖

使用 `npm run test:coverage` 生成覆盖率报告，输出到 `coverage/` 目录。
