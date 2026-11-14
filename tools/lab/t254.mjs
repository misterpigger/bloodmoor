import {boot} from './harness.mjs';
// Build 254: G is tap to take hold, tap again to let go (edges, the free hand, open hands)
const {page,browser,logs}=await boot({render:false,query:'?nohud&ctraps=pit&ckinds=pit,pit'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const C=g.CRYPT,P=g.player,F=g.fighters,I=g.input;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const press=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
  const t=C.traps.find(t=>t.deep);
  for(const mode of ['climb','drop']){P.hp=100;P.stamina=100;if(P.ragdoll){P.ragdoll=null;P.knocked=0;}P.hang=null;P.grabMode=false;
    const at=(u,w)=>t.ax?[t.a0+u,t.m+w]:[t.m+w,t.a0+u];let [x,z]=at(-1.2,0);P.pos.set(x,0,z);P.vel.set(0,0,0);press('KeyG');let tl='',hung=0,dropped=0;
    for(let k=0;k<60*9;k++){P.yaw=t.ax?Math.PI/2:0;I.keys.KeyW=k<140&&!P.hang&&!P.ragdoll;I.keys.KeyG=false;
      if(P.hang){hung++;if(mode==='climb'&&hung>60)I.keys.KeyW=true;if(mode==='drop'&&hung===90){out.push(' before '+P.grabMode);press('KeyG');out.push(' after '+P.grabMode+' climb '+P.hang.climb);dropped=1;}}
      g.logic(1/60);if(k%60===59)tl+=(P.hang?'H':P.ragdoll?'R':'u')+P.pos.y.toFixed(1)+(P.alive?'':'x')+' ';}
    out.push(mode+': hung '+hung+' frames, alive '+P.alive+' y '+P.pos.y.toFixed(2)+' gm '+P.grabMode+' | '+tl);if(!P.alive)break;}
  return out.join('\n');});
console.log(r);
const {page:p2,browser:b2,logs:l2}=await boot({render:false,query:'?nohud&cdepth=2'});
const r2=await p2.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters,I=g.input;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const press=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
  const tryG=(id,armed)=>{const d=g.DYN.find(d=>d.wep===id&&!d.gone)||g.DYN.find(d=>d.wep&&!d.gone&&d.wep!=='candlestand');if(!d){out.push('no '+id);return;}const p=d.obj.position;const q={x:P.pos.x,z:P.pos.z+.3};d.body.setTranslation({x:q.x,y:.08,z:q.z},true);d.body.setLinvel({x:0,y:0,z:0},true);p.set(q.x,.08,q.z);const px=P.pos.x,pz=P.pos.z;
    P.yaw=0;for(let k=0;k<30;k++)g.logic(1/60);press('KeyG');
    let t=0;for(;t<240&&!d.gone;t++){P.pos.set(px,0,pz);P.yaw=0;if(armed)P.pitch=-.9;if(t>10&&t<60)g.aimMove(0,14);I.keys.KeyG=false;I.lmb=!armed;g.logic(1/60);if(t%40==0){const a=armed?P.offG:P.fists&&P.fists.R;out.push(' t'+t+' hand '+(a&&a.pos?a.pos.toArray().map(v=>v.toFixed(2)):'-')+' open '+(a&&a.open)+' held '+(a&&a.held)+' w '+(a&&a.w)+' item '+p.toArray().map(v=>v.toFixed(2))+' P '+P.pos.toArray().map(v=>v.toFixed(2))+' sw '+(P.sword&&P.sword.def.id));}}I.lmb=false;
    out.push(d.wep+(armed?' (armed, tap G)':' (fists, tap G + LMB)')+': took '+d.gone+' after '+t+' frames, hand '+(P.sword&&P.sword.def.id)+' gTog '+P.gTog+' gm '+P.grabMode);};
  tryG('rock',false);P.grabMode=false;P.gTog=false;for(let k=0;k<10;k++)g.logic(1/60);
  {const it=g.testLoot('knife',P.pos.x,P.pos.z);g.pickUp(P,it);for(let k=0;k<20;k++)g.logic(1/60);}tryG('skull',true);
  P.gTog=false;press('KeyG');let on=P.gTog;for(let k=0;k<200;k++){P.pos.set(900,0,800);g.logic(1/60);}out.push('free hand out with nothing: on '+on+', after 3.3 s '+P.gTog);
  return out.join('\n');});
console.log(r2);console.log([...logs,...l2].slice(0,6).join('\n')||'no errors');await browser.close();await b2.close();process.exit(0);
