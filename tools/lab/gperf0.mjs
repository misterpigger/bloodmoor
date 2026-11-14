import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start}=await boot({W:300,HH:200,query:'?nohud',render:false});
await start('yard','colosseum');await tick(60);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);g.scene.updateMatrixWorld(true);g.camera.position.copy(B.pos).add(new T.Vector3(0,1.5,2));
  const fw=new T.Vector3(Math.sin(B.yaw),0,Math.cos(B.yaw)),rt=new T.Vector3(fw.z,0,-fw.x);const out={};window.__noGash=1;
  for(const [nm,ci] of [['warm',2],['torso',2],['chest',3],['arm',7],['leg',10],['torso2',2]]){const c=B.caps[ci];if(!c)continue;let t=0,n=0,gash=0;for(let i=0;i<12;i++){const m=c.a.clone().lerp(c.b,.2+.05*i).addScaledVector(fw,.3).addScaledVector(rt,(i%3-1)*.05);const t0=performance.now();window.__addWound(B,ci,m,new T.Vector3(Math.cos(i),Math.sin(i),0),14+i,'cut');t+=performance.now()-t0;n++;}
    out[nm+':'+c.zone]=+(t/n).toFixed(2);}
  out.wounds=B.wounds.length;out.gashes=B.bloodSrc.filter(b=>b.gd).length;return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
