# 同一天多篇日记共存

## 问题

当前日记存储模型是每天一篇。用户手写日记后点击「生成今日日记」，AI 日记会覆盖手写日记。用户无法在同一天保留多篇日记。

## 目标

同一天可以有多篇日记（手写 + AI 生成），以时间线列表形式展示，点击切换查看详情。

## 数据模型变化

### 存储结构

```
之前：每天一个 DiaryEntry 对象
  localStorage["parallel-universe-diaries"] = [
    { id, date: "2026-06-05", content, ... }   // 只有一篇
  ]

之后：每天一个 DiaryEntry 数组（按创建时间排序）
  localStorage["parallel-universe-diaries"] = [
    { id, date: "2026-06-05", type: "handwritten", content, ... },
    { id, date: "2026-06-05", type: "ai", content, ... },
    { id, date: "2026-06-04", type: "ai", content, ... },
  ]
```

### 存储 API 变化

| 函数 | 之前 | 之后 |
|------|------|------|
| `getDiaryByDate(date)` | 返回单篇 `DiaryEntry \| null` | 删除，替换为 `getDiariesByDate` |
| `getDiariesByDate(date)` | 不存在 | 新增，返回 `DiaryEntry[]` |
| `saveDiary(diary)` | 按 date 覆盖 | 改名为 `appendDiary`，追加到数组 |
| `deleteDiary(date)` | 按 date 删除整篇 | 改名为 `deleteDiaryById(id)`，按 id 删除单篇 |

### 兼容性

旧数据格式（单篇对象数组中只有一篇同日期的）无需迁移，`appendDiary` 天然兼容。

## UI 变化

### 左侧面板

在事件列表和操作按钮下方，新增「今日日记」区域：

```
┌──────────────────────────┐
│  今日事件 (3)             │
│  · 08:30 咖啡机事件       │
│  · 12:15 猫咪演讲         │
│  · 18:45 时间裂缝         │
│                          │
│  [✨ 生成今日日记]         │
│  [✍️ 手动写日记]          │
├──────────────────────────┤
│  今日日记 (2)       ← 新增 │
│  ┌──────────────────────┐ │
│  │ 📝 AI · 荒诞编年史    │ │
│  │ 14:30 · 约800字       │ │
│  └──────────────────────┘ │
│  ┌──────────────────────┐ │
│  │ ✍️ 手写 · 已润色      │ │
│  │ 09:15 · 约200字       │ │
│  └──────────────────────┘ │
└──────────────────────────┘
```

每张日记卡片包含：
- 类型图标：AI 用报纸图标，手写用笔图标
- 类型 + 风格标签（如「AI · 荒诞编年史」「手写 · 已润色」）
- 创建时间
- 字数预览
- 选中态：左边框高亮 + 背景色变化

### 右侧面板

- 新增状态：`selectedDiaryId: string | null`
- 初始状态：无选中 → 显示空态「选择左侧日记查看」
- 选中后：显示该篇日记的完整内容 + 操作栏
- 操作栏按钮作用于当前选中的那篇日记

### 空态处理

| 场景 | 显示 |
|------|------|
| 当天无日记 + 无事件 | 空态图标 + 「去添加事件」 |
| 当天有事件 + 无日记 | 提示「点击上方按钮生成日记」 |
| 当天有日记 | 列表展示，默认选中最新一篇 |

## 交互流程

### 新建手写日记
1. 点击「手动写日记」→ 右侧切换为编辑器
2. 写完保存 → `appendDiary()` → 左侧列表新增 → 自动选中新条目

### 生成 AI 日记
1. 点击「生成今日日记」→ 调用 API → `appendDiary()` → 左侧列表新增 → 自动选中

### 切换查看
1. 点击左侧某篇日记 → `selectedDiaryId` 更新 → 右侧切换显示

### 删除
1. 点击操作栏「删除」→ 弹确认 → `deleteDiaryById(id)` → 从列表移除
2. 如果删的是当前选中的：切到上一篇，无上一篇则显示空态

## 代码改动范围

| 文件 | 改动 |
|------|------|
| `src/lib/client-api.ts` | 修改存储函数：`getDiariesByDate`, `appendDiary`, `deleteDiaryById` |
| `src/app/diary/[date]/diary-client.tsx` | 新增 `selectedDiaryId` 状态；左侧新增日记列表；右侧根据选中切换内容 |
| `src/components/diary/diary-content.tsx` | 无结构性变化，仅接收 props 调整 |
| `src/components/diary/event-list.tsx` | 无变化 |

## 视觉规范

沿用现有设计系统：
- 日记卡片选中态：左边框 `border-l-2 border-quantum`，背景 `bg-quantum/5`
- 日记卡片悬停态：`hover:bg-abyss/60`
- 类型标签：AI 用 `quantum` 色，手写用 `plasma` 色
- 列表区与事件区用 `border-t border-quantum/8` 分隔
