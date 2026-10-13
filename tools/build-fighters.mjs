// Rebuilds ../fighters.json: the Quaternius CC0 bodies, outfits and hair rebound to the game's Mixamo X Bot skeleton,
// with its idle/walk/run animations (rotations only, hips height corrected). Not needed to play.
//
//   cd tools && npm install && npx playwright install chromium
//   node build-fighters.mjs            # fetches the Quaternius files the first time (git sparse checkout, ~130 MB)
//
// Source of the Quaternius files: a CC0 redistribution of the official Standard packs (Universal Base Characters,
// Modular Character Outfits - Fantasy) in OpenAgentsInc/openagents, pinned below. Their licence texts come with them.
import { chromium } from 'playwright';import fs from 'fs';import path from 'path';import {execSync} from 'child_process';import {fileURLToPath} from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),F=path.join(HERE,'fighters'),Q_REPO=path.join(F,'quaternius'),Q=path.join(Q_REPO,'assets/verse/characters/quaternius');
const MIRROR='https://github.com/OpenAgentsInc/openagents',COMMIT='716c2ad87cdc459d536d7c8640a52cb9460b8079';
if(!fs.existsSync(Q)){
  console.log('fetching the Quaternius files…');
  execSync(`git init -q "${Q_REPO}" && cd "${Q_REPO}" && git remote add origin ${MIRROR} && git sparse-checkout set assets/verse/characters/quaternius && git fetch -q --depth 1 --filter=blob:none origin ${COMMIT} && git checkout -q FETCH_HEAD`,{stdio:'inherit',shell:'/bin/bash'});
}
const THREE_DIR=path.join(HERE,'node_modules/three');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:900,height:700}});page.on('pageerror',e=>console.error('page error:',e.message));
await page.route('**/*',async route=>{const u=new URL(route.request().url());
  if(u.host==='cdn.jsdelivr.net'){const f=path.join(THREE_DIR,u.pathname.replace('/npm/three@0.160.0/',''));return fs.existsSync(f)?route.fulfill({path:f,contentType:'application/javascript'}):route.fulfill({status:404});}
  if(u.host==='lab.test'){const p=decodeURIComponent(u.pathname);const f=p.startsWith('/q/')?path.join(Q,p.slice(3)):p.startsWith('/game/')?path.join(F,p.slice(6)):path.join(F,p.slice(1));
    if(!fs.existsSync(f))return route.fulfill({status:404});return route.fulfill({path:f,contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.png')?'image/png':'application/octet-stream'});}
  return route.abort();});
await page.goto('http://lab.test/lab.html');await page.waitForFunction(()=>window.READY,null,{timeout:60000});
const r=await page.evaluate(async()=>await window.BUILD({tex:1024,ntex:512}));
console.log(r.log.join('\n'));
// GLB -> glTF JSON with the buffer embedded, the format the game loads
const b=Buffer.from(r.glb,'base64'),jl=b.readUInt32LE(12),json=JSON.parse(b.slice(20,20+jl).toString('utf8')),bl=b.readUInt32LE(20+jl),bin=b.slice(28+jl,28+jl+bl);
json.buffers=[{byteLength:bin.length,uri:'data:application/octet-stream;base64,'+bin.toString('base64')}];
json.asset.generator='Bloodmoor fighter build (Quaternius CC0 bodies on the Mixamo X Bot skeleton)';
const out=path.join(HERE,'..','fighters.json');fs.writeFileSync(out,JSON.stringify(json));console.log('wrote',out,fs.statSync(out).size,'bytes');
await browser.close();
