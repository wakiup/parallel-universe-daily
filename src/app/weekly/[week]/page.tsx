import WeeklyClient from "./weekly-client";

export function generateStaticParams() {
  const params: { week: string }[] = [];
  for (let w = 1; w <= 52; w++) {
    params.push({ week: `2026-W${String(w).padStart(2, "0")}` });
  }
  return params;
}

export const dynamic = "force-static";

export default function WeeklyPage() {
  return <WeeklyClient />;
}
