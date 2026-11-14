import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&ctraps=pit&ckinds=pit,pit'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const C=g.CRYPT,P=g.player,F=g.fighters;for(const f of F)if(f!==P)f.pos.set(900,0,900);out.push('traps '+C.traps.filter(t=>t.deep).length+' pits '+C.pits.length);
  const run=(n,keys)=>{for(let k=0;k<n;k++){Object.assign(g.input.keys,keys);g.logic(1/60);}};
  const reset=()=>{P.hp=100;P.stamina=100;};
  // walk onto the trap
  for(const t of C.traps.filter(t=>t.deep).slice(0,3)){reset();if(P.ragdoll){P.ragdoll=null;P.knocked=0;}P.hang=null;const at=(u,w)=>t.ax?[t.a0+u,t.m+w]:[t.m+w,t.a0+u];let [x,z]=at(-1.2,0);P.pos.set(x,0,z);P.vel.set(0,0,0);P.yaw=t.ax?Math.PI/2:0;let tl='';for(let k=0;k<60*9;k++){P.yaw=t.ax?Math.PI/2:0;g.input.keys.KeyW=k<140&&!P.hang;g.logic(1/60);if(k%45===44)tl+=(P.hang?'H':P.ragdoll?'R':'u')+P.pos.y.toFixed(1)+(P.alive?'':'x')+' ';if(P.hang&&k>200)g.input.keys.KeyW=true;}
    out.push('trap walk: open '+t.open+' alive '+P.alive+' hp '+P.hp.toFixed(0)+' hang '+!!P.hang+' cause '+(P.deathCause||'')+' | '+tl);g.input.keys.KeyW=false;}
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
