// src/lib/types.ts

export type DiaryStyle = "newspaper" | "prose" | "chronicle";
export type ProcessMode = "tone" | "absurd" | "both" | "none";

export interface Event {
  id: string;
  headline: string;
  subheadline: string;
  content?: string;
  timestamp: string;
  weather: string;
  mood: string;
  color: "quantum" | "plasma" | "pink";
  dimension: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  type: "ai" | "handwritten";
  content: string;
  style?: DiaryStyle;
  processMode?: ProcessMode;
  rawContent?: string;
  eventIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiaryGenerateRequest {
  date: string;
  style: DiaryStyle;
  events: Event[];
}

export interface DiaryGenerateResponse {
  diary: DiaryEntry;
}
