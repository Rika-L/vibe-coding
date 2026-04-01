# 首页 Canvas 动画背景设计

## 概述

为首页 Hero 区域添加宁静夜空风格的 Canvas 动画背景，增强视觉吸引力和品牌氛围。

## 视觉设计

### 风格
- **主题**：宁静夜空，契合睡眠分析平台定位
- **氛围**：安详、柔和、沉浸

### 动画层次（5 层）

1. **远景星星**
   - 尺寸：1-2px
   - 数量：~80-120 颗
   - 透明度：0.3-0.6
   - 行为：缓慢闪烁，几乎静止

2. **近景星星**
   - 尺寸：2-4px
   - 数量：~30-50 颗
   - 透明度：0.5-0.9
   - 行为：闪烁频率稍快，轻微漂移

3. **星云光斑**
   - 尺寸：100-300px
   - 数量：3-5 个
   - 透明度：0.05-0.15
   - 行为：非常缓慢的漂移和呼吸效果

4. **流星**
   - 频率：每 3-8 秒一颗
   - 长度：80-150px
   - 行为：从右上向左下划过，带渐变拖尾

5. **抽象月亮光晕**
   - 位置：右上象限
   - 尺寸：200-300px 光晕范围
   - 透明度：0.1-0.2
   - 行为：柔和的呼吸效果，不画具体月亮形状

### 配色

#### 浅色主题
- 星星：`oklch(0.55 0.25 270)` (primary 紫色)
- 星云：`oklch(0.6 0.2 270 / 0.1)` (淡紫色)
- 月亮光晕：`oklch(0.7 0.15 60 / 0.15)` (暖黄色)

#### 深色主题
- 星星：`oklch(0.8 0.15 270)` (亮紫色)
- 星云：`oklch(0.5 0.2 270 / 0.15)` (深紫色)
- 月亮光晕：`oklch(0.8 0.1 60 / 0.2)` (暖黄色)

## 技术实现

### 技术栈
- **Canvas 2D API** - 原生浏览器 API，无需额外依赖
- **requestAnimationFrame** - 流畅 60fps 动画
- **React hooks** - `useRef`, `useEffect`, `useCallback`

### 组件结构

```
src/components/canvas-background.tsx
├── CanvasBackground (主组件)
│   ├── canvas ref
│   ├── animation loop
│   └── resize observer
├── Star (星星类)
├── Nebula (星云类)
├── Meteor (流星类)
└── MoonGlow (月亮光晕类)
```

### 性能优化

1. **粒子数量动态调整**
   - 根据屏幕尺寸计算粒子密度
   - 移动端减少粒子数量

2. **可见性检测**
   - 使用 `document.visibilityState`
   - 页面不可见时暂停动画循环

3. **减少重绘**
   - 使用脏矩形检测（可选）
   - 批量绘制同类型粒子

4. **内存管理**
   - 组件卸载时清理 canvas 上下文
   - 移除所有事件监听器

### 响应式设计

- 监听 `resize` 事件
- 防抖处理（200ms）
- 自动调整 canvas 尺寸和粒子密度

### 主题适配

- 读取 `document.documentElement.classList.contains('dark')`
- 监听主题变化，更新颜色配置

## 集成方式

### 位置
- 首页 `src/app/page.tsx`
- Hero 区域背后（标题 + 上传卡片）

### DOM 结构

```tsx
<div className="relative min-h-screen">
  {/* Canvas 背景 */}
  <CanvasBackground className="absolute inset-0 -z-10" />

  {/* 原有内容 */}
  <header>...</header>
  <main>...</main>
</div>
```

### 范围限制
- 仅在首页显示
- Hero 区域高度：约 `min-h-[60vh]` 或实际内容高度

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/canvas-background.tsx` | 新建 | Canvas 动画组件 |
| `src/app/page.tsx` | 修改 | 集成 Canvas 背景 |

## 风险与注意事项

1. **性能**：低端设备可能出现卡顿，需做好降级处理
2. **电池**：持续动画影响移动设备电池，考虑低电量模式
3. **无障碍**：Canvas 是纯装饰，不影响内容访问
4. **SEO**：无影响，Canvas 不包含索引内容
