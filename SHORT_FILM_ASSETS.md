# 《AI短片爷爷》接入说明

视频 BV1wfpv6FEPx，B站公开元数据及用户确认对应《AI短片爷爷》，1910×1080。官方嵌入说明：https://player.bilibili.com/ 。点击才加载 iframe，autoplay=0、muted=1，离开页面移除播放器；保留原站观看链接。

页面顺序：视频 → 人物介绍（爷爷、成年孙子）→ 场景设计（老屋院落）→ 道具设计（零食袋）。全部来自 Desktop/哔哩哔哩/短片/AI短片爷爷；场景与道具为已有文件原样复制。未改动其他分类素材。

人物处理使用内置 imagegen 编辑模式，原图备份在 public/assets/works/short-film/grandpa/originals/，处理版为 grandfather-clean.png 和 grandson-clean.png。未覆盖原图；人物背景和标注真实修改，未用 CSS 遮盖。

最终提示词要求：仅替换灰色渐变背景为浅米白 #eeece7，删除 FRONT/SIDE/BACK 与所有标注，保留原人物面部、发型、服装、配色、比例及正侧背三种姿势，头脚完整，不新增人物或裁切。两张分别以上述原始三视图为编辑目标。已目视检查造型及完整性；AI 编辑不宣称逐像素无损。

修改文件：src/pages/short-film.js、src/styles/short-film.css、src/data/bilibili.js、src/app.js、index.html、tests/short-film.test.mjs；原页面文件快照位于 .tools/checkpoints/short-film-before/。
`n验证：26 项测试、51 文件语法检查、根路径与 portfolio-check 子路径构建通过。浏览器已确认 B 站实际播放至 00:07 后暂停、场景/道具图片点击放大和 ESC 关闭；390×844 无横向溢出。
