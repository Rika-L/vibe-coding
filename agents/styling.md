# 样式

## Tailwind CSS

- 原子化 CSS，无需单独样式文件
- 响应式: `sm:`, `md:`, `lg:`
- 状态: `hover:`, `focus:`, `disabled:`
- 动画: `tw-animate-css` 提供动画工具类

## 设计系统

使用 shadcn/ui CSS 变量:

| 变量 | 用途 |
|------|------|
| `--primary` | 主色 |
| `--secondary` | 次要色 |
| `--muted` | 柔和色 |
| `--destructive` | 危险色 |
| `--border` | 边框色 |
| `--background` | 背景色 |
| `--foreground` | 前景色 |

## 主题

- 使用 `next-themes` 实现明/暗模式
- `ThemeScript` 组件防止闪烁
- 切换组件: `@/components/theme-toggle`

## 类名合并

```typescript
import { cn } from '@/lib/utils'

className={cn('base-class', condition && 'conditional-class')}
```

## 图表主题

ECharts 图表需要根据当前主题动态调整颜色:

```typescript
const theme = useTheme()
const isDark = theme.resolvedTheme === 'dark'
```

## 动画

使用 `tw-animate-css` 提供的动画类:

- `animate-in` - 进入动画
- `animate-out` - 退出动画
- `fade-in` - 淡入
- `slide-in-from-*` - 滑入
