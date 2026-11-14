import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=2'});
const r=await page.evaluate(async(W)=>{window.__W=W;const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters,I=g.input;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const press=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
  const d=g.DYN.find(d=>d.wep===(window.__W||'candlestand')&&!d.gone)||g.DYN.find(d=>d.wep&&!d.gone);out.push('using '+d.wep+' body '+!!d.body);const p=d.obj.position;press('KeyG');
  for(let t=0;t<200;t++){P.pos.set(p.x,0,p.z-.35);P.yaw=0;if(t>60&&t<120)g.aimMove(0,14);I.lmb=t>40;g.logic(1/60);if(t%25===0){const a=P.fists&&P.fists.R;out.push(t+' gm '+P.grabMode+' R '+(a?a.pos.toArray().map(v=>v.toFixed(2)).join(','):'-')+' grab '+(a&&a.grab&&a.grab.k)+' obj '+[p.x,p.y,p.z].map(v=>v.toFixed(2)).join(',')+' gone '+d.gone+' stoop '+!!P.stoop+' hand '+(P.sword&&P.sword.def.id));}}
  return out.join('\n');},process.env.W||'candlestand');
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
