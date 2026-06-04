// src/app/weekly/page.tsx
// Redirects /weekly to the current week

import { redirect } from "next/navigation";

function getCurrentWeek(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfWeekJan4 = jan4.getDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - dayOfWeekJan4 + 1);

  const diff = now.getTime() - week1Start.getTime();
  const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export default function WeeklyIndexPage() {
  redirect(`/weekly/${getCurrentWeek()}`);
}
