// a live duel (player scripted as in dump326 'duel'): how close the two fighters' drawn hips and chests come. Q adds query.
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('duel',process.env.MAP||'arena');
const r=await page.evaluate(async([secs])=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  window.__pause=true;for(let i=0;i<200&&!g.RP;i++)await wait(50);for(let i=0;i<120;i++)g.logic(1/60);
  const P=g.player,input=g.input;P.damage=()=>{};const W=(f,n)=>{const e=f.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};
  const hd=[],cd=[];let pos=[];
  for(let i=0;i<secs*60;i++){const B=g.fighters.find(f=>f!==P&&f.alive);input.keys={};input.locked=false;const t=i/60,ph=t%1.3;
    if(ph<.5){input.mx=.5;input.my=.4;input.lmb=false;}else if(ph<.62){input.mx=(Math.floor(t/1.3)%2)?.85:.15;input.my=.15;}else{const u=Math.min(1,(ph-.62)/.34);const s=Math.floor(t/1.3)%2;input.mx=s?.85-.7*u:.15+.7*u;input.my=.15+.6*u;input.lmb=true;}
    if(B){B.hp=Math.max(B.hp,60);const dx=B.pos.x-P.pos.x,dz=B.pos.z-P.pos.z,d=Math.hypot(dx,dz);P.yaw=Math.atan2(dx,dz);input.keys.KeyW=d>1.0;}
    P.stamina=100;P.ctrl.z=.46;g.logic(1/60);g.scene.updateMatrixWorld(true);
    if(B&&!P.ragdoll&&!B.ragdoll){const a=W(P,'Hips'),b=W(B,'Hips'),c=W(P,'Spine2'),e=W(B,'Spine2');hd.push(Math.hypot(a[0]-b[0],a[2]-b[2]));cd.push(Math.hypot(c[0]-e[0],c[2]-e[2]));pos.push(Math.hypot(B.pos.x-P.pos.x,B.pos.z-P.pos.z));}}
  const q=(a,p)=>{const b=[...a].sort((x,y)=>x-y);return b.length?+b[Math.floor((b.length-1)*p)].toFixed(2):-1;};
  return {n:hd.length,hips:[q(hd,.01),q(hd,.1),q(hd,.5)],chest:[q(cd,.01),q(cd,.1),q(cd,.5)],place:[q(pos,.01),q(pos,.1)],chestUnder45:cd.filter(x=>x<.45).length};},[+(process.env.SECS||30)]);
console.log(JSON.stringify(r));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
