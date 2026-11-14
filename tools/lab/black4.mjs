import {boot} from './harness.mjs';
const {browser,page,logs,fr,tick,start,shot}=await boot({W:320,HH:200,query:'?nohud',render:false});
await start('yard','colosseum');await tick(120);
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE;const B=g.fighters.filter(f=>f!==P)[0];const out=[];
  B.model.traverse(o=>{if(o.isSkinnedMesh){const m=o.material;out.push([o.name,o.visible,o.geometry.index?o.geometry.index.count:-1,o.geometry.attributes.position.count,m.customProgramCacheKey?String(m.customProgramCacheKey()).slice(0,60):'',Object.keys(o.geometry.attributes).join(' '),Object.keys(o.userData).join(' ')]);}});return out;});
for(const l of r)console.log(JSON.stringify(l));await browser.close();process.exit(0);
