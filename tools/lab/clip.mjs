// arms drawn inside other fighters' bodies, in close bot fights (4 bots, Arena, team battle)
import {boot} from './harness.mjs';
const Q=process.env.Q||'';
const {browser,page,logs,start}=await boot({W:640,HH:360,render:false,query:'?nohud'+Q});
await start('team','colosseum',{pause:true});
const r=await page.evaluate(async(SEED)=>{const g=window.__game,P=g.player,T=g.THREE;const st={fr:0,el:0,fa:0,hand:0,deep:0,body:0};
  P.isPlayer=false;for(let k=0;k<120;k++)g.logic(1/60);
  const v=new T.Vector3(),w=new T.Vector3(),m=new T.Vector3(),a=new T.Vector3();
  const ins=(x,O)=>{let worst=0;for(const c of O.caps){if(!c.on||c.zone==='legL'||c.zone==='legR')continue;a.subVectors(c.b,c.a);const L2=a.lengthSq()||1e-9;const u=Math.max(0,Math.min(1,m.subVectors(x,c.a).dot(a)/L2));const d=x.distanceTo(m.copy(c.a).addScaledVector(a,u));worst=Math.max(worst,c.r-.02-d);}return worst;};
  for(let k=0;k<60*45;k++){g.logic(1/60);
    for(const f of g.fighters){if(!f.alive||f.ragdoll)continue;const near=g.fighters.filter(O=>O!==f&&O.alive&&!O.ragdoll&&O.pos.distanceTo(f.pos)<1.2);if(!near.length)continue;st.fr++;
      for(const nm of ['Right','Left']){f.bones[nm+'ForeArm'].getWorldPosition(v);f.bones[nm+'Hand'].getWorldPosition(w);const mid=w.clone().add(v).multiplyScalar(.5);
        let e=0,fa=0,hd=0;for(const O of near){e=Math.max(e,ins(v,O));fa=Math.max(fa,ins(mid,O));hd=Math.max(hd,ins(w,O));}
        if(e>0)st.el++;if(fa>0)st.fa++;if(hd>0&&!(f.offG&&f.offG.grab))st.hand++;if(Math.max(e,fa)>.06)st.deep++;}
      f.bones.Spine2.getWorldPosition(v);for(const O of near){O.bones.Spine2.getWorldPosition(w);if(Math.hypot(v.x-w.x,v.z-w.z)<.36)st.body++;}}
    if(k%600===0)await new Promise(r=>setTimeout(r,0));}
  return st;});
console.log(JSON.stringify(r));
console.log(logs.slice(0,8).join('\n')||'no errors');await browser.close();process.exit(0);
