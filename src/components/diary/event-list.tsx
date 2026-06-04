"use client";

import { Clock, Cloud, Sparkles, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/types";

interface EventListProps {
  events: Event[];
  onGenerate: () => void;
  onWriteManual: () => void;
  isGenerating: boolean;
}

const colorMap: Record<
  Event["color"],
  { badge: string; glow: string; dot: string }
> = {
  quantum: {
    badge: "bg-quantum/15 text-quantum border border-quantum/30",
    glow: "shadow-[0_0_12px_rgba(167,139,250,0.15)]",
    dot: "bg-quantum",
  },
  plasma: {
    badge: "bg-plasma/15 text-plasma border border-plasma/30",
    glow: "shadow-[0_0_12px_rgba(34,211,238,0.15)]",
    dot: "bg-plasma",
  },
  pink: {
    badge: "bg-nebula-pink/15 text-nebula-pink border border-nebula-pink/30",
    glow: "shadow-[0_0_12px_rgba(244,114,182,0.15)]",
    dot: "bg-nebula-pink",
  },
};

function EventCard({ event }: { event: Event }) {
  const colors = colorMap[event.color];

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-quantum/10 bg-abyss/80 p-4",
        "transition-all duration-300 hover:border-quantum/30 hover:-translate-y-0.5",
        "backdrop-blur-sm",
        colors.glow,
        "hover:shadow-[0_0_28px_rgba(167,139,250,0.25)]"
      )}
    >
      {/* Top row: timestamp + dimension */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-void-text">
          <Clock className="size-3.5 text-static/60" />
          <span className="font-mono text-xs tracking-wider text-void-text">{event.timestamp}</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-stardust/50 px-1.5 py-0.5 font-mono text-[10px] text-static/80">
          {event.dimension}
        </span>
      </div>

      {/* Headline */}
      <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-signal">
        {event.headline}
      </h3>

      {/* Tags row */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            colors.badge
          )}
        >
          <span className={cn("size-1.5 rounded-full", colors.dot)} />
          {event.mood}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-stardust/60 px-2 py-0.5 text-[11px] text-void-text">
          <Cloud className="size-3" />
          {event.weather}
        </span>
      </div>
    </div>
  );
}

export function EventList({
  events,
  onGenerate,
  onWriteManual,
  isGenerating,
}: EventListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-heading text-lg font-semibold text-signal">
          今日事件
        </h2>
        <span className="font-mono text-xs text-static">
          {events.length} events
        </span>
      </div>

      {/* Event list */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="mb-3 size-8 text-static/50" />
            <p className="text-sm text-static">今日尚无事件记录</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-3 border-t border-quantum/10 pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating || events.length === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
            "bg-gradient-to-r from-quantum to-quantum-dim font-medium text-void",
            "transition-all duration-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.3)]",
            "active:scale-[0.98]",
            "disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          <Sparkles className="size-4" />
          {isGenerating ? "生成中..." : "生成今日日记"}
        </button>

        <button
          onClick={onWriteManual}
          className="flex w-full items-center justify-center gap-1.5 text-sm text-void-text transition-colors hover:text-quantum"
        >
          <PenLine className="size-3.5" />
          或 手动写日记
        </button>
      </div>
    </div>
  );
}
