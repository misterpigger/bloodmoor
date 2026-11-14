import {boot} from './harness.mjs';import {execSync} from 'child_process';
const PTS=JSON.parse(process.env.PTS||'[[0,-30],[0,0],[0,30],[0,55]]'),H=+(process.env.HH||18);
const {browser,page,logs,fr,tick,start,shot}=await boot({W:640,HH:480,query:'?nohud'});
await start(process.env.MODE||'team',process.env.MAP||'road');await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,4000));await tick(20,1/60);
const fs_=[];for(let i=0;i<PTS.length;i++){const [x,z,ty]=PTS[i];
  await page.evaluate(([x,z,H,ty])=>{const g=window.__game,T=g.THREE;const rx=g.ROAD?g.roadX(z):0;window.__pause=true;window.__dbgCam={p:new T.Vector3(x+rx+.01,H,z+(ty!=null?ty:-H*.8)),t:new T.Vector3(x+rx,0,z)};g.camera.fov=60;g.camera.updateProjectionMatrix();},[x,z,H,ty]);
  await fr(2,1/60);const f=`../maps203/_td${i}.jpg`;await shot(f,88);fs_.push(f);}
execSync(['python3','sheet.py',`../maps203/${process.env.NAME||'td'}.jpg`,...fs_].join(' '));
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
