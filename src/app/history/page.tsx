"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  Newspaper,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Scroll,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import gsap from "gsap";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";
import type { DiaryEntry } from "@/lib/types";
import { getDiariesByMonth } from "@/lib/client-api";
import Timeline from "@/components/history/timeline";

// ---- Main Page ----

export default function HistoryPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load diaries from localStorage
  useEffect(() => {
    setLoading(true);
    setError(null);
    getDiariesByMonth(currentYear, currentMonth).then((diaries) => {
      setEntries(diaries);
      setLoading(false);
    });
  }, [currentYear, currentMonth]);

  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".history-hero-title", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(".history-hero-sub", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
      });
      gsap.from(".month-nav", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.5,
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;

  const currentDate = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div ref={pageRef} className="min-h-screen bg-void relative overflow-hidden pb-20 md:pb-0">
      {/* Ambient background */}
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
            backgroundImage: `linear-gradient(rgba(167,139,250,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      {/* Navigation */}
      <DesktopNav activePage="history" date={currentDate} />

      {/* Main */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="pt-16 pb-10 sm:pt-20 sm:pb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-10 bg-gradient-to-b from-quantum via-plasma to-nebula-pink rounded-full" />
              <div>
                <h2 className="history-hero-title text-4xl sm:text-5xl font-serif font-bold text-signal leading-tight">
                  <span className="block">平行宇宙</span>
                  <span className="block gradient-text">编年史</span>
                </h2>
              </div>
            </div>
            <p className="history-hero-sub text-lg text-void-text/70 ml-5 mt-4 max-w-lg leading-relaxed">
              你的平行宇宙历史档案——按时间线浏览所有日报和日记
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-quantum/20 to-transparent" />
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-void">
            <Scroll className="w-4 h-4 text-quantum/30" />
          </div>
        </div>

        {/* Month navigation */}
        <div className="month-nav flex items-center justify-between mb-10 px-2">
          <button
            onClick={prevMonth}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-abyss/50 border border-quantum/10 hover:border-quantum/25 transition-all duration-300 hover:bg-abyss/70"
          >
            <ChevronLeft className="w-4 h-4 text-quantum/60 group-hover:text-quantum transition-colors" />
            <span className="text-sm text-void-text group-hover:text-signal transition-colors">
              上月
            </span>
          </button>

          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-quantum/40" />
            <h3 className="text-lg font-serif font-semibold text-signal">
              {currentYear}年{currentMonth}月
            </h3>
            <Sparkles className="w-4 h-4 text-quantum/40" />
          </div>

          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-abyss/50 border border-quantum/10 hover:border-quantum/25 transition-all duration-300 hover:bg-abyss/70 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-abyss/50 disabled:hover:border-quantum/10"
          >
            <span className="text-sm text-void-text group-hover:text-signal transition-colors">
              下月
            </span>
            <ChevronRight className="w-4 h-4 text-quantum/60 group-hover:text-quantum transition-colors" />
          </button>
        </div>

        {/* Timeline */}
        <section className="pb-20">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm text-void-text/70 max-w-sm leading-relaxed">{error}</p>
            </div>
          ) : !loading && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-quantum/10 border border-quantum/20 flex items-center justify-center mb-5">
                <Scroll className="w-7 h-7 text-quantum/50" />
              </div>
              <p className="text-sm text-void-text/50 max-w-sm leading-relaxed">
                这个月还没有平行宇宙日报，去创建第一篇吧
              </p>
            </div>
          ) : (
            <Timeline entries={entries} year={currentYear} month={currentMonth} />
          )}
        </section>
      </main>

      {/* Footer */}
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
              <span className="text-[10px] font-mono text-static/30">v0.1.0-alpha</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-static/30">信号</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className={`w-1 h-3 rounded-sm ${i <= 6 ? "bg-quantum/40" : "bg-static/10"}`}
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
