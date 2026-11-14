import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};step(200);
  let C=g.CRYPT,P=g.player;
  const c1=C.plan.cells[1],p=[];const ok=g.navPath(C.start.x,C.start.z,c1.cx,c1.cz,p);log.push({ok,len:p.length,blkS:g.navBlocked(C.start.x,C.start.z),blk1:g.navBlocked(c1.cx,c1.cz),free:[C.start.x,C.start.z,c1.cx,c1.cz]});
  // go down until a floor has a trap, then walk it and climb out
  for(let fl=0;fl<6&&!g.CRYPT.traps.length;fl++){C=g.CRYPT;const h=C.hole;P.hp=100;P.pos.set(h.x+1,0,h.z+1.2);P.vel.set(0,0,0);for(let k=0;k<200;k++){step(1);if(k%20===0)await wait(0);}let vmin=0;for(let k=0;k<400&&(P.ragdoll||k<60);k++){step(1);}log.push({depth:g.CRYPT.depth,hp:Math.round(P.hp),y:+P.pos.y.toFixed(2)});}
  C=g.CRYPT;const t=C.traps[0];if(t){const [x,z]=t.ax?[t.a0-1,t.m]:[t.m,t.a0-1];P.pos.set(x,0,z);P.vel.set(0,0,0);P.yaw=t.ax?Math.PI/2:0;P.hp=100;g.input.keys.KeyW=true;const ys=[];for(let k=0;k<900;k++){step(1);if(k%60===0)ys.push(+P.pos.y.toFixed(2)+(P.ragdoll?'r':''));}g.input.keys.KeyW=false;
    log.push({ys:ys.join(' '),u:+(((t.ax?P.pos.x:P.pos.z)-t.a0)).toFixed(2),hp:Math.round(P.hp)});}
  return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
