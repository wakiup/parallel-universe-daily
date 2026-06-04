"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import type { DiaryStyle } from "@/lib/types";
import { getStyleConfig } from "./styles";
import { PreviewContent } from "./preview-content";

interface PreviewModalProps {
  isOpen: boolean;
  style: DiaryStyle | null;
  onClose: () => void;
  onSelect: (style: DiaryStyle) => void;
}

export function PreviewModal({
  isOpen,
  style,
  onClose,
  onSelect,
}: PreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const config = style ? getStyleConfig(style) : null;

  useEffect(() => {
    if (!isOpen || !modalRef.current || !overlayRef.current || !contentRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([overlayRef.current, modalRef.current], { opacity: 1 });
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();

    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    tl.fromTo(
      modalRef.current,
      { opacity: 0, y: 100, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
      "-=0.2"
    );

    tl.fromTo(
      contentRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!modalRef.current || !overlayRef.current) {
      onClose();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(contentRef.current?.children ?? [], {
      opacity: 0,
      y: -10,
      duration: 0.2,
      stagger: 0.05,
      ease: "power2.in",
    });

    tl.to(
      modalRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.3,
        ease: "power3.in",
      },
      "-=0.1"
    );

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.2"
    );
  };

  const handleSelect = () => {
    if (style) {
      onSelect(style);
    }
    handleClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden bg-abyss/95 backdrop-blur-md"
        style={{ borderColor: `${config.color}20` }}
      >
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80, ${config.color})`,
          }}
        />

        <div className="flex items-center justify-between p-4 border-b border-quantum/10">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-sm font-medium text-signal">
              预览：{config.label}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-static/40 hover:text-static/70 hover:bg-quantum/10 transition-colors duration-200"
            aria-label="关闭预览"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={contentRef} className="p-6">
          <PreviewContent config={config} />
        </div>

        <div className="flex justify-center gap-3 p-4 border-t border-quantum/10">
          <button
            onClick={handleSelect}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r text-void hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
            }}
          >
            选择此风格
          </button>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-static/60 border border-quantum/10 hover:border-quantum/30 hover:text-static/80 transition-all duration-300"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
}
