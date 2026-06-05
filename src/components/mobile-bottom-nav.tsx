"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BookOpen, Calendar, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

const NAV_ITEMS = [
  { href: "/", label: "今日", icon: Clock },
  { href: `/diary/${today}`, label: "日记", icon: BookOpen },
  { href: "/weekly", label: "周报", icon: Calendar },
  { href: "/history", label: "编年史", icon: Star },
  { href: "/settings", label: "设置", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/diary") return pathname.startsWith("/diary");
    if (href === "/weekly") return pathname.startsWith("/weekly");
    if (href === "/history") return pathname === "/history";
    if (href === "/settings") return pathname === "/settings";
    return false;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-quantum/10 bg-void/80 backdrop-blur-xl safe-area-pb">
      <div className="flex items-center justify-around h-14 px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-[3.5rem]",
                active
                  ? "text-quantum"
                  : "text-static/60 hover:text-void-text"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active && "drop-shadow-[0_0_6px_rgba(167,139,250,0.5)]"
                )}
              />
              <span className="text-[10px] font-medium leading-tight">
                {label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-4 h-0.5 rounded-full bg-quantum" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
