// the player in a garment (O) walking/running (MV: keys) filmed from the side; logs how many cloth nodes the legs would be inside
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'cloth';fs.mkdirSync(OUT,{recursive:true});const O=+(process.env.O||3),NF=+(process.env.NF||12),STEP=+(process.env.STEP||4),ANG=+(process.env.ANG||90),D=+(process.env.D||3.2);
const {browser,page,logs,fr,tick,start,shot}=await boot({W:520,HH:560,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await tick(60,1/60);await page.evaluate(()=>{const st=document.createElement('style');st.textContent='#yard,#hud,#prompt,#topc,#grip{display:none!important}';document.head.appendChild(st);});
await page.evaluate(O=>{const g=window.__game,P=g.player;for(const f of g.fighters)if(f!==P&&f.root)f.root.visible=false;window.__relook(P,Object.assign({},P.look,{b:0,o:O,bl:0,ft:0}));},O);
await new Promise(r=>setTimeout(r,3000));await tick(60,1/60);
await page.evaluate(k=>{const g=window.__game;for(const x of k.split(','))if(x)g.input.keys[x]=true;},process.env.MV||'KeyW');await tick(40,1/60);
let tot=0,ins=0,insR=0;
for(let i=0;i<NF;i++){
  const r=await page.evaluate(([STEP,ANG,D])=>{const g=window.__game,P=g.player,T=g.THREE;let ins=0,insR=0,tot=0;
    for(let k=0;k<STEP;k++){g.logic(1/60);const ms=P.model.userData.clMeshes||[];const m=ms[0];const S=m&&m._cl;if(!S)continue;
      const caps=[['LeftUpLeg','LeftLeg',.085],['LeftLeg','LeftFoot',.06],['RightUpLeg','RightLeg',.085],['RightLeg','RightFoot',.06]].map(([a,b,r])=>[P.bones[a].getWorldPosition(new T.Vector3()),P.bones[b].getWorldPosition(new T.Vector3()),r]);
      const inside=p=>caps.some(([A,B,r])=>{const ab=B.clone().sub(A),t=Math.max(0,Math.min(1,p.clone().sub(A).dot(ab)/ab.lengthSq()));return p.distanceTo(A.clone().addScaledVector(ab,t))<r;});
      for(let j=16;j<S.x.length;j++){tot++;if(inside(S.rest[j]))insR++;if(inside(S.x[j]))ins++;}}
    const a=P.yaw+ANG*Math.PI/180;window.__dbgCam={p:new T.Vector3(P.pos.x+Math.sin(a)*D,P.pos.y+1.0,P.pos.z+Math.cos(a)*D),t:new T.Vector3(P.pos.x,P.pos.y+.75,P.pos.z)};return [tot,ins,insR];},[STEP,ANG,D]);
  tot+=r[0];ins+=r[1];insR+=r[2];
  await fr(1,1/60);await shot(`${OUT}/f${String(i).padStart(3,'0')}.jpg`,82);}
console.log('nodes',tot,'inside skin-ish legs: sim',ins,'skinned rest',insR);
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();
execSync(`python3 -c "
from PIL import Image;import glob
fs=sorted(glob.glob('${OUT}/f*.jpg'));ims=[Image.open(f) for f in fs];w,h=ims[0].size;c=6;r=(len(ims)+c-1)//c
s=Image.new('RGB',(c*w,r*h))
for i,im in enumerate(ims):s.paste(im,((i%c)*w,(i//c)*h))
s.save('${OUT}/sheet.jpg',quality=84)"`);process.exit(0);
