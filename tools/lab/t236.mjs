import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2000));
const out=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,res={blades:C.blades.length,tomb:!!C.tomb};const step=n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);}};
  for(const f of g.fighters.slice())if(f!==P&&!(f.ai.mind&&f.ai.mind.grp)){f.dispose();g.fighters.splice(g.fighters.indexOf(f),1);}
  const b=C.blades[0];if(b){const put=()=>{if(b.ax)P.pos.set(b.u0,0,b.m);else P.pos.set(b.m,0,b.u0);P.vel.set(0,0,0);};
    {P.hp=100;P.crouch=true;for(let i=0;i<300;i++){put();P.crouch=true;g.input.keys.KeyC=true;step(1);if(i%30==0)await 0;}res.crouch={hp:Math.round(P.hp)};P.crouch=false;g.input.keys.KeyC=false;}
    put();P.hp=100;let hits=0,h0=100;for(let i=0;i<300;i++){if(!P.ragdoll)put();step(1);if(P.hp<h0-1){hits++;h0=P.hp;}if(i%30==0)await 0;}res.stand={hp:Math.round(P.hp),hits,alive:P.alive};
}
  const G=C.tomb;if(G&&P.alive){P.hp=100;res.guards=G.grp.length;res.m0=G.grp.map(f=>f.ai.mind.mood);P.pos.set(G.sword[0]+.6,0,G.sword[1]);step(60);res.m1=G.grp.map(f=>f.ai.mind.mood);if(G.item){g.pickUp(P,G.item);}step(120);res.m2=G.grp.map(f=>f.ai.mind.mood);res.has=P.sword&&P.sword.def.id;}
  return res;});
console.log(JSON.stringify(out));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
