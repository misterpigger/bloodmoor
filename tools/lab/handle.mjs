// handling by the numbers: the player's scripted cuts and thrusts at a standing dummy, per weapon
// tip = peak tip speed; lag = hand target to grip (cm) while committed; gap = drawn hand to grip (cm); edge = how square the edge leads in fast frames; dmg = per rep
import {boot} from './harness.mjs';
const WEPS=(process.env.WEPS||'arming,longsword,greatsword,axe,mace,spear').split(',');const REPS=+(process.env.REPS||4);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async([WEPS,REPS,MVS])=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input,res={};
  const pct=(a,p)=>{if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(p*b.length))];};
  for(let k=0;k<120;k++)g.logic(1/60);
  const home=P.pos.clone(),yaw=P.yaw;let D=null;const pick=()=>g.fighters.filter(f=>f.dummy&&f.alive&&!f.ragdoll&&!f.downed).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];
  const reach={arming:1.25,longsword:1.45,greatsword:1.6,axe:1.35,mace:1.15,spear:2.0,falchion:1.2,warhammer:1.12,poleaxe:1.75,glaive:2.3,rondel:.85};
  const MV=(typeof MOVES!=='undefined')?MOVES:null;const moves0={
    cutR:{pre:[.86,.14],to:[.18,.72],t:.2},cutL:{pre:[.14,.14],to:[.82,.72],t:.2},chop:{pre:[.5,.03],to:[.5,.92],t:.18},rise:{pre:[.2,.9],to:[.8,.2],t:.2},thrust:{thr:1}};
  const moves=Object.fromEntries(Object.entries(moves0).filter(([k])=>!MVS||MVS.includes(k)));for(const w of WEPS){const R={};res[w]=R;
    if(!P.sword||P.sword.def.id!==w){if(P.sword){const s=P.sword;s.unstick&&s.unstick();}g.spawnWeaponLoot(g.WEAPONS[w],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
    for(let k=0;k<90;k++){input.locked=false;input.mx=.5;input.my=.45;input.lmb=false;P.ctrl.z=.46;g.logic(1/60);}
    for(const [mn,M] of Object.entries(moves)){const tip=[],lag=[],gap=[],edge=[],dm=[],roll=[],back=[],wrR=[],wrL=[];let hits=0,stuck=0;
      for(let rep=0;rep<REPS;rep++){
        // put everyone back
        for(let q=0;q<400&&!(D=pick());q++){input.locked=false;input.lmb=false;g.logic(1/60);}
        P.pos.copy(home);P.vel.set(0,0,0);P.yaw=yaw;P.stamina=100;P.hp=100;const f=V3(Math.sin(yaw),0,Math.cos(yaw));function V3(x,y,z){return new T.Vector3(x,y,z);}
        const dist=(reach[w]||1.3)+(M.thr?.25:0)+(mn==='rise'?.3:0);D.pos.set(home.x+f.x*dist,D.pos.y,home.z+f.z*dist);D.vel.set(0,0,0);D.yaw=yaw+Math.PI;D.bal&&D.bal.set&&D.bal.set(0,0,0);D.hp=100;
        window.__ulog=[];let peak=0;const pe=P.sword.edge.clone();
        const step=(mx,my,lmb,z)=>{input.locked=false;P.stamina=100;input.mx=mx;input.my=my;input.lmb=lmb;input.stab=false;P.ctrl.z=z;D.pos.x=home.x+f.x*dist;D.pos.z=home.z+f.z*dist;D.vel.set(0,0,0);g.logic(1/60);
          const s=P.sword;if(!s)return;const v=s.tipVel.length();peak=Math.max(peak,v);
          if(lmb||z>.56){const ht=P.handTarget(new T.Vector3());lag.push(ht.distanceTo(s.H)*100);
            {const hp=new T.Vector3();P.bones.RightHand.getWorldPosition(hp);gap.push(hp.distanceTo(s.H)*100);for(const [sd,arr] of [['Right',wrR],['Left',wrL]]){const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();P.bones[sd+'ForeArm'].getWorldPosition(a);P.bones[sd+'Hand'].getWorldPosition(b);P.bones[sd+'HandMiddle1'].getWorldPosition(c);arr.push(Math.acos(Math.max(-1,Math.min(1,b.clone().sub(a).normalize().dot(c.sub(b).normalize()))))*57.3);}}
            if(v>8&&!window.__ulog.length){const d=s.tipVel.clone().normalize();edge.push(Math.abs(d.dot(s.edge)));back.push(d.dot(s.edge)<-.3?1:0);}}
          roll.push(Math.acos(Math.min(1,Math.abs(pe.dot(s.edge))))*60*57.3);pe.copy(s.edge);};
        if(M.thr){for(let i=0;i<30;i++)step(.5,.42,false,.46);for(let i=0;i<8;i++)step(.5,.42,false,.46+(i+1)/8*.5);for(let i=0;i<22;i++)step(.5,.42,false,.96);for(let i=0;i<26;i++)step(.5,.42,false,.46);}
        else{const n=Math.round(M.t*60);for(let i=0;i<34;i++)step(M.pre[0],M.pre[1],false,.46);for(let i=0;i<n;i++){const u=(i+1)/n;step(M.pre[0]+(M.to[0]-M.pre[0])*u,M.pre[1]+(M.to[1]-M.pre[1])*u,true,.46);}for(let i=0;i<16;i++)step(M.to[0],M.to[1],true,.46);for(let i=0;i<26;i++)step(.5,.45,false,.46);}
        tip.push(peak);const L=window.__ulog;let d=0;for(const h of L){d+=h[1];if(h[5])stuck++;}if(L.length)hits++;dm.push(d);
        if(P.sword&&P.sword.stuck){P.sword.unstick&&P.sword.unstick();}
      }
      const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
      R[mn]={tip:+avg(tip).toFixed(1),lag50:+pct(lag,.5).toFixed(0),lag90:+pct(lag,.9).toFixed(0),gap50:+pct(gap,.5).toFixed(0),gap90:+pct(gap,.9).toFixed(0),gapMax:+pct(gap,.999).toFixed(0),edge:+avg(edge).toFixed(2),back:+avg(back).toFixed(2),dmg:+avg(dm).toFixed(0),hits,stuck,roll90:+pct(roll,.9).toFixed(0),wrR90:+pct(wrR,.9).toFixed(0),wrL90:+pct(wrL,.9).toFixed(0),wrMax:+Math.max(pct(wrR,.999),pct(wrL,.999)).toFixed(0)};}
  }
  return res;},[WEPS,REPS,process.env.MOVES?process.env.MOVES.split(','):null]);
for(const [w,R] of Object.entries(out)){console.log(w);for(const [m,v] of Object.entries(R))console.log('  '+m.padEnd(7)+Object.entries(v).filter(([k])=>!(process.env.COLS)||process.env.COLS.split(',').includes(k)).map(([k,x])=>k+' '+String(x).padStart(4)).join('  '));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
