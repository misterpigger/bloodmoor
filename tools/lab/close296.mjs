// close-in cuts: where along the blade, how fast at the contact, what hit. MOVES as handle.mjs, DIST, WEP
import {boot} from './harness.mjs';
const W=process.env.WEP||'arming',DIST=+(process.env.DIST||.85),REPS=+(process.env.REPS||3),MV=process.env.MV||'chop';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async([W,DIST,REPS,MV])=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input,res=[];
  for(let k=0;k<120;k++)g.logic(1/60);const home=P.pos.clone(),yaw=P.yaw;
  const pick=()=>g.fighters.filter(f=>f.dummy&&f.alive&&!f.ragdoll).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];
  const M={cutR:{pre:[.86,.14],to:[.18,.72],t:.2},cutL:{pre:[.14,.14],to:[.82,.72],t:.2},chop:{pre:[.5,.03],to:[.5,.92],t:.18}}[MV];
  if(P.sword.def.id!==W){g.spawnWeaponLoot(g.WEAPONS[W],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
  for(let k=0;k<90;k++){input.locked=false;input.mx=.5;input.my=.45;P.ctrl.z=.46;g.logic(1/60);}
  const f=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  for(let rep=0;rep<REPS;rep++){let D=pick();P.pos.copy(home);P.vel.set(0,0,0);P.yaw=yaw;P.stamina=100;D.pos.set(home.x+f.x*DIST,D.pos.y,home.z+f.z*DIST);D.vel.set(0,0,0);D.yaw=yaw+Math.PI;D.hp=100;
    window.__ulog=[];const tr=[];
    const step=(mx,my,lmb)=>{input.locked=false;P.stamina=100;input.mx=mx;input.my=my;input.lmb=lmb;P.ctrl.z=.46;D.pos.x=home.x+f.x*DIST;D.pos.z=home.z+f.z*DIST;D.vel.set(0,0,0);g.logic(1/60);
      const s=P.sword,r=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const ch=new T.Vector3();P.bones.Spine2.getWorldPosition(ch);const h=s.H.clone().sub(ch);
      if(lmb)tr.push([+(h.dot(f)).toFixed(2),+(h.y).toFixed(2),+s.tipVel.length().toFixed(1),window.__ulog.length]);};
    const n=Math.round(M.t*60);for(let i=0;i<34;i++)step(M.pre[0],M.pre[1],false);for(let i=0;i<n;i++){const u=(i+1)/n;step(M.pre[0]+(M.to[0]-M.pre[0])*u,M.pre[1]+(M.to[1]-M.pre[1])*u,true);}for(let i=0;i<20;i++)step(M.to[0],M.to[1],true);for(let i=0;i<30;i++)step(.5,.45,false);
    res.push({hits:window.__ulog.map(h=>[h[0],h[1],h[4],'t'+h[7],'v'+h[8]]),tr:tr.slice(0,18)});}
  return res;},[W,DIST,REPS,MV]);
for(const r of out){console.log(JSON.stringify(r.hits));console.log('   hand fwd/up, tip v, nhits: '+r.tr.map(x=>x.join('/')).join(' '));}
await browser.close();process.exit(0);
