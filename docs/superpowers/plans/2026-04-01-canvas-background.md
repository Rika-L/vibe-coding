# Canvas 动画背景实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为首页 Hero 区域添加宁静夜空风格的 Canvas 动画背景，包含星星、星云、流星和抽象月亮光晕。

**Architecture:** 创建独立的 CanvasBackground 组件，使用 Canvas 2D API 绘制 5 层动画效果。通过 requestAnimationFrame 实现流畅动画，支持深色/浅色主题切换，并包含性能优化（可见性检测、响应式粒子数量）。

**Tech Stack:** React 19, Canvas 2D API, requestAnimationFrame, Tailwind CSS 4

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/canvas-background.tsx` | 新建 | Canvas 动画背景组件 |
| `src/app/page.tsx` | 修改 | 集成 Canvas 背景 |
| `__test__/unit/components/canvas-background.test.ts` | 新建 | 组件单元测试 |

---

### Task 1: 创建 Canvas 动画基础结构

**Files:**
- Create: `src/components/canvas-background.tsx`

- [ ] **Step 1: 创建 CanvasBackground 组件基础结构**

```tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface CanvasBackgroundProps {
  className?: string;
}

export function CanvasBackground({ className }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // 初始化 canvas 尺寸
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }, []);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // TODO: 绘制各层效果

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // 初始化
  useEffect(() => {
    resizeCanvas();
    animate();

    // 监听窗口大小变化
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: 提交基础结构**

```bash
git add src/components/canvas-background.tsx
git commit -m "feat: 添加 CanvasBackground 组件基础结构"
```

---

### Task 2: 实现星星效果

**Files:**
- Modify: `src/components/canvas-background.tsx`

- [ ] **Step 1: 添加星星类型和配置**

在 `canvas-background.tsx` 顶部添加：

```tsx
// 星星配置
interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: 'far' | 'near';
}

// 主题颜色配置
const COLORS = {
  light: {
    star: 'rgba(128, 90, 213, 0.8)', // primary 紫色
    starFar: 'rgba(128, 90, 213, 0.4)',
  },
  dark: {
    star: 'rgba(180, 150, 255, 0.9)',
    starFar: 'rgba(180, 150, 255, 0.5)',
  },
};

// 检测当前主题
function getIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}
```

- [ ] **Step 2: 添加星星生成和绘制逻辑**

在组件内部添加：

```tsx
const starsRef = useRef<Star[]>([]);

// 生成星星
const generateStars = useCallback((width: number, height: number): Star[] => {
  const stars: Star[] = [];
  const baseCount = Math.floor((width * height) / 8000);

  // 远景星星
  const farCount = Math.floor(baseCount * 0.7);
  for (let i = 0; i < farCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      layer: 'far',
    });
  }

  // 近景星星
  const nearCount = Math.floor(baseCount * 0.3);
  for (let i = 0; i < nearCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.4 + 0.4,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      layer: 'near',
    });
  }

  return stars;
}, []);

// 绘制星星
const drawStars = useCallback((
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  time: number,
  isDark: boolean
) => {
  const colors = isDark ? COLORS.dark : COLORS.light;

  stars.forEach((star) => {
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
    const currentOpacity = star.opacity + twinkle * 0.2;
    const color = star.layer === 'far' ? colors.starFar : colors.star;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(/[\d.]+\)$/, `${Math.max(0.1, currentOpacity)})`);
    ctx.fill();

    // 近景星星添加光晕
    if (star.layer === 'near' && star.size > 2) {
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 3
      );
      gradient.addColorStop(0, color.replace(/[\d.]+\)$/, `${currentOpacity * 0.3})`));
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  });
}, []);
```

- [ ] **Step 3: 更新动画循环和初始化**

更新 `resizeCanvas` 函数：

```tsx
const resizeCanvas = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;

  // 重新生成星星
  starsRef.current = generateStars(canvas.width, canvas.height);
}, [generateStars]);
```

更新 `animate` 函数：

```tsx
const animate = useCallback(() => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const time = Date.now() / 1000;
  const isDark = getIsDark();

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制星星
  drawStars(ctx, starsRef.current, time, isDark);

  animationRef.current = requestAnimationFrame(animate);
}, [drawStars]);
```

- [ ] **Step 4: 提交星星效果**

```bash
git add src/components/canvas-background.tsx
git commit -m "feat: 实现星星闪烁效果"
```

---

### Task 3: 实现星云光斑效果

**Files:**
- Modify: `src/components/canvas-background.tsx`

- [ ] **Step 1: 添加星云类型和配置**

在类型定义区域添加：

```tsx
// 星云配置
interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  driftX: number;
  driftY: number;
  phase: number;
}
```

更新 `COLORS` 配置：

```tsx
const COLORS = {
  light: {
    star: 'rgba(128, 90, 213, 0.8)',
    starFar: 'rgba(128, 90, 213, 0.4)',
    nebula: 'rgba(128, 90, 213, 0.08)',
  },
  dark: {
    star: 'rgba(180, 150, 255, 0.9)',
    starFar: 'rgba(180, 150, 255, 0.5)',
    nebula: 'rgba(128, 90, 213, 0.12)',
  },
};
```

- [ ] **Step 2: 添加星云生成和绘制逻辑**

在组件内部添加：

```tsx
const nebulasRef = useRef<Nebula[]>([]);

// 生成星云
const generateNebulas = useCallback((width: number, height: number): Nebula[] => {
  const nebulas: Nebula[] = [];
  const count = Math.floor(Math.random() * 2) + 3;

  for (let i = 0; i < count; i++) {
    nebulas.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 100 + 80,
      color: COLORS.light.nebula,
      opacity: Math.random() * 0.08 + 0.03,
      driftX: (Math.random() - 0.5) * 0.1,
      driftY: (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return nebulas;
}, []);

// 绘制星云
const drawNebulas = useCallback((
  ctx: CanvasRenderingContext2D,
  nebulas: Nebula[],
  time: number,
  width: number,
  height: number,
  isDark: boolean
) => {
  nebulas.forEach((nebula) => {
    // 缓慢漂移
    nebula.x += nebula.driftX;
    nebula.y += nebula.driftY;

    // 边界循环
    if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
    if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
    if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;
    if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;

    // 呼吸效果
    const breathe = Math.sin(time * 0.2 + nebula.phase) * 0.02;
    const currentOpacity = nebula.opacity + breathe;
    const currentRadius = nebula.radius + Math.sin(time * 0.15 + nebula.phase) * 10;

    const gradient = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, currentRadius
    );

    const color = isDark ? COLORS.dark.nebula : COLORS.light.nebula;
    gradient.addColorStop(0, color.replace(/[\d.]+\)$/, `${currentOpacity})`));
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}, []);
```

- [ ] **Step 3: 更新初始化和动画循环**

更新 `resizeCanvas`：

```tsx
const resizeCanvas = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;

  starsRef.current = generateStars(canvas.width, canvas.height);
  nebulasRef.current = generateNebulas(canvas.width, canvas.height);
}, [generateStars, generateNebulas]);
```

更新 `animate`：

```tsx
const animate = useCallback(() => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const time = Date.now() / 1000;
  const isDark = getIsDark();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制星云（在星星之前，作为背景层）
  drawNebulas(ctx, nebulasRef.current, time, canvas.width, canvas.height, isDark);

  // 绘制星星
  drawStars(ctx, starsRef.current, time, isDark);

  animationRef.current = requestAnimationFrame(animate);
}, [drawStars, drawNebulas]);
```

- [ ] **Step 4: 提交星云效果**

```bash
git add src/components/canvas-background.tsx
git commit -m "feat: 实现星云光斑效果"
```

---

### Task 4: 实现抽象月亮光晕效果

**Files:**
- Modify: `src/components/canvas-background.tsx`

- [ ] **Step 1: 添加月亮光晕配置**

更新 `COLORS`：

```tsx
const COLORS = {
  light: {
    star: 'rgba(128, 90, 213, 0.8)',
    starFar: 'rgba(128, 90, 213, 0.4)',
    nebula: 'rgba(128, 90, 213, 0.08)',
    moonGlow: 'rgba(255, 220, 150, 0.15)',
  },
  dark: {
    star: 'rgba(180, 150, 255, 0.9)',
    starFar: 'rgba(180, 150, 255, 0.5)',
    nebula: 'rgba(128, 90, 213, 0.12)',
    moonGlow: 'rgba(255, 220, 150, 0.2)',
  },
};
```

- [ ] **Step 2: 添加月亮光晕绘制逻辑**

在组件内部添加：

```tsx
// 绘制抽象月亮光晕
const drawMoonGlow = useCallback((
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isDark: boolean
) => {
  // 月亮位置：右上象限
  const moonX = width * 0.8;
  const moonY = height * 0.2;

  // 呼吸效果
  const breathe = Math.sin(time * 0.3) * 0.03;
  const baseOpacity = isDark ? 0.2 : 0.12;
  const currentOpacity = baseOpacity + breathe;

  // 多层光晕
  const layers = [
    { radius: 250, opacity: currentOpacity * 0.3 },
    { radius: 180, opacity: currentOpacity * 0.5 },
    { radius: 100, opacity: currentOpacity * 0.7 },
  ];

  const color = isDark ? COLORS.dark.moonGlow : COLORS.light.moonGlow;

  layers.forEach((layer) => {
    const gradient = ctx.createRadialGradient(
      moonX, moonY, 0,
      moonX, moonY, layer.radius
    );
    gradient.addColorStop(0, color.replace(/[\d.]+\)$/, `${layer.opacity})`));
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(moonX, moonY, layer.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}, []);
```

- [ ] **Step 3: 更新动画循环**

更新 `animate`：

```tsx
const animate = useCallback(() => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const time = Date.now() / 1000;
  const isDark = getIsDark();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制月亮光晕（最底层）
  drawMoonGlow(ctx, canvas.width, canvas.height, time, isDark);

  // 绘制星云
  drawNebulas(ctx, nebulasRef.current, time, canvas.width, canvas.height, isDark);

  // 绘制星星
  drawStars(ctx, starsRef.current, time, isDark);

  animationRef.current = requestAnimationFrame(animate);
}, [drawStars, drawNebulas, drawMoonGlow]);
```

- [ ] **Step 4: 提交月亮光晕效果**

```bash
git add src/components/canvas-background.tsx
git commit -m "feat: 实现抽象月亮光晕效果"
```

---

### Task 5: 实现流星效果

**Files:**
- Modify: `src/components/canvas-background.tsx`

- [ ] **Step 1: 添加流星类型和配置**

在类型定义区域添加：

```tsx
// 流星配置
interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  active: boolean;
  tail: { x: number; y: number; opacity: number }[];
}
```

- [ ] **Step 2: 添加流星生成和绘制逻辑**

在组件内部添加：

```tsx
const meteorRef = useRef<Meteor | null>(null);
const nextMeteorTimeRef = useRef(0);

// 生成流星
const generateMeteor = useCallback((width: number, height: number): Meteor => {
  const startX = Math.random() * width * 0.5 + width * 0.3;
  const startY = -20;

  return {
    x: startX,
    y: startY,
    length: Math.random() * 80 + 60,
    speed: Math.random() * 8 + 6,
    opacity: Math.random() * 0.5 + 0.4,
    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // 约 45 度角
    active: true,
    tail: [],
  };
}, []);

// 绘制流星
const drawMeteor = useCallback((
  ctx: CanvasRenderingContext2D,
  meteor: Meteor | null,
  width: number,
  height: number,
  isDark: boolean
) => {
  if (!meteor || !meteor.active) return;

  const tailLength = meteor.length;
  const tailX = meteor.x - Math.cos(meteor.angle) * tailLength;
  const tailY = meteor.y - Math.sin(meteor.angle) * tailLength;

  // 创建渐变拖尾
  const gradient = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
  const baseColor = isDark ? '200, 180, 255' : '180, 150, 255';
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, `rgba(${baseColor}, ${meteor.opacity * 0.3})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, ${meteor.opacity})`);

  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(meteor.x, meteor.y);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 流星头部光点
  ctx.beginPath();
  ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
  ctx.fill();

  // 更新位置
  meteor.x += Math.cos(meteor.angle) * meteor.speed;
  meteor.y += Math.sin(meteor.angle) * meteor.speed;

  // 检查是否超出边界
  if (meteor.x > width + 50 || meteor.y > height + 50) {
    meteor.active = false;
  }
}, []);
```

- [ ] **Step 3: 更新动画循环添加流星逻辑**

更新 `animate`：

```tsx
const animate = useCallback(() => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const time = Date.now() / 1000;
  const isDark = getIsDark();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制月亮光晕
  drawMoonGlow(ctx, canvas.width, canvas.height, time, isDark);

  // 绘制星云
  drawNebulas(ctx, nebulasRef.current, time, canvas.width, canvas.height, isDark);

  // 绘制星星
  drawStars(ctx, starsRef.current, time, isDark);

  // 流星逻辑
  const now = Date.now();
  if (!meteorRef.current?.active && now > nextMeteorTimeRef.current) {
    meteorRef.current = generateMeteor(canvas.width, canvas.height);
    // 3-8 秒后出现下一颗流星
    nextMeteorTimeRef.current = now + (Math.random() * 5000 + 3000);
  }
  drawMeteor(ctx, meteorRef.current, canvas.width, canvas.height, isDark);

  animationRef.current = requestAnimationFrame(animate);
}, [drawStars, drawNebulas, drawMoonGlow, drawMeteor, generateMeteor]);
```

- [ ] **Step 4: 提交流星效果**

```bash
git add src/components/canvas-background.tsx
git commit -m "feat: 实现流星划过效果"
```

---

### Task 6: 添加性能优化

**Files:**
- Modify: `src/components/canvas-background.tsx`

- [ ] **Step 1: 添加可见性检测和防抖**

在组件内部添加：

```tsx
const isVisibleRef = useRef(true);
const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// 可见性检测
useEffect(() => {
  const handleVisibilityChange = () => {
    isVisibleRef.current = !document.hidden;

    if (isVisibleRef.current && !animationRef.current) {
      animate();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [animate]);
```

- [ ] **Step 2: 更新动画循环添加可见性检测**

更新 `animate` 函数开头：

```tsx
const animate = useCallback(() => {
  // 可见性检测
  if (!isVisibleRef.current) {
    animationRef.current = null;
    return;
  }

  const canvas = canvasRef.current;
  // ... 其余代码不变
}, [drawStars, drawNebulas, drawMoonGlow, drawMeteor, generateMeteor]);
```

- [ ] **Step 3: 更新 resize 添加防抖**

更新 `resizeCanvas`：

```tsx
const resizeCanvas = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;

  starsRef.current = generateStars(canvas.width, canvas.height);
  nebulasRef.current = generateNebulas(canvas.width, canvas.height);
}, [generateStars, generateNebulas]);

// 防抖的 resize 处理
const handleResize = useCallback(() => {
  if (resizeTimeoutRef.current) {
    clearTimeout(resizeTimeoutRef.current);
  }
  resizeTimeoutRef.current = setTimeout(() => {
    resizeCanvas();
  }, 200);
}, [resizeCanvas]);
```

更新 useEffect：

```tsx
useEffect(() => {
  resizeCanvas();
  animate();

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, [resizeCanvas, animate, handleResize]);
```

- [ ] **Step 4: 提交性能优化**

```bash
git add src/components/canvas-background.tsx
git commit -m "perf: 添加可见性检测和 resize 防抖优化"
```

---

### Task 7: 添加主题切换监听

**Files:**
- Modify: `src/components/canvas-background.tsx`

- [ ] **Step 1: 添加主题变化监听**

在组件内部添加：

```tsx
const isDarkRef = useRef(getIsDark());

// 监听主题变化
useEffect(() => {
  const observer = new MutationObserver(() => {
    isDarkRef.current = getIsDark();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => {
    observer.disconnect();
  };
}, []);
```

- [ ] **Step 2: 更新 animate 使用 ref**

更新 `animate` 函数：

```tsx
const animate = useCallback(() => {
  if (!isVisibleRef.current) {
    animationRef.current = null;
    return;
  }

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const time = Date.now() / 1000;
  const isDark = isDarkRef.current; // 使用 ref 而非函数调用

  // ... 其余代码不变
}, [drawStars, drawNebulas, drawMoonGlow, drawMeteor, generateMeteor]);
```

- [ ] **Step 3: 提交主题监听**

```bash
git add src/components/canvas-background.tsx
git commit -m "feat: 添加主题切换监听"
```

---

### Task 8: 集成到首页

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 导入并添加 CanvasBackground 组件**

在 `page.tsx` 顶部导入：

```tsx
import { CanvasBackground } from '@/components/canvas-background';
```

修改 return 语句的最外层 div：

```tsx
return (
  <div className="relative flex min-h-screen flex-col">
    {/* Canvas 背景 - 仅覆盖 Hero 区域 */}
    <div className="absolute inset-0 h-[70vh] overflow-hidden">
      <CanvasBackground className="h-full w-full" />
    </div>

    {/* 原有内容 */}
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      {/* ... header 内容不变 */}
    </header>

    <div className="container relative z-10 mx-auto px-4 py-8">
      {/* ... 其余内容不变，注意将原来的 className="container mx-auto px-4 py-8" 改为上面的结构 */}
    </div>

    {/* ... footer 和 dialog 不变 */}
  </div>
);
```

- [ ] **Step 2: 调整 Hero 区域结构**

将原来的主内容区域调整为：

```tsx
{/* Main Content */}
<div className="container relative z-10 mx-auto px-4 py-8">
  <div className="mx-auto max-w-2xl text-center">
    {/* Hero Section - 之前的内容 */}
    {/* ... */}
  </div>
</div>
```

- [ ] **Step 3: 提交首页集成**

```bash
git add src/app/page.tsx
git commit -m "feat: 集成 Canvas 动画背景到首页"
```

---

### Task 9: 添加单元测试

**Files:**
- Create: `__test__/unit/components/canvas-background.test.ts`

- [ ] **Step 1: 创建测试文件**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CanvasBackground } from '@/components/canvas-background';

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as unknown as CanvasRenderingContext2D);

describe('CanvasBackground', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render canvas element', () => {
    render(<CanvasBackground />);
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('should apply custom className', () => {
    render(<CanvasBackground className="test-class" />);
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveClass('test-class');
  });

  it('should be marked as aria-hidden', () => {
    render(<CanvasBackground />);
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('should initialize canvas context', () => {
    render(<CanvasBackground />);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npm run test:run -- __test__/unit/components/canvas-background.test.ts
```

Expected: All tests pass

- [ ] **Step 3: 提交测试**

```bash
git add __test__/unit/components/canvas-background.test.ts
git commit -m "test: 添加 CanvasBackground 组件单元测试"
```

---

### Task 10: 最终验证和文档更新

**Files:**
- Modify: `agents/components.md`

- [ ] **Step 1: 运行完整测试套件**

```bash
npm run test:run
```

Expected: All tests pass

- [ ] **Step 2: 本地验证效果**

```bash
npm run dev
```

打开浏览器访问 http://localhost:3000，验证：
1. 首页显示 Canvas 动画背景
2. 星星闪烁效果正常
3. 流星偶尔划过
4. 月亮光晕可见
5. 深色/浅色主题切换正常
6. 其他页面不受影响

- [ ] **Step 3: 更新组件文档**

在 `agents/components.md` 的自定义组件部分添加：

```markdown
- Canvas 背景动画
  - `canvas-background.tsx` - 首页 Hero 区域夜空动画背景
```

- [ ] **Step 4: 提交文档更新**

```bash
git add agents/components.md
git commit -m "docs: 更新组件文档，添加 CanvasBackground"
```

---

## 自检清单

- [x] Spec 覆盖：所有设计文档中的功能都有对应任务
- [x] 无占位符：所有代码都是完整实现
- [x] 类型一致性：所有类型定义在各任务中保持一致
