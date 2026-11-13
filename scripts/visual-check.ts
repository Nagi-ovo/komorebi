/** Browser regression fixtures: bun run scripts/visual-check.ts, then open
 * http://localhost:8718/test/fixtures/theme-compatibility.html in Chrome.
 * ?baseline=1 serves the committed CSS for a before/after comparison.
 */
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
Bun.serve({
  hostname: "127.0.0.1",
  port: 8718,
  async fetch(request) {
    const url = new URL(request.url);
    const allowed = /^\/src\/[a-z]+\.css$/.test(url.pathname) ||
      url.pathname === "/test/fixtures/theme-compatibility.html";
    if (url.pathname === "/grok-page.css") {
      const source = url.searchParams.has("baseline")
        ? await new Response(Bun.spawn(["git", "show", "HEAD:src/content.ts"], { cwd: root }).stdout).text()
        : await Bun.file(path.join(root, "src/content.ts")).text();
      // Only the two static string expressions; never execute the content script.
      const constants = source.match(/const GROK_PAGE_SEL =[\s\S]*?(?=\nfunction syncGrokPageStyle)/)?.[0];
      if (!constants) return new Response("Missing Grok tokens", { status: 500 });
      return new Response(new Function(`${constants};return GROK_PAGE_CSS`)(), {
        headers: { "content-type": "text/css", "cache-control": "no-store" },
      });
    }
    if (url.pathname === "/github.css") {
      return new Response(Bun.file(path.join(root, "dist/theme.css")), {
        headers: { "content-type": "text/css", "cache-control": "no-store" },
      });
    }
    if (!allowed) return new Response("Not found", { status: 404 });
    if (url.searchParams.has("baseline") && url.pathname.endsWith(".css")) {
      const process = Bun.spawn(["git", "show", `HEAD:${url.pathname.slice(1)}`], { cwd: root });
      return new Response(await new Response(process.stdout).text(), {
        headers: { "content-type": "text/css", "cache-control": "no-store" },
      });
    }
    return new Response(Bun.file(path.join(root, url.pathname)), {
      headers: { "cache-control": "no-store" },
    });
  },
});
console.log("Visual checks: http://localhost:8718/test/fixtures/theme-compatibility.html");
