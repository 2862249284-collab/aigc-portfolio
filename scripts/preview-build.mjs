// Static-only preview: intentionally no SPA fallback, like GitHub Pages.
import http from 'node:http';
import path from 'node:path';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const prefix='/'+(process.argv[3]||'').replace(/^\/+|\/+$/g,'');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);
 if(prefix!=='/'){if(!pathname.startsWith(prefix+'/'))throw Error();pathname=pathname.slice(prefix.length);}
 let file=path.resolve(root,'.'+pathname);if(!file.startsWith(path.resolve(root)+path.sep)&&file!==path.resolve(root))throw Error();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 const info=await stat(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':info.size});createReadStream(file).pipe(res);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.argv[2]||4174),'127.0.0.1',()=>console.log('Static preview ready'));
