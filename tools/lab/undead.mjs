import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,shot}=await boot({W:900,HH:600,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<60;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
const info=await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters;const c=C.plan.cells[0];
  const foes=F.filter(f=>f!==P);for(const f of foes.slice(2)){f.dispose();F.splice(F.indexOf(f),1);}
  const [a,b]=F.filter(f=>f!==P);a.pos.set(c.cx-.7,0,c.cz);b.pos.set(c.cx+.7,0,c.cz);for(const f of [a,b]){f.ai.mind.mood='peace';f.ai.mind.aware=0;f.yaw=0;}
  if(!a.undead)g.skelDress(a);if(b.undead!=='zombie'){b.undead=null;g.zombieDress(b);}P.pos.set(c.cx,0,c.cz+3);P.model.visible=false;
  const L=new T.PointLight(0xffe8d0,7,9,1.2);L.position.set(c.cx,2.2,c.cz+2);g.scene.add(L);
  for(let k=0;k<30;k++)g.logic(1/60);window.__dbgCam={p:new T.Vector3(c.cx,1.4,c.cz+2.6),t:new T.Vector3(c.cx,1.0,c.cz)};return [a.undead,b.undead];});
console.log(info);await tick(10);await fr(3);await shot('../out/und_a.jpg',90);
// fight: let them loose on the player for 20 s with nan watch
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,F=g.fighters;P.model.visible=true;window.__dbgCam=null;for(const f of F)if(f!==P){f.ai.mind.mood='hostile';f.ai.mind.aware=1;}
  let nan=0,hits=0;for(let k=0;k<1200;k++){g.logic(1/60);for(const f of F)if(!Number.isFinite(f.pos.x+f.pos.z))nan++;}return {nan,php:P.hp,foes:F.filter(f=>f!==P).map(f=>[f.undead,Math.round(f.hp),f.alive])};});
console.log(JSON.stringify(r));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
