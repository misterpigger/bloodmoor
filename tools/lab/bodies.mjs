// renders the player's body in each build (bare, drawers) from front and side in daylight. env OUT, NAME, BUILDS (look.b list), O (garb)
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'bodies';fs.mkdirSync(OUT,{recursive:true});const NAME=process.env.NAME||'b';
const BL=JSON.parse(process.env.BUILDS||'[3,0,2,1]'),O=+(process.env.O||0);
const {browser,page,logs,fr,tick,start,shot}=await boot({W:900,HH:1000,query:'?nohud'+(process.env.Q||'')});
await start(process.env.MODE||'yard',process.env.MAP||'yard');await tick(120,1/60);
const CAMS=JSON.parse(process.env.CAMS||'[[0,1.15,2.7,0,1.0,0],[2.6,1.15,0.3,0,1.0,0]]');
for(const b of BL){
  await page.evaluate(([b,O])=>{const g=window.__game,P=g.player;for(const f of g.fighters)if(f!==P&&f.root)f.root.visible=false;const L=Object.assign({},P.look,{b,o:O,bl:O?0:1,ft:0});window.__relook(P,L);if(P.sword&&P.sword.mesh)P.sword.mesh.visible=false;},[b,O]);
  await new Promise(r=>setTimeout(r,2500));await tick(60,1/60);await fr(10,1/60);
  for(let i=0;i<CAMS.length;i++){const c=CAMS[i];
    await page.evaluate(c=>{const g=window.__game,P=g.player,T=g.THREE;const s=Math.sin(P.yaw),co=Math.cos(P.yaw);const w=(x,y,z)=>new T.Vector3(P.pos.x+(-co)*x+s*z,P.pos.y+y,P.pos.z+s*x+co*z);
      window.__pause=true;window.__dbgCam={p:w(c[0],c[1],c[2]),t:w(c[3],c[4],c[5])};g.camera.fov=40;g.camera.updateProjectionMatrix();},c);
    await fr(2,1/60);await shot(`${OUT}/${NAME}${b}_${i}.jpg`,90);}
  await page.evaluate(()=>{window.__pause=false;window.__dbgCam=null;});
}
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
