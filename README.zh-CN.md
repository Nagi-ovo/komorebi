<p align="center">
  <img src="assets/logo.svg" width="104" alt="Komorebi" />
</p>

<h1 align="center">Komorebi</h1>

<p align="center"><sub><b>木漏れ日</b> — 叶隙间洒下的光</sub></p>

<p align="center">
  <a href="README.md">English</a> · <b>简体中文</b> · <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/komorebi/neffpnembhpgfdhfpodffkoefklmodoi">
    <img src="https://img.shields.io/chrome-web-store/v/neffpnembhpgfdhfpodffkoefklmodoi?label=Chrome%20Web%20Store&labelColor=2D353B&color=8DA101&logo=googlechrome&logoColor=A7C080" alt="Chrome 应用商店" />
  </a>
</p>

<p align="center">
  <img src="demo/preview.svg" alt="Komorebi — 明暗效果" width="860" />
</p>

<p align="center">
  一个让网页安静下来的主题 —— GitHub、Google 搜索和 X —— 基于
  <a href="https://github.com/sainnhe/everforest">Everforest</a> 配色。<br/>
  温暖、低对比、护眼。明暗双色,并附同款浏览器主题。
</p>

---

在工具栏弹窗里选外观 —— **Sync**、**Light** 或 **Dark** —— 还能**按站点**(GitHub / Google / X)
单独开关,即刻生效。

<details>
<summary><b>安装</b></summary>

<br/>

**[从 Chrome 应用商店安装](https://chromewebstore.google.com/detail/komorebi/neffpnembhpgfdhfpodffkoefklmodoi)** —— 一键装好,自动更新。

想自己加载?从 [**Releases**](../../releases) 下载 `komorebi.zip`,解压,然后在
`chrome://extensions` 打开**开发者模式** → **加载已解压的扩展程序** → 选择解压出的文件夹。

或者从源码构建:

```bash
bun install && bun run build   # 然后加载已解压的 dist/
```

</details>

<details>
<summary><b>也给浏览器换肤</b> —— 标签页、工具栏、新标签页</summary>

<br/>

[Releases](../../releases) 里的 `komorebi-browser-dark.zip` / `komorebi-browser-light.zip`
(或 `bun run build` → `chrome-themes/`)。**任选其一**加载。

浏览器主题加载后立即生效,归 **设置 → 外观**(`chrome://settings/appearance`)管理,
不在扩展列表里 —— 同一时间只能启用一个。

</details>

<details>
<summary><b>开发</b></summary>

<br/>

```bash
bun run build       # dist/ + chrome-themes/
bun run watch       # 改动即重建
bun run typecheck
```

`palette.ts` → `mapping.ts` → `build.ts` 生成 `dist/theme.css`(GitHub);各站点的小样式表
(`google.css`、`x.css`)覆盖其余站点;内容脚本只负责在 `<html>` 上切换 `data-ef-*`。
`demo/index.html` 是基于 mock 数据的明暗实时预览。

</details>

## 致谢

Komorebi 建立在 **[Everforest](https://github.com/sainnhe/everforest)**(作者
**[@sainnhe](https://github.com/sainnhe)**)之上 —— 它的调色板是本项目的灵魂。如果你喜欢这里的效果,
请去给原项目点个 ★。🌲

> 独立开源 —— 与 GitHub、Google、X 均无隶属、未获其背书;提及其名仅为说明主题覆盖范围。
> Everforest 采用 MIT 许可。

## 许可

MIT
