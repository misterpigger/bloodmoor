// a scripted player cut at a yard dummy, filmed every STEP frames from the player's own camera (CAM=own) or the side (CAM=side)
// MOVE: cutR|cutL|chop; WEP weapon id; logs per frame tip speed, hand-to-target lag, contacts
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'film';fs.mkdirSync(OUT,{recursive:true});const W=process.env.WEP||'longsword',MV=process.env.MOVE||'cutR',CAM=process.env.CAM||'own',STEP=+(process.env.STEP||2),DIST=+(process.env.DIST||1.45);
const {browser,page,logs,fr,start,shot}=await boot({W:+(process.env.W||640),HH:+(process.env.H||400),query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await page.evaluate(()=>{const st=document.createElement('style');st.textContent='#yard,#hud,#prompt,#topc,#grip{display:none!important}';document.head.appendChild(st);});
await new Promise(r=>setTimeout(r,2500));
await page.evaluate(([w,DIST])=>{const g=window.__game,P=g.player,T=g.THREE,input=g.input;window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);
  if(!P.sword||P.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  const D=g.fighters.filter(f=>f.dummy&&f.alive).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];for(const f of g.fighters)if(f!==P&&f!==D&&f.root)f.root.visible=false;
  const fw=new T.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw));window.__F={D,home:P.pos.clone(),fw,DIST};D.pos.copy(P.pos).addScaledVector(fw,DIST);D.yaw=P.yaw+Math.PI;
  for(let k=0;k<60;k++){input.locked=false;input.mx=.5;input.my=.45;input.lmb=false;P.ctrl.z=.46;P.stamina=100;g.logic(1/60);}},[W,DIST]);
const MOVES={cutR:{pre:[.86,.14],to:[.18,.72],t:.2},cutL:{pre:[.14,.14],to:[.82,.72],t:.2},chop:{pre:[.5,.03],to:[.5,.92],t:.18}};const M=MOVES[MV];
const seq=[];for(let i=0;i<30;i++)seq.push([M.pre[0],M.pre[1],0]);const n=Math.round(M.t*60);for(let i=0;i<n;i++){const u=(i+1)/n;seq.push([M.pre[0]+(M.to[0]-M.pre[0])*u,M.pre[1]+(M.to[1]-M.pre[1])*u,1]);}for(let i=0;i<20;i++)seq.push([M.to[0],M.to[1],1]);for(let i=0;i<16;i++)seq.push([.5,.45,0]);
const log=[];let fi=0;
for(let i=0;i<seq.length;i++){const r=await page.evaluate(([s,cam])=>{const g=window.__game,P=g.player,T=g.THREE,input=g.input,F=window.__F;input.locked=false;input.mx=s[0];input.my=s[1];input.lmb=!!s[2];P.ctrl.z=.46;P.stamina=100;F.D.pos.copy(F.home).addScaledVector(F.fw,F.DIST);if(i0===undefined)var i0=0;window.__ulog=window.__ulog||[];g.logic(1/60);
  const sw=P.sword,ht=P.handTarget(new T.Vector3());if(cam==='side'){const r=new T.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw));window.__dbgCam={p:P.pos.clone().addScaledVector(F.fw,.7).addScaledVector(r,-3.2).add(new T.Vector3(0,1.2,0)),t:P.pos.clone().addScaledVector(F.fw,.7).add(new T.Vector3(0,1.05,0))};}
  return [+sw.tipVel.length().toFixed(1),+(ht.distanceTo(sw.H)*100).toFixed(0),(window.__ulog||[]).length];},[seq[i],CAM]);log.push(r);
  if(i>=24&&i%STEP===0&&fi<24){await page.evaluate(()=>{window.__pause=true;});await fr(1,1/60);await shot(`${OUT}/f${String(fi).padStart(3,'0')}.jpg`,82);fi++;}}
console.log(log.map((r,i)=>i+':'+r.join('/')).slice(24).join(' '));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();
execSync(`python3 -c "
from PIL import Image,ImageDraw;import glob
fs=sorted(glob.glob('${OUT}/f*.jpg'));ims=[Image.open(f) for f in fs];w,h=ims[0].size;c=4;r=(len(ims)+c-1)//c
s=Image.new('RGB',(c*w,r*h))
for i,im in enumerate(ims):s.paste(im,((i%c)*w,(i//c)*h));ImageDraw.Draw(s).text(((i%c)*w+4,(i//c)*h+4),str(i),fill=(255,255,0))
s.save('${OUT}/sheet.jpg',quality=84)"`);process.exit(0);
