// physical fighter: a duel on the Yard, both physical; 40 s with the player fighting by a scripted pattern
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="duel"]').click();await wait(100);const mb=document.querySelector('.map[data-map=yard]');if(mb)mb.click();await wait(200);g.startGame();window.__pause=true;
  for(let i=0;i<200&&!g.RP;i++){await wait(50);}
  const P=g.player;let hsF=0,n=0,nan=0,kd=0,hits=0,dmg=0,wasR=new Map();const T=g.THREE;
  g.input.locked=true;
  for(let k=0;k<60*40;k++){const t=k/60;const foe=g.fighters.find(f=>f!==P&&f.alive);
    if(foe){const d=foe.pos.clone().sub(P.pos);P.yaw=Math.atan2(d.x,d.z);g.input.keys.KeyW=d.length()>1.6;g.input.keys.KeyS=d.length()<1.1;}
    g.aimMove(Math.cos(t*5)*14,Math.sin(t*3.3)*7);g.input.lmb=(t%1.4)<.7;P.stamina=Math.max(P.stamina,50);
    g.logic(1/60);
    for(const f of g.fighters){n++;if(f.hs)hsF++;if(!Number.isFinite(f.pos.x+f.pos.z))nan++;const r=!!f.ragdoll;if(r&&!wasR.get(f))kd++;wasR.set(f,r);}
  }
  g.input.lmb=false;g.input.keys.KeyW=false;g.input.keys.KeyS=false;
  return {hsShare:+(hsF/n).toFixed(2),nan,knockdowns:kd,alive:g.fighters.map(f=>f.alive+':'+Math.round(f.hp)),hud:g.MODEHUD&&g.MODEHUD.join(' | ')};});
console.log(JSON.stringify(out));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
