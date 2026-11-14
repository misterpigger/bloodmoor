import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'+(process.env.Q||'')});
await page.evaluate(async()=>{const g=window.__game;document.querySelector('.mode[data-mode="career"]').click();await new Promise(r=>setTimeout(r,120));g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);});
await new Promise(r=>setTimeout(r,2500));
const out=await page.evaluate(async()=>{const g=window.__game,P=g.player,C=g.CRYPT,T=g.THREE,res={foes:[]};const step=n=>{for(let i=0;i<n;i++){g.scene.updateMatrixWorld(true);g.logic(1/60);}};
  const F=g.fighters.filter(f=>f!==P);res.n=F.length;res.kinds=F.map(f=>f.undead||'man');
  for(const f of F){const dir=new T.Vector3(Math.random()-.5,0,Math.random()-.5).normalize();f.damage(999,P,'test');}
  const st=F.map(()=>({below:0,above:0,fast:0,nan:0,maxv:0,alive:0}));
  for(let i=0;i<300;i++){step(1);await 0;F.forEach((f,k)=>{const R=f.ragdoll,s=st[k];if(f.alive)s.alive++;if(!R)return;for(const n in R.P){const p=R.P[n],q=R.Q[n];if(!Number.isFinite(p.x+p.y+p.z)){s.nan++;continue;}const gy=g.groundY?g.groundY(p.x,p.z,p.y+.5):0;if(p.y<gy-.12)s.below++;const c=g.cryptCeil(p.x,p.z);if(c&&p.y>c+.05)s.above++;const v=p.distanceTo(q)*240;if(i>150){if(v>2.5)s.fast++;s.maxv=Math.max(s.maxv,+v.toFixed(1));}}});}
  res.foes=st.map((s,k)=>({k:res.kinds[k],...s,rag:!!F[k].ragdoll,hy:F[k].ragdoll?+F[k].ragdoll.P.Hips.y.toFixed(2):null}));
  // the player dies
  const k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];if(k.ax){P.pos.set((k.x0+k.x1)/2,0,k.m);}else{P.pos.set(k.m,0,(k.z0+k.z1)/2);}step(20);
  P.damage(999,null,'test');const cam=[];for(let i=0;i<240;i++){step(1);await 0;if(i%40===0)cam.push({over:!!g.RUN.over,state:g.state,rag:!!P.ragdoll,hy:P.ragdoll?+P.ragdoll.P.Hips.y.toFixed(2):null});}
  res.player=cam;res.end=document.getElementById('end')?document.getElementById('end').innerText.slice(0,200):'';return res;});
console.log(JSON.stringify(out,null,0));console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();process.exit(0);
