import WeeklyClient from "./weekly-client";

export function generateStaticParams() {
  return [[]];
}

export const dynamic = "force-static";

export default function WeeklyPage() {
  return <WeeklyClient />;
}
