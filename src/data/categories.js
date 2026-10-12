export const categories = Object.freeze([
  { id:'poster', name:'海报', english:'POSTER DESIGN', description:'让一个画面，承载所有想象。', medium:'image', ratio:'3 / 4' },
  { id:'banner', name:'Banner', english:'BANNER & CAMPAIGN', description:'在有限的画幅中，打开无限的视野。', medium:'image', ratio:'16 / 9' },
  { id:'ip', name:'IP', english:'DIGITAL CHARACTER', description:'为想象中的角色，赋予鲜活个性。', medium:'image', ratio:'4 / 5' },
  { id:'short-film', name:'短片', english:'AI SHORT FILM', description:'让每一帧，都成为故事的开始。', medium:'video', ratio:'16 / 9' },
  { id:'comic-drama', name:'漫剧', english:'ANIMATED STORIES', description:'打破画格，让故事自由生长。', medium:'video', ratio:'4 / 3' },
  { id:'tvc', name:'TVC', english:'COMMERCIAL FILM', description:'将品牌的灵感，凝结成影像。', medium:'video', ratio:'16 / 9' },
  { id:'ai-live-action', name:'AI真人', english:'SYNTHETIC REALITY', description:'探索真实与想象之间的边界。', medium:'video', ratio:'3 / 4' },
  { id:'game', name:'游戏', english:'WORLDBUILDING', description:'创造一个世界，也创造一种可能。', medium:'video', ratio:'16 / 10' }
]);
export const findCategory = id => categories.find(category => category.id === id);
