// dump the player's drawn joints per frame (world, plus root place and yaw) for one scenario, logic only (fast). OUT json.
// SC: guard|walk|side|back|run|swing|walkswing|duel. Q adds query. FR frames.
import {boot} from './harness.mjs';import fs from 'fs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('duel',process.env.MAP||'arena');
const r=await page.evaluate(async([wep,sc,FR])=>{const g=window.__game,T=g.THREE;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  window.__pause=true;for(let i=0;i<200&&!g.RP;i++)await wait(50);for(let i=0;i<120;i++)g.logic(1/60);
  const P=g.player;if(wep&&(!P.sword||P.sword.def.id!==wep)){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  const B=g.fighters.find(f=>f!==P);if(sc!=='duel')for(const f of g.fighters)if(f!==P){f.think=()=>{};f.pos.x+=60;}
  P.damage=()=>{};const input=g.input;
  const J=['Hips','Spine1','Spine2','Neck','Head','RightArm','RightForeArm','RightHand','LeftArm','LeftForeArm','LeftHand','RightUpLeg','RightLeg','RightFoot','RightToeBase','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase'];
  const W=(n)=>{const b=P.bones[n];if(!b)return [0,0,0];const e=b.matrixWorld.elements;return [e[12],e[13],e[14]];};
  const swing=(t)=>{const ph=t%1.3;if(ph<.5){input.mx=.5+.2*Math.sin(t*2);input.my=.4;input.lmb=false;}else if(ph<.62){input.mx=(Math.floor(t/1.3)%2)?.85:.15;input.my=.15;}else{const u=Math.min(1,(ph-.62)/.34);const s=Math.floor(t/1.3)%2;input.mx=s?.85-.7*u:.15+.7*u;input.my=.15+.6*u;input.lmb=true;}};
  const SC={guard:t=>{input.mx=.5+.3*Math.sin(t*2.1);input.my=.4+.2*Math.cos(t*1.7);},walk:t=>{input.keys.KeyW=true;},side:t=>{input.keys.KeyD=true;},back:t=>{input.keys.KeyS=true;},
    run:t=>{input.keys.KeyW=true;input.keys.ShiftLeft=true;},swing,walkswing:t=>{input.keys.KeyW=true;swing(t);},
    duel:t=>{swing(t);const B=g.fighters.find(f=>f!==P&&f.alive);if(B){const dx=B.pos.x-P.pos.x,dz=B.pos.z-P.pos.z,d=Math.hypot(dx,dz);P.yaw=Math.atan2(dx,dz);input.keys.KeyW=d>1.9;input.keys.KeyS=d<1.2;}}};
  const fr=[];for(let i=0;i<FR;i++){input.keys={};input.locked=false;input.lmb=false;input.mx=.5;input.my=.42;SC[sc](i/60);P.stamina=100;P.hp=Math.max(P.hp,60);P.ctrl.z=.46;g.logic(1/60);g.scene.updateMatrixWorld(true);
    const o={r:[P.pos.x,P.pos.y,P.pos.z],y:P.yaw,d:P.ragdoll?1:0,j:{}};for(const n of J)o.j[n]=W(n).map(v=>+v.toFixed(4));
    if(P.sword&&P.sword.H){o.h=[P.sword.H.x,P.sword.H.y,P.sword.H.z].map(v=>+v.toFixed(4));o.t=[P.sword.T.x,P.sword.T.y,P.sword.T.z].map(v=>+v.toFixed(4));}fr.push(o);}
  return fr;},[process.env.WEP||'longsword',process.env.SC||'walk',+(process.env.FR||240)]);
fs.writeFileSync(process.env.OUT||'dump.json',JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
