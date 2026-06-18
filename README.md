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

Not on the Web Store yet, so load it unpacked:

```bash
bun install && bun run build
```

In `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and choose `dist/`.
After pulling changes, run `bun run build` again and hit **Reload** on the extension card.

</details>

<details>
<summary><b>Theme the browser too</b> — tabs, toolbar, new tab</summary>

<br/>

`bun run build` also emits matching browser themes. Load **one** unpacked, same as above:

- `chrome-themes/everforest-dark`
- `chrome-themes/everforest-light`

A browser theme applies immediately and lives under **Settings → Appearance**
(`chrome://settings/appearance`), not the extensions list. Only one can be active at a time;
loading the other replaces it.

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
