# 图片画廊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增图片画廊功能，日记/周报点击导出后存储内容到 localStorage，在画廊页面实时渲染 4K 图片供用户长按保存。

**Architecture:** 新增 `/gallery` 路由和 `/gallery/[id]` 预览路由。画廊数据存储在 localStorage (`parallel-universe-gallery`)。日记/周报的导出按钮改为保存文本数据到画廊并跳转。画廊预览页用 dom-to-image-more 实时渲染 4K 图片。

**Tech Stack:** Next.js App Router, React, localStorage, dom-to-image-more, lucide-react, Tailwind CSS

---

## File Structure

| File | Operation | Responsibility |
|------|-----------|----------------|
| `src/lib/gallery.ts` | Create | 画廊数据 CRUD (localStorage) |
| `src/app/gallery/page.tsx` | Create | 画廊页面 Server Component 路由 |
| `src/app/gallery/gallery-client.tsx` | Create | 画廊列表客户端逻辑 |
| `src/components/gallery/gallery-card.tsx` | Create | 画廊卡片组件 |
| `src/app/gallery/[id]/page.tsx` | Create | 4K 预览页面 Server Component 路由 |
| `src/app/gallery/[id]/preview-client.tsx` | Create | 4K 预览客户端逻辑 |
| `src/components/desktop-nav.tsx` | Modify | 添加画廊图标入口 |
| `src/components/diary/diary-content.tsx` | Modify | 导出按钮改为保存到画廊 |
| `src/components/weekly/weekly-report.tsx` | Modify | 导出按钮改为保存到画廊 |
| `src/app/settings/page.tsx` | Modify | 备份恢复加入画廊数据 |

---

### Task 1: Create Gallery CRUD Library

**Files:**
- Create: `src/lib/gallery.ts`

- [ ] **Step 1: Create gallery.ts with type and CRUD functions**

```typescript
// src/lib/gallery.ts
import type { DiaryStyle, ProcessMode } from "./types";

export interface GalleryItem {
  id: string;
  type: "diary" | "weekly";
  title: string;
  content: string;
  rawContent?: string;
  style?: DiaryStyle;
  processMode?: ProcessMode;
  date: string;
  createdAt: number;
}

const GALLERY_KEY = "parallel-universe-gallery";

export function loadGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(GALLERY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGalleryItems(items: GalleryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

export function addToGallery(
  item: Omit<GalleryItem, "id" | "createdAt">
): GalleryItem {
  const newItem: GalleryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const items = loadGalleryItems();
  items.unshift(newItem);
  saveGalleryItems(items);
  return newItem;
}

export function removeFromGallery(id: string): void {
  const items = loadGalleryItems().filter((item) => item.id !== id);
  saveGalleryItems(items);
}

export function clearGallery(): void {
  saveGalleryItems([]);
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx tsc --noEmit src/lib/gallery.ts 2>&1 | head -20`
Expected: No errors (or only global type errors unrelated to this file)

- [ ] **Step 3: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add src/lib/gallery.ts
git commit -m "feat: add gallery CRUD library for localStorage"
```

---

### Task 2: Create Gallery List Page

**Files:**
- Create: `src/app/gallery/page.tsx`
- Create: `src/app/gallery/gallery-client.tsx`
- Create: `src/components/gallery/gallery-card.tsx`

- [ ] **Step 1: Create gallery-card.tsx**

```tsx
// src/components/gallery/gallery-card.tsx
"use client";

import Link from "next/link";
import { Trash2, Newspaper, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/gallery";

interface GalleryCardProps {
  item: GalleryItem;
  onDelete: (id: string) => void;
}

export function GalleryCard({ item, onDelete }: GalleryCardProps) {
  const isDiary = item.type === "diary";
  const styleLabels: Record<string, string> = {
    newspaper: "报纸风",
    chronicle: "编年风",
    prose: "散文风",
  };

  return (
    <Link
      href={`/gallery/${item.id}`}
      className={cn(
        "group relative block rounded-xl border border-quantum/10 bg-abyss/60 p-4",
        "transition-all duration-200 hover:border-quantum/25 hover:bg-abyss/80",
        "active:scale-[0.98]"
      )}
    >
      {/* Type badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium",
            isDiary
              ? "bg-quantum/10 text-quantum"
              : "bg-plasma/10 text-plasma"
          )}
        >
          {isDiary ? (
            <Newspaper className="size-3" />
          ) : (
            <Calendar className="size-3" />
          )}
          {isDiary ? "日记" : "周报"}
        </span>
        {isDiary && item.style && (
          <span className="text-xs text-static/50">
            {styleLabels[item.style] || item.style}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 text-sm font-medium text-signal">{item.title}</h3>

      {/* Date */}
      <p className="text-xs text-static/50">
        {new Date(item.createdAt).toLocaleDateString("zh-CN")}
      </p>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(item.id);
        }}
        className={cn(
          "absolute right-2 top-2 rounded-lg p-1.5",
          "text-static/30 opacity-0 transition-all group-hover:opacity-100",
          "hover:bg-red-500/10 hover:text-red-400"
        )}
      >
        <Trash2 className="size-3.5" />
      </button>
    </Link>
  );
}
```

- [ ] **Step 2: Create gallery-client.tsx**

```tsx
// src/app/gallery/gallery-client.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Image, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryCard } from "@/components/gallery/gallery-card";
import {
  loadGalleryItems,
  removeFromGallery,
  clearGallery,
  type GalleryItem,
} from "@/lib/gallery";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

export function GalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadGalleryItems());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      removeFromGallery(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("已删除");
    },
    [showToast]
  );

  const handleClearAll = useCallback(() => {
    if (!confirm("确定要清空所有画廊内容吗？")) return;
    clearGallery();
    setItems([]);
    showToast("已清空画廊");
  }, [showToast]);

  return (
    <div className="flex min-h-dvh flex-col bg-void">
      <DesktopNav activePage="gallery" />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Header */}
        <div className="border-b border-quantum/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-signal">图片画廊</h1>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs text-static/40 hover:text-red-400 transition-colors"
              >
                <Trash2 className="size-3.5" />
                清空
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-static/50">
            {items.length > 0
              ? `${items.length} 张已导出的内容`
              : "还没有导出的内容"}
          </p>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <Image className="mb-4 size-16 text-static/20" />
            <p className="mb-2 text-lg font-medium text-static">
              还没有导出的内容
            </p>
            <p className="max-w-xs text-sm text-void-text">
              去日记或周报页面，点击"保存到画廊"即可在这里查看 4K 高清图片
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <GalleryCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-emerald-500/90 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create page.tsx route**

```tsx
// src/app/gallery/page.tsx
import type { Metadata } from "next";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "图片画廊 · 平行宇宙日报",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
```

- [ ] **Step 4: Verify the page compiles**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx next build 2>&1 | tail -20`
Expected: Build succeeds (may show warnings but no errors for gallery files)

- [ ] **Step 5: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add src/app/gallery/ src/components/gallery/
git commit -m "feat: add gallery list page with card grid"
```

---

### Task 3: Create Gallery 4K Preview Page

**Files:**
- Create: `src/app/gallery/[id]/page.tsx`
- Create: `src/app/gallery/[id]/preview-client.tsx`

- [ ] **Step 1: Create preview-client.tsx**

```tsx
// src/app/gallery/[id]/preview-client.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { loadGalleryItems, removeFromGallery, type GalleryItem } from "@/lib/gallery";
import { formatMarkdown } from "@/lib/markdown";
import { DiaryHeader } from "@/components/diary/diary-header";
import {
  WeeklyReportDisplay,
  type WeeklyReport,
} from "@/components/weekly/weekly-report";

export function PreviewClient() {
  const params = useParams();
  const router = useRouter();
  const renderRef = useRef<HTMLDivElement>(null);
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Load item from localStorage
  useEffect(() => {
    const id = params.id as string;
    const items = loadGalleryItems();
    const found = items.find((i) => i.id === id);
    if (found) {
      setItem(found);
    } else {
      setError("未找到该画廊项目");
    }
  }, [params.id]);

  // Render to 4K image after item loads and DOM is ready
  useEffect(() => {
    if (!item || !renderRef.current) return;

    let cancelled = false;

    async function render() {
      // Wait for DOM to settle
      await new Promise((r) => setTimeout(r, 100));

      if (cancelled || !renderRef.current) return;

      try {
        const domtoimage = await import("dom-to-image-more");
        const url = await domtoimage.toJpeg(renderRef.current, {
          backgroundColor: "#000000",
          pixelRatio: 4,
          cacheBust: true,
          quality: 1.0,
        });
        if (!cancelled) {
          setDataUrl(url);
          setIsRendering(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Render failed:", err);
          setError("图片渲染失败，请重试");
          setIsRendering(false);
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [item]);

  const handleDelete = useCallback(() => {
    if (!item) return;
    if (!confirm("确定要删除这张画廊内容吗？")) return;
    removeFromGallery(item.id);
    router.push("/gallery");
  }, [item, router]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-void">
        <p className="mb-4 text-static/60">{error}</p>
        <Link
          href="/gallery"
          className="text-sm text-quantum hover:underline"
        >
          返回画廊
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-void">
        <Sparkles className="size-8 text-quantum animate-pulse" />
      </div>
    );
  }

  const isDiary = item.type === "diary";
  const weeklyReport = !isDiary ? JSON.parse(item.content) as WeeklyReport : null;

  return (
    <div className="flex min-h-dvh flex-col bg-void">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-quantum/10 px-4 py-3">
        <Link
          href="/gallery"
          className="flex items-center gap-2 text-sm text-static/60 hover:text-signal transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </Link>
        <h1 className="text-sm font-medium text-signal truncate max-w-[200px]">
          {item.title}
        </h1>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-static/40 hover:text-red-400 transition-colors"
        >
          <Trash2 className="size-3.5" />
          删除
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isRendering ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="relative">
              <div className="size-20 rounded-full bg-gradient-to-br from-quantum/20 to-plasma/20 blur-xl animate-pulse" />
              <Sparkles className="absolute inset-0 m-auto size-8 text-quantum animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-base font-medium text-signal">
                正在渲染 4K 高清图片
              </p>
              <p className="text-xs text-static">
                像素比 4x · 请稍候...
              </p>
            </div>
            <div className="flex gap-2">
              <span className="size-1.5 rounded-full bg-quantum animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-plasma animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-1.5 rounded-full bg-nebula-pink animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : dataUrl ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt={item.title}
              className="w-full max-w-2xl rounded-xl shadow-2xl"
            />
            <p className="text-xs text-static/40">
              长按图片可保存到相册
            </p>
          </div>
        ) : null}

        {/* Hidden render target */}
        <div
          ref={renderRef}
          className="fixed left-[-9999px] top-0"
          style={{ width: "800px" }}
        >
          <div className="bg-void rounded-xl p-6">
            {isDiary ? (
              <>
                <DiaryHeader style={item.style} date={item.date} />
                <article
                  className="mt-6 space-y-4 font-serif text-sm text-signal/90"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(item.content),
                  }}
                />
                <div className="mt-8 border-t border-quantum/10 pt-4">
                  <p className="font-serif text-xs italic text-static/60">
                    &mdash; 来自平行宇宙 {item.date} 的记录
                  </p>
                </div>
              </>
            ) : (
              weeklyReport && (
                <WeeklyReportDisplay
                  report={weeklyReport}
                  weekNum={parseInt(item.date.split("-W")[1])}
                  year={parseInt(item.date.split("-W")[0])}
                  dateRange={item.date}
                />
              )
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-emerald-500/90 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create page.tsx route for [id]**

```tsx
// src/app/gallery/[id]/page.tsx
import type { Metadata } from "next";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "4K 图片预览 · 平行宇宙日报",
};

export default function GalleryPreviewPage() {
  return <PreviewClient />;
}
```

- [ ] **Step 3: Verify the page compiles**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add "src/app/gallery/[id]/"
git commit -m "feat: add gallery 4K preview page"
```

---

### Task 4: Add Gallery Icon to Desktop Nav

**Files:**
- Modify: `src/components/desktop-nav.tsx`

- [ ] **Step 1: Add Image import and gallery link**

In `src/components/desktop-nav.tsx`, add `Image` to the lucide-react import:

```tsx
// Change this line:
import { Newspaper, Clock, BookOpen, Calendar, Star, History, Settings, ArrowLeft } from "lucide-react";
// To:
import { Newspaper, Clock, BookOpen, Calendar, Star, History, Settings, ArrowLeft, Image } from "lucide-react";
```

Then, in the component's return JSX, find the section with the date/week label on the right side. Add a gallery icon button before it. The exact location depends on the current JSX structure — look for the element that displays `date` or `weekLabel` and add before it:

```tsx
<Link
  href="/gallery"
  className={cn(
    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
    activePage === "gallery"
      ? "text-quantum bg-quantum/10"
      : "text-static/50 hover:text-signal"
  )}
>
  <Image className="size-4" />
  <span className="hidden lg:inline">画廊</span>
</Link>
```

- [ ] **Step 2: Verify build**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add src/components/desktop-nav.tsx
git commit -m "feat: add gallery icon to desktop navigation"
```

---

### Task 5: Modify Diary Export to Save to Gallery

**Files:**
- Modify: `src/components/diary/diary-content.tsx`

- [ ] **Step 1: Replace handleExport function**

Replace the entire `handleExport` callback (the one that uses dom-to-image-more) with a simple save-to-gallery function. Find the `handleExport` useCallback and replace it:

```typescript
const handleExport = useCallback(() => {
  if (!diary) return;
  addToGallery({
    type: "diary",
    title: `${diary.date} 日记`,
    content: diary.content,
    rawContent: diary.rawContent,
    style: diary.style,
    processMode: diary.processMode,
    date: diary.date,
  });
  showToast("已保存到画廊");
  window.location.href = "/gallery";
}, [diary, showToast]);
```

- [ ] **Step 2: Update imports**

Remove unused imports. Change the lucide-react import line from:

```tsx
import { RefreshCw, Download, Share2, Newspaper, Sparkles, Check, Image, PenLine, FileText, Trash2 } from "lucide-react";
```

To:

```tsx
import { RefreshCw, Share2, Newspaper, Sparkles, Check, PenLine, FileText, Trash2 } from "lucide-react";
```

Add the gallery import near the top of the file:

```tsx
import { addToGallery } from "@/lib/gallery";
```

- [ ] **Step 3: Update the export button**

Find the export button JSX (the one with `<Download` icon and text "导出长图"/"导出") and update its label. Change:

```tsx
<span className="hidden sm:inline">{isExporting ? "导出中..." : "导出长图"}</span>
<span className="sm:hidden">{isExporting ? "导出中" : "导出"}</span>
```

To:

```tsx
<span className="hidden sm:inline">保存到画廊</span>
<span className="sm:hidden">保存</span>
```

Also remove the `disabled={isExporting}` and the conditional icon logic. Simplify the button to:

```tsx
<button
  onClick={handleExport}
  className={cn(
    "flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2 min-h-[44px]",
    "bg-quantum/10 text-quantum border border-quantum/20",
    "text-sm font-medium",
    "transition-all duration-200 hover:bg-quantum/20 hover:border-quantum/30",
    "active:scale-[0.97]",
    "flex-1 sm:flex-none"
  )}
>
  <Sparkles className="size-4" />
  <span className="hidden sm:inline">保存到画廊</span>
  <span className="sm:hidden">保存</span>
</button>
```

- [ ] **Step 4: Remove unused state and imports**

Remove these unused state declarations:

```typescript
// Remove these lines:
const [isExporting, setIsExporting] = useState(false);
const exportRef = useRef<HTMLDivElement>(null);
```

Remove the `useRef` import if no longer needed:

```tsx
// Change: import { useState, useRef, useCallback, useEffect } from "react";
// To: import { useState, useCallback, useEffect } from "react";
```

- [ ] **Step 5: Verify build**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add src/components/diary/diary-content.tsx
git commit -m "feat: change diary export to save to gallery"
```

---

### Task 6: Modify Weekly Export to Save to Gallery

**Files:**
- Modify: `src/components/weekly/weekly-report.tsx`

- [ ] **Step 1: Replace the export handler**

Find the `handleExport` function in `weekly-report.tsx` (the one using dom-to-image-more) and replace it with:

```typescript
const handleExport = useCallback(() => {
  addToGallery({
    type: "weekly",
    title: `${year}年 第${weekNum}周 周报`,
    content: JSON.stringify(report),
    date: report.week,
  });
  window.location.href = "/gallery";
}, [report, weekNum, year]);
```

- [ ] **Step 2: Add gallery import**

Add near the top of the file:

```tsx
import { addToGallery } from "@/lib/gallery";
```

- [ ] **Step 3: Update the export button**

Find the export button and simplify it. Replace the button JSX with:

```tsx
<button
  onClick={handleExport}
  className={cn(
    "absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-lg px-3 py-1.5",
    "bg-quantum/10 text-quantum border border-quantum/20",
    "text-xs font-medium backdrop-blur-sm",
    "transition-all hover:bg-quantum/20",
    "active:scale-[0.97]"
  )}
>
  <Sparkles className="size-3.5" />
  保存到画廊
</button>
```

- [ ] **Step 4: Remove unused state/imports**

Remove any unused state variables related to exporting (e.g., `isExporting`, `exportRef` if they exist). Remove unused lucide-react icons (`Download`, `Loader2` if no longer used).

- [ ] **Step 5: Verify build**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add src/components/weekly/weekly-report.tsx
git commit -m "feat: change weekly export to save to gallery"
```

---

### Task 7: Add Gallery to Backup/Restore

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Add gallery to handleExport**

In the `handleExport` function, add the gallery key to the exported data. Find the `data` object construction and add:

```typescript
const handleExport = () => {
  const data = {
    settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
    diaries: JSON.parse(localStorage.getItem("parallel-universe-diaries") || "[]"),
    newspapers: JSON.parse(localStorage.getItem("parallel-universe-newspapers") || "[]"),
    gallery: JSON.parse(localStorage.getItem("parallel-universe-gallery") || "[]"),
    exportedAt: new Date().toISOString(),
  };
  // ... rest stays the same
```

- [ ] **Step 2: Add gallery to handleImport**

In the `handleImport` function, add the gallery key restore. After the newspapers restore line, add:

```typescript
if (data.gallery) localStorage.setItem("parallel-universe-gallery", JSON.stringify(data.gallery));
```

- [ ] **Step 3: Verify build**

Run: `cd "D:/初次合作项目/parallel-universe-daily" && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add src/app/settings/page.tsx
git commit -m "feat: include gallery data in backup/restore"
```

---

### Task 8: Build and Test Android APK

- [ ] **Step 1: Build the web app**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
npm run build
```

- [ ] **Step 2: Sync Capacitor**

```bash
npx cap sync android
```

- [ ] **Step 3: Build Android APK**

```bash
cd android && JAVA_HOME="/c/Users/陈一波/.jdks/jbr-17.0.14" ANDROID_HOME="/c/Users/陈一波/android-sdk" ./gradlew.bat assembleDebug
```

- [ ] **Step 4: Verify APK exists**

```bash
ls -la "D:/初次合作项目/parallel-universe-daily/android/app/build/outputs/apk/debug/app-debug.apk"
```

Expected: APK file exists

- [ ] **Step 5: Commit all changes**

```bash
cd "D:/初次合作项目/parallel-universe-daily"
git add -A
git commit -m "feat: gallery feature complete - 4K image preview and save"
```
