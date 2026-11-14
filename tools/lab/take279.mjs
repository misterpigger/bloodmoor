// Build 279: loot is taken by reaching for it (takeUp): time to take, stoop, from several distances
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,out=[];for(let k=0;k<200;k++)g.logic(1/60);
  for(const [lab,d,armed] of [['fists .5',.5,0],['fists 1.0',1,0],['fists 1.9',1.9,0],['armed 1.0',1,1]]){
    if(P.sword&&P.sword.def.kind!=='fist'&&!armed)P.dropSword(true);
    P.pos.set(8,0,8);P.yaw=0;P.vel.set(0,0,0);for(let k=0;k<30;k++)g.logic(1/60);
    g.spawnWeaponLoot(g.WEAPONS.arming,P.pos.x,P.pos.z+d);const it=g.loot[g.loot.length-1];for(let k=0;k<40;k++)g.logic(1/60);
    const hy0=P.bones.Hips.matrixWorld.elements[13];g.takeUp(P,it);let t=-1,minH=9,mv=0;const z0=P.pos.z;
    for(let k=0;k<120;k++){g.logic(1/60);minH=Math.min(minH,P.bones.Hips.matrixWorld.elements[13]);if(t<0&&P.sword===it.sword)t=k;}
    out.push([lab,'taken@'+(t<0?'never':(t/60).toFixed(2)+'s'),'hips dropped '+(hy0-minH).toFixed(2),'stepped '+(P.pos.z-z0).toFixed(2),'holds '+(P.sword?P.sword.def.id:'-'),'reach '+(P.reach?P.reach.w:'-')]);}
  return out;});
for(const l of r)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
