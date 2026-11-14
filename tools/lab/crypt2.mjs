// behaviour in the crypt: the player walks at each dweller in turn and stands there; what do they do? Doors; weapons against walls
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++){g.logic(1/60);g.lampStep(1/60);}};step(200);g.navBuild();
  const C=g.CRYPT,P=g.player;const it=g.loot.find(l=>l.kind==='weapon');g.pickUp(P,it);step(30);
  // doors: walk through each one
  for(const d of C.doors){const w=d.w;if(d.bar){log.push({door:'barred',hp:d.bar.hp});continue;}P.pos.set(w.x-w.dx*1.6,0,w.z-w.dz*1.6);P.vel.set(0,0,0);P.yaw=Math.atan2(w.dx,w.dz);g.input.keys.KeyW=true;let mx=0;for(let k=0;k<150;k++){g.logic(1/60);mx=Math.max(mx,Math.abs(d.th));P.hp=100;}g.input.keys.KeyW=false;
    log.push({door:'open',th:+mx.toFixed(2),through:+((P.pos.x-w.x)*w.dx+(P.pos.z-w.z)*w.dz).toFixed(2)});}
  // dwellers: stand 5 m off in plain sight for 9 s
  for(const f of g.fighters.filter(f=>f.ai.mind&&f.alive)){const m=f.ai.mind,m0=m.mood;f.pos.set(m.home[0],0,m.home[1]);let px=m.home[0]-3.2,pz=m.home[1];if(!g.navClear(px,pz,f.pos.x,f.pos.z)){px=m.home[0];pz=m.home[1]-3.2;}
    P.pos.set(px,0,pz);P.vel.set(0,0,0);P.hp=100;f.yaw=Math.atan2(px-f.pos.x,pz-f.pos.z);let tAware=-1,tHost=-1,dmin=99;for(let k=0;k<540;k++){g.logic(1/60);P.hp=100;P.pos.set(px,0,pz);if(P.ragdoll){}if(tAware<0&&m.aware)tAware=k/60;if(tHost<0&&m.mood==='hostile'&&m0!=='hostile')tHost=k/60;dmin=Math.min(dmin,Math.hypot(f.pos.x-px,f.pos.z-pz));}
    log.push({mood0:m0,mood1:m.mood,aware:+tAware.toFixed(1),turned:+tHost.toFixed(1),dmin:+dmin.toFixed(1),wep:f.sword&&f.sword.def.id});f.die(P,'slain',null);step(20);}
  log.push({kills:g.MODEHUD[1],ren:g.CAREER.renown});
  // a long weapon in a corridor: give a poleaxe, stand mid-corridor, sweep the aim side to side with the button held; how fast does the tip get, how far does it go through stone
  const k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];const res={};
  for(const wid of ['arming','poleaxe','glaive']){for(const where of ['room','tunnel']){const s0=g.loot.find(l=>l.kind==='weapon'&&l.def.id===wid);if(!P.sword||P.sword.def.id!==wid){g.spawnWeaponLoot(g.WEAPONS[wid],P.pos.x+.5,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
      if(where==='tunnel'){if(k.ax){P.pos.set((k.x0+k.x1)/2,0,k.m);P.yaw=Math.PI/2;}else{P.pos.set(k.m,0,(k.z0+k.z1)/2);P.yaw=0;}}else{P.pos.set(C.start.x,0,C.start.z);P.yaw=0;}
      P.vel.set(0,0,0);step(40);g.input.locked=false;let vmax=0,pen=0,hits=0,t0=P.sword._wcT||0;g.input.lmb=true;P.ctrl.z=.46;
      for(let q=0;q<360;q++){const ph=q/60*Math.PI*1.6;g.input.mx=innerWidth/2+Math.sin(ph)*innerWidth*.45;g.input.my=innerHeight*.42+Math.cos(ph*.5)*innerHeight*.1;P.stamina=100;P.hp=100;g.logic(1/60);const s=P.sword;if(!s)break;vmax=Math.max(vmax,s.tipVel.length());
        const T=s.T;let o=0;if(where==='tunnel'){const lat=k.ax?T.z-k.m:T.x-k.m;o=Math.abs(lat)-.95;}pen=Math.max(pen,o);if((s._wcT||0)!==t0){hits++;t0=s._wcT;}}
      g.input.lmb=false;res[wid+'_'+where]={vmax:+vmax.toFixed(1),through:+pen.toFixed(2),clanks:hits};}}
  log.push(res);return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
