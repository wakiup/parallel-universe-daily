import DiaryClient from "./diary-client";

export function generateStaticParams() {
  return [{ date: "2026-01-01" }];
}

export const dynamic = "force-static";

export default function DiaryPage() {
  return <DiaryClient />;
}
