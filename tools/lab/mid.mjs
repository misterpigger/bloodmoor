import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:600,HH:480,query:'?nohud'});
await start('yard','colosseum');await fr(2,1/30);await tick(120);
const cuts=[['LeftHand',.5],['RightForeArm',.5],['RightLeg',.55]];
for(let i=0;i<3;i++){await page.evaluate(([i,c])=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.filter(f=>f!==P)[i];B.dummy=false;B.noSever=false;window.__B=B;
  const st=document.createElement('style');st.textContent='#hud,#prompt,#topc,#grip,#banner,#yard,.yard{display:none!important}';document.head.appendChild(st);
  B.sever(c[0],new T.Vector3(.6,0,.2),c[1]);},[i,cuts[i]]);
 await tick(8);await page.evaluate((bn)=>{const g=window.__game,T=g.THREE,B=window.__B;const par=B.bones[bn].parent;const p=new T.Vector3().setFromMatrixPosition(par.matrixWorld);const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw));window.__dbgCam={p:p.clone().addScaledVector(fw,1.3).add(new T.Vector3(.5,.1,0)),t:p.clone().add(new T.Vector3(0,-.1,0))};},cuts[i][0]);
 await fr(2,1/60);await shot('bis/mid'+i+'a.jpg',88);
 await tick(420);await page.evaluate(()=>{const g=window.__game,T=g.THREE;const D=g.debris[g.debris.length-1];const p=D.rag.P[D.rag.names[0]];window.__dbgCam={p:p.clone().add(new T.Vector3(.45,.5,.45)),t:p.clone()};});await fr(2,1/60);await shot('bis/mid'+i+'b.jpg',88);}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();
import('child_process').then(cp=>{cp.execSync(`python3 -c "
from PIL import Image
im=Image.new('RGB',(1800,960))
for i in range(3):
  im.paste(Image.open('bis/mid%da.jpg'%i),(i*600,0));im.paste(Image.open('bis/mid%db.jpg'%i),(i*600,480))
im.resize((1500,800)).save('bis/mid.jpg')"`);process.exit(0);});
