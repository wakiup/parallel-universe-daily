// src/lib/gallery.ts
import type { DiaryStyle, ProcessMode } from "./types";

export interface GalleryItem {
  id: string;
  type: "diary" | "weekly";
  title: string;
  content: string;
  rawContent?: string;
  style?: DiaryStyle;
  processMode?: ProcessMode;
  date: string;
  createdAt: number;
}

const GALLERY_KEY = "parallel-universe-gallery";

export function loadGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(GALLERY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGalleryItems(items: GalleryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

export function addToGallery(
  item: Omit<GalleryItem, "id" | "createdAt">
): GalleryItem {
  const newItem: GalleryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const items = loadGalleryItems();
  items.unshift(newItem);
  saveGalleryItems(items);
  return newItem;
}

export function removeFromGallery(id: string): void {
  const items = loadGalleryItems().filter((item) => item.id !== id);
  saveGalleryItems(items);
}

export function clearGallery(): void {
  saveGalleryItems([]);
}
