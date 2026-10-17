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
// the exporter writes the shared expression targets once per body: keep one copy and repack the buffer
const crypto=await import('crypto');const seen=new Map(),remap=new Map();
json.accessors.forEach((acc,i)=>{const bv=json.bufferViews[acc.bufferView];const h=crypto.createHash('md5').update(bin.slice((bv.byteOffset||0)+(acc.byteOffset||0),(bv.byteOffset||0)+bv.byteLength)).digest('hex')+acc.count+acc.type+acc.componentType;
  if(seen.has(h))remap.set(i,seen.get(h));else seen.set(h,i);});
for(const m of json.meshes)for(const p of m.primitives){if(p.targets)for(const t of p.targets)for(const k in t)if(remap.has(t[k]))t[k]=remap.get(t[k]);}
const usedBV=new Set();const keepAcc=json.accessors.map((a,i)=>!remap.has(i));
// accessors still referenced
const refAcc=new Set();const walk=o=>{if(!o||typeof o!=='object')return;for(const k in o){if((k==='indices'||k==='inverseBindMatrices'||k==='input'||k==='output')&&typeof o[k]==='number')refAcc.add(o[k]);else if(k==='attributes'&&o[k])for(const a in o[k])refAcc.add(o[k][a]);else if(k==='targets')for(const t of o[k])for(const a in t)refAcc.add(t[a]);else walk(o[k]);}};
walk(json.meshes);walk(json.skins);walk(json.animations);
const accMap=new Map(),newAcc=[];json.accessors.forEach((a,i)=>{if(refAcc.has(i)){accMap.set(i,newAcc.length);newAcc.push(a);}});
const fix=o=>{if(!o||typeof o!=='object')return;for(const k in o){if((k==='indices'||k==='inverseBindMatrices'||k==='input'||k==='output')&&typeof o[k]==='number')o[k]=accMap.get(o[k]);else if(k==='attributes'&&o[k])for(const a in o[k])o[k][a]=accMap.get(o[k][a]);else if(k==='targets')for(const t of o[k])for(const a in t)t[a]=accMap.get(t[a]);else fix(o[k]);}};
fix(json.meshes);fix(json.skins);fix(json.animations);json.accessors=newAcc;
const bvMap=new Map(),newBV=[],parts=[];let off=0;
for(const a of json.accessors){if(!bvMap.has(a.bufferView)){const bv=json.bufferViews[a.bufferView];const data=bin.slice(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength);const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}
  bvMap.set(a.bufferView,newBV.length);newBV.push({...bv,byteOffset:off});parts.push(data);off+=data.length;}a.bufferView=bvMap.get(a.bufferView);}
for(const im of json.images||[])if(im.bufferView!=null){const bv=json.bufferViews[im.bufferView];const data=bin.slice(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength);const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}im.bufferView=newBV.length;newBV.push({...bv,byteOffset:off});parts.push(data);off+=data.length;}
json.bufferViews=newBV;const bin2=Buffer.concat(parts);console.log('repacked',bin.length,'->',bin2.length);
json.buffers=[{byteLength:bin2.length,uri:'data:application/octet-stream;base64,'+bin2.toString('base64')}];
json.asset.generator='Bloodmoor fighter build (MakeHuman CC0 bodies on the Mixamo X Bot skeleton)';
const out=process.env.OUT||path.join(HERE,'..','fighters.json');fs.writeFileSync(out,JSON.stringify(json));console.log('wrote',out,fs.statSync(out).size,'bytes');
await browser.close();
