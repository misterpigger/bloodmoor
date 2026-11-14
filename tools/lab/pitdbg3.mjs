import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,2000));
const r=await page.evaluate(()=>{const g=window.__game,PIT=g.PIT;window.__pause=true;for(let k=0;k<10;k++)g.logic(1/60);
  return {grate:PIT.grate?[PIT.grate.mode,PIT.grate.phi,!!PIT.grate.bridge]:null,down:PIT.down,g:[[.8,.87,1],[.8,.87,-.5],[0,1.5,1],[1.5,1.5,1],[.8,0,1],[.8,0,-.5]].map(([x,z,y])=>g.groundY(x,z,y))};});
console.log(JSON.stringify(r));await browser.close();process.exit(0);
