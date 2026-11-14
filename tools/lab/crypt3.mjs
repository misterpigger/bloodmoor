import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
if(process.env.ROOM)await page.evaluate(()=>{window.__room=1;});
const out=await page.evaluate(async(wid)=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);g.navBuild();for(const f of [...g.fighters])if(f!==g.player)f.die(g.player,'slain',null);
  const C=g.CRYPT,P=g.player;g.spawnWeaponLoot(g.WEAPONS[wid],P.pos.x+.5,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);
  const k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];if(window.__room){P.pos.set(C.start.x,0,C.start.z);}else if(k.ax){P.pos.set((k.x0+k.x1)/2,0,k.m);P.yaw=Math.PI/2;}else{P.pos.set(k.m,0,(k.z0+k.z1)/2);P.yaw=0;}
  P.vel.set(0,0,0);for(let q=0;q<40;q++)g.logic(1/60);g.input.locked=false;g.input.lmb=true;P.ctrl.z=.46;const s=P.sword;
  // hook the sword's step to watch every substep
  const st0=s.step.bind(s);let worst={v:0};let n=0,jumps=0,jh=0;window.__j=()=>[jumps,jh,n];s.step=function(h,...a){const H0=s.H.clone(),T0=s.T.clone(),tv0=s.tipVel.length();const r=st0(h,...a);n++;const v=s.tipVel.length();if(s.T.distanceTo(T0)/h>Math.max(30,v*1.8))jumps++;if(s.H.distanceTo(H0)/h>9)jh++;if(v>worst.v)worst={v:+v.toFixed(1),n,tv0:+tv0.toFixed(1),dH:+(s.H.distanceTo(H0)/h).toFixed(1),dT:+(s.T.distanceTo(T0)/h).toFixed(1),hit:s._wcT>g.simTime-.01,Hv:+s.Hv.length().toFixed(1),knock:s.knockT};return r;};
  for(let q=0;q<360;q++){const ph=q/60*Math.PI*1.6;g.input.mx=innerWidth/2+Math.sin(ph)*innerWidth*.45;g.input.my=innerHeight*.42+Math.cos(ph*.5)*innerHeight*.1;P.stamina=100;P.hp=100;g.logic(1/60);}
  worst.jumps=window.__j();return worst;},process.env.WEP||'poleaxe');
console.log(JSON.stringify(out));console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
