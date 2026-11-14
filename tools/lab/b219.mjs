import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&ckinds=coffins,coffins,coffins,coffins,coffins'});
const out=await page.evaluate(async()=>{const g=window.__game,log={};const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++){g.logic(1/60);g.lampStep(1/60);}};step(120);
  for(const f of g.fighters.slice())if(f!==g.player){f.dispose();g.fighters.splice(g.fighters.indexOf(f),1);}
  const C=g.CRYPT,P=g.player;
  // poker in hand, lantern in the other: E on a chest
  g.spawnWeaponLoot(g.WEAPONS.poker,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
  if(!P.lamp){const L=g.LAMPS.find(l=>!l.f);if(L)g.cryptUse&&0;}
  log.lamp=!!P.lamp;
  const k=C.caskets[0];P.pos.set(k.x+Math.sin(k.ry)*.95,0,k.z+Math.cos(k.ry)*.95);P.yaw=Math.atan2(k.x-P.pos.x,k.z-P.pos.z);P.vel.set(0,0,0);step(5);
  log.prompt=g.cryptUse(P,true);g.cryptUse(P,false);let t=0;for(;t<240&&!k.opened;t++)step(1);log.chestOpenedAfter=(t/60).toFixed(2)+'s ang '+(k.ang||0).toFixed(2);step(60);log.lidAfter=(k.ang||0).toFixed(2);log.lampInHandMeanwhile=P.lamp?P.lamp.inHand:null;
  // coffins
  const c=C.coffins.find(c=>!c.opened);if(c){P.pos.set(c.x+(c.x>0?-.75:.75)*0+ -.8*Math.sign(c.x-P.pos.x||1)*0+ (c.sg?-c.sg:-.1)*.8,0,c.z);P.yaw=Math.atan2(c.x-P.pos.x,c.z-P.pos.z);step(3);log.cofPrompt=g.cryptUse(P,true);g.cryptUse(P,false);let t2=0;for(;t2<300&&!c.opened;t2++)step(1);log.coffin=c.opened?'opened '+(t2/60).toFixed(2)+'s':'no (off '+c.off.toFixed(2)+')';}else log.coffin='none';
  // belt: poker through the belt, then a longsword picked up: what goes where
  P.beltKey();log.belt1=P.belt&&P.belt.def.id;log.hand1=P.sword&&P.sword.def.id;P.beltKey();
  g.spawnWeaponLoot(g.WEAPONS.longsword,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);log.belt2=P.belt&&P.belt.def.id;log.hand2=P.sword&&P.sword.def.id;
  P.beltKey();log.belt3=P.belt&&P.belt.def.id;log.hand3=P.sword&&P.sword.def.id;step(10);const bs=P.belt;log.slungY=bs?(bs.T.y-bs.H.y).toFixed(2):null;
  P.beltKey();P.beltKey();
  // door by hand
  const d=C.doors.find(d=>!d.bar);if(d){const a=d.base+d.th,ux=Math.cos(a),uz=-Math.sin(a),px=-Math.sin(a),pz=-Math.cos(a),s=1;
    if(P.sword&&P.sword.def.id==='longsword'){P.beltKey();}
    // one-handed weapon: poker in hand now?
    log.doorHand=P.sword&&P.sword.def.id;
    P.pos.set(d.hx+ux*s+px*.7,0,d.hz+uz*s+pz*.7);P.yaw=Math.atan2(-px,-pz);P.vel.set(0,0,0);step(5);const th0=d.th;g.input.keys.KeyG=true;let gt=-1;for(let i=0;i<60;i++){step(1);if(gt<0&&P.offG&&P.offG.grab)gt=i;}
    log.doorGrab=P.offG&&P.offG.grab?P.offG.grab.k+' after '+gt:'none';
    g.input.keys.KeyS=true;for(let i=0;i<90;i++)step(1);g.input.keys.KeyS=false;log.doorPulled=(d.th-th0).toFixed(2);g.input.keys.KeyG=false;step(10);}
  return log;});
console.log(JSON.stringify(out,null,1));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
