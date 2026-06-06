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
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium",
            isDiary
              ? "bg-quantum/10 text-quantum"
              : "bg-plasma/10 text-plasma"
          )}
        >
          {isDiary ? <Newspaper className="size-3" /> : <Calendar className="size-3" />}
          {isDiary ? "日记" : "周报"}
        </span>
        {isDiary && item.style && (
          <span className="text-xs text-static/50">
            {styleLabels[item.style] || item.style}
          </span>
        )}
      </div>
      <h3 className="mb-1 text-sm font-medium text-signal">{item.title}</h3>
      <p className="text-xs text-static/50">
        {new Date(item.createdAt).toLocaleDateString("zh-CN")}
      </p>
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
