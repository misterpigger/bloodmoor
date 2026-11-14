import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
console.log(JSON.stringify(await page.evaluate(()=>{const g=window.__game,P=g.player,input=g.input;for(let k=0;k<60;k++)g.logic(1/60);const o=[g.state,input.locked,P.isPlayer,P.commit];
 for(let k=0;k<30;k++){input.mx=.85;input.my=.15;input.lmb=true;g.logic(1/60);}o.push([P.ctrl.x,P.ctrl.y,P.ctrl.z,P.commit,P.sword.tipVel.length()]);return o;})));
await browser.close();process.exit(0);
