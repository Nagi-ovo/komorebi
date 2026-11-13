# 网页主题交互检查 · 2026-10-10

本轮在 Chrome 实际打开页面、菜单和设置后定位问题，随后用原生组件的颜色消费方式建立回归检查。下面的实站记录来自当前浏览器加载的旧版；新代码已经构建到 `dist/`，真实网页的修复结果仍需重新加载本地扩展后验证。

## 实际检查范围

| 站点 | 已打开的页面或交互 | 发现与处理 |
| --- | --- | --- |
| Grok | 首页、模型菜单、附件菜单、账户菜单、Settings 的 Account/Appearance、搜索、Library 的 All/Files 及 View options、Automations/Run history、Imagine 及 Aspect Ratio、历史对话及引用侧栏 | 原生 `--surface-*`、`--fg-*` 使用完整颜色，适配却提供 HSL 分量，导致弹窗和菜单透明。修正格式及加载后追加的样式；补齐输入框和消息气泡变量；缩小侧栏背景规则，保留顶部导航和引用面板各自的表面。 |
| Gmail | 收件箱、快速设置、高级搜索 | 快速设置 `.IU` 和高级搜索 `.SK.ZF-zT` 漏适配，背景仍是纯白；补齐两种独立容器。 |
| YouTube | 首页、账户菜单、Appearance 子菜单、Keyboard shortcuts 弹窗 | 组件使用固定白色/黑色，已有变量覆盖无效；补齐组件背景、文字、边框。 |
| Google | 搜索结果、AI Overview、Tools 菜单、Any time 子菜单、Custom range 日期弹窗 | Tools 的独立弹层不在结果区域内，仍是白色；补齐该容器、按钮状态和独立日期弹窗。 |
| Drive | My Drive、高级搜索、文件类型下拉、设置菜单、General 设置页 | 高级搜索和选中控件直接使用独立 `--gm3-*` 变量，未跟随 `--dt-*`；补齐完整颜色及 RGB 状态层。 |
| X | 首页、More 菜单、Settings、Accessibility/display/languages、Display | Display 的白色设置卡片漏适配；只修改卡片外壳，保留颜色和背景预览。 |
| ChatGPT | 对话、模型菜单、账户菜单、设置的 General/Appearance | 新的应用和设置页面使用 `--app-color-*`、`--color-token-*` 等变量；补齐适配及嵌套主题宿主。 |
| Claude | 对话、账户菜单、Settings 的 General/Capabilities、搜索弹窗 | 本轮打开的菜单及弹窗未复现透明/纯白背景问题；保留前轮输入框周围背景和文字修正。 |
| GitHub | 仓库页、Code 克隆菜单 | 本轮已打开面板未复现漏适配背景；保留前轮文字角色修正。 |
| Docs | 文档首页、Sort options、文档编辑器、View 菜单 | 已打开菜单背景协调，工具栏和文档画布可区分；文档内容保留原始颜色。 |
| Outlook | 已打开邮件、Settings、Message List 设置、搜索 Filters | 已打开设置面板未复现透明/纯白背景问题；保留前轮文字修正。 |
| Bilibili | 首页、搜索历史和热搜建议 | 已打开搜索面板未复现漏适配背景；封面图片保留。 |
| arXiv | HTML 论文、目录开关 | 当前论文可读；保留前轮正文和次要文字修正。 |
| Gemini | 已打开对话 | 根元素为 `data-ef="off"`，此站当前关闭扩展，未改变用户选择，不能据此验证主题。 |
| Cloudflare | 登录页 | 控制台未登录，未验证登录后的页面。 |

## 回归方法

运行 `bun run test:visual`，在 Chrome 打开 `http://localhost:8718/test/fixtures/theme-compatibility.html`。

检查包含 15 站文字颜色、浅色/深色/系统模式、关闭后的原生恢复，以及 Grok/Gmail/YouTube/Google/Drive/X 的独立组件。Grok 使用原生的 `background-color: var(--surface-base)` 消费方式，并加载 `src/content.ts` 中真实的后置样式字符串，避免旧夹具错误地使用 `hsl(var(--surface-base))` 掩盖缺陷。

附加 `?baseline=1` 可加载 HEAD 的站点 CSS 和 Grok 后置样式，检验回归能否识别旧问题。GitHub 基线使用当前生成样式，因此此比较不包含 GitHub 的历史版本。

这些检查是可重复的组件回归，不等于所有实际页面都已验证。真实网页更新后需复查上表中修复的组件；Google、Gmail、X 的哈希类名也可能随站点更新改变。

本轮验证：`bun test` 90 项通过，类型检查、构建、`git diff --check` 通过；Chrome 组件回归 184/184 通过。新的 Grok/Drive 颜色契约测试对 HEAD 源码为 0 通过、2 失败，对修复后的源码为 2 通过、0 失败。

## 2026-11-11 实站复查（浅色 + 深色）

新版已加载到实际 Chrome，逐站打开菜单和弹窗，浅色、深色各检查一遍。

- Grok：⌘K 历史搜索面板及预览确认不透明。`--fg-invert` 改为与 `surface-invert`/`button-filled` 成对的反色（原来是深底深字，例如首页「See plans」）；补 `--fg-link-hover` 和设置页写死颜色的 Premium 标签。
- X：头像悬停卡片 `[data-testid=HoverCard]` 没有 role，原有 `#layers` 规则匹配不到，所以一直是白底。现在只给卡片外壳上色，头像的多层结构一层都不碰；深色下的中性灰分隔线也已重映射。
- YouTube：新版 `yt-sheet-view-model` 菜单和「保存到」弹窗改用哈希 token，已补映射，并加了类名兜底。
- Google（深色）：搜索建议、「更多」菜单、「关于此结果」面板里的按钮。
- Gmail（深色）：侧栏、工具栏、勾选框、星标和分类图标原为深色位图，统一压黑后反色。
- ChatGPT、Claude、Docs、Outlook、arXiv：补齐新组件库的 token 和写死的灰字。Claude 的代码块在其主题与本扩展模式不一致时反色。
- Gemini：⌘⇧K 搜索对话框补了哈希 `--x…` 变量，Gemini 每次重建这些名字都会变。
- GitHub：深色下 `--controlKnob-bgColor-*` 改为深色，修复 Code → Local 菜单分段控件选中项浅字配浅底。

未覆盖：Drive 的 ogs.google.com 跨域 iframe 推广条；其他扩展（Super arXiv、Voyager）的面板；YouTube 和 B 站视频页。
