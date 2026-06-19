/**
 * Content script — runs at document_start on the supported sites.
 *
 * The theming lives in the injected CSS; this script only reflects the saved
 * settings onto <html> as data-ef-* attributes, honouring both the master
 * switch and the per-site toggle, and keeps them in sync when the popup changes.
 */

import { loadSettings, onSettingsChanged, siteForHost, type Settings } from "./settings";

const root = document.documentElement;
const site = siteForHost(location.hostname);

function apply(s: Settings): void {
  const on = s.enabled && (site ? s.sites[site] !== false : true);
  if (on) root.removeAttribute("data-ef");
  else root.setAttribute("data-ef", "off");

  if (s.mode === "sync") root.removeAttribute("data-ef-mode");
  else root.setAttribute("data-ef-mode", s.mode);

  if (s.contrast === "medium") root.removeAttribute("data-ef-contrast");
  else root.setAttribute("data-ef-contrast", s.contrast);
}

loadSettings().then(apply);
onSettingsChanged(apply);
