// how a slain man falls: kill a standing dummy with a blow from each side and follow the body
import {boot} from './harness.mjs';
const {browser,page,logs,start}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await start('yard','arena');await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async([REPS,MODE])=>{const g=window.__game,T=g.THREE,P=g.player,res=[];
  for(let k=0;k<120;k++)g.logic(1/60);
  const dirs=[['front',0,-1],['back',0,1],['left',1,0],['right',-1,0]],zones=['Head','Spine2','Hips'];
  for(let rep=0;rep<REPS;rep++)for(const [dn,dx,dz] of dirs)for(const zn of zones){
    let D=null;for(let q=0;q<600&&!(D=g.fighters.find(f=>f.dummy&&f.alive&&!f.ragdoll&&!f.downed));q++)g.logic(1/60);if(!D)continue;
    for(let q=0;q<40;q++)g.logic(1/60);
    const fw=new T.Vector3(Math.sin(D.yaw),0,Math.cos(D.yaw)),rt=new T.Vector3(fw.z,0,-fw.x);
    const dir=new T.Vector3().addScaledVector(fw,dz).addScaledVector(rt,dx).normalize();   // front: a blow from the front drives him back
    const pt=new T.Vector3();D.bones[zn].getWorldPosition(pt);const imp=dir.clone().multiplyScalar(3.8);
    const h0=new T.Vector3();D.bones.Hips.getWorldPosition(h0);
    if(MODE==='ko')D.knockdown(2,imp,pt);else{D.die(P,'slain',null);if(D.ragdoll)D.ragdoll.strike(pt,imp,1);}
    const R=D.ragdoll;if(!R){res.push({dn,zn,bad:1});continue;}
    let tv=0,tDrop=-1,knee=180,waistMax=0,lift=0,hy45=-1,vmax=0,nan=0,settle=0,hmin=9;const ang=(a,b,c)=>{const u=a.clone().sub(b),v=c.clone().sub(b);return Math.acos(Math.max(-1,Math.min(1,u.normalize().dot(v.normalize()))))*57.3;};
    let ph=R.P.Hips.clone();
    for(let i=0;i<144;i++){g.logic(1/60);const p=R.P,t=(i+1)/60;if(!p.Hips||!Number.isFinite(p.Hips.x+p.Hips.y)){nan++;break;}
      const gy=g.groundY(p.Hips.x,p.Hips.z,p.Hips.y);if(tDrop<0&&p.Hips.y-gy<.45)tDrop=t;hmin=Math.min(hmin,p.Hips.y-gy);
      if(t<.7)for(const S of ['Left','Right'])if(p[S+'UpLeg']&&p[S+'Leg']&&p[S+'Foot'])knee=Math.min(knee,ang(p[S+'UpLeg'],p[S+'Leg'],p[S+'Foot']));
      const w=180-ang(p.Hips,p.Spine1,p.Neck);waistMax=Math.max(waistMax,w);
      let lo=9;for(const n of R.names)lo=Math.min(lo,p[n].y-g.groundY(p[n].x,p[n].z,p[n].y));lift=Math.max(lift,lo);
      const up=p.Neck.clone().sub(p.Hips).normalize();if(hy45<0&&up.y<.707)hy45=p.Hips.y-gy;
      const v=Math.hypot(p.Hips.x-ph.x,p.Hips.z-ph.z)*60;if(v>vmax){vmax=v;tv=t;}ph.copy(p.Hips);
      if(t>2){for(const n of R.names){const q=R.Q[n];settle=Math.max(settle,p[n].distanceTo(q)*240);}}}
    const p=R.P;res.push({dn,zn,tDrop,knee,waistMax,waistEnd:180-ang(p.Hips,p.Spine1,p.Neck),lift,hy45,vmax,travel:Math.hypot(p.Hips.x-h0.x,p.Hips.z-h0.z),settle,nan,tv,dP:Math.hypot(P.pos.x-h0.x,P.pos.z-h0.z)});
  }
  return res;},[+(process.env.REPS||2),process.env.MODE||'die']);
const f=(a,k)=>{const v=a.map(x=>x[k]).filter(x=>x!=null&&x>=0).sort((x,y)=>x-y);return v.length?`${v[Math.floor(v.length*.5)].toFixed(2)} (${v[0].toFixed(2)}..${v[v.length-1].toFixed(2)})`:'-';};
const keys=['tDrop','knee','hy45','waistMax','waistEnd','lift','vmax','travel','settle'];
console.log('n',out.length,'nan',out.reduce((a,x)=>a+(x.nan||0)+(x.bad||0),0),'never down',out.filter(x=>x.tDrop<0).length);
for(const k of keys)console.log(k.padEnd(9),'all',f(out,k),'| head',f(out.filter(x=>x.zn==='Head'),k),'| front',f(out.filter(x=>x.dn==='front'),k),'| back',f(out.filter(x=>x.dn==='back'),k));
for(const x of out)if(x.travel>2.4||x.vmax>8||x.lift>.3)console.log('OUT',x.dn,x.zn,'travel',x.travel.toFixed(2),'vmax',x.vmax.toFixed(1),'at',x.tv.toFixed(2),'lift',x.lift.toFixed(2),'tDrop',x.tDrop.toFixed(2),'playerDist',x.dP.toFixed(1));
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
