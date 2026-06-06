"use client";

import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Share2, Newspaper, Sparkles, Check, PenLine, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiaryHeader } from "./diary-header";
import { formatMarkdown } from "@/lib/markdown";
import type { DiaryEntry } from "@/lib/types";
import { addToGallery } from "@/lib/gallery";

interface DiaryContentProps {
  diary: DiaryEntry | null;
  onRegenerate: () => void;
  onDelete: () => void;
  isGenerating: boolean;
}

type ToastType = "success" | "error";

function Toast({ message, type, onDone }: { message: string; type: ToastType; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-md",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
        type === "success"
          ? "bg-emerald-500/90 text-white"
          : "bg-red-500/90 text-white"
      )}
    >
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-6xl opacity-60">
        <Newspaper className="size-16 text-static/40" />
      </div>
      <p className="mb-2 text-lg font-medium text-static">
        尚无今日日记
      </p>
      <p className="max-w-xs text-sm text-void-text">
        请先添加事件，然后生成你的平行宇宙日记
      </p>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      {/* Animated orb */}
      <div className="relative">
        <div className="size-20 rounded-full bg-gradient-to-br from-quantum/20 to-plasma/20 blur-xl diary-loading-pulse" />
        <Sparkles className="absolute inset-0 m-auto size-8 text-quantum animate-pulse" />
      </div>
      <div className="space-y-2">
        <p className="text-base font-medium text-signal">正在生成平行宇宙日记</p>
        <p className="text-xs text-static">量子态正在坍缩为文字...</p>
      </div>
      {/* Progress dots */}
      <div className="flex gap-2">
        <span className="size-1.5 rounded-full bg-quantum animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="size-1.5 rounded-full bg-plasma animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="size-1.5 rounded-full bg-nebula-pink animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function GeneratingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-abyss/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="size-16 rounded-full bg-gradient-to-br from-quantum/20 to-plasma/20 blur-lg diary-loading-pulse" />
          <RefreshCw className="absolute inset-0 m-auto size-6 text-quantum animate-spin" />
        </div>
        <p className="text-sm text-static">重新生成中...</p>
      </div>
    </div>
  );
}

export function DiaryContent({
  diary,
  onRegenerate,
  onDelete,
  isGenerating,
}: DiaryContentProps) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
  }, []);

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
    showToast("已保存到画廊", "success");
    window.location.href = "/gallery";
  }, [diary, showToast]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = diary?.content?.slice(0, 200) || "";
    const shareData = {
      title: `平行宇宙日报 · ${diary?.date}`,
      text: text ? `${text}...\n\n${url}` : url,
      url,
    };

    // Try Web Share API first (mainly useful on mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("分享成功", "success");
        return;
      } catch (err) {
        // User cancelled or share unavailable — fall through to clipboard
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback: copy rich text to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.text);
        setShareState("copied");
        showToast("已复制到剪贴板", "success");
        setTimeout(() => setShareState("idle"), 2000);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = shareData.text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setShareState("copied");
        showToast("已复制到剪贴板", "success");
        setTimeout(() => setShareState("idle"), 2000);
      }
    } catch (err) {
      console.error("Clipboard write failed:", err);
      showToast("复制失败，请长按文本手动复制", "error");
    }
  }, [diary, showToast]);

  if (!diary) {
    if (isGenerating) {
      return <GeneratingState />;
    }
    return <EmptyState />;
  }

  const style = diary.style ?? "newspaper";
  const contentHtml = formatMarkdown(diary.content);
  const hasComparison = diary.rawContent && diary.rawContent !== diary.content && diary.processMode !== "none";

  return (
    <div className="flex h-full flex-col">
      {/* 内容区：可滚动 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* 对比视图切换 - 在导出区域外面 */}
        {hasComparison && (
          <div className="mb-4 flex items-center gap-1 rounded-xl border border-quantum/10 bg-abyss/60 p-1">
            <button
              onClick={() => setShowOriginal(false)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                !showOriginal
                  ? "bg-quantum/15 text-quantum border border-quantum/20"
                  : "text-static hover:text-void-text"
              )}
            >
              <Sparkles className="size-3.5" />
              AI 加工后
            </button>
            <button
              onClick={() => setShowOriginal(true)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                showOriginal
                  ? "bg-quantum/15 text-quantum border border-quantum/20"
                  : "text-static hover:text-void-text"
              )}
            >
              <PenLine className="size-3.5" />
              原文
            </button>
          </div>
        )}

        {/* Export target area */}
        <div className="bg-void rounded-xl p-6">
          {/* 报头 */}
          <DiaryHeader style={style} date={diary.date} />

          {/* 正文内容 */}
          {showOriginal && hasComparison ? (
            <article className="diary-content diary-fade-in mt-6 space-y-4 font-serif text-sm text-signal/90 whitespace-pre-wrap">
              {diary.rawContent}
            </article>
          ) : (
            <article
              key={diary.id}
              className="diary-content diary-fade-in mt-6 space-y-4 font-serif text-sm text-signal/90"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}

          {/* 底部引用 */}
          <div className="mt-8 border-t border-quantum/10 pt-4">
            <p className="font-serif text-xs italic text-static/60">
              &mdash; 来自平行宇宙 {diary.date} 的记录
            </p>
          </div>
        </div>
      </div>

      {/* Generating overlay */}
      {isGenerating && <GeneratingOverlay />}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* 操作按钮区 - Mobile optimized */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-quantum/10 px-3 py-3 sm:px-4">
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2 min-h-[44px]",
            "bg-quantum/10 text-quantum border border-quantum/20",
            "text-sm font-medium",
            "transition-all duration-200 hover:bg-quantum/20 hover:border-quantum/30",
            "active:scale-[0.97]",
            "disabled:pointer-events-none disabled:opacity-40",
            "flex-1 sm:flex-none"
          )}
        >
          <RefreshCw
            className={cn("size-4", isGenerating && "animate-spin")}
          />
          <span className="hidden sm:inline">{isGenerating ? "生成中..." : "重新生成"}</span>
          <span className="sm:hidden">{isGenerating ? "生成中" : "重新生成"}</span>
        </button>

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

        <button
          onClick={handleShare}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2 min-h-[44px]",
            "bg-quantum/10 text-quantum border border-quantum/20",
            "text-sm font-medium",
            "transition-all duration-200 hover:bg-quantum/20 hover:border-quantum/30",
            "active:scale-[0.97]",
            "flex-1 sm:flex-none"
          )}
        >
          {shareState === "copied" ? (
            <Check className="size-4 text-emerald-400" />
          ) : (
            <Share2 className="size-4" />
          )}
          <span className="hidden sm:inline">{shareState === "copied" ? "已复制链接" : "分享"}</span>
          <span className="sm:hidden">{shareState === "copied" ? "已复制" : "分享"}</span>
        </button>

        <button
          onClick={onDelete}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2 min-h-[44px]",
            "bg-red-500/10 text-red-400 border border-red-500/20",
            "text-sm font-medium sm:ml-auto",
            "transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/30",
            "active:scale-[0.97]",
            "flex-1 sm:flex-none sm:flex-none"
          )}
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">删除</span>
        </button>
      </div>
    </div>
  );
}
