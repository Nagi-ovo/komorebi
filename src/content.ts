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
 *
 * X extra: content-script CSS is injected before page stylesheets, so x-web's
 * later :root[data-theme] token sheet can win for --x-white / --x-bg-* /
 * --x-neutral-* / OAuth utilities. We also append a page-DOM
 * <style id="ef-x-page"> (same idea as Bilibili) so landing pills and the
 * migrated x-web profile/timeline shell pick up Everforest after hydration.
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
import { XThemeSync, xDataThemeForMode } from "./x-theme";

const root = document.documentElement;
const site = siteForHost(location.hostname);
const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const youtubeTheme = site === "youtube" ? new YoutubeThemeSync(root) : null;
const xTheme = site === "x" ? new XThemeSync(root) : null;
let currentSettings: Settings | null = null;

// ── X landing OAuth utilities (page-DOM stylesheet) ─────────────────────────
const X_PAGE_STYLE_ID = "ef-x-page";
const X_PAGE_CSS =
  "html:not([data-ef=off]),html:not([data-ef=off])[data-theme]{" +
  "background-color:var(--ef-bg)!important;color:var(--ef-fg)!important;" +
  "--x-white:var(--ef-bg1)!important;" +
  "--x-bg-primary:var(--ef-bg)!important;" +
  "--x-bg-secondary:var(--ef-bg1)!important;" +
  "--x-bg-tertiary:var(--ef-bg2)!important;" +
  "--x-bg-modal:var(--ef-bg1)!important;" +
  "--x-bg-sheets:var(--ef-bg1)!important;" +
  "--x-bg-inputs:var(--ef-bg2)!important;" +
  "--x-bg-alpha-100:var(--ef-bg)!important;" +
  "--x-fg-primary:var(--ef-fg)!important;" +
  "--x-fg-secondary:var(--ef-muted)!important;" +
  "--x-fg-tertiary:var(--ef-muted)!important;" +
  "--x-fg-inverted:var(--ef-bg)!important;" +
  "--x-fg-on-color:var(--ef-on-accent)!important;" +
  "--x-border-normal:var(--ef-border)!important;" +
  "--x-btn-primary:var(--ef-green)!important;" +
  "--x-neutral-000:var(--ef-bg1)!important;" +
  "--x-neutral-050:var(--ef-bg2)!important;" +
  "--x-neutral-900:var(--ef-bg2)!important;" +
  "--x-neutral-1000:var(--ef-bg1)!important;" +
  "--x-neutral-1100:var(--ef-bg)!important;" +
  "--color-slate-50:var(--ef-green)!important;" +
  "--background:var(--ef-hsl-bg)!important;" +
  "--foreground:var(--ef-hsl-fg)!important;" +
  "--color-background:var(--ef-hsl-bg)!important;" +
  "--color-text:var(--ef-hsl-fg)!important;" +
  "--color-modal-background:var(--ef-hsl-bg1)!important;" +
  "--pill:var(--ef-bg1)!important;" +
  "--chat-accent:var(--ef-hsl-blue)!important;" +
  "--jf-bg-color:var(--ef-bg1)!important;" +
  "--jf-text-color:var(--ef-fg)!important;" +
  "--base-gradient-color:var(--ef-bg)!important;}" +
  "html:not([data-ef=off]) :is(.bg-white,[class~=bg-white]){" +
  "background:var(--ef-bg1)!important;background-color:var(--ef-bg1)!important;" +
  "color:var(--ef-fg)!important;border-color:var(--ef-border)!important;}" +
  "html:not([data-ef=off]) :is(.bg-white,[class~=bg-white]) :where(span,div,p,label){" +
  "color:var(--ef-fg)!important;}" +
  "html:not([data-ef=off]) :is(.bg-black,[class~=bg-black],.dark\\:bg-slate-50){" +
  "background:var(--ef-green)!important;background-color:var(--ef-green)!important;" +
  "color:var(--ef-on-accent)!important;border-color:var(--ef-green)!important;}" +
  "html:not([data-ef=off]) :is(.bg-black,[class~=bg-black],.dark\\:bg-slate-50) :where(span,svg){" +
  "color:var(--ef-on-accent)!important;fill:currentColor!important;}" +
  "html:not([data-ef=off]) :is(.bg-black,[class~=bg-black],.dark\\:bg-slate-50) .text-white," +
  "html:not([data-ef=off]) :is(.bg-black,[class~=bg-black],.dark\\:bg-slate-50) .text-white :where(svg,path){" +
  "color:var(--ef-on-accent)!important;fill:currentColor!important;}" +
  "html:not([data-ef=off]) .dark\\:bg-black{" +
  "background:var(--ef-bg1)!important;background-color:var(--ef-bg1)!important;" +
  "color:var(--ef-fg)!important;border-color:var(--ef-border)!important;}" +
  "html:not([data-ef=off]) :is([class~=bg-gray-1100],[class~=dark\\:bg-gray-100]){" +
  "background:var(--ef-green)!important;background-color:var(--ef-green)!important;" +
  "color:var(--ef-on-accent)!important;border-color:var(--ef-green)!important;}" +
  "html:not([data-ef=off]) .nsm7Bb-HzV7m-LgbsSe{" +
  "background:var(--ef-bg1)!important;background-color:var(--ef-bg1)!important;" +
  "color:var(--ef-fg)!important;border-color:var(--ef-border)!important;}";

function syncXPageStyle(on: boolean): void {
  const existing = document.getElementById(X_PAGE_STYLE_ID);
  if (!on) {
    existing?.remove();
    clearXJetfuelCtas();
    return;
  }
  const style = existing ?? document.createElement("style");
  style.id = X_PAGE_STYLE_ID;
  style.textContent = X_PAGE_CSS;
  // Append (or re-append) so we stay after X's linked stylesheets / hydration.
  (document.documentElement || document.head || document).appendChild(style);
  scheduleXJetfuelCtas();
}

// Grok's wd-refresh sheet redeclares --surface-* on body after our content-script
// CSS. Re-assert the same tokens from a page-DOM <style> so hydration loses.
const GROK_PAGE_STYLE_ID = "ef-grok-page";
const GROK_PAGE_SEL =
  "html:not([data-ef=off]),html:not([data-ef=off]).light,html:not([data-ef=off]).dark," +
  "html:not([data-ef=off]) body,html:not([data-ef=off]).light body," +
  "html:not([data-ef=off]).dark body,html:not([data-ef=off]) body.wd-refresh," +
  "html:not([data-ef=off]).light body.wd-refresh,html:not([data-ef=off]).dark body.wd-refresh," +
  "html:not([data-ef=off]) :is(.light,.dark,.wd-refresh)";
const GROK_PAGE_CSS =
  GROK_PAGE_SEL + "{" +
  "--surface-base:var(--eft-bg)!important;--surface-base-hover:var(--eft-visual)!important;" +
  "--surface-l1:var(--eft-composer)!important;--surface-l1-hover:var(--eft-visual)!important;" +
  "--surface-l2:var(--eft-s3)!important;--warm-white:var(--eft-s1)!important;" +
  "--sidebar-background:var(--eft-side)!important;--sidebar-accent:var(--eft-visual)!important;" +
  "--sidebar-primary:var(--eft-green)!important;--wd-composer-bg:var(--eft-composer)!important;" +
  "--wd-user-bubble:var(--eft-bubble)!important;--wd-accent:var(--eft-green)!important;" +
  "--wd-composer-border:var(--efh-border)!important;--background:var(--efh-bg)!important;" +
  "--background-secondary:var(--efh-side)!important;--accent:var(--eft-visual)!important;" +
  "--input-background:var(--efh-input)!important;--fg-primary:var(--eft-fg)!important;" +
  "--fg-link:var(--eft-blue)!important;--fg-positive:var(--eft-green)!important;" +
  "--button-primary:var(--efh-green)!important;--ring:var(--efh-green)!important;" +
  "--foreground:var(--efh-fg)!important;}" +
  "html:not([data-ef=off]) :is(body,main,[role=main]){" +
  "background-color:var(--efh-bg)!important;color:hsl(var(--eft-fg))!important;}" +
  "html:not([data-ef=off]) :is(aside,nav,.bg-sidebar,[data-sidebar=sidebar])," +
  "html:not([data-ef=off]) .inset-y-0.bg-surface-base:has([data-sidebar=sidebar]){" +
  "background-color:var(--efh-side)!important;color:hsl(var(--eft-fg))!important;}" +
  "html:not([data-ef=off]) [data-sidebar=menu-button]{color:hsl(var(--eft-fg))!important;}";

function syncGrokPageStyle(on: boolean): void {
  const existing = document.getElementById(GROK_PAGE_STYLE_ID);
  if (!on) {
    existing?.remove();
    return;
  }
  const style = existing ?? document.createElement("style");
  style.id = GROK_PAGE_STYLE_ID;
  style.textContent = GROK_PAGE_CSS;
  (document.documentElement || document.head || document).appendChild(style);
}

/** After hydration, X's Jetfuel login replaces Tailwind utilities with hashed
 *  classes that hardcode rgba(248,250,252) / #fff / #000. Identify those CTAs
 *  by stable icon/GSI markers (labels localize) so OAuth pills track Everforest
 *  even when hashes churn. */
const X_CTA_ATTR = "data-ef-x-cta";
const X_CTA_INK_ATTR = "data-ef-x-cta-ink";
const X_JETFUEL_ROOT = ".jetfuel-style-root";
/** Login-specific markers verified on the live x-web landing + icon modules.
 *  data-icon is hardcoded on the SVG components; GSI classes survive Jetfuel. */
const X_LOGIN_MARKERS =
  '.jf-gsi-face, .nsm7Bb-HzV7m-LgbsSe, [data-icon="icon-phone-stroke"], [data-icon="icon-logo-google"], [data-icon="icon-logo-apple"]';
const X_PHONE_ICON = '[data-icon="icon-phone-stroke"]';
const X_OAUTH_MARKERS =
  '[data-icon="icon-logo-google"], [data-icon="icon-logo-apple"], .jf-gsi-face, .nsm7Bb-HzV7m-LgbsSe';
const X_FIELD_SURFACE = '.dark\\:bg-black, [class~="dark:bg-black"]';
const X_FIELD_INPUT =
  "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio])";
let xCtaQueued = false;

function clearPaintedStyles(el: HTMLElement | SVGElement): void {
  el.style.removeProperty("background");
  el.style.removeProperty("background-color");
  el.style.removeProperty("color");
  el.style.removeProperty("border-color");
  el.style.removeProperty("fill");
  el.removeAttribute(X_CTA_ATTR);
  el.removeAttribute(X_CTA_INK_ATTR);
}

function clearXJetfuelCtas(): void {
  document.querySelectorAll(`[${X_CTA_ATTR}], [${X_CTA_INK_ATTR}]`).forEach((el) => {
    if (el instanceof HTMLElement || el instanceof SVGElement) clearPaintedStyles(el);
  });
}

function opaqueLoginSurface(el: HTMLElement): HTMLElement {
  let best: HTMLElement | null = null;
  const consider = (node: HTMLElement) => {
    const bg = getComputedStyle(node).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return;
    best = node;
  };
  consider(el);
  el.querySelectorAll<HTMLElement>("div, span").forEach((node) => {
    const radius = getComputedStyle(node).borderRadius;
    if (radius.includes("999") || parseFloat(radius) >= 16) consider(node);
    else if (!best) consider(node);
  });
  return best ?? el;
}

function paintXJetfuelCtas(): void {
  if (root.getAttribute("data-ef") === "off") return;
  const cs = getComputedStyle(root);
  const green = cs.getPropertyValue("--ef-green").trim() || "#a7c080";
  const bg1 = cs.getPropertyValue("--ef-bg1").trim() || "#343f44";
  const onAccent = cs.getPropertyValue("--ef-on-accent").trim() || "#2d353b";
  const fg = cs.getPropertyValue("--ef-fg").trim() || "#d3c6aa";
  const border = cs.getPropertyValue("--ef-border").trim() || "#4f585e";

  const paintInk = (n: Element, color: string, withFill: boolean): void => {
    if (!(n instanceof HTMLElement) && !(n instanceof SVGElement)) return;
    n.style.setProperty("color", color, "important");
    if (withFill) n.style.setProperty("fill", color, "important");
    n.setAttribute(X_CTA_INK_ATTR, "");
  };

  const apply = (surface: HTMLElement, kind: "phone" | "oauth" | "field") => {
    const bg = kind === "phone" ? green : bg1;
    const color = kind === "phone" ? onAccent : fg;
    surface.style.setProperty("background", bg, "important");
    surface.style.setProperty("background-color", bg, "important");
    surface.style.setProperty("color", color, "important");
    surface.style.setProperty("border-color", kind === "phone" ? green : border, "important");
    surface.setAttribute(X_CTA_ATTR, kind);
    if (kind === "phone") {
      surface.querySelectorAll("span, svg, path").forEach((n) => paintInk(n, onAccent, true));
    } else if (kind === "oauth") {
      surface.querySelectorAll("span, div").forEach((n) => {
        if (n.closest("svg")) return;
        paintInk(n, fg, false);
      });
      // Apple/Google marks often hardcode fill="#000" — force readable ink.
      surface.querySelectorAll("svg, path").forEach((n) => paintInk(n, fg, true));
    }
  };

  const marks = document.querySelectorAll(X_LOGIN_MARKERS);
  if (marks.length === 0) return;

  const scopes = new Set<ParentNode>();
  for (const mark of marks) {
    scopes.add(mark.closest(X_JETFUEL_ROOT) ?? document);
  }

  for (const scope of scopes) {
    for (const icon of scope.querySelectorAll(X_PHONE_ICON)) {
      apply(surfaceFromLoginMarker(icon), "phone");
    }
    for (const icon of scope.querySelectorAll(X_OAUTH_MARKERS)) {
      apply(surfaceFromLoginMarker(icon), "oauth");
    }
    // Email field: Jetfuel hardcodes black in dark mode. Inputs stay scoped
    // to the Jetfuel card so timeline widgets are left alone.
    if (scope !== document) {
      for (const input of scope.querySelectorAll<HTMLElement>(X_FIELD_INPUT)) {
        apply(opaqueLoginSurface(input), "field");
      }
    }
    for (const el of scope.querySelectorAll<HTMLElement>(X_FIELD_SURFACE)) {
      if (el.closest("button, [role='button']")) continue;
      apply(opaqueLoginSurface(el), "field");
    }
  }
}

function surfaceFromLoginMarker(el: Element): HTMLElement {
  const host = el.closest<HTMLElement>(
    "button, [role='button'], .jf-element, .jf-gsi-face, .nsm7Bb-HzV7m-LgbsSe, [class~='bg-black'], [class~='bg-white'], [class~='dark:bg-slate-50']",
  );
  if (host) return opaqueLoginSurface(host);
  let node: HTMLElement | null = el instanceof HTMLElement ? el : el.parentElement;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") return node;
    node = node.parentElement;
  }
  return el instanceof HTMLElement ? el : (el.parentElement ?? root);
}

function scheduleXJetfuelCtas(): void {
  if (xCtaQueued) return;
  xCtaQueued = true;
  requestAnimationFrame(() => {
    xCtaQueued = false;
    paintXJetfuelCtas();
  });
}

function syncXDataTheme(on: boolean, mode: Settings["mode"]): void {
  xTheme?.force(on ? xDataThemeForMode(mode, prefersDark.matches) : null);
}

if (youtubeTheme) {
  new MutationObserver(() => youtubeTheme.reconcile()).observe(root, {
    attributes: true,
    attributeFilter: ["dark"],
  });
  prefersDark.addEventListener("change", () => {
    if (currentSettings) apply(currentSettings);
  });
}

function loginScopeAround(el: Element): Element | null {
  const mark = el.closest(X_LOGIN_MARKERS);
  if (mark) return mark.closest(X_JETFUEL_ROOT) ?? mark;
  const jf = el.closest(X_JETFUEL_ROOT);
  return jf?.querySelector(X_LOGIN_MARKERS) ? jf : null;
}

function nodeTouchesXLogin(node: Node): boolean {
  if (!(node instanceof Element)) return false;
  if (loginScopeAround(node)) return true;
  if (node.matches(X_LOGIN_MARKERS) || node.querySelector(X_LOGIN_MARKERS)) return true;
  const jf = node.matches(X_JETFUEL_ROOT) ? node : node.querySelector(X_JETFUEL_ROOT);
  return Boolean(jf?.querySelector(X_LOGIN_MARKERS));
}

function mutationTouchesXLogin(mutations: MutationRecord[]): boolean {
  for (const m of mutations) {
    if (m.target instanceof Element && loginScopeAround(m.target)) return true;
    for (const node of m.addedNodes) {
      if (nodeTouchesXLogin(node)) return true;
    }
  }
  return false;
}

if (site === "grok") {
  new MutationObserver(() => {
    if (!currentSettings) return;
    const on = currentSettings.enabled && currentSettings.sites.grok !== false;
    if (on && !document.getElementById(GROK_PAGE_STYLE_ID)) syncGrokPageStyle(true);
  }).observe(root, { childList: true, subtree: true });
}

if (site === "x") {
  prefersDark.addEventListener("change", () => {
    if (currentSettings) apply(currentSettings);
  });
  new MutationObserver(() => xTheme?.reconcile()).observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  // X hydration can replace <html>/<head>; re-seat the page <style> if dropped.
  // Jetfuel paint is gated to the logged-out login shell — timeline mutations
  // must not walk every button.
  new MutationObserver((mutations) => {
    if (!currentSettings) return;
    const on = currentSettings.enabled && currentSettings.sites.x !== false;
    if (on && !document.getElementById(X_PAGE_STYLE_ID)) syncXPageStyle(true);
    else if (on && mutationTouchesXLogin(mutations)) scheduleXJetfuelCtas();
  }).observe(root, { childList: true, subtree: true });
}

function syncPageKind(): void {
  if (site === "google") root.toggleAttribute("data-ef-google-images", isGoogleImagesUrl(location.href));
  if (site === "x") root.toggleAttribute("data-ef-x-grok", isXGrokPath(location.pathname));
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
  if (site === "x") syncXPageStyle(on);
  if (site === "grok") syncGrokPageStyle(on);
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
