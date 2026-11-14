import {boot} from './harness.mjs';
const {browser,page,logs,tick,start}=await boot({W:320,HH:200,query:'?nohud',render:false});
await start('yard','colosseum');await tick(120);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.filter(f=>f!==P)[0];let m;B.model.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))m=o;});
 const bones=m.skeleton.bones,out={};for(const [bn,par] of [['LeftHand','LeftForeArm'],['RightLeg','RightUpLeg']]){const bi=bones.indexOf(B.bones[bn]),pi=bones.indexOf(B.bones[par]);out[bn+'n']=[B.bones[bn].name,B.bones[bn].parent.name,B.bones[par].name];
  const M=new T.Matrix4(),p0=new T.Vector3().setFromMatrixPosition(M.copy(m.skeleton.boneInverses[pi]).invert()).applyMatrix4(m.bindMatrixInverse),p1=new T.Vector3().setFromMatrixPosition(M.copy(m.skeleton.boneInverses[bi]).invert()).applyMatrix4(m.bindMatrixInverse);
  const Pp=m.geometry.attributes.position;let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<Pp.count;i+=7){const a=[Pp.getX(i),Pp.getY(i),Pp.getZ(i)];for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],a[k]);mx[k]=Math.max(mx[k],a[k]);}}
  out[bn]={bi,pi,p0:p0.toArray().map(x=>+x.toFixed(3)),p1:p1.toArray().map(x=>+x.toFixed(3)),mn:mn.map(x=>+x.toFixed(2)),mx:mx.map(x=>+x.toFixed(2)),names:bones.filter(b=>/Hand$/.test(b.name)).map(b=>b.name)};}
 return out;});
console.log(JSON.stringify(r));await browser.close();process.exit(0);
