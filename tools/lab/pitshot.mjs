import {boot} from './harness.mjs';
const {browser,page,logs,start,fr,tick,shot}=await boot({W:900,HH:600,query:'?nohud'});
await start('duel','pit');await new Promise(r=>setTimeout(r,3000));
await page.evaluate(()=>{const g=window.__game,P=g.player,F=g.fighters,input=g.input,PIT=g.PIT,T=g.THREE;window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  for(const f of F)if(f!==P)f.pos.set(PIT.x+20,0,PIT.z+20);P.pos.set(PIT.x+.8,0,PIT.z+PIT.bw-.35);P.yaw=0;P.vel.set(0,0,0);
  for(let i=0;i<100;i++){input.keys.KeyW=i<12;g.logic(1/60);}input.keys.KeyW=false;
  window.__dbgCam={p:new T.Vector3(PIT.x+2.2,.6,PIT.z+2.4),t:new T.Vector3(PIT.x+.8,-.5,PIT.z+.6)};});
await tick(5);await fr(3);await shot('../out/216_hang.jpg',90);
console.log(await page.evaluate(()=>!!window.__game.player.hang),logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
