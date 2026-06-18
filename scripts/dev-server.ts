/**
 * Tiny static server for local theme iteration. Serves dist/ over http with
 * permissive CORS so the generated theme.css can be <link>-injected into a
 * live github.com tab while developing. Not part of the shipped extension.
 *
 *   bun run scripts/dev-server.ts
 */
import path from "node:path";

const DIST = path.resolve(import.meta.dir, "..", "dist");
const PORT = 8717;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const file = Bun.file(path.join(DIST, url.pathname === "/" ? "theme.css" : url.pathname));
    if (!(await file.exists())) return new Response("not found", { status: 404 });
    return new Response(file, {
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
      },
    });
  },
});

console.log(`dev server: http://localhost:${PORT}/theme.css  (serving ${DIST})`);
