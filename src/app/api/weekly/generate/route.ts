// src/app/api/weekly/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getWeeklyPrompt } from "@/lib/prompts";
import { getDiariesByMonth } from "@/lib/storage";
import type { DiaryEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeeklyHighlight {
  id: string;
  headline: string;
  subheadline: string;
  day: string;
  mood: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
}

export interface WeeklyDailyEntry {
  date: string;
  dayLabel: string;
  headline: string;
  subheadline: string;
  mood: string;
  weather: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
  eventCount: number;
}

export interface WeeklyStats {
  totalEvents: number;
  mostCommonMood: string;
  mostVisitedDimension: string;
  activeDays: number;
  dimensionsVisited: number;
}

export interface WeeklyReport {
  week: string;
  title: string;
  summary: string;
  highlights: WeeklyHighlight[];
  dailyEntries: WeeklyDailyEntry[];
  stats: WeeklyStats;
  generatedAt: string;
}

export interface WeeklyGenerateRequest {
  week: string;
}

// ---------------------------------------------------------------------------
// Week calculation helpers
// ---------------------------------------------------------------------------

function getWeekDateRange(week: string): { start: Date; end: Date } {
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

  return { start, end };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ report: WeeklyReport } | { error: string }>> {
  try {
    const body: WeeklyGenerateRequest & { config?: { apiBaseUrl?: string; apiModel?: string; apiKey?: string } } = await request.json();
    const config = body.config;

    const client = config?.apiKey && config?.apiBaseUrl
      ? new OpenAI({ apiKey: config.apiKey, baseURL: config.apiBaseUrl })
      : null;

    if (!body.week) {
      return NextResponse.json(
        { error: "Missing required field: week" },
        { status: 400 }
      );
    }

    // Simulate generation delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    let report: WeeklyReport;

    if (client) {
      // Real AI mode: fetch diaries for the week and generate with Claude
      const { start, end } = getWeekDateRange(body.week);

      // Collect diaries from relevant months
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

      // Filter diaries to only those within the week's date range
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      const weekDiaries = allDiaries.filter(
        (d) => d.date >= startStr && d.date <= endStr
      );

      // Generate with AI if we have diaries
      if (weekDiaries.length > 0) {
        const prompt = getWeeklyPrompt(weekDiaries, body.week);
        const completion = await client.chat.completions.create({
          model: config!.apiModel!,
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        });

        const msg = completion.choices[0]?.message;
        let rawText = msg?.content || "";
        // Reasoning models may put output in reasoning_content
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
          report = {
            week: body.week,
            title: parsed.title || "PARALLEL UNIVERSE WEEKLY",
            summary: parsed.summary || "",
            highlights: Array.isArray(parsed.highlights)
              ? parsed.highlights.map((h: Record<string, string>, i: number) => ({
                  id: h.id || `hl-${i + 1}`,
                  headline: h.headline || "",
                  subheadline: h.subheadline || "",
                  day: h.day || "",
                  mood: h.mood || "未知",
                  color: (["quantum", "plasma", "pink"] as const).includes(h.color as "quantum" | "plasma" | "pink")
                    ? (h.color as "quantum" | "plasma" | "pink")
                    : (["quantum", "plasma", "pink"] as const)[i % 3],
                  dimension: h.dimension || "7-B",
                }))
              : [],
            dailyEntries: Array.isArray(parsed.dailyEntries)
              ? parsed.dailyEntries.map((d: Record<string, string | number>) => ({
                  date: String(d.date || ""),
                  dayLabel: String(d.dayLabel || ""),
                  headline: String(d.headline || ""),
                  subheadline: String(d.subheadline || ""),
                  mood: String(d.mood || "未知"),
                  weather: String(d.weather || "未知"),
                  color: (["quantum", "plasma", "pink"] as const).includes(d.color as "quantum" | "plasma" | "pink")
                    ? (d.color as "quantum" | "plasma" | "pink")
                    : "quantum" as const,
                  dimension: String(d.dimension || "7-B"),
                  eventCount: typeof d.eventCount === "number" ? d.eventCount : 0,
                }))
              : weekDiaries.map((d) => ({
                  date: d.date,
                  dayLabel: ["周日","周一","周二","周三","周四","周五","周六"][new Date(d.date + "T00:00:00").getDay()],
                  headline: d.content.slice(0, 50),
                  subheadline: d.content.slice(50, 120),
                  mood: "未知",
                  weather: "未知",
                  color: "quantum" as const,
                  dimension: "7-B",
                  eventCount: d.eventIds.length,
                })),
            stats: parsed.stats || {
              totalEvents: weekDiaries.reduce((sum, d) => sum + d.eventIds.length, 0),
              mostCommonMood: "未知",
              mostVisitedDimension: "7-B",
              activeDays: weekDiaries.length,
              dimensionsVisited: 1,
            },
            generatedAt: new Date().toISOString(),
          };
        } catch {
          return NextResponse.json(
            { error: "AI 返回的内容无法解析，请重试" },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "本周没有日记数据，无法生成周报" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "未配置 API Key，请在设置中配置" },
        { status: 400 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Weekly report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during weekly report generation" },
      { status: 500 }
    );
  }
}
