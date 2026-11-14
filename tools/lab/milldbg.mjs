import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(()=>{const b=document.querySelector(`.tn[data-tn="4"]`);if(b)b.click();});
await start('team','mill',{pause:true});
await page.evaluate(async()=>{const g=window.__game;for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}});
const out=await page.evaluate(()=>{const g=window.__game,L=[],per={};let t=0;L.push("player at "+g.player.pos.x.toFixed(1)+","+g.player.pos.y.toFixed(1)+","+g.player.pos.z.toFixed(1));
  for(let k=0;k<4800;k++){g.logic(1/60);t+=1/60;if(g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,80);
    if(k%60===0)for(const f of g.fighters){if(f.isPlayer||!f.alive||f.ragdoll||f.downed)continue;const P=per[f.id]||(per[f.id]={x:f.pos.x,z:f.pos.z,n:0});const mv=Math.hypot(f.pos.x-P.x,f.pos.z-P.z);P.x=f.pos.x;P.z=f.pos.z;const tg=f.ai.target;
      if(t>5&&mv<.35&&tg&&tg.alive){const d=Math.hypot(tg.pos.x-f.pos.x,tg.pos.z-f.pos.z);if(d>5){P.n++;if(P.n%3===1)L.push(`${t.toFixed(0)}s ${f.name} at (${f.pos.x.toFixed(1)},${f.pos.y.toFixed(2)},${f.pos.z.toFixed(1)}) yaw ${f.yaw.toFixed(2)} vel ${Math.hypot(f.vel.x,f.vel.z).toFixed(2)} tgt ${tg.name}${tg.isPlayer?'(P)':''} (${tg.pos.x.toFixed(1)},${tg.pos.y.toFixed(2)},${tg.pos.z.toFixed(1)}) rag ${!!tg.ragdoll} d ${d.toFixed(1)} sword ${f.sword?f.sword.def.id:'-'} phase ${f.ai.phase}`);}}}}
  return L.slice(0,40);});
console.log(out.join('\n'));console.log(logs.slice(0,5).join('\n'));await browser.close();process.exit(0);
