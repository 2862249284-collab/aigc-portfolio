import { stripBase } from './base-path.js';
import { findCategory } from '../data/categories.js';
import { findWork } from '../data/works.js';

export function resolveRoute(pathname){
  let path;try{path=decodeURIComponent(stripBase(pathname)).replace(/\/+$/,'')||'/';}catch{return {type:'not-found'};}
  if(path==='/')return {type:'home'};
  const parts=path.split('/').filter(Boolean);
  if(parts[0]!=='works'||parts.length<2||parts.length>3)return {type:'not-found'};
  const category=findCategory(parts[1]);if(!category)return {type:'not-found'};
  if(parts.length===2)return {type:'category',category};
  const work=findWork(category.id,parts[2]);return work?{type:'detail',category,work}:{type:'not-found'};
}
