/**
 * Shared settings contract used by both the content script and the popup.
 * Persisted in chrome.storage.sync so preferences roam with the user.
 */

export type ThemeMode = "sync" | "light" | "dark";
export type Contrast = "soft" | "medium" | "hard";

export interface Settings {
  /** Master switch. Off = leave GitHub's native theme untouched. */
  enabled: boolean;
  /** "sync" follows GitHub's own appearance; light/dark force a variant. */
  mode: ThemeMode;
  /** Everforest background contrast. */
  contrast: Contrast;
}

export const DEFAULTS: Settings = {
  enabled: true,
  mode: "sync",
  contrast: "medium",
};

const KEY = "ef-settings";

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(KEY);
  return { ...DEFAULTS, ...(stored?.[KEY] as Partial<Settings> | undefined) };
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
      cb({ ...DEFAULTS, ...(changes[KEY].newValue as Partial<Settings> | undefined) });
    }
  });
}
