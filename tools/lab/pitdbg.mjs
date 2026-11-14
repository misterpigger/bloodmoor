import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,2000));
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,F=g.fighters,PIT=g.PIT;window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  for(const f of F)if(f!==P)f.pos.set(PIT.x+20,0,PIT.z+20);
  const pl=[{x:0,z:0}],c={x:PIT.x+.8,z:PIT.z};P.pos.set(c.x,0,c.z+PIT.bw-.35);P.yaw=0;P.vel.set(0,0,0);for(let k=0;k<5;k++)g.logic(1/60);const log=[];
  for(let i=0;i<90;i++){g.input.keys.KeyW=true;g.logic(1/60);const R=P.ragdoll;if(!R){log.push(['st',i,+P.pos.y.toFixed(2),+P.pos.z.toFixed(2),P.fallT!=null,P.vy]);continue;}const s=R.P.Spine2;const L=g.findLedge(s.x,s.z,s.y+.1,s.y+1.1);log.push([i,+s.y.toFixed(2),+(s.y-R.Q.Spine2.y).toFixed(3),L?[+L.y.toFixed(2),+L.sc.toFixed(2)]:null,g.groundY(s.x,s.z-.4,s.y+1.2).toFixed(2),g.groundY(s.x,s.z,s.y-.2).toFixed(2),P.input,(window.__game.input.keys.KeyG),!!P.hang,P.pitT!=null]);}
  return {pl0:[pl[0].x,pl[0].z],c:[c.x,c.z],log};});
console.log(JSON.stringify(r.pl0),JSON.stringify(r.c));for(const l of r.log)console.log(JSON.stringify(l));await browser.close();process.exit(0);
