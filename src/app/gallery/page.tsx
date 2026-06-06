import type { Metadata } from "next";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "图片画廊 · 平行宇宙日报",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
