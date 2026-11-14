import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:600,HH:400,query:'?nohud&ctraps=pit',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<5;k++)g.logic(1/60);const C=g.CRYPT;return {tr:C.traps.length,gaps:C.gaps.length,sw:C.swings.length,sp:C.spikes.length,cors:C.cors.map(k=>+k.L.toFixed(1))};});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
