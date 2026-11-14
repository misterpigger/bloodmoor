import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:400,HH:300,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;
 for(let k=0;k<200;k++)g.logic(1/60);await new Promise(r=>setTimeout(r,2500));for(let k=0;k<30;k++)g.logic(1/60);
 const d=g.DYN.find(d=>d.body&&!d.gone&&d.m<5);const y0=d.body.translation().y;d.body.wakeUp();d.body.applyImpulse({x:0,y:d.m*4,z:0},true);const ys=[];for(let k=0;k<20;k++){g.logic(1/60);ys.push(+d.body.translation().y.toFixed(2));}
 return {y0,ys,type:d.body.bodyType&&d.body.bodyType(),sleep:d.body.isSleeping(),m:d.body.mass()};});
console.log(JSON.stringify(r));await browser.close();process.exit(0);
