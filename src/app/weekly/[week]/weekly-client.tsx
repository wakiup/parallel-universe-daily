"use client";

import { useState, useLayoutEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Newspaper,
  Calendar,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import {
  WeeklyReportDisplay,
  type WeeklyReport,
  type WeeklyHighlight,
  type WeeklyDailyEntry,
  type WeeklyStats,
} from "@/components/weekly/weekly-report";
import { getNewspapersByWeek } from "@/lib/newspapers";
import { generateWeeklyReport } from "@/lib/client-api";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

interface WeekInfo {
  week: string;
  year: number;
  weekNum: number;
  startDate: Date;
  endDate: Date;
}

function parseWeekParam(week: string): WeekInfo | null {
  const match = week.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const weekNum = parseInt(match[2], 10);

  if (weekNum < 1 || weekNum > 53) return null;

  const jan4 = new Date(year, 0, 4);
  const dayOfWeekJan4 = jan4.getDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);

  const startDate = new Date(week1Start);
  startDate.setDate(week1Start.getDate() + (weekNum - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return { week, year, weekNum, startDate, endDate };
}

function getCurrentWeek(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfWeekJan4 = jan4.getDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);

  const diff = now.getTime() - week1Start.getTime();
  const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function formatDateShort(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function navigateWeek(week: string, delta: number): string {
  const info = parseWeekParam(week);
  if (!info) return week;

  const newDate = new Date(info.startDate);
  newDate.setDate(newDate.getDate() + delta * 7);

  const jan4 = new Date(newDate.getFullYear(), 0, 4);
  const dayOfWeekJan4 = jan4.getDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);

  const diff = newDate.getTime() - week1Start.getTime();
  const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${newDate.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function EmptyState({ week }: { week: string }) {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <div className="size-16 rounded-full bg-gradient-to-br from-quantum/10 to-plasma/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="size-7 text-static/40" />
        </div>
        <p className="text-lg font-serif text-signal mb-2">无效的周参数</p>
        <p className="text-sm text-static mb-4">
          格式应为 YYYY-WXX，例如 2026-W23
        </p>
        <p className="text-xs text-static/50 font-mono mb-6">
          收到的参数: {week}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-quantum/10 text-quantum border border-quantum/20 text-sm font-medium transition-all hover:bg-quantum/20"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default function WeeklyClient() {
  const params = useParams<{ week?: string }>();
  const weekParam = params.week || getCurrentWeek();

  const weekInfo = parseWeekParam(weekParam);

  function buildReportFromStorage(): WeeklyReport | null {
    if (!weekInfo) return null;

    const startStr = formatDateISO(weekInfo.startDate);
    const endStr = formatDateISO(weekInfo.endDate);
    const weekNewspapers = getNewspapersByWeek(startStr, endStr);

    // Read diary data from localStorage
    let weekDiaries: { date: string }[] = [];
    try {
      const diaryRaw = localStorage.getItem("parallel-universe-diaries");
      if (diaryRaw) {
        weekDiaries = JSON.parse(diaryRaw).filter((d: { date: string }) =>
          d.date >= startStr && d.date <= endStr
        );
      }
    } catch { /* ignore */ }

    const totalDiaries = weekDiaries.length;
    if (weekNewspapers.length === 0 && totalDiaries === 0) return null;

    const DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    const dailyEntries: WeeklyDailyEntry[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekInfo.startDate);
      d.setDate(d.getDate() + i);
      const dateStr = formatDateISO(d);
      const dayPapers = weekNewspapers.filter((n) => n.timestamp.startsWith(dateStr));
      const dayDiaryCount = weekDiaries.filter((dy) => dy.date === dateStr).length;

      if (dayPapers.length > 0) {
        const first = dayPapers[0];
        dailyEntries.push({
          date: dateStr,
          dayLabel: DAY_NAMES[d.getDay()],
          headline: first.headline,
          subheadline: first.subheadline,
          mood: first.mood,
          weather: first.weather,
          color: first.color,
          dimension: first.dimension,
          eventCount: dayPapers.length,
          diaryCount: dayDiaryCount,
        });
      } else if (dayDiaryCount > 0) {
        dailyEntries.push({
          date: dateStr,
          dayLabel: DAY_NAMES[d.getDay()],
          headline: `共 ${dayDiaryCount} 篇日记`,
          subheadline: "今日暂无报纸事件，但留下了文字记录",
          mood: "平静",
          weather: "微风",
          color: "plasma",
          dimension: "7-B",
          eventCount: 0,
          diaryCount: dayDiaryCount,
        });
      }
    }

    const shuffled = [...weekNewspapers].sort(() => Math.random() - 0.5);
    const highlights: WeeklyHighlight[] = shuffled.slice(0, 3).map((p, i) => {
      const d = new Date(p.timestamp.split(" ")[0] + "T00:00:00");
      return {
        id: `hl-${i}`,
        headline: p.headline,
        subheadline: p.subheadline,
        day: DAY_NAMES[d.getDay()],
        mood: p.mood,
        color: p.color,
        dimension: p.dimension,
      };
    });

    const moodCounts: Record<string, number> = {};
    const dimCounts: Record<string, number> = {};
    weekNewspapers.forEach((p) => {
      moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
      dimCounts[p.dimension] = (dimCounts[p.dimension] || 0) + 1;
    });
    const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "平静";
    const mostVisitedDimension = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "7-B";

    const stats: WeeklyStats = {
      totalEvents: weekNewspapers.length,
      totalDiaries,
      mostCommonMood,
      mostVisitedDimension,
      activeDays: dailyEntries.length,
      dimensionsVisited: Object.keys(dimCounts).length,
    };

    // Build weekly summary from local data
    const activeDayEntries = dailyEntries.filter(e => e.eventCount > 0 || e.diaryCount > 0);
    const topDay = activeDayEntries.sort((a, b) => b.eventCount - a.eventCount)[0];
    const weeklySummary = [
      `本周平行宇宙编辑部共记录 ${weekNewspapers.length} 起异常事件，写下 ${totalDiaries} 篇日记。`,
      topDay ? `最活跃的一天是${topDay.dayLabel}（${topDay.date.slice(5)}），当天发生了「${topDay.headline}」。` : "",
      totalDiaries > 0 ? `本周共产出 ${totalDiaries} 篇日记，记录了来自不同维度的观察与思考。` : "",
      `整体氛围偏「${mostCommonMood}」，主要活动维度为 ${mostVisitedDimension}。`,
    ].filter(Boolean).join("");

    return {
      week: weekParam,
      title: "PARALLEL UNIVERSE WEEKLY",
      summary: `本周平行宇宙编辑部共记录 ${weekNewspapers.length} 起异常事件，写下 ${totalDiaries} 篇日记，横跨 ${Object.keys(dimCounts).length} 个维度。最常见的心情是「${mostCommonMood}」，主要活动维度为 ${mostVisitedDimension}。`,
      weeklySummary,
      highlights,
      dailyEntries,
      stats,
      generatedAt: new Date().toISOString(),
    };
  }

  const [report, setReport] = useState<WeeklyReport | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return buildReportFromStorage();
      } catch { /* ignore */ }
    }
    return null;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevWeek = navigateWeek(weekParam, -1);
  const nextWeek = navigateWeek(weekParam, 1);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      gsap.from(".weekly-nav", {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".weekly-week-nav", {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.2,
      });

      gsap.from(".weekly-generate-section", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.4,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleGenerate = async () => {
    if (isGenerating || !weekParam) return;

    setIsGenerating(true);

    try {
      const reportData = await generateWeeklyReport(weekParam);
      const weeklyReport: WeeklyReport = {
        week: weekParam,
        title: (reportData.title as string) || "PARALLEL UNIVERSE WEEKLY",
        summary: (reportData.summary as string) || "",
        weeklySummary: (reportData.weeklySummary as string) || "",
        highlights: Array.isArray(reportData.highlights)
          ? (reportData.highlights as WeeklyHighlight[])
          : [],
        dailyEntries: Array.isArray(reportData.dailyEntries)
          ? (reportData.dailyEntries as WeeklyDailyEntry[])
          : [],
        stats: (reportData.stats as WeeklyStats) || {
          totalEvents: 0,
          totalDiaries: 0,
          mostCommonMood: "未知",
          mostVisitedDimension: "7-B",
          activeDays: 0,
          dimensionsVisited: 0,
        },
        generatedAt: new Date().toISOString(),
      };
      setReport(weeklyReport);
    } catch {
      setError("生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!weekInfo) {
    return <EmptyState week={weekParam} />;
  }

  const dateRange = `${formatDateShort(weekInfo.startDate)} — ${formatDateShort(weekInfo.endDate)}`;

  return (
    <div className="min-h-screen bg-void relative overflow-hidden pb-20 md:pb-0">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-quantum/4 rounded-full blur-[150px] float-animation" />
        <div
          className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-plasma/4 rounded-full blur-[130px] float-animation"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-nebula-pink/3 rounded-full blur-[140px] float-animation"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(167, 139, 250, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      <DesktopNav
        activePage="weekly"
        showBackArrow
        weekLabel={`${weekInfo.year}年第${weekInfo.weekNum}周`}
        navClassName="weekly-nav"
      />

      <main className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="weekly-week-nav flex items-center justify-center gap-4 mb-10">
          <Link
            href={`/weekly/${prevWeek}`}
            className="flex items-center justify-center size-9 rounded-lg border border-quantum/10 text-void-text transition-colors hover:text-quantum hover:border-quantum/25"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-abyss/60 border border-quantum/10">
            <Calendar className="w-3.5 h-3.5 text-quantum/60" />
            <span className="text-xs font-mono text-void-text tracking-wide">
              {dateRange}
            </span>
          </div>
          <Link
            href={`/weekly/${nextWeek}`}
            className="flex items-center justify-center size-9 rounded-lg border border-quantum/10 text-void-text transition-colors hover:text-quantum hover:border-quantum/25"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading || isGenerating ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="relative">
              <div className="size-20 rounded-full bg-gradient-to-br from-quantum/20 to-plasma/20 blur-xl diary-loading-pulse" />
              {isGenerating ? (
                <Loader2 className="absolute inset-0 m-auto size-7 text-quantum animate-spin" />
              ) : (
                <Sparkles className="absolute inset-0 m-auto size-7 text-quantum/60 animate-pulse" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-signal mb-1">
                {isGenerating
                  ? "正在生成周报..."
                  : "加载周报数据..."}
              </p>
              <p className="text-xs text-static">
                {isGenerating
                  ? "编辑部正在整理本周的平行宇宙档案"
                  : "正在从维度 7-B 同步数据"}
              </p>
            </div>
            {isGenerating && (
              <div className="flex gap-2 mt-1">
                <span
                  className="size-1.5 rounded-full bg-quantum animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="size-1.5 rounded-full bg-plasma animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1.5 rounded-full bg-nebula-pink animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </div>
        ) : report ? (
          <>
            <WeeklyReportDisplay
              report={report}
              weekNum={weekInfo.weekNum}
              year={weekInfo.year}
              dateRange={dateRange}
            />

            {error && (
              <div className="weekly-generate-section mt-6 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center max-w-md mx-auto">
                {error}
              </div>
            )}

            <div className="weekly-generate-section flex justify-center mt-10">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-7 py-3",
                  "bg-gradient-to-r from-quantum to-quantum-dim font-medium text-void text-sm",
                  "transition-all duration-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.3)] hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  "disabled:pointer-events-none disabled:opacity-40"
                )}
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    isGenerating && "animate-spin"
                  )}
                />
                {isGenerating ? "重新生成中..." : "重新生成周报"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="size-20 rounded-full bg-gradient-to-br from-quantum/10 to-plasma/10 flex items-center justify-center">
              <Newspaper className="size-8 text-static/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-signal mb-1">
                尚未生成本周周报
              </p>
              <p className="text-xs text-static max-w-xs">
                点击下方按钮，AI 将汇总本周数据，生成杂志风格的周报
              </p>
            </div>
            {error && (
              <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-7 py-3",
                "bg-gradient-to-r from-quantum to-quantum-dim font-medium text-void text-sm",
                "transition-all duration-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.3)] hover:scale-[1.02]",
                "active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <Sparkles className="w-4 h-4" />
              生成周报
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-quantum/8 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-quantum/20 to-plasma/20 flex items-center justify-center">
                <Newspaper className="w-3.5 h-3.5 text-quantum/60" />
              </div>
              <span className="text-xs font-mono text-static/60">
                平行宇宙日报编辑部 · 维度 7-B
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-static/30">
                v0.1.0-alpha
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-static/30">
                  信号
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-3 rounded-sm",
                        i <= 6 ? "bg-quantum/40" : "bg-static/10"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}
