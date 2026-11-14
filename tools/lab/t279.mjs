// Build 279: the right button works the off hand (hold = reach and grab, mouse steers it, click = shove)
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,out=[],I=g.input;for(let k=0;k<200;k++)g.logic(1/60);
  const give=(f,id)=>{if(f.sword)f.dropSword(true);g.spawnWeaponLoot(g.WEAPONS[id],f.pos.x+.3,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);};
  const dummy=()=>g.fighters.find(f=>f!==P&&f.alive&&!f.ragdoll);
  const set=(d)=>{const B=dummy();give(P,'arming');P.pos.set(0,0,0);P.yaw=0;P.pitch=0;P.vel.set(0,0,0);B.pos.set(0,0,d);B.yaw=Math.PI;B.vel.set(0,0,0);B.balV&&B.balV.set(0,0,0);B.bal&&B.bal.set(0,0,0);B.stamina=100;P.stamina=100;P.hp=100;for(let k=0;k<40;k++){P.clutchT=0;g.logic(1/60);}P.pos.set(0,0,0);P.vel.set(0,0,0);B.pos.set(0,0,d);B.vel.set(0,0,0);B.balV&&B.balV.set(0,0,0);B.bal&&B.bal.set(0,0,0);if(B.ai)B.ai.backT=0;return B;};
  const step=(n,fn)=>{for(let k=0;k<n;k++){P.clutchT=0;g.logic(1/60);fn&&fn(k);}};
  // 1 hold: reach, grab, release
  {const B=set(.85);I.rmb=true;let t=-1;step(60,k=>{if(P.offG.grab&&t<0)t=k;});const gr=P.offG.grab;out.push(['hold',gr?gr.k+':'+(gr.bone?gr.bone.name.replace('mixamorig',''):''):'none','t'+t,'w'+P.offG.w.toFixed(2)]);
    I.rmb=false;step(20);out.push(['release',P.offG.grab?'still':'free','w'+P.offG.w.toFixed(2)]);}
  // 2 steer: nobody near, hand follows C
  {const B=set(6);I.rmb=true;step(30);const p0=P.offG.pos.clone();P.offG.c.x=.45;step(30);const p1=P.offG.pos.clone();P.offG.c.x=-.45;P.offG.c.y=.4;step(30);const p2=P.offG.pos.clone();I.rmb=false;step(30);
    out.push(['steer','right dx'+(p1.x-p0.x).toFixed(2),'left dx'+(p2.x-p0.x).toFixed(2),'up dy'+(p2.y-p0.y).toFixed(2),'c back '+P.offG.c.x.toFixed(2)]);}
  // 3 click: shove
  for(const d of [.8,1.0,1.3]){const B=set(d);const z0=B.pos.z;I.rmb=true;step(4);I.rmb=false;let hit=-1,bl=0,dn=false;step(90,k=>{if(P.offG.hitP&&hit<0)hit=k;bl=Math.max(bl,B.bal?B.bal.length():0);if(B.ragdoll)dn=true;});
    out.push(['shove d'+d,'hit@'+hit,'driven '+(B.pos.z-z0).toFixed(2)+' m','lean '+bl.toFixed(2),dn?'DOWN':'up','grab:'+(P.offG.grab?1:0)]);}
  // 4 hold, haul sideways with the mouse
  {const B=set(.85);I.rmb=true;step(50);const x0=B.pos.x;P.offG.c.x=.5;let dn=-1;step(120,k=>{if(B.ragdoll&&dn<0)dn=k;});out.push(['wrench',P.offG.grab?P.offG.grab.k:'lost','foe dx'+(B.pos.x-x0).toFixed(2),'down@'+dn]);I.rmb=false;step(30);}
  // 5 G latch
  {const B=set(.85);I.rmb=true;step(50);P.gTog=true;P.gT=g.simTime||0;I.rmb=false;step(40);out.push(['latch',P.offG.grab?'held':'lost']);P.gTog=false;step(20);out.push(['unlatch',P.offG.grab?'held':'free']);}
  return out;});
for(const l of r)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
