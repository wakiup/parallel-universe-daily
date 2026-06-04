"use client";

import { useRef, useState } from "react";
import { FileText, Feather, Wand2, Eye } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import type { DiaryStyle } from "@/lib/types";
import type { StylePreviewConfig } from "./styles";

const ICON_MAP = {
  FileText: FileText,
  Feather: Feather,
  Wand2: Wand2,
};

interface PreviewCardProps {
  config: StylePreviewConfig;
  isSelected: boolean;
  onSelect: (style: DiaryStyle) => void;
  onPreview: (style: DiaryStyle) => void;
}

export function PreviewCard({
  config,
  isSelected,
  onSelect,
  onPreview,
}: PreviewCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(cardRef.current, {
        y: -8,
        boxShadow: `0 20px 60px -15px ${config.color}40`,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        boxShadow: "none",
        duration: 0.4,
        ease: "power3.out",
      });
    }
  };

  const handleClick = () => {
    onPreview(config.value);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(config.value);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-xl border p-4 transition-colors duration-300 cursor-pointer group",
        isSelected
          ? "border-quantum/30 bg-quantum/8"
          : "border-quantum/8 bg-abyss/30 hover:border-quantum/15 hover:bg-abyss/50"
      )}
    >
      <div
        className={cn(
          "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}30`,
          color: config.color,
          borderWidth: "1px",
        }}
      >
        <Eye className="w-3 h-3" />
        预览
      </div>

      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            isSelected
              ? "border-quantum bg-quantum"
              : "border-static/30 bg-transparent group-hover:border-static/50"
          )}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-void" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                isSelected ? "text-signal" : "text-void-text group-hover:text-signal"
              )}
            >
              {config.label}
            </span>
            {config.value === "chronicle" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-quantum/15 to-plasma/15 border border-quantum/20 text-[10px] font-mono text-quantum">
                推荐
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs leading-relaxed transition-colors duration-300",
              isSelected ? "text-void-text/80" : "text-static/60"
            )}
          >
            {config.description}
          </p>
        </div>

        <div
          className={cn(
            "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
            isSelected
              ? "bg-quantum/15 text-quantum"
              : "bg-stardust/30 text-static/40 group-hover:text-static/60"
          )}
        >
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      <div
        className={cn(
          "mt-3 flex justify-end transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <button
          onClick={handleSelectClick}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
            isSelected
              ? "bg-quantum/20 text-quantum border border-quantum/30"
              : "bg-abyss/60 text-static/60 border border-quantum/10 hover:bg-quantum/10 hover:text-quantum hover:border-quantum/30"
          )}
        >
          选择此风格
        </button>
      </div>
    </div>
  );
}
