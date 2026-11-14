import {boot} from './harness.mjs';
const {browser,page,logs}=await boot({W:320,HH:200,render:false,query:'?nohud'});
const out=await page.evaluate(async()=>{const g=window.__game;const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.querySelector('.mode[data-mode="career"]').click();await wait(100);g.startGame();window.__pause=true;for(let k=0;k<200;k++)g.logic(1/60);
  for(const f of g.fighters.slice())if(f!==g.player){f.dispose();g.fighters.splice(g.fighters.indexOf(f),1);}
  const C=g.CRYPT,P=g.player,T=g.THREE;const k=C.cors.slice().sort((a,b)=>b.L-a.L)[0];
  let wd=0;for(let d=0;d<2;d+=.05){const q=k.ax?new T.Vector3((k.x0+k.x1)/2,1,k.m+d):new T.Vector3(k.m-d,1,(k.z0+k.z1)/2);const q0=q.clone();g.collide(q,.05,true,0);if(q.distanceTo(q0)>1e-4){wd=d;break;}}
  g.spawnWeaponLoot(g.WEAPONS[window.__W||'longsword'],P.pos.x+.4,P.pos.z);g.pickUp(P,g.loot[g.loot.length-1]);const off=wd-.55;
  if(k.ax){P.pos.set((k.x0+k.x1)/2,0,k.m+off);}else{P.pos.set(k.m-off,0,(k.z0+k.z1)/2);}P.vel.set(0,0,0);for(let i=0;i<30;i++){P.yaw=k.ax?0:-Math.PI/2;g.logic(1/60);}
  window.__wst=[];g.input.locked=true;for(let q=0;q<600;q++){const ph0=q/60*Math.PI*.35;g.aimMove(Math.cos(ph0)*7,Math.cos(ph0*1.7)*5);P.yaw=k.ax?0:-Math.PI/2;P.stamina=100;g.logic(1/60);}
  const W=window.__wst;const names=['integrate','clip1','constrain','wrist','selfclear+spin','clip2'];const acc=names.map(()=>0);let prevEnd=null,prevV=null;let big=0;const tot=[];
  // for each step: velocity of the end position; jerk = change of that velocity; attribute jerk to stages by each stage's displacement deviation from its average
  const stg=W.map(D=>D.map(v=>v.clone()));const disp=[];for(let i=1;i<stg.length;i++){const D=stg[i],pe=stg[i-1][stg[i-1].length-1];const ds=[D[0].clone().sub(pe)];for(let j=1;j<D.length;j++)ds.push(D[j].clone().sub(D[j-1]));disp.push(ds);}
  const res={};for(let j=0;j<6;j++){let s=0,n=0;for(let i=1;i<disp.length;i++){if(!disp[i][j]||!disp[i-1][j])continue;s+=disp[i][j].clone().sub(disp[i-1][j]).length();n++;}res[names[j]]=(s/n*1000).toFixed(2);}
  let jj=0;for(let i=1;i<disp.length;i++){const a=disp[i].reduce((p,c)=>p.add(c),new T.Vector3()),b=disp[i-1].reduce((p,c)=>p.add(c),new T.Vector3());jj+=a.sub(b).length();}res.total=(jj/disp.length*1000).toFixed(2);res.steps=W.length;return res;});
console.log(JSON.stringify(out));console.log(logs.slice(0,4).join('\n')||'no errors');await browser.close();process.exit(0);
