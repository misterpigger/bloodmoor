import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start(process.env.MODE||'yard',process.env.MAP||'arena',{pause:true});
const r=await page.evaluate(async(PRE)=>{const g=window.__game,P=g.player;
  for(let k=0;k<420;k++)g.logic(1/60);if(PRE)eval(PRE);for(let k=0;k<60;k++)g.logic(1/60);
  const f=P,B=f.bones,fx=Math.sin(f.yaw),fz=Math.cos(f.yaw),o={};
  for(const n of ['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftShoulder','RightArm','LeftArm','RightHand','LeftHand','LeftUpLeg','LeftLeg','LeftFoot','RightLeg','RightFoot']){const e=B[n].matrixWorld.elements;const dx=e[12]-f.pos.x,dz=e[14]-f.pos.z;o[n]=[+((dx*fx+dz*fz)*100).toFixed(1),+((e[13]-f.pos.y)*100).toFixed(1),+((-dx*fz+dz*fx)*100).toFixed(1)];}
  o.chest=[f.chest.x-f.pos.x,f.chest.y-f.pos.y,f.chest.z-f.pos.z].map(v=>+(v*100).toFixed(1));o.swH=f.sword?[f.sword.H.x-f.pos.x,f.sword.H.y-f.pos.y,f.sword.H.z-f.pos.z].map(v=>+(v*100).toFixed(1)):0;return o;},process.env.PRE||'');
console.log(JSON.stringify(r));console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();process.exit(0);
