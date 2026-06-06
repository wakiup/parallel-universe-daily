import type { Metadata } from "next";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "4K 图片预览 · 平行宇宙日报",
};

export function generateStaticParams() {
  // Gallery items use UUIDs from localStorage — placeholder satisfies static export requirement.
  // Client-side code reads the actual ID from useParams() and loads from localStorage.
  return [{ id: "_stub" }];
}

export const dynamic = "force-static";

export default function GalleryPreviewPage() {
  return <PreviewClient />;
}
