// how much of their time do bots spend stalled (wanting to be somewhere else, not moving)? and where
import {boot} from './harness.mjs';
const RUNS=JSON.parse(process.env.RUNS||'[["br","village"]]'),SECS=+(process.env.SECS||90);
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const cdp=await page.context().newCDPSession(page);
for(const [mode,map] of RUNS){
  await page.evaluate(tn=>{const b=document.querySelector(`.tn[data-tn="${tn}"]`);if(b)b.click();},process.env.TN||'4');
  await start(mode,map,{pause:true});
  await page.evaluate(async()=>{const g=window.__game;window.__nav={tot:0,stall:0,spots:{},per:{},t:0,far:0,farStall:0};for(let i=0;i<300&&!g.PRW;i++){await new Promise(r=>setTimeout(r,30));g.logic(1/60);}});
  for(let c=0;c<SECS;c+=10){await page.evaluate(()=>{const g=window.__game,N=window.__nav;
    for(let k=0;k<600;k++){g.logic(1/60);N.t+=1/60;if(g.player&&g.player.alive)g.player.hp=Math.max(g.player.hp,80);
      if(k%60===0)for(const f of g.fighters){if(f.isPlayer||!f.alive||f.ragdoll||f.downed||!f.ai||f.dummy)continue;const tg=f.ai.target;const P=N.per[f.id]||(N.per[f.id]={x:f.pos.x,z:f.pos.z});
        const moved=Math.hypot(f.pos.x-P.x,f.pos.z-P.z);P.x=f.pos.x;P.z=f.pos.z;const d=tg&&tg.alive?Math.hypot(tg.pos.x-f.pos.x,tg.pos.z-f.pos.z):99;
        if(N.t<5)continue;N.tot++;const wantsMove=(tg&&tg.alive&&d>5)||(!tg);if(wantsMove){N.far++;if(moved<.35&&!f.climb&&!f.cartHold&&!f.wheelHold&&!f.ladCarry){N.farStall++;const key=Math.round(f.pos.x/2)*2+','+Math.round(f.pos.z/2)*2;N.spots[key]=(N.spots[key]||0)+1;}}}}});await cdp.send('HeapProfiler.collectGarbage');}
  const r=await page.evaluate(()=>{const N=window.__nav;return {tot:N.tot,far:N.far,farStall:N.farStall,spots:Object.entries(N.spots).sort((a,b)=>b[1]-a[1]).slice(0,8)};});
  console.log(`${mode}@${map}: bot-seconds ${r.tot}, wanting to travel ${r.far}, of those stalled ${r.farStall} (${(r.farStall/Math.max(1,r.far)*100).toFixed(1)}%)  spots ${JSON.stringify(r.spots)}`);
}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
