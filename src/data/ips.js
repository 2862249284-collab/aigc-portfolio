// Names, roles and descriptions are transcribed from the supplied design boards.
// Original boards retain backgrounds and layout. Cutouts are not used.
const base='/assets/works/ip/';
const original=file=>base+'originals/'+encodeURIComponent(file);
const records=[
 {id:'linya',title:'凛芽',role:'薄荷机械猫 · 静域巡查员',description:'擅长夜间侦察、路线分析与精准判断。先观察，再行动。用清晰判断守护团队。',board:'0901_凛芽_人物设定.png',expressions:'10，02_凛芽_表情与细节.png'},
 {id:'landou',title:'岚斗',role:'霜蓝护卫犬 · 前线护卫员',description:'快速响应，近距守护，时刻保持警觉。遇到突发状况，总会先一步站到前面。',board:'11.03_岚斗_人物设定.png',expressions:'12.04_岚斗_表情档案.png'},
 {id:'wuli',title:'雾璃',role:'月雾跃兔 · 情报解析师',description:'擅长从细节中寻找答案，把复杂信息梳理成清晰而准确的判断。',board:'13.05_雾璃_人物设定与三视图.png',expressions:'14.06_雾璃_表情与细节.png'},
 {id:'nuanyou',title:'暖柚',role:'暖橙绵羊 · 团队协作伙伴',description:'留意伙伴的情绪，用耐心回应每个小需要。柔软卷毛与暖橙配件，让机能造型多一份亲和。',board:'15.07_暖柚_人物设定.png',expressions:'16.08_暖柚_表情档案.png'}
];
const presentation={"linya":{"personality":"冷静观察 · 判断清晰","keywords":["薄荷配色","机械猫","机能造型"]},"landou":{"personality":"警觉 · 主动守护","keywords":["霜蓝配色","护卫犬","机能造型"]},"wuli":{"personality":"细致 · 善于分析","keywords":["月雾配色","拟人兔","角色三视图"]},"nuanyou":{"personality":"耐心 · 关注伙伴","keywords":["暖橙配件","柔软卷毛","亲和比例"]}};
export const ips=records.map(record=>({...record,...presentation[record.id],category:'ip',mediaType:'image',media:original(record.board),cover:base+`characters/${record.id}/turnaround-preview.webp`,tools:[],gallery:[
 {src:original(record.board),preview:base+`characters/${record.id}/turnaround-preview.webp`,caption:'人物设定与三视图'},
 {src:original(record.expressions),preview:base+`characters/${record.id}/expressions-preview.webp`,caption:'表情与细节'}
]}));
export const ipScenes=[
 ['商城中庭快闪展','17.01_商城中庭快闪展.png'],
 ['柜台选购','18.02_柜台选购_背影.png'],
 ['海报长廊','19.03_海报长廊_背影.png'],
 ['展台近景','20.04_展台近景_背影挑选.png']
].map(([title,file],i)=>({id:`scene-${i+1}`,title,src:original(file),preview:base+`scenes/scene-${String(i+1).padStart(2,'0')}-preview.webp`}));
export const ipGroupPoster=original('08IP海报.png');

export const ipGalleryItems=[
 ...ips.map(work=>({id:work.id,title:work.title,kind:'character',media:work.media,cover:work.cover,href:`/works/ip/${work.id}`,actionLabel:'VIEW CHARACTER / 查看角色'})),
 ...ipScenes.map((scene,sceneIndex)=>({id:scene.id,title:scene.title,kind:'scene',media:scene.src,cover:scene.preview,sceneIndex,actionLabel:'VIEW SCENE / 查看场景'}))
];
