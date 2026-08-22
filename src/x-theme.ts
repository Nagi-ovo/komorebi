import type { ThemeMode } from "./settings";

export type XDataTheme = "light" | "dark";

interface ThemeRoot {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

/** Resolve the data-theme value X's logged-out shell must see. */
export function xDataThemeForMode(mode: ThemeMode, prefersDark: boolean): XDataTheme {
  if (mode === "sync") return prefersDark ? "dark" : "light";
  return mode;
}

/**
 * Keep X's html[data-theme] aligned with Komorebi.
 * The site's latest native value is retained so disabling Komorebi restores it.
 */
export class XThemeSync {
  private nativeTheme: string | null;
  private forcedTheme: XDataTheme | null = null;

  constructor(private readonly root: ThemeRoot) {
    this.nativeTheme = root.getAttribute("data-theme");
  }

  force(theme: XDataTheme | null): void {
    const current = this.root.getAttribute("data-theme");
    if (this.forcedTheme !== null && current !== this.forcedTheme) {
      this.nativeTheme = current;
    } else if (this.forcedTheme === null) {
      this.nativeTheme = current;
    }

    this.forcedTheme = theme;
    this.apply(theme ?? this.nativeTheme);
  }

  /** Reconcile theme changes X applies after the content script starts. */
  reconcile(): void {
    const current = this.root.getAttribute("data-theme");
    if (this.forcedTheme === null) {
      this.nativeTheme = current;
      return;
    }
    if (current === this.forcedTheme) return;

    this.nativeTheme = current;
    this.apply(this.forcedTheme);
  }

  private apply(theme: string | null): void {
    if (theme == null || theme === "") this.root.removeAttribute("data-theme");
    else this.root.setAttribute("data-theme", theme);
  }
}
