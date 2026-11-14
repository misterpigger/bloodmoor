import {boot} from './harness.mjs';
const Q=process.env.Q||'';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'+Q});
await start('team','colosseum',{pause:true});
const r=await page.evaluate(async()=>{const g=window.__game,P=g.player,st={grabs:0,w:0,f:0,r:0,disarm:0,downHeld:0,nan:0,steps:0};
  for(let k=0;k<200;k++)g.logic(1/60);P.pos.set(30,0,30);
  for(const f of g.fighters){if(f===P)continue;if(f.sword)f.dropSword(true);g.spawnWeaponLoot(g.WEAPONS[Math.random()<.5?'arming':'mace'],f.pos.x+.3,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}
  const prev=new Map();
  for(let k=0;k<60*50;k++){g.logic(1/60);st.steps++;
    for(const f of g.fighters){const G=f.offG;const gk=G&&G.grab?G.grab.k:null;const pk=prev.get(f);if(gk&&!pk){st.grabs++;st[gk]=(st[gk]||0)+1;}prev.set(f,gk);
      if(f.alive&&!f.sword&&f!==P&&!f._dis){f._dis=1;st.disarm++;}if(!Number.isFinite(f.pos.x))st.nan++;}
    if(k%600===0)await new Promise(r=>setTimeout(r,0));}
  st.alive=g.fighters.filter(f=>f.alive).length;return st;});
console.log(JSON.stringify(r));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
