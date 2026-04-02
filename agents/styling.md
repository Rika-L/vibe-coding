# 样式

## Tailwind CSS

- 原子化 CSS，无需单独样式文件
- 响应式: `sm:`, `md:`, `lg:`
- 状态: `hover:`, `focus:`, `disabled:`

## 设计系统

使用 shadcn/ui CSS 变量:

| 变量 | 用途 |
|------|------|
| `--primary` | 主色 |
| `--secondary` | 次要色 |
| `--muted` | 柔和色 |
| `--destructive` | 危险色 |
| `--border` | 边框色 |

## 主题

使用 `next-themes`，切换组件在 `@/components/theme-toggle`

## 类名合并

```typescript
import { cn } from '@/lib/utils'

className={cn('base-class', condition && 'conditional-class')}
```
