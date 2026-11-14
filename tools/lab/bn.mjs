import {boot} from './harness.mjs';
const {browser,page}=await boot({W:400,HH:300,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;await new Promise(r=>setTimeout(r,2500));g.startGame();window.__pause=true;for(let k=0;k<5;k++)g.logic(1/60);return Object.keys(g.player.bones).join(' ');});
console.log(r);await browser.close();process.exit(0);
