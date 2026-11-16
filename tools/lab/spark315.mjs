// sparks from a clash, seen up close: strikes sparks in front of the camera in the Yard and takes frames as they fly. env N (count), SP (closing speed)
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'spark';fs.mkdirSync(OUT,{recursive:true});
const {browser,page,logs,fr,shot,start}=await boot({W:960,HH:540,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena',{pause:true});await fr(30,1/60);
await page.evaluate(([n,sp])=>{const g=window.__game,T=g.THREE,P=g.player;const c=P.pos.clone().add(new T.Vector3(Math.sin(P.yaw)*1.2,1.4,Math.cos(P.yaw)*1.2));
  window.__dbgCam={p:c.clone().add(new T.Vector3(Math.cos(P.yaw)*1.4,.1,-Math.sin(P.yaw)*1.4)),t:c};window.__sp=()=>g.spawnSparks(c,n,new T.Vector3(-Math.cos(P.yaw),0,Math.sin(P.yaw)),sp);},[+(process.env.N||40),+(process.env.SP||14)]);
for(const k of [0,1,3,6,10]){await page.evaluate(()=>window.__sp());await fr(k+1,1/60);await shot(`${OUT}/s${k}.jpg`,85);}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
