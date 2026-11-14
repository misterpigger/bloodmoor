import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2000));
const out=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,res={kinds:C.plan.cells.map(c=>c.kind||c.type),roofs:C.plan.cells.map(c=>c.roof||'-'),finds:C.finds.length,n:g.fighters.length,moods:g.fighters.filter(f=>f.ai&&f.ai.mind).map(f=>f.ai.mind.mood+(f.ai.mind.dark?'D':''))};
  const c=C.plan.cells.find(c=>c.kind==='shrine'||c.kind==='larder')||C.plan.cells[1];P.pos.set(c.cx+c.hx-.8,0,c.cz+c.hz-.8);g.input.keys.KeyW=false;let nan=0,taken=0;
  for(let i=0;i<1200;i++){g.scene.updateMatrixWorld(true);P.hp=100;g.logic(1/60);if(i===300){for(const q of C.finds){if(q.gone)continue;P.pos.set(q.x+.3,0,q.z);g.logic(1/60);P.yaw=Math.atan2(q.x-P.pos.x,q.z-P.pos.z);const pr=g.cryptUse(P,true);if(pr&&pr.startsWith('Take')){g.cryptUse(P);taken++;}}}
    for(const f of g.fighters)if(!Number.isFinite(f.pos.x+f.pos.z+f.hp))nan++;if(i%50===0)await 0;}
  res.nan=nan;res.taken=taken;res.coin=g.RUN.coin;res.moods2=g.fighters.filter(f=>f.ai&&f.ai.mind).map(f=>f.ai.mind.mood+(f.alive?'':'x'));return res;});
console.log(JSON.stringify(out));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
