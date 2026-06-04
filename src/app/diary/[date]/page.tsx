import DiaryClient from "./diary-client";

export function generateStaticParams() {
  const params: { date: string }[] = [];
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(2026, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      params.push({
        date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
    }
  }
  return params;
}

export const dynamic = "force-static";

export default function DiaryPage() {
  return <DiaryClient />;
}
