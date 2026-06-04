import NewspaperClient from "./newspaper-client";

export function generateStaticParams() {
  return [[]];
}

export const dynamic = "force-static";

export default function NewspaperDetailPage() {
  return <NewspaperClient />;
}
