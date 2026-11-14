import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:700,HH:500,query:'?nohud'});
await start('yard','colosseum');await fr(2,1/30);await tick(120);
const cam=`const h=B.headPos||B.chest;const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw));window.__dbgCam={p:h.clone().addScaledVector(fw,1.2),t:h.clone()};`;
for(const mode of ['a','b','c']){
const r=await page.evaluate(([cam,mode])=>{window.__sl=0;const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.filter(f=>f!==P)[mode==='a'?0:mode==='b'?1:2];B.dummy=false;B.noSever=false;let body;B.model.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))body=o;});const g0=body.geometry;
  B.sever('LeftArm',new T.Vector3(1,0,0));const g1=body.geometry;const D=g.debris[g.debris.length-1];const CB=[];D.clone.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))CB.push(o);});D.root.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))CB.push(o);});if(mode==='a'){body.material=new T.MeshStandardMaterial({color:0xcc8866});}if(mode==='b'){const q=g1.clone();q.morphAttributes={};body.geometry=q;body.morphTargetInfluences=undefined;body.morphTargetDictionary=undefined;}if(mode==='c'){body.geometry.computeVertexNormals&&0;window.__n=[g1.attributes.normal===g0.attributes.normal,g1.attributes.normal.count,!!g1.morphAttributes.position,g1.morphTargetsRelative,g0.morphTargetsRelative,Object.keys(g0.morphAttributes).join()];}window.__cb=CB.length;
  
  const U=body.material.userData,bad=[];for(const k of ['U','HU'])for(const n in U[k]||{}){const v=U[k][n].value;const s=JSON.stringify(v);if(s&&/null|NaN/.test(s))bad.push(n);}
  eval(cam);return {n:window.__n,bad,mode,cb:window.__cb,mi:body.morphTargetInfluences&&body.morphTargetInfluences.join(','),cmi:CB[0]&&CB[0].morphTargetInfluences&&CB[0].morphTargetInfluences.join(',')};},[cam,mode]);
console.log(JSON.stringify(r));await tick(5);await fr(3,1/60);await shot('bis/bl_'+mode+'.jpg',90);}
await browser.close();process.exit(0);
