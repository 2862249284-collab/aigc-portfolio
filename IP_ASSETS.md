# IP 作品画廊（当前实现）

IP 总览采用一个 8 项循环序列：凛芽、岚斗、雾璃、暖柚、商城中庭快闪展、柜台选购、海报长廊、展台近景。

- 配置：`src/data/ips.js` 的 `ipGalleryItems`，通过 kind 区分角色和场景。
- 全部角色使用 originals 内的人物设定原图，保留背景和排版。已有透明 main.png 仅归档保留，不再被页面引用。
- 总览使用保留完整构图的 WebP 展示副本，当前和相邻项目按需预载；详情和大图使用原始 PNG。
- 角色进入 `/works/ip/<id>`；场景打开只包含四张场景的预览。关闭预览不改变轮播位置。
- IP 样式独立在 `src/styles/ip.css`；共享控制器的 entries/onActivate 为可选项，海报和 Banner 保留默认行为。
- 原始素材不覆盖、不删除。历史 prepare-ip.py 为旧抠图工具，不再用于当前展示素材生成。

验证：24 项 Node 测试、语法检查和静态构建；浏览器回归详情见 REPAIR_REPORT.md 最新补充。
