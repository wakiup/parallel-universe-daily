"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import {
  Newspaper,
  BookOpen,
  Calendar,
  Clock,
  Star,
  Sparkles,
  PenLine,
  X,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { EventList } from "@/components/diary/event-list";
import { DiaryContent } from "@/components/diary/diary-content";
import { getNewspapersByDate, type NewspaperData } from "@/lib/newspapers";
import type { Event, DiaryEntry, DiaryStyle, ProcessMode } from "@/lib/types";
import { getDiaryByDate, saveDiary, generateDiary, processContent } from "@/lib/client-api";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

export default function DiaryClient() {
  const params = useParams<{ date?: string[] }>();
  const date = Array.isArray(params.date) ? params.date[0] : params.date || new Date().toISOString().slice(0, 10);

  const [diary, setDiary] = useState<DiaryEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [processMode, setProcessMode] = useState<ProcessMode>("none");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    async function fetchDiary() {
      setLoading(true);
      try {
        const found = await getDiaryByDate(date);
        if (!cancelled) {
          setDiary(found);
        }
      } catch {
        if (!cancelled) setDiary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDiary();

    const dayNewspapers = getNewspapersByDate(date);
    const asEvents: Event[] = dayNewspapers.map((n) => ({
      id: n.id,
      headline: n.headline,
      subheadline: n.subheadline,
      content: n.content,
      timestamp: n.timestamp,
      weather: n.weather,
      mood: n.mood,
      color: n.color,
      dimension: n.dimension,
    }));
    setEvents(asEvents);

    return () => {
      cancelled = true;
    };
  }, [date]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      gsap.from(".diary-left-panel", {
        opacity: 0,
        x: -60,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.from(".diary-right-panel", {
        opacity: 0,
        x: 60,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.25,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleGenerate = async () => {
    if (isGenerating || events.length === 0) return;

    const settingsStr = localStorage.getItem("parallel-universe-settings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    const style = (settings.defaultDiaryStyle || "newspaper") as DiaryStyle;

    setIsGenerating(true);
    try {
      const diaryResult = await generateDiary(date, style, events);
      setDiary(diaryResult);
    } catch {
      setError("生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleWriteManual = () => {
    setIsManualMode(true);
    setManualContent("");
    setProcessMode("none");
  };

  const handleCancelManual = () => {
    setIsManualMode(false);
    setManualContent("");
    setProcessMode("none");
  };

  const handleSaveManual = async () => {
    if (!manualContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const finalContent = await processContent(manualContent, processMode, "newspaper");

      const newDiary: DiaryEntry = {
        id: crypto.randomUUID(),
        date: date!,
        type: "handwritten",
        content: finalContent,
        style: "newspaper",
        processMode,
        rawContent: manualContent,
        eventIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDiary(newDiary);
      setDiary(newDiary);
      setIsManualMode(false);
    } catch {
      const fallbackDiary: DiaryEntry = {
        id: crypto.randomUUID(),
        date: date!,
        type: "handwritten",
        content: manualContent,
        style: "newspaper",
        processMode: "none",
        rawContent: manualContent,
        eventIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveDiary(fallbackDiary);
      setDiary(fallbackDiary);
      setIsManualMode(false);
      setError("AI 加工失败，已保存原始内容");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const displayDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "";

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
      </div>

      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      <DesktopNav activePage="diary" showBackArrow date={displayDate} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-7rem)]">
          <div className="diary-left-panel flex flex-col overflow-hidden rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm p-5">
            <EventList
              events={events}
              onGenerate={handleGenerate}
              onWriteManual={handleWriteManual}
              isGenerating={isGenerating}
            />
            {error && (
              <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                {error}
              </div>
            )}
          </div>

          <div className="diary-right-panel relative overflow-hidden rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Sparkles className="size-8 text-quantum/40 animate-pulse" />
                  <p className="text-sm text-static">加载中...</p>
                </div>
              </div>
            ) : isManualMode ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-quantum/10 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <PenLine className="size-4 text-quantum" />
                    <h3 className="text-sm font-semibold text-signal">
                      手写日记
                    </h3>
                  </div>
                  <button
                    onClick={handleCancelManual}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-void-text transition-colors hover:text-signal hover:bg-abyss/60"
                  >
                    <X className="size-3.5" />
                    取消
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <textarea
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="今天想记录什么..."
                    className={cn(
                      "w-full min-h-[14rem] resize-none rounded-xl",
                      "border border-quantum/10 bg-void/60 px-4 py-3",
                      "text-sm leading-relaxed text-signal placeholder:text-static/50",
                      "outline-none transition-colors",
                      "focus:border-quantum/30 focus:ring-1 focus:ring-quantum/20"
                    )}
                  />

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-medium text-void-text">
                      AI 加工方式：
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          { mode: "none" as const, label: "不加工" },
                          { mode: "tone" as const, label: "语气转换" },
                          { mode: "absurd" as const, label: "荒诞润色" },
                          { mode: "both" as const, label: "两者结合" },
                        ] as const
                      ).map(({ mode, label }) => (
                        <label
                          key={mode}
                          onClick={() => setProcessMode(mode)}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                            "border text-xs font-medium transition-all duration-200",
                            processMode === mode
                              ? "border-quantum/30 bg-quantum/10 text-quantum"
                              : "border-quantum/10 bg-void/40 text-void-text hover:border-quantum/20 hover:text-signal"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block size-3 rounded-full border-2",
                              processMode === mode
                                ? "border-quantum bg-quantum"
                                : "border-static/40 bg-transparent"
                            )}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-quantum/10 px-5 py-3">
                  <span className="font-mono text-xs text-static">
                    字数：{manualContent.length}
                  </span>
                  <button
                    onClick={handleSaveManual}
                    disabled={!manualContent.trim() || isSaving}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-5 py-2.5",
                      "bg-gradient-to-r from-quantum to-quantum-dim font-medium text-void text-sm",
                      "transition-all duration-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.3)]",
                      "active:scale-[0.98]",
                      "disabled:pointer-events-none disabled:opacity-40"
                    )}
                  >
                    <Sparkles className="size-4" />
                    {isSaving ? "保存中..." : "保存日记"}
                  </button>
                </div>
              </div>
            ) : (
              <DiaryContent
                diary={diary}
                onRegenerate={handleRegenerate}
                isGenerating={isGenerating}
              />
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
