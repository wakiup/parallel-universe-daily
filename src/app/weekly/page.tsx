"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WeeklyIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const dayOfYear = Math.ceil((now.getTime() - jan1.getTime()) / 86400000);
    const weekNum = Math.ceil(dayOfYear / 7);
    const weekStr = `W${String(weekNum).padStart(2, "0")}`;
    router.replace(`/weekly/${year}-${weekStr}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-sm text-static/50 font-mono">跳转中...</div>
    </div>
  );
}
