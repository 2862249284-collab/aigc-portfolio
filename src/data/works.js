import { posters } from './posters.js';
import { banners } from './banners.js';
import { ips } from './ips.js';
import { films } from './films.js';
import { bilibiliWorks } from './bilibili.js';
// 在此添加真实项目。示例完整格式见 README.md；无需改动页面组件。
// 图片类作品由 scripts/sync-posters.mjs 生成，视频类作品由 scripts/sync-films.mjs 生成。
export const works = [
  ...bilibiliWorks,
  ...posters,
  ...banners,
  ...ips,
  ...Object.values(films).flat(),
  // { id:'my-first-poster', title:'作品名称', category:'poster', year:2026,
  //   description:'项目介绍', cover:'/assets/works/poster/cover.webp',
  //   mediaType:'image', media:'/assets/works/poster/main.webp',
  //   gallery:[], tools:['创作工具'], featured:true }
];

export const worksFor = category => works.filter(work => work.category === category);
export function findWork(category, id) {
  return works.find(work => work.category === category && work.id === id) || null;
}
