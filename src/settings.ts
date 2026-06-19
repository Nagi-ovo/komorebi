/**
 * Shared settings contract used by both the content script and the popup.
 * Persisted in chrome.storage.sync so preferences roam with the user.
 */

export type ThemeMode = "sync" | "light" | "dark";
export type Contrast = "soft" | "medium" | "hard";
export type Site = "github" | "google" | "x";

export interface Settings {
  /** Master switch. Off = leave every site's native theme untouched. */
  enabled: boolean;
  /** "sync" follows GitHub's appearance (or the OS elsewhere); light/dark force it. */
  mode: ThemeMode;
  /** Everforest background contrast (GitHub only). */
  contrast: Contrast;
  /** Per-site toggles — turn the theme off on individual sites. */
  sites: Record<Site, boolean>;
}

export const SITES: Site[] = ["github", "google", "x"];

export const DEFAULTS: Settings = {
  enabled: true,
  mode: "sync",
  contrast: "medium",
  sites: { github: true, google: true, x: true },
};

const KEY = "ef-settings";

function merge(stored: Partial<Settings> | undefined): Settings {
  return {
    ...DEFAULTS,
    ...stored,
    sites: { ...DEFAULTS.sites, ...(stored?.sites ?? {}) },
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(KEY);
  return merge(stored?.[KEY] as Partial<Settings> | undefined);
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...patch };
  await chrome.storage.sync.set({ [KEY]: next });
  return next;
}

/** Fire `cb` whenever the settings object changes in any context. */
export function onSettingsChanged(cb: (s: Settings) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[KEY]) {
      cb(merge(changes[KEY].newValue as Partial<Settings> | undefined));
    }
  });
}

/** Which supported site is this hostname, if any. */
export function siteForHost(hostname: string): Site | null {
  if (hostname === "github.com" || hostname === "gist.github.com") return "github";
  if (hostname === "www.google.com" || hostname === "www.google.co.uk") return "google";
  if (hostname === "x.com" || hostname === "twitter.com" || hostname === "mobile.x.com") return "x";
  return null;
}
