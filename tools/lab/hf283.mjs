// half-sword trace: the player thrusts a longsword at a dummy 0.9 m away; per frame the hand target and the hand in the body's frame, tip speed
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async(W)=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input,rows=[];
  for(let k=0;k<120;k++)g.logic(1/60);
  g.spawnWeaponLoot(g.WEAPONS[W],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
  const home=P.pos.clone(),yaw=P.yaw,f=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new T.Vector3(-Math.cos(yaw),0,Math.sin(yaw));
  const D=g.fighters.filter(x=>x.dummy&&x.alive).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];const dist=+(new URLSearchParams(location.search).get("dd")||.9);
  window.__ulog=[];window.__hfF=1;const dist0=+(new URLSearchParams(location.search).get("dd")||.9);
  const step=(z,i)=>{input.locked=false;P.stamina=100;input.mx=.5;input.my=.42;input.lmb=false;P.ctrl.z=z;P.pos.copy(home);P.vel.set(0,0,0);P.yaw=yaw;D.pos.x=home.x+f.x*dist;D.pos.z=home.z+f.z*dist;D.vel.set(0,0,0);D.hp=100;g.logic(1/60);
    const s=P.sword;if(!s)return;const ht=P.handTarget(new T.Vector3()).sub(P.chest),h=s.H.clone().sub(P.chest),tp=s.T.clone().sub(P.chest);
    rows.push([i,z.toFixed(2),(P._hfW||0).toFixed(2),ht.dot(f).toFixed(2),ht.y.toFixed(2),h.dot(f).toFixed(2),h.dot(r).toFixed(2),h.y.toFixed(2),tp.dot(f).toFixed(2),tp.y.toFixed(2),s.tipVel.length().toFixed(1),s.stuck?1:0,window.__ulog.length].join(' '));};
  let i=0;for(;i<20;i++)step(.46,i);for(;i<70;i++)step(.66,i);for(;i<90;i++)step(.46,i);
  return rows.join('\n')+'\n'+JSON.stringify(window.__ulog.map(h=>h.slice(0,6)));},process.env.W||'longsword');
console.log('i z hfW tgtF tgtY hF hR hY tipF tipY tipV stuck hits\n'+out);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
