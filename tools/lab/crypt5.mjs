import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};step(200);
  let C=g.CRYPT,P=g.player;const desc=()=>({depth:C.depth,cells:C.plan.cells.map(c=>(c.kind||c.type).slice(0,4)+c.links.length).join(' '),traps:C.traps.length,pits:C.pits.length,notes:C.notes.map(n=>n.i).join(','),hole:!!C.hole,shaftIn:!!C.shaftIn,fighters:g.fighters.length,barred:C.doors.filter(d=>d.bar).length});
  log.push(desc());
  // reach
  log.push({reach:C.plan.cells.map(c=>{const p=[];const ok=g.navPath(C.start.x,C.start.z,c.cx+(c.type==='exit'?4.4:c.kind==='pit'?2.2:0),c.cz+(c.type==='exit'?0:c.kind==='pit'?-2.2:0),p);return (c.leaf?'L':'')+(ok?'y':'N');}).join(' ')});
  // belt
  const it=g.loot.find(l=>l.kind==='weapon');if(it){g.pickUp(P,it);step(30);const id=P.sword.def.id;P.beltKey();step(30);const a=[id,!!P.belt,P.sword&&P.sword.def.id];P.beltKey();step(40);const hb=new g.THREE.Vector3();P.bones.RightHand.getWorldPosition(hb);log.push({belt:a,drawn:P.sword&&P.sword.def.id,belt2:!!P.belt,gap:+hb.distanceTo(P.sword.H).toFixed(2)});}
  // read the note
  if(C.notes[0]){const n=C.notes[0];P.pos.set(n.x+.5,0,n.z);log.push({probe:g.cryptUse(P,true)});g.cryptUse(P);log.push({lore:document.querySelector('#lore p').textContent.slice(0,50),on:document.getElementById('lore').classList.contains('on')});}
  // a trap: walk over it
  for(let fl=0;fl<5;fl++){
    C=g.CRYPT;const t=C.traps[0];
    if(t){const [x,z]=t.ax?[t.a0-1,t.m]:[t.m,t.a0-1];P.pos.set(x,0,z);P.vel.set(0,0,0);P.yaw=t.ax?Math.PI/2:0;P.hp=100;g.input.keys.KeyW=true;let minY=0,hp0=P.hp;for(let k=0;k<240;k++){step(1);minY=Math.min(minY,P.pos.y);}g.input.keys.KeyW=false;step(60);
      log.push({trap:t.open,minY:+minY.toFixed(2),hpLost:Math.round(hp0-P.hp),outY:+P.pos.y.toFixed(2),rag:!!P.ragdoll,alive:P.alive});P.hp=100;if(P.ragdoll){for(let k=0;k<400&&P.ragdoll;k++)step(1);}}
    // the hole: walk in from the east (open side)
    const h=C.hole;P.hp=100;P.bleeds=[];P.pos.set(h.x+3.2,0,h.z+1.2);P.vel.set(0,0,0);P.yaw=-Math.PI/2-0.35;g.input.keys.KeyW=true;let sw=-1,ys=[];for(let k=0;k<400;k++){step(1);if(g.CRYPT!==C&&sw<0){sw=k;}if(sw<0&&k%10===0)ys.push(+P.pos.y.toFixed(1));await (k%20===0?wait(0):0);if(sw>=0&&k>sw+150)break;}
    g.input.keys.KeyW=false;step(200);C=g.CRYPT;
    log.push({fellAt:sw,ys:ys.slice(-6).join(','),...desc(),atStart:+Math.hypot(P.pos.x-C.start.x,P.pos.z-C.start.z).toFixed(2),y:+P.pos.y.toFixed(2),hp:Math.round(P.hp),alive:P.alive,rag:!!P.ragdoll,nan:!Number.isFinite(P.pos.x+P.pos.y+(P.sword?P.sword.H.x:0)),hud:g.MODEHUD[0]});
    if(!P.alive)break;for(let k=0;k<500&&P.ragdoll;k++)step(1);}
  return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
