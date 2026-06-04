// src/app/weekly/page.tsx
// Renders the current week directly (no redirect - incompatible with static export)

import WeeklyClient from "./[[...week]]/weekly-client";

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
  // We can't use redirect() with static export
  // The WeeklyClient reads the week from URL params via useParams
  // For /weekly (no week param), it defaults to current week
  return <WeeklyClient />;
}
