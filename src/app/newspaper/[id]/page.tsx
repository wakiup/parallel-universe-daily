import NewspaperClient from "./newspaper-client";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export const dynamic = "force-static";

export default function NewspaperDetailPage() {
  return <NewspaperClient />;
}
