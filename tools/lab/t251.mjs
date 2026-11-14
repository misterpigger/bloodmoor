import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=2'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters,I=g.input;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const press=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
  const tryG=(id,armed)=>{const d=g.DYN.find(d=>d.wep===id&&!d.gone);if(!d){out.push('no '+id);return;}const p=d.obj.position;
    // E must no longer take it
    P.pos.set(p.x,0,p.z-.75);P.yaw=0;P.vel.set(0,0,0);for(let k=0;k<5;k++)g.logic(1/60);press('KeyE');for(let k=0;k<10;k++)g.logic(1/60);const eTook=d.gone;
    let t=0;for(;t<240&&!d.gone;t++){P.pos.set(p.x,0,p.z-.62);P.yaw=0;I.locked=false;I.mx=.5;I.my=.85;I.keys.KeyG=true;if(!armed&&!P.grabMode&&t===1)press('KeyG');g.logic(1/60);}
    I.keys.KeyG=false;out.push(id+(armed?' (armed, hold G)':' (fists, open hands)')+': E took '+eTook+', grab took '+d.gone+' after '+t+' frames, hand '+(P.sword&&P.sword.def.id)+' belt '+(P.belt&&P.belt.def.id)+' hip '+(P.hip2&&P.hip2.def.id)+' back '+(P.back&&P.back.def.id));};
  tryG('rock',false);
  if(P.grabMode)press('KeyG');for(let k=0;k<10;k++)g.logic(1/60);
  tryG('skull',true);tryG('candlestand',true);
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
