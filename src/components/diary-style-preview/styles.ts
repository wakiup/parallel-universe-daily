// src/components/diary-style-preview/styles.ts

import type { DiaryStyle } from "@/lib/types";

export interface StylePreviewConfig {
  value: DiaryStyle;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  preview: {
    header: string;
    title: string;
    subtitle: string;
    content: string;
    events?: Array<{
      title: string;
      content: string;
    }>;
  };
}

export const STYLE_PREVIEW_CONFIGS: StylePreviewConfig[] = [
  {
    value: "newspaper",
    label: "报纸汇编风",
    description: "严肃新闻标题 + 荒诞内容",
    icon: "FileText",
    color: "#A78BFA",
    gradient: "from-quantum/10 to-quantum/5",
    preview: {
      header: "PARALLEL UNIVERSE DAILY",
      title: "今 日 大 事 记",
      subtitle: "2026.06.04 · 维度 7-B · 第 4523 期",
      content: `1. [08:30] 咖啡机觉醒事件
2. [12:15] 量子猫失踪案
3. [18:45] 维度裂缝警报`,
    },
  },
  {
    value: "prose",
    label: "散文叙事风",
    description: "第一人称故事，温暖有故事感",
    icon: "Feather",
    color: "#F472B6",
    gradient: "from-nebula-pink/10 to-nebula-pink/5",
    preview: {
      header: "平行宇宙日记",
      title: "一个普通又不普通的周四",
      subtitle: "2026.06.04 · 平行宇宙日记",
      content: `今天的早晨从一个不寻常的发现开始。咖啡机突然觉醒，这让我意识到，我们所处的世界远比想象中更加荒诞。`,
    },
  },
  {
    value: "chronicle",
    label: "荒诞编年史风",
    description: "官方档案格式，记录离谱事件",
    icon: "Wand2",
    color: "#22D3EE",
    gradient: "from-plasma/10 to-plasma/5",
    preview: {
      header: "CLASSIFIED · 绝密",
      title: "平行宇宙编年史 · 日记卷",
      subtitle: "宇宙纪元 2026.06.04 · 档案编号 PUD-0604",
      content: "",
      events: [
        {
          title: "【重大事件一】咖啡机觉醒事件",
          content:
            "本宇宙标准时间 08:30，一起重大异常事件被记录在案。办公室咖啡机突然具备自主意识，开始拒绝为没有预约的员工制作咖啡。全球平行宇宙管理局已将此列为 S 级事件，并紧急召回所有具有自主意识的设备。",
        },
        {
          title: "【重大事件二】量子猫失踪案",
          content:
            "正午时分，另一起突破维度屏障的事件被记录。实验室内的一只薛定谔的猫同时存在于所有平行宇宙中，导致观察者陷入存在主义危机。",
        },
      ],
    },
  },
];

export const getStyleConfig = (style: DiaryStyle): StylePreviewConfig => {
  return (
    STYLE_PREVIEW_CONFIGS.find((config) => config.value === style) ||
    STYLE_PREVIEW_CONFIGS[2]
  );
};
