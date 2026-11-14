import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=3&sunk'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const C=g.CRYPT,q=C.sunks[0],P=g.player,F=g.fighters;if(!q)return 'no sunk';
  const G=(lx,lz,y)=>+g.groundY(q.x+lx,q.z+lz,y).toFixed(2);
  out.push('ground: bridge '+G(0,0,0)+' underbridge '+G(0,0,-1.9)+' floor '+G(0,1,0)+' stair top '+G(-q.ix+.2,-(q.iz-.6),0)+' mid '+G(-q.ix+2,-(q.iz-.6),-.8)+' foot '+G(-q.ix+3.9,-(q.iz-.6),-1.8)+' ledge '+G(q.ix+.5,0,0));
  // fall in
  P.pos.set(q.x+1,0,q.z-1.2);P.vel.set(0,0,0);P.hp=100;for(let k=0;k<150;k++)g.logic(1/60);out.push('fell: y '+P.pos.y.toFixed(2)+' hp '+P.hp.toFixed(0)+' rag '+!!P.ragdoll+' xz '+(P.pos.x-q.x).toFixed(2)+','+(P.pos.z-q.z).toFixed(2));
  // bots: one below, player up on the walk
  for(let k=0;k<300&&P.ragdoll;k++)g.logic(1/60);P.hp=100;P.pos.set(q.x+q.ix+.9,0,q.z);P.vel.set(0,0,0);for(let k=0;k<30;k++)g.logic(1/60);
  const B=F.filter(f=>f!==P&&f.alive&&!f.undead).slice(0,2);for(const f of F)if(f!==P&&!B.includes(f)){f.pos.set(q.x+60,0,q.z+60);}
  let i=0;for(const b of B){b.pos.set(q.x-1+i*2,-q.dep,q.z+ (i?-1.2:1));b.vel.set(0,0,0);if(b.ai.mind){b.ai.mind.mood='hostile';b.ai.mind.dormant=0;b.ai.mind.nerve=0;b._hurtAt=1e9;}b.ai.target=P;i++;}
  let up=0,minD=9;for(let t=0;t<14*60;t++){P.hp=100;P.pos.set(q.x+q.ix+.9,0,q.z-1.5);g.logic(1/60);for(const b of B){if(b.pos.y>-.2)up=Math.max(up,1);}if(t%120===0)out.push('t'+(t/60)+' '+B.map(b=>(b.pos.x-q.x).toFixed(1)+','+b.pos.y.toFixed(2)+','+(b.pos.z-q.z).toFixed(1)+(b.ragdoll?'R':'')).join(' | '));}
  out.push('bots up '+B.map(b=>b.pos.y>-.2));
  let nan=0;for(const f of F)if(!isFinite(f.pos.x+f.pos.y+f.pos.z))nan++;out.push('nan '+nan);return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
