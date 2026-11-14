import {boot} from './harness.mjs';
// Build 256: hold C to lie flat, the offering box, bread, a two-hander on the shoulder with a lantern
const {page,browser,logs}=await boot({render:false,query:'?nohud&offer&bread&ckinds=plain,store,plain'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<120;k++)g.logic(1/60);
  const P=g.player,F=g.fighters,I=g.input,C=g.CRYPT;for(const f of F)if(f!==P)f.pos.set(900,0,900);
  const press=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
  // prone
  I.keys.KeyC=true;for(let k=0;k<45;k++)g.logic(1/60);I.keys.KeyC=false;out.push('hold C: ragdoll '+!!P.ragdoll+' prone '+!!P.prone);
  for(let k=0;k<120;k++)g.logic(1/60);out.push('2 s later still down '+!!P.ragdoll);
  I.keys.KeyC=true;g.logic(1/60);I.keys.KeyC=false;let t=0;for(;t<400&&P.ragdoll;t++)g.logic(1/60);out.push('tap C: up after '+(t/60).toFixed(2)+' s, ragdoll '+!!P.ragdoll+' crouch '+P.crouch);
  // offering
  const O=C.offer;out.push('offer box '+!!O+(O?' at '+O.x.toFixed(1)+','+O.z.toFixed(1):''));
  if(O){const it=g.testLoot('longsword',P.pos.x,P.pos.z);g.pickUp(P,it);for(let k=0;k<10;k++)g.logic(1/60);
    P.pos.set(O.x+Math.sin(O.ry)*1.05,0,O.z+Math.cos(O.ry)*1.05);P.yaw=O.ry+Math.PI;for(let k=0;k<5;k++)g.logic(1/60);
    out.push('prompt: '+g.cryptUse(P,true));const nf=C.finds.length;g.cryptUse(P,false);out.push('after give: sword '+(P.sword&&P.sword.def.id)+' st '+O.st);
    for(let k=0;k<60*16;k++)g.logic(1/60);out.push('16 s: st '+O.st+' finds out '+(C.finds.length-nf)+' '+C.finds.slice(nf).map(q=>q.kind).join(',')+' prompt '+g.cryptUse(P,true));}
  // bread
  const br=C.finds.filter(q=>q.kind==='bread'&&!q.gone);out.push('bread lying '+br.length);
  // shoulder carry
  const L=g.LAMPS.find(l=>!l.f);if(L){const lp=L.g?L.g.position:L.pos;P.pos.set(lp.x+.6,0,lp.z);P.yaw=-Math.PI/2;for(let k=0;k<3;k++)g.logic(1/60);out.push('lamp prompt '+g.cryptUse(P,true));g.cryptUse(P,false);}const it2=g.testLoot('longsword',P.pos.x,P.pos.z);g.pickUp(P,it2);for(let k=0;k<180;k++){g.logic(1/60);g.lampStep(1/60);}{const s=P.sword,sh=P.mainArm==='L'?P.shL:P.shR;out.push('axis '+s.axis.toArray().map(v=>v.toFixed(2))+' H-sh '+[s.H.x-sh.x,s.H.y-sh.y,s.H.z-sh.z].map(v=>v.toFixed(2))+' yaw '+P.yaw.toFixed(2));}out.push('lamp '+!!P.lamp+' calm '+(P.calmW||0).toFixed(2)+' shW '+(P._shW||0).toFixed(2)+' inHand '+(P.lamp&&P.lamp.inHand)+' offOn '+P.offOn);
  return out.join('\n');});
console.log(r);console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
