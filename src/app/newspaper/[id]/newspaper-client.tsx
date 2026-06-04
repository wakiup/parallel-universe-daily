"use client";

import { useState, useLayoutEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Newspaper,
  Clock,
  Sparkles,
  Cloud,
  Smile,
  Globe,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { loadNewspapers, type NewspaperData } from "@/lib/newspapers";
import { formatMarkdown } from "@/lib/markdown";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

const colorConfig = {
  quantum: {
    border: "border-quantum/15",
    badge: "bg-quantum/10 text-quantum border-quantum/20",
    dot: "bg-quantum",
    accent: "from-quantum/20 to-quantum/5",
    glow: "shadow-quantum/10",
  },
  plasma: {
    border: "border-plasma/15",
    badge: "bg-plasma/10 text-plasma border-plasma/20",
    dot: "bg-plasma",
    accent: "from-plasma/20 to-plasma/5",
    glow: "shadow-plasma/10",
  },
  pink: {
    border: "border-nebula-pink/15",
    badge: "bg-nebula-pink/10 text-nebula-pink border-nebula-pink/20",
    dot: "bg-nebula-pink",
    accent: "from-nebula-pink/20 to-nebula-pink/5",
    glow: "shadow-nebula-pink/10",
  },
};

export default function NewspaperClient() {
  const params = useParams<{ id?: string }>();
  const id = params.id;

  const [paper, setPaper] = useState<NewspaperData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useLayoutEffect(() => {
    if (!id) return;
    const all = loadNewspapers();
    const found = all.find((n) => n.id === id);
    if (found) {
      setPaper(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  useLayoutEffect(() => {
    if (!paper) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      gsap.from(".newspaper-detail", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.1,
      });
    });
    return () => ctx.revert();
  }, [paper]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="size-16 text-static/30 mx-auto mb-4" />
          <p className="text-lg text-static mb-2">报纸未找到</p>
          <p className="text-sm text-void-text mb-6">
            这份报纸可能已从时间线上消失
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-quantum/10 text-quantum border border-quantum/20 text-sm font-medium hover:bg-quantum/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Sparkles className="size-8 text-quantum/40 animate-pulse" />
      </div>
    );
  }

  const colors = colorConfig[paper.color];
  const contentHtml = formatMarkdown(paper.content);

  return (
    <div className="min-h-screen bg-void relative overflow-hidden pb-20 md:pb-0">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-quantum/4 rounded-full blur-[150px] float-animation" />
        <div
          className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-plasma/4 rounded-full blur-[130px] float-animation"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      <DesktopNav activePage="newspaper" showBackArrow dimension={paper.dimension} />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="newspaper-detail">
          <div
            className={cn(
              "relative rounded-2xl border backdrop-blur-sm overflow-hidden mb-8",
              colors.border,
              "bg-abyss/40"
            )}
          >
            <div
              className={cn(
                "h-1 bg-gradient-to-r",
                colors.accent
              )}
            />

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                  <span className="text-xs font-mono text-static/60">
                    #{paper.id.slice(0, 8)}
                  </span>
                </div>
                <div
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-mono border",
                    colors.badge
                  )}
                >
                  {paper.mood}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-static/50">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{paper.timestamp}</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-signal mb-4 leading-snug">
                {paper.headline}
              </h2>

              <p className="text-base text-void-text/80 mb-6 leading-relaxed">
                {paper.subheadline}
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void/40 border border-quantum/8">
                  <Cloud className="w-3.5 h-3.5 text-static/50" />
                  <span className="text-xs text-static/70">{paper.weather}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void/40 border border-quantum/8">
                  <Smile className="w-3.5 h-3.5 text-static/50" />
                  <span className="text-xs text-static/70">{paper.mood}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void/40 border border-quantum/8">
                  <Globe className="w-3.5 h-3.5 text-static/50" />
                  <span className="text-xs text-static/70">
                    维度 {paper.dimension}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <article
                className="prose-override font-serif text-sm text-signal/90 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>

            <div className="border-t border-quantum/8 px-6 sm:px-8 py-4">
              <p className="font-serif text-xs italic text-static/50 text-center">
                — 来自平行宇宙 {paper.dimension} · {paper.timestamp} 的报道
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-quantum/10 text-quantum border border-quantum/20 text-sm font-medium hover:bg-quantum/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
