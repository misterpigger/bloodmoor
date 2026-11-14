import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));const out=[];
  for(let t=0;t<6;t++){g.startGame();window.__pause=true;for(let k=0;k<5;k++)g.logic(1/60);const C=g.CRYPT;out.push([C.cors.map(k=>+k.L.toFixed(1)).join(' '),C.plan.edges.length,C.plan.cells.length,C.lows.length,C.gaps.length]);}return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
