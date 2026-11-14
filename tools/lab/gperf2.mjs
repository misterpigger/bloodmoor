import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start}=await boot({W:300,HH:200,query:'?nohud',render:false});
await start('yard','colosseum');await tick(60);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);g.scene.updateMatrixWorld(true);g.camera.position.copy(B.pos).add(new T.Vector3(0,1.5,2));
  let t0=performance.now();for(let i=0;i<10;i++)B.model.updateMatrixWorld(true);const umw=(performance.now()-t0)/10;
  const body=B.skins.find(m=>/Body/.test(m.name));t0=performance.now();const v=new T.Vector3();for(let i=0;i<3000;i++)body.getVertexPosition(i,v);const gv=(performance.now()-t0)/3000*1000;
  let n=0;B.model.traverse(()=>n++);
  return {umw:+umw.toFixed(2),usPerVertex:+gv.toFixed(2),nodes:n,verts:body.geometry.attributes.position.count,morphs:Object.keys(body.geometry.morphAttributes||{}).length,mi:(body.morphTargetInfluences||[]).length};});
console.log(JSON.stringify(r));await browser.close();process.exit(0);
