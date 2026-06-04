import DiaryClient from "./diary-client";

export function generateStaticParams() {
  return [[]];
}

export const dynamic = "force-static";

export default function DiaryPage() {
  return <DiaryClient />;
}
