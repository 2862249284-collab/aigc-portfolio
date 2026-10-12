# 视频批量导入第一版

本次以桌面「哔哩哔哩」整理目录和每集资产核对清单为依据；没有更改首页、海报、Banner、IP 的组件和视觉。

## 分类与链接

| 分类 | 项目 | 集数 | 视频链接 |
|---|---|---:|---|
| short-film | AI短片粽香 | 1 | [第1集](https://www.bilibili.com/video/BV1Copv6hEKQ/) |
| short-film | AI短片爷爷 | 1 | [第1集](https://www.bilibili.com/video/BV1wfpv6FEPx/) |
| short-film | 离职面试 | 1 | 第1集待匹配 |
| comic-drama | 桃园村长第一季，小酒来也 | 2 | [第1集](https://www.bilibili.com/video/BV1Adpv6wEaY/)、[第2集](https://www.bilibili.com/video/BV1Adpv6wEqj/) |
| comic-drama | 种田养猪称帝 | 2 | 第1集待匹配、第2集待匹配 |
| comic-drama | 香山精神病院 | 2 | [第1集](https://www.bilibili.com/video/BV1wfpv6FE5p/)、[第2集](https://www.bilibili.com/video/BV1wfpv6FEpX/) |
| ai-live-action | 觉醒无限复制，看我白卡成神 | 2 | [第1集](https://www.bilibili.com/video/BV1W9pv6YEd6/)、[第2集](https://www.bilibili.com/video/BV1P9pv6YEWy/) |
| ai-live-action | 白色魔杖 | 2 | [第1集](https://www.bilibili.com/video/BV1P9pv6YE85/)、[第2集](https://www.bilibili.com/video/BV1P9pv6YEYM/) |
| ai-live-action | THE Seventh Element第七元素 | 1 | [第1集](https://www.bilibili.com/video/BV1wfpv6FEKv/) |
| ai-live-action | Between Lies and Love谎言与爱之间 | 1 | [第1集](https://www.bilibili.com/video/BV1wfpv6FEMp/) |
| tvc | 安慕希广告 | 1 | [第1集](https://www.bilibili.com/video/BV1popv6hE3M/) |
| tvc | AI小熊水杯 | 1 | [第1集](https://www.bilibili.com/video/BV1Aopv6aEji/) |
| tvc | 汽水 | 1 | [第1集](https://www.bilibili.com/video/BV1popv6hEiG/) |
| tvc | AI变装 | 1 | [第1集](https://www.bilibili.com/video/BV1Aopv6hEKr/) |
| tvc | 游戏推广 | 1 | [第1集](https://www.bilibili.com/video/BV1wopv6hEoG/) |
| tvc | 仙剑奇侠传 | 1 | [第1集](https://www.bilibili.com/video/BV1Aopv6hENY/) |

## 素材和性能

- 16 个项目、21 集；18 集有确认的投稿链接；5 个双集系列合并为同一详情页。短片 3、漫剧 3、AI真人 4、TVC 6。
- 游戏推广和仙剑奇侠传位于原广告目录，按 TVC 导入；游戏分类未添加官方参考录像。
- 新处理人物三视图 14 张，复用《爷爷》2 张，合计 16 张不同的干净人物展板。每集采用原核对清单指定的主人物；不声称覆盖全片所有人物。
- 使用内置 imagegen 逐图编辑，要求保留脸、服装、色彩和完整视角，仅去除文字并统一浅米白背景。逐张目视检查；这是图像编辑结果，不是逐像素无损处理。提示词要求见本节，源文件与输出关系见 provenance.json。
- 53 张人物/场景/道具资源增加 1000px WebP 展示版，总计 4,336,380 字节，原 PNG 合计 108,291,044 字节；高清原图保留并在点击大图时加载。场景、道具不修改设计内容。
- 人物图片 52vw、最大 700px；播放器最大 850px，保留横竖屏比例。图片懒加载；同一素材按内容哈希复用；播放器点击加载、互斥，换页/隐藏页面卸载。

## 待匹配与未完成

- 《离职面试》1 集、《种田养猪称帝》2 集：当前公开投稿列表未找到可靠对应，展示封面与素材，播放器位置明确标记链接待匹配。
- 汽水广告的人物原图仅半身视角，无法在不补造身体情况下输出完整三视图；保留原图，不以 CSS 遮盖或近似人物代替。
- 37 个额外图片文件未纳入每集主资产，见 additional-assets.json；需要进一步确认角色和使用集数后添加。
- 桌面其余成片/镜头/官方参考视频已记录 other-local-videos.txt，未找到可靠投稿对应的文件未冒充已上传作品。
- 当前仓库没有 Git remote 或可执行发布配置；已准备静态构建，尚未部署外网，需要确定目标仓库和访问权限。

## 本次修改

- src/data/video-projects.js：统一项目、集数、BV、封面及人物/场景/道具配置。
- src/data/bilibili.js：兼容原数据入口，避免重复项目。
- src/pages/short-film.js：所有视频分类共用概览、逐集详情和互斥播放器。
- src/styles/short-film.css：响应式封面网格、纵向详情及图片尺寸。
- src/app.js：视频分类路由接入。
- src/components/media.js：可选高清源，用于放大预览。
- public/assets/works/video-assets/ 与爷爷目录新增 WebP：作品封面、原始备份、编辑图及展示副本。
- tests/short-film.test.mjs、tests/video-projects.test.mjs：数据、顺序、待匹配和资源回归。

## 验证

语法检查 54 文件通过；30 项 Node 测试通过；GitHub Pages 子路径 portfolio-check 构建成功，生成 44 个深链接。浏览器播放结果另附 playback-results.json。

GitHub Pages 子路径静态服务检查：16 个项目详情和所有使用中的封面、展示图、高清图，共 143 个路径全部返回 HTTP 200。

浏览器实测：18/18 个已匹配 BV 的官方播放器均实际播放，进度均超过 12 秒（短广告播放至片尾）；该结果不代表逐部完整观看。已验证双集切换只保留一个 iframe、上一集恢复封面、人物高清预览和 ESC 关闭。1366×768 与 1920×1080 分类页全部封面在屏内，390×844 手机无横向溢出。双集详情首屏高度经边界测量修正。

最终复查：1366×768 双集首屏播放器底部 710px、操作栏底部 742px，均位于视口内。最终 dist 为根路径构建；部署到 GitHub Pages 仓库子路径时需使用实际仓库名重新传入 --base。当前本地预览已重启。
