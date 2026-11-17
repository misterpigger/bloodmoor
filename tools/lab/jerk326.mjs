// how much each drawn joint shakes, per scenario: second difference of the drawn joint's world place (m/s^2), relative to the fighter's own place.
// Q adds query (&pf). Prints per scenario per joint p50/p95/p99 acceleration and frames over 60 m/s^2.
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('duel',process.env.MAP||'arena');
const r=await page.evaluate(async([wep,only])=>{const g=window.__game,T=g.THREE;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  window.__pause=true;for(let i=0;i<200&&!g.RP;i++)await wait(50);for(let i=0;i<120;i++)g.logic(1/60);
  const P=g.player;if(wep&&(!P.sword||P.sword.def.id!==wep)){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  for(const f of g.fighters)if(f!==P){f.ai&&(f.ai.off=1);f.think=()=>{};f.pos.x+=40;}
  P.damage=()=>{};const input=g.input;
  const J=['Hips','Spine2','Head','RightHand','LeftHand','RightForeArm','LeftForeArm','RightFoot','LeftFoot','RightLeg','LeftLeg'];
  const W=(n)=>{const b=P.bones[n];const e=b.matrixWorld.elements;return new T.Vector3(e[12],e[13],e[14]);};
  const SC={stand:(t)=>{input.mx=.5;input.my=.42;},
    guard:(t)=>{input.mx=.5+.3*Math.sin(t*2.1);input.my=.4+.2*Math.cos(t*1.7);},
    walk:(t)=>{input.keys.KeyW=true;input.mx=.5;input.my=.42;},
    side:(t)=>{input.keys.KeyD=true;input.mx=.5;input.my=.42;},
    run:(t)=>{input.keys.KeyW=true;input.keys.ShiftLeft=true;input.mx=.5;input.my=.42;},
    swing:(t)=>{const ph=t%1.3;if(ph<.5){input.mx=.5;input.my=.4;input.lmb=false;}else if(ph<.62){input.mx=(Math.floor(t/1.3)%2)?.85:.15;input.my=.15;}else{const u=Math.min(1,(ph-.62)/.34);const s=Math.floor(t/1.3)%2;input.mx=s?.85-.7*u:.15+.7*u;input.my=.15+.6*u;input.lmb=true;}},
    walkswing:(t)=>{input.keys.KeyW=true;SC.swing(t);}};
  const out={};const P0=P.pos.clone(),Y0=P.yaw;
  for(const k of Object.keys(SC)){if(only&&!only.split(',').includes(k))continue;
    P.pos.copy(P0);P.vel&&P.vel.set(0,0,0);P.yaw=Y0;if(/[?&]pf\b/.test(location.search)){g.setHS(false);g.setHS(true);}for(let i=0;i<60;i++){input.keys={};input.lmb=false;input.mx=.5;input.my=.42;input.locked=false;P.stamina=100;g.logic(1/60);}
    const hist=[];const acc={};J.forEach(j=>acc[j]=[]);let kd=0;
    for(let i=0;i<240;i++){input.keys={};input.locked=false;input.lmb=false;SC[k](i/60);P.stamina=100;P.ctrl.z=.46;g.logic(1/60);g.scene.updateMatrixWorld(true);
      if(P.ragdoll){kd++;hist.length=0;continue;}
      const fr={root:P.pos.clone()};J.forEach(j=>fr[j]=W(j));hist.push(fr);if(hist.length>3)hist.shift();
      if(hist.length===3&&i>30){for(const j of J){const a=hist[2][j].clone().sub(hist[1][j].clone().multiplyScalar(2)).add(hist[0][j]);const ar=hist[2].root.clone().sub(hist[1].root.clone().multiplyScalar(2)).add(hist[0].root);a.sub(ar);acc[j].push(a.length()*3600);}}}
    const q=(a,p)=>{const b=[...a].sort((x,y)=>x-y);return b.length?Math.round(b[Math.min(b.length-1,Math.floor(b.length*p))]):-1;};
    out[k]={kd};for(const j of J)out[k][j]=[q(acc[j],.5),q(acc[j],.95),q(acc[j],.99),acc[j].filter(v=>v>60).length];}
  return out;},[process.env.WEP||'longsword',process.env.ONLY||'']);
for(const k in r){console.log(k,'kd',r[k].kd);for(const j in r[k])if(j!=='kd')console.log('  ',j.padEnd(13),r[k][j].join(' / '));}
console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
