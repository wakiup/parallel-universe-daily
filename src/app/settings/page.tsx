"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import {
  Newspaper,
  Clock,
  Settings,
  Star,
  Save,
  Check,
  FileText,
  Feather,
  Wand2,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  Cpu,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import type { DiaryStyle, ProcessMode } from "@/lib/types";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { DiaryStylePreview } from "@/components/diary-style-preview";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SETTINGS_KEY = "parallel-universe-settings";

interface SettingsData {
  apiBaseUrl: string;
  apiModel: string;
  apiKey: string;
  defaultDiaryStyle: DiaryStyle;
  defaultProcessMode: ProcessMode;
}

const DEFAULT_SETTINGS: SettingsData = {
  apiBaseUrl: "",
  apiModel: "",
  apiKey: "",
  defaultDiaryStyle: "chronicle",
  defaultProcessMode: "none",
};

const DIARY_STYLES: {
  value: DiaryStyle;
  label: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    value: "newspaper",
    label: "报纸汇编风",
    description: "严肃新闻标题 + 荒诞内容",
  },
  {
    value: "prose",
    label: "散文叙事风",
    description: "第一人称故事，温暖有故事感",
  },
  {
    value: "chronicle",
    label: "荒诞编年史风",
    description: "官方档案格式，记录离谱事件",
    recommended: true,
  },
];

const PROCESS_MODES: {
  value: ProcessMode;
  label: string;
  description: string;
}[] = [
  { value: "none", label: "不加工", description: "保留原文" },
  { value: "tone", label: "语气转换", description: "AI 换个语气" },
  { value: "absurd", label: "荒诞润色", description: "加入平行宇宙元素" },
  { value: "both", label: "两者结合", description: "换语气 + 加荒诞" },
];

const PROVIDERS: {
  id: string;
  label: string;
  baseUrl: string;
  model: string;
}[] = [
  { id: "deepseek", label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { id: "kimi", label: "Kimi (Moonshot)", baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  { id: "mimo", label: "小米 MiMo", baseUrl: "https://api.xiaomi.com/v1", model: "mimo-7b" },
  { id: "custom", label: "自定义", baseUrl: "", model: "" },
];

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function getSettings(): SettingsData {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: SettingsData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ---------------------------------------------------------------------------
// Radio option card
// ---------------------------------------------------------------------------

function RadioCard({
  selected,
  onClick,
  label,
  description,
  recommended,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  recommended?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all duration-300 group",
        selected
          ? "border-quantum/30 bg-quantum/8 shadow-[0_0_30px_-8px_rgba(167,139,250,0.15)]"
          : "border-quantum/8 bg-abyss/30 hover:border-quantum/15 hover:bg-abyss/50"
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Radio dot */}
        <div
          className={cn(
            "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            selected
              ? "border-quantum bg-quantum"
              : "border-static/30 bg-transparent group-hover:border-static/50"
          )}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-void" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                selected ? "text-signal" : "text-void-text group-hover:text-signal"
              )}
            >
              {label}
            </span>
            {recommended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-quantum/15 to-plasma/15 border border-quantum/20 text-[10px] font-mono text-quantum">
                <Star className="w-2.5 h-2.5" />
                推荐
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs leading-relaxed transition-colors duration-300",
              selected ? "text-void-text/80" : "text-static/60"
            )}
          >
            {description}
          </p>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
            selected
              ? "bg-quantum/15 text-quantum"
              : "bg-stardust/30 text-static/40 group-hover:text-static/60"
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Settings section wrapper
// ---------------------------------------------------------------------------

function SettingsSection({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "settings-section rounded-2xl border border-quantum/10 bg-abyss/40 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-quantum/20 to-transparent" />

      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-serif font-bold text-signal mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-mono text-static/60">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    // Detect active provider from saved settings
    const match = PROVIDERS.find(
      (p) => p.baseUrl === loaded.apiBaseUrl && p.model === loaded.apiModel
    );
    setActiveProvider(match?.id ?? null);
  }, []);

  // Auto-save settings whenever they change
  useEffect(() => {
    if (settings === DEFAULT_SETTINGS) return;
    saveSettings(settings);
  }, [settings]);

  // GSAP entrance animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      gsap.from(".settings-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.from(".settings-section", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.3,
      });

      gsap.from(".settings-footer", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.7,
      });
    });

    return () => ctx.revert();
  }, []);

  // Handlers
  const handleDiaryStyleChange = (style: DiaryStyle) => {
    setSettings((prev) => ({ ...prev, defaultDiaryStyle: style }));
    setSaved(false);
  };

  const handleProcessModeChange = (mode: ProcessMode) => {
    setSettings((prev) => ({ ...prev, defaultProcessMode: mode }));
    setSaved(false);
  };

  const handleApiKeyChange = (value: string) => {
    setSettings((prev) => ({ ...prev, apiKey: value }));
    setSaved(false);
  };

  const handleProviderSelect = (provider: typeof PROVIDERS[number]) => {
    setActiveProvider(provider.id);
    setSettings((prev) => ({
      ...prev,
      apiBaseUrl: provider.baseUrl,
      apiModel: provider.model,
    }));
    setSaved(false);
  };

  const handleBaseUrlChange = (value: string) => {
    setActiveProvider(null);
    setSettings((prev) => ({ ...prev, apiBaseUrl: value }));
    setSaved(false);
  };

  const handleModelChange = (value: string) => {
    setActiveProvider(null);
    setSettings((prev) => ({ ...prev, apiModel: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Date display
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
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-quantum/4 rounded-full blur-[150px] float-animation" />
        <div
          className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-plasma/4 rounded-full blur-[130px] float-animation"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-nebula-pink/3 rounded-full blur-[140px] float-animation"
          style={{ animationDelay: "-5s" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(167, 139, 250, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      {/* ---- Navigation bar ---- */}
      <DesktopNav activePage="settings" showBackArrow date={currentDate} />

      {/* ---- Main content ---- */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page header */}
        <div className="settings-header mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-quantum/10 border border-quantum/15">
              <Settings className="w-6 h-6 text-quantum" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-signal">
                设置
              </h2>
              <p className="text-sm text-static font-mono mt-1">
                自定义你的平行宇宙体验
              </p>
            </div>
          </div>
        </div>

        {/* ---- Default diary style ---- */}
        <SettingsSection
          title="默认日记风格"
          subtitle="选择你偏好生成的日记风格，点击卡片预览效果"
          className="mb-6"
        >
          <DiaryStylePreview
            selectedStyle={settings.defaultDiaryStyle}
            onStyleChange={handleDiaryStyleChange}
          />
        </SettingsSection>

        {/* ---- Process mode ---- */}
        <SettingsSection
          title="手写日记默认加工方式"
          subtitle="手写日记时的 AI 处理偏好"
          className="mb-6"
        >
          <div className="space-y-3">
            {PROCESS_MODES.map((mode) => (
              <RadioCard
                key={mode.value}
                selected={settings.defaultProcessMode === mode.value}
                onClick={() => handleProcessModeChange(mode.value)}
                label={mode.label}
                description={mode.description}
                icon={
                  mode.value === "none" ? (
                    <FileText className="w-4 h-4" />
                  ) : mode.value === "tone" ? (
                    <Feather className="w-4 h-4" />
                  ) : mode.value === "absurd" ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )
                }
              />
            ))}
          </div>
        </SettingsSection>

        {/* ---- API Configuration ---- */}
        <SettingsSection
          title="API 配置"
          subtitle="可选配置，支持 OpenAI 兼容接口"
          className="mb-10"
        >
          <div className="space-y-6">
            {/* Provider quick-select chips */}
            <div>
              <label className="text-xs font-mono text-static/60 mb-2.5 block">
                快速选择服务商
              </label>
              <div className="flex flex-wrap gap-2">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-xs font-mono transition-all duration-300",
                      activeProvider === provider.id
                        ? "border-quantum/40 bg-quantum/12 text-quantum shadow-[0_0_20px_-6px_rgba(167,139,250,0.2)]"
                        : "border-quantum/8 bg-abyss/40 text-static/60 hover:border-quantum/20 hover:text-static/80 hover:bg-abyss/60"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className={cn(
                        "w-3 h-3",
                        activeProvider === provider.id ? "text-plasma" : "text-static/30"
                      )} />
                      {provider.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Base URL input */}
            <div>
              <label className="text-xs font-mono text-static/60 mb-2.5 block">
                API 地址 (Base URL)
              </label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-quantum/10 to-plasma/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-static/40">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={settings.apiBaseUrl}
                    onChange={(e) => handleBaseUrlChange(e.target.value)}
                    placeholder="https://api.example.com/v1"
                    className="w-full pl-11 pr-4 py-3.5 bg-abyss/60 border border-quantum/10 rounded-xl text-sm text-signal placeholder:text-static/30 focus:outline-none focus:border-quantum/30 transition-all duration-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Model input */}
            <div>
              <label className="text-xs font-mono text-static/60 mb-2.5 block">
                模型名称 (Model)
              </label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-quantum/10 to-plasma/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-static/40">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={settings.apiModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    placeholder="deepseek-chat"
                    className="w-full pl-11 pr-4 py-3.5 bg-abyss/60 border border-quantum/10 rounded-xl text-sm text-signal placeholder:text-static/30 focus:outline-none focus:border-quantum/30 transition-all duration-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* API Key input */}
            <div>
              <label className="text-xs font-mono text-static/60 mb-2.5 block">
                API Key
              </label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-quantum/10 to-plasma/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-static/40">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-xxxx-xxxx-xxxx"
                    className="w-full pl-11 pr-12 py-3.5 bg-abyss/60 border border-quantum/10 rounded-xl text-sm text-signal placeholder:text-static/30 focus:outline-none focus:border-quantum/30 transition-all duration-300 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 p-1.5 rounded-lg text-static/40 hover:text-static/70 transition-colors duration-200"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-static/40 font-mono pl-1">
              支持任何 OpenAI 兼容 API（DeepSeek、Kimi、MiMo 等），配置后使用真实 AI 生成日记
            </p>
          </div>
        </SettingsSection>

        {/* ---- Save button ---- */}
        <div className="settings-footer flex justify-start">
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-quantum/20 hover:scale-[1.02] active:scale-[0.98]",
              saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-gradient-to-r from-quantum to-quantum-dim text-void"
            )}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
