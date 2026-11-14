import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,shot}=await boot({W:900,HH:600,query:'?nohud&ckinds=coffins'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));for(let t=0;t<10;t++){g.startGame();window.__pause=true;for(let k=0;k<30;k++)g.logic(1/60);if(g.CRYPT.coffins.length)break;}});
await new Promise(r=>setTimeout(r,2500));
const r=await page.evaluate(()=>{const g=window.__game,T=g.THREE,C=g.CRYPT,P=g.player,F=g.fighters,input=g.input;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
  const c=C.coffins[0];if(!c)return 'none';P.pos.set(c.x-.75,0,c.z);P.yaw=Math.PI/2;window.__c=c;const pr=g.cryptUse(P,true);g.cryptUse(P);const log=[];
  for(let i=0;i<140;i++){input.locked=false;input.mx=.5;input.my=.15;g.logic(1/60);if(i%20==0)log.push([+c.off.toFixed(2),c.opened,c.fall.toFixed(2)]);}
  const L=new T.PointLight(0xffe8d0,5,8,1.2);L.position.set(c.x,2,c.z+1);g.scene.add(L);window.__dbgCam={p:new T.Vector3(c.x-1.6,1.6,c.z+1.8),t:new T.Vector3(c.x,.6,c.z)};return {pr,log,loot:g.loot.length};});
console.log(JSON.stringify(r));await tick(30);await fr(3);await shot('../out/coffin.jpg',90);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
