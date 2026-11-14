// the player with bare fists: shoulder line against hip line (signed yaw, degrees) and trunk pitch standing, walking, running, side-stepping and backing, fists down and up
import {boot} from './harness.mjs';
const {browser,page}=await boot({render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game;window.__pause=true;g.startGame('duel','colosseum');for(let i=0;i<260;i++)g.logic(1/60);
 const P=g.player,I=g.input,K=I.keys,T=g.THREE,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),d=new T.Vector3();if(P.sword&&P.sword.def.kind!=='fist'){P.dropSword(true);P.giveFists();}
 const foe=g.fighters.find(f=>f!==P);P.damage=()=>{};P.knockdown=()=>{};P.shove=()=>{};P.die=()=>{};const R={};
 const run=(name,keys,lmb,n=240,tr=0)=>{const S=[],Pi=[];for(const k of ['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])K[k]=false;I.lmb=I.rmb=false;P.pos.set(0,0,-9);P.vel.set(0,0,0);P.yaw=Math.PI;for(let i=0;i<40;i++)g.logic(1/60);for(const k of ['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])K[k]=keys.includes(k);I.lmb=lmb;I.rmb=lmb;
  for(let i=0;i<n;i++){if(foe.sword&&foe.sword.def.kind!=='fist'){foe.dropSword(true);foe.giveFists();}foe.pos.set(P.pos.x+5,0,P.pos.z);foe.vel.set(0,0,0);P.hp=100;P.stamina=100;P.yaw+=tr;g.logic(1/60);if(i<50||P.ragdoll)continue;const B=P.bones;
   B.LeftArm.getWorldPosition(a);B.RightArm.getWorldPosition(b);B.LeftUpLeg.getWorldPosition(c);B.RightUpLeg.getWorldPosition(d);
   let dy=Math.atan2(b.z-a.z,b.x-a.x)-Math.atan2(d.z-c.z,d.x-c.x);while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;S.push(dy*57.3);
   const m=a.clone().add(b).multiplyScalar(.5),h=c.clone().add(d).multiplyScalar(.5),up=m.sub(h).normalize();Pi.push(Math.asin(Math.min(1,Math.hypot(up.x,up.z)))*57.3);}
  const q=(A,p)=>{A=A.slice().sort((x,y)=>x-y);return A.length?+A[Math.floor(p*(A.length-1))].toFixed(0):null;};R[name]={st:[P.alive,!!P.ragdoll,P.deathCause||'',+P.pos.x.toFixed(1),+P.pos.z.toFixed(1),+P.pos.y.toFixed(1)],twist:[q(S,.05),q(S,.5),q(S,.95)],pitch:[q(Pi,.5),q(Pi,.95)],sp:+Math.hypot(P.vel.x,P.vel.z).toFixed(1)};};
 for(const up of [0,1]){const s=up?' fists up':'';run('stand'+s,[],up);run('walk'+s,['KeyW'],up);run('run'+s,['KeyW','ShiftLeft'],up);run('side'+s,['KeyA'],up);run('back'+s,['KeyS'],up);run('turn'+s,[],up,240,.04);run('walk turn'+s,['KeyW'],up,240,.04);run('run turn'+s,['KeyW','ShiftLeft'],up,240,.04);}
 return R;});
for(const k in out)console.log(k.padEnd(18),JSON.stringify(out[k]));await browser.close();process.exit(0);
