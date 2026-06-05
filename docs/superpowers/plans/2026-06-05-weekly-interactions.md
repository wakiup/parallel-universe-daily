# 周报交互增强 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clickable navigation, tooltips, weekly summary, and image export to the weekly report page.

**Architecture:** Modify the existing `weekly-report.tsx` display component and `weekly-client.tsx` data layer. Add `html2canvas` for image export. All changes are in 3 files + 1 new dependency.

**Tech Stack:** React, Next.js Link, html2canvas, Tailwind CSS, GSAP, lucide-react

---

### Task 1: Add `weeklySummary` to data model and data flow

**Files:**
- Modify: `src/components/weekly/weekly-report.tsx:56-65` (WeeklyReport type)
- Modify: `src/app/weekly/[week]/weekly-client.tsx:132-230` (buildReportFromStorage)
- Modify: `src/app/weekly/[week]/weekly-client.tsx:288-308` (handleGenerate)
- Modify: `src/lib/prompts.ts:191-238` (getWeeklyPrompt)

- [ ] **Step 1: Add `weeklySummary` to WeeklyReport type**

In `src/components/weekly/weekly-report.tsx`, add `weeklySummary` field to the `WeeklyReport` interface:

```typescript
export interface WeeklyReport {
  week: string;
  title: string;
  summary: string;
  weeklySummary: string;  // 200-400 字的周总结
  highlights: WeeklyHighlight[];
  dailyEntries: WeeklyDailyEntry[];
  stats: WeeklyStats;
  generatedAt: string;
}
```

- [ ] **Step 2: Generate local summary in `buildReportFromStorage`**

In `src/app/weekly/[week]/weekly-client.tsx`, find the `return` statement inside `buildReportFromStorage` (the object returned around line 200) and add `weeklySummary`:

```typescript
    // Build weekly summary from local data
    const activeDayEntries = dailyEntries.filter(e => e.eventCount > 0 || e.diaryCount > 0);
    const topDay = activeDayEntries.sort((a, b) => b.eventCount - a.eventCount)[0];
    const weeklySummary = [
      `本周平行宇宙编辑部共记录 ${weekNewspapers.length} 起异常事件，写下 ${totalDiaries} 篇日记。`,
      topDay ? `最活跃的一天是${topDay.dayLabel}（${topDay.date.slice(5)}），当天发生了「${topDay.headline}」。` : "",
      totalDiaries > 0 ? `本周共产出 ${totalDiaries} 篇日记，记录了来自不同维度的观察与思考。` : "",
      `整体氛围偏「${mostCommonMood}」，主要活动维度为 ${mostVisitedDimension}。`,
    ].filter(Boolean).join("");
```

Then add it to the return object:

```typescript
    return {
      week: weekParam,
      title: "PARALLEL UNIVERSE WEEKLY",
      summary: `本周平行宇宙编辑部共记录 ${weekNewspapers.length} 起异常事件，写下 ${totalDiaries} 篇日记，横跨 ${Object.keys(dimCounts).length} 个维度。最常见的心情是「${mostCommonMood}」，主要活动维度为 ${mostVisitedDimension}。`,
      weeklySummary,  // 新增
      highlights,
      dailyEntries,
      stats,
      generatedAt: new Date().toISOString(),
    };
```

- [ ] **Step 3: Update prompt to request `weeklySummary`**

In `src/lib/prompts.ts`, find the `getWeeklyPrompt` function. Replace the return string to add a `weeklySummary` requirement:

Add after the existing requirements (before the closing backtick):

```
8. 额外输出一个 JSON 字段 weeklySummary：200-400 字的自然语言周总结，用叙述性文字概括本周整体情况，包括关键事件、趋势和亮点。不要用 bullet points，用流畅的段落。
```

- [ ] **Step 4: Update `handleGenerate` to pass through `weeklySummary`**

In `src/app/weekly/[week]/weekly-client.tsx`, find the `handleGenerate` function. Update the `weeklyReport` object construction:

```typescript
      const weeklyReport: WeeklyReport = {
        week: weekParam,
        title: (reportData.title as string) || "PARALLEL UNIVERSE WEEKLY",
        summary: (reportData.summary as string) || "",
        weeklySummary: (reportData.weeklySummary as string) || "",  // 新增
        highlights: Array.isArray(reportData.highlights)
          ? (reportData.highlights as WeeklyHighlight[])
          : [],
        dailyEntries: Array.isArray(reportData.dailyEntries)
          ? (reportData.dailyEntries as WeeklyDailyEntry[])
          : [],
        stats: (reportData.stats as WeeklyStats) || {
          totalEvents: 0,
          totalDiaries: 0,
          mostCommonMood: "未知",
          mostVisitedDimension: "7-B",
          activeDays: 0,
          dimensionsVisited: 0,
        },
        generatedAt: new Date().toISOString(),
      };
```

- [ ] **Step 5: Build to verify no type errors**

Run: `cd "D:\初次合作项目\parallel-universe-daily" && "C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -30`

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/weekly/weekly-report.tsx src/app/weekly/\[week\]/weekly-client.tsx src/lib/prompts.ts
git commit -m "feat: add weeklySummary to data model and data flow"
```

---

### Task 2: Add WeeklySummary component

**Files:**
- Modify: `src/components/weekly/weekly-report.tsx` (add component + import)

- [ ] **Step 1: Add `FileText` import**

In `src/components/weekly/weekly-report.tsx`, add `FileText` to the lucide-react import:

```typescript
import {
  Newspaper,
  Sparkles,
  Star,
  Zap,
  Globe,
  Calendar,
  Cloud,
  BarChart3,
  Quote,
  BookOpen,
  FileText,  // 新增
} from "lucide-react";
```

- [ ] **Step 2: Create WeeklySummary component**

Add the following component in `src/components/weekly/weekly-report.tsx`, after the `CoverSection` component and before `HighlightsSection`:

```typescript
// ---------------------------------------------------------------------------
// WeeklySummary - AI-generated weekly summary
// ---------------------------------------------------------------------------

function WeeklySummary({ summary }: { summary: string }) {
  if (!summary) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-quantum/20 to-nebula-pink/20 border border-quantum/15">
          <FileText className="w-5 h-5 text-quantum" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-signal">
            本周总结
          </h2>
          <p className="text-xs font-mono text-static/60 mt-0.5">
            WEEKLY SUMMARY
          </p>
        </div>
      </div>

      <div className="relative border border-quantum/15 rounded-2xl bg-abyss/60 backdrop-blur-sm overflow-hidden">
        <div className="h-px bg-gradient-to-r from-quantum/20 via-plasma/20 to-nebula-pink/20" />
        <div className="px-6 sm:px-10 py-8 sm:py-10">
          <p className="text-sm sm:text-base leading-relaxed font-serif text-void-text/80">
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add WeeklySummary to WeeklyReportDisplay**

In the `WeeklyReportDisplay` component, add `WeeklySummary` between `CoverSection` and `HighlightsSection`:

```typescript
  return (
    <div ref={containerRef} className="space-y-0">
      <CoverSection
        report={report}
        weekNum={weekNum}
        year={year}
        dateRange={dateRange}
      />
      <WeeklySummary summary={report.weeklySummary} />
      <HighlightsSection highlights={report.highlights} />
      <DayGrid entries={report.dailyEntries} />
      <StatsSection stats={report.stats} />
      <FooterQuote />
    </div>
  );
```

- [ ] **Step 4: Build to verify**

Run: `cd "D:\初次合作项目\parallel-universe-daily" && "C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -30`

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/weekly/weekly-report.tsx
git commit -m "feat: add WeeklySummary component to weekly report"
```

---

### Task 3: Add card click navigation

**Files:**
- Modify: `src/components/weekly/weekly-report.tsx` (DayGrid + HighlightsSection)

- [ ] **Step 1: Add Link import**

In `src/components/weekly/weekly-report.tsx`, add `Link` import at the top:

```typescript
import Link from "next/link";
```

- [ ] **Step 2: Make DayGrid cards clickable**

In the `DayGrid` component, find the card `<div>` (around line 370) and replace it with a `<Link>`:

Replace:
```tsx
            <div
              key={entry.date}
              className={cn(
                "day-card group relative rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                colors.border,
                colors.hoverBorder,
                colors.glow,
                isFirstLarge && "sm:col-span-2 lg:col-span-2"
              )}
            >
```

With:
```tsx
            <Link
              key={entry.date}
              href={`/diary/${entry.date}`}
              className={cn(
                "day-card group relative rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer block",
                colors.border,
                colors.hoverBorder,
                colors.glow,
                isFirstLarge && "sm:col-span-2 lg:col-span-2"
              )}
            >
```

Also find the closing `</div>` of the card (around line 449, the one that closes the card wrapper) and replace with `</Link>`. The closing tag is the one right before the closing of the `.map()` callback — look for the pattern:

```tsx
              </div>
            </div>
          );
```

Replace with:

```tsx
              </div>
            </Link>
          );
```

- [ ] **Step 3: Make HighlightsSection cards clickable**

In the `HighlightsSection` component, the highlights need date conversion. First, add `week` prop to the component:

Change the function signature from:

```typescript
function HighlightsSection({ highlights }: { highlights: WeeklyHighlight[] }) {
```

To:

```typescript
function HighlightsSection({ highlights, week }: { highlights: WeeklyHighlight[]; week: string }) {
```

Then add a helper function inside the component to convert day name to date:

```typescript
  const dayToDate = (dayName: string): string => {
    const DAY_MAP: Record<string, number> = { "周一": 0, "周二": 1, "周三": 2, "周四": 3, "周五": 4, "周六": 5, "周日": 6 };
    const dayIndex = DAY_MAP[dayName];
    if (dayIndex === undefined) return "";
    const match = week.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return "";
    const year = parseInt(match[1], 10);
    const weekNum = parseInt(match[2], 10);
    const jan4 = new Date(year, 0, 4);
    const dayOfWeekJan4 = jan4.getDay() || 7;
    const week1Start = new Date(jan4);
    week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);
    const startDate = new Date(week1Start);
    startDate.setDate(week1Start.getDate() + (weekNum - 1) * 7);
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIndex);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
```

Then replace the card `<div>` with `<Link>`:

Replace:
```tsx
            <div
              key={hl.id}
              className={cn(
                "highlight-card group relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1",
                colors.border,
                colors.hoverBorder,
                colors.glow,
                isLarge && "md:col-span-2 md:row-span-2"
              )}
            >
```

With:
```tsx
            <Link
              key={hl.id}
              href={`/diary/${dayToDate(hl.day)}`}
              className={cn(
                "highlight-card group relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer block",
                colors.border,
                colors.hoverBorder,
                colors.glow,
                isLarge && "md:col-span-2 md:row-span-2"
              )}
            >
```

Find the closing `</div>` of the highlight card and replace with `</Link>`.

- [ ] **Step 4: Update WeeklyReportDisplay to pass `week` to HighlightsSection**

In `WeeklyReportDisplay`, update the HighlightsSection usage:

```tsx
      <HighlightsSection highlights={report.highlights} week={report.week} />
```

- [ ] **Step 5: Build to verify**

Run: `cd "D:\初次合作项目\parallel-universe-daily" && "C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -30`

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/weekly/weekly-report.tsx
git commit -m "feat: make daily and highlight cards clickable with navigation"
```

---

### Task 4: Add stats tooltip

**Files:**
- Modify: `src/components/weekly/weekly-report.tsx` (StatsSection)

- [ ] **Step 1: Add tooltip data and UI to StatsSection**

In the `StatsSection` component, add a `tooltip` field to each stat card in the `statCards` array. Replace the entire `statCards` definition:

```typescript
  const statCards = [
    {
      label: "总事件数",
      value: stats.totalEvents,
      icon: <Zap className="w-5 h-5" />,
      color: "quantum" as const,
      sub: "across 7 days",
      tooltip: "本周报纸记录的所有平行宇宙异常事件",
    },
    {
      label: "日记总数",
      value: stats.totalDiaries,
      icon: <BookOpen className="w-5 h-5" />,
      color: "plasma" as const,
      sub: "diaries written",
      tooltip: "本周用户撰写的日记篇数",
    },
    {
      label: "最常见心情",
      value: stats.mostCommonMood,
      icon: <Sparkles className="w-5 h-5" />,
      color: "pink" as const,
      sub: "dominant mood",
      tooltip: "本周出现次数最多的情绪状态",
    },
    {
      label: "最常访问维度",
      value: stats.mostVisitedDimension,
      icon: <Globe className="w-5 h-5" />,
      color: "pink" as const,
      sub: "primary dimension",
      tooltip: "本周涉及最多的平行宇宙维度编号",
    },
    {
      label: "活跃天数",
      value: stats.activeDays,
      icon: <Calendar className="w-5 h-5" />,
      color: "quantum" as const,
      sub: "of 7 days",
      tooltip: "本周有事件或日记记录的天数",
    },
  ];
```

- [ ] **Step 2: Add tooltip HTML to stat card rendering**

In the `StatsSection` map, find the stat card `<div>` and add a tooltip element. The card currently looks like:

```tsx
            <div
              key={index}
              className={cn(
                "stat-item relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
                colors.statBorder,
                colors.hoverBorder,
                colors.glow
              )}
            >
```

Add `group` to the className and add the tooltip div inside the card, right after the opening `<div>`:

```tsx
            <div
              key={index}
              className={cn(
                "stat-item group relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
                colors.statBorder,
                colors.hoverBorder,
                colors.glow
              )}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-abyss/95 border border-quantum/20 rounded-lg px-3 py-2 text-xs text-static/80 shadow-xl whitespace-nowrap">
                  {stat.tooltip}
                </div>
              </div>
```

- [ ] **Step 3: Build to verify**

Run: `cd "D:\初次合作项目\parallel-universe-daily" && "C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -30`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/weekly/weekly-report.tsx
git commit -m "feat: add hover tooltips to weekly stats cards"
```

---

### Task 5: Add image export

**Files:**
- Modify: `package.json` (add html2canvas dependency)
- Modify: `src/components/weekly/weekly-report.tsx` (export button + capture logic)

- [ ] **Step 1: Install html2canvas**

Run: `cd "D:\初次合作项目\parallel-universe-daily" && "C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" npm install html2canvas 2>&1`

Expected: html2canvas added to dependencies.

- [ ] **Step 2: Add Download and Loader2 imports**

In `src/components/weekly/weekly-report.tsx`, add to the lucide-react import:

```typescript
import {
  Newspaper,
  Sparkles,
  Star,
  Zap,
  Globe,
  Calendar,
  Cloud,
  BarChart3,
  Quote,
  BookOpen,
  FileText,
  Download,  // 新增
  Loader2,   // 新增
} from "lucide-react";
```

Also add the useState import:

```typescript
import { useLayoutEffect, useRef, useState } from "react";
```

- [ ] **Step 3: Add export functionality to WeeklyReportDisplay**

In the `WeeklyReportDisplay` component, add state and handler. Find the component and add after `containerRef`:

```typescript
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(containerRef.current!, {
        backgroundColor: "#0a0a1a",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `parallel-universe-weekly-${report.week}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // silent fail
    } finally {
      setIsExporting(false);
    }
  };
```

- [ ] **Step 4: Add export button to the render output**

In the `WeeklyReportDisplay` return, wrap the content in a relative container and add the export button. Replace the return block:

```tsx
  return (
    <div ref={containerRef} className="space-y-0 relative">
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={cn(
          "absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg px-3 py-2",
          "border border-quantum/20 bg-abyss/80 backdrop-blur-sm text-xs font-medium text-void-text",
          "transition-all duration-200 hover:border-quantum/40 hover:text-quantum",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {isExporting ? "导出中..." : "导出图片"}
      </button>

      <CoverSection
        report={report}
        weekNum={weekNum}
        year={year}
        dateRange={dateRange}
      />
      <WeeklySummary summary={report.weeklySummary} />
      <HighlightsSection highlights={report.highlights} week={report.week} />
      <DayGrid entries={report.dailyEntries} />
      <StatsSection stats={report.stats} />
      <FooterQuote />
    </div>
  );
```

- [ ] **Step 5: Build to verify**

Run: `cd "D:\初次合作项目\parallel-universe-daily" && "C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -30`

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/components/weekly/weekly-report.tsx
git commit -m "feat: add image export to weekly report"
```
