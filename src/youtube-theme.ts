import type { ThemeMode } from "./settings";

interface AttributeRoot {
  hasAttribute(name: string): boolean;
  toggleAttribute(name: string, force: boolean): boolean;
}

/** Resolve the theme state YouTube's own html[dark] selectors must see. */
export function youtubeDarkForMode(mode: ThemeMode, prefersDark: boolean): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return prefersDark;
}

/**
 * Keep YouTube's component-level light/dark selectors aligned with Komorebi.
 * The site's latest native choice is retained so disabling Komorebi restores it.
 */
export class YoutubeThemeSync {
  private nativeDark: boolean;
  private forcedDark: boolean | null = null;

  constructor(private readonly root: AttributeRoot) {
    this.nativeDark = root.hasAttribute("dark");
  }

  force(dark: boolean | null): void {
    const currentDark = this.root.hasAttribute("dark");
    if (this.forcedDark !== null && currentDark !== this.forcedDark) {
      this.nativeDark = currentDark;
    } else if (this.forcedDark === null) {
      this.nativeDark = currentDark;
    }

    this.forcedDark = dark;
    this.root.toggleAttribute("dark", dark ?? this.nativeDark);
  }

  /** Reconcile theme changes YouTube applies after the content script starts. */
  reconcile(): void {
    const currentDark = this.root.hasAttribute("dark");
    if (this.forcedDark === null) {
      this.nativeDark = currentDark;
      return;
    }
    if (currentDark === this.forcedDark) return;

    this.nativeDark = currentDark;
    this.root.toggleAttribute("dark", this.forcedDark);
  }
}
