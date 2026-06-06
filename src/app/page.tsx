"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { loadNewspapers, addNewspaper, saveNewspapers, deleteNewspaper, type NewspaperData } from "@/lib/newspapers";
import { generateNewspaper } from "@/lib/client-api";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { Newspaper, BookOpen, Calendar, Clock, Sparkles, Send, Star, Radio, Wifi, Globe, ArrowRight, BookMarked, Trash2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { label: "维度裂缝", value: "3", icon: <Globe className="w-3.5 h-3.5" /> },
  { label: "信号强度", value: "87%", icon: <Wifi className="w-3.5 h-3.5" /> },
  { label: "时空坐标", value: "7B", icon: <Radio className="w-3.5 h-3.5" /> },
];

const SEED_NEWSPAPERS: NewspaperData[] = [
  {
    id: "seed-1",
    headline: "震惊！某程序员在凌晨3点发现咖啡机其实是时光机",
    subheadline: "平行宇宙咖啡机制造商股价暴涨300%，全球程序员集体辞职去泡咖啡",
    content: "据平行宇宙通讯社报道，北京时间凌晨3点17分，一位不愿透露姓名的程序员在加班时意外发现，公司茶水间的咖啡机实际上是一台未被激活的时光机。\n\n该程序员表示：「我只是想泡一杯美式，结果不小心按到了'浓缩'和'大杯'的组合键，整个厨房就开始发出蓝色光芒。」\n\n目击者称，咖啡机在启动后吐出了一杯冒着紫色泡沫的液体，以及一张来自2087年的收据。收据上写着：「恭喜你发现了时空裂缝，请凭此券兑换一杯免费的反物质拿铁。」\n\n平行宇宙咖啡机制造商股价在消息传出后暴涨300%。该公司CEO回应称：「我们的产品一直都有这个功能，只是大多数用户只用来泡速溶咖啡。」\n\n全球程序员社群随即爆发了一场「咖啡机考古运动」，据不完全统计，已有超过47台办公咖啡机被拆解研究。",
    timestamp: "2026-06-02 08:30",
    weather: "量子雨转薛定谔的晴",
    mood: "极佳",
    color: "quantum",
    dimension: "7-B",
  },
];

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewspapers, setShowNewspapers] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [newspapers, setNewspapers] = useState<NewspaperData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load newspapers from localStorage on mount, seed if empty
  useEffect(() => {
    const stored = loadNewspapers();
    if (stored.length === 0) {
      saveNewspapers(SEED_NEWSPAPERS);
      setNewspapers(SEED_NEWSPAPERS);
    } else {
      setNewspapers(stored);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowNewspapers(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Hero title entrance
      gsap.from(".hero-title", {
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });

      gsap.from(".hero-status", {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.1,
      });

      gsap.from(".hero-input", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.7,
      });

      gsap.from(".stats-row", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.9,
      });

      // Newspaper section scroll reveal
      gsap.from(".newspaper-section", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".newspaper-section",
          start: "top 85%",
          once: true,
        },
      });

      // Quick links section scroll reveal
      gsap.from(".quicklinks-section", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".quicklinks-section",
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const handleGenerate = async () => {
    if (!inputValue.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const newspaper = await generateNewspaper(inputValue);
      const updated = addNewspaper(newspaper);
      setNewspapers(updated);
      setInputValue("");
    } catch {
      setError("生成失败，请稍后重试");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteNewspaper(id);
    setNewspapers(updated);
  };

  const currentDate = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="min-h-screen bg-void relative overflow-hidden pb-20 md:pb-0">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-quantum/4 rounded-full blur-[150px] float-animation" />
        <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-plasma/4 rounded-full blur-[130px] float-animation" style={{ animationDelay: "-3s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-nebula-pink/3 rounded-full blur-[140px] float-animation" style={{ animationDelay: "-5s" }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(167, 139, 250, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      {/* Navigation */}
      <DesktopNav activePage="today" date={currentDate} />

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section - The most impactful area */}
        <section className="pt-16 pb-20 sm:pt-20 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status indicator */}
            <div className="hero-status inline-flex items-center gap-3 px-4 py-2 rounded-full bg-abyss/60 border border-quantum/15 mb-8 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-emerald-400/80">在线</span>
              </div>
              <div className="w-px h-3 bg-quantum/20" />
              <span className="text-xs font-mono text-static">编辑部就绪</span>
              <div className="w-px h-3 bg-quantum/20" />
              <span className="text-xs font-mono text-static">信号稳定</span>
            </div>

            {/* Main headline */}
            <div className="mb-8">
              <h2 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-signal mb-6 leading-[1.1] tracking-tight">
                <span className="block">今日</span>
                <span className="block gradient-text">编辑部</span>
              </h2>
              <p className="hero-subtitle text-lg sm:text-xl text-void-text/80 max-w-xl mx-auto leading-relaxed">
                你的平行宇宙正在等待今天的头条
              </p>
            </div>

            {/* Input area - The focal point */}
            <div className="hero-input max-w-2xl mx-auto">
              <div className="relative group">
                {/* Glow effect behind input */}
                <div className="absolute -inset-2 bg-gradient-to-r from-quantum/15 via-plasma/15 to-nebula-pink/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700" />

                <div className="relative bg-abyss/70 backdrop-blur-2xl border border-quantum/12 rounded-2xl shadow-2xl shadow-quantum/5 overflow-hidden">
                  {/* Top decorative bar */}
                  <div className="h-px bg-gradient-to-r from-transparent via-quantum/30 to-transparent" />

                  <div className="p-6 sm:p-8">
                    {/* Input header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-quantum rounded-full pulse-glow" />
                          <span className="text-xs font-mono text-static tracking-wide">事件记录终端</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded text-[9px] font-mono text-static/50 bg-stardust/30">
                          LIVE
                        </div>
                      </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="今天发生了什么？（越离谱，平行宇宙越精彩）"
                      className="w-full h-36 bg-transparent text-signal placeholder:text-static/40 resize-none focus:outline-none text-lg leading-relaxed font-light"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                    />

                    {/* Error message */}
                    {error && (
                      <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                        {error}
                      </div>
                    )}

                    {/* Bottom bar */}
                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-quantum/8">
                      <div className="flex items-center gap-5">
                        <span className="text-xs font-mono text-static/60">
                          {inputValue.length > 0 ? (
                            <span className="text-quantum/80">{inputValue.length}</span>
                          ) : (
                            "0"
                          )} <span className="text-static/40">字</span>
                        </span>
                        <span className="text-[10px] font-mono text-static/30 hidden sm:inline">
                          Enter 发送 · Shift+Enter 换行
                        </span>
                      </div>

                      <button
                        onClick={handleGenerate}
                        disabled={!inputValue.trim() || isGenerating}
                        className="group/btn relative inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-quantum to-quantum-dim text-void font-medium rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-quantum/20 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                            <span className="text-sm">接收平行宇宙信号...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                            <span className="text-sm">生成日报</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bottom decorative bar */}
                  <div className="h-px bg-gradient-to-r from-transparent via-plasma/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="stats-row flex items-center justify-center gap-6 sm:gap-10 mt-10">
              {STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-quantum/40">{stat.icon}</div>
                  <span className="text-xs font-mono text-static/50">{stat.label}</span>
                  <span className="text-xs font-mono text-quantum/80">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative mb-16">
          <div className="h-px bg-gradient-to-r from-transparent via-quantum/20 to-transparent" />
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-void">
            <Sparkles className="w-4 h-4 text-quantum/30" />
          </div>
        </div>

        {/* Today's newspapers */}
        <section className="newspaper-section mb-20">
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 bg-gradient-to-b from-quantum via-plasma to-nebula-pink rounded-full" />
              <div>
                <h3 className="text-2xl font-serif font-bold text-signal">今日报纸</h3>
                <p className="text-sm text-static font-mono mt-1">
                  今日已生成 <span className="text-quantum">{newspapers.length}</span> 份报纸
                </p>
              </div>
            </div>
            <Link href="/history" className="group flex items-center gap-1.5 text-sm text-quantum/70 hover:text-quantum transition-colors">
              查看全部
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {newspapers.map((paper, index) => (
              <NewspaperCard
                key={paper.id}
                paper={paper}
                index={index}
                show={showNewspapers}
                isActive={activeCard === paper.id}
                onHover={() => setActiveCard(paper.id)}
                onLeave={() => setActiveCard(null)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="quicklinks-section mb-20">
          <div className="flex items-center gap-3 mb-8">
            <BookMarked className="w-5 h-5 text-quantum/50" />
            <h3 className="text-lg font-serif font-semibold text-signal">探索更多</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickLink
              icon={<BookOpen className="w-5 h-5" />}
              title="平行日记"
              description="AI 生成或手写你的宇宙日记"
              href={`/diary/${new Date().toISOString().split("T")[0]}`}
              color="quantum"
            />
            <QuickLink
              icon={<Calendar className="w-5 h-5" />}
              title="宇宙周报"
              description="每周平行宇宙汇总"
              href="/weekly"
              color="plasma"
            />
            <QuickLink
              icon={<Star className="w-5 h-5" />}
              title="编年史"
              description="你的平行宇宙历史档案"
              href="/history"
              color="pink"
            />
          </div>
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
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className={`w-1 h-3 rounded-sm ${i <= 6 ? 'bg-quantum/40' : 'bg-static/10'}`} />
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

// NewspaperCard component
function NewspaperCard({
  paper,
  index,
  show,
  isActive,
  onHover,
  onLeave,
  onDelete,
}: {
  paper: NewspaperData;
  index: number;
  show: boolean;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  onDelete: (id: string) => void;
}) {
  const colorConfig = {
    quantum: {
      border: "border-quantum/15",
      hoverBorder: "hover:border-quantum/30",
      glow: "hover:shadow-[0_8px_40px_-12px_rgba(167,139,250,0.15)]",
      badge: "bg-quantum/10 text-quantum border-quantum/20",
      dot: "bg-quantum",
      gradient: "from-quantum/10 to-transparent",
      hoverText: "group-hover:text-quantum",
    },
    plasma: {
      border: "border-plasma/15",
      hoverBorder: "hover:border-plasma/30",
      glow: "hover:shadow-[0_8px_40px_-12px_rgba(34,211,238,0.15)]",
      badge: "bg-plasma/10 text-plasma border-plasma/20",
      dot: "bg-plasma",
      gradient: "from-plasma/10 to-transparent",
      hoverText: "group-hover:text-plasma",
    },
    pink: {
      border: "border-nebula-pink/15",
      hoverBorder: "hover:border-nebula-pink/30",
      glow: "hover:shadow-[0_8px_40px_-12px_rgba(244,114,182,0.15)]",
      badge: "bg-nebula-pink/10 text-nebula-pink border-nebula-pink/20",
      dot: "bg-nebula-pink",
      gradient: "from-nebula-pink/10 to-transparent",
      hoverText: "group-hover:text-nebula-pink",
    },
  };

  const colors = colorConfig[paper.color];

  return (
    <div
      className={`group relative transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className={`relative bg-abyss/50 backdrop-blur-sm border ${colors.border} ${colors.hoverBorder} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${colors.glow}`}>
        {/* Top accent line */}
        <div className={`h-px bg-gradient-to-r ${colors.gradient}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 ${colors.dot} rounded-full pulse-glow`} />
              <span className="text-[11px] font-mono text-static/60 tracking-wider">#{paper.id.slice(0, 8)}</span>
              <span className="text-[10px] font-mono text-static/30">·</span>
              <span className="text-[10px] font-mono text-static/40">维度 {paper.dimension}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded-md text-[10px] font-mono ${colors.badge} border`}>
                {paper.mood}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(paper.id);
                }}
                className="p-1.5 rounded-lg text-static/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Headline */}
          <a href={`/newspaper/${paper.id}`} className="block">
            <h4 className={`text-[17px] font-serif font-bold text-signal mb-3 leading-snug line-clamp-2 ${colors.hoverText} transition-colors duration-300`}>
              {paper.headline}
            </h4>
          </a>

          {/* Subheadline */}
          <p className="text-sm text-void-text/70 mb-5 line-clamp-2 leading-relaxed">
            {paper.subheadline}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-quantum/8">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-static/40" />
              <span className="text-[11px] font-mono text-static/50">{paper.timestamp}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-quantum/30" />
              <span className="text-[10px] font-mono text-static/40">{paper.weather}</span>
            </div>
          </div>
        </div>

        {/* Bottom accent line - appears on hover */}
        <div className="h-px bg-gradient-to-r from-transparent via-quantum/0 to-transparent group-hover:via-quantum/30 transition-all duration-500" />
      </div>
    </div>
  );
}

// QuickLink component
function QuickLink({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: "quantum" | "plasma" | "pink";
}) {
  const colorConfig = {
    quantum: {
      hoverBorder: "hover:border-quantum/25",
      glow: "hover:shadow-quantum/8",
      iconBg: "bg-quantum/10 text-quantum",
      arrowColor: "text-quantum/40 group-hover:text-quantum",
    },
    plasma: {
      hoverBorder: "hover:border-plasma/25",
      glow: "hover:shadow-plasma/8",
      iconBg: "bg-plasma/10 text-plasma",
      arrowColor: "text-plasma/40 group-hover:text-plasma",
    },
    pink: {
      hoverBorder: "hover:border-nebula-pink/25",
      glow: "hover:shadow-nebula-pink/8",
      iconBg: "bg-nebula-pink/10 text-nebula-pink",
      arrowColor: "text-nebula-pink/40 group-hover:text-nebula-pink",
    },
  };

  const colors = colorConfig[color];

  return (
    <Link
      href={href}
      className={`group relative bg-abyss/40 backdrop-blur-sm border border-quantum/8 ${colors.hoverBorder} rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${colors.glow}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-signal text-sm mb-0.5">{title}</h4>
          <p className="text-xs text-static/60">{description}</p>
        </div>
        <ArrowRight className={`w-4 h-4 ${colors.arrowColor} transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0`} />
      </div>
    </Link>
  );
}
