// logic-speed smoke test across modes and maps: page errors, NaN, matrix fast-path mismatches (MXC=1), stuck states
import {boot} from './harness.mjs';
const RUNS=JSON.parse(process.env.RUNS||'[["br","village"],["duel","arena"],["team","tavern"],["team","mill"],["team","ship"],["duel","pit"],["gauntlet","colosseum"],["tourney","colosseum"],["team","breach"],["team","road"],["raid","arena"],["yard","arena"]]'),SECS=+(process.env.SECS||40);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const cdp=await page.context().newCDPSession(page);
if(process.env.MXC)await page.evaluate(()=>{window.__mxCheck=true;});
for(const [mode,map] of RUNS){
  await page.evaluate(tn=>{const b=document.querySelector(`.tn[data-tn="${tn}"]`);if(b)b.click();},process.env.TN||'4');
  await start(mode,map,{pause:true});
  await page.evaluate(async()=>{const g=window.__game;for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}});
  let ms=0,nan=0;
  for(let c=0;c<SECS;c+=10){const r=await page.evaluate((keep)=>{const g=window.__game;let nan=0;const t=performance.now();
    for(let k=0;k<600;k++){g.logic(1/60);if(keep&&g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,60);}
    for(const f of g.fighters){if(!Number.isFinite(f.pos.x+f.pos.y+f.pos.z))nan++;if(f.sword&&!Number.isFinite(f.sword.H.x+f.sword.T.x))nan++;}return {ms:performance.now()-t,nan};},!process.env.MORTAL);ms+=r.ms;nan+=r.nan;await cdp.send('HeapProfiler.collectGarbage');}
  const r=await page.evaluate(()=>{const g=window.__game,eb=document.getElementById('errbox');return {mx:g.mxBad,hud:(g.MODEHUD||[]).join(' | ').slice(0,90),err:eb?eb.textContent.slice(0,300):'',alive:g.fighters.filter(f=>f.alive).length+'/'+g.fighters.length,st:g.state};});
  console.log(`${mode}@${map}: ${Math.round(ms/SECS)} ms/s, alive ${r.alive}, nan ${nan}, mxBad ${r.mx}, ${r.st}, hud ${r.hud}${r.err?' ERRBOX '+r.err:''}`);
  await page.evaluate(()=>{const b=document.getElementById('errbox');if(b)b.remove();});
}
console.log(logs.length?'LOGS:\n'+[...new Set(logs)].slice(0,8).join('\n'):'no page errors');await browser.close();process.exit(0);
