// the moment a hit lands: the player's scripted cut at a live duel bot held in place until the blow, filmed from the player's own camera, with a per-frame trace of blade and body after contact
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'hit287';fs.mkdirSync(OUT,{recursive:true});const WEP=process.env.WEP||'longsword',MOVE=process.env.MOVE||'chest',DIST=+(process.env.DIST||1.5),TAG=process.env.TAG||'a',SHOTS=!process.env.NOSHOT;
const MV={chest:[[.88,.3],[.15,.5]],head:[[.86,.12],[.2,.42]],left:[[.12,.3],[.85,.5]],chop:[[.5,.03],[.5,.9]],leg:[[.88,.5],[.2,.95]],thrust:[[.5,.42],[.5,.42]]}[MOVE];
const {browser,page,logs,fr,start,shot}=await boot({W:+(process.env.W||800),HH:+(process.env.H||450),render:SHOTS,query:'?nohud'+(process.env.Q||'')});
await start('duel','arena',{pause:true});
await page.evaluate(async([w,DIST,ARM,CAMV])=>{const g=window.__game,T=g.THREE,P=g.player,input=g.input;window.__pause=true;
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#yard,#toast,#bark{display:none!important}';document.head.appendChild(st);
  const B=g.fighters.find(f=>f!==P);window.__B=B;
  for(const f of g.fighters){for(const s of ['head','body','arms','legs'])if(f.armor[s])f.unequip(s);if(!f.sword||f.sword.def.id!==w){g.spawnWeaponLoot(g.WEAPONS[w],f.pos.x,f.pos.z);g.pickUp(f,g.loot[g.loot.length-1]);}}
  if(ARM)for(const id of ARM.split(',')){const d=g.ARMOR&&g.ARMOR.find?g.ARMOR.find(a=>a.id===id):null;if(d)B.equip(d);}
  for(let k=0;k<260;k++)g.logic(1/60);
  const home=P.pos.clone(),yaw=Math.atan2(B.pos.x-P.pos.x,B.pos.z-P.pos.z),f=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw));window.__G={home,yaw,f,DIST,hit:0,tr:[]};
  const v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3();
  window.__step=(mx,my,lmb)=>{const G=window.__G;input.locked=false;P.stamina=100;P.hp=100;input.mx=mx;input.my=my;input.lmb=lmb;P.ctrl.z=window.__Z||.46;P.yaw=yaw;
    if(!G.hit){P.pos.x=home.x;P.pos.z=home.z;P.vel.set(0,0,0);B.pos.x=home.x+f.x*DIST;B.pos.z=home.z+f.z*DIST;B.vel.set(0,0,0);B.yaw=yaw+Math.PI;if(B.ai){B.ai.cd=1;B.ai.phase='wait';}B.stamina=100;}
    const n0=(window.__ulog||[]).length;g.logic(1/60);g.updateBlood&&g.updateBlood(1/60);
    if(!G.hit&&(window.__ulog||[]).length>n0&&window.__ulog[window.__ulog.length-1][1]>4){G.hit=1;G.p0=B.pos.clone();G.h=window.__ulog[window.__ulog.length-1];B.bones.Head.getWorldPosition(v1);B.bones.Spine2.getWorldPosition(v2);B.bones.Hips.getWorldPosition(v3);G.hd=v1.clone().sub(v3);G.cd=v2.clone().sub(v3);G.hp0=B.hp;}
    if(G.hit){const s=P.sword;B.bones.Head.getWorldPosition(v1);B.bones.Spine2.getWorldPosition(v2);B.bones.Hips.getWorldPosition(v3);
      G.tr.push({tip:s?+s.tipVel.length().toFixed(1):0,stuck:s&&s.stuck?1:0,drv:+((B.pos.x-G.p0.x)*f.x+(B.pos.z-G.p0.z)*f.z).toFixed(2),lat:+Math.hypot(B.pos.x-G.p0.x,B.pos.z-G.p0.z).toFixed(2),head:+(v1.sub(v3).distanceTo(G.hd)*100).toFixed(0),chest:+(v2.sub(v3).distanceTo(G.cd)*100).toFixed(0),hipY:+v3.y.toFixed(2),sp:+Math.hypot(B.vel.x,B.vel.z).toFixed(1),stag:+(B.stagger||0).toFixed(2),pain:+(B.painT||0).toFixed(2),rag:B.ragdoll?1:0,ph:B.ai?B.ai.phase:'',hp:+B.hp.toFixed(0),bcm:B.commit?1:0});}};
  if(CAMV){const r=new T.Vector3(f.z,0,-f.x),c=CAMV.split(',').map(Number);window.__dbgCam={p:home.clone().addScaledVector(r,c[0]).addScaledVector(f,c[2]).add(new T.Vector3(0,c[1],0)),t:home.clone().addScaledVector(f,DIST*(c[4]==null?.6:c[4])).add(new T.Vector3(0,c[3]||1.1,0))};}
  window.__ulog=[];for(let i=0;i<40;i++)window.__step(.5,.45,false);},[WEP,DIST,process.env.ARM||'',process.env.CAMV||'']);
await new Promise(r=>setTimeout(r,2500));
const run=(n,a)=>page.evaluate(([n,a])=>{for(let i=0;i<n;i++)window.__step(...a);return window.__G.hit;},[n,a]);
let k=0;const snap=async(tag)=>{if(!SHOTS)return;await fr(1,1/600);await shot(`${OUT}/${TAG}_${String(k++).padStart(2,'0')}_${tag}.jpg`,88);};
await run(34,[MV[0][0],MV[0][1],false]);await snap('wind');if(MOVE==='thrust')await page.evaluate(()=>{window.__Z=.72;});
const N=12;let hit=0,i=0,after=0;const at=new Set([0,2,4,7,11,16,24,34,48,64]);
for(i=0;i<N&&!hit;i++){const u=(i+1)/N;hit=await run(1,[MV[0][0]+(MV[1][0]-MV[0][0])*u,MV[0][1]+(MV[1][1]-MV[0][1])*u,true]);if(!hit&&i%3===2)await snap('sw'+i);}
const iu=Math.min(1,i/N);for(let j=0;j<80;j++){if(hit){if(at.has(after))await snap('h'+String(after).padStart(2,'0'));after++;}const u=Math.min(1,iu+(j+1)/N),hold=j<18;hit=await run(1,hold?[MV[0][0]+(MV[1][0]-MV[0][0])*u,MV[0][1]+(MV[1][1]-MV[0][1])*u,true]:[.5,.45,false])||hit;}
const G=await page.evaluate(()=>{const G=window.__G;return {hit:G.hit,h:G.h,hp0:G.hp0,tr:G.tr};});
if(!G.hit)console.log('NO HIT');else{console.log('hit',JSON.stringify(G.h));const T=G.tr;for(const n of [0,1,2,3,4,6,8,11,16,24,34,48,64])if(T[n])console.log(String(n).padStart(3),JSON.stringify(T[n]));
  const mx=k=>Math.max(...T.map(t=>t[k]));console.log('SUM',JSON.stringify({dmg:+(G.h[1]).toFixed(0),mode:G.h[0],zone:G.h[4],tip0:T[0].tip,tip4:T[4]&&T[4].tip,drvMax:mx('drv'),latEnd:T[T.length-1].lat,head:mx('head'),chest:mx('chest'),stag:mx('stag'),sq:T.filter(t=>!t.rag&&t.hipY<T[0].hipY-.12&&t.sp>.6).length,low:T.filter(t=>!t.rag&&t.hipY<T[0].hipY-.12).length,rag:mx('rag'),back:T.findIndex(t=>t.bcm)}));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
