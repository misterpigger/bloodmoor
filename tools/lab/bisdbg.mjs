import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start}=await boot({W:320,HH:200,query:'?nohud',render:false});
await start('duel','colosseum');await tick(240);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);for(let i=0;i<10;i++)g.logic(1/60);
  const before=[];B.model.traverse(o=>{if(o.isSkinnedMesh)before.push([o.name,o.geometry.index?o.geometry.index.count:-1,o.visible,o.geometry.groups.length,o.parent&&o.parent.type]);});
  B.bisect(new T.Vector3(2.2,0,.3));const D=g.debris[g.debris.length-1];const out=[];const A=[];B.model.traverse(o=>{if(o.isSkinnedMesh)A.push(o);});const C=[];D.clone.traverse(o=>{if(o.isSkinnedMesh)C.push(o);});D.root.traverse(o=>{if(o.isSkinnedMesh)C.push(o);});
  for(let i=0;i<Math.max(A.length,C.length);i++){const a=A[i],c=C[i];out.push([a&&a.name,a&&(a.geometry.index?a.geometry.index.count:-1),a&&a.visible,'|',c&&c.name,c&&(c.geometry.index?c.geometry.index.count:-1),c&&c.visible,c&&!!c.geometry.userData.derived]);}
  return {before,out};});
for(const l of r.before)console.log('B',JSON.stringify(l));for(const l of r.out)console.log(JSON.stringify(l));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
