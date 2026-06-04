// Catch-all: serve index.html for SPA client-side routing
// This ensures /diary/:date, /newspaper/:id, /weekly/:week etc. work on direct access

export const onRequest = async (context: { request: Request; next: () => Promise<Response> }) => {
  const url = new URL(context.request.url);

  // Let API routes and actual static files pass through
  if (url.pathname.startsWith("/api/")) {
    return context.next();
  }

  // Try to serve the actual static file first
  const res = await context.next();
  if (res.status === 200) {
    return res;
  }

  // For 404s, serve index.html so client-side router can handle it
  return context.env.ASSETS.fetch(new URL("/index.html", context.request.url));
};
