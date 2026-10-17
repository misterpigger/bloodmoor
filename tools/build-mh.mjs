// Rebuilds ../fighters.json from the MakeHuman (CC0) bodies: run mh/build_mh.py and mh/bake_skin.py first (see mh/README.md).
//   node build-mh.mjs <dir with mh_bodies.json>
import { chromium } from 'playwright';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),SRC=process.argv[2]||path.join(HERE,'mh','out');
const THREE_DIR=process.env.THREE_DIR||path.join(HERE,'node_modules/three');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:400,height:300}});page.on('pageerror',e=>console.error('page error:',e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
await page.route('**/*',async route=>{const u=new URL(route.request().url());
  if(u.host==='cdn.jsdelivr.net'){const f=path.join(THREE_DIR,u.pathname.replace('/npm/three@0.160.0/',''));return fs.existsSync(f)?route.fulfill({path:f,contentType:'application/javascript'}):route.fulfill({status:404});}
  if(u.host==='lab.test'){const p=decodeURIComponent(u.pathname);let f;
    if(p==='/lab.html')f=path.join(HERE,'mh/lab.html');else if(p==='/mh/build.js')f=path.join(HERE,'mh/build.js');else if(p==='/mh/mh_bodies.json')f=path.join(SRC,'mh_bodies.json');else if(p==='/game/xbot.json')f=path.join(HERE,'fighters/xbot.json');
    if(!f||!fs.existsSync(f))return route.fulfill({status:404});return route.fulfill({path:f,contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':'application/json'});}
  return route.abort();});
await page.goto('http://lab.test/lab.html');await page.waitForFunction(()=>window.READY,null,{timeout:60000});
const r=await page.evaluate(async()=>await window.BUILD({}));
console.log(r.log.join('\n'));
const b=Buffer.from(r.glb,'base64'),jl=b.readUInt32LE(12),json=JSON.parse(b.slice(20,20+jl).toString('utf8')),bl=b.readUInt32LE(20+jl),bin=b.slice(28+jl,28+jl+bl);
json.buffers=[{byteLength:bin.length,uri:'data:application/octet-stream;base64,'+bin.toString('base64')}];
json.asset.generator='Bloodmoor fighter build (MakeHuman CC0 bodies on the Mixamo X Bot skeleton)';
const out=process.env.OUT||path.join(HERE,'..','fighters.json');fs.writeFileSync(out,JSON.stringify(json));console.log('wrote',out,fs.statSync(out).size,'bytes');
await browser.close();
