// the player holding each weapon in the yard: front-quarter view and a close view of the head/hilt
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'../wshow';fs.mkdirSync(OUT,{recursive:true});const IDX=JSON.parse(process.env.IDX||'[7,8,9,10,11]');
const {browser,page,logs,fr,tick,start,shot}=await boot({W:520,HH:520,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,3500));
await page.evaluate(()=>{const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#yard,.banner,#banner{display:none!important}';document.head.appendChild(st);const g=window.__game;for(const f of g.fighters)if(f.dummy){f.pos.x+=40;}});
const fl=[];
for(const i of IDX){await page.evaluate(i=>{const g=window.__game,P=g.player;window.__pause=false;window.__yardArm(P,i);g.input.locked=false;g.input.mx=.5;g.input.my=.4;for(let k=0;k<90;k++)g.logic(1/60);},i);
  const cams=process.env.CAMS?JSON.parse(process.env.CAMS):[[1.3,1.35,2.3,0,1.15,.2,50],[.9,1.5,1.2,.15,1.5,.55,34]];
  for(let c=0;c<cams.length;c++){await page.evaluate(c=>{const g=window.__game,P=g.player,T=g.THREE,s=Math.sin(P.yaw),co=Math.cos(P.yaw),w=(x,y,z)=>new T.Vector3(P.pos.x+(-co)*x+s*z,P.pos.y+y,P.pos.z+s*x+co*z);
      let t=w(c[3],c[4],c[5]);if(c[7]&&P.sword){const S=P.sword;t=S.H.clone().addScaledVector(S.axis,S.len*c[7]);const p=t.clone().add(new T.Vector3(-co*c[0]+s*c[2],c[1],s*c[0]+co*c[2]));window.__dbgCam={p,t};}else window.__dbgCam={p:w(c[0],c[1],c[2]),t};window.__pause=true;g.camera.fov=c[6]||50;g.camera.updateProjectionMatrix();},cams[c]);
    await fr(2,1/60);const f=`${OUT}/_w${i}_${c}.jpg`;await shot(f,90);fl.push(f);}}
execSync(['python3','sheet.py',`${OUT}/${process.env.NAME||'w'}.jpg`,...fl].join(' '));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
