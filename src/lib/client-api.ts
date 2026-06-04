// src/lib/client-api.ts
// Client-side API functions - replaces server-side API routes for static export

import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import type { DiaryEntry, DiaryStyle, ProcessMode, Event } from "./types";
import { getDiaryPrompt, getWeeklyPrompt } from "./prompts";
import { getApiConfig } from "./api-config";

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const DIARY_KEY = "parallel-universe-diaries";

function loadAllDiaries(): DiaryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DIARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllDiaries(diaries: DiaryEntry[]): void {
  localStorage.setItem(DIARY_KEY, JSON.stringify(diaries));
}

export async function getDiaryByDate(date: string): Promise<DiaryEntry | null> {
  const diaries = loadAllDiaries();
  return diaries.find((d) => d.date === date) ?? null;
}

export async function saveDiary(diary: DiaryEntry): Promise<void> {
  const diaries = loadAllDiaries();
  const idx = diaries.findIndex((d) => d.date === diary.date);
  if (idx >= 0) {
    diaries[idx] = diary;
  } else {
    diaries.push(diary);
  }
  saveAllDiaries(diaries);
}

export async function getDiariesByMonth(year: number, month: number): Promise<DiaryEntry[]> {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return loadAllDiaries()
    .filter((d) => d.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function deleteDiary(date: string): Promise<void> {
  const diaries = loadAllDiaries();
  const updated = diaries.filter((d) => d.date !== date);
  saveAllDiaries(updated);
}

// ---------------------------------------------------------------------------
// OpenAI client helper
// ---------------------------------------------------------------------------

function proxyFetch(url: string, init?: RequestInit): Promise<Response> {
  const body = init?.body ? JSON.parse(init.body as string) : undefined;
  const rawHeaders = init?.headers;
  const headers: Record<string, string> = {};
  if (rawHeaders instanceof Headers) {
    rawHeaders.forEach((v, k) => { headers[k] = v; });
  } else if (rawHeaders && typeof rawHeaders === "object") {
    Object.entries(rawHeaders).forEach(([k, v]) => { headers[k] = String(v); });
  }
  return fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, headers, body }),
  });
}

function getClient() {
  const config = getApiConfig();
  if (!config) return null;
  if (!config.apiKey) return null;
  if (!config.apiBaseUrl) return null;
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.apiBaseUrl,
    dangerouslyAllowBrowser: true,
    fetch: proxyFetch,
  });
}

function getClientError(): string | null {
  const config = getApiConfig();
  if (!config) return "请先在设置页面配置 API";
  if (!config.apiKey) return "请在设置页面填写 API Key";
  if (!config.apiBaseUrl) return "请在设置页面选择服务商或填写 API 地址";
  return null;
}

function getModel(): string {
  const config = getApiConfig();
  return config?.apiModel || "gpt-3.5-turbo";
}

// ---------------------------------------------------------------------------
// Mock generators (fallback when no API key)
// ---------------------------------------------------------------------------

function generateMockDiary(date: string, style: DiaryStyle, events: Event[]): string {
  const formattedDate = date.replace(/-/g, ".");
  const eventList = events.map((e, i) => {
    const time = e.timestamp.split(" ")[1];
    return `${i + 1}. [${time}] ${e.headline}`;
  }).join("\n");

  const snippet = (e: Event, maxLen = 80) => {
    if (!e?.content) return e?.headline || "";
    const text = e.content.replace(/\n/g, " ").slice(0, maxLen);
    return text.length < (e.content || "").replace(/\n/g, " ").length ? text + "..." : text;
  };

  if (style === "chronicle") {
    return `CLASSIFIED · 绝密

# 平行宇宙编年史 · 日记卷

宇宙纪元 ${formattedDate} · 档案编号 PUD-${date.split("-").slice(1).join("")}

---

## 【重大事件一】${events[0]?.headline || "未知事件"}

本宇宙标准时间 ${events[0]?.timestamp?.split(" ")[1] || "00:00"}，一起重大异常事件被记录在案。${snippet(events[0])}。全球平行宇宙管理局已将此列为 S 级事件，并紧急召回所有具有自主意识的设备。

## 【重大事件二】${events[1]?.headline || "未知事件"}

正午时分，另一起突破维度屏障的事件被记录。${snippet(events[1])}。心理学家警告：相关实体可能存在存在主义危机，建议尽快安排跨维度心理干预。

## 【重大事件三】${events[2]?.headline || "未知事件"}

傍晚时分，第三起重大事件打破了本宇宙的平静。${snippet(events[2])}。多维观察员已就此事展开紧急磋商。

---

> 「历史是由猫和咖啡机共同书写的」—— 平行宇宙科学院`;
  }

  if (style === "newspaper") {
    return `PARALLEL UNIVERSE DAILY

# 今 日 大 事 记

${formattedDate} · 维度 7-B · 第 ${Math.floor(Date.now() / 86400000) % 10000} 期

---

${eventList}

---

## 详细报道

${events[0]?.content ? `### ${events[0].headline}\n\n${events[0].content}` : ""}

${events[1]?.content ? `### ${events[1].headline}\n\n${events[1].content}` : ""}

${events[2]?.content ? `### ${events[2].headline}\n\n${events[2].content}` : ""}

---

## 今日天气

${events[0]?.weather || "量子雨转薛定谔的晴"}，局部地区有${events[1]?.weather || "反物质风暴"}，傍晚转${events[2]?.weather || "猫毛纷飞"}

---

> 编辑部提醒：请勿与平行宇宙的自己通信，以免造成时间线混乱。`;
  }

  const story1 = events[0]?.content
    ? events[0].content.split("\n").slice(0, 2).join(" ").replace(/[。！？]/g, "$& ").slice(0, 120)
    : events[0]?.headline || "一些奇妙的事情发生了";
  const story2 = events[1]?.content
    ? events[1].content.split("\n").slice(0, 2).join(" ").replace(/[。！？]/g, "$& ").slice(0, 120)
    : events[1]?.headline || "又一件不可思议的事情发生了";
  const story3 = events[2]?.content
    ? events[2].content.split("\n").slice(0, 2).join(" ").replace(/[。！？]/g, "$& ").slice(0, 120)
    : events[2]?.headline || "今天的最后一个奇迹降临了";

  return `# 一个普通又不普通的${["周日","周一","周二","周三","周四","周五","周六"][new Date(date).getDay()]}

${formattedDate} · 平行宇宙日记

---

今天的早晨从一个不寻常的发现开始。${story1}，这让我意识到，我们所处的世界远比想象中更加荒诞。

午休时分，${story2}。我开始怀疑，是不是每个平行宇宙都有一个我在经历着同样的困惑。

傍晚，${story3}。我想，也许这就是生活的意义——在荒诞中寻找乐趣，在混乱中发现秩序。

---

> 来自维度 ${events[0]?.dimension || "7-B"} 的观察者`;
}

function mockToneProcess(content: string): string {
  return `【平行宇宙日报编辑部润色】

${content}

—— 由平行宇宙日报编辑部精心润色`;
}

function mockAbsurdProcess(content: string): string {
  return `${content}

（注：此事件已通过平行宇宙验证委员会认证）`;
}

function mockBothProcess(content: string): string {
  return `${mockToneProcess(content)}

（注：此事件已通过平行宇宙验证委员会认证）`;
}

function mockProcess(content: string, processMode: ProcessMode): string {
  switch (processMode) {
    case "tone": return mockToneProcess(content);
    case "absurd": return mockAbsurdProcess(content);
    case "both": return mockBothProcess(content);
    default: return content;
  }
}

// ---------------------------------------------------------------------------
// AI-powered generators
// ---------------------------------------------------------------------------

export async function generateDiary(
  date: string,
  style: DiaryStyle,
  events: Event[]
): Promise<DiaryEntry> {
  const client = getClient();

  let content: string;
  if (client) {
    const prompt = getDiaryPrompt(events, style);
    const completion = await client.chat.completions.create({
      model: getModel(),
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    content = completion.choices[0]?.message?.content || "Error: Unable to generate";
  } else {
    content = generateMockDiary(date, style, events);
  }

  const diary: DiaryEntry = {
    id: uuidv4(),
    date,
    type: "ai",
    content,
    style,
    eventIds: events.map((e) => e.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveDiary(diary);
  return diary;
}

export async function processContent(
  content: string,
  processMode: ProcessMode,
  style: DiaryStyle
): Promise<string> {
  if (processMode === "none") return content;

  const client = getClient();
  if (!client) return mockProcess(content, processMode);

  const styleLabel = style === "newspaper" ? "报纸新闻" : style === "prose" ? "散文随笔" : "绝密档案";

  const prompts: Record<string, string> = {
    tone: `你是平行宇宙日报的编辑，擅长把普通文字变成荒诞有趣的报纸播报。

---
原文内容：
${content}
---

写作要求：
- 原文的每一个事实、细节、动作都必须保留，不得删改或篡改
- 在这个基础上用报纸播报语气重写，加入夸张比喻、离谱旁白、荒诞的后续
- 风格要荒诞有趣，让读者看了会笑，但核心事件不能改
- 输出润色后的内容，不要添加额外说明`,

    absurd: `你是平行宇宙荒诞文学大师，擅长把普通事件变得荒诞离奇又好笑。

---
原文内容：
${content}
---

写作要求：
- 原文的每一个事实、细节、动作都必须保留，不得删改或篡改
- 在这个基础上尽情荒诞：离谱的比喻、一本正经的胡说八道、荒诞的后续发展
- 风格要像以前一样荒诞有趣，让读者看了会笑
- 结尾添加「（注：此事件已通过平行宇宙验证委员会认证）」
- 输出润色后的内容，不要添加额外说明`,

    both: `你是集报纸编辑和荒诞文学大师于一身的平行宇宙日报编辑。请同时进行语气转换和荒诞润色。

---
原文内容：
${content}
---

写作要求：
1. 原文的每一个事实、细节、动作都必须保留，不得删改或篡改
2. 同时使用报纸播报语气和荒诞文学风格，夸张比喻、离谱旁白、荒诞后续全上
3. 风格要荒诞有趣，让读者看了会笑，但核心事件不能改
4. 结尾添加「（注：此事件已通过平行宇宙验证委员会认证）」
5. 输出润色后的内容，不要添加额外说明`,
  };

  const completion = await client.chat.completions.create({
    model: getModel(),
    max_tokens: 1024,
    messages: [{ role: "user", content: prompts[processMode] || content }],
  });

  return completion.choices[0]?.message?.content || content;
}

export async function generateNewspaper(
  input: string
): Promise<{
  id: string;
  headline: string;
  subheadline: string;
  content: string;
  timestamp: string;
  weather: string;
  mood: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
}> {
  const client = getClient();
  const MOODS = ["极佳", "兴奋", "困惑", "惊讶", "平静", "好奇", "无奈"];
  const WEATHERS = ["量子雨转薛定谔的晴", "反物质风暴", "猫毛纷飞", "暗物质雾", "时空涟漪", "概率云", "星尘微风"];
  const DIMENSIONS = ["7-B", "13-Ω", "42-Ψ", "9-Φ", "5-Δ", "11-Λ"];
  const COLORS: Array<"quantum" | "plasma" | "pink"> = ["quantum", "plasma", "pink"];

  if (!client) {
    throw new Error("未配置 API Key，请在设置中配置");
  }

  const completion = await client.chat.completions.create({
    model: getModel(),
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `你是平行宇宙报纸编辑，风格荒诞、夸张、一本正经地胡说八道。用户记录了：「${input}」

写作要求：
- 用户记录的事件是核心素材，所有关键事实必须保留，不能偷换、删减或篡改
- 在这个基础上尽情发挥：夸张的比喻、离谱的专家引言、荒诞的后续发展、平行宇宙风格的旁白
- 风格要像以前一样荒诞有趣，让读者看了会笑，但笑的是表达方式而不是因为内容被改了

直接输出JSON，不要解释，不要markdown代码块：
{"headline":"荒诞头条(15字内)","subheadline":"更离谱副标题(30字内)","content":"200字荒诞新闻正文，保留用户事件核心但写得荒诞好笑，报纸风格，用\\n换行","weather":"不存在的天气现象","mood":"极佳/兴奋/困惑/惊讶/平静/好奇/无奈选一","dimension":"如7-B"}`,
      },
    ],
  });

  const msg = completion.choices[0]?.message;
  let rawText = msg?.content || "";
  if (!rawText) {
    const extra = msg as unknown as Record<string, unknown>;
    if (typeof extra?.reasoning_content === "string") {
      const jsonMatch = (extra.reasoning_content as string).match(/\{[\s\S]*\}/);
      if (jsonMatch) rawText = jsonMatch[0];
    }
  }

  const jsonStr = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const parsed = JSON.parse(jsonStr);
  const now = new Date();

  return {
    id: uuidv4(),
    headline: parsed.headline || input,
    subheadline: parsed.subheadline || "平行宇宙编辑部正在调查中",
    content: parsed.content || "平行宇宙编辑部正在赶稿中",
    timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    weather: parsed.weather || WEATHERS[0],
    mood: parsed.mood || MOODS[0],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    dimension: parsed.dimension || DIMENSIONS[0],
  };
}

export async function generateWeeklyReport(week: string): Promise<Record<string, unknown>> {
  const client = getClient();
  if (!client) throw new Error("未配置 API Key，请在设置中配置");

  // Get week date range
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

  // Collect diaries
  const monthsToFetch = new Set<string>();
  const tempDate = new Date(start);
  while (tempDate <= end) {
    monthsToFetch.add(`${tempDate.getFullYear()}-${tempDate.getMonth() + 1}`);
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const allDiaries: DiaryEntry[] = [];
  for (const monthKey of monthsToFetch) {
    const [y, m] = monthKey.split("-").map(Number);
    const diaries = await getDiariesByMonth(y, m);
    allDiaries.push(...diaries);
  }

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];
  const weekDiaries = allDiaries.filter((d) => d.date >= startStr && d.date <= endStr);

  if (weekDiaries.length === 0) {
    throw new Error("本周没有日记数据，无法生成周报");
  }

  const prompt = getWeeklyPrompt(weekDiaries, week);
  const completion = await client.chat.completions.create({
    model: getModel(),
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const msg = completion.choices[0]?.message;
  let rawText = msg?.content || "";
  if (!rawText) {
    const extra = msg as unknown as Record<string, unknown>;
    if (typeof extra?.reasoning_content === "string") {
      const jsonMatch = (extra.reasoning_content as string).match(/\{[\s\S]*\}/);
      if (jsonMatch) rawText = jsonMatch[0];
    }
  }

  const jsonStr = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(jsonStr);
}
