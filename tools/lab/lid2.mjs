import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,shot}=await boot({W:900,HH:600,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
const r=await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters,input=g.input;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
  const k=C.caskets[0];if(!k)return 'no casket';const fx=Math.sin(k.ry),fz=Math.cos(k.ry);P.pos.set(k.x+fx*.95,0,k.z+fz*.95);P.yaw=Math.atan2(-fx,-fz);P.vel.set(0,0,0);
  const log=[];const st=(n,my)=>{for(let i=0;i<n;i++){input.locked=false;input.mx=.5;input.my=my;g.logic(1/60);}log.push([+(k.ang||0).toFixed(2),k.opened,!!P.lidLift]);};
  st(10,.6);const pr=g.cryptUse(P,true);g.cryptUse(P);st(20,.6);st(14,.38);window.__k=k;return {pr,log};});
console.log(JSON.stringify(r));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,k=window.__k,P=g.player;const fx=Math.sin(k.ry),fz=Math.cos(k.ry);const L=new T.PointLight(0xffe8d0,6,8,1.2);L.position.set(k.x+fx*1.5,2,k.z+fz*1.5);g.scene.add(L);
  const s=Math.cos(k.ry),c=Math.sin(k.ry);window.__dbgCam={p:new T.Vector3(k.x+fx*1.6+fz*1.3,1.5,k.z+fz*1.6-fx*1.3),t:new T.Vector3(k.x+fx*.4,.6,k.z+fz*.4)};});
await tick(5);await fr(3);await shot('../out/lid2_a.jpg',90);
const r2=await page.evaluate(()=>{const g=window.__game,P=g.player,input=g.input,k=window.__k;const log=[];for(let i=0;i<20;i++){input.locked=false;input.my=.25;g.logic(1/60);}g.cryptUse(P);for(let i=0;i<60;i++){g.logic(1/60);}log.push(+k.ang.toFixed(2));return log;});
console.log('after release',JSON.stringify(r2));await fr(3);await shot('../out/lid2_b.jpg',90);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
