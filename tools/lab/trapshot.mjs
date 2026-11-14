import {boot} from './harness.mjs';
const TY=process.env.TY||'swing';const OUT='../out/q218';import fs from 'fs';fs.mkdirSync(OUT,{recursive:true});
const {browser,page,logs,fr,tick,shot}=await boot({W:960,HH:540,query:'?nohud&ctraps='+TY});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,3000));
const ok=await page.evaluate((TY)=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const t=(TY==='swing'?C.swings:TY==='spikes'?C.spikes:C.traps.filter(t=>!t.gap))[0];if(!t)return false;window.__t=t;const u0=TY==='pit'?t.a0+.9:t.u0;
 const W=(u,y,w)=>t.ax?new T.Vector3(u,y,t.m+w):new T.Vector3(t.m+w,y,u);
 P.pos.copy(W(u0-6,0,0));P.model.visible=false;
 const L=new T.PointLight(0xffc890,4,10,1.2);L.position.copy(W(u0-1.6,1.9,.3));g.scene.add(L);
 window.__dbgCam={p:W(u0-(TY==='pit'?1.9:2.6),TY==='pit'?1.7:1.55,-.55),t:W(u0+.6,TY==='swing'?1.4:TY==='pit'?-.4:.6,.2)};window.__W=W;window.__u0=u0;return true;},TY);
if(!ok){console.log('none');process.exit(0);}
await tick(10);await fr(3);await shot(`${OUT}/${TY}_a.jpg`,88);
await page.evaluate((TY)=>{const g=window.__game,t=window.__t,W=window.__W,u0=window.__u0;
 if(TY==='swing'){t.armed=false;for(let k=0;k<26;k++)g.logic(1/60);}
 else if(TY==='spikes'){t.st='fire';for(let k=0;k<12;k++)g.logic(1/60);}
 else{g.cryptTrapOpen(t);for(let k=0;k<40;k++)g.logic(1/60);}},TY);
await fr(3);await shot(`${OUT}/${TY}_b.jpg`,88);
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
