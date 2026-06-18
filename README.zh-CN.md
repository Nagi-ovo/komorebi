<p align="center">
  <img src="assets/logo.svg" width="104" alt="Everforest for GitHub" />
</p>

<h1 align="center">Everforest for GitHub</h1>

<p align="center">
  <a href="README.md">English</a> · <b>简体中文</b> · <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="demo/preview.svg" alt="Everforest for GitHub — 明暗效果" width="860" />
</p>

<p align="center">
  用 <a href="https://github.com/sainnhe/everforest">Everforest</a> 配色重绘 GitHub——
  温暖、低对比、护眼。<br/>
  明暗双色,soft / medium / hard 三档对比度,并附带同款浏览器主题。
</p>

---

在工具栏弹窗里选外观——**Sync**(跟随 GitHub)、**Light** 或 **Dark**——即刻生效。就这么简单。

<details>
<summary><b>安装</b></summary>

<br/>

还没上架 Web Store。**最省事:**从 [**Releases**](../../releases) 下载 `everforest-for-github.zip`,
解压,然后在 `chrome://extensions` 打开**开发者模式** → **加载已解压的扩展程序** → 选择解压出的文件夹。

或者从源码构建:

```bash
bun install && bun run build   # 然后加载已解压的 dist/
```

</details>

<details>
<summary><b>也给浏览器换肤</b>——标签页、工具栏、新标签页</summary>

<br/>

配套的浏览器主题与扩展一同发布——[Releases](../../releases) 里的 `everforest-browser-dark.zip` /
`everforest-browser-light.zip`(或 `bun run build` → `chrome-themes/`)。**任选其一**加载。

浏览器主题加载后立即生效,归 **设置 → 外观**(`chrome://settings/appearance`)管理,
不在扩展列表里——同一时间只能启用一个。

</details>

<details>
<summary><b>开发</b></summary>

<br/>

```bash
bun run build       # dist/ + chrome-themes/
bun run watch       # 改动即重建
bun run typecheck
```

`palette.ts` → `mapping.ts`(GitHub Primer 令牌 → Everforest)→ `build.ts` 生成
`dist/theme.css`;内容脚本只负责在 `<html>` 上切换 `data-ef-*`。一套调色板同时驱动扩展、
浏览器主题和预览图。`demo/index.html` 是基于 mock 数据的明暗 / 对比度实时预览。

</details>

## 致谢

向 **[Everforest](https://github.com/sainnhe/everforest)**(作者 **[@sainnhe](https://github.com/sainnhe)**)
致敬——它的调色板是本项目的灵魂。如果你喜欢这里的效果,请去给原项目点个 ★。🌲

> 独立开源主题——与 GitHub, Inc. 无隶属、未获其背书。
> “GitHub” 是 GitHub, Inc. 的商标 · Everforest 采用 MIT 许可。

## 许可

MIT
