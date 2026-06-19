/**
 * Popup logic: render the saved settings into the UI, write changes back to
 * storage (the content script applies them live), and re-theme the popup to
 * the resolved Everforest variant so the controls preview the result.
 */

import { everforest, type Mode } from "../src/palette";
import {
  loadSettings, saveSettings, onSettingsChanged, DEFAULTS,
  type Settings, type ThemeMode, type Site,
} from "../src/settings";

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

const enabledEl = $<HTMLInputElement>("#enabled");
const modeHint = $("#mode-hint");
const statusEl = $("#status");
const resetEl = $("#reset");
const segs = Array.from(document.querySelectorAll<HTMLDivElement>(".ef-seg"));
const swatches = Array.from(document.querySelectorAll<HTMLSpanElement>(".ef-swatch"));
const siteEls = Array.from(document.querySelectorAll<HTMLButtonElement>(".ef-sites button"));
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const MODE_HINTS: Record<ThemeMode, string> = {
  sync: "Follows your GitHub appearance.",
  light: "Always Everforest Light.",
  dark: "Always Everforest Dark.",
};

function resolvedMode(mode: ThemeMode): Mode {
  if (mode === "light" || mode === "dark") return mode;
  return prefersDark.matches ? "dark" : "light";
}

function render(s: Settings): void {
  enabledEl.checked = s.enabled;
  document.body.dataset.off = String(!s.enabled);
  statusEl.textContent = s.enabled ? "Theme on" : "Theme off";

  for (const seg of segs) {
    const key = seg.dataset.setting as "mode" | "contrast";
    for (const btn of Array.from(seg.querySelectorAll<HTMLButtonElement>("button"))) {
      btn.setAttribute("aria-checked", String(btn.dataset.value === s[key]));
    }
  }
  modeHint.textContent = MODE_HINTS[s.mode];

  for (const b of siteEls) b.setAttribute("aria-pressed", String(s.sites[b.dataset.site as Site] !== false));

  // Re-theme popup chrome + preview swatches to the resolved variant.
  const pm = resolvedMode(s.mode);
  document.documentElement.dataset.preview = pm;
  const p = everforest[pm];
  const colors: Record<string, string> = {
    bg: p.bg.medium.bg0, red: p.red, orange: p.orange, yellow: p.yellow,
    green: p.green, aqua: p.aqua, blue: p.blue, purple: p.purple,
  };
  for (const sw of swatches) sw.style.background = colors[sw.dataset.c!] ?? "transparent";
}

enabledEl.addEventListener("change", () => void saveSettings({ enabled: enabledEl.checked }));

for (const seg of segs) {
  seg.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;
    const key = seg.dataset.setting as "mode" | "contrast";
    void saveSettings({ [key]: btn.dataset.value } as Partial<Settings>);
  });
}

resetEl.addEventListener("click", () => void saveSettings({ ...DEFAULTS }));

document.querySelector(".ef-sites")?.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  const site = btn.dataset.site as Site;
  void loadSettings().then((s) => saveSettings({ sites: { ...s.sites, [site]: !s.sites[site] } }));
});
prefersDark.addEventListener("change", () => void loadSettings().then(render));
onSettingsChanged(render);
void loadSettings().then(render);
