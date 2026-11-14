// close-up renders through the game's full pipeline. PRE: JS run in the page after the match starts (g=__game, P=player, F=fighters);
// CAMS: [[px,py,pz,tx,ty,tz],...] relative to the player's position and facing (x right, y up, z forward)
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'look';fs.mkdirSync(OUT,{recursive:true});const NAME=process.env.NAME||'l';
const mode=process.env.MODE||'duel',map=process.env.MAP||'arena';
const CAMS=JSON.parse(process.env.CAMS||'[[0.9,1.5,2.4,0,1.1,0],[-1.2,1.5,-2.2,0,1.1,0],[0.5,1.65,1.0,0,1.5,0]]');
const {browser,page,logs,fr,tick,start,shot}=await boot({W:+(process.env.W||1280),HH:+(process.env.H||720),query:'?nohud'+(process.env.Q||'')});
await start(mode,map);await fr(2,1/30);await tick(+(process.env.WARM||200),1/60);
if(process.env.PRE)await page.evaluate(async(src)=>{const g=window.__game,P=g.player,F=g.fighters;await (new Function('g','P','F','return (async()=>{'+src+'})()'))(g,P,F);},process.env.PRE);
await new Promise(r=>setTimeout(r,+(process.env.WAIT||2500)));await tick(+(process.env.SETTLE||30),1/60);
for(let i=0;i<CAMS.length;i++){const c=CAMS[i];
  await page.evaluate(c=>{const g=window.__game,P=g.player,T=g.THREE;const s=Math.sin(P.yaw),co=Math.cos(P.yaw);const w=(x,y,z)=>new T.Vector3(P.pos.x+(-co)*x+s*z,P.pos.y+y,P.pos.z+s*x+co*z);
    window.__pause=true;window.__dbgCam={p:w(c[0],c[1],c[2]),t:w(c[3],c[4],c[5])};if(c[6]){g.camera.fov=c[6];g.camera.updateProjectionMatrix();}},c);
  await fr(2,1/60);await shot(`${OUT}/${NAME}_${i}.jpg`,92);console.log('shot',i);}
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
