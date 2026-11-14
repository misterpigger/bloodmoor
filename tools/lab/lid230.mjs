import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(()=>{const g=window.__game,P=g.player,C=g.CRYPT,T=g.THREE,res={};const step=n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);g.lampStep(1/60);}};
  P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);step(30);const hp=new T.Vector3();P.bones.Hips.getWorldPosition(hp);res.fistLampFromHips=+P.lamp.g.position.distanceTo(hp).toFixed(2);
  g.spawnWeaponLoot(g.WEAPONS.poker,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);step(40);const hd=new T.Vector3();P.bones.LeftHand.getWorldPosition(hd);res.inHand=P.lamp.inHand;res.lampFromHand=+P.lamp.g.position.distanceTo(hd).toFixed(2);
  const k=C.caskets[0];P.pos.set(k.x+Math.sin(k.ry)*.8,0,k.z+Math.cos(k.ry)*.8);P.yaw=Math.atan2(k.x-P.pos.x,k.z-P.pos.z);P.pitch=-.7;P.vel.set(0,0,0);step(5);res.prompt=g.cryptUse(P,true);g.cryptUse(P);
  const tr=[];for(let i=0;i<90;i++){P.pitch=-.7;step(1);}tr.push({grab:!!(P.offG&&P.offG.grab),ang:+(k.ang||0).toFixed(2)});
  for(let i=0;i<120;i++){P.pitch=Math.min(.9,-.7+i*.02);step(1);if(i%30==29)tr.push({grab:!!(P.offG&&P.offG.grab),ang:+(k.ang||0).toFixed(2),opened:!!k.opened});}
  res.tr=tr;return res;});
console.log(JSON.stringify(out));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
