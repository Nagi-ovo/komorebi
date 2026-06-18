<p align="center">
  <img src="assets/logo.svg" width="104" alt="Everforest for GitHub" />
</p>

<h1 align="center">Everforest for GitHub</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <b>日本語</b>
</p>

<p align="center">
  <img src="demo/preview.svg" alt="Everforest for GitHub — ライトとダーク" width="860" />
</p>

<p align="center">
  <a href="https://github.com/sainnhe/everforest">Everforest</a> のパレットで GitHub を塗り替え——
  暖かく、低コントラストで、目にやさしく。<br/>
  ライト &amp; ダーク、soft / medium / hard の 3 段階コントラスト、ブラウザ本体用のテーマも同梱。
</p>

---

ツールバーのポップアップで外観を選ぶだけ——**Sync**（GitHub に追従）、**Light**、**Dark**——即座に反映されます。それだけ。

<details>
<summary><b>インストール</b></summary>

<br/>

まだ Web ストアには出していません。**最も簡単な方法:** [**Releases**](../../releases) から
`everforest-for-github.zip` をダウンロードして展開し、`chrome://extensions` で**デベロッパーモード**を有効化 →
**パッケージ化されていない拡張機能を読み込む** → 展開したフォルダを選択。

またはソースからビルド:

```bash
bun install && bun run build   # その後 dist/ を読み込む
```

</details>

<details>
<summary><b>ブラウザもテーマ化</b>——タブ・ツールバー・新しいタブ</summary>

<br/>

拡張機能と一緒に、対応するブラウザテーマも配布しています——[Releases](../../releases) の
`everforest-browser-dark.zip` / `everforest-browser-light.zip`（または `bun run build` → `chrome-themes/`）。
**どちらか一方**を読み込んでください。

ブラウザテーマは読み込むと即座に適用され、拡張機能一覧ではなく **設定 → デザイン**
（`chrome://settings/appearance`）で管理します——同時に有効化できるのは 1 つだけです。

</details>

<details>
<summary><b>開発</b></summary>

<br/>

```bash
bun run build       # dist/ + chrome-themes/
bun run watch       # 変更を監視して再ビルド
bun run typecheck
```

`palette.ts` → `mapping.ts`（GitHub Primer トークン → Everforest）→ `build.ts` が
`dist/theme.css` を生成。コンテンツスクリプトは `<html>` の `data-ef-*` を切り替えるだけです。
1 つのパレットが拡張機能・ブラウザテーマ・プレビューのすべてを駆動します。
`demo/index.html` はモックデータによるライト / ダーク / コントラストのライブプレビューです。

</details>

## 謝辞

**[Everforest](https://github.com/sainnhe/everforest)**（作者 **[@sainnhe](https://github.com/sainnhe)**）
へのオマージュです——そのパレットがこのプロジェクトの心臓部です。気に入ったら、ぜひ本家に ★ を。🌲

> 独立したオープンソースのテーマであり、GitHub, Inc. とは無関係で、承認も受けていません。
> 「GitHub」は GitHub, Inc. の商標です · Everforest は MIT ライセンスです。

## ライセンス

MIT
