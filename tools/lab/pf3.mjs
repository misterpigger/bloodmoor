// physical fighter in a real duel: the player runs about (W+Shift, turning) near a live bot. Per phase: mean ground speed, knockdowns, jolts (drawn hand/head jumping >8 cm a frame vs the hips), lean o
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async([map,wep])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel',map);window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys,D=g.fighters.find(f=>f!==P);const R={};
  if(wep&&(!P.sword||P.sword.def.id!==wep)){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};
  const run=(name,n,fn)=>{let d=0,down=0,jolt=0,prev=null,pp=P.pos.clone(),os=[],hs=0;for(let i=0;i<n;i++){P.stamina=100;P.hp=100;fn(i);g.logic(1/60);g.scene.updateMatrixWorld(true);
      d+=Math.hypot(P.pos.x-pp.x,P.pos.z-pp.z);pp.copy(P.pos);if(P.ragdoll){down++;prev=null;continue;}if(P.hs)hs++;
      const H=W('Hips'),r=W('RightHand'),h=W('Head');const cur=[r[0]-H[0],r[1]-H[1],r[2]-H[2],h[0]-H[0],h[1]-H[1],h[2]-H[2]];
      if(prev){const a=Math.hypot(cur[0]-prev[0],cur[1]-prev[1],cur[2]-prev[2]),b=Math.hypot(cur[3]-prev[3],cur[4]-prev[4],cur[5]-prev[5]);if(a>.08||b>.08)jolt++;}prev=cur;if(P.hs&&P.hs.pfo!=null)os.push(P.hs.pfo);}
    os.sort((a,b)=>a-b);R[name]={speed:+(d/(n/60)).toFixed(2),downFrames:down,jolts:jolt,hsFrames:hs,o90:os.length?+os[Math.floor(os.length*.9)].toFixed(2):null};};
  if(D){D.damage=()=>{};}
  run('run far',360,i=>{for(const k of ['KeyW','ShiftLeft'])K[k]=true;if(D)D.pos.set(P.pos.x+30,0,P.pos.z+30);P.yaw+=.012;});
  for(const k in K)K[k]=false;run('stand',120,i=>{if(D)D.pos.set(P.pos.x+30,0,P.pos.z+30);});
  run('walk',240,i=>{K.KeyW=true;if(D)D.pos.set(P.pos.x+30,0,P.pos.z+30);});K.KeyW=false;
  run('fight',600,i=>{K.KeyW=i%120<60;K.ShiftLeft=i%240<60;K.KeyA=i%90<30;if(i%40===0){g.input.lmb=!g.input.lmb;}});
  return R;},[process.env.MAP||'colosseum',process.env.WEP||'longsword']);
for(const k in out)console.log(k.padEnd(9),JSON.stringify(out[k]));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
