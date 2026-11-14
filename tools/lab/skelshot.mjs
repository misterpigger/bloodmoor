import {boot} from './harness.mjs';
const TAG=process.env.TAG||'s';const OUT=process.env.OUT||'../out/q218';
const {browser,page,logs,fr,tick,shot}=await boot({W:900,HH:900,query:'?nohud'});await page.evaluate(()=>{window.__rag=1;window.__helm=1;});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters;const c=C.plan.cells[0];
  const fo=F.filter(f=>f!==P),a=fo.find(f=>f.undead==='skel')||fo[0];for(const f of F.slice())if(f!==P&&f!==a){f.dispose();F.splice(F.indexOf(f),1);}
  if(a.undead!=='skel'){a.undead=null;g.skelDress(a);}if(window.__helm)a.equip(g.ARMOR.kettle);a.pos.set(c.cx,0,c.cz);a.yaw=0;a.ai.mind.mood='peace';a.ai.mind.aware=0;P.pos.set(c.cx,0,c.cz+4);P.model.visible=false;
  const L=new T.PointLight(0xffd8b0,5,9,1.2);L.position.set(c.cx+1,2.2,c.cz+1.8);g.scene.add(L);
  for(let k=0;k<30;k++)g.logic(1/60);window.__c=c;window.__a=a;});
const views={front:[0,1.05,2.4,0,1,0],side:[2.4,1.05,0,0,1,0],q:[1.0,1.5,1.2,0,1.25,0],head:[.25,1.65,.7,0,1.6,0],pel:[.4,1.0,1.1,0,.95,0]};
for(const [k,v] of Object.entries(views)){await page.evaluate(v=>{const g=window.__game,T=g.THREE,a=window.__a;const s=Math.sin(a.yaw),c=Math.cos(a.yaw);const W=(x,y,z)=>new T.Vector3(a.pos.x+c*x+s*z,y,a.pos.z-s*x+c*z);window.__dbgCam={p:W(v[0],v[1],v[2]),t:W(v[3],v[4],v[5])};},v);await tick(2);await fr(2);await shot(`${OUT}/${TAG}_${k}.jpg`,88);}
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
