import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,shot}=await boot({W:900,HH:600,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
const r=await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters,input=g.input;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
  const h=C.hole;window.__H=h;P.pos.set(h.x+h.r-.25,0,h.z+.9);P.yaw=Math.PI/2;P.vel.set(0,0,0);input.keys.KeyG=true;const log=[];
  for(let i=0;i<90;i++){g.logic(1/60);if(i%15==0)log.push([i,+P.pos.y.toFixed(2),!!P.hang,!!P.ragdoll,P.ragdoll&&P.ragdoll.P.Hips?+P.ragdoll.P.Hips.y.toFixed(2):null,Math.round(P.stamina)]);}
  return log;});
console.log(JSON.stringify(r));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,h=window.__H,P=g.player;const L=new T.PointLight(0xffe8d0,6,8,1.2);L.position.set(h.x,1.5,h.z);g.scene.add(L);const c=P.ragdoll?P.ragdoll.P.Spine2:P.pos;window.__dbgCam={p:new T.Vector3(h.x-.4,.9,h.z-.6),t:c.clone()};});
await fr(3);await shot('../out/hang_a.jpg',90);
const r2=await page.evaluate(()=>{const g=window.__game,P=g.player,input=g.input;input.keys.KeyW=true;const log=[];for(let i=0;i<300;i++){g.logic(1/60);if(i==40)input.keys.KeyW=false;if(i%30==0)log.push([i,+P.pos.y.toFixed(2),!!P.hang,!!P.ragdoll,P.ragdoll&&P.ragdoll.P.Hips?+P.ragdoll.P.Hips.y.toFixed(2):null]);}input.keys.KeyG=false;return log;});
console.log(JSON.stringify(r2));await page.evaluate(()=>{window.__dbgCam=null;});await fr(3);await shot('../out/hang_b.jpg',90);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
