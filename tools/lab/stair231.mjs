import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
for(let d=0;d<4;d++){
const out=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,dn=C.down,res={depth:C.depth};if(!dn)return {err:'no down'};
  P.pos.set(dn.x,0,dn.z0-1.2);P.yaw=0;P.vel.set(0,0,0);P.hp=100;g.input.keys.KeyW=true;const tr=[];
  for(let i=0;i<600;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);if(i%60===0)tr.push([+P.pos.z.toFixed(1),+P.pos.y.toFixed(2),!!P.ragdoll]);if(g.CRYPT!==C)break;await 0;}
  await new Promise(r=>setTimeout(r,300));for(let i=0;i<30;i++)g.logic(1/60);
  const C2=g.CRYPT;res.tr=tr;res.newDepth=C2.depth;res.changed=C2!==C;if(C2.arr){res.rel=[+(P.pos.x-C2.arr.x).toFixed(2),+(P.pos.z-C2.arr.zd).toFixed(2),+P.pos.y.toFixed(2)];}
  // walk on through the door into the room
  for(let i=0;i<240;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);}const c0=C2.plan.cells[0];res.inRoom=[+(P.pos.x-c0.cx).toFixed(1),+(P.pos.z-c0.cz).toFixed(1),+P.pos.y.toFixed(2),P.alive,+P.hp.toFixed(0)];g.input.keys.KeyW=false;return res;});
console.log(JSON.stringify(out));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
