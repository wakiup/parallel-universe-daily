import { cn } from "@/lib/utils";
import type { DiaryStyle } from "@/lib/types";

interface DiaryHeaderProps {
  style: DiaryStyle;
  date: string; // 格式: YYYY-MM-DD
}

const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * 根据日期返回散文叙事风格的标题
 * "一个普通又不普通的周X"
 */
function getProseTitle(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `一个普通又不普通的${weekday}`;
}

/**
 * 解析日期字符串，返回格式化的年月日
 */
function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
}

/**
 * 计算日期在当年的期数（基于一年中的第几天）
 */
function getIssueNumber(dateString: string): number {
  const date = new Date(dateString + "T00:00:00");
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function ChronicleHeader({ date }: { date: string }) {
  const { year, month, day } = parseDate(date);
  const mmdd = `${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center text-center">
      {/* 顶部：绝密标签 */}
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.35em] text-nebula-pink">
        CLASSIFIED · 绝密
      </p>

      {/* 中间：主标题，带边框装饰 */}
      <div className="px-8 py-4 border border-quantum/40 rounded">
        <h1 className="font-serif text-2xl font-bold tracking-wide text-signal sm:text-3xl">
          平行宇宙编年史 · 日记卷
        </h1>
      </div>

      {/* 底部：宇宙纪元 + 档案编号 */}
      <p className="mt-4 font-mono text-xs tracking-wider text-void-text">
        宇宙纪元 {year}.{String(month).padStart(2, "0")}.{String(day).padStart(2, "0")} · 档案编号 PUD-{mmdd}
      </p>

      {/* 分割线 */}
      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-quantum/30 to-transparent" />
    </div>
  );
}

function NewspaperHeader({ date }: { date: string }) {
  const { year, month, day } = parseDate(date);
  const issueNumber = getIssueNumber(date);

  return (
    <div className="flex flex-col items-center text-center">
      {/* 顶部：英文报头 */}
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.35em] text-static">
        PARALLEL UNIVERSE DAILY
      </p>

      {/* 中间：今日大事记 */}
      <h1 className="font-serif text-3xl font-bold tracking-[0.15em] text-signal sm:text-4xl">
        今 日 大 事 记
      </h1>

      {/* 分割线（渐变） */}
      <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-quantum/30 to-transparent" />

      {/* 底部：日期 + 期数 */}
      <p className="font-mono text-xs tracking-wider text-void-text">
        {year}年{month}月{day}日 · 第{String(issueNumber).padStart(3, "0")}期
      </p>
    </div>
  );
}

function ProseHeader({ date }: { date: string }) {
  const { year, month, day } = parseDate(date);
  const title = getProseTitle(date);

  return (
    <div className="flex flex-col text-left">
      {/* 标题：根据星期变化 */}
      <h1 className="font-serif text-2xl font-semibold text-signal sm:text-3xl">
        {title}
      </h1>

      {/* 分割线：从 plasma 色开始 */}
      <div className="my-4 h-px w-full bg-gradient-to-r from-plasma/30 via-quantum/30 to-transparent" />

      {/* 底部：日期 + 副标题 */}
      <p className="font-mono text-xs tracking-wider text-void-text">
        {year}.{String(month).padStart(2, "0")}.{String(day).padStart(2, "0")} · 平行宇宙日记
      </p>
    </div>
  );
}

export function DiaryHeader({ style, date }: DiaryHeaderProps) {
  return (
    <header
      className={cn(
        "w-full",
        style === "prose" ? "px-1" : "px-4"
      )}
    >
      {style === "chronicle" && <ChronicleHeader date={date} />}
      {style === "newspaper" && <NewspaperHeader date={date} />}
      {style === "prose" && <ProseHeader date={date} />}
    </header>
  );
}
