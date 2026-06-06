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
      <DesktopNav activePage={"gallery" as any} />
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
