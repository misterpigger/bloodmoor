// player (scripted cuts) against a live bot in a duel: how many swings land, how fast, how hard, what the bot does with it
import {boot} from './harness.mjs';
const W=process.env.W2||'arming',N=+(process.env.N||3),SW=+(process.env.SW||24);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const all=[];
for(let n=0;n<N;n++){await start('duel','colosseum',{pause:true});
 const r=await page.evaluate(async([W,SW])=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input;
  for(const f of g.fighters){if(!f.sword||f.sword.def.id!==W){g.spawnWeaponLoot(g.WEAPONS[W],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}}
  for(let k=0;k<240;k++)g.logic(1/60);
  const B=g.fighters.find(f=>f!==P);B.ai.skill=.6;const out={sw:0,land:0,dmg:0,tipAt:[],peak:[],clash:0,drv:[],head:[],bdmg:0,sp:[],modes:{}};
  const mv=[[[.86,.14],[.18,.72]],[[.14,.14],[.82,.72]],[[.5,.03],[.5,.92]],[[.2,.9],[.8,.2]]];
  const face=()=>{const dx=B.pos.x-P.pos.x,dz=B.pos.z-P.pos.z;P.yaw=Math.atan2(dx,dz);const d=Math.hypot(dx,dz);if(d>1.35){P.pos.x+=dx/d*(d-1.35)*.08;P.pos.z+=dz/d*(d-1.35)*.08;}};
  const step=(mx,my,l)=>{input.locked=false;input.mx=mx;input.my=my;input.lmb=l;P.stamina=Math.max(P.stamina,60);face();g.logic(1/60);};
  for(let s=0;s<SW&&B.alive&&P.alive;s++){const m=mv[s%4];window.__ulog=[];let pk=0,hp0=B.hp;const bp=B.pos.clone();
    for(let i=0;i<30;i++)step(m[0][0],m[0][1],false);
    let hit=null;for(let i=0;i<24;i++){const u=Math.min(1,(i+1)/12);step(m[0][0]+(m[1][0]-m[0][0])*u,m[0][1]+(m[1][1]-m[0][1])*u,true);const v=P.sword.tipVel.length();pk=Math.max(pk,v);if(window.__ulog.length&&!hit){hit={t:i,v};}}
    const hd0=new T.Vector3();
    for(let i=0;i<20;i++)step(.5,.45,false);
    out.sw++;out.peak.push(pk);if(window.__ulog.length){out.land++;for(const h of window.__ulog){out.dmg+=h[1];out.modes[h[0]]=(out.modes[h[0]]||0)+1;out.sp.push(h[6]);}out.drv.push(Math.hypot(B.pos.x-bp.x,B.pos.z-bp.z));}
  }
  return {...out,alive:B.alive,bhp:B.hp,php:P.hp};},[W,SW]);
 all.push(r);console.log(JSON.stringify({sw:r.sw,land:r.land,dmg:+r.dmg.toFixed(0),peak:+(r.peak.reduce((a,b)=>a+b,0)/r.peak.length).toFixed(1),hitSp:+(r.sp.reduce((a,b)=>a+b,0)/Math.max(1,r.sp.length)).toFixed(1),drv:+(r.drv.reduce((a,b)=>a+b,0)/Math.max(1,r.drv.length)).toFixed(2),modes:r.modes,botAlive:r.alive,bhp:+r.bhp.toFixed(0),php:+r.php.toFixed(0)}));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
