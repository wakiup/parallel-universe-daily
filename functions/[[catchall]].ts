// Catch-all: serve index.html for SPA routes that don't have pre-rendered static files
// e.g. /diary/2026-06-04, /newspaper/abc123, /weekly/2026-W23

export const onRequest = async (context: {
  request: Request;
  next: () => Promise<Response>;
  env: { ASSETS: { fetch: (req: Request | string) => Promise<Response> } };
}) => {
  const url = new URL(context.request.url);

  // Let API routes pass through to their specific functions
  if (url.pathname.startsWith("/api/")) {
    return context.next();
  }

  // Try to get the actual static file via context.next()
  const res = await context.next();

  // If static file exists, serve it
  if (res.status === 200) {
    return res;
  }

  // For SPA routes without pre-rendered files, serve index.html
  // The Next.js client-side router will handle the correct page
  return context.env.ASSETS.fetch(new Request(new URL("/", context.request.url)));
};
