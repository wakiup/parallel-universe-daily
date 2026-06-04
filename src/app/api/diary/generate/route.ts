// src/app/api/diary/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import type {
  DiaryGenerateRequest,
  DiaryGenerateResponse,
  DiaryEntry,
} from "@/lib/types";
import { saveDiary } from "@/lib/storage";
import { getDiaryPrompt } from "@/lib/prompts";
import type { DiaryStyle } from "@/lib/types";

function generateMockDiary(date: string, style: DiaryStyle, events: { headline: string; content?: string; timestamp: string; mood: string; weather: string; dimension: string }[]): string {
  const formattedDate = date.replace(/-/g, ".");
  const eventList = events.map((e, i) => {
    const time = e.timestamp.split(" ")[1];
    return `${i + 1}. [${time}] ${e.headline}`;
  }).join("\n");

  // Helper to extract a short snippet from content
  const snippet = (e: typeof events[0], maxLen = 80) => {
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

  // prose style
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

export async function POST(
  request: NextRequest
): Promise<NextResponse<DiaryGenerateResponse | { error: string }>> {
  try {
    const body: DiaryGenerateRequest & { config?: { apiBaseUrl?: string; apiModel?: string; apiKey?: string } } = await request.json();
    const config = body.config;

    const client = config?.apiKey && config?.apiBaseUrl
      ? new OpenAI({ apiKey: config.apiKey, baseURL: config.apiBaseUrl })
      : null;

    // Validate required fields
    if (!body.date || !body.style || !body.events) {
      return NextResponse.json(
        { error: "Missing required fields: date, style, events" },
        { status: 400 }
      );
    }

    // Validate events array is not empty
    if (!Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: "Events array cannot be empty" },
        { status: 400 }
      );
    }

    // Generate diary content
    let content: string;

    if (client) {
      // Real API mode
      const prompt = getDiaryPrompt(body.events, body.style);
      const completion = await client.chat.completions.create({
        model: config!.apiModel!,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });
      content = completion.choices[0]?.message?.content || "Error: Unable to generate diary content";
    } else {
      // Mock mode - no API key
      content = generateMockDiary(body.date, body.style, body.events);
    }

    // Create diary entry
    const diary: DiaryEntry = {
      id: uuidv4(),
      date: body.date,
      type: "ai",
      content,
      style: body.style,
      eventIds: body.events.map((e) => e.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage
    await saveDiary(diary);

    return NextResponse.json({ diary });
  } catch (error) {
    console.error("Diary generation error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message?.includes("auth")) {
        return NextResponse.json(
          { error: "API 配置无效，请检查设置中的 API 地址和密钥" },
          { status: 500 }
        );
      }
      if (error.message?.includes("rate")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error during diary generation" },
      { status: 500 }
    );
  }
}
