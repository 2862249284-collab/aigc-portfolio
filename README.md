# AIGC 创作者 · 个人作品集

在原 PLATE 网站上升级的原生 HTML / CSS / ES Modules 作品集。无需框架、数据库、账号或后端管理系统。

## 启动与检查

需要 Node.js 20 或更新版本。在本目录打开终端：

```sh
node server.mjs
```

访问 **http://127.0.0.1:4173/**。默认仅监听本机。端口被占用时停止旧预览，或者运行 `node server.mjs 4174`。

```sh
node --test tests/portfolio.test.mjs
node scripts/build.mjs
```

如果已安装 npm，也可使用 `npm start`、`npm test`、`npm run build`。无需 `npm install`；Three.js 0.180.0 已保存在 `vendor/three/`，许可证在同目录 `LICENSE`。

构建产物在 `dist/`。部署静态文件时须将 `/works/*` 回退到 `/index.html`，否则直接刷新深层路由会出现 404。已生成适用于支持该格式的主机的 `_redirects` 文件。其他服务器请设置等价重写。`/plate/` 必须仍指向自身的 `index.html`。

## 原有页面的保留

- 原 `index.html` 的完整内容保存在 `plate/index.html`，仅将 CSS / JS 引用改为根路径。
- 原 `main.js` 与 `style.css` 保持原样，原视频 URL、逐帧缓存、两层揭幕、作品文字和统计动画都保留。
- 访问 **http://127.0.0.1:4173/plate/**，或点击新版页脚的「PLATE® · 沉浸影像实验」。
- 新版首页首先通过同源嵌入呈现原版开屏，保留原来的 900vh 滚动节奏，再用一屏完成末帧到创作者首页的交接。右上方「进入创作者作品集」可跳过开场。作品分类和详情页不加载原视频。

## 文件结构

```text
index.html                 新版页面入口与 Three.js import map
portfolio.css              新版全部布局、动效和响应式样式
src/app.js                 页面装配、History 路由、切换与生命周期
src/data/profile.js        个人介绍、写真、联系方式、玩偶配置
src/data/categories.js     八分类名称、英文标题与描述
src/data/works.js          统一作品数据；空分类显示留白状态，不生成虚构作品
src/data/posters.js        海报索引（脚本生成）
src/data/banners.js        Banner 索引（脚本生成）
src/data/ips.js            IP 索引（脚本生成）
src/data/films.js          视频类作品索引（脚本生成）
src/data/app.js            APP 下载官网内容配置
src/pages/                 首页、分类页、详情页
src/components/            圆环、3D 玩偶、临时模型、鼠标追踪、媒体、页头页脚
src/components/image-carousel.js  图片类共用的三图循环轮播
src/components/discipline-bar.js  作品页常驻的八分类顶部导航
src/components/hover.js    磁吸、3D 倾斜与光泽扫过
src/components/cursor.js   自定义跟随光标
src/components/app-card.js 首页圆环下方的 APP 官网入口
src/lib/                   路由解析、动画、DOM 辅助函数
public/assets/             自己的图片、视频和模型
vendor/three/              固定版本的本地 Three.js 依赖
plate/index.html           原 PLATE 网站
main.js / style.css        原 PLATE 动画与样式（保留）
server.mjs                 静态服务、路由回退、视频 Range 请求
scripts/build.mjs          静态目录构建
scripts/sync-posters.mjs   图片类作品索引生成（poster/banner/ip）
scripts/sync-films.mjs     视频类作品索引生成（文件夹 → films.js）
tests/portfolio.test.mjs   路由、数据、媒体、服务与范围请求检查
```

## 替换个人介绍与写真

1. 把写真放到 `public/assets/portrait/`，例如 `me.webp`。
2. 编辑 `src/data/profile.js`：

```js
portrait: '/assets/portrait/me.webp',
portraitAlt: '我的个人写真',
email: '你的真实邮箱',
socials: [{ label: '你的平台名称', url: 'https://你的主页地址' }],
```

`portrait` 留空时显示设计好的占位框；图片失效也会回退到占位。没有生成或引用虚构的人物照片。建议使用竖版 3:4、宽约 1200px 的 WebP / JPG。个人介绍、创作领域也在此配置文件中。邮箱为空时显示「联系信息即将更新」，不会提供虚构联系地址。

## 新增真实作品

资源文件存放位置与类别：

| 分类 | 数据里的 category | 本地目录 | 页面地址 |
| --- | --- | --- | --- |
| 海报 | `poster` | `public/assets/works/poster/` | `/works/poster` |
| Banner | `banner` | `public/assets/works/banner/` | `/works/banner` |
| IP | `ip` | `public/assets/works/ip/` | `/works/ip` |
| 短片 | `short-film` | `public/assets/works/short-film/` | `/works/short-film` |
| 漫剧 | `comic-drama` | `public/assets/works/comic-drama/` | `/works/comic-drama` |
| TVC | `tvc` | `public/assets/works/tvc/` | `/works/tvc` |
| AI真人 | `ai-live-action` | `public/assets/works/ai-live-action/` | `/works/ai-live-action` |
| 游戏 | `game` | `public/assets/works/game/` | `/works/game` |

**注意：** 磁盘路径是 `public/assets/...`，在配置中的 URL 写 `/assets/...`。添加文件后在 `src/data/works.js` 的 `works` 数组中增加对象并刷新页面，无需编辑任何组件。

图片项目示例（请替换成自己的真实内容）：

```js
export const works = [
  {
    id: 'my-poster-01',                 // 同一分类内唯一；使用英文、数字和短横线
    title: '我的作品名称',
    category: 'poster',
    year: 2026,
    description: '项目背景、创作想法、视觉语言与最终呈现。\n可以用换行分段。',
    cover: '/assets/works/poster/cover.webp',
    mediaType: 'image',
    media: '/assets/works/poster/main.webp',
    gallery: [
      { src: '/assets/works/poster/detail-01.webp', caption: '视觉细节' },
      { src: '/assets/works/poster/detail-02.webp', caption: '应用展示' }
    ],
    tools: ['你实际使用的工具'],
    featured: true
  }
];
```

视频项目示例：

```js
{
  id: 'my-film-01',
  title: '我的短片名称',
  category: 'short-film',
  year: 2026,
  description: '影片的创作主题、叙事方式与制作过程。',
  cover: '/assets/works/short-film/cover.webp',
  mediaType: 'video',
  media: '/assets/works/short-film/film.mp4',
  gallery: [
    { src: '/assets/works/short-film/still-01.webp', caption: '影片剧照' }
  ],
  tools: [],
  featured: false
}
```

- 详情地址自动生成为 `/works/分类/id`。
- `gallery` 同时接受字符串 URL 数组和带 `src`、`caption` 的对象数组。IP 的立绘、三视图、表情包均可放入这里；设计说明放在 `description`。
- 视频推荐浏览器广泛支持的 MP4（H.264 + AAC）或 WebM。模型、图片和视频建议使用同源本地资源，避免第三方跨域与失效问题。
- 视频使用原生播放器，支持播放、进度拖动、音量和全屏；`preload="none"`，不会在点击播放前整段预加载。
- `media` 留空仍能打开详情，显示「图片/视频待上传」。封面和媒体不存在时显示错误占位，不会白屏。
- `featured` 字段预留供后续精选策展使用，目前不改变数组顺序。
- 空分类显示统一的空状态，不提供预览作品或虚假详情链接。填入真实作品后，自动显示对应分类画廊。

## 首页标题与 APP 入口

- 首页主标题为「AI / 漫剧」+ 次行「AIGC 视觉设计 ✳」，保留原 `word-in` 入场（淡入 + 位移 + 模糊渐清），次行延后入场；鼠标移动时整块标题有极轻微视差。修改位置：`src/pages/home.js` 的 `heroMarkup` 与 `portfolio.css` 的 `.hero-title--dual`。
- 圆环下方新增「APP 下载官网」入口：主标题、英文副标题 `APP DOWNLOAD WEBSITE`、说明 `Product / Interface / Experience`，细线边框 + 磨砂背景 + 跟随鼠标的柔光。悬停时卡片上浮、边框变亮、文字随指针小幅位移、右侧箭头平移。
- 内容在 `src/data/app.js` 中配置。**当前 `siteUrl` 指向 APP 官网，点击入口直接在新标签页打开该地址，不经过二级页面。** 换链接只改这一处即可；未配置 `siteUrl` 时入口禁用，不猜测地址，也不显示预览弹层。保留入口磁吸、柔光和箭头动效。

## 顶部八分类导航

所有作品页（分类页与详情页）顶部都常驻一条八分类导航 `src/components/discipline-bar.js`，位于页头下方并吸附在滚动位置。当前分类文字放大、变亮并带下划线；点击其他分类直接在当前页面切换内容，不返回首页、不重放开屏动画。移动端该条可横向滚动。

## 鼠标互动

参考同类作品集的交互气质，但**没有替换原有背景、开屏动画和玩偶**，只叠加了下面几层，且全部走 `transform` / `opacity`：

- **自定义光标** `src/components/cursor.js`：保留系统指针，额外跟一层细线圆环与中心小点，带缓动。悬停作品时圆环放大并显示 `VIEW`，视频区显示 `PLAY`，链接与按钮轻微放大。触屏、窄屏与 `prefers-reduced-motion` 下完全不加载。
- **磁吸按钮** `src/components/hover.js`：顶部导航、分类链接、返回链接、APP 入口、作品卡片等靠近鼠标时产生小幅偏移（默认 13px，可用 `data-magnet` 调整），移开后弹性归位。不改变点击区域与元素间距。
- **3D 倾斜与光泽**：作品卡片随指针做 `rotateX/rotateY` 轻微倾斜，封面内图片放大，表面有一道跟随指针的柔和高光扫过。
- **圆环悬停**：悬停分类时文字放大、变亮并带轻微辉光，原有圆环旋转与玩偶跟随逻辑未改动。
- **滚动视差**：沿用原有的 hero 与写真视差；背景关键帧层保留原有滚动交叉淡化与鼠标位移。
- 移动端与减少动态效果模式下，以上鼠标专属效果全部关闭，改用触屏手势。

海报、Banner、IP 三个图片分类不使用通用网格画廊，而是由 `src/components/image-carousel.js` 提供的共用轮播。`src/components/poster-carousel.js` 现在只是海报分类的薄封装，保留旧导出以兼容测试。

- 一屏只显示三张：左、中、右同一水平行。中间 `scale(1)`，两侧 `scale(.73)` 并降低不透明度和亮度，附加约 10° 的 `rotateY` 透视。所有图片 `object-fit: contain`，保持原始比例，不裁切文字。
- 每类有独立的画幅宽度：海报 `min(27vw,380px)`、Banner `min(40vw,600px)`、IP `min(26vw,352px)`。
- 鼠标滚轮切换：向下看下一张，向上看上一张。一次连续手势只切换一张（220ms 节流 + 45px 阈值），动画进行中锁定重复触发。滚轮只在光标位于画廊区域时生效，页面其余滚动不受影响。
- 作品通过 `wrap(index+offset, count)` 循环索引，首尾无缝衔接，没有克隆 DOM 节点，只用三个真实节点复用。数量变化后依然正确。
- 点击中间作品进入 `<dialog>` 全屏查看，方向键切换，ESC 关闭；点击左右作品则平滑移到中间，不打开全屏。手机端支持左右滑动，拖动后不会误触点击。
- 预加载相邻作品（`Image.decode()`），避免切换闪白。切换动画 640ms 缓动。
- 尊重 `prefers-reduced-motion`（瞬时切换）。事件监听、动画实例、dialog 均在卸载时清理。
- 兼容数量少于三张：只有一张时直接显示单张；两张时显示两张。为空时显示空状态。
- 每个分类的滚动位置分别记忆在 `carouselState` 中，来回切换分类会回到上次看的那张。

图片数据由 `src/data/posters.js`、`banners.js`、`ips.js` 提供，可用脚本从本地文件夹（重新）生成：

```sh
node scripts/sync-posters.mjs "C:/你的海报文件夹"                    # 海报
node scripts/sync-posters.mjs "C:/你的Banner文件夹" --category=banner  # Banner
node scripts/sync-posters.mjs "C:/你的IP文件夹" --category=ip          # IP
```

脚本会把文件夹里的 `png/jpg/webp/avif` 复制到对应目录，并按 sha256 生成稳定 id。文件名是时间戳（`ChatGPT 图像 …`、`IMG_20261010_…` 等）时，标题自动生成编号名（`海报 · 01`、`Banner · 02`），站点任何位置都不显示日期与时间戳；有意义的文件名则原样保留为标题。以后再跑一次即可增量更新，数量随实际文件变化；不带路径运行则只按现有目录重建索引。

## 视频类分类 · 项目文件夹

短片、漫剧、TVC、AI真人、游戏五个分类使用「项目卡片 → 项目详情」的两级结构。项目卡片显示封面、名称与编号，悬停时封面放大、右上角播放圆钮点亮；点击进入 `/works/分类/id`。作品页与详情页都不显示年份、日期或时间戳（`meta.json` 里的 `year` 会被忽略，不再渲染）。

详情页保留顶部八分类导航，主体顺序为：项目名称与介绍 → 视频播放区 → 人物/场景/道具资产折叠模块 → 补充图 → 相邻作品。

用一个文件夹目录描述一个项目，然后运行脚本生成索引，不需要改任何组件：

```text
public/assets/works/short-film/我的项目A/
  meta.json       可选：{ "title", "description", "year", "brand", "duration", "episode", "tools" }
  cover.png       可选，封面；缺省时用目录里第一张图
  film.mp4        目录里第一个视频成为主视频
  characters/     人物资产：三视图、写真、服装、表情
  environments/   场景资产：室内外场景、多角度环境
  props/          道具资产：三视图、产品细节
```

```sh
node scripts/sync-films.mjs
```

- 以 `_` 或 `.` 开头的目录会被忽略，方便临时存放素材。
- 三个资产模块各自读取同名子目录；目录不存在或为空时，该模块自动隐藏。`characters` 默认展开，其余折叠。
- 模块标题右侧显示资产数量，点击展开/收起，图片保持原始比例，点击进入全屏查看，ESC 关闭。
- 视频使用原生播放器（播放、进度、音量、全屏），`preload="none"`，不会在点击前整段预加载；`poster` 使用封面图。不自动播放带声音的视频。
- 手动在 `src/data/works.js` 添加对象仍然有效；脚本生成的数据与手动数据会合并。

## 替换 3D 玩偶

1. 把模型放入 `public/assets/doll/`。优先选择未使用 Draco / KTX2 扩展压缩的 `.glb`；普通 `.gltf` 也可以，但需一起放入其引用的 `.bin` 与纹理文件并保持相对目录关系。
2. 编辑 `src/data/profile.js`：

```js
doll: {
  model: '/assets/doll/character.glb',
  headNode: 'Head', // 模型中头部对象或骨骼的准确名称；无独立头部可填 ''
  scale: 1,
  rotationY: 0    // 弧度；正面方向不对时调整，例如 Math.PI
}
```

模型会自动居中并缩放至展示范围。默认播放第一段内置动画（如果有）；减少动态效果时停止。找到 `headNode` 时附加受限、平滑的鼠标跟随；没有该节点则轻微转动整体。默认临时角色有独立头部、眼睛和手臂。加载失败保留临时角色；无 WebGL 时使用 CSS 角色，所有分类仍可操作。

Three.js 模型与鼠标逻辑分离于 `doll-model.js`、`doll.js`、`pointer.js`。页面离开时释放纹理、几何体、材质、骨骼、环境贴图、渲染器、观察器和监听器。模型离屏或标签页隐藏时停止渲染，避免持续消耗。

技术参考：[Three.js 官方文档](https://threejs.org/docs/)。

## 圆环操作与可访问性

- **桌面：** 鼠标放在圆环区域内轻滚，切换分类。惯性尾部被吸收，一次连续手势仅切换一项；上、下方向首尾循环。圆环外仍正常滚动。
- **离开圆环：** 移到两侧/工具栏滚动，按住 Shift 滚动，或点击「继续向下」。按 Escape 将焦点移至继续向下入口，不会困住键盘。
- **键盘：** 聚焦圆环后用左右/上下方向键选择，Home / End 跳至首尾，Enter 进入当前分类。所有分类链接和前后按钮均可用 Tab 访问。
- **手机：** 点击前后箭头、水平滑动圆环切换；点分类文字直接进入。垂直手势保留正常页面滚动。
- **减少动态效果：** 遵循 `prefers-reduced-motion`，禁用位移、缩放与浮动，保留内容和导航。
- **返回：** 分类页「返回创作圆环」会保留选择项；浏览器前进/后退可用。

## 当前内容状态

当前没有用户提供的正式写真和正式 GLB 模型，因此使用明确的写真占位与程序生成的银色临时玩偶。没有引入虚构项目、远程图库照片或未经提供的个人身份资料。

作品数据现状：

| 分类 | 状态 | 添加方式 |
| --- | --- | --- |
| 海报 | 已同步 8 张 | `sync-posters.mjs <文件夹>` |
| Banner / IP | 空（显示留白状态） | `sync-posters.mjs <文件夹> --category=banner\|ip` |
| 短片 / 漫剧 / TVC / AI真人 / 游戏 | 空（显示留白状态） | 建项目文件夹后运行 `sync-films.mjs` |

空分类不会生成占位作品或虚假详情链接；放入真实素材并运行脚本后，页面会自动出现对应内容。

## 原开屏关键帧背景

全站背景均从原 PLATE 视频实际解码提取，没有使用图库、AI 生图或无关图片。原片是 1280×720、24fps、约 13.04 秒。提取保留原始构图和色彩，只进行 WebP 编码；页面使用透明深色遮罩保证阅读，不对原图片进行模糊或调色。

- `public/assets/source/plate-original.mp4`：用于提取的原始视频副本。
- `public/assets/backgrounds/`：8 张全分辨率关键帧，总计约 640KB。
- `public/assets/backgrounds/manifest.json`：原始 URL、SHA-256、选帧时间点和图片规格。
- `src/data/backgrounds.js`：页面到关键帧的分配；可修改索引，无需修改组件。
- `src/components/backgrounds.js`：持久背景层、图片预解码、滚动交叉淡化和轻微鼠标视差。
- `src/components/opening.js`：将外层滚动映射到原页面自己的滚动范围。原 `main.js` 与 `style.css` 均未修改。

首页使用视频末帧，与开屏结尾衔接；介绍使用街道动作远景；圆环使用街道纵深；分类分配不同画面；详情使用低对比度的街景透视画面。背景层在路由间保留，避免资源重建引起闪烁。

重新提取（已有图片可直接使用，不需要安装工具）：

```sh
python -m pip install Pillow imageio-ffmpeg
python scripts/extract-backgrounds.py
```

也可通过 `FFMPEG` 环境变量提供已有的 FFmpeg 可执行文件。项目内 `.tools/` 是这次提取时的临时工具目录，不包含在静态构建中。


### 分类画廊与详情更新
- 圆环点击经短暂放大、淡出进入独立分类路由；**分类节点本身就是链接，点文字或它周围的整块热区即可直接进入作品页，没有二次确认或中间过渡页**。返回后恢复所选分类。八类页面可通过顶部分类导航切换。
- 海报错落排列，Banner 宽幅完整呈现，IP 四角色与中央四场景总览，影视与游戏使用宽幅画面。图片采用 contain 保留构图。
- 作品可选 `brand: '品牌名称'`、`duration: '02:30'`、`episode: '第 01 集'`，显示在画廊中。
- 点击作品进入 `/works/分类/id`；图片可点击放大，Escape 或关闭按钮退出；视频使用完整原生控制条。
- 上一个/下一个作品按照 `works` 数组中同分类的顺序排列，边界不循环。
- 没有真实作品时不显示虚构作品。测试用记录仅存在于自动化测试内，不写入网站数据。


### Banner 专用轮播
Banner 使用独立的 `src/components/banner-carousel.js`，中央主图宽 48vw（最大900px）、左右等宽露边，不影响海报与 IP。自动播放间隔 4 秒，动画 700ms；悬停、全屏预览、页面隐藏时暂停，减少动态效果偏好下禁用自动播放。支持滚轮、鼠标拖拽、触屏滑动和箭头。全屏浏览后关闭会恢复打开前的画廊位置。
导入新图：`node scripts/sync-posters.mjs "C:/Users/EDY/Desktop/banner" --category=banner`。
删除作品：从 `public/assets/works/banner/` 删除对应图片，再执行 `node scripts/sync-posters.mjs --category=banner`。脚本按文件名排序并自动更新数量；原始文件名只保存在数据中，带时间戳的文件使用简洁编号标题。

### B站视频与独立二维码

在 `src/data/bilibili.js` 对应分类数组中添加记录，只需 `title`（作品标题）和 `bilibili`（真实 BV 号或完整视频链接）。可选 `id` 用于固定页面地址，`cover` 为封面，`description` 为简介；不需要上传或存储视频。已有本地视频记录也可以直接添加 `bilibili` 字段。

支持 bilibili.com、www.bilibili.com、m.bilibili.com 的 /video/BV… 或 /video/av… 地址，自动移除分享追踪参数、保留分P参数。个人主页、非B站域名、无效链接不生成二维码。b23.tv 请先在浏览器打开，再复制最终视频地址。格式校验不能判断视频是否已删除、私密或限制访问，请发布前实际扫码确认。

同一视频链接（含分P）用于多个作品时，二维码入口会显示配置错误，避免重复二维码。每个作品应使用独立视频地址；不要给同一作品同时添加本地和B站两条记录。纯B站记录独立于自动生成的 films.js，不受同步脚本覆盖。

详情页支持鼠标悬停、点击、键盘按钮展开，Esc/关闭按钮/点击外部收起。白底黑码、四模块留白；本地 qrcode-generator 1.4.4 生成，无第三方二维码或短链服务请求。支持 2048×2048 PNG 和矢量 SVG 下载。微信等扫码应用能否直接打开外部网页受应用自身策略影响，必要时选择浏览器打开。

二维码库来源：https://github.com/kazuhikoarase/qrcode-generator （MIT；源码保留版权声明），vendor/qrcode/qrcode.js 仅增加 ES module 默认导出。

### 最新：首页自动开场与 Banner 留白
首页开场使用已有本地 `public/assets/source/plate-original.mp4`，按原片时长计算播放速率，将完整原片画面序列控制在约 6 秒；保留原色彩与 AI漫剧 / AI视觉设计师 标题。静音、自动、行内播放，首帧作为 poster。结束与任意空白处点击调用同一幂等退出方法，500ms 淡出。加载与卡顿超时兜底避免失败卡住；减少动态效果模式直接进入首页。当前标签页会话内只播放一次，分类返回不重播。原 `/plate/` 独立页面仍保留。
Banner 主图为 48vw（最大900px、最大52dvh），间距70px，展示窗口使左右各露出约6vw；自动播放、拖拽、预览逻辑保留。


### 修复与 IP 档案
完整修复/测试记录见 REPAIR_REPORT.md，IP 素材来源和配置说明见 IP_ASSETS.md。

## GitHub Pages 自动部署

正式仓库： https://github.com/2862249284-collab/aigc-portfolio
公开地址： https://2862249284-collab.github.io/aigc-portfolio/

本项目为原生 JavaScript 静态网站（非 Vite/React），无需安装运行依赖。
`main` 分支每次推送触发 `.github/workflows/pages.yml`：语法检查 → 测试 → 子路径构建 → Pages 发布。
本地检查：`npm run lint`、`npm test`、`node scripts/build.mjs --base=aigc-portfolio`。
以后更新：在当前文件夹修改并预览后，执行 `git add .`、`git commit -m "Update portfolio"`、`git push origin main`。
在仓库 Actions 查看部署是否成功；失败时线上仍保留上一次成功版本。

《种田养猪称帝》两集使用本地授权原片转码的 H.264/AAC MP4，由网站直接播放，不依赖小红书登录或临时地址。
资源路径在 `src/data/xiaohongshu.js` 中配置。网站源码和原有素材保留，.tools、私有记忆、环境变量、密钥及 QA 临时文件不上传。
本地历史检查点保留在 `codex/pre-pages-checkpoint`；公开 main 使用不含旧私有记忆的独立发布历史。
