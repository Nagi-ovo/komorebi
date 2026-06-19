<p align="center">
  <img src="assets/logo.svg" width="104" alt="Komorebi" />
</p>

<h1 align="center">Komorebi</h1>

<p align="center"><sub><b>木漏れ日</b> — 葉の隙間からこぼれる光</sub></p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <b>日本語</b>
</p>

<p align="center">
  <img src="demo/preview.svg" alt="Komorebi — ライトとダーク" width="860" />
</p>

<p align="center">
  ウェブを静かに整えるテーマ —— GitHub・Google 検索・X —— 
  <a href="https://github.com/sainnhe/everforest">Everforest</a> パレットがベース。<br/>
  暖かく、低コントラストで、目にやさしく。ライト &amp; ダーク、ブラウザテーマ同梱。
</p>

---

ツールバーのポップアップで外観を選び —— **Sync**・**Light**・**Dark** —— **サイトごと**
（GitHub / Google / X）にオン・オフでき、即座に反映されます。

<details>
<summary><b>インストール</b></summary>

<br/>

まだ Web ストアには出していません。**最も簡単な方法:** [**Releases**](../../releases) から
`komorebi.zip` をダウンロードして展開し、`chrome://extensions` で**デベロッパーモード**を有効化 →
**パッケージ化されていない拡張機能を読み込む** → 展開したフォルダを選択。

またはソースからビルド:

```bash
bun install && bun run build   # その後 dist/ を読み込む
```

</details>

<details>
<summary><b>ブラウザもテーマ化</b> —— タブ・ツールバー・新しいタブ</summary>

<br/>

[Releases](../../releases) の `komorebi-browser-dark.zip` / `komorebi-browser-light.zip`
（または `bun run build` → `chrome-themes/`）。**どちらか一方**を読み込んでください。

ブラウザテーマは読み込むと即座に適用され、拡張機能一覧ではなく **設定 → デザイン**
（`chrome://settings/appearance`）で管理します —— 同時に有効化できるのは 1 つだけです。

</details>

<details>
<summary><b>開発</b></summary>

<br/>

```bash
bun run build       # dist/ + chrome-themes/
bun run watch       # 変更を監視して再ビルド
bun run typecheck
```

`palette.ts` → `mapping.ts` → `build.ts` が `dist/theme.css`（GitHub）を生成。サイトごとの小さな
スタイルシート（`google.css`・`x.css`）が他サイトを担当し、コンテンツスクリプトは `<html>` の
`data-ef-*` を切り替えるだけです。`demo/index.html` はモックデータのライブプレビューです。

</details>

## 謝辞

Komorebi は **[@sainnhe](https://github.com/sainnhe)** さんの
**[Everforest](https://github.com/sainnhe/everforest)** を土台にしています —— そのパレットが
このプロジェクトの心臓部です。気に入ったら、ぜひ本家に ★ を。🌲

> 独立したオープンソースであり、GitHub・Google・X とは無関係で、承認も受けていません。
> 各社名はテーマの対象を説明するためにのみ使用しています。Everforest は MIT ライセンスです。

## ライセンス

MIT
