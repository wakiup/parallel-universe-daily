// src/lib/storage.ts
// Local JSON file-based storage for diary entries.
// Files are stored under <project-root>/data/diaries/YYYY-MM-DD.json

import { promises as fs } from "fs";
import path from "path";
import type { DiaryEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "diaries");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function diaryFilePath(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: "${date}". Expected YYYY-MM-DD.`);
  }
  return path.join(DATA_DIR, `${date}.json`);
}

/**
 * Get a diary entry by its date string (YYYY-MM-DD).
 * Returns null if no file exists for that date.
 */
export async function getDiaryByDate(
  date: string
): Promise<DiaryEntry | null> {
  const filePath = diaryFilePath(date);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as DiaryEntry;
  } catch (err: unknown) {
    // File not found is expected — treat as null.
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Save (overwrite) a diary entry.
 * The file is named after the entry's date.
 */
export async function saveDiary(diary: DiaryEntry): Promise<void> {
  await ensureDataDir();
  const filePath = diaryFilePath(diary.date);
  await fs.writeFile(filePath, JSON.stringify(diary, null, 2), "utf-8");
}

/**
 * Get all diary entries for a given year and month.
 * Scans the data directory for matching YYYY-MM-DD.json files.
 */
export async function getDiariesByMonth(
  year: number,
  month: number
): Promise<DiaryEntry[]> {
  await ensureDataDir();

  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const entries: DiaryEntry[] = [];

  let files: string[];
  try {
    files = await fs.readdir(DATA_DIR);
  } catch {
    return [];
  }

  for (const file of files) {
    if (!file.startsWith(prefix) || !file.endsWith(".json")) continue;

    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    entries.push(JSON.parse(raw) as DiaryEntry);
  }

  // Sort by date ascending.
  entries.sort((a, b) => a.date.localeCompare(b.date));
  return entries;
}
