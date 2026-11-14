// the player's legs as he plays: feet apart (sideways and fore-aft, in the body's frame), hip height, catches and stumble steps, per movement, with a weapon and armour. WEP, ARM (comma list), Q
import {boot} from './harness.mjs';
const {browser,page}=await boot({render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(o=>{window.__only=o;},process.env.ONLY?process.env.ONLY.split(','):null);const out=await page.evaluate(async([wep,arm])=>{const g=window.__game;window.__pause=true;g.startGame('yard','arena');for(let i=0;i<200;i++)g.logic(1/60);
 const P=g.player,I=g.input,K=I.keys,T=g.THREE,a=new T.Vector3(),b=new T.Vector3(),h=new T.Vector3(),r=new T.Vector3(),f=new T.Vector3();
 if(wep){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}for(const id of arm)if(g.ARMOR[id])P.equip(g.ARMOR[id]);
 const D=g.fighters.find(x=>x!==P);const R={};P.damage=()=>{};P.knockdown=()=>{};P.die=()=>{};const ONLY=window.__only;
 const run=(name,keys,swing,n=300,tr=0)=>{if(ONLY&&!ONLY.includes(name))return;const lat=[],fa=[],hip=[];let catches=0,stum=0,lc=P.catchCD||0;for(const k of ['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])K[k]=false;I.lmb=false;P.pos.set(0,0,-3);P.vel.set(0,0,0);P.yaw=0;for(let i=0;i<50;i++)g.logic(1/60);
  for(const k of keys)K[k]=true;
  for(let i=0;i<n;i++){P.hp=100;P.stamina=100;P.yaw+=tr;if(D){D.pos.set(P.pos.x+Math.sin(P.yaw)*3.2,0,P.pos.z+Math.cos(P.yaw)*3.2);}
   if(swing){I.lmb=true;const ph=i/42*Math.PI*2;g.aimMove(Math.cos(ph)*26,Math.sin(ph*2)*8);}
   if(Math.hypot(P.pos.x,P.pos.z)>9){P.pos.x*=.3;P.pos.z*=.3;}
   g.logic(1/60);if(i<40||P.ragdoll)continue;if((P.catchCD||0)!==lc){lc=P.catchCD;catches++;}if(Math.hypot(P.bal.x,P.bal.z)>.13)stum++;
   const B=P.bones;B.LeftFoot.getWorldPosition(a);B.RightFoot.getWorldPosition(b);B.Hips.getWorldPosition(h);P.right(r);P.fwd(f);b.sub(a);lat.push(Math.abs(b.dot(r))*100);fa.push(Math.abs(b.dot(f))*100);hip.push((h.y-P.pos.y)*100);}
  const q=(A,p)=>{A=A.slice().sort((x,y)=>x-y);return A.length?+A[Math.floor(p*(A.length-1))].toFixed(0):null;};
  R[name]={feetSide:[q(lat,.5),q(lat,.9),q(lat,1)],feetFore:[q(fa,.5),q(fa,.9)],hip:[q(hip,.05),q(hip,.5)],catches,stumPct:Math.round(stum/Math.max(1,lat.length)*100),down:!!P.ragdoll,sp:+Math.hypot(P.vel.x,P.vel.z).toFixed(1)};};
 run('stand',[],0);run('walk',['KeyW'],0);run('run',['KeyW','ShiftLeft'],0);run('strafe',['KeyA'],0);run('back',['KeyS'],0);run('walk+turn',['KeyW'],0,300,.03);run('strafe+turn',['KeyD'],0,300,.02);
 run('stand swing',[],1);run('walk swing',['KeyW'],1);run('strafe swing',['KeyA'],1);run('back swing',['KeyS'],1);
 return R;},[process.env.WEP||'poleaxe',(process.env.ARM||'plate,vambraces,greaves,sallet').split(',')]);
for(const k in out)console.log(k.padEnd(14),JSON.stringify(out[k]));await browser.close();process.exit(0);
