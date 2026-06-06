"use client";

import Link from "next/link";
import {
  Newspaper,
  Clock,
  BookOpen,
  Calendar,
  Star,
  History,
  Settings,
  ArrowLeft,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/nav-link";

export type ActivePage = "today" | "diary" | "weekly" | "history" | "settings" | "newspaper" | "gallery";

interface DesktopNavProps {
  activePage?: ActivePage;
  showBackArrow?: boolean;
  backHref?: string;
  date?: string;
  weekLabel?: string;
  dimension?: string;
  /** Extra className on the <nav> element (e.g. for GSAP targeting) */
  navClassName?: string;
}

export function DesktopNav({
  activePage = "today",
  showBackArrow = false,
  backHref = "/",
  date,
  weekLabel,
  dimension,
  navClassName,
}: DesktopNavProps) {
  const coreLinks = [
    { href: "/", label: "今日", icon: <Clock className="w-4 h-4" />, page: "today" as const },
    { href: `/diary/${new Date().toISOString().slice(0, 10)}`, label: "日记", icon: <BookOpen className="w-4 h-4" />, page: "diary" as const },
    { href: "/weekly", label: "周报", icon: <Calendar className="w-4 h-4" />, page: "weekly" as const },
    { href: "/history", label: "编年史", icon: <Star className="w-4 h-4" />, page: "history" as const },
    { href: "/settings", label: "设置", icon: <Settings className="w-4 h-4" />, page: "settings" as const },
  ];

  // The newspaper detail page has NO nav links — just back arrow + logo
  const showNavLinks = activePage !== "newspaper";

  // Determine the right-side label text
  let rightLabel = date ?? "";
  if (weekLabel) rightLabel = weekLabel;

  return (
    <nav
      className={
        navClassName
          ? `hidden md:block relative z-50 border-b border-quantum/8 bg-void/60 backdrop-blur-xl ${navClassName}`
          : "hidden md:block relative z-50 border-b border-quantum/8 bg-void/60 backdrop-blur-xl"
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: optional back arrow + Logo */}
          <div className="flex items-center gap-3">
            {showBackArrow && (
              <Link
                href={backHref}
                className="flex items-center justify-center size-9 rounded-lg border border-quantum/10 text-void-text transition-colors hover:text-quantum hover:border-quantum/25"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-quantum to-plasma flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-void" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-plasma rounded-full pulse-glow border-2 border-void" />
              </div>
              <div>
                <h1 className="text-base font-serif font-bold text-signal tracking-wide">
                  平行宇宙日报
                </h1>
                <p className="text-[9px] font-mono text-static tracking-[0.35em] uppercase">
                  Parallel Universe Daily
                </p>
              </div>
            </div>
          </div>

          {/* Center: nav links */}
          {showNavLinks && (
            <div className="hidden md:flex items-center gap-1">
              {coreLinks.map((link) => (
                <NavLink key={link.href} href={link.href} active={activePage === link.page}>
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/gallery"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                activePage === "gallery"
                  ? "text-quantum bg-quantum/10"
                  : "text-static/50 hover:text-signal"
              )}
            >
              <Image className="size-4" />
              <span className="hidden lg:inline">画廊</span>
            </Link>
            {/* Dimension badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-quantum/8 border border-quantum/15">
              <div className="w-1.5 h-1.5 bg-quantum rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-quantum/80">维度 {dimension ?? "7-B"}</span>
            </div>

            {/* Date / week label */}
            {rightLabel && (
              <div className="px-3 py-1.5 rounded-full bg-abyss/60 border border-quantum/8">
                <span className="text-[11px] font-mono text-void-text">{rightLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
