import { describe, expect, test } from "bun:test";
import { isGoogleImagesUrl, isXGrokPath, siteForHost } from "../src/settings";
import { YoutubeThemeSync, youtubeDarkForMode } from "../src/youtube-theme";
import manifest from "../manifest.json";

const docsCss = await Bun.file(`${import.meta.dir}/../src/docs.css`).text();
const xCss = await Bun.file(`${import.meta.dir}/../src/x.css`).text();
const youtubeCss = await Bun.file(`${import.meta.dir}/../src/youtube.css`).text();
const contentTs = await Bun.file(`${import.meta.dir}/../src/content.ts`).text();

describe("siteForHost", () => {
  test.each([
    ["x.com", "x"],
    ["www.x.com", "x"],
    ["mobile.x.com", "x"],
    ["twitter.com", "x"],
    ["www.twitter.com", "x"],
    ["mobile.twitter.com", "x"],
    ["youtube.com", "youtube"],
    ["www.youtube.com", "youtube"],
    ["m.youtube.com", "youtube"],
    ["mail.google.com", "gmail"],
    ["docs.google.com", "docs"],
    ["grok.com", "grok"],
  ] as const)("maps %s to %s", (host, site) => {
    expect(siteForHost(host)).toBe(site);
  });

  test("does not accept lookalike suffixes", () => {
    expect(siteForHost("eviltwitter.com")).toBeNull();
    expect(siteForHost("bilibili.com.example.org")).toBeNull();
  });
});

describe("manifest parity", () => {
  const matches = manifest.content_scripts.flatMap((script) => script.matches);

  test.each([
    "https://www.x.com/*",
    "https://mobile.twitter.com/*",
    "https://youtube.com/*",
  ])("injects on mapped host pattern %s", (pattern) => {
    expect(matches).toContain(pattern);
  });
});

describe("SPA page kinds", () => {
  test.each([
    ["https://www.google.com/search?q=forest&udm=2", true],
    ["https://www.google.com/search?q=forest&tbm=isch", true],
    ["https://www.google.com/imghp", true],
    ["https://www.google.com/search?q=forest", false],
  ] as const)("recognises Google Images: %s", (url, expected) => {
    expect(isGoogleImagesUrl(url)).toBe(expected);
  });

  test.each([
    ["/i/grok", true],
    ["/i/grok/", true],
    ["/i/grok/share/abc", true],
    ["/grok", false],
    ["/i/grokking", false],
  ] as const)("recognises X Grok: %s", (path, expected) => {
    expect(isXGrokPath(path)).toBe(expected);
  });
});

describe("YouTube theme synchronisation", () => {
  class FakeRoot {
    private attrs = new Set<string>();

    constructor(dark: boolean) {
      if (dark) this.attrs.add("dark");
    }

    hasAttribute(name: string): boolean {
      return this.attrs.has(name);
    }

    toggleAttribute(name: string, force: boolean): boolean {
      if (force) this.attrs.add(name);
      else this.attrs.delete(name);
      return force;
    }
  }

  test("forces YouTube's dark attribute to match Komorebi and restores the native choice", () => {
    const root = new FakeRoot(true);
    const sync = new YoutubeThemeSync(root);

    sync.force(false);
    expect(root.hasAttribute("dark")).toBe(false);

    // YouTube can reapply its saved dark appearance after document_start.
    root.toggleAttribute("dark", true);
    sync.reconcile();
    expect(root.hasAttribute("dark")).toBe(false);

    sync.force(null);
    expect(root.hasAttribute("dark")).toBe(true);
  });

  test("also protects forced dark mode from a native light-theme rewrite", () => {
    const root = new FakeRoot(false);
    const sync = new YoutubeThemeSync(root);

    sync.force(true);
    root.toggleAttribute("dark", false);
    sync.reconcile();
    expect(root.hasAttribute("dark")).toBe(true);

    sync.force(null);
    expect(root.hasAttribute("dark")).toBe(false);
  });

  test.each([
    ["light", false, false],
    ["light", true, false],
    ["dark", false, true],
    ["dark", true, true],
    ["sync", false, false],
    ["sync", true, true],
  ] as const)("resolves %s with OS dark=%s", (mode, prefersDark, expected) => {
    expect(youtubeDarkForMode(mode, prefersDark)).toBe(expected);
  });
});

describe("YouTube visual regressions", () => {
  test("paints the fixed masthead, chip rail, and search controls with Everforest surfaces", () => {
    expect(youtubeCss).toContain("#frosted-glass");
    expect(youtubeCss).toContain("#masthead-container");
    expect(youtubeCss).toContain("ytd-masthead #background");
    expect(youtubeCss).toContain("ytd-feed-filter-chip-bar-renderer #chips-wrapper");
    expect(youtubeCss).toContain(".ytSearchboxComponentInputBox");
    expect(youtubeCss).toContain(".ytSearchboxComponentSearchButton");
  });
});

describe("Slides visual regressions", () => {
  test("keeps Slides-only workspace styling scoped", () => {
    expect(docsCss).toContain(':has(#punch-start-presentation-container)');
    expect(docsCss).toContain("--ef-slides-workspace");
  });

  test("hands the title between label and focused input", () => {
    expect(docsCss).toContain(".docs-title-input:not(:focus)");
    expect(docsCss).toContain("#docs-chrome:has(.docs-title-input:focus)");
  });

  test("does not use universal chrome descendant styling", () => {
    expect(docsCss).not.toContain(":is(*, *::before)");
  });

  test("lifts native titlebar badges above clipping ancestors", () => {
    expect(docsCss).not.toContain("data:image/svg+xml;base64");
    expect(docsCss).toContain(".docs-titlebar-badge-container");
    expect(docsCss).toContain("overflow: visible !important");
    expect(docsCss).toContain("z-index: 10 !important");
    expect(docsCss).toContain("width: 20px !important");
    expect(docsCss).toContain("height: 20px !important");
    expect(docsCss).toContain("overflow: hidden !important");
    expect(docsCss).toContain('[data-ef-mode="dark"] .docs-icon-img');
    expect(docsCss).toContain(':not([data-ef-mode="light"]) .docs-icon-img');
  });

  test("does not paint or border every content-rail child", () => {
    expect(docsCss).toContain('[class*="ContentLibraryRailToolbar"]:not([class*="Button"])');
    expect(docsCss).not.toContain(':is([class*="ContentLibraryRailContainer"], [class*="ContentLibraryRailToolbar"]');
  });
});

describe("X visual regressions", () => {
  test("keeps the empty @mention interaction shield transparent", () => {
    expect(xCss).toContain(
      'div:has(> div [data-testid="tweetTextarea_0RichTextInputContainer"]) > div:not(:empty)',
    );
    expect(xCss).not.toContain(
      'div:has(> div [data-testid="tweetTextarea_0RichTextInputContainer"]) > div,',
    );
  });

  test("themes the welcome empty-state CTA with readable accent text", () => {
    expect(xCss).toContain('[data-testid="empty_state_button_text"]');
    expect(xCss).toContain("background-color: var(--ef-green) !important");
    expect(xCss).toContain("color: var(--ef-on-accent) !important");
  });

  test("restores only native blue verified badges to X blue", () => {
    expect(xCss).toContain("--ef-x-verified: #1d9bf0");
    expect(xCss).toContain('svg[data-testid="icon-verified"].r-1cvl2hr');
    expect(xCss).not.toContain('svg[data-testid="icon-verified"] {');
  });

  test("preserves active and hover colours for reposts and likes", () => {
    expect(xCss).toContain("--ef-x-retweet: #00ba7c");
    expect(xCss).toContain("--ef-x-like: #f91880");
    expect(xCss).toContain('[data-testid="unretweet"]');
    expect(xCss).toContain('[data-testid="retweet"]:hover');
    expect(xCss).toContain('[data-testid="unlike"]');
    expect(xCss).toContain('[data-testid="like"]:hover');
  });

  test("remaps x-web surface tokens used by logged-out login cards and modals", () => {
    expect(xCss).toContain("--x-bg-modal: var(--ef-bg1) !important");
    expect(xCss).toContain("--x-bg-primary: var(--ef-bg) !important");
    expect(xCss).toContain("--x-white: var(--ef-bg1) !important");
    expect(xCss).toContain("--color-slate-50: var(--ef-green) !important");
    expect(xCss).toContain("--color-modal-background: var(--ef-hsl-bg1) !important");
    expect(xCss).toContain("--background: var(--ef-hsl-bg) !important");
    expect(xCss).toContain("body .bg-white");
    expect(xCss).toContain("body .bg-black");
    expect(xCss).toContain("body h1");
  });
});

describe("X page-DOM OAuth style injection", () => {
  test("injects ef-x-page stylesheet with OAuth utility overrides", () => {
    expect(contentTs).toContain('X_PAGE_STYLE_ID = "ef-x-page"');
    expect(contentTs).toContain("syncXPageStyle");
    expect(contentTs).toContain("--x-white:var(--ef-bg1)!important");
    expect(contentTs).toContain("--color-slate-50:var(--ef-green)!important");
    expect(contentTs).toContain(".bg-white");
    expect(contentTs).toContain(".bg-black");
    expect(contentTs).toContain("dark\\\\:bg-slate-50");
    expect(contentTs).toContain("paintXJetfuelCtas");
    expect(contentTs).toContain("data-ef-x-cta");
    expect(contentTs).toContain("Continue with phone");
  });
});
