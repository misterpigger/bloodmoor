// walk up a gallery's dais and back down: the height underfoot along the way
import {boot} from './harness.mjs';
const {page,browser,logs}=await boot({render:false,query:'?nohud&cdepth=2&gal&dais'});
const r=await page.evaluate(async()=>{const g=window.__game,out=[];document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;window.__inManual=true;for(let k=0;k<200;k++)g.logic(1/60);
  window.__keepBad=true;let C=g.CRYPT,c=C.plan.cells.find(c=>c.dais);for(let sd=1;sd<40&&!c;sd++){C=g.cryptBuild(2,sd*17);c=C.plan.cells.find(c=>c.dais);if(c)out.push('seed '+sd*17);}const P=g.player;if(!c)return 'no dais';const d=c.dais;for(const f of g.fighters.slice())if(f!==P){f.pos.x+=200;f.hp=1e6;}
  const along=u=>[c.cx+d.dx*((d.dx?c.hx:0)-u)+(d.dz?.6:0),c.cz+d.dz*((d.dz?c.hz:0)-u)+(d.dx?.6:0)];const [x0,z0]=along(5.5);P.pos.set(x0,0,z0);P.yaw=Math.atan2(d.dx,d.dz);P.vel.set(0,0,0);
  g.input.keys.KeyW=true;for(let i=0;i<260;i++){g.logic(1/60);if(i%20===0)out.push((i/60).toFixed(1)+'s u='+(((d.dx?P.pos.x-c.cx:P.pos.z-c.cz)*(d.dx||d.dz))-(d.dx?c.hx:c.hz)).toFixed(2)+' y='+P.pos.y.toFixed(2)+(P.ragdoll?' DOWN':''));}
  g.input.keys.KeyW=false;g.input.keys.KeyS=true;for(let i=0;i<200;i++){g.logic(1/60);if(i%40===0)out.push('back u='+(((d.dx?P.pos.x-c.cx:P.pos.z-c.cz)*(d.dx||d.dz))-(d.dx?c.hx:c.hz)).toFixed(2)+' y='+P.pos.y.toFixed(2));}
  out.push('hp '+P.hp.toFixed(0));return out.join('\n');});
console.log(r);console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
