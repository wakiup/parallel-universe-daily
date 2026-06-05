# 周报交互增强设计

## 问题

周报界面当前是纯展示型，所有卡片只有 CSS 悬停效果，没有任何点击交互。用户无法从周报跳转到详情页面，也无法导出分享周报内容。

## 目标

1. 卡片可点击跳转到对应日记页
2. 统计卡片悬停显示 tooltip
3. 新增每周总结板块（AI 自动生成）
4. 支持导出周报为图片

## 功能详细设计

### 1. 卡片点击跳转

#### 每日卡片（DayGrid）

- 每张卡片包裹 `<Link href={/diary/${entry.date}}>`
- 点击整个卡片跳转到该日期的日记页
- 视觉提示：悬停时卡片标题变色（已有 `group-hover:text-quantum`），添加 `cursor-pointer`
- 新窗口打开：不使用，当前窗口跳转即可

#### 亮点卡片（HighlightsSection）

- 每张卡片包裹 `<Link href={/diary/${dateFromDay}}>`
- 需要将 `day` 字段（如「周一」）转换为日期字符串（如 `2026-06-02`）
- 转换逻辑：根据 `WeeklyReport.week` 字段（如 `2026-W23`）计算该周起始日期，再根据 day 名称匹配
- 视觉提示：同上，添加 `cursor-pointer`

### 2. 统计卡片 Tooltip

- 悬停统计卡片时显示一个小气泡，解释该统计的含义
- 使用纯 CSS 实现（`group` + `group-hover:opacity-100`），无需额外库
- Tooltip 内容：

| 统计项 | Tooltip 文案 |
|--------|-------------|
| 总事件数 | 本周报纸记录的所有平行宇宙异常事件 |
| 日记总数 | 本周用户撰写的日记篇数 |
| 最常见心情 | 本周出现次数最多的情绪状态 |
| 最常访问维度 | 本周涉及最多的平行宇宙维度编号 |
| 活跃天数 | 本周有事件或日记记录的天数 |

- 样式：`absolute` 定位在卡片上方，深色背景 + 圆角 + 小箭头，延迟 200ms 显示避免闪烁

### 3. 每周总结板块

#### 位置

在封面区域（CoverSection）和亮点区域（HighlightsSection）之间，新增 `WeeklySummary` 组件。

#### 数据来源

- **本地预览路径**（`buildReportFromStorage`）：从报纸内容中提取关键信息，拼接成简短总结。由于本地无法调用 AI，使用模板化总结：`「本周共记录 X 起事件，写下 Y 篇日记。最活跃的一天是{日期}，当天发生了{事件}。整体氛围偏{心情}。」`
- **AI 生成路径**（`generateWeeklyReport`）：AI 已经在生成完整周报 JSON，在 prompt 中要求额外输出 `weeklySummary` 字段（200-400 字的自然语言总结）

#### 数据模型变化

`WeeklyReport` 接口新增：

```typescript
export interface WeeklyReport {
  // ... existing fields
  weeklySummary: string;  // 新增：200-400 字的周总结
}
```

#### UI 设计

```
┌─────────────────────────────────────────┐
│  📊 本周总结                              │
│  WEEKLY SUMMARY                          │
├─────────────────────────────────────────┤
│                                         │
│  本周平行宇宙编辑部共记录了 12 起异常      │
│  事件...（200-400 字的叙述性总结）         │
│                                         │
│  最值得一提的是周三的咖啡机觉醒事件...     │
│                                         │
└─────────────────────────────────────────┘
```

- 样式：与封面区域的 EDITOR'S NOTE 类似，使用 `border + rounded-2xl + bg-void/60`
- 图标：使用 `FileText` 图标（需从 lucide-react 导入）
- 字体：`font-serif italic`，与 EDITOR'S NOTE 风格一致但稍小

### 4. 导出为图片

#### 实现方案

使用 `html2canvas` 库将整个周报区域渲染为 Canvas，然后导出为 PNG 图片。

#### UI 入口

在封面区域右上角添加一个导出按钮：

```
┌─────────────────────────────────┐
│  PARALLEL UNIVERSE WEEKLY    [📤]│  ← 导出按钮
│                                 │
│  EDITOR'S NOTE: ...             │
└─────────────────────────────────┘
```

- 按钮样式：`rounded-lg border border-quantum/20 bg-abyss/60`，图标使用 `Download`
- 点击后：按钮变为 loading 状态（`Loader2` 旋转图标），调用 html2canvas 截图，完成后触发下载
- 文件名格式：`parallel-universe-weekly-2026-W23.png`

#### 技术细节

- 安装依赖：`html2canvas`（~16KB gzipped）
- 截图区域：`containerRef.current`（整个 WeeklyReportDisplay 的容器）
- 配置：`{ backgroundColor: '#0a0a1a' }`（匹配 void 背景色）
- 导出触发：创建 `<a>` 标签 + `download` 属性

## 代码改动范围

| 文件 | 改动 |
|------|------|
| `src/components/weekly/weekly-report.tsx` | 新增 `WeeklySummary` 组件；卡片添加 `<Link>`；tooltip 添加；导出按钮；类型新增 `weeklySummary` |
| `src/app/weekly/[week]/weekly-client.tsx` | `buildReportFromStorage` 中生成本地总结；`handleGenerate` 中处理 `weeklySummary` 字段 |
| `src/lib/prompts.ts` | 修改 `getWeeklyPrompt`，要求 AI 输出 `weeklySummary` 字段 |
| `package.json` | 新增 `html2canvas` 依赖 |

## 视觉规范

- 卡片跳转：沿用现有 `group-hover:text-quantum` + 新增 `cursor-pointer`
- Tooltip：`bg-abyss/95 border border-quantum/20 rounded-lg px-3 py-2 text-xs text-static/80 shadow-xl`
- 周总结区域：与 EDITOR'S NOTE 样式统一，但使用 `FileText` 图标区分
- 导出按钮：与现有操作按钮风格一致，使用 `quantum` 色系
