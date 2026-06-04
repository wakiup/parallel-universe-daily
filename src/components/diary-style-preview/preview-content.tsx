"use client";

import type { StylePreviewConfig } from "./styles";

interface PreviewContentProps {
  config: StylePreviewConfig;
}

export function PreviewContent({ config }: PreviewContentProps) {
  const { preview, color } = config;

  if (config.value === "newspaper") {
    return (
      <div
        className="p-6 rounded-xl border-2 border-dashed"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}
      >
        <div className="text-center mb-4">
          <div
            className="text-[10px] tracking-[3px] mb-2 font-mono"
            style={{ color }}
          >
            {preview.header}
          </div>
          <div className="font-serif text-xl font-bold text-signal mb-1">
            {preview.title}
          </div>
          <div className="text-[11px] text-static/60 font-mono">
            {preview.subtitle}
          </div>
        </div>

        <div
          className="h-px my-4"
          style={{ backgroundColor: `${color}30` }}
        />

        <div className="text-xs text-static/70 whitespace-pre-line leading-relaxed">
          {preview.content}
        </div>
      </div>
    );
  }

  if (config.value === "prose") {
    return (
      <div className="p-6 rounded-xl">
        <div className="text-center mb-4">
          <div className="font-serif text-lg font-bold text-signal mb-1">
            {preview.title}
          </div>
          <div className="text-[11px] text-static/60 font-mono">
            {preview.subtitle}
          </div>
        </div>

        <div
          className="h-px my-4"
          style={{ backgroundColor: `${color}30` }}
        />

        <div className="text-sm text-static/80 leading-relaxed italic">
          {preview.content}
        </div>

        <div className="text-right text-[10px] text-static/50 mt-4 font-mono">
          —— 来自维度 7-B 的观察者
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border-2 border-dashed"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-[10px] tracking-[2px] font-mono" style={{ color }}>
          {preview.header}
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="font-serif text-base font-bold text-signal mb-1">
          {preview.title}
        </div>
        <div className="text-[11px] text-static/60 font-mono">
          {preview.subtitle}
        </div>
      </div>

      <div
        className="h-px my-4"
        style={{ borderStyle: "dashed", backgroundColor: `${color}30` }}
      />

      {preview.events?.map((event, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <div className="text-xs font-bold mb-2" style={{ color }}>
            {event.title}
          </div>
          <div className="text-xs text-static/70 leading-relaxed">
            {event.content}
          </div>
          {index < (preview.events?.length ?? 0) - 1 && (
            <div
              className="h-px my-4"
              style={{ borderStyle: "dashed", backgroundColor: `${color}20` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
