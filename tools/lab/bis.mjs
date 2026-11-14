import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:900,HH:600,query:'?nohud'});
await start('duel','colosseum');await fr(2,1/30);await tick(240);
await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);window.__B=B;B.pos.set(P.pos.x,0,P.pos.z+2.2);P.yaw=0;P.ai&&0;B.ai.target=null;for(let i=0;i<10;i++)g.logic(1/60);
  B.pos.set(P.pos.x,0,P.pos.z+2.2);B.bisect(new T.Vector3(2.2,0,.3));const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner{display:none!important}';document.head.appendChild(st);});
for(const [i,n] of [[0,6],[1,18],[2,40],[3,120]]){await tick(n);await page.evaluate(()=>{const g=window.__game,B=window.__B,T=g.THREE;const h=B.ragdoll?B.ragdoll.P.Hips:B.pos;const D=g.debris[g.debris.length-1];const u=D&&D.rag?D.rag.P.Spine1:h;const mx=(h.x+u.x)/2,mz=(h.z+u.z)/2;window.__dbgCam={p:new T.Vector3(mx+1.2,1.5,mz-2.6),t:new T.Vector3(mx,.45,mz)};});await fr(2,1/60);await shot(`bis/b${i}.jpg`,88);}
for(const w of ['u','l']){await page.evaluate(w=>{const g=window.__game,B=window.__B,T=g.THREE;const D=g.debris[g.debris.length-1];const c=w==='u'?D.rag.P.Spine2:B.ragdoll.P.Hips;window.__dbgCam={p:new T.Vector3(c.x+.5,1.0,c.z-1.1),t:new T.Vector3(c.x,.15,c.z)};},w);await fr(2,1/60);await shot(`bis/c_${w}.jpg`,90);}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
