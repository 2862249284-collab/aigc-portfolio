# 修复与 IP 页面交付报告

## 范围与安全检查点

在原项目上修复，没有迁移框架或重建网站。实际代码是原生 ES Modules + Three.js，而非 React；因此没有引入 React 或额外网页运行依赖。

修改前建立 Git 检查点 `fefd14a`（`checkpoint: preserve portfolio before repair audit`），保存原有代码、素材及已有修改。最终修复仍保留为可审查的工作区变更。原视频、八张背景关键帧、海报/Banner 原图、玩偶和首页圆环组件没有被覆盖。

## 发现的问题与修复

| 问题 | 根因 | 处理 |
|---|---|---|
| 海报首尾或连续切换可能重复/闪烁 | 动画中途复用节点、更换图片 src，与结束时按位置重新分配图片交叉发生 | 按唯一作品 ID 持有节点，一个节点始终对应同一作品；不再中途换图；动画结束统一提交索引并回收离场节点 |
| 小数量作品重复 | 固定三/五节点布局没有区分 1、2、3 张 | 1 张静态、2 张双图、3 张以上按循环邻居计算；同一作品不产生克隆节点 |
| 自动与手动切换竞争 | 两套控制器分别管理计时与状态 | 海报/IP旧轮播接口与 Banner 使用同一生命周期控制器，展示变换仍分别配置；单次动画锁、滚轮阈值、悬停/隐藏/预览暂停 |
| 首屏隐藏、切换时间不稳定 | 旧 CSS 隐藏整个 main；标题克隆；固定计时从加载前开始 | 删除冲突规则，移动同一份标题 DOM；视频实际 ended 和单击共用幂等退出函数；加载/卡顿才使用超时兜底 |
| 后页提前露出、滚轮穿透 | 开场与后续内容没有完整隔离 | 开场固定满屏；后续区块 inert + hidden visibility；锁定滚轮/触摸滚动；退出后恢复并清理监听和视频源 |
| 标题偏移/字体不统一 | 多代 absolute/transform/字号样式叠加 | 标题统一到 hero.css，仅保留“AI漫剧 / AI视觉设计师”；同一字体体系，第一行更大，无标题星号 |
| Banner 尺寸反复覆盖 | 78vw、64vw、48vw 等规则堆叠 | Banner 几何规则集中到 banner.css；48vw、最大900px、最大52dvh、间距70px、左右各约6vw露边 |
| 进入画廊请求所有原图 | 每次挂载全量预加载高清作品 | 生成展示 WebP，仅加载当前及相邻作品；全屏保留原图；缓存已解码资源并限制缓存数量 |
| 磁吸动画无法正确取消 | 将回调函数传入 cancelAnimationFrame | 保留实际帧 ID，卸载时取消；背景与首页视差合并到 requestAnimationFrame |
| GitHub Pages 子路径/直达风险 | 根路径写死、依赖不被 Pages 支持的 rewrite | 构建支持 --base；统一替换资源和链接；生成八分类及全部已知详情的目录 index.html、404.html、.nojekyll |

轮播静止时最多 3 个节点；四张及以上的横移动画期间最多 4 个不同作品节点，完成后回收，不会无限增长。三张时同一个离场节点分两段越过不可见区域返回另一侧。海报不新增自动播放；Banner 保留 4 秒自动播放。

首页继续使用原本本地 MP4，通过播放速率把完整序列控制在约 6 秒；保留原始素材。开场在当前标签页会话中只播放一次。减少动态效果偏好下直接进入首页。退出后视频停止并清空源；返回顶部也已适配隐藏的开场节点。

## 性能措施

- 16 张海报/Banner 展示素材合计从原图约 **51.54 MB** 降至 **4.27 MB**，约减少 **91.7%**。原始 PNG 全部保留。
- 背景层仅在需要时加载，已显示的背景保持到下一帧解码完成；路由切换复用背景合成层。
- 非首屏写真/补充图片保留懒加载；玩偶沿用进入视野后动态导入及离屏暂停。
- 视频详情沿用原生 controls、playsinline、preload=none，未为非当前分类初始化播放器；卸载时停止并释放源。
- 鼠标事件不驱动整页渲染；高频位置更新按帧合并，监听器、动画和计时器由卸载函数清理。
- IP 页面使用小尺寸场景/资料缩略图，大图按点击加载；角色复用同一透明文件。临时 OpenCV 只用于离线抠图，不进入构建。

## IP 页面

实际读取 `C:/Users/EDY/Desktop/IP` 的 13 张 PNG，确认凛芽、岚斗、雾璃、暖柚及四张线下场景对应关系。

- 从每张设定板中的完整正面人物提取透明 PNG，保留原 RGB，仅修改 alpha 蒙版；没有生成或重绘近似角色。
- 总览为四角人物 + 中央 2×2 场景；手机改为上二角色、中央四场景、下二角色的紧凑布局。
- 四个独立详情：`/works/ip/linya`、`/works/ip/landou`、`/works/ip/wuli`、`/works/ip/nuanyou`。
- 每个详情均有对应三视图/人物设定板、表情板、角色切换导航；名称及简介来自原板。
- 场景和资料支持大图、左右切换、ESC、关闭与放大；原始图片完整显示。
- 原组合海报归档保留，没有当成第五个人物或重复素材塞入总览。
- 维护与来源说明见 `IP_ASSETS.md`，统一配置为 `src/data/ips.js`。

## 实际测试

1. `node --test tests/*.test.mjs`：**24 项通过，0 失败**。
2. `node scripts/check.mjs`：**50 个 JS 文件语法检查通过**。这是轻量语法 Lint，不宣称执行了 ESLint。当前终端 npm 不在 PATH，已直接运行 package.json 对应的 Node 命令。
3. `node scripts/build.mjs` 与 `node scripts/build.mjs --base=portfolio-check` 均成功；最终 dist 为根路径构建，包含 **28 个分类/详情直达目录**。
4. 实际浏览器轮播测试页：前进20次、后退20次，覆盖首尾；1/2/3张特殊模式；40次连续 wheel；Banner 悬停暂停、恢复自动播放及手动切换。两轮各完成51次切换，逐帧未见重复 ID，节点最多4个，结果无错误；最终一轮检查6913帧。另用真实鼠标拖拽验证 Banner 索引从1到2，仅切换一张且没有误开预览。
5. 实际浏览器检查开场：播放时后页不可见且不可交互，滚轮后 scrollY 仍为0；结束自动退出；空白区域单击退出；退出后只保留一份标题 DOM，清空视频 src 并解除锁定。
6. 标题在1920×1080、1440×900、1366×768、390×844测量 DOM 边界：两行中心横向误差低于0.01px，无重叠/横向溢出。
7. Banner 三个桌面尺寸中央宽度为900/691/656px；海报、Banner 的导航、标题、编号均在视口内，页面高度等于视口高度。图片保持 contain。
8. 八个顶部分类逐一切换，浏览器前进/后退正常；首页圆环直接进入 Banner、IP，返回恢复分类选中状态。玩偶 canvas 为 WebGL；APP 链接仍是用户提供的网址且 target=_blank。
9. IP 四个角色入口、四个详情快速切换、八张资料及四张场景逐一点击，均对应正确文件；场景 01→04→01 循环、键盘、放大和关闭通过。
10. IP 总览和详情在1920×1080、1366×768、390×844检查，页面没有横向/纵向溢出，人物与场景/资料区互不覆盖。
11. `python scripts/verify-ip.py`：**13张原图完整性及4张人物 RGB 逐像素一致验证通过**，透明通道存在。
12. 使用无 SPA fallback 的本地静态预览模拟 Pages：子路径分类/角色详情直达、资源加载、切换和原图预览正常。所检查页面控制台没有 error/warn。

## 修改文件

- 核心修复：`src/components/gallery-controller.js`、`image-carousel.js`、`banner-carousel.js`、`opening.js`、`backgrounds.js`、`hover.js`；`src/lib/carousel-state.js`、`motion.js`、`base-path.js`、`routes.js`；`src/app.js`。
- 样式：`portfolio.css` 清除开场/标题/Banner 冲突并整理为逐条规则；`src/styles/hero.css`、`opening.css`、`banner.css`；`index.html` 引入独立样式。
- IP：`src/pages/ip.js`、`src/styles/ip.css`、`src/data/ips.js`、`public/assets/works/ip/`；其他分类没有改成 IP 布局。
- 性能素材：`src/data/display-images.js`、`public/assets/previews/`、`scripts/optimize-images.py`。
- 工具与验证：`scripts/build.mjs`、`check.mjs`、`preview-build.mjs`、`prepare-ip.py`、`verify-ip.py`、`sync-posters.mjs`（防止通用导入覆盖 IP 档案）、`package.json`；`tests/carousel.test.mjs`、`ip.test.mjs`、`portfolio.test.mjs`；`public/qa/carousel-regression.html`。QA 页面不进入静态构建。
- 文档：本报告、`IP_ASSETS.md`、`README.md`。

## 限制与未覆盖项

- IP 主形象来自原设定板的正面小图，原始区域约234–334px宽、397–565px高；高清程度受源素材限制，没有生成式放大或补画。原设定板以原尺寸保留供查看。
- 当前原配置没有写真文件、外部玩偶模型或真实视频作品记录；保持现有占位/内置玩偶，没有虚构素材。视频组件通过结构测试，无法宣称已播放尚未提供的实际作品。
- 手机测试是浏览器视口测试，尚未在真实 iOS/Android 设备上实测触摸惯性；也未进行长时内存压力或量化 FPS/Lighthouse 测试。
- 没有发布到用户的线上 GitHub Pages。实际部署时需要使用真实仓库名设置 --base；本次验证的是本地子路径构建。
- 原作品图片内自带的日期/文字保留不改，界面不再额外展示创作日期。

## IP 原图循环画廊调整（2026-10-11，替代上述旧 IP 抠图/环形方案）

- 取消运行时透明素材引用和四角环形布局。四角色原始设定板 + 四场景共用一个 8 项轮播，原始文件未修改。
- 修改：src/data/ips.js、src/pages/ip.js、src/styles/ip.css；共享 gallery-controller.js 增加可选数据源和激活回调，默认海报/Banner 行为保持不变。
- 稳定 ID 节点复用、当前及相邻图片预加载；场景预览有独立索引，关闭不改变画廊位置。详情主图改为原始设定板，保留快速切换和三视图/表情图预览。
- 更新 tests/ip.test.mjs、public/qa/carousel-regression.html、IP_ASSETS.md。
- 验证：24/24 Node 测试、50 文件语法检查、静态构建成功。浏览器实际组件回归 99 次切换，0 重复 ID、最大 4 个过渡节点、0 错误；包含海报小样本/快速滚轮、Banner 自动播放暂停恢复、IP 双向各20次和4张场景预览返回位置。
- 四角色实际页面快速切换、表情图对应路径通过；1366×768、1920×1080、390×844 总览无页面溢出。未进行真实手机硬件触摸测试。
