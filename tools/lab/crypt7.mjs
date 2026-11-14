import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};step(200);
  let P=g.player;
  for(let fl=0;fl<7;fl++){const C=g.CRYPT;const p=new Float32Array(600);
    const rc=C.plan.cells.map(c=>{const m=g.navPath(C.start.x,C.start.z+1.5,c.cx+(c.type==='exit'?4.4:c.kind==='pit'?2.2:c.kind==='slab'||c.kind==='coffins'?0:0),c.cz+(c.kind==='pit'?-2.2:c.kind==='slab'?1.8:c.kind==='coffins'?2:0),p);const ex=p[(m-1)*2],ez=p[(m-1)*2+1];return (c.kind||c.type).slice(0,3)+(c.leaf?'L':'')+(m&&Math.hypot(ex-c.cx,ez-c.cz)<5?'y':'N');}).join(' ');
    // 25 s of the dwellers on their own: nan, deaths by hazard
    let nan=0;const n0=g.fighters.filter(f=>f.alive).length;P.pos.set(C.start.x,0,C.start.z);for(let s2=0;s2<25;s2++){step(60);P.hp=100;for(const f of g.fighters)if(!Number.isFinite(f.pos.x+f.pos.y+f.pos.z)){nan++;(window.__nn=window.__nn||[]).push([C.depth,s2,f===P,f.alive,!!f.ragdoll,f.sword&&f.sword.def.id,[f.pos.x,f.pos.y,f.pos.z].map(v=>Number.isFinite(v)?+v.toFixed(1):"NaN").join("|")].join(","));}if(s2%5===0)await wait(0);}
    log.push({d:C.depth,rc,barred:C.doors.filter(d=>d.bar).length,nan,alive:n0+'>'+g.fighters.filter(f=>f.alive).length,trapsOpen:C.traps.filter(t=>t.open).length+'/'+C.traps.length});
    const h=C.hole;P.hp=100;P.pos.set(h.x+1,0,h.z+1.2);P.vel.set(0,0,0);for(let k=0;k<200;k++){step(1);if(k%20===0)await wait(0);}for(let k=0;k<400&&(P.ragdoll||k<60);k++)step(1);}
  log.push(window.__nn||[]);return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
