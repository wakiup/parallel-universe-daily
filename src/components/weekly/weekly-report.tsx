// src/components/weekly/weekly-report.tsx

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Newspaper,
  Sparkles,
  Star,
  Zap,
  Globe,
  Calendar,
  Cloud,
  BarChart3,
  Quote,
  BookOpen,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import gsap from "gsap";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types (mirrors the API response types)
// ---------------------------------------------------------------------------

export interface WeeklyHighlight {
  id: string;
  headline: string;
  subheadline: string;
  day: string;
  mood: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
  newspaperId?: string;
  diaryId?: string;
}

export interface WeeklyDailyEntry {
  date: string;
  dayLabel: string;
  headline: string;
  subheadline: string;
  mood: string;
  weather: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
  eventCount: number;
  diaryCount: number;
}

export interface WeeklyStats {
  totalEvents: number;
  totalDiaries: number;
  mostCommonMood: string;
  mostVisitedDimension: string;
  activeDays: number;
  dimensionsVisited: number;
}

export interface WeeklyReport {
  week: string;
  title: string;
  summary: string;
  weeklySummary: string;
  highlights: WeeklyHighlight[];
  dailyEntries: WeeklyDailyEntry[];
  stats: WeeklyStats;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Color mapping
// ---------------------------------------------------------------------------

const COLOR_MAP = {
  quantum: {
    border: "border-quantum/20",
    hoverBorder: "hover:border-quantum/35",
    glow: "hover:shadow-[0_8px_40px_-12px_rgba(167,139,250,0.2)]",
    badge: "bg-quantum/10 text-quantum border-quantum/20",
    dot: "bg-quantum",
    gradient: "from-quantum/15 to-transparent",
    text: "text-quantum",
    ring: "ring-quantum/20",
    statBorder: "border-quantum/12",
  },
  plasma: {
    border: "border-plasma/20",
    hoverBorder: "hover:border-plasma/35",
    glow: "hover:shadow-[0_8px_40px_-12px_rgba(34,211,238,0.2)]",
    badge: "bg-plasma/10 text-plasma border-plasma/20",
    dot: "bg-plasma",
    gradient: "from-plasma/15 to-transparent",
    text: "text-plasma",
    ring: "ring-plasma/20",
    statBorder: "border-plasma/12",
  },
  pink: {
    border: "border-nebula-pink/20",
    hoverBorder: "hover:border-nebula-pink/35",
    glow: "hover:shadow-[0_8px_40px_-12px_rgba(244,114,182,0.2)]",
    badge: "bg-nebula-pink/10 text-nebula-pink border-nebula-pink/20",
    dot: "bg-nebula-pink",
    gradient: "from-nebula-pink/15 to-transparent",
    text: "text-nebula-pink",
    ring: "ring-nebula-pink/20",
    statBorder: "border-nebula-pink/12",
  },
} as const;

// ---------------------------------------------------------------------------
// CoverSection - Magazine masthead
// ---------------------------------------------------------------------------

function CoverSection({
  report,
  weekNum,
  year,
  dateRange,
}: {
  report: WeeklyReport;
  weekNum: number;
  year: number;
  dateRange: string;
}) {
  return (
    <section className="weekly-cover relative text-center mb-16 overflow-hidden rounded-3xl border-2 border-quantum/30" style={{ background: '#16162a' }}>
      {/* Top decorative gradient bar */}
      <div className="h-px bg-gradient-to-r from-quantum/30 via-plasma/30 to-nebula-pink/30" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-quantum/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative px-6 sm:px-12 py-12 sm:py-16">
        {/* Masthead */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-quantum/15 border border-quantum/30 mb-6">
            <Newspaper className="w-3.5 h-3.5 text-quantum" />
            <span className="text-[10px] font-mono text-quantum tracking-wider uppercase">
              Magazine Edition
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.05]">
            <span className="block text-white">PARALLEL UNIVERSE</span>
            <span className="block gradient-text mt-1">WEEKLY</span>
          </h1>
        </div>

        {/* Week info */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-abyss/80 border border-quantum/20">
            <Calendar className="w-3 h-3 text-quantum" />
            <span className="text-xs font-mono text-signal">
              {year}年第{weekNum}周
            </span>
          </div>
          <div className="w-px h-4 bg-quantum/25" />
          <span className="text-xs font-mono text-void-text">{dateRange}</span>
          <div className="w-px h-4 bg-quantum/25" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-abyss/80 border border-plasma/20">
            <Globe className="w-3 h-3 text-plasma" />
            <span className="text-xs font-mono text-signal">维度 7-B</span>
          </div>
        </div>

        {/* Editor's note */}
        <div className="max-w-2xl mx-auto">
          <div className="relative border border-quantum/15 rounded-2xl bg-void/60 p-6 sm:p-8">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-abyss border border-quantum/30">
              <span className="text-[10px] font-mono text-quantum tracking-wider">
                EDITOR&apos;S NOTE
              </span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed font-serif italic" style={{ color: 'rgba(226, 232, 240, 0.9)' }}>
              &ldquo;{report.summary}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Bottom decorative gradient bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-quantum/20 to-transparent" />
    </section>
  );
}

// ---------------------------------------------------------------------------
// WeeklySummary - AI-generated weekly summary
// ---------------------------------------------------------------------------

function WeeklySummary({ summary }: { summary: string }) {
  if (!summary) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-quantum/20 to-nebula-pink/20 border border-quantum/15">
          <FileText className="w-5 h-5 text-quantum" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-signal">
            本周总结
          </h2>
          <p className="text-xs font-mono text-static/60 mt-0.5">
            WEEKLY SUMMARY
          </p>
        </div>
      </div>

      <div className="relative border border-quantum/15 rounded-2xl bg-abyss/60 backdrop-blur-sm overflow-hidden">
        <div className="h-px bg-gradient-to-r from-quantum/20 via-plasma/20 to-nebula-pink/20" />
        <div className="px-6 sm:px-10 py-8 sm:py-10">
          <p className="text-sm sm:text-base leading-relaxed font-serif text-void-text/80">
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// HighlightsSection - Top 3 events
// ---------------------------------------------------------------------------

function HighlightsSection({ highlights, week }: { highlights: WeeklyHighlight[]; week: string }) {
  const dayToDate = (dayName: string): string => {
    const DAY_MAP: Record<string, number> = { "周一": 0, "周二": 1, "周三": 2, "周四": 3, "周五": 4, "周六": 5, "周日": 6 };
    const dayIndex = DAY_MAP[dayName];
    if (dayIndex === undefined) return "";
    const match = week.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return "";
    const year = parseInt(match[1], 10);
    const weekNum = parseInt(match[2], 10);
    const jan4 = new Date(year, 0, 4);
    const dayOfWeekJan4 = jan4.getDay() || 7;
    const week1Start = new Date(jan4);
    week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);
    const startDate = new Date(week1Start);
    startDate.setDate(week1Start.getDate() + (weekNum - 1) * 7);
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIndex);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = sectionRef.current.querySelectorAll(".highlight-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15 }
    );
  }, [highlights]);

  return (
    <section ref={sectionRef} className="mb-16">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-quantum/20 to-plasma/20 border border-quantum/15">
          <Star className="w-5 h-5 text-quantum" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-signal">
            本周亮点
          </h2>
          <p className="text-xs font-mono text-static/60 mt-0.5">
            TOP {highlights.length} HIGHLIGHTS
          </p>
        </div>
      </div>

      {/* Highlights grid - asymmetric layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {highlights.map((hl, index) => {
          const colors = COLOR_MAP[hl.color];
          const isLarge = index === 0;

          return (
            <Link
              key={hl.id}
              href={hl.newspaperId ? `/newspaper/${hl.newspaperId}` : hl.diaryId ? `/diary/${dayToDate(hl.day)}?diaryId=${hl.diaryId}` : `/diary/${dayToDate(hl.day)}`}
              className={cn(
                "highlight-card group relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer block",
                colors.border,
                colors.hoverBorder,
                colors.glow,
                isLarge && "md:col-span-2"
              )}
            >
              {/* Top accent line */}
              <div
                className={cn(
                  "h-px bg-gradient-to-r",
                  colors.gradient
                )}
              />

              <div className={cn("bg-abyss/70", isLarge ? "p-8 sm:p-10" : "p-6")}>
                {/* Rank badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center justify-center size-8 rounded-lg text-sm font-bold font-mono",
                        colors.badge,
                        "border"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-mono border",
                        colors.badge
                      )}
                    >
                      {hl.mood}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-static/50">
                    {hl.day}
                  </span>
                </div>

                {/* Headline */}
                <h3
                  className={cn(
                    "font-serif font-bold text-signal leading-snug mb-3",
                    isLarge
                      ? "text-xl sm:text-2xl"
                      : "text-base sm:text-lg"
                  )}
                >
                  {hl.headline}
                </h3>

                {/* Subheadline */}
                <p
                  className={cn(
                    "text-void-text/70 leading-relaxed",
                    isLarge ? "text-sm sm:text-base mb-6" : "text-sm mb-4"
                  )}
                >
                  {hl.subheadline}
                </p>

                {/* Footer meta */}
                <div className="flex items-center gap-3 pt-4 border-t border-quantum/8">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-static/40" />
                    <span className="text-[11px] font-mono text-static/50">
                      维度 {hl.dimension}
                    </span>
                  </div>
                  {isLarge && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-static/40" />
                      <span className="text-[11px] font-mono text-static/50">
                        本周最佳
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// DayGrid - Day-by-day magazine cards
// ---------------------------------------------------------------------------

function DayGrid({ entries }: { entries: WeeklyDailyEntry[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!gridRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = gridRef.current.querySelectorAll(".day-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }
    );
  }, [entries]);

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-plasma/20 to-nebula-pink/20 border border-plasma/15">
          <Calendar className="w-5 h-5 text-plasma" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-signal">
            每日速览
          </h2>
          <p className="text-xs font-mono text-static/60 mt-0.5">
            DAY-BY-DAY BREAKDOWN
          </p>
        </div>
      </div>

      {/* Day grid - magazine-style asymmetric */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry, index) => {
          const colors = COLOR_MAP[entry.color];
          // First card spans 2 columns on large screens for visual variety
          const isFirstLarge = index === 0;

          return (
            <Link
              key={entry.date}
              href={`/diary/${entry.date}`}
              className={cn(
                "day-card group relative rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer block",
                colors.border,
                colors.hoverBorder,
                colors.glow,
                isFirstLarge && "sm:col-span-2 lg:col-span-2"
              )}
            >
              {/* Top accent */}
              <div className={cn("h-px bg-gradient-to-r", colors.gradient)} />

              <div className="bg-abyss/60 p-5 sm:p-6">
                {/* Day header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full pulse-glow",
                        colors.dot
                      )}
                    />
                    <div>
                      <span className="text-sm font-serif font-bold text-signal">
                        {entry.dayLabel}
                      </span>
                      <span className="text-xs text-static/50 ml-2 font-mono">
                        {entry.date.slice(5)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono border",
                      colors.badge
                    )}
                  >
                    {entry.mood}
                  </span>
                </div>

                {/* Headline */}
                <h4 className="text-sm sm:text-base font-serif font-semibold text-signal leading-snug mb-2 line-clamp-2 group-hover:text-quantum transition-colors duration-300">
                  {entry.headline}
                </h4>

                {/* Subheadline */}
                <p className="text-xs sm:text-sm text-void-text/60 leading-relaxed line-clamp-2 mb-4">
                  {entry.subheadline}
                </p>

                {/* Footer meta */}
                <div className="flex items-center justify-between pt-3 border-t border-quantum/8">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Cloud className="w-3 h-3 text-static/40" />
                      <span className="text-[10px] font-mono text-static/50">
                        {entry.weather}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.diaryCount > 0 && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-static/40" />
                        <span className="text-[10px] font-mono text-static/50">
                          {entry.diaryCount}篇日记
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-static/40" />
                      <span className="text-[10px] font-mono text-static/50">
                        {entry.dimension}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// StatsSection - Weekly statistics
// ---------------------------------------------------------------------------

function StatsSection({ stats }: { stats: WeeklyStats }) {
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!statsRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = statsRef.current.querySelectorAll(".stat-item");
    gsap.fromTo(items,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)", stagger: 0.1 }
    );
  }, [stats]);

  const statCards = [
    {
      label: "总事件数",
      value: stats.totalEvents,
      icon: <Zap className="w-5 h-5" />,
      color: "quantum" as const,
      sub: "across 7 days",
      tooltip: "本周报纸记录的所有平行宇宙异常事件",
    },
    {
      label: "日记总数",
      value: stats.totalDiaries,
      icon: <BookOpen className="w-5 h-5" />,
      color: "plasma" as const,
      sub: "diaries written",
      tooltip: "本周用户撰写的日记篇数",
    },
    {
      label: "最常见心情",
      value: stats.mostCommonMood,
      icon: <Sparkles className="w-5 h-5" />,
      color: "pink" as const,
      sub: "dominant mood",
      tooltip: "本周出现次数最多的情绪状态",
    },
    {
      label: "最常访问维度",
      value: stats.mostVisitedDimension,
      icon: <Globe className="w-5 h-5" />,
      color: "pink" as const,
      sub: "primary dimension",
      tooltip: "本周涉及最多的平行宇宙维度编号",
    },
    {
      label: "活跃天数",
      value: stats.activeDays,
      icon: <Calendar className="w-5 h-5" />,
      color: "quantum" as const,
      sub: "of 7 days",
      tooltip: "本周有事件或日记记录的天数",
    },
  ];

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-nebula-pink/20 to-quantum/20 border border-nebula-pink/15">
          <BarChart3 className="w-5 h-5 text-nebula-pink" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-signal">
            周度统计
          </h2>
          <p className="text-xs font-mono text-static/60 mt-0.5">
            WEEKLY METRICS
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {statCards.map((stat, index) => {
          const colors = COLOR_MAP[stat.color];
          return (
            <div
              key={index}
              className={cn(
                "stat-item group relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
                colors.statBorder,
                colors.hoverBorder,
                colors.glow
              )}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-abyss/95 border border-quantum/20 rounded-lg px-3 py-2 text-xs text-static/80 shadow-xl whitespace-nowrap">
                  {stat.tooltip}
                </div>
              </div>
              <div className={cn("h-px bg-gradient-to-r", colors.gradient)} />
              <div className="bg-abyss/60 p-5 sm:p-6 text-center">
                <div
                  className={cn(
                    "inline-flex items-center justify-center size-10 rounded-xl mb-3",
                    colors.badge,
                    "border"
                  )}
                >
                  <span className={colors.text}>{stat.icon}</span>
                </div>
                <div
                  className={cn(
                    "text-2xl sm:text-3xl font-serif font-bold mb-1",
                    colors.text
                  )}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-signal mb-0.5">
                  {stat.label}
                </div>
                <div className="text-[10px] font-mono text-static/40 uppercase tracking-wider">
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FooterQuote
// ---------------------------------------------------------------------------

function FooterQuote() {
  return (
    <section className="mb-8">
      <div className="relative rounded-2xl border border-quantum/15 bg-abyss/60 backdrop-blur-sm overflow-hidden">
        <div className="h-px bg-gradient-to-r from-quantum/20 via-plasma/20 to-nebula-pink/20" />
        <div className="px-6 sm:px-10 py-8 sm:py-10 text-center">
          <Quote className="w-8 h-8 text-quantum/20 mx-auto mb-4" />
          <blockquote className="text-base sm:text-lg font-serif italic text-void-text/70 leading-relaxed max-w-xl mx-auto">
            &ldquo;每一份日记都是一个平行宇宙的缩影，而我们正在书写历史。&rdquo;
          </blockquote>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-8 h-px bg-quantum/20" />
            <span className="text-[11px] font-mono text-static/50">
              平行宇宙日报编辑部
            </span>
            <div className="w-8 h-px bg-quantum/20" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WeeklyReportDisplay({
  report,
  weekNum,
  year,
  dateRange,
}: {
  report: WeeklyReport;
  weekNum: number;
  year: number;
  dateRange: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportRef.current!, {
        backgroundColor: "#0a0a1a",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `parallel-universe-weekly-${report.week}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      setExportError("导出失败，请重试");
      setTimeout(() => setExportError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(".weekly-cover",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  return (
    <div ref={containerRef} className="space-y-0 relative">
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={cn(
          "absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg px-3 py-2",
          "border border-quantum/20 bg-abyss/80 backdrop-blur-sm text-xs font-medium text-void-text",
          "transition-all duration-200 hover:border-quantum/40 hover:text-quantum",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {isExporting ? "导出中..." : "导出图片"}
      </button>
      {exportError && (
        <div className="absolute top-16 right-4 z-20 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {exportError}
        </div>
      )}

      <div ref={exportRef}>
        <CoverSection
          report={report}
          weekNum={weekNum}
          year={year}
          dateRange={dateRange}
        />
        <WeeklySummary summary={report.weeklySummary} />
        <HighlightsSection highlights={report.highlights} week={report.week} />
      </div>
      <DayGrid entries={report.dailyEntries} />
      <StatsSection stats={report.stats} />
      <FooterQuote />
    </div>
  );
}
