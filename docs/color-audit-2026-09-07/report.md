# Everforest 多站点配色优化 · 2026-09-07

本轮修改覆盖 15 类受支持站点。重点让操作、选中状态、链接和辅助信息各有颜色职责，保留 Everforest 的米色阅读底和原始媒体内容。

## Before → After

| 部位 | Before | After |
|---|---|---|
| 主要操作 | 黑色、原生蓝/粉色、浅绿混用 | 浅色模式深橄榄绿 `#5f7100` + 米白 `#fdf6e3`；深色模式绿 `#a7c080` + 深底字 `#2d353b` |
| 当前导航/筛选 | 灰米色、原生蓝、黑色 | 柔绿选中底，配绿色或高对比文字 |
| 正文链接 | 部分浅蓝可读性不足 | Google/GitHub/arXiv 等改更深蓝 `#28678a`；已访问链接使用柔紫 |
| X 互动 | 转帖荧光绿、喜欢亮粉 | Everforest 绿转帖、紫色喜欢；认证标识保留原蓝 |
| AI 页面 | 大块米色，按钮或内层文字仍原生色 | 绿主操作、柔绿当前项、蓝正文链接，Claude Pro / Gemini 辅助类别用紫 |
| 邮件/文件 | 蓝色主按钮和选中项混在一起 | 主操作绿、选中柔绿、信息提示蓝、辅助类别紫 |
| Bilibili 空间页 | 粉色投稿、蓝色当前导航与排序 | 绿色投稿和排序，柔绿当前导航；封面、横幅不变色 |
| arXiv 摘要页 | 新页头未命中，工具标签原生白蓝 | 页头深森林色、工具标签柔绿、PDF 入口绿、引用入口紫 |

黄色/橙色继续承担提醒，红色保留错误和危险操作语义；不为了增加彩色面积而重染照片、视频、文档内容或认证标识。

## 真实 Chrome 路由检查

下表区分实际打开的页面与未覆盖范围；不代表所有路由、所有交互状态均通过。

| 站点 | 本轮实际检查的页面/路由 | 范围说明 |
|---|---|---|
| X | 帖子、`/Nag1ovo`、`/Nag1ovo/following`、`/i/history/likes`、`/i/history` | 旧 `/likes`、`/i/bookmarks` 会转到新版历史页面；逐页检查选中项、喜欢和关注按钮 |
| GitHub | release 详情、`/Nagi-ovo/voyager/issues` | New issue 实测绿底米白字 |
| Google | 普通搜索、图片搜索 | 当前搜索类别、链接、图片原色 |
| ChatGPT | 首页/输入框 | 发现并补齐新版语音按钮；未发送消息 |
| Claude | 首页、`/artifacts` | 新建 Artifact 按钮、列表和缩略图；未创建内容 |
| Gemini | `/app`、`/library` | 临时启用主题；发现点击后的资料库标题浅字问题并修复 |
| Grok | 既有对话、`/library` | 修复后注入 CSS 覆盖主操作 token 的问题 |
| Gmail | 收件箱、`#starred` | 临时启用主题；Compose 实测绿底米白字；未改动草稿 |
| Outlook | 收件箱与既有邮件阅读页面 | 界面与邮件正文区分；未发送邮件 |
| Drive | 首页、`/drive/u/0/starred` | 星标导航旧类名和布局选择按钮需要局部补色 |
| Docs | 文档列表首页 | 本次未进入 Docs/Sheets/Slides 编辑器；保留原有用户修改 |
| Bilibili | 空间主页、空间投稿列表、视频页 | 发现新版上传/排序/导航类名，与旧选择器并存 |
| YouTube | 视频页、首页、`/feed/history` | 首页和历史使用不同 chip 组件，分别补齐；未操作清空历史 |
| arXiv | 摘要页、HTML 论文页 | 摘要页 PDF 入口和 labs 标签核验；其他扩展的工具条保留原样 |
| Cloudflare | 账户首页、Workers/Pages 列表、Worker 概述、部署、KV 列表、域名概览 | 用户打开已登录页面后补齐真实 Chrome 检查；新增 Kumo token、主按钮、选中标签与 KV 表格修复 |

## 实屏复查发现并修复

- Bilibili `.header-upload-entry`、`.nav-tab__item.active`、`.radio-filter__item--active` 与旧版本类名不同。
- YouTube 观看历史使用 `.ytChipShapeActive`，首页旧 chip 规则无法覆盖。
- Drive 星标导航将背景画在 treeitem 的内层 link，单改基础 token 不足。
- Gemini 当前导航点击后，内层 Material 文本仍读到原生深色主题浅字。
- ChatGPT 语音按钮用 `.composer-submit-button-color`，仅匹配 send/stop testid 会漏掉。
- arXiv 正文链接选择器包含 ID，优先级高于下载入口，导致蓝字绿底；已提高对应规则优先级。
- Claude CSS 注释中意外出现结束符，导致部分主题根规则失效；已修正。
- Grok 的页面后注入样式覆盖了新的主操作 token；已同步背景与前景。

## 验证记录

- `bun run build` 成功，并通过 Chrome 扩展页重载本地 Komorebi。
- `bun test`：70 pass、0 fail，212 assertions。
- `bun run typecheck`、`git diff --check` 通过。
- 实测浅色主要操作配对：GitHub New issue、Gmail Compose、ChatGPT 语音、Bilibili 投稿/排序、arXiv PDF 均为 `#5f7100` / `#fdf6e3`，对比度约 **5.06:1**。
- 深色主要操作 token 配对对比度约 **6.23:1**；这是颜色计算，不等同于所有站点深色实屏验证。
- 当前深色实屏验证等待手动切换：浏览器安全策略拦截直接打开扩展设置 URL，未绕过。
- Gmail、Gemini 原本关闭，验证时临时打开。需在结束时恢复关闭；外观原本 Light。

本报告为文字和颜色值的 Before/After 汇报；本轮工具中查看了真实截图，但没有将它们保存成可交付的截图文件，也没有用旧任务截图冒充本轮对照。

最终重载后的子路由计算样式核验：

| 实际控件 | 背景 | 文字 |
|---|---|---|
| Drive 星标导航、列表布局选项 | `#e6ead0` | `#526200` |
| YouTube 观看历史 All chip | `#5f7100` | `#fdf6e3` |
| Gemini Library 当前项目标题 | 柔绿主题背景 | `#536300`，两处导航实例一致 |
| Grok Library Upload files | `#5f7100` | `rgb(253,246,226)`（HSL 舍入） |
| Outlook New email | `#5f7100` | `#fdf6e3` |

Gemini 深色选中标题进一步改成 `#d3c6aa` / `#425047`，计算对比度 **5.03:1**。Grok 资料库上传按钮另补内层前景覆盖，防止深字落在深绿底上。

## Cloudflare 已登录补验

用户打开账户后实际检查了 6 类页面，移除此前登录阻塞记录。

| Before | After |
|---|---|
| 新 Kumo canvas 仍为近白，标题/导航原生黑灰 | Everforest 米色底、灰绿文字，柔绿当前导航 |
| 主按钮将 brand 混白并强制白字 | 实色 `#5f7100` + `#fdf6e3`，实测生效 |
| Worker 部署当前 tab 灰色 | 柔绿选中底 |
| KV 表头及固定操作列仍原生灰白渐变 | 表头 `#f4f0d9`、操作列 `#fffbef`，移除白色渐变 |

根因是新版 `--color-kumo-*` / `--text-color-kumo-*` 命名空间未完整映射，以及 Tailwind 分层的 `!text-white` 优先于无层的 important 规则。前景覆盖放入已存在的 `cf` 层。保留品牌橙色和危险/警告语义。

已重新构建、重载扩展、刷新用户原有首页，并检查上述 computed styles。70 项测试、类型检查、diff 检查通过。没有修改 Cloudflare 资源、配置或部署。深色实屏仍未验证。
