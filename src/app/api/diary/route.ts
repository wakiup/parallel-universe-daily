// src/app/api/diary/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getDiaryByDate, saveDiary } from "@/lib/storage";
import type { DiaryEntry } from "@/lib/types";

interface DiaryQueryResponse {
  diary: DiaryEntry | null;
}

interface DiarySaveResponse {
  diary: DiaryEntry;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DiaryQueryResponse | ErrorResponse>> {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Missing required query parameter: date" },
      { status: 400 }
    );
  }

  const diary = await getDiaryByDate(date);
  return NextResponse.json({ diary });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<DiarySaveResponse | ErrorResponse>> {
  try {
    const diary: DiaryEntry = await request.json();

    if (!diary.id || !diary.date || !diary.content) {
      return NextResponse.json(
        { error: "Missing required fields: id, date, content" },
        { status: 400 }
      );
    }

    await saveDiary(diary);
    return NextResponse.json({ diary });
  } catch (error) {
    console.error("Diary save error:", error);
    return NextResponse.json(
      { error: "Internal server error while saving diary" },
      { status: 500 }
    );
  }
}
