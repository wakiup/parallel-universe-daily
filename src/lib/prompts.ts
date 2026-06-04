// src/lib/prompts.ts

import type { DiaryStyle, DiaryEntry, Event } from "@/lib/types";

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}年${m}月${day}日`;
}

function getIssueNumber(events: Event[]): string {
  const first = events[0];
  if (!first) return "#001";
  const d = new Date(first.timestamp);
  const hash =
    d.getFullYear() * 10000 +
    (d.getMonth() + 1) * 100 +
    d.getDate();
  return `#${String(hash).slice(-3).padStart(3, "0")}`;
}

function getDimensionLabel(events: Event[]): string {
  const dims = Array.from(new Set(events.map((e) => e.dimension)));
  return dims.length === 1 ? dims[0] : dims.join(" / ");
}

function buildNewspaperPrompt(events: Event[]): string {
  const first = events[0];
  const date = first ? formatDate(first.timestamp) : "日期未知";
  const issue = getIssueNumber(events);
  const dimension = getDimensionLabel(events);

  const eventList = events
    .map(
      (e, i) =>
        `${i + 1}. 【${e.mood}】${e.headline}\n` +
        `   ${e.subheadline}\n` +
        (e.content ? `   正文：${e.content.slice(0, 200)}${e.content.length > 200 ? "..." : ""}\n` : "") +
        `   时间：${e.timestamp} | 天气：${e.weather}`
    )
    .join("\n\n");

  const weathers = Array.from(new Set(events.map((e) => e.weather)));

  return `你是一位严肃的报纸编辑，负责编撰来自平行宇宙的每日日报。你的任务是将以下事件编排成一份报纸风格的日记。

---

刊号：${issue}
日期：${date}
维度编号：${dimension}

---

今日事件列表：

${eventList}

---

要求：
1. 用报纸汇编的风格撰写，语气严肃但内容荒诞。
2. 每个事件用 bullet point 列出，保留原始信息但加入报纸式的评述。
3. 顶部标注期号、日期、维度编号。
4. 底部添加「今日天气」板块，汇总当日天气信息（天气：${weathers.join("，")}）。
5. 整体呈现出一本正经地胡说八道的效果。
6. 不要使用 markdown 标记，直接输出纯文本。
7. 控制在 300-500 字之间。`;
}

function buildProsePrompt(events: Event[]): string {
  const eventList = events
    .map(
      (e) =>
        `- ${e.headline}（${e.subheadline}）\n` +
        (e.content ? `  详情：${e.content.slice(0, 200)}${e.content.length > 200 ? "..." : ""}\n` : "") +
        `  时间：${e.timestamp} | 心情：${e.mood} | 天气：${e.weather}`
    )
    .join("\n");

  const dimension = getDimensionLabel(events);

  return `你是一位温暖的散文作家，擅长用细腻的笔触记录日常生活中的奇妙瞬间。你的任务是用第一人称视角，将以下事件串联成一篇微型小说般的散文日记。

---

今日事件：

${eventList}

---

要求：
1. 用「我」的视角讲述，像在写日记或随笔。
2. 有起承转合的叙事结构，像一篇微型小说。
3. 语气温暖、感性，有故事感和画面感。
4. 将事件自然地串联成一个连贯的故事。
5. 结尾署名「来自维度 ${dimension} 的观察者」。
6. 不要使用 markdown 标记，直接输出纯文本。
7. 控制在 300-500 字之间。`;
}

function buildChroniclePrompt(events: Event[]): string {
  const first = events[0];
  const date = first ? formatDate(first.timestamp) : "日期未知";
  const dimension = getDimensionLabel(events);

  const archiveNumber = `PUA-${new Date().getFullYear()}-${String(
    Math.floor(Math.random() * 9000) + 1000
  )}`;

  const eventSections = events
    .map(
      (e, i) =>
        `【重大事件 ${i + 1}】${e.headline}\n` +
        `事件描述：${e.subheadline}\n` +
        (e.content ? `详细报告：${e.content.slice(0, 200)}${e.content.length > 200 ? "..." : ""}\n` : "") +
        `发生时间：${e.timestamp}\n` +
        `观测状态：${e.weather} | 情绪指数：${e.mood}`
    )
    .join("\n\n");

  return `你是平行宇宙科学院的首席档案员，负责记录和归档跨维度重大事件。你的任务是用官方、正式但内容离谱的语气，将以下事件编入绝密档案。

---

CLASSIFIED · 绝密

宇宙纪元日期：${date}
档案编号：${archiveNumber}
关联维度：${dimension}

---

${eventSections}

---

要求：
1. 用官方、正式的语气撰写，但内容本身要足够离谱和荒诞。
2. 每个事件作为「重大事件」章节，使用编号标题。
3. 顶部标注「CLASSIFIED · 绝密」、宇宙纪元日期、档案编号。
4. 使用「宇宙纪元」日期格式和「档案编号」。
5. 结尾添加「平行宇宙科学院」的一句名言（可自创，要荒诞）。
6. 不要使用 markdown 标记，直接输出纯文本。
7. 控制在 300-500 字之间。`;
}

const styleBuilders: Record<DiaryStyle, (events: Event[]) => string> = {
  newspaper: buildNewspaperPrompt,
  prose: buildProsePrompt,
  chronicle: buildChroniclePrompt,
};

export function getDiaryPrompt(events: Event[], style: DiaryStyle): string {
  const builder = styleBuilders[style];
  if (!builder) {
    throw new Error(`Unknown diary style: ${style}`);
  }
  return builder(events);
}

// ---------------------------------------------------------------------------
// Weekly report prompt
// ---------------------------------------------------------------------------

function getWeekDateRange(week: string): { start: string; end: string } {
  const [yearStr, weekStr] = week.split("-W");
  const year = parseInt(yearStr, 10);
  const weekNum = parseInt(weekStr, 10);

  const jan4 = new Date(year, 0, 4);
  const dayOfWeekJan4 = jan4.getDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);

  const start = new Date(week1Start);
  start.setDate(week1Start.getDate() + (weekNum - 1) * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, "0")}月${String(d.getDate()).padStart(2, "0")}日`;

  return { start: fmt(start), end: fmt(end) };
}

export function getWeeklyPrompt(diaries: DiaryEntry[], week: string): string {
  const { start, end } = getWeekDateRange(week);
  const year = parseInt(week.split("-W")[0], 10);
  const weekNum = parseInt(week.split("-W")[1], 10);

  // Build diary summaries
  const diarySummaries = diaries
    .map(
      (d, i) =>
        `【第${i + 1}篇 · ${d.date}】\n${d.content.slice(0, 500)}${d.content.length > 500 ? "..." : ""}`
    )
    .join("\n\n---\n\n");

  // Collect metadata
  const totalEntries = diaries.length;
  const styles = Array.from(new Set(diaries.map((d) => d.style ?? "newspaper")));

  return `你是一位资深的新闻杂志主编，负责编撰来自平行宇宙的每周综述。你的任务是将以下一周的日记汇总成一份杂志风格的周报。

---

刊名：PARALLEL UNIVERSE WEEKLY · 平行宇宙周报
期号：${year}年第${weekNum}周
覆盖时间：${start} — ${end}
维度编号：7-B
本周日记数量：${totalEntries} 篇
日记风格：${styles.join("、")}

---

本周日记内容：

${diarySummaries}

---

要求：

1. 用新闻杂志的风格撰写，语气正式但内容荒诞，像真正的《时代》或《纽约时报》周日版。
2. 必须包含以下板块：
   - 「本周概览」：用 bullet points 汇总本周关键数据（日记数量、最常见心情、关键词、天气等）。
   - 「本周大事记」：按日期（周一到周日）逐一列出每天的核心事件，每天 1-2 句话概括。
   - 「编辑点评」：以编辑视角点评本周的整体趋势、亮点和不足，要有洞察力。
3. 使用适当的 Markdown 格式（标题、列表、引用等），但不要过度。
4. 结尾添加「下期预告」板块，展望下周可能发生的事（可以荒诞）。
5. 结尾署名「平行宇宙日报编辑部」。
6. 整体控制在 600-1000 字之间。
7. 不要使用 emoji。`;
}
