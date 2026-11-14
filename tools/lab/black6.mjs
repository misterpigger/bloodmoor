import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:500,HH:400,query:'?nohud'});
await start('yard','colosseum');await fr(2,1/30);await tick(120);
const names=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.filter(f=>f!==P)[0];window.__B=B;B.dummy=false;B.noSever=false;B.sever('LeftArm',new T.Vector3(1,0,0));const D=g.debris[g.debris.length-1];
  const L=[];B.model.traverse(o=>{if(o.isMesh&&o.visible)L.push(o);});D.clone.traverse(o=>{if(o.isMesh&&o.visible)L.push(o);});D.root.traverse(o=>{if(o.isMesh&&o.visible)L.push(o);});window.__L=L;
  const h=B.headPos||B.chest;const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw));window.__dbgCam={p:h.clone().addScaledVector(fw,1.2),t:h.clone()};return L.map(o=>o.name+(o.isSkinnedMesh?'*':''));});
console.log(names.join(' | '));
const n=Math.min(names.length,10);
for(let i=0;i<n;i++){await page.evaluate(i=>{const L=window.__L;L.forEach((o,k)=>o.visible=k!==i);},i);await tick(1);await fr(2,1/60);await shot('bis/h_'+i+'.jpg',70);}
await browser.close();
import('child_process').then(cp=>{cp.execSync(`python3 -c "
from PIL import Image
im=Image.new('RGB',(1250,600))
for i in range(${n}):im.paste(Image.open('bis/h_%d.jpg'%i).resize((250,200)),((i%5)*250,(i//5)*200))
im.save('bis/h.jpg')"`);process.exit(0);});
