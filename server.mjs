import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream','.woff2':'font/woff2'};

export function parseRange(header,size){
  const match=/^bytes=(\d*)-(\d*)$/.exec(header||'');
  if(!match||(!match[1]&&!match[2]))return null;
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
  return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<size&&end>=start?{start,end}:null;
}

export function createSiteServer(root=projectRoot){
  return http.createServer(async(req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
    let relative;
    if(pathname==='/'||pathname==='/index.html'||/^\/works(?:\/|$)/.test(pathname))relative='index.html';
    else if(pathname==='/plate'||pathname==='/plate/')relative='plate/index.html';
    else if(pathname.startsWith('/assets/'))relative='public'+pathname;
    else if(/^\/(src|vendor|public|plate)\//.test(pathname)||['/style.css','/main.js','/portfolio.css'].includes(pathname))relative=pathname.slice(1);
    else {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');return;}
    const filename=path.resolve(root,relative);
    if(!filename.startsWith(path.resolve(root)+path.sep)||relative.includes('\\')||relative.split('/').some(part=>part.startsWith('.'))){res.writeHead(403);res.end();return;}
    try{
      const info=await stat(filename);if(!info.isFile())throw new Error('Not a file');
      const headers={'Content-Type':mime[path.extname(filename).toLowerCase()]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
      let start=0,end=info.size-1,status=200;
      if(req.headers.range){const range=parseRange(req.headers.range,info.size);if(!range){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}({start,end}=range);status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
      headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
      if(req.method==='HEAD'||info.size===0){res.end();return;}
      const stream=createReadStream(filename,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
    }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Resource not found');}
  });
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||process.argv[2]||4173);
  const server=createSiteServer();
  server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`端口 ${port} 已被占用。请停止旧预览，或运行 node server.mjs 4174。`:error.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`AIGC Portfolio → http://127.0.0.1:${port}/`));
}
