// how bent the player is standing, walking and running (body frame, + = forward): trunk lean Hips->Neck, upper-back bend (Spine1->Spine2 vs Spine2->Neck),
// head ahead of the shoulders (cm), neck pitch, shoulders ahead of the chest (cm). WEP, FOE=1 keeps a dummy 3.2 m ahead, Q
import {boot} from './harness.mjs';
const {browser,page}=await boot({render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async([wep,foe])=>{const g=window.__game;window.__pause=true;g.startGame('yard','arena');for(let i=0;i<200;i++)g.logic(1/60);
 const P=g.player,I=g.input,K=I.keys;
 if(wep&&wep!=='fists'){g.spawnWeaponLoot(g.WEAPONS[wep],P.pos.x,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);}
 const DS=g.fighters.filter(x=>x!==P),D=DS[0];P.damage=()=>{};P.knockdown=()=>{};if(D){D.damage=()=>{};}const R={};
 const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};
 const run=(name,keys,n=300)=>{const m={lean:[],back:[],head:[],neck:[],sh:[],hip:[]};for(const k of ['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])K[k]=false;P.pos.set(6,0,-8);P.vel.set(0,0,0);P.yaw=0;let sk=0;for(let i=0;i<60;i++)g.logic(1/60);
  for(const k of keys)K[k]=true;
  for(let i=0;i<n;i++){P.hp=100;P.stamina=100;for(const d of DS){d.pos.set(40,0,40);d.vel.set(0,0,0);}if(foe&&D)D.pos.set(P.pos.x+3.2,0,P.pos.z+1.5);
   if(P.pos.z>3){P.pos.set(6,0,-8);sk=i+25;}
   g.logic(1/60);g.scene.updateMatrixWorld(true);if(i<50||i<sk||P.ragdoll)continue;
   const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);const fw=v=>v[0]*fx+v[2]*fz;const d=(a,b)=>[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const pit=v=>Math.atan2(fw(v),v[1])*57.3;
   const H=W('Hips'),S1=W('Spine1'),S2=W('Spine2'),N=W('Neck'),Hd=W('Head'),Ht=W('HeadTop_End'),La=W('LeftArm'),Ra=W('RightArm');
   m.lean.push(pit(d(H,N)));m.back.push(pit(d(S2,N))-pit(d(S1,S2)));m.neck.push(pit(d(Hd,Ht)));
   const sm=[(La[0]+Ra[0])/2,(La[1]+Ra[1])/2,(La[2]+Ra[2])/2];m.head.push(fw(d(sm,Hd))*100);m.sh.push(fw(d(S2,sm))*100);m.hip.push((H[1]-P.pos.y)*100);}
  const q=(A,p)=>{A=A.slice().sort((x,y)=>x-y);return A.length?+A[Math.floor(p*(A.length-1))].toFixed(1):null;};
  R[name]={sp:+Math.hypot(P.vel.x,P.vel.z).toFixed(1)};for(const k in m)R[name][k]=[q(m[k],.1),q(m[k],.5),q(m[k],.9)];};
 run('stand',[]);run('walk',['KeyW'],400);run('run',['KeyW','ShiftLeft'],600);return R;},[process.env.WEP||'longsword',+(process.env.FOE||0)]);
for(const k in out)console.log(k.padEnd(6),JSON.stringify(out[k]));await browser.close();process.exit(0);
