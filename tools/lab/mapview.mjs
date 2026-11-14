// four views (N,E,S,W) from above the player's head, one sheet per map. RUNS=[[mode,map,[x,z]?],...]
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'../maps';fs.mkdirSync(OUT,{recursive:true});
const RUNS=JSON.parse(process.env.RUNS||'[["duel","arena"]]');const TAG=process.env.TAG||'v';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:800,HH:450,query:'?nohud'+(process.env.Q||'')});
for(const [mode,map,at,hh] of RUNS){
  await start(mode,map);await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,+(process.env.WAIT||4000)));await tick(20,1/60);
  const fs_=[];
  for(let i=0;i<4;i++){
    await page.evaluate(([i,at,hh])=>{const g=window.__game,P=g.player,T=g.THREE;const x=at?at[0]:P.pos.x,z=at?at[1]:P.pos.z,y=(at?g.groundY?g.groundY(x,z,50):0:P.pos.y)+(hh||2.3);
      const a=i*Math.PI/2;window.__pause=true;window.__dbgCam={p:new T.Vector3(x,y,z),t:new T.Vector3(x+Math.sin(a)*10,y-1.2,z-Math.cos(a)*10)};g.camera.fov=72;g.camera.updateProjectionMatrix();},[i,at||null,hh||0]);
    await fr(2,1/60);const f=`${OUT}/_${TAG}_${mode}_${map}_${i}.jpg`;await shot(f,90);fs_.push(f);}
  execSync(['python3','sheet.py',`${OUT}/${TAG}_${mode}_${map}.jpg`,...fs_].join(' '));for(const f of fs_)fs.unlinkSync(f);
  console.log('sheet',mode,map);
  await page.evaluate(()=>{window.__dbgCam=null;window.__pause=false;});
}
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
