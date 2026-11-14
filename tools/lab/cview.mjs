// crypt close views: VIEWS=kind:dx:dy:dz:tx:ty:tz,... camera and target relative to that room's centre; 'corr' for the longest corridor
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'../out';const TAG=process.env.TAG||'cv';
const {browser,page,logs,fr,tick,shot}=await boot({W:+(process.env.W||960),HH:+(process.env.H||540),query:'?nohud'+(process.env.Q||'')});
await page.evaluate(()=>{window.__need=!!(new URLSearchParams(location.search).get('need'));});await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<120;k++)g.logic(1/60);if(window.__need){for(let t=0;t<14&&!(g.CRYPT.lows.length&&g.CRYPT.gaps.length);t++){g.startGame();for(let k=0;k<30;k++)g.logic(1/60);}}});
await new Promise(r=>setTimeout(r,3000));if(process.env.LIT)await page.evaluate(v=>window.__LIT=v,+process.env.LIT);
const kinds=await page.evaluate(()=>window.__game.CRYPT.plan.cells.map(c=>c.kind||c.type));console.log('kinds',kinds.join(' '));
const V=(process.env.VIEWS||'slab:1.6:1.6:1.4:0:.9:0').split(',');let i=0;
for(const v of V){const [k,...n]=v.split(':');const a=n.map(Number);
  const ok=await page.evaluate(([k,a])=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player;let cx,cz;
    if(k==='low'||k==='gap'){const q=k==='low'?C.lows[0]:C.gaps[0];if(!q)return false;const u=k==='low'?(q.a0+q.a1)/2:q.a0+q.len/2;cx=q.ax?u:q.m;cz=q.ax?q.m:u;if(!q.ax){const t=a[0];a[0]=a[2];a[2]=t;const t2=a[3];a[3]=a[5];a[5]=t2;}}else if(k==='corr'){const q=C.cors.slice().sort((x,y)=>y.L-x.L)[0];cx=(q.x0+q.x1)/2;cz=(q.z0+q.z1)/2;}else{const c=C.plan.cells.find(c=>(c.kind||c.type)===k);if(!c)return false;cx=c.cx;cz=c.cz;}
    for(const f of g.fighters.slice())if(f!==P){f.dispose();g.fighters.splice(g.fighters.indexOf(f),1);}
    P.pos.set(cx+a[0]*.85,0,cz+a[2]*.85);P.model.visible=false;if(!P.lamp){const l=g.lampAdd(P.pos.x,P.pos.z);l.f=P;P.lamp=l;l.fresh=true;}
    if(window.__LIT){if(!window.__lt){window.__lt=new T.PointLight(0xffe0c0,window.__LIT,9,1.2);g.scene.add(window.__lt);}window.__lt.position.set(cx+a[0],a[1]+.3,cz+a[2]);}window.__dbgCam={p:new T.Vector3(cx+a[0],a[1],cz+a[2]),t:new T.Vector3(cx+a[3],a[4],cz+a[5])};return true;},[k,a]);
  if(!ok){console.log('no',k);continue;}
  await tick(20,1/60);await fr(3,1/60);await shot(`${OUT}/${TAG}_${i}_${k}.jpg`,90);console.log('shot',k);i++;}
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
