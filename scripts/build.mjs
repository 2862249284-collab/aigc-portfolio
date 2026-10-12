import {mkdir,readdir,readFile,stat,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {categories} from '../src/data/categories.js';
import {works} from '../src/data/works.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'dist');
const arg=process.argv.find(value=>value.startsWith('--base='));
const base=(arg?.slice(7)||process.env.BASE_PATH||'').replace(/^\/+|\/+$/g,'');
if(base&&!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(base))throw new Error('Invalid deployment base path');
const prefix=base?'/'+base:'';
function rewrite(text){
 if(!prefix)return text;
 return text.replace(/(["'`(])\/(assets|works|src|vendor|plate|public)(?=[/"'`?#])/g,`$1${prefix}/$2`).replace(/href="\/(?=["#])/g,`href="${prefix}/`).replace(/(["'(])\/(portfolio\.css|style\.css|main\.js)/g,`$1${prefix}/$2`);
}
async function copy(source,dest){
 const info=await stat(source);if(info.isDirectory()){await mkdir(dest,{recursive:true});for(const name of await readdir(source))await copy(path.join(source,name),path.join(dest,name));return;}
 const buffer=await readFile(source);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,/\.(html|css|js)$/.test(source)?rewrite(buffer.toString()):buffer);
}
// Only generated build output may be cleared; never touch source/public assets.
if(output!==path.resolve(root,'dist')||path.dirname(output)!==root)throw new Error('Unsafe build output');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const entry of ['index.html','portfolio.css','main.js','style.css','src','vendor','plate'])await copy(path.join(root,entry),path.join(output,entry));
await copy(path.join(root,'public/assets'),path.join(output,'assets'));
await copy(path.join(root,'public/favicon.svg'),path.join(output,'public/favicon.svg'));
await writeFile(path.join(output,'src/lib/base-path.js'),`export const basePath=${JSON.stringify(prefix)};\nexport function stripBase(path){return basePath&&(path===basePath||path.startsWith(basePath+'/'))?path.slice(basePath.length)||'/':path;}\n`);
const index=await readFile(path.join(output,'index.html'));
for(const route of [...categories.map(c=>`works/${c.id}`),...works.map(w=>`works/${w.category}/${w.id}`)]){const dir=path.join(output,route);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),index);}
await writeFile(path.join(output,'404.html'),index);await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'_redirects'),`${prefix}/works/* ${prefix}/index.html 200\n`);
console.log(`Static build ready: ${output}; base=${prefix||'/'}; ${categories.length+works.length} deep links.`);
