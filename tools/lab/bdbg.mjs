import {boot} from './harness.mjs';
const {browser,page,logs,fr}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,100));g.startGame();window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);
 const P=g.player;g.spawnWeaponLoot(g.WEAPONS.longsword,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);g.spawnWeaponLoot(g.WEAPONS.poker,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);});
await fr(10);
console.log(await page.evaluate(()=>{const g=window.__game,P=g.player,b=P.belt;if(!b)return 'nobelt';const m=b.mesh;let vis=true,o=m;while(o){if(!o.visible)vis=false;o=o.parent;}return JSON.stringify({yaw:+P.yaw.toFixed(2),fwdDot:+((b.H.x-P.pos.x)*Math.sin(P.yaw)+(b.H.z-P.pos.z)*Math.cos(P.yaw)).toFixed(2),id:b.def.id,H:b.H.toArray().map(x=>+x.toFixed(2)),T:b.T.toArray().map(x=>+x.toFixed(2)),P:P.pos.toArray().map(x=>+x.toFixed(2)),vis,inScene:!!m.parent,mpos:m.position.toArray().map(x=>+x.toFixed(2))});}));
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
