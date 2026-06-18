/**
 * Everforest palette — the single source of truth for colors.
 *
 * Values are taken verbatim from the official theme by Sainnhe Park:
 *   https://github.com/sainnhe/everforest  (palette.md / autoload/everforest.vim)
 * Background ladders cross-verified against both sources for all three
 * contrast levels. Accent/grey/semantic values are the "medium" set, which
 * the upstream theme keeps constant across contrasts.
 *
 * Naming follows upstream: bg_dim..bg5 are the neutral background ladder,
 * fg is the default foreground, and red..purple are the accent hues. The
 * bg_<hue> values are the faint tinted backgrounds used for diffs/selection.
 */

export type Mode = "dark" | "light";
export type Contrast = "soft" | "medium" | "hard";

/** The 7-step neutral background ladder. Shifts with the contrast level. */
export interface Backgrounds {
  bg_dim: string;
  bg0: string;
  bg1: string;
  bg2: string;
  bg3: string;
  bg4: string;
  bg5: string;
}

/** Hues + tints. Constant across contrast levels within a mode. */
export interface Accents {
  fg: string;

  red: string;
  orange: string;
  yellow: string;
  green: string;
  aqua: string;
  blue: string;
  purple: string;

  grey0: string;
  grey1: string;
  grey2: string;

  /** Faint tinted backgrounds (selection, diff fills, callouts). */
  bg_visual: string;
  bg_red: string;
  bg_yellow: string;
  bg_green: string;
  bg_blue: string;
  bg_purple: string;

  /** Statusline accents — handy for emphasis pills. */
  statusline1: string;
  statusline2: string;
  statusline3: string;
}

export interface ModePalette extends Accents {
  bg: Record<Contrast, Backgrounds>;
}

/** A flat, fully-resolved palette for one (mode, contrast) pair. */
export type ResolvedPalette = Accents & Backgrounds & { mode: Mode; contrast: Contrast };

export const everforest: Record<Mode, ModePalette> = {
  dark: {
    bg: {
      hard: {
        bg_dim: "#1e2326", bg0: "#272e33", bg1: "#2e383c", bg2: "#374145",
        bg3: "#414b50", bg4: "#495156", bg5: "#4f5b58",
      },
      medium: {
        bg_dim: "#232a2e", bg0: "#2d353b", bg1: "#343f44", bg2: "#3d484d",
        bg3: "#475258", bg4: "#4f585e", bg5: "#56635f",
      },
      soft: {
        bg_dim: "#293136", bg0: "#333c43", bg1: "#3a464c", bg2: "#434f55",
        bg3: "#4d5960", bg4: "#555f66", bg5: "#5d6b66",
      },
    },

    fg: "#d3c6aa",

    red: "#e67e80",
    orange: "#e69875",
    yellow: "#dbbc7f",
    green: "#a7c080",
    aqua: "#83c092",
    blue: "#7fbbb3",
    purple: "#d699b6",

    grey0: "#7a8478",
    grey1: "#859289",
    grey2: "#9da9a0",

    bg_visual: "#543a48",
    bg_red: "#514045",
    bg_yellow: "#4d4c43",
    bg_green: "#425047",
    bg_blue: "#3a515d",
    bg_purple: "#4a444e",

    statusline1: "#a7c080",
    statusline2: "#d3c6aa",
    statusline3: "#e67e80",
  },

  light: {
    bg: {
      hard: {
        bg_dim: "#f2efdf", bg0: "#fffbef", bg1: "#f8f5e4", bg2: "#f2efdf",
        bg3: "#edeada", bg4: "#e8e5d5", bg5: "#bec5b2",
      },
      medium: {
        bg_dim: "#efebd4", bg0: "#fdf6e3", bg1: "#f4f0d9", bg2: "#efebd4",
        bg3: "#e6e2cc", bg4: "#e0dcc7", bg5: "#bdc3af",
      },
      soft: {
        bg_dim: "#e5dfc5", bg0: "#f3ead3", bg1: "#eae4ca", bg2: "#e5dfc5",
        bg3: "#ddd8be", bg4: "#d8d3ba", bg5: "#b9c0ab",
      },
    },

    fg: "#5c6a72",

    red: "#f85552",
    orange: "#f57d26",
    yellow: "#dfa000",
    green: "#8da101",
    aqua: "#35a77c",
    blue: "#3a94c5",
    purple: "#df69ba",

    grey0: "#a6b0a0",
    grey1: "#939f91",
    grey2: "#829181",

    bg_visual: "#eaedc8",
    bg_red: "#fde3da",
    bg_yellow: "#faedcd",
    bg_green: "#f0f1d2",
    bg_blue: "#e9f0e9",
    bg_purple: "#fae8e2",

    statusline1: "#93b259",
    statusline2: "#708089",
    statusline3: "#e66868",
  },
};

/** Flatten the nested palette into a single object for a (mode, contrast). */
export function resolve(mode: Mode, contrast: Contrast): ResolvedPalette {
  const p = everforest[mode];
  const { bg, ...rest } = p;
  return { mode, contrast, ...rest, ...bg[contrast] };
}
