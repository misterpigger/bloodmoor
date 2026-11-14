import {boot} from './harness.mjs';
const {browser,page,fr,tick,shot,logs}=await boot({W:960,HH:540});
await fr(2,1/30);await page.evaluate((m)=>{document.querySelector(".map[data-map="+m+"]").click();document.getElementById('menu').style.display='none';},process.env.MAP||'tavern');
await new Promise(r=>setTimeout(r,2500));await fr(1,1/30);await tick(240,1/60);await fr(2,1/30);
const info=await page.evaluate(()=>{const g=window.__game;return g.fighters.slice(0,5).map(f=>({n:f.name,alive:f.alive,rag:!!f.ragdoll,sw:f.sword?f.sword.def.id:null,calm:+(f.calmW||0).toFixed(2),lod:f._lodK,arL:f.bones.LeftArm.quaternion.toArray().map(x=>+x.toFixed(2)).join(',')}));});
console.log(JSON.stringify(info));await shot(process.env.OUT||'attract.jpg');console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
