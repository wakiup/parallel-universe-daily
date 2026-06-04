// src/lib/newspapers.ts
// Client-side localStorage persistence for generated newspapers

export interface NewspaperData {
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

const STORAGE_KEY = "parallel-universe-newspapers";

export function loadNewspapers(): NewspaperData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNewspapers(newspapers: NewspaperData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newspapers));
}

export function addNewspaper(newspaper: NewspaperData): NewspaperData[] {
  const existing = loadNewspapers();
  const updated = [newspaper, ...existing];
  saveNewspapers(updated);
  return updated;
}

export function getNewspapersByDate(date: string): NewspaperData[] {
  return loadNewspapers().filter((n) => n.timestamp.startsWith(date));
}

export function deleteNewspaper(id: string): NewspaperData[] {
  const existing = loadNewspapers();
  const updated = existing.filter((n) => n.id !== id);
  saveNewspapers(updated);
  return updated;
}

export function getNewspapersByWeek(
  startDate: string,
  endDate: string
): NewspaperData[] {
  return loadNewspapers().filter((n) => {
    const d = n.timestamp.split(" ")[0];
    return d >= startDate && d <= endDate;
  });
}
