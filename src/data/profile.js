// 本地资源以 /assets/ 开头，对应磁盘 public/assets/。
export const profile = {
  name: '于淼',
  english: 'VISUAL ARTIST & AI FILMMAKER',
  introduction: 'AIGC内容制作 / AI视频制作 / 编导后期',
  paragraphs: [
    '参与40多部AI漫剧及TVC广告内容制作，拥有AI漫剧、真人风格短剧、出海内容与广告制作经验。',
    '从脚本拆解、分镜设计到视觉资产、AI视频生成与后期交付，完成从想法到影像的创作。'
  ],
  portrait: '/assets/portrait/yu-miao.webp', // 独立照片资源；可替换为新的个人照片路径。
  portraitAlt: '于淼个人照片',
  email: '', // 例如 hello@example.com；不填写时不会展示虚构联系方式。
  socials: [], // 例如 [{ label: '小红书', url: 'https://...' }]
  disciplines: ['脚本拆解与分镜设计', 'AI视觉资产与数字角色', 'AI视频生成与后期交付'],
  doll: {
    model: '', // /assets/doll/character.glb；空值使用内置银色临时角色。
    headNode: 'Head', // 模型头部对象/骨骼名称；找不到时仅轻微转动整个模型。
    scale: 1,
    rotationY: 0
  }
};
