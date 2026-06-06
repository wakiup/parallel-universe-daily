"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
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

  useEffect(() => {
    if (!item || !renderRef.current) return;

    let cancelled = false;

    async function render() {
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
        <Link href="/gallery" className="text-sm text-quantum hover:underline">
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
  const weeklyReport = !isDiary ? (JSON.parse(item.content) as WeeklyReport) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-void">
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
              <p className="text-xs text-static">像素比 4x · 请稍候...</p>
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
            <img src={dataUrl} alt={item.title} className="w-full max-w-2xl rounded-xl shadow-2xl" />
            <p className="text-xs text-static/40">长按图片可保存到相册</p>
          </div>
        ) : null}

        {/* Hidden render target */}
        <div ref={renderRef} className="fixed left-[-9999px] top-0" style={{ width: "800px" }}>
          <div className="bg-void rounded-xl p-6">
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
