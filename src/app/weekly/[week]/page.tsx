import WeeklyClient from "./weekly-client";

export function generateStaticParams() {
  return [{ week: "2026-W01" }];
}

export const dynamic = "force-static";

export default function WeeklyPage() {
  return <WeeklyClient />;
}
