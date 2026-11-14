// logic test of the crypt: start, populate, walk the whole floor, open caskets, descend, leave, die
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);
  g.startGame();window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};step(200);
  const C=g.CRYPT,P=g.player;log.push({hud:g.MODEHUD.slice(),cells:C.plan.cells.map(c=>c.type[0]+c.links.length).join(' '),doors:C.doors.length,barred:C.doors.filter(d=>d.bar).length,caskets:C.caskets.length,spots:C.spots.length,fighters:g.fighters.length,moods:g.fighters.filter(f=>f.ai.mind).map(f=>f.ai.mind.mood[0]+(f.lamp?'L':'')+':'+(f.sword&&f.sword.def.id)).join(' '),lamps:g.LAMPS.length,loot:g.loot.length});
  // take the lantern, the weapon
  P.pos.set(C.lampAt[0]+.6,0,C.lampAt[1]);log.push({probe:g.cryptUse(P,true)});g.cryptUse(P);step(30);log.push({lamp:!!P.lamp,inHand:P.lamp&&P.lamp.inHand});
  const it=g.loot.find(l=>l.kind==='weapon');g.pickUp(P,it);step(60);g.lampStep(1/60);log.push({wep:P.sword&&P.sword.def.id,inHand:P.lamp.inHand,lampY:+P.lamp.g.position.y.toFixed(2),sh:g.LAMP_SH&&+g.LAMP_SH.intensity.toFixed(1)});
  // reach: can every room be walked to from the start (ignoring boarded doors)?
  const reach=C.plan.cells.map(c=>{const p=[];const ok=g.navPath(C.start.x,C.start.z,c.cx+(c.type==='exit'?2.5:0),c.cz+(c.type==='exit'?2:0),p);return (c.leaf?'L':'')+JSON.stringify(ok).slice(0,12)+'/'+p.length;});log.push({reach:reach.join(' ')});
  // let the dwellers live for 20 s with the player idle in his cell
  let nan=0;for(let s=0;s<20;s++){step(60);P.hp=100;for(const f of g.fighters)if(!Number.isFinite(f.pos.x+f.pos.y+f.pos.z))nan++;}
  log.push({alive:P.alive,rag:!!P.ragdoll,nan,moods:g.fighters.filter(f=>f.ai.mind).map(f=>f.ai.mind.mood[0]).join(''),aware:g.fighters.filter(f=>f.ai.mind&&f.ai.mind.aware).length,hp:Math.round(P.hp),moved:g.fighters.filter(f=>f.ai.mind).map(f=>+Math.hypot(f.pos.x-f.ai.mind.home[0],f.pos.z-f.ai.mind.home[1]).toFixed(1)).join(' ')});
  // open every casket
  for(const k of C.caskets){P.pos.set(k.x+Math.sin(k.ry)*.9,0,k.z+Math.cos(k.ry)*.9);P.vel.set(0,0,0);const pr=g.cryptUse(P,true);if(pr==='Open the casket')g.cryptUse(P);step(5);}
  log.push({opened:C.caskets.filter(k=>k.opened).length,hud:g.MODEHUD[1],loot:g.loot.length});
  // down
  P.pos.set(C.stair.x,0,C.stair.z);P.vel.set(0,0,0);log.push({probe:g.cryptUse(P,true)});g.cryptUse(P);await wait(1100);step(120);
  const C2=g.CRYPT;log.push({depth:C2.depth,hud:g.MODEHUD.slice(),fighters:g.fighters.length,atStart:+Math.hypot(P.pos.x-C2.start.x,P.pos.z-C2.start.z).toFixed(2),lamp:!!P.lamp,wep:P.sword&&P.sword.def.id,alive:P.alive,rag:!!P.ragdoll,nan:!Number.isFinite(P.pos.x+(P.sword?P.sword.H.x+P.sword.T.y:0))});
  for(let d=0;d<3;d++){const Cc=g.CRYPT;P.pos.set(Cc.stair.x,0,Cc.stair.z);P.vel.set(0,0,0);P.hp=100;g.cryptUse(P);await wait(1100);step(90);const Cn=g.CRYPT;log.push({depth:Cn.depth,cells:Cn.plan.cells.map(c=>c.type[0]+c.links.length).join(' '),fighters:g.fighters.length,kits:g.fighters.filter(f=>f.ai.mind).map(f=>f.sword&&f.sword.def.id).join(' '),hud:g.MODEHUD[0]});}
  // leave
  const Cl=g.CRYPT;P.hp=100;P.pos.set(Cl.up.x,0,Cl.up.z);P.vel.set(0,0,0);log.push({probe:g.cryptUse(P,true)});g.cryptUse(P);step(30);log.push({end:g.END&&[g.END.title,g.END.line,g.END.cause],career:JSON.parse(localStorage.getItem('bloodmoor-career'))});
  // a second run: die
  g.startGame();step(200);const P2=g.player;P2.die(g.fighters.find(f=>f!==P2),'slain',null);step(300);log.push({end:g.END&&[g.END.title,g.END.line,g.END.cause],state:g.state,lamps:g.LAMPS.length});
  // back to another mode: is the crypt gone?
  document.querySelector('.mode[data-mode="duel"]').click();await wait(100);g.startGame();step(120);log.push({map:g.curMap,crypt:!!g.CRYPT,lamps:g.LAMPS.length,sh:g.LAMP_SH&&g.LAMP_SH.visible});
  return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
