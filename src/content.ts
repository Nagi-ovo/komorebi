/**
 * Content script — runs at document_start on GitHub.
 *
 * The actual theming lives in theme.css (injected by the manifest before this
 * runs, so the default ON + sync + medium experience paints with zero flash).
 * This script's only job is to reflect the user's saved settings onto <html>
 * as data-ef-* attributes, and keep them in sync live when the popup changes
 * them. It deliberately does no styling itself.
 */

import { loadSettings, onSettingsChanged, type Settings } from "./settings";

const root = document.documentElement;

function apply(s: Settings): void {
  // Master switch: presence of data-ef="off" disables every theme rule.
  if (s.enabled) root.removeAttribute("data-ef");
  else root.setAttribute("data-ef", "off");

  // Mode: "sync" is the implicit default (no attribute) so the flash-free
  // CSS keeps working; only an explicit override writes the attribute.
  if (s.mode === "sync") root.removeAttribute("data-ef-mode");
  else root.setAttribute("data-ef-mode", s.mode);

  // Contrast: "medium" is the implicit default (no attribute).
  if (s.contrast === "medium") root.removeAttribute("data-ef-contrast");
  else root.setAttribute("data-ef-contrast", s.contrast);
}

loadSettings().then(apply);
onSettingsChanged(apply);
