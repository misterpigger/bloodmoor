// (Build 304) a dweller opening a casket: the lid's angle over time while his hand is on it
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  const C=g.CRYPT;for(const f of g.fighters)if(f.ai.mind)f.ai.mind.rum=true;let seen=new Set();
  for(let s=0;s<60*40;s++){g.logic(1/60);for(const f of g.fighters){if(f.lidLift){const k=f.lidLift.k;if(!seen.has(k)){seen.add(k);k._tr=[];log.push(k._tr);}}}
    for(const k of seen)if(k._tr.length<200&&s%6===0)k._tr.push(+(k.ang||0).toFixed(2)+(k.held?'h':''));}
  return log.slice(0,4).map(t=>t.slice(0,40).join(' '));});
for(const l of out)console.log(l);console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
