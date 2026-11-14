import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:600,HH:400,query:'?nohud'+(process.env.Q||''),render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));
 g.startGame();window.__pause=true;for(let k=0;k<30;k++)g.logic(1/60);
 for(let t=0;t<20&&!g.CRYPT.doors.some(d=>!d.bar);t++){g.startGame();for(let k=0;k<30;k++)g.logic(1/60);}
 const C=g.CRYPT,P=g.player,F=g.fighters;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const d=C.doors.find(d=>!d.bar);const w=d.w;const out=[];const K=g.input.keys;
 const setup=(side,armed)=>{d.th=0;d.om=0;const nx=w.dx,nz=w.dz;// way normal points out of cell c
   P.pos.set(w.x-nx*side*1.6,0,w.z-nz*side*1.6);P.vel.set(0,0,0);P.yaw=Math.atan2(nx*side,nz*side);
   if(armed){const it=g.loot.find(l=>l.kind==='weapon'&&l.def.id!=='chest');if(it&&(!P.sword||P.sword.def.kind==='fist'))g.pickUp(P,it);}
   for(let k=0;k<20;k++)g.logic(1/60);};
 for(const armed of [false,true])for(const side of [1,-1]){setup(side,armed);let t=0,passed=false,maxTh=0,stuck=0,lastP=P.pos.clone();
   for(let k=0;k<300;k++){K.KeyW=true;g.logic(1/60);t+=1/60;maxTh=Math.max(maxTh,Math.abs(d.th));const prog=((P.pos.x-w.x)*w.dx+(P.pos.z-w.z)*w.dz)*side;if(prog>1.2){passed=true;break;}}
   K.KeyW=false;out.push({armed,side,wep:P.sword&&P.sword.def.id,passed,t:+t.toFixed(2),maxTh:+maxTh.toFixed(2),th:+d.th.toFixed(2)});}
 // kick
 for(const side of [1,-1]){if(P.sword&&P.sword.def.kind!=='fist'){P.dropSword(true);P.giveFists();}d.th=0;d.om=0;const nx=w.dx,nz=w.dz;P.pos.set(w.x-nx*side*.75,0,w.z-nz*side*.75);P.vel.set(0,0,0);P.yaw=Math.atan2(nx*side,nz*side);for(let k=0;k<20;k++)g.logic(1/60);
   window.__dkLog=1;window.__dkh=[];let hit=0;P.kickReq=true;let mx=0;const tr=[];for(let k=0;k<90;k++){g.logic(1/60);mx=Math.max(mx,Math.abs(d.th));if(k%6==0)tr.push(+d.th.toFixed(2));}const hk=window.__dkh;out.push({hk,tr,kt:P.kickT,w:[w.dx,w.dz],base:d.base,kick:side,maxTh:+mx.toFixed(2),th:+d.th.toFixed(2),om:+d.om.toFixed(2)});}
 return out;});
console.log(JSON.stringify(r,null,0));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
