// renders of the crypt through the game's own camera. SCN: list of scene names to render
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'crypt';fs.mkdirSync(OUT,{recursive:true});const TAG=process.env.TAG||'c';
const SCN=(process.env.SCN||'start,lamp,corr,room').split(','),NOSHOT=new Set((process.env.NOSHOT||'clear,lamp').split(','));
const {browser,page,logs,fr,tick,shot}=await boot({W:+(process.env.W||1280),HH:+(process.env.H||720),query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async(seed)=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));
  if(seed){const mr=Math.random;let a=+seed;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);if(window.__depth){for(let d=1;d<window.__depth;d++){}}},process.env.SEED2||'');
if(process.env.DEPTH){for(let d=1;d<+process.env.DEPTH;d++){await page.evaluate(()=>{const g=window.__game,P=g.player,C=g.CRYPT,h=C.hole;P.hp=100;P.pos.set(h.x+1,0,h.z+1.2);P.vel.set(0,0,0);});for(let k=0;k<12;k++){await tick(20);await new Promise(r=>setTimeout(r,30));}await page.evaluate(()=>{const g=window.__game,P=g.player;for(let k=0;k<500&&(P.ragdoll||k<60);k++)g.logic(1/60);P.hp=100;});}}
await new Promise(r=>setTimeout(r,3000));
const scenes={
  start:`P.pos.set(C.start.x-1.6,0,C.start.z-2.2);P.yaw=.6;`,
  lamp:`P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);const it=g.loot.find(l=>l.kind==='weapon');if(it)g.pickUp(P,it);P.pos.set(C.start.x+1.2,0,C.start.z-2.4);P.yaw=-.5;`,
  corr:`if(!P.lamp){P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);}if(!P.sword||P.sword.def.kind==='fist'){const it=g.loot.find(l=>l.kind==='weapon');if(it)g.pickUp(P,it);}const k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];if(k.ax){P.pos.set(k.x0+1.2,0,k.m);P.yaw=Math.PI/2;}else{P.pos.set(k.m,0,k.z0+1.2);P.yaw=0;}`,
  room:`const c=C.plan.cells.find(c=>c.type==='room'&&!c.dark)||C.plan.cells[1];P.pos.set(c.cx-c.hx+1.1,0,c.cz-c.hz+1.1);P.yaw=Math.PI/4;`,
  exit:`const c=C.plan.exit;P.pos.set(c.cx-4.3,0,c.cz-4.2);P.yaw=.8;`,
  hole:`const c=C.plan.exit;P.pos.set(c.cx+3.1,0,c.cz-.6);P.yaw=-Math.PI/2;P.pitch=-.5;`,
  trap:`const t=C.traps[0];if(t){if(t.ax){P.pos.set(t.a0-1.6,0,t.m);P.yaw=Math.PI/2;}else{P.pos.set(t.m,0,t.a0-1.6);P.yaw=0;}}`,
  trapopen:`const t=C.traps[0];if(t){g.cryptTrapOpen(t);}`,
  belt:`const it=g.loot.find(l=>l.kind==='weapon'&&l.def.kind==='blade');if(it){g.pickUp(P,it);P.beltKey();}`,
  chest:`if(!P.lamp){P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);}g.spawnWeaponLoot(g.WEAPONS.poker,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);const k=C.caskets[0];P.pos.set(k.x+Math.sin(k.ry)*.95,0,k.z+Math.cos(k.ry)*.95);P.yaw=Math.atan2(k.x-P.pos.x,k.z-P.pos.z);g.cryptUse(P);for(let i=0;i<window.__chT;i++){g.logic(1/60);g.lampStep(1/60);}`,
  sling:`g.spawnWeaponLoot(g.WEAPONS.longsword,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);g.spawnWeaponLoot(g.WEAPONS.poker,P.pos.x+.3,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);P.pos.set(C.start.x,0,C.start.z);P.yaw=0;`,
  updoor:`const u=C.up,s=C.start,dx=u.x-s.x,dz=u.z-s.z,L=Math.hypot(dx,dz);P.pos.set(u.x-dx/L*3.2,0,u.z-dz/L*3.2);P.yaw=Math.atan2(dx,dz);`,
  crawl:`const q=C.lows[0];if(q){const u=q.mu+q.md*${process.env.CU||3.4},w=q.m+${process.env.CW||1.9},tx=q.ax?q.mu:q.m,tz=q.ax?q.m:q.mu;if(q.ax)P.pos.set(u,0,w);else P.pos.set(w,0,u);P.yaw=Math.atan2(tx-P.pos.x,tz-P.pos.z);}`,
  crawlin:`const q=C.lows[0];if(q){const u=(q.a0+q.a1)/2;if(q.ax){P.pos.set(u,0,q.m);P.yaw=Math.PI/2;}else{P.pos.set(q.m,0,u);P.yaw=0;}}`,
  stairtop:`const d=C.down;P.pos.set(d.x-.2,0,d.z0-3.2);P.yaw=0;`,
  stairmid:`const d=C.down;P.pos.set(d.x,-1.2,d.z0+2.4);P.yaw=0;`,
  stairfoot:`const d=C.down;P.pos.set(d.x,-2.8,d.zd-3.0);P.yaw=0;`,stairin:`const d=C.down;P.pos.set(d.x,-2.8,d.zd-1.0);P.yaw=0;`,stairdoor:`const d=C.down;P.pos.set(d.x,-2.8,d.zd-1.5);P.yaw=0;`,
  arrive:`const d=C.arr;if(d){P.pos.set(d.x,0,d.zd-1.9);P.yaw=0;}`,
  arrin:`const d=C.arr;if(d){P.pos.set(d.x-1.5,0,d.zd+3.2);P.yaw=Math.PI;}`,
  pitv:`const q=C.pits[0];P.pos.set(q.x-2.9,0,q.z-1.6);P.yaw=Math.atan2(q.x-P.pos.x,q.z-P.pos.z);g.input.rmb=true;`,
  pitr:`const q=C.pits[0];P.pos.set(q.x+.3,0,q.z+3.0);P.yaw=Math.PI;`,
  ossv:`const c=C.plan.cells.find(c=>c.kind==='ossuary');P.pos.set(c.cx,0,c.cz);P.yaw=-Math.PI/2;g.input.rmb=true;`,
  ossc:`const c=C.plan.cells.find(c=>c.kind==='ossuary');P.pos.set(c.cx-c.hx+1.5,0,c.cz);P.yaw=-Math.PI/2;g.input.rmb=true;`,
  swing:`const t=C.swings[0];if(t){if(t.ax){P.pos.set(t.u0-2.6,0,t.m);P.yaw=Math.PI/2;}else{P.pos.set(t.m,0,t.u0-2.6);P.yaw=0;}g.input.rmb=true;}`,
  spikes:`const t=C.spikes[0];if(t){if(t.ax){P.pos.set(t.u0-2.4,0,t.m);P.yaw=Math.PI/2;}else{P.pos.set(t.m,0,t.u0-2.4);P.yaw=0;}g.input.rmb=true;}`,
  spikesgo:`const t=C.spikes[0];if(t){t.st='out';t.ext=1;}`,
  swinggo:`const t=C.swings[0];if(t){t.armed=false;t.th=0;t.om=0;}`,
  exit2:`const c=C.plan.exit;P.pos.set(c.cx+1.6,0,c.cz-3.6);P.yaw=-.5;g.input.rmb=true;`,
  scon:`const c=C.plan.cells.find(c=>c.type==='room');P.pos.set(c.cx,0,c.cz);P.yaw=0;`,
  pdie:`P.damage(999,null,'x');`,wait:``,wait2:``,wait3:``,
  fdie:`const f=F.find(f=>f!==P);if(f){f.pos.set(P.pos.x+Math.sin(P.yaw)*1.6,0,P.pos.z+Math.cos(P.yaw)*1.6);f.yaw=P.yaw+Math.PI;for(let i=0;i<30;i++)g.logic(1/60);f.damage(999,P,'x');}`,
  clear:`for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}`,
  up:`g.input.rmb=true;`,
  w0:`const c=C.plan.cells.find(c=>c.kind==='plain');P.pos.set(c.cx,0,c.cz);P.yaw=0;`,
  w1:`const c=C.plan.cells.find(c=>c.kind==='plain');P.pos.set(c.cx,0,c.cz);P.yaw=Math.PI;`,
  w2:`const c=C.plan.cells.find(c=>c.kind==='plain');P.pos.set(c.cx,0,c.cz);P.yaw=Math.PI/2;`,
  w3:`const c=C.plan.cells.find(c=>c.kind==='plain');P.pos.set(c.cx,0,c.cz);P.yaw=-Math.PI/2;`,
  tbl:`const c=C.plan.cells.find(c=>c.kind==='plain');P.pos.set(c.cx-2.4,0,c.cz-1.6);P.yaw=Math.atan2(2.4,1.6);`,
  blade:`const t=C.blades[0];if(t){if(t.ax){P.pos.set(t.u0-2.6,0,t.m);P.yaw=Math.PI/2;}else{P.pos.set(t.m,0,t.u0-2.6);P.yaw=0;}}`,
  sunkb:`const q=C.sunks[0];P.pos.set(q.x-q.ix+.8,-q.dep,q.z-.9);P.yaw=Math.PI/2-.5;`,
  sunkw:`const q=C.sunks[0];P.pos.set(q.x+q.ix+.9,0,q.z+q.iz+.9);P.yaw=Math.PI*1.25;`,
  top:`window.__top=1;`,
  hurt:`window.__hurt=38;`,
  foe:`const f=F.find(f=>f.ai.mind);if(f){const m=f.ai.mind;P.pos.set(m.home[0]-2.6,0,m.home[1]);P.yaw=Math.PI/2;f.pos.set(m.home[0],0,m.home[1]);f.yaw=-Math.PI/2;}`,
};
const kinds=await page.evaluate(()=>window.__game.CRYPT.plan.cells.map(c=>c.kind||c.type));console.log('kinds',kinds.join(' '));for(const k of new Set(kinds))scenes['k_'+k]=`const c=C.plan.cells.find(c=>(c.kind||c.type)==='${k}');P.pos.set(c.cx-c.hx*.62,0,c.cz-c.hz*.3);P.yaw=Math.PI/2-.3;`;
for(const s of SCN){const [name,camo]=s.split(':');if(!scenes[name]&&name.startsWith('k_')){console.log('no',name);continue;}
  await page.evaluate(async([src,camo])=>{const g=window.__game,P=g.player,F=g.fighters,C=g.CRYPT;P.vel.set(0,0,0);(new Function('g','P','F','C',src))(g,P,F,C);P.pitch=-.05;if(P.alive)P.hp=window.__hurt||100;
    if(camo==='fp'){for(let i=0;i<3&&g.camMode!=='fp';i++)window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}));}if(camo&&camo[0]==='d'){const a=camo.slice(1).split('_').map(Number),T=g.THREE,sn=Math.sin(P.yaw),co=Math.cos(P.yaw),w=(x,y,z)=>new T.Vector3(P.pos.x+(-co)*x+sn*z,P.pos.y+y,P.pos.z+sn*x+co*z);window.__dbgCam={p:w(a[0],a[1],a[2]),t:w(a[3],a[4],a[5])};}else window.__dbgCam=null;},[scenes[name]||'',camo||'']);
  await tick(40,1/60);await page.evaluate(()=>{const g=window.__game;if(g.player.alive)g.player.hp=window.__hurt||100;});if(!NOSHOT.has(name)){await fr(3,1/30);await shot(`${OUT}/${TAG}_${name}.jpg`,90);}console.log('shot',name);}
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
