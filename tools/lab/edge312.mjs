// the Pit's bridge edge: (1) the player stands at a set distance from the bridge's middle line (sideways) and we see whether he
// falls; (2) he edges off at walking pace and then steps straight back; (3) a body knocked down lying across the edge. env Q
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('duel','pit',{pause:true});
const r=await page.evaluate(()=>{const g=window.__game,P=g.player,T=g.THREE,input=g.input,PIT=g.PIT||window.__PIT;const out={};
  for(const f of g.fighters)if(f!==P){f.pos.set(9,0,9);f.ai&&(f.ai.cd=99);}
  const reset=(x,z)=>{if(P.ragdoll){P.ragdoll=null;}P.alive=true;P.hp=100;P.knocked=0;P.fallT=null;P.hang=null;P.pos.set(x,0,z);P.vel.set(0,0,0);P.vy=0;P.yaw=Math.PI/2;for(const k in input.keys)input.keys[k]=false;};
  for(let k=0;k<200;k++)g.logic(1/60);
  // (1) standing still at offsets
  out.stand=[];for(const o of [.5,.62,.7,.78,.85,.95]){reset(.3,o);let fell=0;for(let k=0;k<90;k++){g.logic(1/60);if(P.ragdoll||P.pos.y<-.2){fell=1;break;}}out.stand.push([o,fell]);}
  // (2) edge off sideways slowly then step back
  out.edge=[];for(const t of [.12,.25,.4]){reset(.3,.45);for(let k=0;k<40;k++)g.logic(1/60);P.yaw=Math.PI/2;let fell=0;input.keys.KeyA=true;let n=0;for(;n<240;n++){g.logic(1/60);if(Math.abs(P.pos.z)>.8)break;}input.keys.KeyA=false;
    for(let k=0;k<Math.round(t*60);k++)g.logic(1/60);input.keys.KeyD=true;for(let k=0;k<60;k++){g.logic(1/60);if(P.ragdoll){fell=1;break;}}input.keys.KeyD=false;for(let k=0;k<60;k++)g.logic(1/60);out.edge.push([t,n,+P.pos.z.toFixed(2),fell||(P.ragdoll?1:0),P.alive?1:0]);}
  // (3) knocked down lying across the edge, chest on the bridge
  out.down=[];for(const o of [.45,.6,.72]){reset(.3,o);for(let k=0;k<40;k++){P.pos.set(.3,0,o);P.vel.set(0,0,0);g.logic(1/60);}P.knockdown(2.5,new T.Vector3(0,0,1.2),P.chest.clone());let mn=0,dead=0;for(let k=0;k<300;k++){g.logic(1/60);if(!P.alive){dead=1;break;}const R=P.ragdoll;if(R&&R.P.Hips)mn=Math.min(mn,R.P.Hips.y);}out.down.push([o,+mn.toFixed(2),dead,P.alive&&P.ragdoll?'down':P.alive?'up':'dead']);}
  return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
