// rummagers: leave the dwellers alone for 60 s (player parked far away in his cell, unseen): how many caskets get opened, purses
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  const C=g.CRYPT,P=g.player;for(const f of g.fighters)if(f.ai.mind)f.ai.mind.rum=true;
  for(let s=0;s<60;s++){for(let k=0;k<60;k++)g.logic(1/60);P.hp=100;if(s%20===19)log.push({t:s+1,opened:C.caskets.filter(k=>k.opened).length+'/'+C.caskets.length,purses:g.fighters.filter(f=>f.ai.mind).map(f=>f.purse||0).join(' '),jobs:g.fighters.filter(f=>f.ai.mind&&f.ai.mind.job).length,crouch:g.fighters.filter(f=>f.crouch&&f!==P).length,aware:g.fighters.filter(f=>f.ai.mind&&f.ai.mind.aware).length,hud:g.MODEHUD[1]});}
  const v=g.fighters.find(f=>f.purse>0);if(v){v.die(P,'slain',null);for(let k=0;k<30;k++)g.logic(1/60);log.push({afterKill:g.MODEHUD[1]});}
  return log;});
for(const l of out)console.log(JSON.stringify(l));console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
