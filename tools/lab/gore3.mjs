// the dead: a duel bot wounded, bled and slain where he stands; the body and the ground after W seconds
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'gore';fs.mkdirSync(OUT,{recursive:true});const W=+(process.env.WAITS||7);
const {browser,page,logs,fr,start,shot}=await boot({W:986,HH:544,query:'?nohud'+(process.env.Q||'')});
await start('duel','yard');await fr(2,1/30);
await page.evaluate((W)=>{const g=window.__game,P=g.player,T3=g.THREE;window.__pause=true;const B=g.fighters.find(f=>f!==P&&f.alive);window.__B=B;for(const s of ['head','body','arms','legs'])if(B.armor[s])B.unequip(s);
  window.__relook(B,Object.assign({},B.look,{o:4,bl:0,ft:1,h:1}));B._rsk=null;
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#yard,#toast,#end{display:none!important}';document.head.appendChild(st);
  const hold=()=>{B.stagger=1;B.vel.set(0,0,0);P.vel.set(0,0,0);};for(let i=0;i<260;i++){hold();g.logic(1/60);}
  const fw=new T3.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw)),rt=new T3.Vector3(fw.z,0,-fw.x),up=new T3.Vector3(0,1,0);
  const hit=(ci,P0,ax,d,k,bl)=>{window.__addWound(B,ci,P0,ax,d,k);g.spawnBlood&&g.spawnBlood(P0,ax.clone().multiplyScalar(2).setY(.8),Math.min(60,(10+d*.9)|0),1.8,1+d/60);B.addBleed(bl,12);};
  const hd=B.caps[0],hm=hd.a.clone().lerp(hd.b,.6);hit(0,hm.clone().addScaledVector(rt,.25),rt.clone().negate(),55,'cut',1.2);
  for(let i=0;i<50;i++){hold();g.logic(1/60);g.updateBlood(1/60);}
  const ch=B.caps[3],cm=ch.a.clone().lerp(ch.b,.4);hit(3,cm.clone().addScaledVector(fw,.3).addScaledVector(rt,-.07),fw.clone().negate(),34,'stab',1.6);
  for(let i=0;i<90;i++){hold();g.logic(1/60);g.updateBlood(1/60);}
  B.damage(300,P,'cut');for(let i=0;i<W*60;i++){g.logic(1/60);g.updateBlood(1/60);}
  const h=B.ragdoll?B.ragdoll.P.Spine2.clone():B.pos.clone();console.log(JSON.stringify({alive:B.alive,rag:!!B.ragdoll,src:(B.bloodSrc||[]).length,pool:B.pool?B.pool.userData:null}));
  window.__c=[{p:h.clone().addScaledVector(rt,1.5).addScaledVector(fw,1.6).add(new T3.Vector3(0,1.5,0)),t:h},{p:h.clone().add(new T3.Vector3(.4,3.4,.4)),t:h},{p:h.clone().addScaledVector(rt,-.7).addScaledVector(fw,.6).add(new T3.Vector3(0,.7,0)),t:h}];},W);
await new Promise(r=>setTimeout(r,2500));
for(let i=0;i<3;i++){await page.evaluate(i=>{window.__dbgCam=window.__c[i];},i);await fr(2,1/600);await shot(`${OUT}/d${i}.jpg`,92);}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
