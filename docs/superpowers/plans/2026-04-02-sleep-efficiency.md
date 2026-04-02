# Sleep Efficiency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Dashboard 首页添加睡眠效率卡片，展示用户近期的睡眠效率

**Architecture:** 纯前端计算，使用现有 Card 组件展示效率百分比和状态标签

**Tech Stack:** Next.js, React, TypeScript, shadcn/ui

---

### Task 1: 添加睡眠效率计算函数

**Files:**
- Modify: `src/app/dashboard/page.tsx:38-49`

- [ ] **Step 1: 在 interface SleepRecord 后添加计算函数**

```typescript
// 计算睡眠效率
const calculateEfficiency = (record: SleepRecord): number => {
  if (!record.bedTime || !record.wakeTime || record.sleepDuration <= 0) {
    return 0;
  }
  const bedTime = new Date(record.bedTime).getTime();
  const wakeTime = new Date(record.wakeTime).getTime();
  const timeInBed = (wakeTime - bedTime) / (1000 * 60 * 60); // 转换为小时
  if (timeInBed <= 0) return 0;
  return Math.round((record.sleepDuration / timeInBed) * 100);
};

// 获取状态标签
const getEfficiencyStatus = (efficiency: number): { label: string; color: string } => {
  if (efficiency >= 85) return { label: '良好', color: 'bg-green-500' };
  if (efficiency >= 70) return { label: '一般', color: 'bg-yellow-500' };
  return { label: '需改善', color: 'bg-red-500' };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add sleep efficiency calculation functions"
```

---

### Task 2: 在 Dashboard 添加睡眠效率卡片

**Files:**
- Modify: `src/app/dashboard/page.tsx` (在现有卡片区域添加)

- [ ] **Step 1: 找到卡片区域，添加睡眠效率卡片**

在 Dashboard 的卡片展示区域（找到其他 Card 组件的位置），添加：

```tsx
{records.length > 0 && (() => {
  const latestRecord = records[0];
  const efficiency = calculateEfficiency(latestRecord);
  const status = getEfficiencyStatus(efficiency);
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          睡眠效率
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{efficiency}</span>
          <span className="text-lg text-muted-foreground">%</span>
        </div>
        <div className="mt-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${status.color}`}>
            {status.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
})()}
```

- [ ] **Step 2: 运行测试验证**

```bash
npm run test 2>&1 | tail -15
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add sleep efficiency card to dashboard"
```

---

### Task 3: 验证功能

**Files:**
- Test: 手动验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 验证功能**
- 访问 http://localhost:3000/dashboard
- 登录后查看是否有睡眠效率卡片
- 验证效率计算是否正确
- 验证状态标签颜色是否正确

- [ ] **Step 3: 运行完整测试**

```bash
npm run test 2>&1 | tail -15
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: complete sleep efficiency feature"
```
