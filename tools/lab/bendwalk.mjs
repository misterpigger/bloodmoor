// walk the player (with his lantern) through the first bent passage and film it from his camera; also log head top, duck and ceiling
import {boot} from './harness.mjs';import fs from 'fs';
const OUT=process.env.OUT||'bw';fs.mkdirSync(OUT,{recursive:true});
const {browser,page,logs,fr,tick,shot}=await boot({W:+(process.env.W||640),HH:+(process.env.H||360),query:'?nohud&bend'+(process.env.Q||'')});
await page.evaluate(async(seed)=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));
  let a=+seed;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);},process.env.SEED2||'11');
await new Promise(r=>setTimeout(r,3000));
const path=await page.evaluate((bi)=>{const g=window.__game,P=g.player,C=g.CRYPT;if(!P.lamp){P.pos.set(C.lampAt[0]+.7,0,C.lampAt[1]);g.cryptUse(P);}
  const idx=C.cors.map((k,i)=>k.bend&&(i===0||!C.cors[i-1].bend||C.cors[i-1].x1===undefined)?i:-1).filter(i=>i>=0);let i=C.cors.findIndex(k=>k.bend);let n=0;while(n<bi){i=C.cors.findIndex((k,j)=>j>i+2&&k.bend);n++;}
  const A=C.cors[i],X=C.cors[i+1],B=C.cors[i+2];const c=k=>[(k.x0+k.x1)/2,(k.z0+k.z1)/2];
  const p0=A.ax?[A.x0-1.2,A.m]:[A.m,A.z0-1.2],p1=X.ax?[ (X.x0+X.x1)/2, A.m]:[A.m,(X.z0+X.z1)/2];
  const pc=c(X),p2=B.ax?[pc[0],B.m]:[B.m,pc[1]],p3=B.ax?[B.x1+1.2,B.m]:[B.m,B.z1+1.2];
  // the cross passage centre lies on A's line in one coordinate and B's in the other
  const q1=A.ax?[pc[0],A.m]:[A.m,pc[1]],q2=A.ax?[pc[0],B.m]:[B.m,pc[1]];
  if(X.slant){const W2=(u,w)=>A.ax?[u,w]:[w,u];return [p0,W2(X.ua,X.ma),W2(X.ub,X.ma+X.sg*(X.ub-X.ua)),p3];}
  return [p0,q1,q2,p3];},+(process.env.BI||0));
console.log('path',JSON.stringify(path));
let fi=0;const log=[];
for(let s=0;s<3;s++){const [a,b]=[path[s],path[s+1]];const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/.06);
  for(let i=0;i<=n;i+=1){const r=await page.evaluate(([x,z,yaw])=>{const g=window.__game,P=g.player;P.pos.x=x;P.pos.z=z;P.vel.set(Math.sin(yaw)*2,0,Math.cos(yaw)*2);P.yaw=yaw;g.logic(1/60);
      const ht=P._htop!=null?P._htop:0;return [x.toFixed(2),z.toFixed(2),(P.duck||0).toFixed(2),(+ht).toFixed(2),g.cryptCeil(x,z).toFixed(2),(P._lowC||0)];},[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,Math.atan2(b[0]-a[0],b[1]-a[1])]);
    log.push(r.join(' '));if(i%(+(process.env.EV||6))===0){await fr(1,1/60);await shot(`${OUT}/w${String(fi++).padStart(3,'0')}.jpg`,80);}}}
fs.writeFileSync(OUT+'/log.txt',log.join('\n'));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
