import {boot} from './harness.mjs';
const {browser,page,logs,tick,start}=await boot({W:320,HH:200,query:'?nohud',render:false});
await start('yard','colosseum');await tick(120);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const out=[];const cuts=[['LeftHand',.5],['RightLeg',.55]];
 for(let i=0;i<2;i++){const B=g.fighters.filter(f=>f!==P)[i];B.dummy=false;B.noSever=false;const bn=cuts[i][0],bone=B.bones[bn];B.root.updateMatrixWorld(true);
  const p0=new T.Vector3().setFromMatrixPosition(bone.parent.matrixWorld),p1=new T.Vector3().setFromMatrixPosition(bone.matrixWorld),want=p0.clone().lerp(p1,cuts[i][1]);
  B.sever(bn,new T.Vector3(0,0,0),cuts[i][1]);const D=g.debris[g.debris.length-1];D.root.updateMatrixWorld(true);
  let cap=null;for(const o of D.root.children)if(o.userData.cutFace)cap=o;const cw=cap?cap.getWorldPosition(new T.Vector3()):null;
  const ms=[];const L=[];D.clone.traverse(o=>{if(o.isSkinnedMesh)L.push(o);});D.root.traverse(o=>{if(o.isSkinnedMesh)L.push(o);});
  for(const o of L){if(!o.visible)continue;const ix=o.geometry.index;const v=new T.Vector3();let mn=1e9,c=new T.Vector3(),n=0;if(ix&&ix.count){for(let k=0;k<ix.count;k+=Math.max(3,Math.floor(ix.count/60/3)*3)){o.getVertexPosition(ix.getX(k),v);v.applyMatrix4(o.matrixWorld);c.add(v);n++;}c.multiplyScalar(1/n);}ms.push([o.name,ix?ix.count:-1,n?+c.distanceTo(p1).toFixed(2):null,o.parent&&o.parent.type,o.parent===g.scene]);}
  out.push({bn,capErr:cw?+cw.distanceTo(want).toFixed(3):null,rootErr:+D.root.getWorldPosition(new T.Vector3()).distanceTo(p1).toFixed(3),ms});}
 return out;});
console.log(JSON.stringify(r,null,0));console.log(logs.slice(0,4).join('\n'));await browser.close();process.exit(0);
