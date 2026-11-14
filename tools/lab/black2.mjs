import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:700,HH:500,query:'?nohud'});
await start('yard','colosseum');await fr(2,1/30);await tick(120);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.find(f=>f!==P);window.__B=B;B.dummy=false;B.noSever=false;let body;B.model.traverse(o=>{if(o.isSkinnedMesh&&/^MH_Body/.test(o.name))body=o;});const g0=body.geometry;
  const info={attrs:Object.keys(g0.attributes),morph:Object.keys(g0.morphAttributes),groups:g0.groups.length,dr:[g0.drawRange.start,g0.drawRange.count],mat:Array.isArray(body.material),ud:Object.keys(g0.userData)};
  B.sever('LeftArm',new T.Vector3(1,0,0));const g1=body.geometry;info.after={attrs:Object.keys(g1.attributes),idx:g1.index.count,ud:Object.keys(g1.userData),same:g1===g0};
  info.matUD=Object.keys(body.material.userData||{});info.onBefore=String(body.onBeforeRender).slice(0,200);return info;});
console.log(JSON.stringify(r,null,1));await browser.close();process.exit(0);
