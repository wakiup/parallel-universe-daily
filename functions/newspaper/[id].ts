// For newspaper routes: serve pre-rendered HTML if it exists,
// otherwise serve index.html as SPA fallback for dynamically generated IDs

export const onRequest = async (context: {
  request: Request;
  env: { ASSETS: { fetch: (req: Request | string) => Promise<Response> } };
}) => {
  const url = new URL(context.request.url);
  const id = url.pathname.split("/newspaper/")[1];

  // Try to serve the pre-rendered HTML file (e.g. /newspaper/seed-1.html)
  if (id) {
    const preRendered = await context.env.ASSETS.fetch(
      new Request(new URL(`/newspaper/${id}.html`, context.request.url))
    );
    if (preRendered.status === 200) {
      return preRendered;
    }
  }

  // Fallback: serve index.html for client-side routing (non-pre-rendered UUIDs)
  return context.env.ASSETS.fetch(new Request(new URL("/", context.request.url)));
};
