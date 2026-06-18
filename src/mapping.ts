/**
 * Maps GitHub's Primer design tokens onto the Everforest palette.
 *
 * GitHub drives ~all of its color through CSS custom properties. We override
 * the *semantic* layer (--bgColor-*, --fgColor-*, --borderColor-*) plus the
 * hardcoded component groups that don't reference it via var() (--control-*,
 * --header-*, --overlay-*, syntax, diff, contribution graph, …). Component
 * tokens that already resolve through var(--bgColor-*) cascade for free.
 *
 * Token names were captured live from github.com; values verified against
 * Primer. Design intent, not a mechanical hue swap: Everforest is warm and
 * low-contrast, so emphasis surfaces use pastel accents with dark ink in dark
 * mode, and saturated accents with warm-white ink in light mode.
 */

import type { ResolvedPalette } from "./palette";

/** Append an 8-bit alpha (2 hex digits) to a 6-digit hex color. */
const a = (hex: string, alpha: string): string => `${hex}${alpha}`;

export function buildTokens(p: ResolvedPalette): Record<string, string> {
  const {
    mode,
    fg, red, orange, yellow, green, aqua, blue, purple,
    grey0, grey1, grey2,
    bg_dim, bg0, bg1, bg2, bg3, bg4, bg5,
    bg_visual, bg_red, bg_yellow, bg_green, bg_blue, bg_purple,
  } = p;

  const dark = mode === "dark";

  // Ink used on top of "emphasis" surfaces. In dark mode those surfaces are
  // pastel accents → dark ink reads best; in light mode they're saturated
  // accents → a warm white reads best.
  const onEmphasis = dark ? bg_dim : "#fffbef";
  const warmWhite = "#fffbef";
  // A dark Everforest ink for the rare "black text" / inverse-surface cases.
  const darkInk = dark ? bg_dim : "#383f44";
  // Solid neutral pill (counters, tooltips, neutral emphasis).
  const neutralEmphasisBg = dark ? grey1 : fg;

  const t: Record<string, string> = {};

  // ──────────────────────────────────────────────────────────────────
  // Semantic backgrounds — --bgColor-*
  // ──────────────────────────────────────────────────────────────────
  t["--bgColor-default"] = bg0;          // main canvas
  t["--bgColor-muted"] = bg_dim;         // recessed panels, code wells
  t["--bgColor-inset"] = bg_dim;         // inputs/wells
  t["--bgColor-emphasis"] = neutralEmphasisBg;
  t["--bgColor-inverse"] = neutralEmphasisBg;
  t["--bgColor-disabled"] = bg2;
  t["--bgColor-transparent"] = "#00000000";
  t["--bgColor-white"] = warmWhite;
  t["--bgColor-black"] = bg_dim;

  t["--bgColor-neutral-emphasis"] = neutralEmphasisBg;
  t["--bgColor-neutral-muted"] = a(grey1, "26");

  t["--bgColor-accent-emphasis"] = blue;
  t["--bgColor-accent-muted"] = a(blue, "26");
  t["--bgColor-success-emphasis"] = green;
  t["--bgColor-success-muted"] = a(green, "26");
  t["--bgColor-open-emphasis"] = green;
  t["--bgColor-open-muted"] = a(green, "26");
  t["--bgColor-danger-emphasis"] = red;
  t["--bgColor-danger-muted"] = a(red, "26");
  t["--bgColor-closed-emphasis"] = red;
  t["--bgColor-closed-muted"] = a(red, "26");
  t["--bgColor-attention-emphasis"] = dark ? yellow : orange; // keep ink readable
  t["--bgColor-attention-muted"] = a(yellow, "26");
  t["--bgColor-severe-emphasis"] = orange;
  t["--bgColor-severe-muted"] = a(orange, "26");
  t["--bgColor-done-emphasis"] = purple;
  t["--bgColor-done-muted"] = a(purple, "26");
  t["--bgColor-upsell-emphasis"] = purple;
  t["--bgColor-upsell-muted"] = a(purple, "26");
  t["--bgColor-sponsors-emphasis"] = purple;
  t["--bgColor-sponsors-muted"] = a(purple, "26");
  t["--bgColor-draft-emphasis"] = grey0;
  t["--bgColor-draft-muted"] = a(grey0, "26");

  // ──────────────────────────────────────────────────────────────────
  // Semantic foregrounds — --fgColor-*
  // ──────────────────────────────────────────────────────────────────
  t["--fgColor-default"] = fg;
  t["--fgColor-muted"] = grey1;
  t["--fgColor-subtle"] = grey0;
  t["--fgColor-disabled"] = grey0;
  t["--fgColor-accent"] = blue;
  t["--fgColor-link"] = blue;
  t["--fgColor-success"] = green;
  t["--fgColor-open"] = green;
  t["--fgColor-danger"] = red;
  t["--fgColor-closed"] = red;
  t["--fgColor-attention"] = yellow;
  t["--fgColor-severe"] = orange;
  t["--fgColor-done"] = purple;
  t["--fgColor-upsell"] = purple;
  t["--fgColor-sponsors"] = purple;
  t["--fgColor-neutral"] = grey1;
  t["--fgColor-draft"] = grey0;
  t["--fgColor-onEmphasis"] = onEmphasis;
  t["--fgColor-onInverse"] = onEmphasis;
  t["--fgColor-white"] = warmWhite;
  t["--fgColor-black"] = darkInk;

  // ──────────────────────────────────────────────────────────────────
  // Semantic borders — --borderColor-*
  // ──────────────────────────────────────────────────────────────────
  t["--borderColor-default"] = bg4;
  t["--borderColor-muted"] = bg3;
  t["--borderColor-emphasis"] = grey0;
  t["--borderColor-disabled"] = a(grey0, "1a");
  t["--borderColor-translucent"] = a(fg, "26");
  t["--borderColor-transparent"] = "#00000000";
  t["--borderColor-accent-emphasis"] = blue;
  t["--borderColor-accent-muted"] = a(blue, "66");
  t["--borderColor-success-emphasis"] = green;
  t["--borderColor-success-muted"] = a(green, "66");
  t["--borderColor-open-emphasis"] = green;
  t["--borderColor-open-muted"] = a(green, "66");
  t["--borderColor-danger-emphasis"] = red;
  t["--borderColor-danger-muted"] = a(red, "66");
  t["--borderColor-closed-emphasis"] = red;
  t["--borderColor-closed-muted"] = a(red, "66");
  t["--borderColor-attention-emphasis"] = yellow;
  t["--borderColor-attention-muted"] = a(yellow, "66");
  t["--borderColor-severe-emphasis"] = orange;
  t["--borderColor-severe-muted"] = a(orange, "66");
  t["--borderColor-done-emphasis"] = purple;
  t["--borderColor-done-muted"] = a(purple, "66");
  t["--borderColor-upsell-emphasis"] = purple;
  t["--borderColor-upsell-muted"] = a(purple, "66");
  t["--borderColor-sponsors-emphasis"] = purple;
  t["--borderColor-sponsors-muted"] = a(purple, "66");
  t["--borderColor-neutral-emphasis"] = grey0;
  t["--borderColor-neutral-muted"] = a(grey1, "66");
  t["--borderColor-draft-emphasis"] = grey0;
  t["--borderColor-draft-muted"] = a(grey0, "66");

  // ──────────────────────────────────────────────────────────────────
  // Syntax highlighting — --color-prettylights-syntax-*
  // ──────────────────────────────────────────────────────────────────
  t["--color-prettylights-syntax-comment"] = grey1;
  t["--color-prettylights-syntax-constant"] = purple;
  t["--color-prettylights-syntax-constant-other-reference-link"] = blue;
  t["--color-prettylights-syntax-entity"] = green;
  t["--color-prettylights-syntax-entity-tag"] = orange;
  t["--color-prettylights-syntax-keyword"] = red;
  t["--color-prettylights-syntax-storage-modifier-import"] = fg;
  t["--color-prettylights-syntax-string"] = aqua;
  t["--color-prettylights-syntax-string-regexp"] = green;
  t["--color-prettylights-syntax-variable"] = orange;
  t["--color-prettylights-syntax-brackethighlighter-angle"] = grey1;
  t["--color-prettylights-syntax-brackethighlighter-unmatched"] = red;
  t["--color-prettylights-syntax-invalid-illegal-text"] = red;
  t["--color-prettylights-syntax-invalid-illegal-bg"] = bg_red;
  t["--color-prettylights-syntax-carriage-return-text"] = warmWhite;
  t["--color-prettylights-syntax-carriage-return-bg"] = red;
  t["--color-prettylights-syntax-markup-bold"] = fg;
  t["--color-prettylights-syntax-markup-italic"] = fg;
  t["--color-prettylights-syntax-markup-heading"] = blue;
  t["--color-prettylights-syntax-markup-list"] = yellow;
  t["--color-prettylights-syntax-markup-inserted-text"] = green;
  t["--color-prettylights-syntax-markup-inserted-bg"] = bg_green;
  t["--color-prettylights-syntax-markup-deleted-text"] = red;
  t["--color-prettylights-syntax-markup-deleted-bg"] = bg_red;
  t["--color-prettylights-syntax-markup-changed-text"] = orange;
  t["--color-prettylights-syntax-markup-changed-bg"] = bg_yellow;
  t["--color-prettylights-syntax-markup-ignored-text"] = fg;
  t["--color-prettylights-syntax-markup-ignored-bg"] = a(blue, "40");
  t["--color-prettylights-syntax-meta-diff-range"] = purple;
  t["--color-prettylights-syntax-sublimelinter-gutter-mark"] = grey0;

  // CodeMirror editor (issue/PR comment composer) — mirror the syntax scheme.
  t["--codeMirror-syntax-fgColor-comment"] = grey1;
  t["--codeMirror-syntax-fgColor-constant"] = purple;
  t["--codeMirror-syntax-fgColor-entity"] = green;
  t["--codeMirror-syntax-fgColor-keyword"] = red;
  t["--codeMirror-syntax-fgColor-storage"] = red;
  t["--codeMirror-syntax-fgColor-string"] = aqua;
  t["--codeMirror-syntax-fgColor-support"] = blue;
  t["--codeMirror-syntax-fgColor-variable"] = orange;

  // ──────────────────────────────────────────────────────────────────
  // Diff view — --diffBlob-*
  // ──────────────────────────────────────────────────────────────────
  t["--diffBlob-additionLine-bgColor"] = bg_green;
  t["--diffBlob-additionLine-fgColor"] = fg;
  t["--diffBlob-additionNum-bgColor"] = a(green, "40");
  t["--diffBlob-additionNum-fgColor"] = fg;
  t["--diffBlob-additionWord-bgColor"] = a(green, "59");
  t["--diffBlob-additionWord-fgColor"] = fg;
  t["--diffBlob-deletionLine-bgColor"] = bg_red;
  t["--diffBlob-deletionLine-fgColor"] = fg;
  t["--diffBlob-deletionNum-bgColor"] = a(red, "40");
  t["--diffBlob-deletionNum-fgColor"] = fg;
  t["--diffBlob-deletionWord-bgColor"] = a(red, "59");
  t["--diffBlob-deletionWord-fgColor"] = fg;
  t["--diffBlob-emptyLine-bgColor"] = bg_dim;
  t["--diffBlob-emptyNum-bgColor"] = bg_dim;
  t["--diffBlob-hunkLine-bgColor"] = a(blue, "26");
  t["--diffBlob-hunkLine-fgColor"] = grey1;
  t["--diffBlob-hunkNum-bgColor-rest"] = a(blue, "40");
  t["--diffBlob-hunkNum-fgColor-rest"] = fg;
  t["--diffBlob-hunkNum-bgColor-hover"] = blue;
  t["--diffBlob-hunkNum-fgColor-hover"] = onEmphasis;
  t["--diffBlob-expander-iconColor"] = grey1;

  // ──────────────────────────────────────────────────────────────────
  // Controls (inputs, toggles, default buttons) — --control-*
  // ──────────────────────────────────────────────────────────────────
  t["--control-bgColor-rest"] = bg1;
  t["--control-bgColor-hover"] = bg2;
  t["--control-bgColor-active"] = bg2;
  t["--control-bgColor-disabled"] = a(grey0, "1a");
  t["--control-fgColor-rest"] = fg;
  t["--control-fgColor-placeholder"] = grey0;
  t["--control-checked-bgColor-rest"] = blue;
  t["--control-checked-bgColor-hover"] = blue;
  t["--control-checked-bgColor-active"] = blue;
  t["--control-checked-bgColor-disabled"] = grey0;
  t["--control-checked-borderColor-rest"] = blue;
  t["--control-danger-fgColor"] = red;
  t["--control-danger-bgColor-hover"] = a(red, "1a");
  t["--control-danger-bgColor-active"] = a(red, "26");
  t["--control-transparent-bgColor-rest"] = "#00000000";
  t["--control-transparent-bgColor-hover"] = a(grey1, "1a");
  t["--control-transparent-bgColor-active"] = a(grey1, "26");
  t["--control-transparent-bgColor-selected"] = a(grey1, "26");
  t["--control-transparent-bgColor-disabled"] = "#00000000";
  t["--control-transparent-borderColor-rest"] = "#00000000";
  t["--control-transparent-borderColor-hover"] = "#00000000";
  t["--control-transparent-borderColor-active"] = "#00000000";
  t["--controlKnob-bgColor-rest"] = warmWhite;
  t["--controlKnob-bgColor-checked"] = warmWhite;
  t["--controlKnob-bgColor-disabled"] = bg2;
  t["--controlKnob-borderColor-rest"] = bg4;
  t["--controlKnob-borderColor-checked"] = blue;
  t["--controlTrack-bgColor-rest"] = bg3;
  t["--controlTrack-bgColor-hover"] = bg4;
  t["--controlTrack-bgColor-active"] = bg4;
  t["--controlTrack-fgColor-rest"] = grey1;
  t["--controlTrack-borderColor-rest"] = "#00000000";

  // ──────────────────────────────────────────────────────────────────
  // Buttons — most cascade from semantic tokens; fix the hardcoded states.
  // ──────────────────────────────────────────────────────────────────
  // Primary (green) button needs readable ink on a pastel/saturated green.
  t["--button-primary-fgColor-rest"] = onEmphasis;
  t["--button-primary-iconColor-rest"] = onEmphasis;
  t["--button-primary-fgColor-disabled"] = a(onEmphasis, "b3");
  t["--button-primary-bgColor-hover"] = a(green, "e6");
  t["--button-primary-bgColor-active"] = a(green, "cc");
  t["--button-primary-bgColor-disabled"] = a(green, "80");
  t["--button-primary-borderColor-rest"] = a(fg, "1a");
  t["--button-default-bgColor-hover"] = bg2;
  t["--button-default-bgColor-active"] = bg3;
  t["--button-danger-fgColor-rest"] = red;
  t["--button-danger-fgColor-hover"] = warmWhite;
  t["--button-danger-iconColor-hover"] = warmWhite;
  t["--button-danger-bgColor-hover"] = red;
  t["--button-danger-bgColor-active"] = a(red, "cc");
  t["--button-outline-fgColor-rest"] = blue;
  t["--button-outline-bgColor-hover"] = blue;
  t["--button-outline-fgColor-hover"] = onEmphasis;
  t["--button-inactive-bgColor"] = bg2;
  t["--button-inactive-fgColor"] = grey1;
  t["--button-star-iconColor"] = yellow;
  t["--buttonCounter-default-bgColor-rest"] = a(grey1, "26");
  t["--buttonCounter-primary-bgColor-rest"] = a(onEmphasis, "26");
  t["--buttonCounter-outline-bgColor-rest"] = a(blue, "26");
  t["--buttonCounter-outline-fgColor-rest"] = blue;
  t["--buttonCounter-danger-bgColor-rest"] = a(red, "26");
  t["--buttonCounter-danger-fgColor-rest"] = red;
  t["--buttonCounter-danger-bgColor-hover"] = red;
  t["--buttonCounter-danger-fgColor-hover"] = warmWhite;

  // ──────────────────────────────────────────────────────────────────
  // Global header / search — --header-*  (legacy global bar)
  // ──────────────────────────────────────────────────────────────────
  t["--header-bgColor"] = bg_dim;
  t["--header-fgColor-default"] = grey1;
  t["--header-fgColor-logo"] = fg;
  t["--header-borderColor-divider"] = bg4;
  t["--headerSearch-bgColor"] = bg0;
  t["--headerSearch-borderColor"] = bg4;

  // ──────────────────────────────────────────────────────────────────
  // Overlays (menus, dialogs, popovers) — --overlay-*
  // ──────────────────────────────────────────────────────────────────
  t["--overlay-bgColor"] = dark ? bg1 : warmWhite;
  t["--overlay-borderColor"] = bg4;
  t["--overlay-backdrop-bgColor"] = a(darkInk, "66");

  // ──────────────────────────────────────────────────────────────────
  // Misc chrome
  // ──────────────────────────────────────────────────────────────────
  t["--selection-bgColor"] = a(blue, "40");
  t["--focus-outline"] = `.125rem solid ${blue}`;
  t["--focus-outlineColor"] = blue;
  t["--underlineNav-borderColor-active"] = orange; // active tab underline
  t["--underlineNav-borderColor-hover"] = a(grey1, "66");
  t["--highlight-neutral-bgColor"] = bg_yellow;    // search-match highlight
  t["--skeletonLoader-bgColor"] = a(grey1, "1a");
  t["--counter-borderColor"] = "#00000000";
  t["--avatar-bgColor"] = bg1;
  t["--avatar-borderColor"] = a(fg, "26");
  t["--avatar-shadow"] = `0 0 0 2px ${a(bg0, "cc")}`;
  t["--avatarStack-fade-bgColor-default"] = bg4;
  t["--avatarStack-fade-bgColor-muted"] = bg3;
  t["--reactionButton-selected-bgColor-rest"] = a(blue, "26");
  t["--reactionButton-selected-bgColor-hover"] = a(blue, "40");
  t["--reactionButton-selected-fgColor-rest"] = blue;
  t["--reactionButton-selected-fgColor-hover"] = blue;
  t["--selectMenu-bgColor-active"] = a(blue, "26");
  t["--selectMenu-borderColor"] = "#00000000";
  t["--sideNav-bgColor-selected"] = bg2;
  t["--topicTag-borderColor"] = "#00000000";
  t["--treeViewItem-leadingVisual-iconColor-rest"] = blue;
  t["--timelineBadge-bgColor"] = bg2;

  // ──────────────────────────────────────────────────────────────────
  // Contribution graph — --contribution-default-bgColor-{0..4}
  // ──────────────────────────────────────────────────────────────────
  t["--contribution-default-bgColor-0"] = bg2;
  t["--contribution-default-bgColor-1"] = a(green, "40");
  t["--contribution-default-bgColor-2"] = a(green, "80");
  t["--contribution-default-bgColor-3"] = a(green, "c0");
  t["--contribution-default-bgColor-4"] = green;
  t["--contribution-default-borderColor-0"] = a(fg, "0d");

  // ──────────────────────────────────────────────────────────────────
  // ANSI terminal palette (Actions logs, rendered ANSI) — --color-ansi-*
  // ──────────────────────────────────────────────────────────────────
  t["--color-ansi-black"] = bg2;
  t["--color-ansi-black-bright"] = bg4;
  t["--color-ansi-white"] = grey2;
  t["--color-ansi-white-bright"] = fg;
  t["--color-ansi-gray"] = grey0;
  t["--color-ansi-red"] = red;
  t["--color-ansi-red-bright"] = red;
  t["--color-ansi-green"] = green;
  t["--color-ansi-green-bright"] = green;
  t["--color-ansi-yellow"] = yellow;
  t["--color-ansi-yellow-bright"] = yellow;
  t["--color-ansi-blue"] = blue;
  t["--color-ansi-blue-bright"] = blue;
  t["--color-ansi-magenta"] = purple;
  t["--color-ansi-magenta-bright"] = purple;
  t["--color-ansi-cyan"] = aqua;
  t["--color-ansi-cyan-bright"] = aqua;

  // ──────────────────────────────────────────────────────────────────
  // Legacy --color-* odds and ends still used in a few places
  // ──────────────────────────────────────────────────────────────────
  t["--color-notifications-row-bg"] = bg0;
  t["--color-notifications-row-read-bg"] = bg_dim;
  t["--color-user-mention-fg"] = fg;
  t["--color-user-mention-bg"] = a(yellow, "26");
  t["--color-project-header-bg"] = bg_dim;
  t["--color-project-sidebar-bg"] = bg0;

  return t;
}

/** Tokens whose value depends on the background ladder (i.e. on contrast). */
export const CONTRAST_SENSITIVE_NOTE =
  "Computed by diffing buildTokens(medium) vs buildTokens(hard|soft) in build.ts.";
