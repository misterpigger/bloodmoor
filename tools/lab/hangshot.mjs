import {boot} from './harness.mjs';
import fs from 'fs';
const {browser,page,logs,start,fr,tick,shot}=await boot({W:560,HH:380,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,2500));await fr(2,1/30);
await page.evaluate(([S0v,CLv])=>{const g=window.__game,P=g.player,F=g.fighters,PIT=g.PIT,T=g.THREE;window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#toast{display:none!important}';document.head.appendChild(st);
  for(const f of F)if(f!==P){f.pos.set(PIT.x+20,0,PIT.z+20);f.ai.skill=0;}
  const c={x:PIT.x+.8,z:PIT.z};P.pos.set(c.x,0,c.z+PIT.bw-.35);P.yaw=0;P.vel.set(0,0,0);P.stamina=100;P.hp=100;window.__c=c;window.__S0=S0v;window.__CL=CLv;
  window.__dbgCam={p:new T.Vector3(c.x+1.9,.7,c.z+PIT.bw+1.7),t:new T.Vector3(c.x,-.35,c.z+PIT.bw)};},[+(process.env.S0||30),+(process.env.CL||6)]);
const N=+(process.env.NF||20),names=[];
for(let i=0;i<N;i++){const info=await page.evaluate((i)=>{const g=window.__game,P=g.player,input=g.input;const S0=+window.__S0||0;for(let k=0;k<(i===0?S0:8);k++){const t=i*8+k;input.keys.KeyW=(i===0&&k<20)||(i>=+window.__CL);P.stamina=100;g.logic(1/60);}return [!!P.hang,P.hang?+P.hang.climb.toFixed(2):null,!!P.ragdoll,P.alive];},i);
  if(i<+(process.env.R0||0)){console.log(i,JSON.stringify(info));continue;}await fr(1,1/60);const n=`hang/h${String(i).padStart(2,'0')}.jpg`;await shot(n,80);names.push(n);console.log(i,JSON.stringify(info));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
