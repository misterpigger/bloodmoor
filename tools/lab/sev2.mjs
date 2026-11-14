import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:900,HH:600,query:'?nohud'});
await start('duel','colosseum');await fr(2,1/30);await tick(240);
await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);window.__B=B;B.ai.target=null;B.noAI=1;for(let i=0;i<10;i++)g.logic(1/60);
  B.sever('LeftHand',new T.Vector3(1.5,0,0),.5);B.sever('RightLeg',new T.Vector3(-1,0,0),.55);B.sever('RightForeArm',new T.Vector3(-1,0,.5),.5);B.goDown&&B.goDown(P);const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner{display:none!important}';document.head.appendChild(st);});
for(const [i,n] of [[0,4],[1,30],[2,120]]){await tick(n);await page.evaluate(()=>{const g=window.__game,B=window.__B,T=g.THREE;const h=B.ragdoll?B.ragdoll.P.Hips:B.pos.clone().setY(1);window.__dbgCam={p:new T.Vector3(h.x+1.6,1.5,h.z-2.2),t:new T.Vector3(h.x,.6,h.z)};});await fr(2,1/60);await shot(`bis/t${i}.jpg`,88);}
await page.evaluate(()=>{const g=window.__game,B=window.__B,T=g.THREE;B.sever('LeftFoot',new T.Vector3(0,1,1),.6);});await tick(60);await fr(2,1/60);await shot(`bis/t3.jpg`,88);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
