import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:400,HH:300,query:'?nohud',render:false});
const r=await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
 const C=g.CRYPT,P=g.player,F=g.fighters,input=g.input,K=input.keys;for(const f of F.slice())if(f!==P){f.dispose();F.splice(F.indexOf(f),1);}
 const it=g.testLoot('knife',P.pos.x,P.pos.z);g.pickUp(P,it);
 const out={};
 const k=C.caskets[0];const fx=Math.sin(k.ry),fz=Math.cos(k.ry);
 for(const [dist,pitch] of [[.75,-.6],[.6,-.9],[.9,-.7]]){if(k.held)break;P.pos.set(k.x+fx*dist,0,k.z+fz*dist);P.yaw=Math.atan2(-fx,-fz);P.vel.set(0,0,0);P.pitch=pitch;
  for(let i=0;i<40;i++){K.KeyG=false;input.locked=false;input.mx=.5;input.my=1;g.logic(1/60);}for(let i=0;i<60;i++){K.KeyG=true;input.locked=false;input.mx=.5;input.my=1;g.logic(1/60);if(k.held)break;}out.pitch=+P.pitch.toFixed(2);const G=P.offG;const e=new g.THREE.Vector3();out['try'+dist]=[!!k.held,G&&+G.w.toFixed(2),G&&[+G.pos.x.toFixed(2),+G.pos.y.toFixed(2),+G.pos.z.toFixed(2)],[+(k.x).toFixed(2),+(k.z).toFixed(2),+(k.ang||0).toFixed(2)],P.sword&&P.sword.def.id,!!P.lamp&&P.lamp.inHand,G&&G.grab&&G.grab.k];}
 const log=[];for(let i=0;i<60;i++){K.KeyG=true;input.locked=false;input.mx=.5;input.my=.15;g.logic(1/60);if(i%10==0)log.push([+(k.ang||0).toFixed(2),+P.ctrl.y.toFixed(2),+P.ctrlT.y.toFixed(2),!!P.lidLift]);}
 K.KeyG=false;for(let i=0;i<30;i++)g.logic(1/60);out.log=log;out.after=+(k.ang||0).toFixed(2);out.opened=k.opened;
 // loose thing: grab a dyn
 return out;});
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
