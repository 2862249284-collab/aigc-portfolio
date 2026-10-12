import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const paths=[];
async function visit(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())await visit(path);else if(/\.(m?js)$/.test(path))paths.push(path);}}
for(const dir of ['src','scripts','tests'])await visit(dir);
paths.push('server.mjs');
for(const file of paths){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status)process.exit(result.status);}
console.log(`Syntax checks passed: ${paths.length} files (no third-party lint dependency).`);
