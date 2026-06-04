"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { DiaryEntry, DiaryStyle } from "@/lib/types";

// Style color mapping
const STYLE_CONFIG: Record<
  DiaryStyle,
  { color: string; dotColor: string; borderHover: string; label: string }
> = {
  newspaper: {
    color: "text-quantum",
    dotColor: "bg-quantum",
    borderHover: "hover:border-quantum/30",
    label: "量子日报",
  },
  prose: {
    color: "text-plasma",
    dotColor: "bg-plasma",
    borderHover: "hover:border-plasma/30",
    label: "深渊散文",
  },
  chronicle: {
    color: "text-nebula-pink",
    dotColor: "bg-nebula-pink",
    borderHover: "hover:border-nebula-pink/30",
    label: "荒诞编年史",
  },
};

const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

interface TimelineMonth {
  year: number;
  month: number;
  label: string;
  entries: (DiaryEntry | null)[]; // null = empty day placeholder
  dates: string[];
}

function buildTimelineMonths(
  entries: DiaryEntry[],
  year: number,
  month: number
): TimelineMonth[] {
  // Build a single month's timeline
  const daysInMonth = new Date(year, month, 0).getDate();
  const diaryMap = new Map<string, DiaryEntry>();
  for (const e of entries) {
    diaryMap.set(e.date, e);
  }

  const dates: string[] = [];
  const items: (DiaryEntry | null)[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dates.push(dateStr);
    items.push(diaryMap.get(dateStr) ?? null);
  }

  return [
    {
      year,
      month,
      label: `${year}年${month}月`,
      entries: items,
      dates,
    },
  ];
}

function formatDate(dateStr: string): { day: string; weekday: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: String(d.getDate()).padStart(2, "0"),
    weekday: WEEKDAY_NAMES[d.getDay()],
  };
}

function getStyleConfig(style?: DiaryStyle) {
  return STYLE_CONFIG[style ?? "newspaper"];
}

function getExcerpt(content: string, maxLen = 20): string {
  const clean = content.replace(/[#*_\n\r]/g, " ").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + "..." : clean;
}

// --- Sub-components ---

function TimelineCard({ entry, dateStr }: { entry: DiaryEntry; dateStr: string }) {
  const { day, weekday } = formatDate(dateStr);
  const style = getStyleConfig(entry.style);

  // Extract a title from content: first non-empty line
  const firstLine =
    entry.content
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? "";
  const title = getExcerpt(firstLine);

  // Count pseudo "events" from content
  const eventCount = Math.max(
    1,
    entry.content.split("\n").filter((l) => l.trim().length > 0).length
  );

  return (
    <div className="timeline-card flex gap-4 group">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${style.dotColor} border-2 border-void transition-transform duration-300 group-hover:scale-150 group-hover:shadow-[0_0_12px_rgba(167,139,250,0.4)]`}
        />
        <div className="w-px flex-1 bg-quantum/20" />
      </div>

      {/* Date label */}
      <div className="w-16 shrink-0 text-right pt-0.5">
        <div className="text-sm font-mono text-signal leading-none">{day}</div>
        <div className="text-xs text-static mt-1">{weekday}</div>
      </div>

      {/* Diary card */}
      <Link
        href={`/diary/${dateStr}`}
        className={`flex-1 p-4 bg-abyss/50 border border-quantum/10 rounded-xl ${style.borderHover} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-quantum/5`}
      >
        <h3 className="text-sm font-medium text-signal line-clamp-1 group-hover:text-quantum transition-colors duration-300">
          {title || "未命名日记"}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs ${style.color}`}>{style.label}</span>
          <span className="text-static text-[10px]">·</span>
          <span className="text-xs text-static">{eventCount}篇事件</span>
        </div>
      </Link>
    </div>
  );
}

function EmptyDayCard({ dateStr }: { dateStr: string }) {
  const { day, weekday } = formatDate(dateStr);

  return (
    <div className="flex gap-4 opacity-50">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-stardust border-2 border-void" />
        <div className="w-px flex-1 bg-quantum/10" />
      </div>

      {/* Date label */}
      <div className="w-16 shrink-0 text-right pt-0.5">
        <div className="text-sm font-mono text-static/60 leading-none">{day}</div>
        <div className="text-xs text-static/40 mt-1">{weekday}</div>
      </div>

      {/* Empty placeholder */}
      <div className="flex-1 p-4 bg-abyss/20 border border-dashed border-quantum/5 rounded-xl">
        <p className="text-xs text-static/30">暂无记录</p>
      </div>
    </div>
  );
}

function MonthSection({ monthData }: { monthData: TimelineMonth }) {
  return (
    <div className="month-section mb-12">
      {/* Month title */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-serif font-bold gradient-text">{monthData.label}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-quantum/20 to-transparent" />
        <span className="text-xs font-mono text-static/40">
          {monthData.entries.filter((e) => e !== null).length} 篇记录
        </span>
      </div>

      {/* Timeline entries */}
      <div className="space-y-2">
        {monthData.entries.map((entry, idx) => {
          const dateStr = monthData.dates[idx];
          // Only show days up to and including today for current month
          const today = new Date().toISOString().split("T")[0];
          if (dateStr > today) return null;

          return entry ? (
            <TimelineCard key={dateStr} entry={entry} dateStr={dateStr} />
          ) : (
            <EmptyDayCard key={dateStr} dateStr={dateStr} />
          );
        })}
      </div>
    </div>
  );
}

// --- Main Timeline Component ---

export interface TimelineProps {
  entries: DiaryEntry[];
  year: number;
  month: number;
}

export default function Timeline({ entries, year, month }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const months = buildTimelineMonths(entries, year, month);

  // GSAP entrance animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".month-section", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
      });

      gsap.from(".timeline-card, .opacity-50", {
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.04,
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [year, month, entries]);

  const hasAnyEntry = entries.length > 0;

  return (
    <div ref={containerRef}>
      {hasAnyEntry ? (
        months.map((m) => <MonthSection key={`${m.year}-${m.month}`} monthData={m} />)
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-full bg-abyss/60 border border-quantum/10 flex items-center justify-center mb-6">
            <span className="text-2xl opacity-50">&#x1F4DC;</span>
          </div>
          <p className="text-void-text/60 text-sm font-mono">暂无记录</p>
          <p className="text-static/40 text-xs mt-2">这个月的平行宇宙还是一片空白</p>
        </div>
      )}
    </div>
  );
}
