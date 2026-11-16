// the forward run measured: per frame at a steady sprint, hip height over the ground, each knee's angle, each ankle's place along the way he goes against the hips, ankle height; prints median/min/max over 2 s. Q='&nofrun' for the clip; FRP='{json}' overrides FRUN_P
import {boot} from './harness.mjs';
const fq=process.env.FRP?'&frunp='+encodeURIComponent(process.env.FRP):'';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.PF?'&pf':'')+fq+(process.env.Q||'')});
const out=await page.evaluate(async()=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  g.startGame('duel','colosseum');window.__pause=true;for(let i=0;i<200&&!g.RP;i++){await wait(50);}for(let i=0;i<120;i++)g.logic(1/60);
  const P=g.player,K=g.input.keys;const park=()=>{for(const D of g.fighters)if(D!==P){D.pos.set(22,0,22);D.vel.set(0,0,0);D.damage=()=>{};}};
  g.setHS(false);for(let q=0;q<10;q++){park();P.pos.set(-21,0,-14);P.vel.set(0,0,0);P.yaw=Math.PI/2;g.logic(1/60);}g.setHS(true);for(let q=0;q<30;q++){park();g.logic(1/60);}
  const W=n=>{const e=P.bones[n].matrixWorld.elements;return [e[12],e[13],e[14]];};const ang=(a,b,c)=>{const u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],v=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];return Math.acos((u[0]*v[0]+u[1]*v[1]+u[2]*v[2])/Math.hypot(...u)/Math.hypot(...v))*57.3;};
  const S={hip:[],kL:[],kR:[],xL:[],xR:[],yL:[],yR:[],sp:[],lean:[]};let pp=P.pos.clone();
  for(let i=0;i<220;i++){park();P.stamina=100;K.KeyW=true;K.ShiftLeft=true;g.logic(1/60);g.scene.updateMatrixWorld(true);if(i<100)continue;
    const H=W('Hips'),fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);S.hip.push(H[1]);S.sp.push(Math.hypot(P.pos.x-pp.x,P.pos.z-pp.z)*60);pp.copy(P.pos);
    const N=W('Neck');S.lean.push(Math.atan2((N[0]-H[0])*fx+(N[2]-H[2])*fz,N[1]-H[1])*57.3);
    for(const s of ['Left','Right']){const a=W(s+'UpLeg'),k=W(s+'Leg'),f=W(s+'Foot');S['k'+s[0]].push(ang(a,k,f));S['x'+s[0]].push((f[0]-H[0])*fx+(f[2]-H[2])*fz);S['y'+s[0]].push(f[1]);}}
  const st=a=>{const b=[...a].sort((x,y)=>x-y);return [b[0],b[Math.floor(b.length/2)],b[b.length-1]].map(v=>+v.toFixed(2)).join('/');};
  const o={};for(const k in S)o[k]=st(S[k]);return o;});
console.log(JSON.stringify(out));console.log(logs.slice(0,3).join('\n')||'no errors');await browser.close();process.exit(0);
