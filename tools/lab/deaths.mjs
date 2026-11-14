// what do bots die of? (hazards vs each other), per map
import {boot} from './harness.mjs';
const RUNS=JSON.parse(process.env.RUNS||'[["team","pit"]]'),SECS=+(process.env.SECS||90);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const cdp=await page.context().newCDPSession(page);
for(const [mode,map] of RUNS){const tot={};
  for(const rep of [0,1]){
  await page.evaluate(tn=>{const b=document.querySelector(`.tn[data-tn="${tn}"]`);if(b)b.click();},process.env.TN||'6');
  await start(mode,map,{pause:true});
  await page.evaluate(async()=>{const g=window.__game;window.__D={};for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}
    for(const f of g.fighters){const od=f.die.bind(f);f.die=(by,cause,a,b)=>{if(f.alive){const k=cause||(by?'slain':'?');window.__D[k]=(window.__D[k]||0)+1;}return od(by,cause,a,b);};}});
  for(let c=0;c<SECS;c+=10){await page.evaluate(()=>{const g=window.__game;for(let k=0;k<600;k++){g.logic(1/60);if(g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,80);}});await cdp.send('HeapProfiler.collectGarbage');}
  const d=await page.evaluate(()=>window.__D);for(const k in d)tot[k]=(tot[k]||0)+d[k];}
  console.log(`${mode}@${map}: ${JSON.stringify(tot)}`);}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
