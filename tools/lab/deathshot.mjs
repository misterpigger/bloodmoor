// frames of a slain dummy falling, from the side. DIR front|back|left|right, ZONE Head|Spine2|Hips
import {boot} from './harness.mjs';import fs from 'fs';import {execSync} from 'child_process';
const OUT=process.env.OUT||'../fight/death';fs.mkdirSync(OUT,{recursive:true});const NF=+(process.env.NF||20),STEP=+(process.env.STEP||3);
const {browser,page,logs,fr,tick,start,shot}=await boot({W:384,HH:320,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,3500));await tick(40,1/60);
await page.evaluate(([dn,zn,MODE])=>{const g=window.__game,T=g.THREE,P=g.player;const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#yard{display:none!important}';document.head.appendChild(st);
  const D=g.fighters.find(f=>f.dummy&&f.alive&&!f.ragdoll);window.__D=D;const [dx,dz]={front:[0,-1],back:[0,1],left:[1,0],right:[-1,0]}[dn];
  const fw=new T.Vector3(Math.sin(D.yaw),0,Math.cos(D.yaw)),rt=new T.Vector3(fw.z,0,-fw.x);const dir=new T.Vector3().addScaledVector(fw,dz).addScaledVector(rt,dx).normalize();
  const pt=new T.Vector3();D.bones[zn].getWorldPosition(pt);const imp=dir.clone().multiplyScalar(3.8);
  window.__cam=()=>{const c=D.ragdoll&&D.ragdoll.P.Hips?D.ragdoll.P.Hips:D.pos;const cx=(window.__cx=window.__cx==null?D.pos.x:window.__cx),cz=(window.__cz=window.__cz==null?D.pos.z:window.__cz);window.__dbgCam={p:new T.Vector3(cx+rt.x*3.3+fw.x*.6,1.25,cz+rt.z*3.3+fw.z*.6),t:new T.Vector3(cx-fw.x*.3,.75,cz-fw.z*.3)};};
  window.__kill=()=>{if(MODE==='ko')D.knockdown(2,imp,pt);else{D.die(P,'slain',null);if(D.ragdoll)D.ragdoll.strike(pt,imp,1);}};window.__cam();},[process.env.DIR||'front',process.env.ZONE||'Head',process.env.MODE||'die']);
await fr(2,1/60);await shot(`${OUT}/f000.jpg`,84);await page.evaluate(()=>window.__kill());
for(let i=1;i<NF;i++){await tick(STEP-1,1/60);await page.evaluate(()=>window.__cam());await fr(1,1/60);await shot(`${OUT}/f${String(i).padStart(3,'0')}.jpg`,84);}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();
const fl=fs.readdirSync(OUT).filter(f=>/^f\d+\.jpg$/.test(f)).sort().map(f=>OUT+'/'+f);
fs.writeFileSync(OUT+'/list.txt',fl.join('\n'));
execSync(`python3 - <<'PY'
from PIL import Image,ImageDraw
fs=open('${OUT}/list.txt').read().split()
ims=[Image.open(f) for f in fs];w,h=ims[0].size;cols=${process.env.COLS||10};rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*h))
for i,im in enumerate(ims):
    sh.paste(im,((i%cols)*w,(i//cols)*h));ImageDraw.Draw(sh).text(((i%cols)*w+4,(i//cols)*h+4),'%.2fs'%(i*${STEP}/60),fill=(255,255,0))
sh.save('${OUT}/sheet.jpg',quality=85)
PY`);process.exit(0);
