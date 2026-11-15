// lists the meshes of a candidate model (assets/models/<ID>.glb) with their bounds after the model is stood up and scaled to H metres
import {boot} from './harness.mjs';
const {browser,page,start,fr}=await boot({W:640,HH:360,query:'?nohud',render:false});
await start('duel','arena');await fr(2,1/30);
const r=await page.evaluate(async([id,H])=>{const g=window.__game,T=g.THREE;const sc=await g.mdl(id);sc.updateMatrixWorld(true);
  const bb=new T.Box3().setFromObject(sc),s=H/(bb.max.y-bb.min.y),c=bb.getCenter(new T.Vector3());const out=[];
  sc.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);const f=v=>[(v.x-c.x)*s,(v.y-bb.min.y)*s,(v.z-c.z)*s].map(x=>+x.toFixed(3));
    out.push({n:o.name,p:o.parent&&o.parent.name,tri:(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3|0,min:f(b.min),max:f(b.max),mat:o.material.name});});
  return {size:[bb.max.x-bb.min.x,bb.max.y-bb.min.y,bb.max.z-bb.min.z],out};},[process.env.ID,+(process.env.H||1.8)]);
console.log(JSON.stringify(r.size));for(const m of r.out)console.log(m.n.padEnd(28),String(m.p).slice(0,26).padEnd(27),String(m.tri).padStart(6),JSON.stringify(m.min),JSON.stringify(m.max));
await browser.close();process.exit(0);
