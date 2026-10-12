import {videoProjects} from './video-projects.js';
import {xiaohongshuVideos} from './xiaohongshu.js';
export const bilibiliWorks=videoProjects.map(work=>({...work,episodes:work.episodes.map(episode=>({...episode,...xiaohongshuVideos.find(item=>item.projectId===work.id&&item.episode===episode.number)}))}));
export const bilibiliVideos=Object.fromEntries(['short-film','comic-drama','tvc','ai-live-action','game'].map(category=>[category,bilibiliWorks.filter(work=>work.category===category)]));
