# 日记功能 Phase 2a 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现日记页面布局、事件列表组件、AI 日记生成 API、三种风格渲染、本地存储

**Architecture:** Next.js App Router 路由 `/diary/[date]`，左右分栏布局。左侧展示当日事件列表，右侧展示 AI 生成的日记内容。使用本地 JSON 文件存储日记数据，Claude API 生成日记内容。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, GSAP, Claude API (Anthropic SDK)

---

## 文件结构

```
src/
├── app/
│   ├── diary/
│   │   └── [date]/
│   │       └── page.tsx          # 日记页面主组件
│   └── api/
│       └── diary/
│           └── generate/
│               └── route.ts      # AI 日记生成 API
├── components/
│   ├── diary/
│   │   ├── event-list.tsx        # 左侧事件列表
│   │   ├── diary-content.tsx     # 右侧日记内容展示
│   │   └── diary-header.tsx      # 日记头部（风格标题）
│   └── ui/                       # 已有 shadcn 组件
└── lib/
    ├── types.ts                  # 类型定义
    ├── storage.ts                # 本地存储工具
    └── prompts.ts                # AI 提示词模板
```

---

## Task 1: 类型定义

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/lib/types.ts

export type DiaryStyle = "newspaper" | "prose" | "chronicle";
export type ProcessMode = "tone" | "absurd" | "both" | "none";

export interface Event {
  id: string;
  headline: string;
  subheadline: string;
  timestamp: string;
  weather: string;
  mood: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  type: "ai" | "handwritten";
  content: string;
  style?: DiaryStyle;
  processMode?: ProcessMode;
  rawContent?: string;
  eventIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiaryGenerateRequest {
  date: string;
  style: DiaryStyle;
  events: Event[];
}

export interface DiaryGenerateResponse {
  diary: DiaryEntry;
}
```

- [ ] **Step 2: 验证类型文件创建成功**

Run: `npx tsc --noEmit src/lib/types.ts`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/lib/types.ts
git commit -m "feat: add diary type definitions"
```

---

## Task 2: 本地存储工具

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 1: 创建存储工具函数**

```typescript
// src/lib/storage.ts

import { DiaryEntry } from "./types";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "diaries");

async function ensureDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getDiaryByDate(date: string): Promise<DiaryEntry | null> {
  await ensureDir();
  const filePath = path.join(DATA_DIR, `${date}.json`);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveDiary(diary: DiaryEntry): Promise<void> {
  await ensureDir();
  const filePath = path.join(DATA_DIR, `${diary.date}.json`);
  await fs.writeFile(filePath, JSON.stringify(diary, null, 2), "utf-8");
}

export async function getDiariesByMonth(year: number, month: number): Promise<DiaryEntry[]> {
  await ensureDir();
  const diaries: DiaryEntry[] = [];
  const files = await fs.readdir(DATA_DIR);
  
  for (const file of files) {
    if (file.endsWith(".json")) {
      const date = file.replace(".json", "");
      if (date.startsWith(`${year}-${String(month).padStart(2, "0")}`)) {
        const data = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
        diaries.push(JSON.parse(data));
      }
    }
  }
  
  return diaries.sort((a, b) => b.date.localeCompare(a.date));
}
```

- [ ] **Step 2: 验证存储工具**

Run: `npx tsc --noEmit src/lib/storage.ts`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/lib/storage.ts
git commit -m "feat: add local diary storage utilities"
```

---

## Task 3: AI 提示词模板

**Files:**
- Create: `src/lib/prompts.ts`

- [ ] **Step 1: 创建提示词模板**

```typescript
// src/lib/prompts.ts

import { DiaryStyle, Event } from "./types";

export function getDiaryPrompt(events: Event[], style: DiaryStyle): string {
  const eventList = events
    .map(
      (e, i) =>
        `事件 ${i + 1}:\n- 时间: ${e.timestamp}\n- 标题: ${e.headline}\n- 副标题: ${e.subheadline}\n- 心情: ${e.mood}\n- 天气: ${e.weather}\n- 维度: ${e.dimension}`
    )
    .join("\n\n");

  const styleInstructions: Record<DiaryStyle, string> = {
    newspaper: `你是一位报纸编辑，需要把以下事件汇编成一份「今日大事记」。

要求：
1. 顶部标注期号、日期、维度编号
2. 每个事件用 bullet point 列出，保留原始标题
3. 语气严肃但内容荒诞
4. 底部添加「今日天气」板块
5. 信息密度高，节奏快

输出格式为 Markdown。`,

    prose: `你是一位散文作家，需要把以下事件写成一篇第一人称日记。

要求：
1. 用「我」的视角串联一天的故事
2. 有起承转合，像一篇微型小说
3. 语气温暖，有故事感
4. 保留事件的核心荒诞元素
5. 结尾署名「来自维度 X 的观察者」

输出格式为 Markdown。`,

    chronicle: `你是平行宇宙科学院的档案员，需要把以下事件记录为「平行宇宙编年史·日记卷」。

要求：
1. 顶部标注「CLASSIFIED · 绝密」
2. 使用「宇宙纪元」日期格式和「档案编号」
3. 每个事件作为「重大事件」章节，用【】标注
4. 语气官方、正式、离谱
5. 使用历史档案的措辞（如「据目击者称」「本宇宙标准时间」）
6. 结尾添加一句「平行宇宙科学院」的名言

输出格式为 Markdown。`,
  };

  return `${styleInstructions[style]}

以下是今天的事件：

${eventList}`;
}
```

- [ ] **Step 2: 验证提示词文件**

Run: `npx tsc --noEmit src/lib/prompts.ts`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/lib/prompts.ts
git commit -m "feat: add diary generation prompt templates"
```

---

## Task 4: AI 日记生成 API

**Files:**
- Create: `src/app/api/diary/generate/route.ts`

- [ ] **Step 1: 创建 API 路由**

```typescript
// src/app/api/diary/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { DiaryGenerateRequest, DiaryEntry } from "@/lib/types";
import { saveDiary } from "@/lib/storage";
import { getDiaryPrompt } from "@/lib/prompts";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: DiaryGenerateRequest = await request.json();
    const { date, style, events } = body;

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: "没有可汇总的事件，请先生成日报" },
        { status: 400 }
      );
    }

    const prompt = getDiaryPrompt(events, style);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    const diary: DiaryEntry = {
      id: crypto.randomUUID(),
      date,
      type: "ai",
      content,
      style,
      eventIds: events.map((e) => e.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveDiary(diary);

    return NextResponse.json({ diary });
  } catch (error) {
    console.error("Diary generation error:", error);
    return NextResponse.json(
      { error: "日记生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 验证 API 路由**

Run: `npx tsc --noEmit src/app/api/diary/generate/route.ts`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/app/api/diary/generate/route.ts
git commit -m "feat: add diary generation API endpoint"
```

---

## Task 5: 事件列表组件

**Files:**
- Create: `src/components/diary/event-list.tsx`

- [ ] **Step 1: 创建事件列表组件**

```tsx
// src/components/diary/event-list.tsx

"use client";

import { Event } from "@/lib/types";
import { Clock, Globe } from "lucide-react";

interface EventListProps {
  events: Event[];
  onGenerate: () => void;
  onWriteManual: () => void;
  isGenerating: boolean;
}

const colorConfig = {
  quantum: {
    dot: "bg-quantum",
    border: "border-quantum/15",
    badge: "bg-quantum/10 text-quantum",
  },
  plasma: {
    dot: "bg-plasma",
    border: "border-plasma/15",
    badge: "bg-plasma/10 text-plasma",
  },
  pink: {
    dot: "bg-nebula-pink",
    border: "border-nebula-pink/15",
    badge: "bg-nebula-pink/10 text-nebula-pink",
  },
};

export function EventList({
  events,
  onGenerate,
  onWriteManual,
  isGenerating,
}: EventListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-quantum via-plasma to-nebula-pink rounded-full" />
        <h2 className="text-lg font-serif font-bold text-signal">今日事件</h2>
        <span className="ml-auto text-xs font-mono text-static">
          {events.length}条
        </span>
      </div>

      {/* Event cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {events.map((event) => {
          const colors = colorConfig[event.color];
          return (
            <div
              key={event.id}
              className={`p-3 bg-abyss/50 border ${colors.border} rounded-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${colors.dot} rounded-full`} />
                  <span className="text-xs font-mono text-static">
                    {event.timestamp.split(" ")[1]}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-static/60">
                  维度 {event.dimension}
                </span>
              </div>
              <p className="text-sm text-void-text line-clamp-2 mb-2">
                {event.headline}
              </p>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono ${colors.badge} rounded`}
                >
                  {event.mood}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-stardust/30 text-static/60 rounded">
                  {event.weather}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={onGenerate}
          disabled={events.length === 0 || isGenerating}
          className="w-full py-3 bg-gradient-to-r from-quantum to-quantum-dim text-void font-medium rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-quantum/20"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
              生成中...
            </span>
          ) : (
            "✨ 生成今日日记"
          )}
        </button>
        <button
          onClick={onWriteManual}
          className="w-full py-2 text-sm text-static hover:text-quantum transition-colors"
        >
          或 手动写日记
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证组件**

Run: `npx tsc --noEmit src/components/diary/event-list.tsx`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/diary/event-list.tsx
git commit -m "feat: add event list sidebar component"
```

---

## Task 6: 日记头部组件

**Files:**
- Create: `src/components/diary/diary-header.tsx`

- [ ] **Step 1: 创建日记头部组件**

```tsx
// src/components/diary/diary-header.tsx

"use client";

import { DiaryStyle } from "@/lib/types";

interface DiaryHeaderProps {
  style: DiaryStyle;
  date: string;
}

export function DiaryHeader({ style, date }: DiaryHeaderProps) {
  const formattedDate = date.replace(/-/g, ".");

  if (style === "chronicle") {
    return (
      <div className="text-center mb-8">
        <div className="text-[10px] tracking-[6px] text-nebula-pink mb-2">
          CLASSIFIED · 绝密
        </div>
        <div className="inline-block px-6 py-2 border border-nebula-pink/30 rounded">
          <h1 className="text-2xl font-serif font-bold text-signal">
            平行宇宙编年史 · 日记卷
          </h1>
        </div>
        <div className="text-xs text-static mt-3">
          宇宙纪元 {formattedDate} · 档案编号 PUD-{date.split("-").slice(1).join("")}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-quantum/30 to-transparent mt-6" />
      </div>
    );
  }

  if (style === "newspaper") {
    return (
      <div className="text-center mb-8">
        <div className="text-[10px] tracking-[4px] text-static mb-2">
          PARALLEL UNIVERSE DAILY
        </div>
        <h1 className="text-3xl font-serif font-bold text-signal mb-2">
          今 日 大 事 记
        </h1>
        <div className="h-px bg-gradient-to-r from-transparent via-quantum to-transparent mb-3" />
        <div className="text-xs text-static">
          {date.replace(/-/g, "年").replace("年", "年").replace("年", "月")}日 · 第
          {Math.floor(Date.now() / 86400000) % 10000}期
        </div>
      </div>
    );
  }

  // prose style
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-serif font-bold text-signal mb-2">
        {getProseTitle(date)}
      </h1>
      <div className="h-px bg-gradient-to-r from-plasma to-transparent mb-3" />
      <div className="text-xs text-static">{formattedDate} · 平行宇宙日记</div>
    </div>
  );
}

function getProseTitle(date: string): string {
  const day = new Date(date).getDay();
  const titles = [
    "一个普通又不普通的周日",
    "一个普通又不普通的周一",
    "一个普通又不普通的周二",
    "一个普通又不普通的周三",
    "一个普通又不普通的周四",
    "一个普通又不普通的周五",
    "一个普通又不普通的周六",
  ];
  return titles[day];
}
```

- [ ] **Step 2: 验证组件**

Run: `npx tsc --noEmit src/components/diary/diary-header.tsx`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/diary/diary-header.tsx
git commit -m "feat: add diary header component with style variants"
```

---

## Task 7: 日记内容展示组件

**Files:**
- Create: `src/components/diary/diary-content.tsx`

- [ ] **Step 1: 创建日记内容组件**

```tsx
// src/components/diary/diary-content.tsx

"use client";

import { DiaryEntry } from "@/lib/types";
import { DiaryHeader } from "./diary-header";
import { RefreshCw, Download, Share2 } from "lucide-react";

interface DiaryContentProps {
  diary: DiaryEntry | null;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function DiaryContent({
  diary,
  onRegenerate,
  isGenerating,
}: DiaryContentProps) {
  if (!diary) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <p className="text-static">还没有今日日记</p>
          <p className="text-sm text-static/60 mt-2">
            点击左侧「生成今日日记」开始
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <DiaryHeader style={diary.style || "chronicle"} date={diary.date} />

      {/* Content */}
      <div className="flex-1 prose prose-invert max-w-none">
        <div
          className="text-void-text leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatDiaryContent(diary.content) }}
        />
      </div>

      {/* Footer quote */}
      <div className="mt-8 pt-4 border-t border-quantum/10 text-center">
        <p className="text-xs text-static italic">
          「历史是由猫和咖啡机共同书写的」—— 平行宇宙科学院
        </p>
      </div>

      {/* Action bar */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-quantum/10 text-quantum border border-quantum/20 rounded-lg text-sm transition-all hover:bg-quantum/20 disabled:opacity-40"
        >
          <RefreshCw
            className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
          />
          重新生成
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-quantum/10 text-quantum border border-quantum/20 rounded-lg text-sm transition-all hover:bg-quantum/20">
          <Download className="w-4 h-4" />
          导出长图
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-quantum/10 text-quantum border border-quantum/20 rounded-lg text-sm transition-all hover:bg-quantum/20">
          <Share2 className="w-4 h-4" />
          分享
        </button>
      </div>
    </div>
  );
}

function formatDiaryContent(content: string): string {
  // Convert markdown to basic HTML
  return content
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}
```

- [ ] **Step 2: 验证组件**

Run: `npx tsc --noEmit src/components/diary/diary-content.tsx`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/diary/diary-content.tsx
git commit -m "feat: add diary content display component"
```

---

## Task 8: 日记页面主组件

**Files:**
- Create: `src/app/diary/[date]/page.tsx`

- [ ] **Step 1: 创建日记页面**

```tsx
// src/app/diary/[date]/page.tsx

"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import { EventList } from "@/components/diary/event-list";
import { DiaryContent } from "@/components/diary/diary-content";
import { Event, DiaryEntry, DiaryStyle } from "@/lib/types";
import { ArrowLeft, Newspaper, BookOpen, Calendar, Star } from "lucide-react";
import gsap from "gsap";

// Mock events for demonstration
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    headline: "震惊！某程序员在凌晨3点发现咖啡机其实是时光机",
    subheadline: "平行宇宙咖啡机制造商股价暴涨300%",
    timestamp: "2026-06-03 08:30",
    weather: "量子雨转薛定谔的晴",
    mood: "极佳",
    color: "quantum",
    dimension: "7-B",
  },
  {
    id: "2",
    headline: "居民楼电梯突然开口说话：'今天有人按了42层，但楼只有6层'",
    subheadline: "电梯心理辅导热线被打爆",
    timestamp: "2026-06-03 12:15",
    weather: "反物质风暴",
    mood: "困惑",
    color: "plasma",
    dimension: "13-Ω",
  },
  {
    id: "3",
    headline: "猫咪成功竞选市长，首项政策：所有纸箱归国有",
    subheadline: "汪星人表示强烈抗议",
    timestamp: "2026-06-03 18:45",
    weather: "猫毛纷飞",
    mood: "兴奋",
    color: "pink",
    dimension: "42-Ψ",
  },
];

export default function DiaryPage() {
  const params = useParams();
  const date = params.date as string;
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [diary, setDiary] = useState<DiaryEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diaryStyle, setDiaryStyle] = useState<DiaryStyle>("chronicle");

  // Load existing diary
  useEffect(() => {
    async function loadDiary() {
      try {
        const res = await fetch(`/api/diary?date=${date}`);
        if (res.ok) {
          const data = await res.json();
          setDiary(data.diary);
        }
      } catch {
        // No existing diary
      }
    }
    loadDiary();
  }, [date]);

  // GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".diary-sidebar", {
        opacity: 0,
        x: -30,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });

      gsap.from(".diary-main", {
        opacity: 0,
        x: 30,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleGenerate = async () => {
    if (events.length === 0) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/diary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, style: diaryStyle, events }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiary(data.diary);
      }
    } catch (error) {
      console.error("Generate failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Navbar */}
      <nav className="border-b border-quantum/8 bg-void/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="p-2 text-static hover:text-quantum transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-quantum to-plasma flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-void" />
                </div>
                <span className="text-sm font-serif font-bold text-signal">
                  平行宇宙日报
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" >
                <Newspaper className="w-4 h-4" />
                今日
              </NavLink>
              <NavLink href={`/diary/${date}`} active>
                <BookOpen className="w-4 h-4" />
                日记
              </NavLink>
              <NavLink href="/weekly">
                <Calendar className="w-4 h-4" />
                周报
              </NavLink>
              <NavLink href="/history">
                <Star className="w-4 h-4" />
                编年史
              </NavLink>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-quantum/8 border border-quantum/15">
                <div className="w-1.5 h-1.5 bg-quantum rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-quantum/80">
                  维度 7-B
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-abyss/60 border border-quantum/8">
                <span className="text-[11px] font-mono text-void-text">
                  {date}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 min-h-[calc(100vh-12rem)]">
          {/* Left sidebar */}
          <div className="diary-sidebar">
            <EventList
              events={events}
              onGenerate={handleGenerate}
              onWriteManual={() => {}}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right main area */}
          <div className="diary-main">
            <DiaryContent
              diary={diary}
              onRegenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
        active
          ? "text-quantum bg-quantum/10 border border-quantum/15"
          : "text-void-text hover:text-signal hover:bg-abyss/50 border border-transparent"
      }`}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 2: 验证页面**

Run: `npx tsc --noEmit src/app/diary/[date]/page.tsx`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/app/diary/[date]/page.tsx
git commit -m "feat: add diary page with split layout"
```

---

## Task 9: 日记查询 API

**Files:**
- Create: `src/app/api/diary/route.ts`

- [ ] **Step 1: 创建日记查询 API**

```typescript
// src/app/api/diary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDiaryByDate } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  const diary = await getDiaryByDate(date);
  return NextResponse.json({ diary });
}
```

- [ ] **Step 2: 验证 API**

Run: `npx tsc --noEmit src/app/api/diary/route.ts`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/app/api/diary/route.ts
git commit -m "feat: add diary query API endpoint"
```

---

## Task 10: 首页日记入口

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 在首页添加日记入口**

在 `QuickLink` 组件的「平行日记」链接中，修改 href 为动态日期：

```tsx
// 在 page.tsx 中找到 QuickLink 组件调用，修改 href
<QuickLink
  icon={<BookOpen className="w-5 h-5" />}
  title="平行日记"
  description="AI 生成或手写你的宇宙日记"
  href={`/diary/${new Date().toISOString().split("T")[0]}`}
  color="quantum"
/>
```

- [ ] **Step 2: 验证修改**

Run: `npx tsc --noEmit src/app/page.tsx`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: add dynamic diary link to homepage"
```

---

## Task 11: 集成测试

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器在 http://localhost:3000 启动

- [ ] **Step 2: 测试日记页面访问**

在浏览器中访问 http://localhost:3000/diary/2026-06-03
Expected: 页面正常加载，显示左右分栏布局

- [ ] **Step 3: 测试日记生成**

点击「生成今日日记」按钮
Expected: 显示 loading 状态，然后展示生成的日记内容

- [ ] **Step 4: 测试页面导航**

从首页点击「平行日记」链接
Expected: 跳转到当天的日记页面

---

## 完成

Phase 2a 实现完成。后续 Phase 2b（手写日记）和 Phase 2c（设置页）可作为独立计划继续开发。
