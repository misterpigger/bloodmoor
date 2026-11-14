import {boot} from './harness.mjs';
const OUT='../out/q218',TAG=process.env.TAG||'lh';
const {browser,page,logs,fr,tick,shot}=await boot({W:1100,HH:620,query:'?nohud'});
await page.evaluate(w=>{window.__WP=w;},process.env.WP||'cleaver');await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,3000));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);const W=g.WEAPONS||null;
 const it=g.testLoot(window.__WP||'cleaver',P.pos.x,P.pos.z);g.pickUp(P,it);
 const c=C.plan.cells[0];P.pos.set(c.cx,0,c.cz);P.yaw=.4;for(let k=0;k<40;k++)g.logic(1/60);
 for(let i=0;i<3&&g.camMode!=='fp';i++)window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}));P.pitch=-.9;});
await tick(30,1/60);await page.evaluate(()=>{window.__game.player.pitch=-.9;});await fr(3,1/30);await shot(`${OUT}/${TAG}_fp.jpg`,88);
await page.evaluate(()=>{const g=window.__game,T=g.THREE,P=g.player;for(let i=0;i<3&&g.camMode!=='close';i++)window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}));P.pitch=0;
 const s=Math.sin(P.yaw),c=Math.cos(P.yaw),W=(x,y,z)=>new T.Vector3(P.pos.x+c*x+s*z,y,P.pos.z-s*x+c*z);window.__lampCam=1;});
await tick(10);await page.evaluate(()=>{const g=window.__game,T=g.THREE,P=g.player,L=P.lamp.g.position;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);const X=P.pos;window.__dbgCam={p:new T.Vector3(X.x+fx*1.0+fz*.25,1.25,X.z+fz*1.0-fx*.25),t:new T.Vector3(X.x,1.0,X.z)};});await tick(2);await fr(3);await shot(`${OUT}/${TAG}_tp.jpg`,88);
await page.evaluate(()=>{const g=window.__game,T=g.THREE,P=g.player,S=P.sword;const m=S.H.clone().lerp(S.T,.6);const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);window.__dbgCam={p:new T.Vector3(m.x+fx*.45-fz*.2,m.y+.15,m.z+fz*.45+fx*.2),t:m};});await tick(2);await fr(3);await shot(`${OUT}/${TAG}_w.jpg`,88);
console.log(await page.evaluate(()=>{const g=window.__game,P=g.player;return JSON.stringify({w:P.sword&&P.sword.def.id,lamp:!!P.lamp,inHand:P.lamp&&P.lamp.inHand,cam:g.camMode});}));
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
