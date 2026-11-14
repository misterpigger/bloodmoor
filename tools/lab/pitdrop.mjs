import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:300,HH:200,render:false,query:'?nohud'});
await start('team','pit');await new Promise(r=>setTimeout(r,2500));
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,F=g.fighters,PIT=g.PIT,T=g.THREE;window.__pause=true;for(let k=0;k<260;k++)g.logic(1/60);
  P.pos.set(PIT.x+20,0,PIT.z+20);const bots=F.filter(f=>f!==P).slice(0,6);const out=[];
  bots.forEach((f,i)=>{f.ai.skill=0;f.pos.set(PIT.x-1.5+i*.6,0,PIT.z+(i%2?1:-1)*(PIT.bw+(-.25+i*.09)));f.vel.set(0,0,0);f.yaw=i;f.knockdown(4,new T.Vector3((i%3-1)*1.5,0,(i%2?-1:1)*2.2),f.chest.clone());});
  const st=bots.map(()=>({vmax:0,through:0,low:9}));
  for(let i=0;i<360;i++){for(const f of F){if(!bots.includes(f)&&f!==P)f.pos.set(PIT.x+25,0,PIT.z+25);}g.logic(1/60);bots.forEach((f,k)=>{const R=f.ragdoll;if(!R)return;const S=st[k];for(const n of R.names){const p=R.P[n],q=R.Q[n];const v=p.distanceTo(q)*240;if(v>S.vmax)S.vmax=v;if(Math.abs(p.z-PIT.z)<PIT.bw-.05&&p.y<-.03&&p.y>-.1&&g.groundY(p.x,p.z,.3)>-.02)S.through++;}S.low=Math.min(S.low,R.P.Hips.y);});}
  return bots.map((f,k)=>({alive:f.alive,cause:f.deathCause||null,hipY:f.ragdoll?+f.ragdoll.P.Hips.y.toFixed(2):+f.pos.y.toFixed(2),vmax:+st[k].vmax.toFixed(1),inBoards:st[k].through}));});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
