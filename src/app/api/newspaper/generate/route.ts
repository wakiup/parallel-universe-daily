// src/app/api/newspaper/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

export interface NewspaperEntry {
  id: string;
  headline: string;
  subheadline: string;
  content: string;
  timestamp: string;
  weather: string;
  mood: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
}

const MOODS = ["极佳", "兴奋", "困惑", "惊讶", "平静", "好奇", "无奈"];
const WEATHERS = [
  "量子雨转薛定谔的晴",
  "反物质风暴",
  "猫毛纷飞",
  "暗物质雾",
  "时空涟漪",
  "概率云",
  "星尘微风",
  "薛定谔的晴",
];
const DIMENSIONS = ["7-B", "13-Ω", "42-Ψ", "9-Φ", "5-Δ", "11-Λ"];
const COLORS: Array<"quantum" | "plasma" | "pink"> = [
  "quantum",
  "plasma",
  "pink",
];


export async function POST(
  request: NextRequest
): Promise<NextResponse<{ newspaper: NewspaperEntry } | { error: string }>> {
  try {
    const body = await request.json();
    const input = body.input as string;
    const config = body.config as { apiBaseUrl?: string; apiModel?: string; apiKey?: string } | undefined;

    if (!input?.trim()) {
      return NextResponse.json(
        { error: "Missing required field: input" },
        { status: 400 }
      );
    }

    const client = config?.apiKey && config?.apiBaseUrl
      ? new OpenAI({ apiKey: config.apiKey, baseURL: config.apiBaseUrl })
      : null;

    let newspaper: NewspaperEntry;

    if (client) {
      const completion = await client.chat.completions.create({
        model: config!.apiModel!,
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
      // Reasoning models (kimi-k2.6, o1, etc.) may put output in reasoning_content
      if (!rawText) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extra: any = msg;
        if (typeof extra?.reasoning_content === "string") {
          const jsonMatch = extra.reasoning_content.match(/\{[\s\S]*\}/);
          if (jsonMatch) rawText = jsonMatch[0];
        }
      }

      // Strip markdown code blocks if present (```json ... ```)
      const jsonStr = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

      try {
        const parsed = JSON.parse(jsonStr);
        const now = new Date();
        newspaper = {
          id: uuidv4(),
          headline: parsed.headline || input,
          subheadline: parsed.subheadline || "平行宇宙编辑部正在调查中",
          content: parsed.content || "平行宇宙编辑部正在赶稿中，完整内容即将呈现。",
          timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
          weather: parsed.weather || WEATHERS[0],
          mood: parsed.mood || MOODS[0],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          dimension: parsed.dimension || DIMENSIONS[0],
        };
      } catch {
        return NextResponse.json(
          { error: "AI 返回的内容无法解析，请重试" },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "未配置 API Key，请在设置中配置" },
        { status: 400 }
      );
    }

    return NextResponse.json({ newspaper });
  } catch (error) {
    console.error("Newspaper generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
