# Bugfix & Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all security vulnerabilities, bugs, UX issues, and code quality problems identified in the project audit.

**Architecture:** Four parallel workstreams: (1) Security & critical bugs, (2) Error handling & UX, (3) Feature wiring, (4) Code cleanup.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, html-to-image, lucide-react

---

## Task 1: XSS Sanitization in markdown.ts

**Files:**
- Modify: `src/lib/markdown.ts`

- [ ] Add HTML entity escaping before inline formatting to prevent XSS via `dangerouslySetInnerHTML`

```typescript
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

- [ ] Call `escapeHtml` at the start of `inlineFormat` so all user text is sanitized before any markdown formatting is applied

## Task 2: Array Bounds Check in generateMockDiary

**Files:**
- Modify: `src/app/api/diary/generate/route.ts:15-113`

- [ ] Guard all `events[0]`, `events[1]`, `events[2]` accesses with optional chaining or bounds checks

## Task 3: Date Validation in storage.ts

**Files:**
- Modify: `src/lib/storage.ts`

- [ ] Add YYYY-MM-DD format validation before using date in filesystem path

## Task 4: Error Feedback on All Generation Flows

**Files:**
- Modify: `src/app/page.tsx:155-175` (newspaper generation)
- Modify: `src/app/diary/[date]/page.tsx:142-165` (diary generation)
- Modify: `src/app/weekly/[week]/page.tsx:360-380` (weekly generation)

- [ ] Add error toast/feedback in all empty catch blocks

## Task 5: Fix "查看全部" Button

**Files:**
- Modify: `src/app/page.tsx:403-406`

- [ ] Add navigation to history page

## Task 6: Wire Settings to Diary Generation

**Files:**
- Modify: `src/app/diary/[date]/page.tsx:142-165`

- [ ] Read user's preferred diary style from settings and pass to API

## Task 7: History Page Load Real Data

**Files:**
- Create: `src/app/api/diary/list/route.ts`
- Modify: `src/app/history/page.tsx`

- [ ] Create API endpoint using `getDiariesByMonth`
- [ ] Update history page to fetch real data

## Task 8: Weekly Report Real AI Integration

**Files:**
- Modify: `src/app/api/weekly/generate/route.ts`

- [ ] Add Anthropic API call using existing `getWeeklyPrompt`

## Task 9: Code Cleanup

**Files:**
- Modify: `package.json` (remove html2canvas)
- Modify: `src/components/diary/diary-content.tsx` (remove unused Link import)
- Modify: `src/app/page.tsx` (remove unused ChevronRight, Zap imports)
- Modify: `src/components/animations.tsx` (remove unused components)

- [ ] Remove html2canvas dependency
- [ ] Remove unused imports
- [ ] Remove unused animation components

## Task 10: Extract Shared NavLink Component

**Files:**
- Create: `src/components/nav-link.tsx`
- Modify: 5 files that duplicate NavLink

- [ ] Create shared component
- [ ] Replace all duplicates
