# Multi-Diary Per Day Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow multiple diary entries per day (handwritten + AI), displayed as a clickable list in the left panel with detail view on the right.

**Architecture:** Change storage from single-diary-per-date to array-per-date. Add a diary list UI in the left panel. Right panel switches content based on selected diary.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, GSAP, localStorage

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/client-api.ts` | Modify | Replace `getDiaryByDate`/`saveDiary`/`deleteDiary` with array-based APIs |
| `src/app/diary/[date]/diary-client.tsx` | Modify | Add diary list state, selection logic, left panel list UI |
| `src/components/diary/diary-content.tsx` | No change | Props interface stays the same |
| `src/app/history/page.tsx` | Verify | `getDiariesByMonth` still works (it already returns array) |

---

### Task 1: Update storage APIs in client-api.ts

**Files:**
- Modify: `src/lib/client-api.ts:29-56`

- [ ] **Step 1: Replace `getDiaryByDate` with `getDiariesByDate`**

Replace lines 29-32:

```typescript
export async function getDiariesByDate(date: string): Promise<DiaryEntry[]> {
  const diaries = loadAllDiaries();
  return diaries
    .filter((d) => d.date === date)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
```

- [ ] **Step 2: Replace `saveDiary` with `appendDiary`**

Replace lines 34-43:

```typescript
export async function appendDiary(diary: DiaryEntry): Promise<void> {
  const diaries = loadAllDiaries();
  diaries.push(diary);
  saveAllDiaries(diaries);
}
```

- [ ] **Step 3: Replace `deleteDiary` with `deleteDiaryById`**

Replace lines 52-56:

```typescript
export async function deleteDiaryById(id: string): Promise<void> {
  const diaries = loadAllDiaries();
  const updated = diaries.filter((d) => d.id !== id);
  saveAllDiaries(updated);
}
```

- [ ] **Step 4: Verify `getDiariesByMonth` still works**

The existing implementation at lines 45-50 already returns an array and filters by date prefix. No change needed. Just confirm it compiles.

- [ ] **Step 5: Update imports in files that use the old APIs**

Check `src/app/diary/[date]/diary-client.tsx` — it imports `getDiaryByDate`, `saveDiary`, `deleteDiary`. These will be updated in Task 2.

Check `src/app/history/page.tsx` — it imports `getDiariesByMonth`. No change needed.

- [ ] **Step 6: Build to verify no type errors**

Run: `"C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -20`

Expected: TypeScript compiles, may show import errors in diary-client.tsx (expected, fixed in Task 2).

---

### Task 2: Update diary-client.tsx state and handlers

**Files:**
- Modify: `src/app/diary/[date]/diary-client.tsx:1-10` (imports)
- Modify: `src/app/diary/[date]/diary-client.tsx:26-39` (state)
- Modify: `src/app/diary/[date]/diary-client.tsx:41-79` (useEffect)
- Modify: `src/app/diary/[date]/diary-client.tsx:106-191` (handlers)

- [ ] **Step 1: Update imports**

Replace the import line for client-api functions:

```typescript
import { getDiariesByDate, appendDiary, deleteDiaryById, generateDiary, processContent } from "@/lib/client-api";
```

- [ ] **Step 2: Replace state variables**

Replace the state block (lines 30-39) with:

```typescript
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [processMode, setProcessMode] = useState<ProcessMode>("none");
  const [isSaving, setIsSaving] = useState(false);
```

- [ ] **Step 3: Derive selected diary**

Add a derived value after the state block:

```typescript
  const selectedDiary = diaries.find((d) => d.id === selectedDiaryId) ?? null;
```

- [ ] **Step 4: Update useEffect to load all diaries**

Replace the useEffect (lines 41-79):

```typescript
  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    async function fetchDiaries() {
      setLoading(true);
      try {
        const found = await getDiariesByDate(date);
        if (!cancelled) {
          setDiaries(found);
          // Auto-select the latest diary
          if (found.length > 0) {
            setSelectedDiaryId(found[found.length - 1].id);
          }
        }
      } catch {
        if (!cancelled) setDiaries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDiaries();

    const dayNewspapers = getNewspapersByDate(date);
    const asEvents: Event[] = dayNewspapers.map((n) => ({
      id: n.id,
      headline: n.headline,
      subheadline: n.subheadline,
      content: n.content,
      timestamp: n.timestamp,
      weather: n.weather,
      mood: n.mood,
      color: n.color,
      dimension: n.dimension,
    }));
    setEvents(asEvents);

    return () => {
      cancelled = true;
    };
  }, [date]);
```

- [ ] **Step 5: Update handleGenerate**

Replace handleGenerate (lines 106-123):

```typescript
  const handleGenerate = async () => {
    if (isGenerating || events.length === 0) return;

    const settingsStr = localStorage.getItem("parallel-universe-settings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    const style = (settings.defaultDiaryStyle || "newspaper") as DiaryStyle;

    setIsGenerating(true);
    try {
      const diaryResult = await generateDiary(date, style, events);
      await appendDiary(diaryResult);
      setDiaries((prev) => [...prev, diaryResult]);
      setSelectedDiaryId(diaryResult.id);
    } catch {
      setError("生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };
```

- [ ] **Step 6: Update handleRegenerate**

Replace handleRegenerate (lines 125-127):

```typescript
  const handleRegenerate = async () => {
    if (isGenerating || events.length === 0 || !selectedDiaryId) return;

    const settingsStr = localStorage.getItem("parallel-universe-settings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    const style = (settings.defaultDiaryStyle || "newspaper") as DiaryStyle;

    setIsGenerating(true);
    try {
      // Delete old, generate new
      await deleteDiaryById(selectedDiaryId);
      const diaryResult = await generateDiary(date, style, events);
      await appendDiary(diaryResult);
      setDiaries((prev) => [
        ...prev.filter((d) => d.id !== selectedDiaryId),
        diaryResult,
      ]);
      setSelectedDiaryId(diaryResult.id);
    } catch {
      setError("重新生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };
```

- [ ] **Step 7: Update handleDelete**

Replace handleDelete (lines 129-133):

```typescript
  const handleDelete = async () => {
    if (!selectedDiaryId) return;
    await deleteDiaryById(selectedDiaryId);
    setDiaries((prev) => {
      const updated = prev.filter((d) => d.id !== selectedDiaryId);
      // Auto-select the last remaining diary, or null
      setSelectedDiaryId(updated.length > 0 ? updated[updated.length - 1].id : null);
      return updated;
    });
  };
```

- [ ] **Step 8: Update handleSaveManual**

Replace handleSaveManual (lines 147-191):

```typescript
  const handleSaveManual = async () => {
    if (!manualContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const finalContent = await processContent(manualContent, processMode, "newspaper");

      const newDiary: DiaryEntry = {
        id: crypto.randomUUID(),
        date: date!,
        type: "handwritten",
        content: finalContent,
        style: "newspaper",
        processMode,
        rawContent: manualContent,
        eventIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await appendDiary(newDiary);
      setDiaries((prev) => [...prev, newDiary]);
      setSelectedDiaryId(newDiary.id);
      setIsManualMode(false);
    } catch {
      const fallbackDiary: DiaryEntry = {
        id: crypto.randomUUID(),
        date: date!,
        type: "handwritten",
        content: manualContent,
        style: "newspaper",
        processMode: "none",
        rawContent: manualContent,
        eventIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await appendDiary(fallbackDiary);
      setDiaries((prev) => [...prev, fallbackDiary]);
      setSelectedDiaryId(fallbackDiary.id);
      setIsManualMode(false);
      setError("AI 加工失败，已保存原始内容");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };
```

- [ ] **Step 9: Build to verify**

Run: `"C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1 | head -30`

Expected: TypeScript compiles, but the JSX still references old `diary` variable — expected, fixed in Task 3.

---

### Task 3: Add diary list UI in left panel

**Files:**
- Modify: `src/app/diary/[date]/diary-client.tsx:202-350` (JSX return)

- [ ] **Step 1: Add diary list section in left panel**

In the left panel div (after the EventList component and error display, before the closing `</div>` of `diary-left-panel`), add the diary list. Replace the left panel content:

```tsx
          <div className="diary-left-panel flex flex-col overflow-hidden rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm p-5">
            <EventList
              events={events}
              onGenerate={handleGenerate}
              onWriteManual={handleWriteManual}
              isGenerating={isGenerating}
            />
            {error && (
              <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Diary list section */}
            <div className="mt-4 border-t border-quantum/8 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono text-static/60 tracking-wide">
                  今日日记 ({diaries.length})
                </h4>
              </div>

              {diaries.length === 0 ? (
                <p className="text-[11px] text-static/40 text-center py-4">
                  {events.length > 0
                    ? "点击上方按钮生成日记"
                    : "暂无日记"}
                </p>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {diaries.map((d) => {
                    const isSelected = d.id === selectedDiaryId;
                    const isAi = d.type === "ai";
                    const time = d.createdAt
                      ? new Date(d.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";
                    const wordCount = d.content?.length ?? 0;
                    const styleLabel =
                      d.style === "chronicle"
                        ? "编年史"
                        : d.style === "prose"
                        ? "散文"
                        : "报纸";
                    const processLabel =
                      d.processMode === "tone"
                        ? "语气转换"
                        : d.processMode === "absurd"
                        ? "荒诞润色"
                        : d.processMode === "both"
                        ? "两者结合"
                        : null;

                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDiaryId(d.id)}
                        className={cn(
                          "w-full text-left rounded-xl p-3 transition-all duration-200 border",
                          isSelected
                            ? "border-l-2 border-l-quantum border-quantum/20 bg-quantum/5"
                            : "border-quantum/8 bg-abyss/30 hover:bg-abyss/50 hover:border-quantum/15"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.5 rounded",
                              isAi
                                ? "bg-quantum/10 text-quantum"
                                : "bg-plasma/10 text-plasma"
                            )}
                          >
                            {isAi ? "AI" : "手写"}
                          </span>
                          <span className="text-[10px] text-static/50">
                            {styleLabel}
                            {processLabel ? ` · ${processLabel}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-static/40">
                            {time}
                          </span>
                          <span className="text-[10px] font-mono text-static/30">
                            {wordCount}字
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
```

- [ ] **Step 2: Update right panel to use selectedDiary**

Replace the right panel content (the part after `isManualMode ?` ternary):

```tsx
          <div className="diary-right-panel relative overflow-hidden rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Sparkles className="size-8 text-quantum/40 animate-pulse" />
                  <p className="text-sm text-static">加载中...</p>
                </div>
              </div>
            ) : isManualMode ? (
              /* ... manual mode editor stays exactly the same ... */
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-quantum/10 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <PenLine className="size-4 text-quantum" />
                    <h3 className="text-sm font-semibold text-signal">
                      手写日记
                    </h3>
                  </div>
                  <button
                    onClick={handleCancelManual}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-void-text transition-colors hover:text-signal hover:bg-abyss/60"
                  >
                    <X className="size-3.5" />
                    取消
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <textarea
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="今天想记录什么..."
                    className={cn(
                      "w-full min-h-[14rem] resize-none rounded-xl",
                      "border border-quantum/10 bg-void/60 px-4 py-3",
                      "text-sm leading-relaxed text-signal placeholder:text-static/50",
                      "outline-none transition-colors",
                      "focus:border-quantum/30 focus:ring-1 focus:ring-quantum/20"
                    )}
                  />

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-medium text-void-text">
                      AI 加工方式：
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          { mode: "none" as const, label: "不加工" },
                          { mode: "tone" as const, label: "语气转换" },
                          { mode: "absurd" as const, label: "荒诞润色" },
                          { mode: "both" as const, label: "两者结合" },
                        ] as const
                      ).map(({ mode, label }) => (
                        <label
                          key={mode}
                          onClick={() => setProcessMode(mode)}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                            "border text-xs font-medium transition-all duration-200",
                            processMode === mode
                              ? "border-quantum/30 bg-quantum/10 text-quantum"
                              : "border-quantum/10 bg-void/40 text-void-text hover:border-quantum/20 hover:text-signal"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block size-3 rounded-full border-2",
                              processMode === mode
                                ? "border-quantum bg-quantum"
                                : "border-static/40 bg-transparent"
                            )}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-quantum/10 px-5 py-3">
                  <span className="font-mono text-xs text-static">
                    字数：{manualContent.length}
                  </span>
                  <button
                    onClick={handleSaveManual}
                    disabled={!manualContent.trim() || isSaving}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-5 py-2.5",
                      "bg-gradient-to-r from-quantum to-quantum-dim font-medium text-void text-sm",
                      "transition-all duration-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.3)]",
                      "active:scale-[0.98]",
                      "disabled:pointer-events-none disabled:opacity-40"
                    )}
                  >
                    <Sparkles className="size-4" />
                    {isSaving ? "保存中..." : "保存日记"}
                  </button>
                </div>
              </div>
            ) : selectedDiary ? (
              <DiaryContent
                diary={selectedDiary}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                isGenerating={isGenerating}
              />
            ) : (
              /* Empty state: no diary selected */
              <div className="flex h-full flex-col items-center justify-center text-center px-6">
                <div className="size-16 rounded-full bg-gradient-to-br from-quantum/10 to-plasma/10 flex items-center justify-center mb-4">
                  <BookOpen className="size-7 text-static/30" />
                </div>
                <p className="text-sm text-static/60 mb-1">选择左侧日记查看</p>
                <p className="text-xs text-static/40">
                  {events.length > 0
                    ? "或点击上方按钮生成今日日记"
                    : "先添加事件，再生成日记"}
                </p>
              </div>
            )}
          </div>
```

Note: Add `BookOpen` to the lucide-react import at the top of the file if not already present.

- [ ] **Step 3: Add GSAP animation for diary list items**

In the `useLayoutEffect` block (lines 81-104), add animation for diary list items:

```typescript
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      gsap.from(".diary-left-panel", {
        opacity: 0,
        x: -60,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.from(".diary-right-panel", {
        opacity: 0,
        x: 60,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.25,
      });
    });

    return () => ctx.revert();
  }, []);
```

No change needed — the existing animations cover the panels. Diary list items will naturally animate in with the left panel.

- [ ] **Step 4: Build and verify full compilation**

Run: `"C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1`

Expected: Build succeeds with no TypeScript errors. All 428+ static pages generated.

---

### Task 4: Build, deploy, and verify

**Files:**
- None (deployment only)

- [ ] **Step 1: Full production build**

Run: `"C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" next build 2>&1`

Expected: Build succeeds, all pages generated.

- [ ] **Step 2: Deploy to Cloudflare Pages**

Run: `"C:/Program Files/nodejs/node.exe" "C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js" wrangler pages deploy out --project-name=parallel-universe-daily --commit-dirty=true 2>&1`

Expected: Deployment success message with URL.

- [ ] **Step 3: Manual verification checklist**

Open the deployed URL on mobile and verify:
1. Click "日记" in bottom nav → goes to today's diary page, no 404
2. Left panel shows "今日日记 (0)" with hint text
3. Click "手动写日记" → write content → save → left panel shows 1 diary entry
4. Click "生成今日日记" → AI diary generated → left panel now shows 2 entries
5. Click first entry → right panel switches to show it
6. Click second entry → right panel switches to show it
7. Delete one entry → list updates, switches to remaining entry
8. Desktop layout works the same way
