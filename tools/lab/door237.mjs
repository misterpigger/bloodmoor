import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<100;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2000));
const out=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,res=[];const step=async n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);if(i%30==0)await 0;}};
  for(const f of g.fighters.slice())if(f!==P&&f.alive)f.damage(999,null,'x');
  for(const d of C.doors.slice(0,6)){const w=d.w;for(const sg of [1,-1]){d.th=0;d.om=0;P.pos.set(w.x+w.dx*sg*1.4,0,w.z+w.dz*sg*1.4);P.yaw=Math.atan2(-w.dx*sg,-w.dz*sg);P.vel.set(0,0,0);g.input.keys.KeyW=true;const p0=P.pos.clone();await step(150);g.input.keys.KeyW=false;res.push({bar:!!d.bar,sg,th:+d.th.toFixed(2),moved:+P.pos.distanceTo(p0).toFixed(2),through:(P.pos.x-w.x)*w.dx*sg+(P.pos.z-w.z)*w.dz*sg<-.3});}}
  return res;}).catch(e=>({err:String(e)}));
console.log(JSON.stringify(out));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
