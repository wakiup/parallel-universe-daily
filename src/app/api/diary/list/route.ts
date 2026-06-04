// src/app/api/diary/list/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getDiariesByMonth } from "@/lib/storage";
import type { DiaryEntry } from "@/lib/types";

interface DiaryListResponse {
  diaries: DiaryEntry[];
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DiaryListResponse | ErrorResponse>> {
  const yearParam = request.nextUrl.searchParams.get("year");
  const monthParam = request.nextUrl.searchParams.get("month");

  if (!yearParam || !monthParam) {
    return NextResponse.json(
      { error: "Missing required query parameters: year, month" },
      { status: 400 }
    );
  }

  const year = parseInt(yearParam, 10);
  const month = parseInt(monthParam, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Invalid year or month parameter" },
      { status: 400 }
    );
  }

  try {
    const diaries = await getDiariesByMonth(year, month);
    return NextResponse.json({ diaries });
  } catch (error) {
    console.error("Diary list error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching diaries" },
      { status: 500 }
    );
  }
}
