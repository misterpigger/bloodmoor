// blood on the body: wounds put straight onto a dressed dummy (head, chest, arm, thigh), bled for T seconds, two close views
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'gore';fs.mkdirSync(OUT,{recursive:true});const T=+(process.env.T||6),O=+(process.env.O||4);
const {browser,page,logs,fr,start,shot}=await boot({W:900,HH:700,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await fr(2,1/30);
await page.evaluate(([T,O])=>{const g=window.__game,P=g.player,T3=g.THREE;window.__pause=true;const B=g.fighters.filter(f=>f.dummy&&f.alive).sort((a,b)=>a.pos.distanceTo(P.pos)-b.pos.distanceTo(P.pos))[0];window.__B=B;for(const s of ['head','body','arms','legs'])if(B.armor[s])B.unequip(s);
  window.__relook(B,Object.assign({},B.look,{o:O,bl:0,ft:1,h:1}));B._rsk=null;
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#yard,#toast{display:none!important}';document.head.appendChild(st);
  for(let i=0;i<40;i++)g.logic(1/60);const fw=new T3.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw)),rt=new T3.Vector3(fw.z,0,-fw.x),up=new T3.Vector3(0,1,0);
  const zi=z=>B.caps.findIndex(c=>c.zone===z);console.log(B.caps.map(c=>c.zone).join(','));
  const hd=B.caps[0],hm=hd.a.clone().lerp(hd.b,.6);window.__addWound(B,0,hm.clone().addScaledVector(rt,.25).addScaledVector(fw,.05),rt.clone().negate().add(up.clone().multiplyScalar(-.4)).normalize(),60,'cut');
  const ch=B.caps[3],cm=ch.a.clone().lerp(ch.b,.4);window.__addWound(B,3,cm.clone().addScaledVector(fw,.3).addScaledVector(rt,-.07),fw.clone().negate(),34,'stab');
  const ar=B.caps[7],am=ar.a.clone().lerp(ar.b,.5);window.__addWound(B,7,am.clone().addScaledVector(fw,.2),up.clone(),30,'cut');
  const li=8,lg=B.caps[li],lm=lg.a.clone().lerp(lg.b,.4);window.__addWound(B,li,lm.clone().addScaledVector(fw,.25),rt.clone(),26,'cut');
  for(let i=0;i<T*60;i++){B.bleed=1;g.logic(1/60);g.updateBlood(1/60);}
  const h=B.chest;window.__c0={p:h.clone().addScaledVector(fw,2.0).addScaledVector(rt,.5).add(new T3.Vector3(0,.2,0)),t:h.clone().add(new T3.Vector3(0,-.2,0))};window.__c1={p:B.headPos.clone().addScaledVector(fw,.5).addScaledVector(rt,.5),t:B.headPos.clone().add(new T3.Vector3(0,-.05,0))};window.__dbgCam=window.__c0;},[T,O]);
await new Promise(r=>setTimeout(r,2500));await fr(2,1/600);await shot(`${OUT}/b_body.jpg`,92);await page.evaluate(()=>{window.__dbgCam=window.__c1;});await fr(2,1/600);await shot(`${OUT}/b_head.jpg`,92);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
