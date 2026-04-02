# 测试

## 框架

| 类型 | 工具 |
|------|------|
| 单元测试 | Vitest |
| 集成测试 | Vitest |
| E2E 测试 | Playwright |

## 命令

```bash
npm run test              # 单元测试 (watch)
npm run test:run          # 单元测试 (单次)
npm run test:integration  # 集成测试
npm run test:e2e          # E2E 测试
npm run test:e2e:ui       # E2E UI 模式
```

## 目录

```
__test__/
├── unit/           # 单元测试
├── integration/    # 集成测试
└── e2e/            # E2E 测试
```

## WSL2

运行 E2E 前安装依赖:

```bash
sudo npx playwright install-deps chromium
```
