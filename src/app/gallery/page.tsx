import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "图片画廊 · 平行宇宙日报",
};

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryClient />
    </Suspense>
  );
}
