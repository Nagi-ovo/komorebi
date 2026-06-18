# Everforest for GitHub

<p align="center">
  <img src="demo/preview.svg" alt="Everforest for GitHub — light and dark" width="860" />
</p>

<p align="center">
  Restyle GitHub with the <a href="https://github.com/sainnhe/everforest">Everforest</a> palette —
  warm, low-contrast, easy on the eyes.<br/>
  Light &amp; dark, in soft / medium / hard contrast, with matching themes for the browser itself.
</p>

---

Pick your look from the toolbar popup — **Sync** (follow GitHub), **Light**, or **Dark** — and it
applies instantly. That's it.

<details>
<summary><b>Install</b></summary>

<br/>

Not on the Web Store yet. **Easiest:** grab `everforest-for-github.zip` from
[**Releases**](../../releases), unzip it, then in `chrome://extensions` enable **Developer mode** →
**Load unpacked** → pick the unzipped folder.

Or build from source:

```bash
bun install && bun run build   # then load unpacked dist/
```

</details>

<details>
<summary><b>Theme the browser too</b> — tabs, toolbar, new tab</summary>

<br/>

Matching browser themes ship alongside the extension — `everforest-browser-dark.zip` /
`everforest-browser-light.zip` in [Releases](../../releases) (or `bun run build` → `chrome-themes/`).
Load **one** unpacked.

A browser theme applies immediately and lives under **Settings → Appearance**
(`chrome://settings/appearance`), not the extensions list — only one can be active at a time.

</details>

<details>
<summary><b>Development</b></summary>

<br/>

```bash
bun run build       # dist/ + chrome-themes/
bun run watch       # rebuild on change
bun run typecheck
```

`palette.ts` → `mapping.ts` (GitHub Primer token → Everforest) → `build.ts` generates
`dist/theme.css`; the content script only toggles `data-ef-*` on `<html>`. One palette drives the
extension, the browser themes, and the preview. `demo/index.html` is a live light/dark/contrast
preview built on mock data.

</details>

## Acknowledgements

A tribute to **[Everforest](https://github.com/sainnhe/everforest)** by
**[@sainnhe](https://github.com/sainnhe)** — its palette is the heart of this project. If you enjoy
it here, please ★ the original. 🌲

> Independent, open-source theme — not affiliated with or endorsed by GitHub, Inc.
> “GitHub” is a trademark of GitHub, Inc. · Everforest is MIT-licensed.

## License

MIT
