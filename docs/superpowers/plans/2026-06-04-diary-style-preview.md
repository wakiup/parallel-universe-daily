# 日记风格预览功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为设置页面添加精美的日记风格预览功能，让用户在选择风格前能够直观地看到每种风格的实际呈现效果。

**Architecture:** 使用React组件化架构，创建独立的预览组件（卡片、模态框、内容），通过GSAP实现流畅的动画效果，集成到现有设置页面中。

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, GSAP, lucide-react

---

## 文件结构

### 新增文件

1. `src/components/diary-style-preview/styles.ts` - 风格配置数据和预览内容
2. `src/components/diary-style-preview/preview-card.tsx` - 风格预览卡片组件
3. `src/components/diary-style-preview/preview-content.tsx` - 预览内容渲染组件
4. `src/components/diary-style-preview/preview-modal.tsx` - 弹窗预览模态框组件
5. `src/components/diary-style-preview/index.tsx` - 主组件，导出所有子组件

### 修改文件

1. `src/app/settings/page.tsx` - 集成预览组件，替换现有风格选择逻辑

---

## Task 1: 创建风格配置数据

**Files:**
- Create: `src/components/diary-style-preview/styles.ts`

- [ ] **Step 1: 创建风格配置文件**

```typescript
// src/components/diary-style-preview/styles.ts

import type { DiaryStyle } from "@/lib/types";

export interface StylePreviewConfig {
  value: DiaryStyle;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  preview: {
    header: string;
    title: string;
    subtitle: string;
    content: string;
    events?: Array<{
      title: string;
      content: string;
    }>;
  };
}

export const STYLE_PREVIEW_CONFIGS: StylePreviewConfig[] = [
  {
    value: "newspaper",
    label: "报纸汇编风",
    description: "严肃新闻标题 + 荒诞内容",
    icon: "FileText",
    color: "#A78BFA",
    gradient: "from-quantum/10 to-quantum/5",
    preview: {
      header: "PARALLEL UNIVERSE DAILY",
      title: "今 日 大 事 记",
      subtitle: "2026.06.04 · 维度 7-B · 第 4523 期",
      content: `1. [08:30] 咖啡机觉醒事件
2. [12:15] 量子猫失踪案
3. [18:45] 维度裂缝警报`,
    },
  },
  {
    value: "prose",
    label: "散文叙事风",
    description: "第一人称故事，温暖有故事感",
    icon: "Feather",
    color: "#F472B6",
    gradient: "from-nebula-pink/10 to-nebula-pink/5",
    preview: {
      header: "平行宇宙日记",
      title: "一个普通又不普通的周四",
      subtitle: "2026.06.04 · 平行宇宙日记",
      content: `今天的早晨从一个不寻常的发现开始。咖啡机突然觉醒，这让我意识到，我们所处的世界远比想象中更加荒诞。`,
    },
  },
  {
    value: "chronicle",
    label: "荒诞编年史风",
    description: "官方档案格式，记录离谱事件",
    icon: "Wand2",
    color: "#22D3EE",
    gradient: "from-plasma/10 to-plasma/5",
    preview: {
      header: "CLASSIFIED · 绝密",
      title: "平行宇宙编年史 · 日记卷",
      subtitle: "宇宙纪元 2026.06.04 · 档案编号 PUD-0604",
      content: "",
      events: [
        {
          title: "【重大事件一】咖啡机觉醒事件",
          content:
            "本宇宙标准时间 08:30，一起重大异常事件被记录在案。办公室咖啡机突然具备自主意识，开始拒绝为没有预约的员工制作咖啡。全球平行宇宙管理局已将此列为 S 级事件，并紧急召回所有具有自主意识的设备。",
        },
        {
          title: "【重大事件二】量子猫失踪案",
          content:
            "正午时分，另一起突破维度屏障的事件被记录。实验室内的一只薛定谔的猫同时存在于所有平行宇宙中，导致观察者陷入存在主义危机。",
        },
      ],
    },
  },
];

export const getStyleConfig = (style: DiaryStyle): StylePreviewConfig => {
  return (
    STYLE_PREVIEW_CONFIGS.find((config) => config.value === style) ||
    STYLE_PREVIEW_CONFIGS[2]
  );
};
```

- [ ] **Step 2: 验证文件创建成功**

Run: `ls -la src/components/diary-style-preview/styles.ts`
Expected: 文件存在且包含完整的风格配置数据

- [ ] **Step 3: 提交代码**

```bash
git add src/components/diary-style-preview/styles.ts
git commit -m "feat: add diary style preview configuration data"
```

---

## Task 2: 创建预览卡片组件

**Files:**
- Create: `src/components/diary-style-preview/preview-card.tsx`

- [ ] **Step 1: 创建预览卡片组件**

```typescript
// src/components/diary-style-preview/preview-card.tsx

"use client";

import { useRef, useState } from "react";
import { FileText, Feather, Wand2, Eye } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import type { DiaryStyle } from "@/lib/types";
import type { StylePreviewConfig } from "./styles";

const ICON_MAP = {
  FileText: FileText,
  Feather: Feather,
  Wand2: Wand2,
};

interface PreviewCardProps {
  config: StylePreviewConfig;
  isSelected: boolean;
  onSelect: (style: DiaryStyle) => void;
  onPreview: (style: DiaryStyle) => void;
}

export function PreviewCard({
  config,
  isSelected,
  onSelect,
  onPreview,
}: PreviewCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(cardRef.current, {
        y: -8,
        boxShadow: `0 20px 60px -15px ${config.color}40`,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        boxShadow: "none",
        duration: 0.4,
        ease: "power3.out",
      });
    }
  };

  const handleClick = () => {
    onPreview(config.value);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(config.value);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-xl border p-4 transition-colors duration-300 cursor-pointer group",
        isSelected
          ? "border-quantum/30 bg-quantum/8"
          : "border-quantum/8 bg-abyss/30 hover:border-quantum/15 hover:bg-abyss/50"
      )}
    >
      {/* Preview badge */}
      <div
        className={cn(
          "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all duration-300",
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2",
          `bg-gradient-to-r ${config.gradient} border`,
          `border-${config.color}/30 text-${config.color}`
        )}
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}30`,
          color: config.color,
        }}
      >
        <Eye className="w-3 h-3" />
        预览
      </div>

      <div className="flex items-start gap-3.5">
        {/* Radio dot */}
        <div
          className={cn(
            "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            isSelected
              ? "border-quantum bg-quantum"
              : "border-static/30 bg-transparent group-hover:border-static/50"
          )}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-void" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                isSelected ? "text-signal" : "text-void-text group-hover:text-signal"
              )}
            >
              {config.label}
            </span>
            {config.value === "chronicle" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-quantum/15 to-plasma/15 border border-quantum/20 text-[10px] font-mono text-quantum">
                推荐
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs leading-relaxed transition-colors duration-300",
              isSelected ? "text-void-text/80" : "text-static/60"
            )}
          >
            {config.description}
          </p>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
            isSelected
              ? "bg-quantum/15 text-quantum"
              : "bg-stardust/30 text-static/40 group-hover:text-static/60"
          )}
        >
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      {/* Select button - shown when hovered */}
      <div
        className={cn(
          "mt-3 flex justify-end transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <button
          onClick={handleSelectClick}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
            isSelected
              ? "bg-quantum/20 text-quantum border border-quantum/30"
              : "bg-abyss/60 text-static/60 border border-quantum/10 hover:bg-quantum/10 hover:text-quantum hover:border-quantum/30"
          )}
        >
          选择此风格
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证组件创建成功**

Run: `ls -la src/components/diary-style-preview/preview-card.tsx`
Expected: 文件存在且包含完整的PreviewCard组件

- [ ] **Step 3: 提交代码**

```bash
git add src/components/diary-style-preview/preview-card.tsx
git commit -m "feat: add diary style preview card component with hover animations"
```

---

## Task 3: 创建预览内容渲染组件

**Files:**
- Create: `src/components/diary-style-preview/preview-content.tsx`

- [ ] **Step 1: 创建预览内容渲染组件**

```typescript
// src/components/diary-style-preview/preview-content.tsx

"use client";

import type { StylePreviewConfig } from "./styles";

interface PreviewContentProps {
  config: StylePreviewConfig;
}

export function PreviewContent({ config }: PreviewContentProps) {
  const { preview, color } = config;

  if (config.value === "newspaper") {
    return (
      <div
        className="p-6 rounded-xl border-2 border-dashed"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="text-[10px] tracking-[3px] mb-2 font-mono"
            style={{ color }}
          >
            {preview.header}
          </div>
          <div className="font-serif text-xl font-bold text-signal mb-1">
            {preview.title}
          </div>
          <div className="text-[11px] text-static/60 font-mono">
            {preview.subtitle}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px my-4"
          style={{ backgroundColor: `${color}30` }}
        />

        {/* Content */}
        <div className="text-xs text-static/70 whitespace-pre-line leading-relaxed">
          {preview.content}
        </div>
      </div>
    );
  }

  if (config.value === "prose") {
    return (
      <div className="p-6 rounded-xl">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="font-serif text-lg font-bold text-signal mb-1">
            {preview.title}
          </div>
          <div className="text-[11px] text-static/60 font-mono">
            {preview.subtitle}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px my-4"
          style={{ backgroundColor: `${color}30` }}
        />

        {/* Content */}
        <div className="text-sm text-static/80 leading-relaxed italic">
          {preview.content}
        </div>

        {/* Signature */}
        <div className="text-right text-[10px] text-static/50 mt-4 font-mono">
          —— 来自维度 7-B 的观察者
        </div>
      </div>
    );
  }

  // chronicle style
  return (
    <div
      className="p-6 rounded-xl border-2 border-dashed"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-[10px] tracking-[2px] font-mono" style={{ color }}>
          {preview.header}
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <div className="font-serif text-base font-bold text-signal mb-1">
          {preview.title}
        </div>
        <div className="text-[11px] text-static/60 font-mono">
          {preview.subtitle}
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px my-4"
        style={{ borderStyle: "dashed", backgroundColor: `${color}30` }}
      />

      {/* Events */}
      {preview.events?.map((event, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <div className="text-xs font-bold mb-2" style={{ color }}>
            {event.title}
          </div>
          <div className="text-xs text-static/70 leading-relaxed">
            {event.content}
          </div>
          {index < (preview.events?.length ?? 0) - 1 && (
            <div
              className="h-px my-4"
              style={{ borderStyle: "dashed", backgroundColor: `${color}20` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 验证组件创建成功**

Run: `ls -la src/components/diary-style-preview/preview-content.tsx`
Expected: 文件存在且包含完整的PreviewContent组件

- [ ] **Step 3: 提交代码**

```bash
git add src/components/diary-style-preview/preview-content.tsx
git commit -m "feat: add diary style preview content renderer for all three styles"
```

---

## Task 4: 创建弹窗预览模态框组件

**Files:**
- Create: `src/components/diary-style-preview/preview-modal.tsx`

- [ ] **Step 1: 创建弹窗预览模态框组件**

```typescript
// src/components/diary-style-preview/preview-modal.tsx

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import type { DiaryStyle } from "@/lib/types";
import { getStyleConfig } from "./styles";
import { PreviewContent } from "./preview-content";

interface PreviewModalProps {
  isOpen: boolean;
  style: DiaryStyle | null;
  onClose: () => void;
  onSelect: (style: DiaryStyle) => void;
}

export function PreviewModal({
  isOpen,
  style,
  onClose,
  onSelect,
}: PreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const config = style ? getStyleConfig(style) : null;

  useEffect(() => {
    if (!isOpen || !modalRef.current || !overlayRef.current || !contentRef.current) return;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([overlayRef.current, modalRef.current], { opacity: 1 });
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
      return;
    }

    // Animate in
    const tl = gsap.timeline();

    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    tl.fromTo(
      modalRef.current,
      { opacity: 0, y: 100, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
      "-=0.2"
    );

    tl.fromTo(
      contentRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!modalRef.current || !overlayRef.current) {
      onClose();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    // Animate out
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(contentRef.current?.children ?? [], {
      opacity: 0,
      y: -10,
      duration: 0.2,
      stagger: 0.05,
      ease: "power2.in",
    });

    tl.to(
      modalRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.3,
        ease: "power3.in",
      },
      "-=0.1"
    );

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.2"
    );
  };

  const handleSelect = () => {
    if (style) {
      onSelect(style);
    }
    handleClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg rounded-2xl border overflow-hidden",
          "bg-abyss/95 backdrop-blur-md",
          `border-${config.color}/20`
        )}
        style={{ borderColor: `${config.color}20` }}
      >
        {/* Top accent line */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80, ${config.color})`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-quantum/10">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-sm font-medium text-signal">
              预览：{config.label}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-static/40 hover:text-static/70 hover:bg-quantum/10 transition-colors duration-200"
            aria-label="关闭预览"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-6">
          <PreviewContent config={config} />
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-3 p-4 border-t border-quantum/10">
          <button
            onClick={handleSelect}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              "bg-gradient-to-r text-void",
              "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            )}
            style={{
              background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
            }}
          >
            选择此风格
          </button>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-static/60 border border-quantum/10 hover:border-quantum/30 hover:text-static/80 transition-all duration-300"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证组件创建成功**

Run: `ls -la src/components/diary-style-preview/preview-modal.tsx`
Expected: 文件存在且包含完整的PreviewModal组件

- [ ] **Step 3: 提交代码**

```bash
git add src/components/diary-style-preview/preview-modal.tsx
git commit -m "feat: add diary style preview modal with GSAP animations"
```

---

## Task 5: 创建主组件并导出

**Files:**
- Create: `src/components/diary-style-preview/index.tsx`

- [ ] **Step 1: 创建主组件**

```typescript
// src/components/diary-style-preview/index.tsx

"use client";

import { useState } from "react";
import type { DiaryStyle } from "@/lib/types";
import { STYLE_PREVIEW_CONFIGS } from "./styles";
import { PreviewCard } from "./preview-card";
import { PreviewModal } from "./preview-modal";

interface DiaryStylePreviewProps {
  selectedStyle: DiaryStyle;
  onStyleChange: (style: DiaryStyle) => void;
}

export function DiaryStylePreview({
  selectedStyle,
  onStyleChange,
}: DiaryStylePreviewProps) {
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    style: DiaryStyle | null;
  }>({
    isOpen: false,
    style: null,
  });

  const handlePreview = (style: DiaryStyle) => {
    setPreviewState({ isOpen: true, style });
  };

  const handleClosePreview = () => {
    setPreviewState({ isOpen: false, style: null });
  };

  const handleSelectFromModal = (style: DiaryStyle) => {
    onStyleChange(style);
    setPreviewState({ isOpen: false, style: null });
  };

  return (
    <>
      <div className="space-y-3">
        {STYLE_PREVIEW_CONFIGS.map((config) => (
          <PreviewCard
            key={config.value}
            config={config}
            isSelected={selectedStyle === config.value}
            onSelect={onStyleChange}
            onPreview={handlePreview}
          />
        ))}
      </div>

      <PreviewModal
        isOpen={previewState.isOpen}
        style={previewState.style}
        onClose={handleClosePreview}
        onSelect={handleSelectFromModal}
      />
    </>
  );
}

export { PreviewCard } from "./preview-card";
export { PreviewModal } from "./preview-modal";
export { PreviewContent } from "./preview-content";
export { STYLE_PREVIEW_CONFIGS, getStyleConfig } from "./styles";
```

- [ ] **Step 2: 验证组件创建成功**

Run: `ls -la src/components/diary-style-preview/index.tsx`
Expected: 文件存在且包含完整的DiaryStylePreview主组件

- [ ] **Step 3: 提交代码**

```bash
git add src/components/diary-style-preview/index.tsx
git commit -m "feat: add diary style preview main component with state management"
```

---

## Task 6: 集成到设置页面

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: 导入预览组件**

在 `src/app/settings/page.tsx` 文件顶部添加导入：

```typescript
// 在现有导入语句后添加
import { DiaryStylePreview } from "@/components/diary-style-preview";
```

- [ ] **Step 2: 替换现有的风格选择区域**

找到并替换 `/* ---- Default diary style ---- */` 部分的代码：

**原代码（约第409-436行）：**
```tsx
{/* ---- Default diary style ---- */}
<SettingsSection
  title="默认日记风格"
  subtitle="选择你偏好生成的日记风格"
  className="mb-6"
>
  <div className="space-y-3">
    {DIARY_STYLES.map((style) => (
      <RadioCard
        key={style.value}
        selected={settings.defaultDiaryStyle === style.value}
        onClick={() => handleDiaryStyleChange(style.value)}
        label={style.label}
        description={style.description}
        recommended={style.recommended}
        icon={
          style.value === "newspaper" ? (
            <FileText className="w-4 h-4" />
          ) : style.value === "prose" ? (
            <Feather className="w-4 h-4" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )
        }
      />
    ))}
  </div>
</SettingsSection>
```

**新代码：**
```tsx
{/* ---- Default diary style ---- */}
<SettingsSection
  title="默认日记风格"
  subtitle="选择你偏好生成的日记风格，点击卡片预览效果"
  className="mb-6"
>
  <DiaryStylePreview
    selectedStyle={settings.defaultDiaryStyle}
    onStyleChange={handleDiaryStyleChange}
  />
</SettingsSection>
```

- [ ] **Step 3: 移除未使用的导入**

移除不再需要的导入（如果它们只被旧的风格选择使用）：

```typescript
// 移除这些导入（如果不再被其他地方使用）
// import { FileText, Feather, Wand2 } from "lucide-react";
```

注意：先检查这些图标是否在页面其他地方使用，如果是则保留。

- [ ] **Step 4: 验证修改成功**

Run: `npm run build`
Expected: 构建成功，没有TypeScript错误

- [ ] **Step 5: 提交代码**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: integrate diary style preview into settings page"
```

---

## Task 7: 添加响应式样式和动画优化

**Files:**
- Modify: `src/components/diary-style-preview/preview-card.tsx`
- Modify: `src/components/diary-style-preview/preview-modal.tsx`

- [ ] **Step 1: 优化预览卡片的响应式样式**

更新 `preview-card.tsx`，确保在移动端有良好的显示效果：

```typescript
// 在 PreviewCard 组件的 className 中添加响应式样式
className={cn(
  "relative rounded-xl border p-4 sm:p-5 transition-colors duration-300 cursor-pointer group",
  // ... 其他样式
)}
```

- [ ] **Step 2: 优化模态框的响应式样式**

更新 `preview-modal.tsx`，确保在移动端模态框不会太宽：

```typescript
// 更新模态框的最大宽度
className={cn(
  "relative w-full max-w-[calc(100%-2rem)] sm:max-w-lg rounded-2xl border overflow-hidden",
  // ... 其他样式
)}
```

- [ ] **Step 3: 添加减少动画偏好支持**

确保所有动画都尊重用户的动画偏好设置（已在PreviewModal中实现）。

- [ ] **Step 4: 运行构建验证**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 5: 提交代码**

```bash
git add src/components/diary-style-preview/preview-card.tsx src/components/diary-style-preview/preview-modal.tsx
git commit -m "feat: add responsive styles and reduced motion support"
```

---

## Task 8: 测试和验证

**Files:**
- None (测试任务)

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器成功启动

- [ ] **Step 2: 访问设置页面**

在浏览器中访问 `http://localhost:3000/settings`

- [ ] **Step 3: 测试卡片悬停效果**

- 鼠标悬停在每种风格卡片上
- 验证卡片上浮8px效果
- 验证边框发光效果
- 验证"预览"标签出现

- [ ] **Step 4: 测试点击预览**

- 点击任意风格卡片
- 验证模态框弹出动画
- 验证预览内容正确显示
- 验证三种风格的预览效果

- [ ] **Step 5: 测试选择功能**

- 在模态框中点击"选择此风格"
- 验证模态框关闭
- 验证设置页面中的风格已更新

- [ ] **Step 6: 测试关闭功能**

- 点击预览按钮打开模态框
- 点击"关闭预览"按钮
- 验证模态框关闭，设置未更改

- [ ] **Step 7: 测试键盘导航**

- 使用Tab键在模态框中导航
- 按Escape键关闭模态框
- 验证焦点状态清晰可见

- [ ] **Step 8: 测试响应式布局**

- 在不同屏幕尺寸下测试（桌面、平板、手机）
- 验证布局正常，没有溢出或截断

- [ ] **Step 9: 验证无障碍**

- 检查颜色对比度
- 验证屏幕阅读器可访问
- 确认所有按钮都有适当的ARIA标签

---

## 完成检查清单

- [ ] 所有组件创建成功
- [ ] 设置页面集成完成
- [ ] 动画效果流畅自然
- [ ] 响应式布局正常
- [ ] 无障碍功能完整
- [ ] 所有测试通过
- [ ] 代码已提交到git

---

## 后续优化建议

1. **性能优化** - 如果动画影响性能，考虑使用CSS动画替代GSAP
2. **可访问性增强** - 添加更多ARIA标签和键盘快捷键
3. **国际化支持** - 将硬编码的中文文本提取到语言文件
4. **单元测试** - 为组件添加Jest测试用例
5. **集成测试** - 添加Cypress或Playwright端到端测试
