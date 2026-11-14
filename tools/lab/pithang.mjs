import {boot} from './harness.mjs';
const {browser,page,logs,start,fr,tick,shot}=await boot({W:900,HH:600,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,2500));
const out=[];
for(const mode of ['walk','knock']){
const r=await page.evaluate((mode)=>{const g=window.__game,P=g.player,F=g.fighters,input=g.input,PIT=g.PIT;window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  for(const f of F)if(f!==P){f.pos.set(PIT.x+20,0,PIT.z+20);f.ai.skill=0;}
  // find a gap: break the middle planks
  const c={x:PIT.x+.8,z:PIT.z};
  // stand on the bridge next to the gap, walk into it
  const dx=0,dz=1;P.pos.set(c.x,0,c.z+PIT.bw-.35);P.yaw=Math.atan2(dx,dz);P.vel.set(0,0,0);P.stamina=100;P.hp=100;
  const log=[];for(let i=0;i<300;i++){input.keys.KeyW=mode==='walk'&&i<12;if(mode==='knock'&&i===8){P.pos.set(c.x,0,c.z+PIT.bw+.25);P.fallT=null;P.pitFall();}g.logic(1/60);if(i%30==0)log.push([i,+P.pos.y.toFixed(2),!!P.hang,!!P.ragdoll,P.alive,P.ragdoll&&P.ragdoll.P.Hips?+P.ragdoll.P.Hips.y.toFixed(2):null]);}
  input.keys.KeyW=false;const hung=!!P.hang;
  // climb
  input.keys.KeyW=true;const l2=[];for(let i=0;i<300;i++){g.logic(1/60);if(i==40)input.keys.KeyW=false;if(i%15==0){const R=P.ragdoll;l2.push([i,P.hang?[+P.hang.L.x.toFixed(2),+P.hang.L.z.toFixed(2),+P.hang.L.dx.toFixed(2),+P.hang.L.dz.toFixed(2),+P.hang.L.y.toFixed(2)]:0,P.hang&&P.hang.climb!=null?+P.hang.climb.toFixed(2):null,R&&R.P.Hips?[+R.P.Hips.x.toFixed(2),+R.P.Hips.y.toFixed(2),+R.P.Hips.z.toFixed(2)]:[+P.pos.x.toFixed(2),+P.pos.y.toFixed(2),+P.pos.z.toFixed(2)],!!(R&&R.rise),P.alive,P.knocked.toFixed(2)]);}}window.__l2=l2;
  return {l2:window.__l2,log,hung,after:[+P.pos.y.toFixed(2),!!P.ragdoll,P.alive,!!P.hang]};},mode);
out.push(r);console.log(mode,JSON.stringify(r));
if(mode==='walk')await page.evaluate(()=>window.__game.startGame());await new Promise(r=>setTimeout(r,1500));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
