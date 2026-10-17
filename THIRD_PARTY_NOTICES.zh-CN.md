# 第三方及明日方舟相关素材说明

[English](THIRD_PARTY_NOTICES.md) | 简体中文

本文件仅记录素材来源和许可边界，不构成、也不暗示本项目已获准收录、发布或再分发下列任何第三方素材。

## 代码

本包中的 JavaScript、CSS、构建脚本、测试，以及面向 DSH 独立创作的矢量界面设计，适用 `LICENSE` 中的 MIT 许可证。

## 具有明日方舟识别特征的第三方素材

“明日方舟”（Arknights）、罗德岛（Rhodes Island）、P.R.T.S.、RIIC 及相关名称、角色、符号和视觉标识，涉及其各自权利人的权益，包括鹰角网络及游戏各地区发行方。

以下随包提供的素材明确不属于 MIT 许可证的授权范围：

- `src/assets/faction-emblems/*.png`：从鹰角网络公开的[明日方舟官方网站](https://ak.hypergryph.com/) 获取的透明阵营标识原图，未经修改，包括罗德岛、龙门、企鹅物流、莱茵生命和整合运动。源文件可公开访问，本身并不授予再利用或再分发权利；
- `src/assets/rhodes-dsh.svg`：基于具有可识别特征的罗德岛徽记重新绘制的衍生图形，用于 P.R.T.S. 顶栏；
- `src/assets/prts-original-avatar.png`：从 [Arknights Wiki 对应页面](https://arknights.wiki.gg/wiki/File:PRTS.png) 获取的 180×180 P.R.T.S. 头像原图。该 Wiki 页面的合理使用标注仅适用于其页面，并不授予本包或其用户再利用、再分发该图像的许可；
- 为呈现同人主题而使用的、具有作品识别特征的名称标签及界面视觉元素。

P.R.T.S. 头像、阵营标识及衍生徽记仅收录于个人、非商业同人主题构建中，不作重新授权。免费或非商业使用本身不意味着已经获得权利人许可。

本项目不授予复制、修改、再分发、再许可或商业使用上述排除素材的权利。所需许可应由相应权利人授予。本说明本身不使这些素材的收录或公开分发获得授权。

## 关联关系与权利归属

本项目为非官方项目，不主张获得原作品相关方的背书、隶属关系或授权，也不主张拥有原作品权利。相关角色、美术、符号、商标及作品权利，仍归各自权利人所有，包括鹰角网络及游戏各地区发行方。

## 政策参考

明日方舟国际服官网公布了 [Terms and Conditions of Re-creation](https://www.arknights.global/fankit/guidelines)（再创作条款）及单独的 [Fan Kit Terms and Conditions of Use](https://www.arknights.global/fankit/precautions)（素材包使用条款），可供参考。这些条款可能变更，也可能仅适用于特定地区或素材，不构成针对本包的专门许可。

## 权利人请求

相关权利人或其授权代表可通过本仓库的 Issue 提交移除或署名请求。为便于识别和核查，请说明请求人身份、涉及的文件或素材、相关权利，以及后续联系渠道。

收到可核实的请求后，项目维护者会及时审查，并可能暂停相关版本的公开分发、移除或替换相关素材，或更新署名及来源记录。此流程不表示相关素材此前已获授权，也不限制或放弃权利人的任何权利或救济途径。

## PRTS 手形、文本与调整大小光标

- 文件：`src/assets/cursors/prts-hand*.png`、`prts-link*.png`、`prts-text*.png`、`prts-resize-*.png`, `prts-grab.png`, `prts-grabbing.png`, `prts-not-allowed.png` 及 `animation.json`。
- 来源：[crowninggg/prts-cursor v1.1.4 的 PRTS-Windows-1.1.4.zip](https://github.com/crowninggg/prts-cursor/releases/tag/v1.1.4)，获取日期为 2026-10-09。使用其中 `程序文件/PRTS-Setup.exe` 内嵌的 `PRTS-Replica-v8-96x-normal.cur`、`normal_hold.cur`、`normal_press.ani`、`normal_release.ani`、`beam.cur`、`beam_click.ani`、`link.cur`、`link_hold.cur`、`link_press.ani`、`link_release.ani` 及 `sel_1_static.cur` 至 `sel_4_static.cur` 资源。提取时仅读取资源，未运行安装程序。
- 适配方式：每张 96×96 手形帧裁剪至矩形 (18, 10, 82, 84)，再缩放为 42×48；原始点击热点 (28, 20) 映射为 (7, 6)。ANI 帧时长保留在清单中，末尾 60 秒停留帧在运行时由静态按住或静止状态代替。文本帧保留完整的 96×96 画布，缩放至 48×48，热点为 (24, 24)。链接帧裁剪至 (18, 10, 96, 96)，缩放为 51×56，热点为 (7, 7)，保留箭头。四种静态调整大小光标保留完整画布，缩放至 32×32，热点为 (16, 16)。文本点击帧保留在源码素材中，但不再打包或播放；未收录持续循环的文本动画。
- 权利说明：上游 `Credits.txt` 将其描述为非官方自用衍生工具，并注明明日方舟角色及界面素材归原权利人所有。在已检查的安装包中，未发现这些美术素材的明确再分发许可。它们不属于本项目 MIT 许可证的授权范围；本项目收录这些素材并不授予原美术作品的相关权利。

- 2026-10-12 补充同一发行包中的抓握与禁止素材：取 `grab_enter_0011.cur` 和 `grab_loop_0000.cur` 为静态可抓取、握住状态，裁剪 (18, 40, 86, 96)，缩放至 45×37，网页抓握热点设为手形中心 (22, 19)。取 `unavail1_static.cur` 为禁止状态，裁剪 (18, 10, 96, 96)，缩放至 51×56，热点 (7, 7)。未运行安装程序，未播放循环动画。

## Markdown 预览渲染

会话悬停预览使用 [markdown-it](https://github.com/markdown-it/markdown-it) 14.3.2（MIT）。
构建时将其浏览器版本及所包含的 entities、linkify-it、mdurl、punycode.js、uc.micro 一并打包；
对应版权与许可全文保留在生成的 lib/client.js 中。该依赖仅用于构建，不要求 DSH 在运行时另行安装。
预览禁用原始 HTML 和远程图片加载。

## React Bits — GlassSurface

- 作者：David Haz
- 来源：https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/GlassSurface
- 获取日期：2026-10-17
- 许可证：MIT + Commons Clause License Condition v1.0，并非纯 MIT。
- 基于上游的组件、样式及完整许可文本保存在 `src/vendor/react-bits/`。作为 P.R.T.S. 主题输入框的一部分使用，不作为独立组件库分发。
- 接入方式：将 JSX 编译后使用宿主 React，限定原样式作用域，在输入框内容后挂载装饰层，通过原组件的 shape 参数适配输入框凹槽，降低折射及分色偏移，设置平稳中央区域并为采样画布留边；使用 5px 模糊，输入框底色不透明度为 50%。
- 本地修改：尺寸变化、新轮廓加载期间保留有效折射图，轮廓按当前尺寸铺满，不按原图宽高比等比适配。实际边界与描边由 CSS 同步绘制，折射图在缩放稳定后更新，避免异步轮廓影响输入框布局。
- 输入框附属菜单复用宿主已有背景层，仅调整 CSS 底色和模糊参数，不挂载此组件，不改变菜单布局、描边或阴影。
