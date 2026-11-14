import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('duel','arena',{pause:true});
const out=await page.evaluate(async()=>{const g=window.__game,T=g.THREE,P=g.player;for(let i=0;i<120;i++)g.logic(1/60);for(const sl of ["head","body","arms","legs"])P.unequip(sl);P.equip(g.ARMOR.brigandine);for(let i=0;i<30;i++)g.logic(1/60);
  P.model.updateMatrixWorld(true);const R=[];P.model.traverse(o=>{if(!o.isSkinnedMesh||o.name!=='MH_Armor')return;const G=o.geometry,p=G.attributes.position,si=G.attributes.skinIndex,sw=G.attributes.skinWeight;let ymin=9;for(let i=0;i<p.count;i++)ymin=Math.min(ymin,p.getY(i));
    // posed: lowest 12 vertices relative to the hips bone
    const hips=new T.Vector3();P.bones.Hips.getWorldPosition(hips);const v=new T.Vector3(),L=[];for(let i=0;i<p.count;i++){o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld);L.push([v.y-hips.y,i]);}L.sort((a,b)=>a[0]-b[0]);
    const names=o.skeleton.bones.map(b=>b.name.replace('mixamorig',''));
    R.push({n:p.count,bindYmin:+ymin.toFixed(3),aLoose:!!G.attributes.aLoose,low:L.slice(0,6).map(([dy,i])=>({dy:+dy.toFixed(3),bind:[+p.getX(i).toFixed(3),+p.getY(i).toFixed(3),+p.getZ(i).toFixed(3)],w:[0,1,2,3].map(k=>names[si.getComponent(i,k)]+':'+sw.getComponent(i,k).toFixed(2)).join(' '),loose:G.attributes.aLoose?+G.attributes.aLoose.getX(i).toFixed(2):null})),p50:+L[Math.floor(L.length*.05)][0].toFixed(3)});});
  return R;});
for(const r of out)console.log(r.n,r.bindYmin,r.aLoose,r.p50,JSON.stringify(r.low.map(l=>[l.dy,l.bind,l.loose,l.w])));await browser.close();process.exit(0);
