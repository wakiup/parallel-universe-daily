// Serve index.html for newspaper routes not pre-rendered at build time
// Pre-rendered IDs (seed-1, seed-2, seed-3) are served from static files directly

export const onRequest = async (context: {
  request: Request;
  env: { ASSETS: { fetch: (req: Request | string) => Promise<Response> } };
}) => {
  return context.env.ASSETS.fetch(new Request(new URL("/", context.request.url)));
};
