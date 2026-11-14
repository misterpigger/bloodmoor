import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(()=>{const g=window.__game,P=g.player,C=g.CRYPT,T=g.THREE,res={};const step=n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);g.lampStep(1/60);}};
  const run=(name,kI,wep)=>{const k=C.caskets[kI];if(!k)return;if(wep){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);step(30);}
    P.pos.set(k.x+Math.sin(k.ry)*.8,0,k.z+Math.cos(k.ry)*.8);P.yaw=Math.atan2(k.x-P.pos.x,k.z-P.pos.z);P.pitch=-.3;P.vel.set(0,0,0);step(5);const r={p0:g.cryptUse(P,true)};g.cryptUse(P);
    let t=0;while(t<120&&g.heldLid(P)!==k){step(1);t++;}r.grabFrames=t;r.p1=g.cryptUse(P,true);const y0=P.yaw,pt0=P.pitch,cy0=P.ctrl.y;
    const tr=[];for(let i=0;i<60;i++){g.aimMove(0,-6);step(1);if(i%10==9)tr.push(+(k.ang||0).toFixed(2));if(k.opened&&r.openAt==null)r.openAt=i;}
    step(40);r.tr=tr;r.end=+(k.ang||0).toFixed(2);r.opened=!!k.opened;r.held=!!g.heldLid(P);r.viewMoved=+(Math.abs(P.yaw-y0)+Math.abs(P.pitch-pt0)).toFixed(3);r.ctrlMoved=+Math.abs(P.ctrl.y-cy0).toFixed(3);res[name]=r;};
  run('fists',0,null);run('poker',1,'poker');
  // lower again: half lift then mouse down then let go
  const k=C.caskets[2];if(k){P.pos.set(k.x+Math.sin(k.ry)*.8,0,k.z+Math.cos(k.ry)*.8);P.yaw=Math.atan2(k.x-P.pos.x,k.z-P.pos.z);step(5);g.cryptUse(P);let t=0;while(t<120&&g.heldLid(P)!==k){step(1);t++;}
    res.halfPrompt=g.cryptUse(P,true);for(let i=0;i<12;i++){g.aimMove(0,-6);step(1);}step(20);const up=+(k.ang||0).toFixed(2);g.cryptUse(P);step(60);res.half={up,after:+(k.ang||0).toFixed(2),opened:!!k.opened,held:!!g.heldLid(P)};}
  g.spawnWeaponLoot(g.WEAPONS.longsword,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);step(30);run('longsword',3,null);
  return res;});
console.log(JSON.stringify(out,null,1));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
