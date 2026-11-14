import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};
  let C,P,d;for(let t=0;t<40;t++){g.startGame();step(150);C=g.CRYPT;P=g.player;d=C.doors.find(d=>d.bar);if(d)break;}
  if(!d)return ['no barred door in 12 floors'];
  const F=g.fighters;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
  const it=g.loot.find(l=>l.kind==='weapon'&&!g.TWO&&l.def.len<1.1);const w=d.w,p=d.bar;
  g.spawnWeaponLoot(g.WEAPONS.arming,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
  // stand on the corridor side facing the boards
  P.pos.set(p.x+w.dx*.55,0,p.z+w.dz*.55);P.yaw=Math.atan2(-w.dx,-w.dz);P.vel.set(0,0,0);step(30);
  g.scene.updateMatrixWorld(true);const n0=p.mesh.children.length,l0=g.loot.length;window.__ogd=[];g.input.keys.KeyG=true;const ev=[];
  for(let k=0;k<900&&!p.broken;k++){P.clutchT=0;P.stamina=100;g.input.keys.KeyS=(k%120)>40&&!!(P.offG&&P.offG.grab);if(!(P.offG&&P.offG.grab)&&k%120===0){P.pos.set(p.x+w.dx*.55,0,p.z+w.dz*.55);P.vel.set(0,0,0);}step(1);const n=p.mesh.children.length;if(n!==ev.length+0&&n<n0-ev.length)ev.push(k);}
  g.input.keys.KeyG=false;g.input.keys.KeyS=false;
  log.push({w:P.offG&&P.offG.w,pos:P.offG&&[P.offG.pos.x-p.x,P.offG.pos.y,P.offG.pos.z-p.z].map(v=>+v.toFixed(2)),tg:P.offG&&[P.offG.tgtW.x-p.x,P.offG.tgtW.y,P.offG.tgtW.z-p.z].map(v=>+v.toFixed(2)),pl:[P.pos.x-p.x,P.pos.z-p.z].map(v=>+v.toFixed(2)),wd:[w.dx,w.dz],sw:P.sword&&P.sword.def.id,cd:P.offG&&P.offG.cd});{const v=new g.THREE.Vector3();log.push({kids:p.mesh.children.map(m=>{m.getWorldPosition(v);return [v.x-p.x,v.y,v.z-p.z].map(q=>+q.toFixed(2)).join('/');}),ppos:[p.x,p.z],par:!!p.mesh.parent,br:p.broken,same:C===g.CRYPT});}log.push({ogd:JSON.stringify(window.__ogd.slice(0,2))+JSON.stringify(window.__ogd.slice(-1))});log.push({boards:n0,left:p.mesh.children.length,broken:!!p.broken,at:ev.join(','),lootAdded:g.loot.length-l0,grabK:P.offG&&P.offG.grab&&P.offG.grab.k});
  return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
