/**
 * Content script — runs at document_start on the supported sites.
 *
 * The theming lives in the injected CSS; this script reflects the saved
 * settings onto <html> as data-ef-* attributes, honouring both the master
 * switch and the per-site toggle, and keeps them in sync when the popup changes.
 *
 * Bilibili extra: its comment list renders inside (nested, open) shadow roots.
 * Our token remap reaches most of it — CSS custom properties inherit across the
 * shadow boundary — but the comment "tag" badges ("UP主觉得很赞", pinned, …)
 * hardcode their own light/dark source vars *inside* the shadow, which a
 * page-level stylesheet can neither select nor override. So while the theme is
 * on we inject a tiny override into each comment shadow root, written against
 * the inherited Everforest tokens so it stays light/dark-correct on its own.
 */

import {
  isGoogleImagesUrl,
  isXGrokPath,
  loadSettings,
  onSettingsChanged,
  siteForHost,
  type Settings,
} from "./settings";
import { YoutubeThemeSync, youtubeDarkForMode } from "./youtube-theme";

const root = document.documentElement;
const site = siteForHost(location.hostname);
const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const youtubeTheme = site === "youtube" ? new YoutubeThemeSync(root) : null;
let currentSettings: Settings | null = null;

if (youtubeTheme) {
  new MutationObserver(() => youtubeTheme.reconcile()).observe(root, {
    attributes: true,
    attributeFilter: ["dark"],
  });
  prefersDark.addEventListener("change", () => {
    if (currentSettings) apply(currentSettings);
  });
}

if (site === "x") {
  prefersDark.addEventListener("change", () => {
    if (currentSettings) apply(currentSettings);
  });
  new MutationObserver(() => {
    if (xThemeDesired && root.getAttribute("data-theme") !== xThemeDesired) {
      root.setAttribute("data-theme", xThemeDesired);
    }
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
}

function syncPageKind(): void {
  if (site === "google") root.toggleAttribute("data-ef-google-images", isGoogleImagesUrl(location.href));
  if (site === "x") root.toggleAttribute("data-ef-x-grok", isXGrokPath(location.pathname));
}

/** X's logged-out Tailwind shell keys colors off data-theme=light|dark. Keep it
 *  aligned with the popup mode so native token sheets and our remaps agree.
 *  X's client hydration often rewrites data-theme — re-pin when it drifts. */
let xThemeDesired: "light" | "dark" | null = null;

function syncXDataTheme(on: boolean, mode: Settings["mode"]): void {
  if (site !== "x") return;
  if (!on) {
    xThemeDesired = null;
    return;
  }
  xThemeDesired = mode === "sync" ? (prefersDark.matches ? "dark" : "light") : mode;
  if (root.getAttribute("data-theme") !== xThemeDesired) {
    root.setAttribute("data-theme", xThemeDesired);
  }
}

// Google and X are SPAs: their page kind can change without a document load.
// A mutation callback is a cheap, page-world-independent signal; the URL guard
// makes the common path a single string comparison even on very busy pages.
let lastRouteHref = "";
function syncPageKindOnRouteChange(): void {
  if (location.href === lastRouteHref) return;
  lastRouteHref = location.href;
  syncPageKind();
}

if (site === "google" || site === "x") {
  syncPageKindOnRouteChange();
  addEventListener("popstate", syncPageKindOnRouteChange);
  addEventListener("hashchange", syncPageKindOnRouteChange);
  new MutationObserver(syncPageKindOnRouteChange).observe(root, { childList: true, subtree: true });
}

function apply(s: Settings): void {
  currentSettings = s;
  syncPageKind();

  const on = s.enabled && (site ? s.sites[site] !== false : true);
  if (on) root.removeAttribute("data-ef");
  else root.setAttribute("data-ef", "off");

  if (s.mode === "sync") root.removeAttribute("data-ef-mode");
  else root.setAttribute("data-ef-mode", s.mode);

  if (s.contrast === "medium") root.removeAttribute("data-ef-contrast");
  else root.setAttribute("data-ef-contrast", s.contrast);

  syncXDataTheme(on, s.mode);
  youtubeTheme?.force(on ? youtubeDarkForMode(s.mode, prefersDark.matches) : null);
  if (site === "bilibili") syncBiliShadows(on);
}

// ── Bilibili comment shadow-DOM theming ─────────────────────────────────────
const SHADOW_STYLE_ID = "ef-shadow";
const SHADOW_CSS =
  ".tag{background:var(--bg2)!important;color:var(--text3)!important;" +
  "border-color:var(--line_regular)!important;}";

const rootObservers = new Map<ShadowRoot, MutationObserver>();
let active = false;
let scanQueued = false;
let docObserver: MutationObserver | null = null;

function injectInto(r: ShadowRoot): void {
  if (r.getElementById(SHADOW_STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = SHADOW_STYLE_ID;
  s.textContent = SHADOW_CSS;
  r.appendChild(s);
}

/** Walk every (nested) open shadow root: inject the override and observe it so
 *  lazily-loaded / paginated comments get themed too. */
function scan(node: Document | ShadowRoot): void {
  node.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const sr = el.shadowRoot;
    if (!sr) return;
    injectInto(sr);
    if (!rootObservers.has(sr)) {
      // mutations don't cross a shadow boundary, so each root needs its own
      // observer to notice new comments appended inside it. Tracked in a map so
      // they can all be disconnected when the theme is switched off.
      const mo = new MutationObserver(queueScan);
      mo.observe(sr, { childList: true, subtree: true });
      rootObservers.set(sr, mo);
    }
    scan(sr);
  });
}

function queueScan(): void {
  if (!active || scanQueued) return;
  scanQueued = true;
  setTimeout(() => {
    scanQueued = false;
    if (active) scan(document);
  }, 300);
}

function removeAll(node: Document | ShadowRoot): void {
  node.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const sr = el.shadowRoot;
    if (!sr) return;
    sr.getElementById(SHADOW_STYLE_ID)?.remove();
    removeAll(sr);
  });
}

function syncBiliShadows(on: boolean): void {
  if (on) {
    active = true;
    scan(document);
    if (!docObserver) {
      docObserver = new MutationObserver(queueScan);
      docObserver.observe(root, { childList: true, subtree: true });
    }
  } else if (active) {
    active = false;
    docObserver?.disconnect();
    docObserver = null;
    rootObservers.forEach((mo) => mo.disconnect());
    rootObservers.clear();
    removeAll(document);
  }
}

loadSettings().then(apply);
onSettingsChanged(apply);
