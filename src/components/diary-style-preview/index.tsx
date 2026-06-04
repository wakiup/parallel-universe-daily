"use client";

import { useState } from "react";
import type { DiaryStyle } from "@/lib/types";
import { STYLE_PREVIEW_CONFIGS } from "./styles";
import { PreviewCard } from "./preview-card";
import { PreviewModal } from "./preview-modal";

interface DiaryStylePreviewProps {
  selectedStyle: DiaryStyle;
  onStyleChange: (style: DiaryStyle) => void;
}

export function DiaryStylePreview({
  selectedStyle,
  onStyleChange,
}: DiaryStylePreviewProps) {
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    style: DiaryStyle | null;
  }>({
    isOpen: false,
    style: null,
  });

  const handlePreview = (style: DiaryStyle) => {
    setPreviewState({ isOpen: true, style });
  };

  const handleClosePreview = () => {
    setPreviewState({ isOpen: false, style: null });
  };

  const handleSelectFromModal = (style: DiaryStyle) => {
    onStyleChange(style);
    setPreviewState({ isOpen: false, style: null });
  };

  return (
    <>
      <div className="space-y-3">
        {STYLE_PREVIEW_CONFIGS.map((config) => (
          <PreviewCard
            key={config.value}
            config={config}
            isSelected={selectedStyle === config.value}
            onSelect={onStyleChange}
            onPreview={handlePreview}
          />
        ))}
      </div>

      <PreviewModal
        isOpen={previewState.isOpen}
        style={previewState.style}
        onClose={handleClosePreview}
        onSelect={handleSelectFromModal}
      />
    </>
  );
}

export { PreviewCard } from "./preview-card";
export { PreviewModal } from "./preview-modal";
export { PreviewContent } from "./preview-content";
export { STYLE_PREVIEW_CONFIGS, getStyleConfig } from "./styles";
