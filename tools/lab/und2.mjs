import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,shot}=await boot({W:1000,HH:620,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters;const c=C.plan.cells[0];
  
  const fo=F.filter(f=>f!==P),a=fo.find(f=>f.undead==='skel')||fo[0],b=fo.find(f=>f!==a&&!f.undead)||fo.find(f=>f!==a);a.pos.set(c.cx-.8,0,c.cz);b.pos.set(c.cx+.8,0,c.cz);for(const f of [a,b]){f.ai.mind.mood='peace';f.ai.mind.aware=0;f.yaw=Math.PI;}
  if(!a.undead)g.skelDress(a);if(b.undead!=='zombie'){b.undead=null;g.zombieDress(b);}P.pos.set(c.cx,0,c.cz-3.5);P.yaw=0;
  const L=new T.PointLight(0xffc890,1.5,9,1.2);L.position.set(c.cx,2.2,c.cz-2);g.scene.add(L);window.__L=L;
  for(const f of F.slice())if(f!==P&&f!==a&&f!==b){f.dispose();F.splice(F.indexOf(f),1);}for(let k=0;k<30;k++)g.logic(1/60);window.__dbgCam={p:new T.Vector3(c.cx,1.3,c.cz-2.4),t:new T.Vector3(c.cx,1.0,c.cz)};});
await tick(10);await fr(3);await shot('../out/q217/und_idle.jpg',90);
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,c=C.plan.cells[0];const a=g.fighters.find(f=>f.undead==='skel');window.__dbgCam={p:new T.Vector3(a.pos.x+.2,1.6,a.pos.z-.9),t:new T.Vector3(a.pos.x,1.4,a.pos.z)};});
await tick(2);await fr(3);await shot('../out/q217/und_skelhead.jpg',90);
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,c=C.plan.cells[0];const a=g.fighters.find(f=>f.undead==='zombie');window.__dbgCam={p:new T.Vector3(a.pos.x-.2,1.6,a.pos.z-.9),t:new T.Vector3(a.pos.x,1.45,a.pos.z)};});
await tick(2);await fr(3);await shot('../out/q217/und_zomhead.jpg',90);
for(let s=0;s<3;s++){
await page.evaluate((s)=>{const g=window.__game,P=g.player,F=g.fighters;window.__dbgCam=null;for(const f of F)if(f!==P){f.ai.mind.mood='hostile';f.ai.mind.aware=1;}P.hp=100;
  for(let k=0;k<60*(s?1.5:2.5);k++)g.logic(1/60);},s);
await fr(3,1/60);await shot(`../out/q217/und_fight${s}.jpg`,90);}
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,F=g.fighters;return F.filter(f=>f!==P).map(f=>[f.undead,Math.round(f.hp),f.alive,!!f.ragdoll,f.sword&&f.sword.def.id])});
console.log(JSON.stringify(r));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
