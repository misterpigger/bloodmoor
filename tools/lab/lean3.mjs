// trunk lean (Hips->Neck, + forward) of fighting bots, by ground speed band, over a 2v2 team battle
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('team',process.env.MAP||'colosseum',{pause:true});
const r=await page.evaluate(async()=>{const g=window.__game,P=g.player;P.isPlayer=false;const bins={still:[],walk:[],run:[],strike:[]};
  for(let k=0;k<200;k++)g.logic(1/60);
  for(let k=0;k<60*40;k++){g.logic(1/60);if(k%3)continue;
    for(const f of g.fighters){if(!f.alive||f.ragdoll||!f.bones)continue;const e=n=>f.bones[n].matrixWorld.elements;const fx=Math.sin(f.yaw),fz=Math.cos(f.yaw);const A=e('Hips'),B=e('Neck');
      const lean=Math.atan2((B[12]-A[12])*fx+(B[14]-A[14])*fz,B[13]-A[13])*57.3;const sp=Math.hypot(f.vel.x,f.vel.z);
      const b=f.commit||(f.ai&&f.ai.phase==='strike')?'strike':sp<.4?'still':sp<2.6?'walk':'run';bins[b].push(lean);}
    if(k%600===0)await new Promise(r=>setTimeout(r,0));}
  const o={};for(const k in bins){const a=bins[k].sort((x,y)=>x-y),q=p=>a.length?+a[Math.floor(p*(a.length-1))].toFixed(1):null;o[k]=[a.length,q(.1),q(.5),q(.9)];}return o;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
