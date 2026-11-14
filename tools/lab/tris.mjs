import {boot} from './harness.mjs';
const RUNS=JSON.parse(process.env.RUNS||'[["team","road"],["raid","arena"],["team","breach"],["br","village"],["duel","pit"]]');
const {browser,page,logs,fr,tick,start}=await boot({W:640,HH:360,query:'?nohud'});
for(const [mode,map] of RUNS){await start(mode,map);await fr(2,1/30);await tick(60,1/60);await new Promise(r=>setTimeout(r,3500));await tick(10,1/60);
  const r=await page.evaluate(()=>{const g=window.__game;g.renderer.info.autoReset=false;g.renderer.info.reset();window.__now=(window.__now||performance.now())+16;window.__inManual=1;window.__frameFn(window.__now);window.__inManual=0;const i=g.renderer.info.render;g.renderer.info.autoReset=true;return [i.triangles,i.calls];});
  console.log(mode,map,'tris',r[0],'calls',r[1]);}
console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
