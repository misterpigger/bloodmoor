import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:900,HH:700,query:'?nohud'});
await start('yard','colosseum');await fr(2,1/30);await tick(120);
await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);window.__B=B;for(const s of ['head','body','arms','legs'])if(B.armor[s])B.unequip(s);
  if(0){window.__relook(B,Object.assign({},B.look,{o:0}));}
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#yard{display:none!important}';document.head.appendChild(st);
  B._rsk=null;for(let i=0;i<5;i++)g.logic(1/60);const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw)),rt=new T.Vector3(fw.z,0,-fw.x);
  for(let i=0;i<30;i++)g.logic(1/60);const ch=B.caps[3],mid=ch.a.clone().lerp(ch.b,.25);window.__addWound(B,3,mid.clone().addScaledVector(fw,.3).addScaledVector(rt,.05),new T.Vector3(.8,.5,0).normalize(),34,'cut');
  console.log(B.caps.map(c=>c.zone).join(','));const bl=B.caps[2],m2=bl.a.clone().lerp(bl.b,.55);window.__addWound(B,2,m2.clone().addScaledVector(fw,.3).addScaledVector(rt,-.06),rt.clone(),14,'cut');
  const ar=B.caps[7],m3=ar.a.clone().lerp(ar.b,.5);window.__addWound(B,7,m3.clone().addScaledVector(fw,.2),new T.Vector3(0,1,0),20,'cut');
  const h=B.chest;window.__dbgCam={p:h.clone().addScaledVector(fw,.55).add(new T.Vector3(.15,-.1,0)),t:h.clone().add(new T.Vector3(0,-.2,0))};});
await tick(3);await fr(3,1/60);await shot('bis/gash2.jpg',92);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
