"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Image, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GalleryCard } from "@/components/gallery/gallery-card";
import {
  loadGalleryItems,
  removeFromGallery,
  clearGallery,
  type GalleryItem,
} from "@/lib/gallery";
import { formatMarkdown } from "@/lib/markdown";
import { DiaryHeader } from "@/components/diary/diary-header";
import {
  WeeklyReportDisplay,
  type WeeklyReport,
} from "@/components/weekly/weekly-report";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

function PreviewView({ item, onBack }: { item: GalleryItem; onBack: () => void }) {
  const router = useRouter();
  const renderRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!renderRef.current) return;
    let cancelled = false;

    async function render() {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled || !renderRef.current) return;
      try {
        const { domToDataUrl } = await import("modern-screenshot");
        const url = await domToDataUrl(renderRef.current, {
          backgroundColor: "#0A0A0F",
          scale: 4,
          quality: 1.0,
          type: "image/jpeg",
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
    return () => { cancelled = true; };
  }, []);

  const handleDelete = useCallback(() => {
    if (!confirm("确定要删除这张画廊内容吗？")) return;
    removeFromGallery(item.id);
    router.push("/gallery");
  }, [item.id, router]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="mb-4 text-static/60">{error}</p>
        <button onClick={onBack} className="text-sm text-quantum hover:underline">
          返回画廊
        </button>
      </div>
    );
  }

  const isDiary = item.type === "diary";
  const weeklyReport = !isDiary ? (JSON.parse(item.content) as WeeklyReport) : null;

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-quantum/10 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-static/60 hover:text-signal transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </button>
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

      <div className="flex-1 overflow-y-auto">
        {isRendering ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="relative">
              <div className="size-20 rounded-full bg-gradient-to-br from-quantum/20 to-plasma/20 blur-xl animate-pulse" />
              <Sparkles className="absolute inset-0 m-auto size-8 text-quantum animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-base font-medium text-signal">正在渲染 4K 高清图片</p>
              <p className="text-xs text-static">像素比 4x · 请稍候...</p>
            </div>
            <div className="flex gap-2">
              <span className="size-1.5 rounded-full bg-quantum animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-plasma animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-1.5 rounded-full bg-nebula-pink animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : dataUrl ? (
          <div className="flex flex-col items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt={item.title} className="w-full rounded-xl shadow-2xl" />
            <p className="text-xs text-static/40">长按图片可保存到相册</p>
          </div>
        ) : null}

        {/* Render target — matches actual page layout and background */}
        <div ref={renderRef} className="min-h-screen bg-void relative overflow-hidden">
          {/* Background gradient circles — matching actual page */}
          <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-quantum/4 rounded-full blur-[150px]" />
          <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-plasma/4 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-nebula-pink/3 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-0">
            {isDiary ? (
              <>
                <DiaryHeader style={item.style ?? "newspaper"} date={item.date} />
                <article
                  className="mt-6 space-y-4 font-serif text-sm text-signal/90"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(item.content) }}
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
                  capturing
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function GalleryClient() {
  const searchParams = useSearchParams();
  const previewId = searchParams.get("id");
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

  // Preview mode
  if (previewId) {
    const previewItem = items.find((i) => i.id === previewId);
    if (previewItem) {
      return (
        <div className="flex min-h-dvh flex-col bg-void">
          <DesktopNav activePage="gallery" />
          <PreviewView
            item={previewItem}
            onBack={() => window.history.back()}
          />
        </div>
      );
    }
    // Item not found, fall through to list view
  }

  // List mode
  return (
    <div className="flex min-h-dvh flex-col bg-void">
      <DesktopNav activePage="gallery" />
      <main className="flex-1 pb-20 md:pb-0">
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
