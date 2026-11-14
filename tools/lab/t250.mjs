import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=2'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const ws={};for(const d of g.DYN)if(d.wep&&!d.gone)ws[d.wep]=(ws[d.wep]||0)+1;out.push('tagged '+JSON.stringify(ws));
  const press=()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyE'}));};
  const z=()=>{P.beltKey();};
  const take=id=>{const d=g.DYN.find(d=>d.wep===id&&!d.gone);if(!d){out.push('no '+id);return;}const p=d.obj.position;P.pos.set(p.x,0,p.z-.8);P.yaw=0;P.vel.set(0,0,0);for(let k=0;k<5;k++)g.logic(1/60);press();for(let k=0;k<20;k++)g.logic(1/60);
    out.push('take '+id+' -> hand '+(P.sword&&P.sword.def.id)+' belt '+(P.belt&&P.belt.def.id)+' hip '+(P.hip2&&P.hip2.def.id)+' back '+(P.back&&P.back.def.id)+' gone '+d.gone);};
  take('rock');take('skull');take('candlestand');take('bone');take('rock');
  // swing check: tip speed with the stand
  for(const k of [1,2,3]){z();out.push('Z -> hand '+(P.sword&&P.sword.def.id)+' belt '+(P.belt&&P.belt.def.id)+' hip '+(P.hip2&&P.hip2.def.id)+' back '+(P.back&&P.back.def.id));}
  for(const id of ['candlestand','rock','skull']){const d=g.DYN.find(d=>d.wep===id&&!d.gone);if(!d)continue;if(P.sword&&P.sword.def.kind!=='fist'){const o=P.sword;P.dropSword();o.reset(g.THREE?new g.THREE.Vector3(500,0,500):o.H,o.axis);}P.belt=P.hip2=P.back=null;const p=d.obj.position;P.pos.set(p.x,0,p.z-.8);P.yaw=0;press();for(let k=0;k<20;k++)g.logic(1/60);let mx=0,nan=0;
    for(let k=0;k<240;k++){P.stamina=100;const I=g.input;I.locked=false;I.mx=.5+Math.sin(k*.09)*.42;I.my=.4;I.lmb=true;P.ctrl.z=.46;g.logic(1/60);const v=P.sword._lt?P.sword.T.distanceTo(P.sword._lt)*60:0;P.sword._lt=P.sword.T.clone();if(!isFinite(v))nan++;else mx=Math.max(mx,v);}
    out.push(id+' in hand '+(P.sword&&P.sword.def.id)+' tip max '+mx.toFixed(1)+' nan '+nan);}
  for(let k=0;k<30;k++)g.logic(1/60);const b=P.back||P.belt;if(b)out.push('stowed pose ok '+isFinite(b.H.x)+' dist '+b.H.distanceTo(P.pos).toFixed(2));
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
