import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async()=>{const g=window.__game,T=g.THREE,res=[];for(let k=0;k<120;k++)g.logic(1/60);
  const dirs=[[0,-1],[0,1],[1,0],[-1,0],[.7,.7],[-.7,-.7]];
  for(let rep=0;rep<2;rep++)for(const [dx,dz] of dirs){let D=null;for(let q=0;q<600&&!(D=g.fighters.find(f=>f.dummy&&f.alive&&!f.ragdoll&&!f.downed&&!f.rec));q++)g.logic(1/60);if(!D)continue;for(let q=0;q<60;q++)g.logic(1/60);
    const fw=new T.Vector3(Math.sin(D.yaw),0,Math.cos(D.yaw)),rt=new T.Vector3(fw.z,0,-fw.x),dir=new T.Vector3().addScaledVector(fw,dz).addScaledVector(rt,dx).normalize();
    D.knockdown(1.6,dir.multiplyScalar(3.2),D.chest.clone());const R=D.ragdoll;let t=0,tw=0,twR=0,up=-1,hv=0,ph=R.P.Hips.clone();
    for(let i=0;i<720;i++){g.logic(1/60);t+=1/60;if(!D.ragdoll){up=t;break;}const p=R.P;
      const sp=p.Neck.clone().sub(p.Hips).normalize(),a=p.LeftArm.clone().sub(p.RightArm),b=p.LeftUpLeg.clone().sub(p.RightUpLeg);a.addScaledVector(sp,-a.dot(sp)).normalize();b.addScaledVector(sp,-b.dot(sp)).normalize();const w=Math.acos(Math.max(-1,Math.min(1,a.dot(b))))*57.3;tw=Math.max(tw,w);if(R.rise)twR=Math.max(twR,w);
      hv=Math.max(hv,p.Hips.distanceTo(ph)*60);ph.copy(p.Hips);}
    res.push({up,tw,twR,hv});}
  return res;});
const f=k=>{const v=out.map(x=>x[k]).sort((a,b)=>a-b);return `${v[Math.floor(v.length/2)].toFixed(1)} (${v[0].toFixed(1)}..${v[v.length-1].toFixed(1)})`;};
console.log('n',out.length,'never up',out.filter(x=>x.up<0).length,'| up after',f('up'),'s | twist max',f('tw'),'| while rising',f('twR'),'| hips speed max',f('hv'));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
