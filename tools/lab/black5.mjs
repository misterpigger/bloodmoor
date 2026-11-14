import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:500,HH:400,query:'?nohud'});
await start('yard','colosseum');await fr(2,1/30);await tick(120);
const modes=['trunc','u16','noLeftArm','x'];
for(let i=0;i<modes.length;i++){const mode=modes[i];
await page.evaluate(([mode,i])=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.filter(f=>f!==P)[i%3];let body;B.model.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))body=o;});const g0=body.geometry;let q;
  if(mode==='deep')q=g0.clone();else{q=new T.BufferGeometry();for(const a in g0.attributes)q.setAttribute(a,g0.attributes[a]);if(mode!=='shallowNoMorph'){q.morphAttributes=g0.morphAttributes;q.morphTargetsRelative=g0.morphTargetsRelative;}const ia=g0.index.array;window.__it=ia.constructor.name;if(mode==='trunc')q.setIndex(new T.BufferAttribute(ia.slice(0,ia.length-3000),1));else if(mode==='u16')q.setIndex(new T.BufferAttribute(new Uint16Array(ia),1));else if(mode==='noLeftArm'){const sk=body.skeleton.bones,si=g0.attributes.skinIndex,keep=[];for(let t=0;t<ia.length;t+=3){const nm=sk[si.getX(ia[t])].name;if(!/^Left(Arm|ForeArm|Hand)/.test(nm))keep.push(ia[t],ia[t+1],ia[t+2]);}q.setIndex(new T.BufferAttribute(new ia.constructor(keep),1));}else q.setIndex(g0.index);}
  body.geometry=q;const h=B.headPos||B.chest;const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw));window.__dbgCam={p:h.clone().addScaledVector(fw,1.2),t:h.clone()};},[mode,i]);
await tick(3);await fr(3,1/60);await shot('bis/m_'+i+'.jpg',85);}
console.log(await page.evaluate(()=>window.__it),logs.slice(0,5).join('\n'));await browser.close();
import('child_process').then(cp=>{cp.execSync(`python3 -c "
from PIL import Image
im=Image.new('RGB',(2000,400))
for i in range(4):im.paste(Image.open('bis/m_%d.jpg'%i),(i*500,0))
im.save('bis/m.jpg')"`);process.exit(0);});
