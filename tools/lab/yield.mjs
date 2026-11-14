import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game,log=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);window.__pause=true;const step=n=>{for(let k=0;k<n;k++)g.logic(1/60);};
  g.startGame();step(150);const C=g.CRYPT,P=g.player;
  for(const jump of [true,false]){const f=g.fighters.find(f=>f!==P&&f.alive&&f.ai.mind&&f.ai.mind.mood!=='yield'&&f.sword&&f.sword.def.kind!=='fist');if(!f){log.push('no foe');continue;}
    const M=f.ai.mind,h=C.hole;f.pos.set(h.x+4.3,0,h.z+2.5);P.pos.set(h.x+4.3,0,h.z+4.6);P.hp=100;M.nerve=45;M.champ=0;const r0=Math.random;if(jump)Math.random=()=>.1;else Math.random=()=>.9;
    f.hp=30;f.damage(3,P,'cut');step(3);Math.random=r0;const m1=M.mood,j=M.jump,sw=f.sword&&f.sword.def.id;let t=-1;const bk=[];
    for(let k=0;k<900;k++){step(1);P.hp=100;P.pos.set(h.x+4.3,0,h.z+4.6);P.vel.set(0,0,0);if(!f.alive&&t<0){t=k;break;}if(k%100===0)bk.push(document.getElementById('bark').textContent);}
    log.push({mood:m1,jump:j,sword:sw,diedAt:t,y:+(f.ragdoll&&f.ragdoll.P.Hips?f.ragdoll.P.Hips.y:f.pos.y).toFixed(1),dist:+Math.hypot(f.pos.x-P.pos.x,f.pos.z-P.pos.z).toFixed(1),barks:[...new Set(bk)].join(' | '),kills:g.RUN&&g.RUN.kills});}
  return log;});
for(const l of out)console.log(JSON.stringify(l));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
