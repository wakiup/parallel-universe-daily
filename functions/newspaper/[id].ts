// Cloudflare Pages Function: handle /newspaper/[id] routes
// Pre-rendered pages (seed-1/2/3) are served from static assets.
// UUID pages use seed-1.html as a template, replacing the ID so the RSC payload
// matches the newspaper detail component tree (avoids hydration mismatch).

interface EventContext<Env, P extends string> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string>;
}

export const onRequest = async (context: EventContext<{ ASSETS: Fetcher }, string>) => {
  const id = context.params.id;

  // Try to serve pre-rendered static file first
  const staticResponse = await context.env.ASSETS.fetch(
    `https://placeholder/newspaper/${id}`
  );

  if (staticResponse.ok) {
    return staticResponse;
  }

  // For UUID pages: use seed-1.html as template
  // The RSC payload in seed-1 has the correct newspaper detail component tree.
  // Replace "seed-1" with the UUID so useParams() returns the correct ID.
  const templateResponse = await context.env.ASSETS.fetch(
    "https://placeholder/newspaper/seed-1.html"
  );
  const html = await templateResponse.text();
  const modified = html.split("seed-1").join(id);

  return new Response(modified, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
