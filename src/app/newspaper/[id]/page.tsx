import NewspaperClient from "./newspaper-client";

export function generateStaticParams() {
  return [
    { id: "seed-1" },
    { id: "seed-2" },
    { id: "seed-3" },
  ];
}

export const dynamic = "force-static";

export default function NewspaperDetailPage() {
  return <NewspaperClient />;
}
