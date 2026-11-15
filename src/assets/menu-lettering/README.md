# 菜单装饰字轮廓

这里只保存固定文案的 SVG 轮廓，不包含可安装字体。构建时由 `scripts/menu-lettering.mjs` 内嵌到 CSS；不请求网络字体，不依赖本机字体，不改动正文排版。

| 文件 | 字体来源 | 字面高度 | 字距 | 用途 |
| --- | --- | --- | --- | --- |
| `rail.svg` | Saira Stencil One Regular | 6px | 字列总宽固定 51px | P.R.T.S. 侧轨 |
| `header.svg` | Montserrat SemiBold | 6px | 0.5px | RHODES ISLAND 票头 |
| `captions.svg` | Orbitron Bold | 7px | 0.7px | 七种语义分类 |

Saira Stencil One 来源为 [Google Fonts 官方字体仓库](https://github.com/google/fonts) 中的 `ofl/sairastencilone/SairaStencilOne-Regular.ttf`；Montserrat 来源为[字体作者仓库](https://github.com/JulietaUla/Montserrat) 中的 `fonts/ttf/Montserrat-SemiBold.ttf`（Version 9.000）；Orbitron 来源为 [The League of Moveable Type 的字体仓库](https://github.com/theleagueof/orbitron) 中的 `Orbitron Bold.ttf`，与选型预览 B 使用同一源文件，许可来自同仓库的 `Open Font License.markdown`。取用日期：2026-11-15。字体源文件 SHA256：

- Saira Stencil One：`781496fdaf8e04cf6741b31025f6b4ba84f66021b097a8e0d85cbea2180cf223`
- Montserrat：`b4e1563393d73fdff491a869441245aef31add2ec03d9c97a6dae4de07c52fd0`
- Orbitron：`ed4acd72c6ef9ff4d1a2558ba72f2b85b411830a8aa2eb59f1c20b3a1127990c`

使用 opentype.js 1.3.4 提取字形，按 H 的实际字面高度归一化，保留字体自身字距调整，不合成加粗或横向拉伸。票头在目标字距基础上将各字形的左侧字面边缘对齐整像素（单字位移不超过 0.5px），减少小尺寸竖笔画发虚；不改字形轮廓。路径坐标保留两位小数，重复字形通过 SVG 内部 `defs` / `use` 复用。侧轨原点为 `(11, 8)`，旋转 90°；票头左端为 8px、基线为 15px；分类中心为 35.5px、基线为 16px，每帧间隔 24px。

票头参考[明日方舟官网](https://ak.hypergryph.com/)中 `RHODES ISLAND` 的宽体几何字形，而不是继续使用高窄体。2026-11-15 核对官网 CSS，页脚该文案继承 `Novecentosanswide-Medium`，罗德岛介绍标题使用 `Novecentosanswide-Bold`。参照样式表为 `https://web.hycdn.cn/arknights/official/_next/static/css/6aed155137c3fe93.css`。主题使用具有开源许可的 Montserrat 近似其比例和几何结构，不复制官网字库，不声称是官方原字体，也不通过横向拉伸模拟宽体。

分类字形通过 SVGO 4.0.0 的 `convertPathData` 简化路径指令，保留两位小数精度、字面高度、字距和分类居中位置；不改变黄标或菜单尺寸。此优化仅在生成资产时运行，不引入运行时依赖。

三份 SVG 合计约 9.6KiB，限制在 10KiB 内，不打包完整 TTF 或字体解析器。源字体的版权和 SIL OFL 1.1 全文分别保存在同目录三份 `*-OFL.txt` 中。
