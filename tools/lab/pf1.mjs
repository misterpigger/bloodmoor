// physical fighter: stand, walk, get shoved. Prints per phase: hips height, drift, speed, whether down
import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud&pf'+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="yard"]').click();await wait(100);g.startGame();window.__pause=true;
  for(let i=0;i<200&&!g.RP;i++){await wait(50);}   // rapier
  const P=g.player;const log=[];const st=(n,fn)=>{let mn=9,mx=-9,d0=P.pos.clone(),down=0,sp=0;for(let k=0;k<n;k++){fn&&fn(k);P.stamina=100;g.logic(1/60);const S=P.hs;if(S&&S.seg.pel){const y=S.seg.pel.b.translation().y;mn=Math.min(mn,y);mx=Math.max(mx,y);}if(P.ragdoll)down++;sp=Math.hypot(P.vel.x,P.vel.z);}
    return {hips:[+mn.toFixed(2),+mx.toFixed(2)],moved:+P.pos.distanceTo(d0).toFixed(2),speed:+sp.toFixed(2),down,hs:!!P.hs,arms:!!(P.hs&&P.hs.wb),o:P.hs&&P.hs.pfo!=null?+P.hs.pfo.toFixed(2):null};};
  for(const f of g.fighters.slice())if(f!==P&&!f.dummy){}
  log.push(['settle',st(120)]);
  log.push(['stand 5s',st(300)]);
  g.input.keys.KeyW=true;log.push(['walk 3s',st(180)]);g.input.keys.KeyW=false;log.push(['stop',st(90)]);
  g.input.keys.ShiftLeft=true;g.input.keys.KeyW=true;log.push(['run 3s',st(180)]);g.input.keys.KeyW=false;g.input.keys.ShiftLeft=false;log.push(['stop',st(120)]);
  for(const dv of [3,6,10]){const S=P.hs;if(S&&S.seg.che){const T=g.THREE;g.hsHit?g.hsHit(P,'Spine2',new T.Vector3(1,0,0),dv):S.seg.che.b.applyImpulse({x:dv*14,y:0,z:0},true);}log.push(['shove '+dv,st(120)]);if(P.ragdoll){log.push(['recover',st(300)]);}}
  return log;});
for(const l of out)console.log(JSON.stringify(l));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
