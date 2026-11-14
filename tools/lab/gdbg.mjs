import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start}=await boot({W:300,HH:200,query:'?nohud',render:false});
await start('yard','colosseum');await tick(60);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);g.scene.updateMatrixWorld(true);
  const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw)),rt=new T.Vector3(fw.z,0,-fw.x);const bl=B.caps[2],m2=bl.a.clone().lerp(bl.b,.55);
  window.__addWound(B,2,m2.clone().addScaledVector(fw,.3),rt.clone(),14,'cut');const w=B.wounds[B.wounds.length-1];w.updateMatrixWorld(true);const p=w.geometry.attributes.position,o=[];const v=new T.Vector3();
  let mn=[9,9,9],mx=[-9,-9,-9];for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(w.matrixWorld).sub(m2);const q=[v.dot(rt),v.y,v.dot(fw)];for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],q[k]);mx[k]=Math.max(mx[k],q[k]);}}
  const row=[];for(let i=11*14;i<12*14;i++){v.fromBufferAttribute(p,i).applyMatrix4(w.matrixWorld).sub(m2);row.push([v.dot(rt),v.y,v.dot(fw)].map(x=>+x.toFixed(3)));}
  return {mn,mx,row,r:bl.r,sc:w.matrixWorld.elements.slice(0,3)};});
console.log(JSON.stringify(r));console.log(logs.slice(0,4).join('\n'));await browser.close();process.exit(0);
