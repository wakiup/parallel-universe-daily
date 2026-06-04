// src/app/api/diary/process/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ProcessMode, DiaryStyle } from "@/lib/types";

interface ProcessRequest {
  content: string;
  processMode: ProcessMode;
  style: DiaryStyle;
}

interface ProcessResponse {
  processed: string;
}

// ---------------------------------------------------------------------------
// Mock processing functions
// ---------------------------------------------------------------------------

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
  const tonePart = mockToneProcess(content);
  return `${tonePart}

（注：此事件已通过平行宇宙验证委员会认证）`;
}

function mockProcess(content: string, processMode: ProcessMode): string {
  switch (processMode) {
    case "tone":
      return mockToneProcess(content);
    case "absurd":
      return mockAbsurdProcess(content);
    case "both":
      return mockBothProcess(content);
    case "none":
      return content;
  }
}

// ---------------------------------------------------------------------------
// AI processing prompts
// ---------------------------------------------------------------------------

function getProcessPrompt(
  content: string,
  processMode: ProcessMode,
  style: DiaryStyle
): string {
  const styleLabel =
    style === "newspaper"
      ? "报纸新闻"
      : style === "prose"
        ? "散文随笔"
        : "绝密档案";

  switch (processMode) {
    case "tone":
      return `你是平行宇宙日报的编辑，擅长把普通文字变成荒诞有趣的报纸播报。

---
原文内容：
${content}
---

写作要求：
- 原文的每一个事实、细节、动作都必须保留，不得删改或篡改
- 在这个基础上用报纸播报语气重写，加入夸张比喻、离谱旁白、荒诞的后续
- 风格要荒诞有趣，让读者看了会笑，但核心事件不能改
- 输出润色后的内容，不要添加额外说明`;

    case "absurd":
      return `你是平行宇宙荒诞文学大师，擅长把普通事件变得荒诞离奇又好笑。

---
原文内容：
${content}
---

写作要求：
- 原文的每一个事实、细节、动作都必须保留，不得删改或篡改
- 在这个基础上尽情荒诞：离谱的比喻、一本正经的胡说八道、荒诞的后续发展
- 风格要像以前一样荒诞有趣，让读者看了会笑
- 结尾添加「（注：此事件已通过平行宇宙验证委员会认证）」
- 输出润色后的内容，不要添加额外说明`;

    case "both":
      return `你是集报纸编辑和荒诞文学大师于一身的平行宇宙日报编辑。请同时进行语气转换和荒诞润色。

---
原文内容：
${content}
---

写作要求：
1. 原文的每一个事实、细节、动作都必须保留，不得删改或篡改
2. 同时使用报纸播报语气和荒诞文学风格，夸张比喻、离谱旁白、荒诞后续全上
3. 风格要荒诞有趣，让读者看了会笑，但核心事件不能改
4. 结尾添加「（注：此事件已通过平行宇宙验证委员会认证）」
5. 输出润色后的内容，不要添加额外说明`;

    default:
      return content;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProcessResponse | { error: string }>> {
  try {
    const body: ProcessRequest & { config?: { apiBaseUrl?: string; apiModel?: string; apiKey?: string } } = await request.json();
    const config = body.config;

    const client = config?.apiKey && config?.apiBaseUrl
      ? new OpenAI({ apiKey: config.apiKey, baseURL: config.apiBaseUrl })
      : null;

    // Validate required fields
    if (!body.content || !body.processMode) {
      return NextResponse.json(
        { error: "Missing required fields: content, processMode" },
        { status: 400 }
      );
    }

    // Validate processMode
    const validModes: ProcessMode[] = ["tone", "absurd", "both", "none"];
    if (!validModes.includes(body.processMode)) {
      return NextResponse.json(
        { error: `Invalid processMode. Must be one of: ${validModes.join(", ")}` },
        { status: 400 }
      );
    }

    // "none" mode — return original content as-is
    if (body.processMode === "none") {
      return NextResponse.json({ processed: body.content });
    }

    const style = body.style ?? "newspaper";

    let processed: string;

    if (client) {
      // Real API mode
      const prompt = getProcessPrompt(body.content, body.processMode, style);
      const completion = await client.chat.completions.create({
        model: config!.apiModel!,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      processed = completion.choices[0]?.message?.content || body.content;
    } else {
      // Mock mode — no API key
      processed = mockProcess(body.content, body.processMode);
    }

    return NextResponse.json({ processed });
  } catch (error) {
    console.error("Diary processing error:", error);

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
      { error: "Internal server error during diary processing" },
      { status: 500 }
    );
  }
}
