# 个人介绍与小红书接入记录

## 已完成
- 从用户提供的 PDF/02.png 提取个人照片，图像编辑输出透明 PNG，并生成 WebP 展示版本。原始简历图没有覆盖，也没有作为页面背景使用。此输出为图像编辑版本，并非逐像素无损裁剪。
- 首页删除 PORTRAIT COMING SOON，使用独立照片；简介、核心能力、工作经历、项目经历均为原生文字。
- 个人信息配置：src/data/profile.js、src/data/resume.js。
- 两条小红书链接集中配置于 src/data/xiaohongshu.js。根据用户此前明确提供的对应关系，保留《种田养猪称帝》第一集、第二集纵向展示。
- 标题来自用户确认，封面来自已有本地作品素材；没有冒称获取了平台标题或封面。
- 详情支持人物、场景、道具、制作过程和补充素材；空素材组不显示虚假图片。

## 2026-10-12 实际访问结果
- 主页 62c7e0490000000002000c44：重定向登录页，无法读取公开投稿列表。
- 第一集 6acc347f0000000018006f3e：错误 300031，“当前笔记暂时无法浏览”，提示 App 查看。
- 第二集 6acc351c000000001402d0be：同上。
- 站内成功播放数量：0。仅配置用户提供的原始页面链接，不使用临时 token、不构造 MP4、不绕过平台限制。
- 如需可靠站内播放，需要补充可授权使用的本地视频文件，或平台支持的可播放来源。

## 后续维护
- 修改照片、简介、能力：src/data/profile.js。
- 修改工作与项目经历：src/data/resume.js。
- 作品/剧集/封面：src/data/video-projects.js；小红书链接通过 projectId 与 episode 匹配，维护于 src/data/xiaohongshu.js。
- 每集 characters 存人物图片；assets.environments、assets.props、assets.process、assets.extras 分别存场景、道具、过程、补充素材，沿用现有图片项结构。无资料时留空，不编造。

## 本次修改范围
src/pages/home.js、src/data/profile.js、src/styles/resume.css、src/data/xiaohongshu.js、src/data/bilibili.js、src/data/video-projects.js、src/pages/short-film.js、tests/about-portrait.test.mjs、public/assets/portrait/yu-miao.png、public/assets/portrait/yu-miao.webp。
