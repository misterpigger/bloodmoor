// physical fighter, clean test: teleported to the open middle of the Arena (body rebuilt), then scripted phases in clear space.
// per phase: mean speed, knockdowns, down frames, jolts (hand/head jump >8 cm a frame vs the hips), why balance was lost. FIGHT=0 skips the bot fight.
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:(process.env.NOPF?'?nohud':'?nohud&pf')+(process.env.Q||'')});
const out=await page.evaluate(async([fps,fight,only])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));const DT=1/fps;
  g.startGame('duel','colosseum');window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<260;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys,D=g.fighters.find(f=>f!==P);const R={};
  const park=()=>{for(const D of g.fighters){if(D===P)continue;D.damage=()=>{};const dx=22-D.pos.x,dz=22-D.pos.z;D.pos.x+=dx;D.pos.z+=dz;const sw=D.sword;if(sw)for(const k of ['H','T','Hp','Tp'])if(sw[k]){sw[k].x+=dx;sw[k].z+=dz;}D.vel.set(0,0,0);}};
  const tp=(x,z,yaw)=>{window.__ph='tp';window.__pfwhy=[];for(const k in K)K[k]=false;P.pos.set(x,0,z);P.vel.set(0,0,0);P.yaw=yaw;park();g.setHS(false);for(let i=0;i<10;i++){park();g.logic(1/60);P.pos.set(x,0,z);P.vel.set(0,0,0);}g.setHS(true);for(let i=0;i<90;i++){park();P.stamina=100;g.logic(1/60);}R['tp'+x+','+z]=JSON.stringify(window.__pfwhy)+(P.ragdoll?' DOWN':'')+' age '+(P.hs&&P.hs.age);};
  if(D){D.damage=()=>{};D.dummy=true;}P.damage=()=>{};const KL=[];R.kl=KL;const kd0=P.knockdown.bind(P);P.knockdown=function(...a){KL.push(window.__ph+' '+new Error().stack.split('\n').slice(2,4).map(s=>s.trim().replace(/\(http[^:]*:/,'(').slice(0,60)).join(' | '));return kd0(...a);};const di0=P.die.bind(P);P.die=function(...a){KL.push(window.__ph+' DIE '+a[1]+' by '+(a[0]===P?'self':a[0]?'other':'none')+' '+new Error().stack.split('\n').slice(2,4).map(s=>s.trim().replace(/\(http[^:]*:/,'(').slice(0,50)).join(' | '));return di0(...a);};const mr0=P.makeRagdoll?0:0;
  const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};
  const ph=(name,n,fn,far=1)=>{if(only&&!only.includes(name))return;window.__ph=name;let ja=0,jb=0,jm=0,js=[];window.__pfwhy=[];let mo=0,mb=0,d=0,down=0,kd=0,was=false,jolt=0,prev=null,pp=P.pos.clone();const N=Math.round(n*fps/60);
    for(let i=0;i<N;i++){P.stamina=100;P.hp=100;if(far)park();fn(i*60/fps);g.logic(DT);g.scene.updateMatrixWorld(true);d+=Math.hypot(P.pos.x-pp.x,P.pos.z-pp.z);pp.copy(P.pos);
      if(P.hs&&P.hs.pfo!=null)mo=Math.max(mo,P.hs.pfo);mb=Math.max(mb,Math.hypot(P.bal.x,P.bal.z));if(P.ragdoll){down++;if(!was)kd++;was=true;prev=null;continue;}was=false;
      const H=W('Hips'),r=W('RightHand'),h=W('Head');const cur=[r[0]-H[0],r[1]-H[1],r[2]-H[2],h[0]-H[0],h[1]-H[1],h[2]-H[2]];
      if(prev){const a=Math.hypot(cur[0]-prev[0],cur[1]-prev[1],cur[2]-prev[2]),b=Math.hypot(cur[3]-prev[3],cur[4]-prev[4],cur[5]-prev[5]);if(a>.08*60/fps||b>.08*60/fps){jolt++;if(a>.08*60/fps)ja++;if(b>.08*60/fps)jb++;jm=Math.max(jm,a,b);if(js.length<12)js.push(i+':'+a.toFixed(2)+'/'+b.toFixed(2)+(P.commit?'c':'')+(P.stagger>0?'s':''));}}prev=cur;}
    R[name]={ja,jb,jm:+jm.toFixed(2),js:js.join(' '),mo:+mo.toFixed(2),mb:+mb.toFixed(2),speed:+(d/(N*DT)).toFixed(2),kd,down,jolt,why:(window.__pfwhy||[]).map(w=>w[5]+w[1]+w[2]+'/'+w[3]+'/'+w[4]).join(',')};};
  if(!only||only.includes('run'))tp(-21,-14,Math.PI/2);ph('run',150,i=>{K.KeyW=true;K.ShiftLeft=true;});
  ph('stop',90,i=>{K.KeyW=false;K.ShiftLeft=false;});
  ph('back-run',150,i=>{K.KeyW=true;K.ShiftLeft=true;if(i===0)P.yaw-=Math.PI;});
  tp(-21,-14,Math.PI/2);ph('zigzag',240,i=>{K.KeyW=true;K.ShiftLeft=true;if(i===0)P.yaw-=.5;if(i%40===20)P.yaw+=(i%80===20?1:-1)*1.0;});
  tp(-21,-14,Math.PI/2);ph('stop-go',300,i=>{K.KeyW=i%60<35;K.ShiftLeft=K.KeyW;});
  tp(0,-14,0);ph('strafe',300,i=>{K.KeyA=i%80<40;K.KeyD=!K.KeyA;K.ShiftLeft=true;});
  tp(0,-14,0);ph('stand',180,i=>{for(const k in K)K[k]=false;});
  ph('turn-spot',180,i=>{P.yaw+=.05;});
  tp(-21,-14,Math.PI/2);ph('walk',240,i=>{K.KeyW=true;});
  if(fight&&D){tp(0,0,0);D.dummy=false;D.pos.set(0,0,2);D.hsFree&&0;ph('fight',900,i=>{K.KeyW=i%120<60;K.ShiftLeft=i%240<60;K.KeyA=i%90<30;if(i%40===0){g.input.lmb=!g.input.lmb;}},0);}
  return R;},[+(process.env.FPS||60),process.env.FIGHT!=='0',process.env.ONLY?process.env.ONLY.split(','):null]);
for(const k in out)console.log(k.padEnd(10),JSON.stringify(out[k]));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
