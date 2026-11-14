import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2000));
for(let d=0;d<5;d++){const o=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,R=g.RUN,res={depth:R.depth,gate:!!C.gate,kinds:C.plan.cells.map(c=>c.kind||c.type).join(','),dorm:g.fighters.filter(f=>f.ai&&f.ai.mind&&f.ai.mind.dormant).length,keyman:g.fighters.filter(f=>f.hasKey).length};
  const step=async n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);if(i%30==0)await 0;}};
  await step(90);const z=g.fighters.find(f=>f.ai&&f.ai.mind&&f.ai.mind.dormant===2);if(z&&z.ragdoll){const hp=z.ragdoll.P.Hips;P.pos.set(hp.x+1.3,0,hp.z);await step(260);res.zup=!z.ragdoll;}
  const km=g.fighters.find(f=>f.hasKey);if(km){km.damage(999,P,'x');await step(30);res.key=await (async()=>{const q=C.finds.find(q=>q.kind==='key'&&!q.gone);if(!q)return 'nokey';P.pos.set(q.x+.3,0,q.z);await step(3);P.yaw=Math.atan2(q.x-P.pos.x,q.z-P.pos.z);g.cryptUse(P);return R.keys;})();}
  for(const f of g.fighters.slice())if(f!==P&&f.alive)f.damage(999,null,'x');
  const dn=C.down;if(C.gate){P.pos.set(C.gate.x,0,C.gate.z-.9);P.yaw=0;await step(3);res.gp=g.cryptUse(P,true);g.cryptUse(P);await step(10);res.unlocked=!C.gate.locked;}
  P.hp=100;P.pos.set(dn.x,0,dn.z0-1.2);P.yaw=0;P.vel.set(0,0,0);g.input.keys.KeyW=true;let t=0,y0=0;const d0=R.depth;while(t<600&&g.RUN.depth===d0){await step(1);t++;await new Promise(r=>setTimeout(r,0));}
  res.t=t;res.at=[+P.pos.z.toFixed(1),+P.pos.y.toFixed(2)];await step(150);g.input.keys.KeyW=false;const A=g.CRYPT.arr,c0=g.CRYPT.plan.cells[0];res.newDepth=g.RUN.depth;res.end=[+P.pos.x.toFixed(1),+P.pos.z.toFixed(1),+P.pos.y.toFixed(2)];res.room=[+c0.cx.toFixed(1),+(c0.cz-c0.hz).toFixed(1)];res.hp=Math.round(P.hp);res.alive=P.alive;return res;}).catch(e=>({err:String(e)}));
  console.log(JSON.stringify(o));if(o.err)break;await new Promise(r=>setTimeout(r,800));}
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
