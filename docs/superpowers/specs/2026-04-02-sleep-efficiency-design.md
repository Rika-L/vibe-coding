# 睡眠效率计算功能设计

## 概述

在 Dashboard 首页添加睡眠效率卡片，展示用户近期的睡眠效率。

## 需求

- 位置：Dashboard 首页
- 计算方式：纯前端计算 `sleepDuration / (wakeTime - bedTime) × 100%`
- 显示：效率百分比 + 状态标签

## 状态阈值

| 效率范围 | 状态标签 | 颜色 |
|----------|----------|------|
| ≥ 85% | 良好 | green |
| 70-84% | 一般 | yellow |
| < 70% | 需改善 | red |

## 实现方案

### 前端计算

```typescript
// 计算睡眠效率
const calculateEfficiency = (record: SleepRecord) => {
  const timeInBed = (new Date(record.wakeTime).getTime() - new Date(record.bedTime).getTime()) / (1000 * 60 * 60);
  return Math.round((record.sleepDuration / timeInBed) * 100);
};
```

### UI 组件

- 使用现有 Card 组件
- 显示：效率百分比（大字）+ 状态标签（Badge）
- 数据源：使用现有的 sleepRecords API，取最近一条记录

## 验收标准

1. Dashboard 显示睡眠效率卡片
2. 效率计算正确（保留整数）
3. 状态标签根据阈值正确显示颜色
