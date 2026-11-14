import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,2000));
const r=await page.evaluate(()=>{const g=window.__game,PIT=g.PIT;window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);
  const pl=g.PROPS.filter(p=>p.kind==='plank'&&!p.broken);const mid=pl.slice().sort((a,b)=>Math.hypot(a.x-PIT.x,a.z-PIT.z)-Math.hypot(b.x-PIT.x,b.z-PIT.z)).slice(0,6);for(const p of mid)g.propBreak(p);
  return {PIT:[PIT.x,PIT.z,PIT.r,PIT.d,PIT.bw,PIT.p0,!!PIT.planks,PIT.down],mid:mid.map(p=>[+p.x.toFixed(2),+p.z.toFixed(2),p.broken]),planks:PIT.planks?PIT.planks.map(p=>p&&p.broken?1:0).join(''):null,g:[g.groundY(0,0,1),g.groundY(.2,0,1),g.groundY(1.5,0,1),g.groundY(0,0,-.5)]};});
console.log(JSON.stringify(r));await browser.close();process.exit(0);
