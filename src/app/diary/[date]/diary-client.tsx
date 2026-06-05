"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Newspaper,
  BookOpen,
  Calendar,
  Clock,
  Star,
  Sparkles,
  PenLine,
  X,
  Trash2,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { EventList } from "@/components/diary/event-list";
import { DiaryContent } from "@/components/diary/diary-content";
import { getNewspapersByDate, type NewspaperData } from "@/lib/newspapers";
import type { Event, DiaryEntry, DiaryStyle, ProcessMode } from "@/lib/types";
import { getDiariesByDate, appendDiary, deleteDiaryById, generateDiary, processContent } from "@/lib/client-api";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

export default function DiaryClient() {
  const params = useParams<{ date?: string }>();
  const searchParams = useSearchParams();
  const date = params.date || new Date().toISOString().slice(0, 10);

  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [processMode, setProcessMode] = useState<ProcessMode>("none");
  const [isSaving, setIsSaving] = useState(false);

  const selectedDiary = diaries.find((d) => d.id === selectedDiaryId) ?? null;

  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    async function fetchDiaries() {
      setLoading(true);
      try {
        const found = await getDiariesByDate(date);
        if (!cancelled) {
          setDiaries(found);
          if (found.length > 0) {
            const targetId = searchParams.get("diaryId");
            const match = targetId ? found.find((d) => d.id === targetId) : null;
            setSelectedDiaryId(match ? match.id : found[found.length - 1].id);
          }
        }
      } catch {
        if (!cancelled) setDiaries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDiaries();

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
  }, [date, searchParams]);

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

  const getDefaultDiaryStyle = (): DiaryStyle => {
    try {
      const settingsStr = localStorage.getItem("parallel-universe-settings");
      const settings = settingsStr ? JSON.parse(settingsStr) : {};
      return (settings.defaultDiaryStyle || "newspaper") as DiaryStyle;
    } catch {
      return "newspaper";
    }
  };

  const handleGenerate = async () => {
    if (isGenerating || events.length === 0) return;

    setIsGenerating(true);
    try {
      const style = getDefaultDiaryStyle();
      const diaryResult = await generateDiary(date, style, events);
      await appendDiary(diaryResult);
      setDiaries((prev) => [...prev, diaryResult]);
      setSelectedDiaryId(diaryResult.id);
    } catch {
      setError("生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (isGenerating || events.length === 0 || !selectedDiaryId) return;

    const oldId = selectedDiaryId;
    setIsGenerating(true);
    try {
      const style = getDefaultDiaryStyle();
      const diaryResult = await generateDiary(date, style, events);
      await appendDiary(diaryResult);
      await deleteDiaryById(oldId);
      setDiaries((prev) => [
        ...prev.filter((d) => d.id !== oldId),
        diaryResult,
      ]);
      setSelectedDiaryId(diaryResult.id);
    } catch {
      setError("重新生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDiaryId) return;
    const idToDelete = selectedDiaryId;
    try {
      await deleteDiaryById(idToDelete);
      setDiaries((prev) => {
        const updated = prev.filter((d) => d.id !== idToDelete);
        return updated;
      });
      setSelectedDiaryId((prev) => {
        const remaining = diaries.filter((d) => d.id !== idToDelete);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      });
    } catch {
      setError("删除失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    }
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

      await appendDiary(newDiary);
      setDiaries((prev) => [...prev, newDiary]);
      setSelectedDiaryId(newDiary.id);
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
      await appendDiary(fallbackDiary);
      setDiaries((prev) => [...prev, fallbackDiary]);
      setSelectedDiaryId(fallbackDiary.id);
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
          <div className="diary-left-panel flex flex-col overflow-y-auto rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm p-5">
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

            {/* Diary list section */}
            <div className="mt-4 border-t border-quantum/8 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono text-static/60 tracking-wide">
                  今日日记 ({diaries.length})
                </h4>
              </div>

              {diaries.length === 0 ? (
                <p className="text-[11px] text-static/40 text-center py-4">
                  {events.length > 0
                    ? "点击上方按钮生成日记"
                    : "暂无日记"}
                </p>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {diaries.map((d) => {
                    const isSelected = d.id === selectedDiaryId;
                    const isAi = d.type === "ai";
                    const time = d.createdAt
                      ? new Date(d.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";
                    const wordCount = d.content?.length ?? 0;
                    const styleLabel =
                      d.style === "chronicle"
                        ? "编年史"
                        : d.style === "prose"
                        ? "散文"
                        : "报纸";
                    const processLabel =
                      d.processMode === "tone"
                        ? "语气转换"
                        : d.processMode === "absurd"
                        ? "荒诞润色"
                        : d.processMode === "both"
                        ? "两者结合"
                        : null;

                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDiaryId(d.id)}
                        className={cn(
                          "w-full text-left rounded-xl p-3 transition-all duration-200 border",
                          isSelected
                            ? "border-l-2 border-l-quantum border-quantum/20 bg-quantum/5"
                            : "border-quantum/8 bg-abyss/30 hover:bg-abyss/50 hover:border-quantum/15"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.5 rounded",
                              isAi
                                ? "bg-quantum/10 text-quantum"
                                : "bg-plasma/10 text-plasma"
                            )}
                          >
                            {isAi ? "AI" : "手写"}
                          </span>
                          <span className="text-[10px] text-static/50">
                            {styleLabel}
                            {processLabel ? ` · ${processLabel}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-static/40">
                            {time}
                          </span>
                          <span className="text-[10px] font-mono text-static/30">
                            {wordCount}字
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
            ) : selectedDiary ? (
              <DiaryContent
                diary={selectedDiary}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                isGenerating={isGenerating}
              />
            ) : (
              /* Empty state: no diary selected */
              <div className="flex h-full flex-col items-center justify-center text-center px-6">
                <div className="size-16 rounded-full bg-gradient-to-br from-quantum/10 to-plasma/10 flex items-center justify-center mb-4">
                  <BookOpen className="size-7 text-static/30" />
                </div>
                <p className="text-sm text-static/60 mb-1">选择左侧日记查看</p>
                <p className="text-xs text-static/40">
                  {events.length > 0
                    ? "或点击上方按钮生成今日日记"
                    : "先添加事件，再生成日记"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
